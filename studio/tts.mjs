// npm run tts <film> -- [--force]
//
// Narration from a script, synthesized with Google Cloud Text-to-Speech, on the film's timeline.
// Reads   <film>/audio/script.json
// Writes  <film>/audio/vo/<id>-<hash>.wav   one cached clip per line (the API is only called when a line changes)
//         <film>/audio/voice.wav            every line placed on the timeline, mono 48 kHz
//         <film>/audio/timing.json          line starts/ends, mark times and subtitle times, all absolute
//
// Key: GOOGLE_TTS_API_KEY in .env (never in the script or the film).
//
// script.json
//   {
//     "voice": { "languageCode": "en-US", "name": "en-US-Neural2-D", "speakingRate": 0.95, "pitch": -1,
//                "effectsProfileId": ["large-home-entertainment-class-device"] },
//     "lead": 0.8,             seconds of picture before the first line
//     "gap": 0.6,              default silence after a line (per line: "gapAfter")
//     "bpm": 96, "snap": 1,    optional: start every line on the next beat (snap = beats per step)
//     "lines": [
//       { "id": "intro", "text": "Meet {name}Orbit. {fast}The fastest way to plan a week.",
//         "subs": [{ "text": "Meet Orbit.", "keys": { "Orbit": "name" } }, { "text": "The fastest way ...", "at": "fast" }] }
//     ]
//   }
// {name} in "text" becomes an SSML mark: its time lands in timing.json as lines[i].marks.name, so the
// picture can hit the exact word. "ssml" may be given instead of "text" for full control.
// A subtitle's "at" is a mark name or seconds into the line; it holds until the next subtitle or the line end.
// A subtitle's "keys" ({ "word": "mark" }) gives the time each word should light up, for word-synced captions.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { args, findFilm, fail, isMain, ROOT } from './common.mjs';
import { SR, writeWav } from './wav.mjs';

const API = 'https://texttospeech.googleapis.com/v1beta1/text:synthesize';

export function envKey(name) {
  if (process.env[name]) return process.env[name];
  const env = join(ROOT, '.env');
  if (!existsSync(env)) return null;
  const line = readFileSync(env, 'utf8').split('\n').find((l) => l.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '') || null : null;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// "Meet {name}Orbit" -> <speak>Meet <mark name="name"/>Orbit</speak>
export const toSsml = (text) => `<speak>${esc(text).replace(/\{([\w-]+)\}/g, '<mark name="$1"/>')}</speak>`;

// 16-bit PCM WAV (what LINEAR16 returns) -> Float32Array at its own rate.
function readWav(buf) {
  let o = 12, rate = SR, channels = 1, data = null;
  while (o + 8 <= buf.length) {
    const id = buf.toString('ascii', o, o + 4), size = buf.readUInt32LE(o + 4);
    if (id === 'fmt ') { channels = buf.readUInt16LE(o + 10); rate = buf.readUInt32LE(o + 12); }
    if (id === 'data') { data = buf.subarray(o + 8, o + 8 + Math.min(size, buf.length - o - 8)); break; }
    o += 8 + size + (size & 1);
  }
  if (!data) throw new Error('no data chunk in TTS audio');
  const n = Math.floor(data.length / 2 / channels), out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = data.readInt16LE(i * 2 * channels) / 32768;
  return { pcm: out, rate };
}

async function synth(key, voice, ssml) {
  const { languageCode = 'en-US', name, speakingRate = 1, pitch = 0, effectsProfileId, volumeGainDb = 0 } = voice;
  const body = {
    input: { ssml },
    voice: { languageCode, name },
    audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: SR, speakingRate, pitch, volumeGainDb,
      ...(effectsProfileId ? { effectsProfileId } : {}) },
    enableTimePointing: ['SSML_MARK'],
  };
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${API}?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.audioContent) return json;
    const msg = json.error?.message || `HTTP ${res.status}`;
    if (attempt >= 3 || (res.status < 500 && res.status !== 429)) throw new Error(`Google TTS: ${msg}`);
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
}

export async function tts(dir, { force = false } = {}) {
  const scriptFile = join(dir, 'audio', 'script.json');
  if (!existsSync(scriptFile)) fail(`No narration script at ${scriptFile} (see the header of studio/tts.mjs).`);
  const script = JSON.parse(readFileSync(scriptFile, 'utf8'));
  const voice = script.voice || {};
  const vo = join(dir, 'audio', 'vo');
  mkdirSync(vo, { recursive: true });
  let key = null;

  // 1. one clip per line, cached by the exact request
  const clips = [];
  for (const line of script.lines) {
    const ssml = line.ssml || toSsml(line.text);
    const hash = createHash('sha1').update(JSON.stringify({ voice, ssml })).digest('hex').slice(0, 10);
    const wav = join(vo, `${line.id}-${hash}.wav`), meta = wav.replace(/\.wav$/, '.json');
    if (force || !existsSync(wav) || !existsSync(meta)) {
      key ||= envKey('GOOGLE_TTS_API_KEY');
      if (!key) fail('GOOGLE_TTS_API_KEY is not set. Add it to .env (see .env.example).');
      const res = await synth(key, voice, ssml);
      writeFileSync(wav, Buffer.from(res.audioContent, 'base64'));
      writeFileSync(meta, JSON.stringify({ ssml, timepoints: res.timepoints || [] }, null, 1));
      console.log(`  ✓ ${line.id}  (synthesized)`);
    } else console.log(`  · ${line.id}  (cached)`);
    const { pcm, rate } = readWav(readFileSync(wav));
    if (rate !== SR) fail(`${wav}: expected ${SR} Hz, got ${rate}`);
    const marks = Object.fromEntries(JSON.parse(readFileSync(meta, 'utf8')).timepoints.map((p) => [p.markName, p.timeSeconds]));
    clips.push({ line, pcm, dur: pcm.length / SR, marks });
  }

  // 2. place the lines on the timeline
  const spb = script.bpm ? (60 / script.bpm) * (script.snap || 1) : 0;
  const r3 = (x) => Math.round(x * 1000) / 1000;
  let cursor = script.lead ?? 0.5;
  const lines = clips.map(({ line, dur, marks }, i) => {
    let start = line.at ?? cursor;
    if (spb && line.at == null) start = Math.ceil((start - 1e-6) / spb) * spb;
    const end = start + dur;
    cursor = end + (line.gapAfter ?? script.gap ?? 0.6);
    const abs = Object.fromEntries(Object.entries(marks).map(([k, v]) => [k, r3(start + v)]));
    const subs = (line.subs || []).map((s, j, all) => {
      const at = (x) => (typeof x === 'number' ? start + x : x in marks ? start + marks[x] : null);
      const t0 = at(s.at ?? 0);
      if (t0 == null) fail(`line "${line.id}": subtitle mark "${s.at}" is not in the text`);
      const next = all[j + 1] ? at(all[j + 1].at ?? 0) : end + (s.hold ?? 0.25);
      // keys: { "scope": "scope-mark" } lights a word of the subtitle when that mark is spoken
      const keys = Object.entries(s.keys || {}).map(([word, m]) => {
        const kt = at(m);
        if (kt == null) fail(`line "${line.id}": key "${word}" uses unknown mark "${m}"`);
        return { text: word, t: r3(kt) };
      });
      return { text: s.text, from: r3(t0), to: r3(next), keys };
    });
    return { id: line.id, index: i, start: r3(start), end: r3(end), dur: r3(dur), marks: abs, subs };
  });

  // 3. one voice track
  const total = lines.at(-1).end + (script.tail ?? 0);
  const out = new Float32Array(Math.ceil(total * SR));
  clips.forEach(({ pcm }, i) => out.set(pcm.subarray(0, out.length - Math.round(lines[i].start * SR)), Math.round(lines[i].start * SR)));
  writeWav(join(dir, 'audio', 'voice.wav'), [out]);
  const timing = { voice: voice.name, bpm: script.bpm ?? null, dur: r3(total), lines };
  writeFileSync(join(dir, 'audio', 'timing.json'), JSON.stringify(timing, null, 1));
  console.log(`  voice: ${lines.length} lines, ${total.toFixed(2)} s → audio/voice.wav + audio/timing.json`);
  return timing;
}

if (isMain(import.meta.url)) {
  const a = args();
  await tts(findFilm(a._[0]), { force: !!a.force });
}

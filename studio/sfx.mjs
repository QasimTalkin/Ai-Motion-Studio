// SFX synthesized from cues on the film timeline.
//
//   node studio/sfx.mjs cues.json out/sfx.wav     cues: [{ "t": 0.5, "type": "click", "gain": 1 }, ...]
//
// Voices: click pop thump whoosh tick riser impact type chime glitch swipe
// `riser` ENDS at t (it swells into the moment); every other voice starts at t.
import { readFileSync } from 'node:fs';
import { SR, writeWav, noiseGen, highpass, lowpass } from './wav.mjs';
import { isMain } from './common.mjs';

const TAU = 2 * Math.PI;

// [length in seconds, (t, noise, i) => sample]. i = cue index, used to vary pitch deterministically.
export const VOICES = {
  click: [0.05, (t) => Math.sin(TAU * 1800 * t) * Math.exp(-t * 90) * 0.5],
  pop: [0.15, (t) => Math.sin(TAU * (600 + 900 * t) * t) * Math.exp(-t * 30) * 0.4],
  thump: [0.5, (t) => Math.sin(TAU * (90 - 60 * t) * t) * Math.exp(-t * 9) * 0.9],
  whoosh: [0.35, (t, nz) => nz.bp(nz()) * Math.sin(Math.PI * Math.min(1, t / 0.35)) * 0.5],
  tick: [0.025, (t, _, i) => Math.sin(TAU * (2600 + (i % 5) * 180) * t) * Math.exp(-t * 260) * 0.35],
  riser: [1.2, (t, nz) => (nz.hp(nz()) * 0.35 + Math.sin(TAU * (200 + 500 * t * t) * t) * 0.15) * Math.pow(t / 1.2, 2.2)],
  impact: [1.2, (t, nz) => Math.sin(TAU * (70 - 35 * Math.min(t, 1)) * t) * Math.exp(-t * 3.5) * 0.9
    + nz.lp(nz()) * Math.exp(-t * 14) * 0.6],
  type: [0.04, (t, nz, i) => (Math.sin(TAU * (1100 + (i * 137) % 600) * t) * 0.5 + nz() * 0.5) * Math.exp(-t * 160) * 0.35],
  chime: [1.0, (t) => (Math.sin(TAU * 1318.5 * t) * Math.exp(-t * 5) + (t > 0.09 ? Math.sin(TAU * 1975.5 * (t - 0.09)) * Math.exp(-(t - 0.09) * 5) : 0)) * 0.22],
  glitch: [0.18, (t, nz) => (Math.floor(t * 90) % 2 ? Math.round(nz() * 3) / 3 : 0) * 0.3],
  swipe: [0.22, (t, nz) => nz.hp(nz()) * Math.sin(Math.PI * t / 0.22) * 0.35],
};

export function synthSfx(cues, dur) {
  const end = Math.max(dur ?? 0, ...cues.map((c) => c.t + 2));
  const buf = new Float32Array(Math.ceil(end * SR));
  cues.forEach((c, i) => {
    const voice = VOICES[c.type];
    if (!voice) { console.warn(`  unknown sfx "${c.type}" at ${c.t}s (voices: ${Object.keys(VOICES).join(' ')})`); return; }
    const [len, fn] = voice, g = c.gain ?? 1;
    const nz = noiseGen(1000 + i * 7);
    nz.hp = highpass(2500); nz.lp = lowpass(400);
    const bpLo = lowpass(3000), bpHi = highpass(400); nz.bp = (x) => bpHi(bpLo(x));
    const start = Math.floor((c.type === 'riser' ? c.t - len : c.t) * SR);
    for (let j = 0; j < len * SR; j++) {
      const k = start + j;
      const v = fn(j / SR, nz, i) * g;
      if (k >= 0 && k < buf.length) buf[k] += v;
    }
  });
  return dur ? buf.subarray(0, Math.ceil(dur * SR)) : buf;
}

if (isMain(import.meta.url)) {
  const cues = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  writeWav(process.argv[3] || 'sfx.wav', [synthSfx(cues)]);
  console.log(`wrote ${process.argv[3] || 'sfx.wav'} (${cues.length} cues)`);
}

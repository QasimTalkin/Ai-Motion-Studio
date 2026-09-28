// Original score, synthesized in code on the film's beat grid. Deterministic: same input, same WAV.
//
//   node studio/music.mjs --bpm 120 --dur 15 --style pulse --key A out/music.wav
//
// Styles
//   pulse   - four-on-the-floor kick, claps on 2 and 4, offbeat hats, plucked bass, piano stabs, arp build
//   piano   - felt piano arpeggios over a soft kick; for stories, brand films, emotional beats
//   minimal - sub kick, clicks and a single plucked motif; for UI morphs and product films
//
// Music options (the film's `music` field): { style, key, seed, intro, breaks, end, gain }
//   intro  - bars before the drums enter (default 0: the hook needs the kick on beat 0)
//   breaks - bar indices where the drums drop out (use before a big reveal)
//   end    - time (s) of the final hit; after it only the chord rings out. Omit for loops.
import { SR, writeWav, noiseGen, lowpass, highpass, reverb, midiHz } from './wav.mjs';
import { args, isMain } from './common.mjs';

const KEYS = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
// i - VI - III - VII in natural minor: the progression under half the internet, for a reason.
const PROGRESSION = [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]];

export function synthScore({ bpm = 120, dur = 15, style = 'pulse', key = 'A', seed = 1, beatOffset = 0,
  intro = 0, breaks = [], end, gain = 1 } = {}) {
  const n = Math.ceil((dur + (end != null ? 0 : 0.01)) * SR);
  const drums = new Float32Array(n), music = new Float32Array(n), bass = new Float32Array(n);
  const spb = 60 / bpm, bar = spb * 4;
  const root = 45 + ((KEYS[key] ?? 9) - 9);              // A2 by default
  const stop = end ?? Infinity;
  const noise = noiseGen(seed * 7919 + 1);
  const drumsOn = (b) => b >= intro && !breaks.includes(b);

  const add = (buf, t0, len, fn, g = 1) => {
    const s = Math.floor(t0 * SR);
    for (let i = 0; i < len * SR; i++) { const j = s + i; if (j >= 0 && j < n) buf[j] += fn(i / SR, j) * g; }
  };

  // ── voices ──
  const kick = (t0, g = 1) => add(drums, t0, 0.45, (t) =>
    (Math.sin(2 * Math.PI * (48 * t + (110 / 18) * (1 - Math.exp(-18 * t)))) * Math.exp(-t * 7.5)
      + Math.exp(-t * 400) * 0.4) * 0.95, g);
  const clap = (t0, g = 1) => { const hp = highpass(900); add(drums, t0, 0.22, (t) => {
    const env = [0, 0.011, 0.022].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 180) : 0), 0) + Math.exp(-t * 22) * 0.5;
    return hp(noise()) * env * 0.45; }, g); };
  const hat = (t0, g = 1, open = false) => { const hp = highpass(7000); add(drums, t0, open ? 0.25 : 0.06, (t) =>
    hp(noise()) * Math.exp(-t * (open ? 14 : 70)) * 0.28, g); };
  const piano = (buf, t0, midi, len = 1.6, g = 1) => { const f = midiHz(midi); add(buf, t0, len, (t) => {
    let v = 0;
    for (let h = 1; h <= 6; h++) v += Math.sin(2 * Math.PI * f * h * (1 + 0.0004 * h * h) * t) * Math.exp(-t * (1.1 + h * 0.9)) / Math.pow(h, 1.4);
    return v * Math.min(1, t * 300) * 0.22; }, g); };
  const pluckBass = (t0, midi, len, g = 1) => { const f = midiHz(midi), lp = lowpass(900); add(bass, t0, len, (t) => {
    const saw = 2 * ((f * t) % 1) - 1;
    return (lp(saw) * 0.5 + Math.sin(2 * Math.PI * f * t)) * Math.exp(-t * 5) * Math.min(1, t * 400) * 0.35; }, g); };
  const sub = (t0, midi, len, g = 1) => { const f = midiHz(midi); add(bass, t0, len, (t) =>
    Math.sin(2 * Math.PI * f * t) * Math.min(1, t * 60) * Math.min(1, (len - t) * 20) * 0.35, g); };
  const click = (t0, g = 1) => add(drums, t0, 0.02, (t) => Math.sin(2 * Math.PI * 3200 * t) * Math.exp(-t * 400) * 0.3, g);

  const bars = Math.ceil((Math.min(dur, stop) - beatOffset) / bar);
  for (let b = 0; b < bars; b++) {
    const t0 = beatOffset + b * bar;
    const chord = PROGRESSION[b % 4].map((x) => root + 12 + x);
    const late = b >= bars / 2;                          // second half builds
    for (let q = 0; q < 16; q++) {                       // 16th-note grid
      const t = t0 + q * spb / 4;
      if (t >= stop || t >= dur) break;
      if (style === 'pulse') {
        if (drumsOn(b)) {
          if (q % 4 === 0) kick(t);
          if (q === 4 || q === 12) clap(t);
          if (q % 4 === 2) hat(t, 1, q === 14 && b % 2 === 1); else if (late) hat(t, 0.35);
        }
        if (q % 2 === 0 && q % 8 !== 6) pluckBass(t, chord[0] - 12, spb / 2 * 0.95, q % 4 === 0 ? 1 : 0.7);
        if (q === 0 || q === 6 || (q === 10 && b % 2)) for (const m of chord) piano(music, t, m + 12, 1.2, q === 0 ? 1 : 0.6);
        if (late && q % 2 === 0) piano(music, t, chord[(q / 2) % 3] + 24 + (q >= 8 ? 12 : 0), 0.35, 0.45);
      } else if (style === 'piano') {
        if (drumsOn(b) && q === 0) kick(t, 0.6);
        if (drumsOn(b) && late && q === 8) kick(t, 0.4);
        if (q === 0) { sub(t, chord[0] - 12, bar * 0.98); piano(music, t, chord[0] - 12, 3, 0.9); }
        if (q % 2 === 0) { const arp = [0, 1, 2, 1, 2, 3, 2, 1]; const m = chord[arp[q / 2] % 3] + (arp[q / 2] === 3 ? 12 : 0);
          piano(music, t, m + 12, 1.4, 0.55 + (q === 0 ? 0.3 : 0)); }
        if (late && q % 4 === 3) piano(music, t, chord[2] + 24, 0.8, 0.25);
      } else {                                           // minimal
        if (drumsOn(b) && (q === 0 || q === 10)) kick(t, 0.8);
        if (drumsOn(b) && q % 4 === 2) click(t, late ? 1 : 0.6);
        if (q === 0) sub(t, chord[0] - 12, bar * 0.95);
        if ([0, 3, 6, 10].includes(q)) piano(music, t, chord[[0, 1, 2, 1][[0, 3, 6, 10].indexOf(q)]] + 12, 0.7, 0.5);
      }
    }
  }

  if (end != null && end < dur) {                        // final hit: kick + full chord ringing out
    const chord = PROGRESSION[Math.floor((end - beatOffset) / bar) % 4].map((x) => root + 12 + x);
    kick(end, 1.1);
    sub(end, chord[0] - 12, Math.min(3, dur - end + 0.5));
    for (const m of [...chord, chord[0] + 12]) piano(music, end, m + 12, 4, 1);
  }

  // Sidechain: duck bass and music under every kick so the low end stays clean.
  const kicks = [];
  for (let b = 0; b < bars; b++) for (let q = 0; q < 4; q++) {
    const t = beatOffset + b * bar + q * spb;
    if (drumsOn(b) && t < stop && (style === 'pulse' || q === 0)) kicks.push(t);
  }
  let k = 0;
  const wet = reverb(music, { size: 1.1 });
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    while (k + 1 < kicks.length && kicks[k + 1] <= t) k++;
    const since = kicks.length && t >= kicks[k] ? t - kicks[k] : 10;
    const duck = 1 - 0.55 * Math.exp(-since * 9);
    const v = drums[i] + (bass[i] + music[i] * 0.9 + wet[i] * 0.35) * duck;
    out[i] = Math.tanh(v * 1.2 * gain) * 0.85;
  }
  return out;
}

// Beat grid for a synthesized score: same shape as studio/beats.py output.
export function beatGrid({ bpm = 120, dur = 15, beatOffset = 0, cues = [] }) {
  const beats = [];
  for (let t = beatOffset; t < dur + 1e-6; t += 60 / bpm) beats.push(Math.round(t * 1000) / 1000);
  return { bpm, beats, downbeats: beats.filter((_, i) => i % 4 === 0), hits: cues.map((c) => c.t) };
}

if (isMain(import.meta.url)) {
  const a = args();
  const buf = synthScore({ bpm: a.bpm, dur: a.dur, style: a.style, key: a.key, seed: a.seed, end: a.end });
  writeWav(a._[0] || 'music.wav', [buf]);
  console.log(`wrote ${a._[0] || 'music.wav'}`);
}

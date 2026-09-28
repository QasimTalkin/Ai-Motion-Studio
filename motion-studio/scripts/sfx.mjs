// node scripts/sfx.mjs cues.json out/sfx.wav     cues: [{"t":0.5,"type":"click"}, ...]
// render.mjs calls synth() for you with the film's window.CUES.
import { readFileSync, writeFileSync } from 'node:fs';

const SR = 48000;
const TAU = 2 * Math.PI;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

export function synth(cues, dur) {
  const buf = new Float32Array(Math.ceil((dur ?? Math.max(...cues.map((c) => c.t)) + 2) * SR));
  let s = 42; const noise = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2147483648 - 1;
  const VOICES = {
    click:  [0.05, (t) => Math.sin(TAU * 1800 * t) * Math.exp(-t * 90) * 0.5],
    pop:    [0.15, (t) => Math.sin(TAU * (600 + 900 * t) * t) * Math.exp(-t * 30) * 0.4],
    thump:  [0.50, (t) => Math.sin(TAU * (90 - 60 * t) * t) * Math.exp(-t * 9) * 0.9],
    whoosh: [0.35, (t) => noise() * Math.sin(Math.PI * Math.min(1, t / 0.35)) * 0.25],
    tick:   [0.03, (t) => Math.sin(TAU * 2600 * t) * Math.exp(-t * 240) * 0.3],
    chime:  [1.00, (t) => Math.sin(TAU * 1318.5 * t) * Math.exp(-t * 5) * 0.25],
    kick:   [0.40, (t) => Math.sin(TAU * (48 * t + 6 * (1 - Math.exp(-18 * t)))) * Math.exp(-t * 8) * 0.8],
    snare:  [0.20, (t) => (noise() * 0.6 + Math.sin(TAU * 190 * t) * 0.4) * Math.exp(-t * 22) * 0.35],
    hat:    [0.05, (t) => noise() * Math.exp(-t * 80) * 0.12],
    note:   [1.20, (t, c) => {                         // plucked, piano-ish: a few decaying harmonics
      let v = 0; for (let h = 1; h <= 5; h++) v += Math.sin(TAU * hz(c.midi ?? 57) * h * t) * Math.exp(-t * (1.5 + h)) / h ** 1.4;
      return v * Math.min(1, t * 300) * 0.16; }],
  };
  for (const c of cues) {
    const voice = VOICES[c.type];
    if (!voice) { console.warn(`unknown sound "${c.type}" (use: ${Object.keys(VOICES).join(' ')})`); continue; }
    const [len, fn] = voice, start = Math.floor(c.t * SR), gain = c.gain ?? 1;
    for (let i = 0; i < len * SR && start + i < buf.length; i++) if (start + i >= 0) buf[start + i] += fn(i / SR, c) * gain;
  }
  return buf;
}

// 16-bit mono WAV
export function wav(buf) {
  const n = buf.length, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[i])) * 32767), 44 + i * 2);
  return b;
}

if (process.argv[1]?.endsWith('sfx.mjs')) {
  writeFileSync(process.argv[3], wav(synth(JSON.parse(readFileSync(process.argv[2], 'utf8')))));
}

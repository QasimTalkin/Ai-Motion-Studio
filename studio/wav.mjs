// Minimal WAV writer + deterministic DSP helpers shared by music.mjs and sfx.mjs.
import { writeFileSync } from 'node:fs';

export const SR = 48000;

// 16-bit PCM WAV. channels: Float32Array[] (1 = mono, 2 = stereo), all the same length.
export function writeWav(file, channels, sr = SR) {
  const nc = channels.length, n = channels[0].length, b = Buffer.alloc(44 + n * nc * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * nc * 2, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(nc, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * nc * 2, 28); b.writeUInt16LE(nc * 2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(n * nc * 2, 40);
  for (let i = 0, o = 44; i < n; i++)
    for (let c = 0; c < nc; c++, o += 2) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, channels[c][i])) * 32767), o);
  writeFileSync(file, b);
}

// Seeded white noise in -1..1 (LCG). One generator per voice keeps renders identical every run.
export function noiseGen(seed = 42) {
  let s = seed >>> 0 || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2147483648 - 1;
}

// One-pole filters as closures: lp(x) / hp(x) per sample. cutoff in Hz.
export function lowpass(cutoff, sr = SR) {
  const a = 1 - Math.exp((-2 * Math.PI * cutoff) / sr); let y = 0;
  return (x) => (y += a * (x - y));
}
export function highpass(cutoff, sr = SR) {
  const lp = lowpass(cutoff, sr);
  return (x) => x - lp(x);
}

// Small Schroeder reverb (4 combs + 2 allpasses). Returns a new buffer with wet signal only.
export function reverb(buf, { size = 1, damp = 0.35, sr = SR } = {}) {
  const out = new Float32Array(buf.length);
  const combs = [1557, 1617, 1491, 1422].map((d) => Math.round(d * size * sr / 44100));
  for (const d of combs) {
    const line = new Float32Array(d); let idx = 0, store = 0;
    for (let i = 0; i < buf.length; i++) {
      const y = line[idx];
      store = y * (1 - damp) + store * damp;
      line[idx] = buf[i] + store * 0.8;
      idx = (idx + 1) % d;
      out[i] += y * 0.25;
    }
  }
  for (const d of [556, 441].map((x) => Math.round(x * sr / 44100))) {
    const line = new Float32Array(d); let idx = 0;
    for (let i = 0; i < out.length; i++) {
      const bo = line[idx], x = out[i];
      line[idx] = x + bo * 0.5;
      out[i] = bo - x;
      idx = (idx + 1) % d;
    }
  }
  return out;
}

export const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Voice loudness envelope at 30 Hz → audio/env.json, so on-screen voice bars follow the real voice.
import { readFileSync, writeFileSync } from 'node:fs';
const buf = readFileSync(new URL('./voice.wav', import.meta.url));
let o = 12, rate = 48000, data;
while (o + 8 <= buf.length) { const id = buf.toString('ascii', o, o + 4), size = buf.readUInt32LE(o + 4); if (id === 'fmt ') rate = buf.readUInt32LE(o + 12); if (id === 'data') { data = buf.subarray(o + 8, o + 8 + size); break; } o += 8 + size + (size & 1); }
const fmt = buf.readUInt16LE(20), bits = buf.readUInt16LE(34);
const n = fmt === 3 ? data.length / 4 : data.length / 2, get = fmt === 3 ? (i) => data.readFloatLE(i * 4) : (i) => data.readInt16LE(i * 2) / 32768;
const hop = Math.round(rate / 30), env = [];
for (let i = 0; i < n; i += hop) { let s = 0; for (let j = i; j < Math.min(n, i + hop); j++) s += get(j) ** 2; env.push(Math.sqrt(s / hop)); }
const mx = Math.max(...env); writeFileSync(new URL('./env.json', import.meta.url), JSON.stringify({ fps: 30, v: env.map((x) => Math.round((x / mx) * 1000) / 1000) }));
console.log('env frames', env.length, 'fmt', fmt, bits);

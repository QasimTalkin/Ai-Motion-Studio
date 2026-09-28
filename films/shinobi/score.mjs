// Original score for "The Way of the Shinobi". Deterministic: same code, same WAV.
//   node films/shinobi/score.mjs   → films/shinobi/audio/score.wav
//
// D hirajoshi (D E F A Bb) on plucked koto strings (Karplus-Strong), taiko, a breathy bamboo flute
// and a pad, over a modern kit. 120 BPM, bar = 2 s, arranged to the shot list:
//   0-10 taiko cold open · 10-22 half-time tension · 22 impact, groove · 96 break · 98 half-time
//   108 soft bed for the testimonial · 114 peak for the promises · 126 taiko roll · 130 final hit
import { SR, writeWav, noiseGen, lowpass, highpass, reverb, midiHz } from '../../studio/wav.mjs';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BPM = 120, SPB = 60 / BPM, BAR = SPB * 4, DUR = 136, HIT = 130;
const n = Math.ceil(DUR * SR);
const drums = new Float32Array(n), music = new Float32Array(n), bass = new Float32Array(n),
  pad = new Float32Array(n), lead = new Float32Array(n);
const nz = noiseGen(20260928);

const add = (buf, t0, len, fn, g = 1) => {
  const s = Math.floor(t0 * SR);
  for (let i = 0; i < len * SR; i++) { const j = s + i; if (j >= 0 && j < n) buf[j] += fn(i / SR, i) * g; }
};

// ── voices ───────────────────────────────────────────────────────────────────
function kick(t0, g = 1) {
  add(drums, t0, 0.5, (t) => (Math.sin(2 * Math.PI * (46 * t + (120 / 16) * (1 - Math.exp(-16 * t)))) * Math.exp(-t * 7)
    + Math.exp(-t * 380) * 0.35) * 0.95, g);
}
function taiko(t0, g = 1, pitch = 1) {
  const lp = lowpass(900), lp2 = lowpass(260);
  add(drums, t0, 1.6, (t) => {
    const body = Math.sin(2 * Math.PI * (62 * pitch * t + 14 * (1 - Math.exp(-9 * t)))) * Math.exp(-t * 3.6);
    const skin = lp(nz()) * Math.exp(-t * 26) * 1.4;
    const room = lp2(nz()) * Math.exp(-t * 5) * 0.9;
    return (body + skin + room) * 0.8;
  }, g);
}
function snare(t0, g = 1) {
  const hp = highpass(1400);
  add(drums, t0, 0.3, (t) => (hp(nz()) * Math.exp(-t * 20) * 0.55
    + Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 30) * 0.4), g);
}
function clap(t0, g = 1) {
  const hp = highpass(1000);
  add(drums, t0, 0.25, (t) => {
    const env = [0, 0.012, 0.024].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 170) : 0), 0) + Math.exp(-t * 20) * 0.5;
    return hp(nz()) * env * 0.42;
  }, g);
}
function hat(t0, g = 1, open = false) {
  const hp = highpass(7500);
  add(drums, t0, open ? 0.28 : 0.05, (t) => hp(nz()) * Math.exp(-t * (open ? 12 : 80)) * 0.26, g);
}
function rim(t0, g = 1) {
  add(drums, t0, 0.05, (t) => Math.sin(2 * Math.PI * 1700 * t) * Math.exp(-t * 160) * 0.35, g);
}

// Koto: Karplus-Strong string, plucked with a soft pick, a touch of pitch "press" on some notes.
function koto(t0, midi, g = 1, len = 2.4, buf = music) {
  const f = midiHz(midi), N = Math.max(2, Math.round(SR / f));
  const line = new Float32Array(N), pick = lowpass(f * 6);
  const ex = noiseGen(Math.round(t0 * 997) + midi * 131);
  for (let i = 0; i < N; i++) line[i] = pick(ex()) * 1.6;
  let idx = 0;
  const s = Math.floor(t0 * SR), L = Math.floor(len * SR), fb = 0.4985 + Math.min(0.0012, 30 / f / 100);
  for (let i = 0; i < L; i++) {
    const a = line[idx], b = line[(idx + 1) % N];
    line[idx] = (a + b) * fb;
    idx = (idx + 1) % N;
    const j = s + i;
    if (j >= 0 && j < n) buf[j] += a * g * 0.5 * Math.min(1, (L - i) / (SR * 0.05));
  }
}

// Bamboo flute: sine + a little 2nd/3rd harmonic, scoop into pitch, delayed vibrato, breath noise.
function flute(t0, midi, beats, g = 1) {
  const f = midiHz(midi), len = beats * SPB, bp = highpass(900), lp = lowpass(3200);
  let ph = 0;
  add(lead, t0, len + 0.25, (t) => {
    const scoop = Math.pow(2, (-0.8 * Math.exp(-t * 14)) / 12);
    const vib = 1 + 0.006 * Math.sin(2 * Math.PI * 5.2 * t) * Math.min(1, Math.max(0, (t - 0.35) / 0.4));
    ph += (2 * Math.PI * f * scoop * vib) / SR;
    const env = Math.min(1, t / 0.09) * Math.min(1, Math.max(0, (len + 0.2 - t) / 0.25)) * (0.85 + 0.15 * Math.sin(t * 3));
    const tone = Math.sin(ph) + 0.18 * Math.sin(2 * ph) + 0.07 * Math.sin(3 * ph);
    const breath = lp(bp(nz())) * (0.28 + 0.5 * Math.exp(-t * 10));
    return (tone * 0.34 + breath * 0.22) * env;
  }, g);
}

// Pad: three detuned saws per note through a lowpass, slow swell.
function padChord(t0, notes, len, g = 1, cutoff = 1400) {
  for (const m of notes) {
    const f = midiHz(m), lp = lowpass(cutoff), lp2 = lowpass(cutoff);
    add(pad, t0, len + 0.6, (t) => {
      let v = 0;
      for (const d of [-0.006, 0, 0.0055]) v += 2 * ((f * (1 + d) * t) % 1) - 1;
      const env = Math.min(1, t / 0.6) * Math.min(1, Math.max(0, (len + 0.6 - t) / 0.6));
      return lp2(lp(v)) * env * 0.07;
    }, g);
  }
}
function sub(t0, midi, len, g = 1) {
  const f = midiHz(midi);
  add(bass, t0, len, (t) => Math.sin(2 * Math.PI * f * t) * Math.min(1, t * 80) * Math.min(1, (len - t) * 25) * 0.42, g);
}
function pluckBass(t0, midi, len, g = 1) {
  const f = midiHz(midi), lp = lowpass(700);
  add(bass, t0, len, (t) => {
    const saw = 2 * ((f * t) % 1) - 1;
    return (lp(saw) * 0.45 + Math.sin(2 * Math.PI * f * t)) * Math.exp(-t * 4) * Math.min(1, t * 400) * 0.33;
  }, g);
}
function riser(t0, len, g = 1) {
  const hp = highpass(2000);
  add(pad, t0, len, (t) => { const p = t / len; return (hp(nz()) * 0.25 + Math.sin(2 * Math.PI * (180 + 700 * p * p) * t) * 0.06) * p * p * p; }, g);
}

// ── harmony: i · VI · iv · V(sus) in D, the scale is D hirajoshi ─────────────
const CHORDS = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 50, 52]];  // Dm, Bb, Gm, Asus4
const ROOTS = [38, 34, 31, 33];
const SCALE = [50, 52, 53, 57, 58];                                       // D E F A Bb (D3)
const deg = (i) => SCALE[((i % 5) + 5) % 5] + 12 * Math.floor(i / 5);    // scale degree → midi

// Koto hook: two bars, 8th notes, degrees relative to D4 (index 5 = D4). null = rest.
const HOOK = [
  [8, null, 10, 11, 12, 11, 10, 8],
  [9, 8, 7, 6, 5, null, 6, 7],
];
// Flute phrase: four bars of [beat, degree, beats]
const PHRASE = [
  [[0, 10, 1.5], [1.5, 11, 0.5], [2, 12, 2]],
  [[0, 13, 2.5], [2.5, 12, 1.5]],
  [[0, 11, 1], [1, 12, 1], [2, 11, 1], [3, 10, 1]],
  [[0, 8, 4]],
];

// ── arrangement ───────────────────────────────────────────────────────────────
const sectionOf = (bar) => {
  const t = bar * BAR;
  if (t < 10) return 'cold';
  if (t < 22) return 'tension';
  if (t < 34) return 'groove1';
  if (t < 48) return 'groove2';
  if (t < 62) return 'flute';
  if (t < 80) return 'arp';
  if (t < 96) return 'prices';
  if (t < 98) return 'break';
  if (t < 108) return 'half';
  if (t < 114) return 'voices';
  if (t < 126) return 'peak';
  if (t < HIT) return 'roll';
  return 'end';
};

const kicks = [];
const K = (t, g) => { kick(t, g); kicks.push(t); };

for (let bar = 0; bar * BAR < DUR; bar++) {
  const t0 = bar * BAR, sec = sectionOf(bar), ci = bar % 4;
  const chord = CHORDS[ci], root = ROOTS[ci];
  const q16 = (q) => t0 + q * SPB / 4;
  if (sec === 'end') break;

  if (sec === 'cold') {
    // taiko statements that line up with the picture's hits; drone + sparse koto
    const hits = { 0: [0, 3], 1: [0, 2, 3, 3.5], 2: [0, 2.5], 3: [0, 1, 2, 3], 4: [0, 0.5, 1, 2, 2.5, 3, 3.25, 3.5, 3.75] };
    for (const bt of hits[bar] || []) taiko(t0 + bt * SPB, bt === 0 ? 1 : 0.6, bt === 0 ? 1 : 1.25);
    if (bar === 0) taiko(1.5, 1.1, 0.9);                 // the katana cut at 1.5 s
    sub(t0, 38, BAR, 0.7);
    padChord(t0, [50, 57], BAR, 0.8, 900);
    if (bar >= 1) [8, 10, 11, 10].forEach((d, i) => koto(t0 + i * SPB, deg(d), 0.55));
    continue;
  }

  if (sec === 'tension') {
    K(q16(0), 0.9); if (bar % 2) K(q16(10), 0.6);
    snare(q16(8), 0.8);
    for (let q = 0; q < 16; q += 2) hat(q16(q), q % 4 ? 0.5 : 0.8);
    sub(t0, root, BAR, 0.9);
    padChord(t0, chord, BAR, 0.9, 1100);
    for (let q = 0; q < 16; q += 2) koto(q16(q), chord[[0, 1, 2, 1][(q / 2) % 4]] + 12, q === 0 ? 0.7 : 0.4, 1.2);
    if (t0 + BAR >= 22) riser(t0, BAR, 1.1);
    continue;
  }

  if (sec === 'break') {
    padChord(t0, chord, BAR, 1.1, 1800);
    sub(t0, root, BAR, 0.7);
    koto(t0, deg(10), 0.7, 2); koto(t0 + SPB * 2, deg(8), 0.5, 2);
    riser(t0, BAR, 1.2);
    continue;
  }

  if (sec === 'voices') {
    padChord(t0, chord, BAR, 1.0, 1300);
    sub(t0, root, BAR, 0.8);
    for (let q = 0; q < 16; q += 2) koto(q16(q), chord[[0, 2, 1, 2][(q / 2) % 4]] + 12 + (q >= 8 ? 12 : 0), 0.35, 1.6);
    if (bar % 2 === 0) K(t0, 0.5);
    continue;
  }

  if (sec === 'roll') {
    // accelerating taiko roll into the final hit
    const local = t0 - 126, steps = [];
    for (let x = 0; x < BAR; ) { steps.push(x); x += Math.max(0.07, 0.5 - (local + x) * 0.11); }
    steps.forEach((x, i) => taiko(t0 + x, 0.45 + 0.4 * ((local + x) / 4), 1 + ((i % 2) * 0.2)));
    padChord(t0, chord, BAR, 1.1, 2200);
    sub(t0, root, BAR, 1);
    for (let q = 0; q < 16; q++) hat(q16(q), 0.3 + 0.4 * (q / 16));
    if (bar === Math.floor(126 / BAR)) riser(126, 4, 1.3);
    continue;
  }

  // groove sections ────────────────────────────────────────────────────────
  const half = sec === 'half';
  const full = ['prices', 'peak'].includes(sec);
  if (half) {
    K(q16(0), 1); K(q16(6), 0.7); if (bar % 2) K(q16(11), 0.6);
    snare(q16(8), 0.9);
    for (let q = 0; q < 16; q++) hat(q16(q), q % 2 ? 0.35 : 0.7);
  } else {
    for (let q = 0; q < 16; q += 4) K(q16(q), 1);
    clap(q16(4)); clap(q16(12));
    if (sec === 'groove1') for (let q = 2; q < 16; q += 4) hat(q16(q), 0.8);
    else for (let q = 0; q < 16; q++) hat(q16(q), q % 4 === 2 ? 0.9 : q % 2 ? 0.35 : 0.5, q === 14 && bar % 2 === 1);
    if (full || sec === 'arp') { rim(q16(3), 0.6); rim(q16(11), 0.5); }
  }
  // taiko punctuation: every 2 bars on the one, a fill at the end of each 4-bar phrase
  if (bar % 2 === 0) taiko(t0, full ? 0.8 : 0.55);
  if (ci === 3) [12, 13, 14, 15].forEach((q, i) => taiko(q16(q), 0.35 + i * 0.12, 1.2 + i * 0.05));
  if (sec === 'groove1' && bar === 11) taiko(t0, 1.2, 0.85);

  // bass
  for (let q = 0; q < 16; q += 2) if (q % 8 !== 6) pluckBass(q16(q), root + (q === 10 ? 7 : 0), SPB * 0.45, q % 4 === 0 ? 1 : 0.7);
  sub(t0, root, BAR, 0.45);
  padChord(t0, chord, BAR, full ? 0.8 : 0.55, full ? 1900 : 1300);

  // koto hook (skipped under the flute section so the lead has room)
  if (sec !== 'flute') {
    const hk = HOOK[bar % 2];
    hk.forEach((d, i) => { if (d != null) koto(t0 + i * SPB / 2, deg(d) + (full && bar % 4 >= 2 ? 12 : 0), i === 0 ? 0.8 : 0.55, 1.6); });
  } else {
    [0, 6, 10].forEach((q) => koto(q16(q), chord[q === 0 ? 0 : 2] + 12, 0.5, 1.4));
  }
  // koto 16th arpeggio for the work wall and the peak
  if (sec === 'arp' || sec === 'peak') for (let q = 0; q < 16; q++) koto(q16(q), deg(10 + [0, 2, 4, 2, 1, 3, 5, 3][q % 8]), 0.22, 0.5);
  // flute lead
  if (sec === 'flute' || sec === 'peak') {
    for (const [bt, d, len] of PHRASE[bar % 4]) flute(t0 + bt * SPB, deg(d) + 12 - (sec === 'peak' ? 0 : 0), len, sec === 'peak' ? 0.8 : 1);
  }
}

// Final hit at 130 s: kick + taiko + a strummed koto chord + pad, ringing out to the end.
K(HIT, 1.2); taiko(HIT, 1.3, 0.85); taiko(HIT + 0.02, 0.8, 0.6);
[50, 57, 62, 64, 65, 69, 74].forEach((m, i) => koto(HIT + i * 0.035, m, 0.8, 5.5));
padChord(HIT, [38 + 12, 45 + 12, 50 + 12, 53 + 12], DUR - HIT - 0.4, 1.3, 1600);
sub(HIT, 38, DUR - HIT - 0.2, 1.1);
flute(HIT + 0.6, 74 + 12, 8, 0.6);

// ── mix: reverb on the melodic bus, sidechain duck under every kick ────────────
const melodic = new Float32Array(n);
for (let i = 0; i < n; i++) melodic[i] = music[i] + pad[i] + lead[i] * 0.9;
const wet = reverb(melodic, { size: 1.25, damp: 0.3 });
const drumWet = reverb(drums, { size: 0.8, damp: 0.5 });
kicks.sort((a, b) => a - b);
const out = new Float32Array(n);
let k = 0;
for (let i = 0; i < n; i++) {
  const t = i / SR;
  while (k + 1 < kicks.length && kicks[k + 1] <= t) k++;
  const since = kicks.length && t >= kicks[k] ? t - kicks[k] : 10;
  const duck = 1 - 0.5 * Math.exp(-since * 8);
  const fadeOut = Math.min(1, Math.max(0, (DUR - t) / 1.5));
  const v = drums[i] * 0.9 + drumWet[i] * 0.12 + (bass[i] + melodic[i] * 0.85 + wet[i] * 0.4) * duck;
  out[i] = Math.tanh(v * 1.1) * 0.85 * fadeOut;
}

const dir = join(import.meta.dirname, 'audio');
mkdirSync(dir, { recursive: true });
writeWav(join(dir, 'score.wav'), [out]);
console.log(`score.wav: ${DUR}s @ ${BPM} BPM, ${kicks.length} kicks, final hit ${HIT}s`);

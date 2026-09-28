// lib/motion.js — motion primitives. Every function here is a pure function of its inputs:
// no clocks, no Math.random, no state carried between frames. That is what keeps seek(t)
// deterministic, so frame 812 renders without simulating frames 0 to 811.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, p) => a + (b - a) * p;

// Linear progress of t through [a, b], clamped to 0..1. For timing windows, not for motion.
export const range = (t, a, b) => clamp((t - a) / (b - a));

// Spring presets as [stiffness k, damping d]. Pick by what is moving:
//   snappy  - buttons, toggles, leading edges (tiny overshoot, < 1%)
//   default - cards, containers, camera (critically damped)
//   heavy   - big type, 3D objects, logo lockups (slow, no overshoot)
//   playful - mascots, stickers (visible overshoot, never on type)
export const SPRING = {
  snappy: [320, 30],
  default: [170, 26],
  heavy: [90, 19],
  playful: [200, 12],
};

// Closed-form damped spring, 0 -> 1, starting at t = 0.
// spring(t) | spring(t, 320, 30) | spring(t, SPRING.snappy)
export function spring(t, k = 170, d = 26) {
  if (Array.isArray(k)) [k, d] = k;
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k), z = d / (2 * w0);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t); // z >= 1 treated as critical
}

// A value that changes target several times. keys: [[time, value], ...] sorted by time.
// One spring per change, each starting at its own time: continuous motion, still pure.
export function track(t, keys, k = 170, d = 26) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
  return v;
}

// Same as track() for [x, y] (or any length) vectors: [[time, [x, y]], ...]
export function trackN(t, keys, k = 170, d = 26) {
  return keys[0][1].map((_, j) => track(t, keys.map(([kt, v]) => [kt, v[j]]), k, d));
}

// A tab indicator that stretches: leading edge is stiffer than trailing edge.
export function indicator(t, stops, width = 120) {
  const lead = track(t, stops, 320, 30);
  const trail = track(t, stops, 140, 22);
  return { left: Math.min(lead, trail), right: Math.max(lead, trail) + width };
}

// Text inside a morphing box: in after the morph starts, out before the next one.
export function swapAlpha(t, tIn, tOut = Infinity) {
  return Math.min(clamp((t - tIn - 0.08) / 0.12), clamp((tOut - 0.1 - t) / 0.1));
}

// Seamless loop: time wraps so the last frame equals the first.
export const loopT = (t, dur) => ((t % dur) + dur) % dur;

// Stagger helper: start time of item i in a sequence.
export const stagger = (i, step = 0.04, start = 0) => start + i * step;

// mulberry32 seeded generator. rng(7)() -> same sequence every run.
export function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Integer hash -> 0..1. Stateless, so it is safe to call from anywhere in draw(t).
export function hash(n, seed = 0) {
  let x = Math.imul((n | 0) ^ (seed * 0x9E3779B1), 0x85EBCA6B);
  x ^= x >>> 13; x = Math.imul(x, 0xC2B2AE35); x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

// Smooth 1D value noise in -1..1. Handheld camera drift: noise(t * 0.7, 3) * 6 * S.u
export function noise(t, seed = 0) {
  const i = Math.floor(t), f = t - i, s = f * f * (3 - 2 * f);
  return lerp(hash(i, seed), hash(i + 1, seed), s) * 2 - 1;
}

// Beat-reactive envelope: 1 on every beat, decaying until the next. Pure in t.
export function beatPulse(t, bpm, { offset = 0, decay = 10, every = 1 } = {}) {
  const period = (60 / bpm) * every;
  if (t < offset) return 0;
  return Math.exp(-decay * (((t - offset) % period)));
}

// Typewriter: how many characters of `str` are visible at t, typing `cps` chars per second.
export const typed = (str, t, cps = 22) => str.slice(0, Math.max(0, Math.floor(t * cps)));

// Mix two hex colors. mixColor('#141413', '#D97757', 0.5)
export function mixColor(a, b, p) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (v, s) => (v >> s) & 255;
  const c = [16, 8, 0].map((s) => Math.round(lerp(ch(pa, s), ch(pb, s), clamp(p))));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

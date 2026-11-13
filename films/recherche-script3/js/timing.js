// Voice timings from npm run tts. Every cue in the film reads from here.
export const TIMING = await fetch(new URL('../audio/timing.json', import.meta.url)).then((r) => r.json());
export const ENV = await fetch(new URL('../audio/env.json', import.meta.url)).then((r) => r.json());
export const L = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
export const DUR = 159;

// Voice loudness (0..1) at time t, from the real voice track.
export const voiceAt = (t) => { const f = t * ENV.fps, i = Math.floor(f), a = ENV.v[i] || 0, b = ENV.v[i + 1] || 0; return a + (b - a) * (f - i); };

// Chapter and transition times, all derived from the spoken lines.
export const T = {
  A2: L.t2.start - 0.5,            // testimony 1 → 2 (whip)
  A3: L.t3.start - 0.5,            // testimony 2 → 3 (whip)
  P: L.p.start - 0.55,             // the three people, framed
  S: L.s1.start - 0.5,             // Dorothy Smith
  DIVE: L.s1.marks.pv - 0.15,      // into one dot: the situated standpoint
  EI: L.s2.marks.ei - 0.45,        // the method's name
  F1: L.f1.start - 0.5,            // the four foundations
  F2: L.f2.start - 0.5,
  F3: L.f3.start - 0.5,
  F4: L.f4.start - 0.5,
  R: L.r1.start - 0.6,             // from sociology to organizations
  SIX: L.r2.start - 0.35,          // "6 étapes"
  K: L.k1.start - 0.5,             // the map, step by step
  Z: L.z.start - 0.5,              // recap
  E: L.e.start - 0.5,              // reference
};
T.FADE = DUR - 0.5;

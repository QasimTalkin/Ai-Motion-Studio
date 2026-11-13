// Voice timings from npm run tts. Every cue in the film reads from here.
export const TIMING = await fetch(new URL('../audio/timing.json', import.meta.url)).then((r) => r.json());
export const L = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
export const DUR = 144;

// Chapter and transition times, all derived from the spoken lines.
export const T = {
  PULL: L.a1.marks.pan - 0.15,      // dolly out from three doors to the wall
  P_IN: L.p.start - 0.45,           // the sociological lens sweeps the wall
  P_LOCK: L.p.marks.b - 0.35,       // iris into one lock
  P_KEY: L.p.marks.c - 0.1,         // a candidate's key slides in
  P_JAM: L.p.marks.d + 0.15,        // ... and jams
  Q_TO_S: L.s.start - 0.5,          // the "?" on the key becomes the headline digit
  TF: L.f.start - 0.5,              // match cut through lens 1
  TI: L.i.start - 0.5,              // pan to approach 2
  TC: L.c.start - 0.5,              // push up to approach 3
  TR: L.r.start - 0.5,              // three lenses side by side
  TK: L.k.start - 0.5,              // conclusion
  TE: L.e.start - 0.5,              // references
};
T.FADE = DUR - 0.5;

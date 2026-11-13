// Voice timings from npm run tts. Every cue in the film reads from here.
export const TIMING = await fetch(new URL('../audio/timing.json', import.meta.url)).then((r) => r.json());
export const L = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
export const DUR = 144;

// Chapter and transition times, all derived from the spoken lines.
export const T = {
  A_END: L.p.start - 0.55,          // primer cards gather
  Q_DROP: L.p.marks.b,              // "?" drops, cards fall away
  Q_TO_S: L.s.start - 0.55,         // "?" becomes the headline digit
  TX: L.q1.start - 0.55,            // match cut: node 1 → target
  X1: L.x1.start - 0.25,            // target → funnel
  TP: L.q2.start - 0.5,             // camera pan right
  TI: L.q3.start - 0.55,            // lens iris
  X3: L.x3.marks.b - 0.35,          // gears → approaches
  TU: L.q4.start - 0.45,            // push up
  TM: L.q5.start - 0.55,            // cards → bubbles
  TR: L.r.start - 0.6,              // step 5 → recap path
  TE: L.e.start - 0.5,              // recap → references
};
T.FADE = DUR - 0.5;

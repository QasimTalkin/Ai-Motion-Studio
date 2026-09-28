// lib/motion.js: every function is a pure function of time. No clocks, no Math.random, no state.
// Load it with <script src="../lib/motion.js"></script>; the functions become globals.
(function (root) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  // Closed-form damped spring, 0 → 1. Pure function of time.
  //   snappy UI: 320,30   default: 170,26   heavy type/logo: 90,19   playful: 200,12
  function spring(t, k = 170, d = 26) {
    if (t <= 0) return 0;
    const w0 = Math.sqrt(k), z = d / (2 * w0);
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
    }
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t);      // z >= 1 treated as critical
  }

  // keys: [[time, value], ...] sorted by time. One spring per change, so motion stays continuous.
  function track(t, keys, k = 170, d = 26) {
    let v = keys[0][1];
    for (let i = 1; i < keys.length; i++)
      v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
    return v;
  }

  // A tab indicator that stretches: leading edge is stiffer than trailing edge
  function indicator(t, stops, width = 120) {        // stops: [[time, x], ...]
    const lead = track(t, stops, 320, 30);
    const trail = track(t, stops, 140, 22);
    return { left: Math.min(lead, trail), right: Math.max(lead, trail) + width };
  }

  // Text inside a morphing box: in after the morph starts, out before the next one
  function swapAlpha(t, tIn, tOut = Infinity) {
    return Math.min(clamp((t - tIn - 0.08) / 0.12), clamp((tOut - 0.1 - t) / 0.1));
  }

  // Seamless loop: pin the last frame to the first
  const loopT = (t, dur) => ((t % dur) + dur) % dur;

  // Seeded noise, never Math.random: the render must be identical every run (mulberry32)
  function rng(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  // A simple original score as cues for scripts/sfx.mjs: kick, snare, hats and a plucked
  // i-VI-III-VII progression. beatBed(120, 15) → [{ t, type, midi? }, ...]
  function beatBed(bpm, dur, { root = 57, drums = true } = {}) {
    const spb = 60 / bpm, cues = [], chords = [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]];
    for (let beat = 0; beat * spb < dur - 0.05; beat++) {
      const t = beat * spb, bar = Math.floor(beat / 4), chord = chords[bar % 4];
      if (drums) {
        cues.push({ t, type: 'kick' });
        if (beat % 4 === 1 || beat % 4 === 3) cues.push({ t, type: 'snare' });
        cues.push({ t: t + spb / 2, type: 'hat' });
      }
      if (beat % 4 === 0) chord.forEach((n) => cues.push({ t, type: 'note', midi: root + n }));
      cues.push({ t: t + (beat % 2 ? spb / 2 : 0), type: 'note', midi: root + 12 + chord[beat % 3], gain: 0.5 });
      if (beat % 4 === 0) cues.push({ t, type: 'note', midi: root - 24 + chord[0], gain: 0.9 });
    }
    return cues;
  }

  Object.assign(root, { clamp, spring, track, indicator, swapAlpha, loopT, rng, beatBed });
})(globalThis);

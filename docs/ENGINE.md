# Engine reference

## The contract
A film is `index.html` that imports `/lib/stage.js` and calls `boot()`. The page must paint any
moment on demand through `window.seek(t)`, as a pure function of `t`. The renderer loads the page over
a local server rooted at the repo (so `/lib/...` and `/node_modules/...` resolve), waits for fonts and
images, then walks time.

```
render.mjs ──seek(t)──▶ page draws frame t ──canvas PNG──▶ ffmpeg (tmix subframes) ──▶ silent.mp4
audio.mjs  ──cues + music──▶ music.wav + sfx.wav ──loudnorm -14 LUFS──▶ mix.wav
film.mjs   ──mux──▶ out/<format>/final.mp4 ──▶ sheets.mjs ──▶ contact / strip / phone / poster / loop
```

## boot(film)

```js
import { boot } from '/lib/stage.js';
boot({
  title: 'Launch',          // shown in sheets
  dur: 15,                  // seconds
  bpm: 120,                 // beat grid; S.beat(n) = beatOffset + n * 60 / bpm
  beatOffset: 0,            // first downbeat of a supplied track
  formats: ['9:16', '16:9'],         // default: vertical first, then landscape. No 1:1
  loop: false,              // true: check.mjs verifies seek(dur) === seek(0), no audio fade-out
  palette: { bg, ink, dim, accent },  // bg paints every frame
  images: { logo: 'assets/logo.png' },          // preloaded, S.img('logo')
  music: { style: 'pulse', key: 'A', seed: 1, end: 13.5 },  // or { file: 'audio/track.wav' } or false
  cues: [{ t: 0, type: 'thump' }] /* or (S) => [...] */,
  sfxVolume: 0.9,
  poster: 6.2,              // poster frame time
  scenes: [{ from: 0, to: 3, draw(t, S, progress) {} }],   // t is local to the scene
  draw(t, S) {},            // optional, drawn after scenes (overlays, camera, global elements)
});
```

Scenes are drawn when `from <= t < to`, in array order, inside `save()/restore()`. Overlapping ranges
are allowed (the later scene draws on top), which is how transitions are built.

## The stage `S`

| Field | Meaning |
|---|---|
| `S.g` | the 2D context |
| `S.W`, `S.H`, `S.cx`, `S.cy` | canvas size and center (px) |
| `S.u` | stage unit: `min(W, H) / 1080`. Write every size as `n * S.u` |
| `S.orientation` | `'portrait' \| 'square' \| 'landscape'` |
| `S.pick({ portrait, square, landscape })` | per-format value (falls back to portrait) |
| `S.beat(n)`, `S.bar(n)`, `S.bpm`, `S.spb` | beat grid |
| `S.font(size, weight, face)` | canvas font string in stage units; faces: `display`, `ui`, `mono` |
| `S.text(str, x, y, { size, weight, face, color, align, baseline, tracking, alpha })` | text in stage units, returns width |
| `S.rrect(x, y, w, h, r)` | rounded-rect path (then `g.fill()` / `g.stroke()`) |
| `S.img(name)` | a preloaded image |
| `S.palette`, `S.dur`, `S.format` | as passed |

## lib/motion.js

| Function | Use |
|---|---|
| `spring(t, k, d)` / `spring(t, SPRING.heavy)` | 0→1 closed-form spring starting at t=0 |
| `SPRING.snappy/default/heavy/playful` | presets (see prompts/07) |
| `track(t, [[t0, v0], [t1, v1], ...], k, d)` | a value with many targets, one spring per change |
| `trackN(t, [[t0, [x, y]], ...])` | the same for vectors (cursor paths) |
| `indicator(t, stops, width)` | stretching tab indicator: `{ left, right }` |
| `swapAlpha(t, tIn, tOut)` | content alpha inside a morphing container |
| `loopT(t, dur)` | wrap time for seamless loops |
| `range(t, a, b)`, `clamp`, `lerp`, `stagger(i, step)` | timing helpers |
| `rng(seed)`, `hash(n, seed)`, `noise(t, seed)` | deterministic randomness, smooth noise |
| `beatPulse(t, bpm, { offset, decay, every })` | 1 on each beat, decaying |
| `typed(str, t, cps)` | typewriter substring |
| `frameHold(t, fps)` | hold counters/text for a whole output frame so motion blur doesn't smear digits |
| `mixColor(a, b, p)` | blend two hex colors |

## Render options
`npm run render <film> -- --format 9:16 --fps 60 --sub 4 --from 4 --to 6 --scale 1 --workers 4 --draft`

- `--sub N` renders N subframes per output frame across the shutter interval and averages them.
- `--draft` = 30 fps, 1 subframe, half resolution. For pacing, never for delivery.
- `--from/--to` renders only those seconds (`silent_4-6.mp4`) for fast fix-and-look loops.
- Frames are split across `--workers` pages; valid only because every frame is a pure function of t.

## Why canvas, not DOM
Canvas makes seek(t) trivially pure, renders identically headless, and has no layout or transition
engine to fight. If a film needs DOM (real HTML UI), keep the same contract: every style is computed
from t inside seek(t), no CSS transitions, and switch the capture to `page.screenshot()`.

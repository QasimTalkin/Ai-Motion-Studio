# Examples

Finished films made with this studio. Read the source before writing your own: every idiom you need
(slot reveals, circle wipes, one-shape morphs with `track()`, stretching indicators, cursor paths,
counters with `frameHold()`, depth without a 3D engine, synthesized score + cues) is in here.

| Film | Pattern | Length | Formats | Render |
|---|---|---|---|---|
| [`showreel/`](showreel) | L1 one-liner showreel: 7 shots, 7 techniques | 15 s | 9:16 · 16:9 | `npm run demo` |
| [`ui-morph/`](ui-morph) | L3 XML spec: one container, 11 UI states, seamless loop | 16 s | 9:16 · 16:9 | `npm run film examples/ui-morph` |
| [`yourbrand/`](yourbrand) | Product reel for a fictional brand: real UI captured with Playwright, cursor actions, metric, lockup | 20 s | 9:16 · 16:9 | `npm run film examples/yourbrand` |

Each has `docs/review_log.md` with the real critique rounds from building it.

`yourbrand/` is the template to copy for your own product: its `site/` folder stands in for your website
(`node examples/yourbrand/site/capture.mjs` captures it into `assets/`). Point the capture at your real URL,
swap the copy and the accent color, and the timeline carries over.

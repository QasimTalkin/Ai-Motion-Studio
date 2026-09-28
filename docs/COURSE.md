# The course, as a repo

This studio is built from the 12-step course *"How to build a motion design studio with Opus 5.5"*
(by [@0xMovez](https://x.com/0xMovez)). Each step below says what it teaches and where it lives here.
The one-line summary: **the prompt is 10% of the video; the other 90% is the harness.**

## Part 1 · What is actually happening

### 01. Pixels: the model writes a program, not a video
The model takes text and images in and puts text out. It cannot emit an MP4. Every video in the trend
is a program: a function `seek(t)` that paints the exact frame for any moment. A headless browser calls
it 900 times for 15 s at 60 fps, screenshots each frame, ffmpeg stitches them. Nothing depends on a
timer, so the render is identical every run and a change is a one-line edit plus a re-render.
→ `lib/stage.js` (`window.seek`), `studio/render.mjs`, `npm run check` (determinism).

### 02. Setup: install the studio in 10 minutes
The chat app can write an animation, but only an agent with a shell can render it, listen to it and look
at its own frames. That feedback loop is the difference between "mid" and viral.
→ `npm install && npm run doctor`. House rules in `CLAUDE.md` / `AGENTS.md` load on every run.
Effort: medium for fixes and re-renders, xhigh for new films, max when the first 3 s carry a launch.

## Part 2 · Prompting like a director

### 03. One-liner: the showreel prompt and why it works
"showreel for a résumé" sets a genre; "what an incredible motion designer you are" makes the model the
subject; "15-second" fits one pass; "go all out" multiplies effort. Weakness: brief contagion.
→ `prompts/01-showreel-one-liner.md`, `examples/showreel`.

### 04. Brand: point the reel at your product
Three extra lines: the URL, "use actual product screenshots, logo, assets", "must have music".
Keep one session per brand. Keys in `.env`, referred to by name.
→ `prompts/02-brand-reel.md`, `.claude/skills/motion-reel`.

### 05. Reference: name a look, feed a frame
Without a reference: centered text, gradient, everything fading in. A frame, a video or your own
library gives pacing, type and transitions. Take the grammar, never the content.
→ `prompts/03-reference.md`, `templates/film/docs/style_guide.md`.

### 06. Spec: write the state list, not the vibe
The most-bookmarked prompt was an XML spec: inputs, direction, beat-by-beat states, build rules,
gotchas. One shape never cuts; a cursor drives every change; the last frame equals the first.
→ `prompts/04-ui-morph-spec.xml`, `examples/ui-morph`.

## Part 3 · Build the engine

### 07. Engine: the seek(t) renderer
Route A, zero dependencies: one `index.html`, a canvas, `window.seek(t)`, Playwright capturing frame by
frame, ffmpeg encoding with 4 subframes blended for motion blur. Route B: Remotion or HyperFrames.
→ `lib/stage.js`, `studio/render.mjs`, `prompts/08-frameworks-route-b.md`, [ENGINE.md](ENGINE.md).

### 08. Springs: make motion feel expensive
Closed-form springs stay a pure function of time. When a value changes target several times, add one
spring per change (`track()`), don't restart. Stretching indicators, swap timing, seamless loops.
→ `lib/motion.js`, `prompts/07-spring-refactor.md`.

### 09. Sound: score it to the beat
If you supply a track, measure it (`studio/beats.py`). If you don't, synthesize it on the same
timeline as the picture. Hits on the grid, -14 LUFS.
→ `studio/music.mjs`, `studio/sfx.mjs`, `studio/audio.mjs`, [SOUND.md](SOUND.md).

## Part 4 · From one clip to a studio

### 10. Overnight: write the director's brief
Film in one line, references, tools and keys, character bible, beat sheet, text on screen, workflow
gates, critique loop, deliverables. Subagents per chapter briefed by `ANIMATION_GUIDE.md`.
Generate-then-trace for motion that's hard to hand-code.
→ `prompts/05-director-brief.md`, `.claude/skills/director-brief`, `.claude/agents/`.

### 11. Critique: make the model watch its own frames
Contact sheet, strip, phone test, loop check, determinism check; score 1-10 on seven axes; fix the 3
worst; repeat until 8+. 163 model calls for a 45-second watercolor short is the method, not a failure.
→ `npm run stills`, `npm run sheets`, `npm run check`, `.claude/skills/critique-pass`,
`.claude/agents/motion-critic.md`, [WORKFLOW.md](WORKFLOW.md).

### 12. Ship: formats, a skill, and a service
Every format from one timeline (layout functions, not pixels). Package the pipeline as a skill so the
next video is a sentence. Sell it: music, a mascot, features, an offer, any language, 3 edits.
→ `formats` in `boot()`, `S.pick()`, `npm run film -- --format all`, `.claude/skills/motion-reel`.

## Conclusion
The one-liner gets you a clip. The harness gets you a studio. Install the stack, steal a reference,
write the state list, own the seek(t) engine, and make the model watch its own frames until every score
is 8. Then package it as a skill and never write the long prompt again.

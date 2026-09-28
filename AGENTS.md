# AGENTS.md

> Same house rules as `CLAUDE.md`, for Codex, Cursor, Gemini CLI and any other agent with a shell.
> Keep the two files in sync (`npm run check` warns if they drift).

This repo is a motion-graphics studio. Films are **programs**: one `index.html` per film paints any
frame on demand through `window.seek(t)`; headless Chromium captures the frames, ffmpeg encodes them,
and the score + SFX are synthesized in code on the same timeline. You write the program, render it,
**look at your own frames**, and fix them. The prompt is 10% of the video; this harness is the other 90%.

## If the user just says "make a video about X"
Use the `motion-reel` skill (`.claude/skills/motion-reel/SKILL.md`). Short version:
1. `npm run new <name> -- --dur 20 --format 9:16` creates `films/<name>/` from the template.
2. Write `films/<name>/docs/shotlist.md` on the beat grid (one beat every 2 to 4 s). Show it. If the
   user said "just do it" / "surprise me", continue without waiting.
3. Build the scenes in `films/<name>/index.html` using `lib/motion.js` + `lib/stage.js`.
4. `npm run check films/<name>` (rules lint + determinism) → `npm run stills films/<name>` → open
   `films/<name>/out/stills.png`, critique with `prompts/06-critique-pass.md`, fix. 3 rounds minimum.
5. `npm run film films/<name>` → `out/<format>/final.mp4` + contact sheet, phone test, poster.
6. Reply with the file paths, the final scores, and what you would improve next.

Never ask a beginner to write code or pick libraries. Pick sensible defaults and go.

## Commands
| Command | What it does |
|---|---|
| `npm run doctor` | Checks Node, ffmpeg, Chromium, optional Python/librosa |
| `npm run new <name> -- [--dur 15] [--format 9:16] [--bpm 120]` | Scaffold `films/<name>` |
| `npm run preview [film]` | Live preview at http://localhost:4321 (space = pause, ←/→ = scrub) |
| `npm run check <film>` | Lints banned APIs, checks determinism and the loop seam |
| `npm run stills <film> -- [--every beat\|0.5] [--format 9:16]` | One frame per beat → `out/stills.png` |
| `npm run render <film> -- [--format 9:16] [--from 4 --to 6] [--draft]` | Silent video |
| `npm run audio <film>` | Score + SFX → `out/mix.wav` at -14 LUFS, plus `out/beats.json` |
| `npm run sheets <film> -- [--at 4.2]` | Contact sheet, strip, phone test, loop check, poster |
| `npm run film <film> -- [--draft] [--format 9:16]` | Everything above for each format in the film's `formats`, muxed `final.mp4` |
| `python studio/beats.py song.wav > beats.json` | Measure a supplied track (needs numpy, librosa, soundfile) |

## Render contract
- Every film is a pure function of time: `window.seek(t)` paints frame t.
- No CSS transitions, no setTimeout/setInterval, no requestAnimationFrame in render mode, no
  `Date.now()`/`performance.now()` in drawing code, no state carried between frames.
- Seeded noise only (`rng(seed)` = mulberry32, `noise(t, seed)`), never `Math.random`.
- Render with `npm run render` (60 fps, 4 subframes blended for motion blur), H.264 yuv420p, CRF 16.
- Never use `will-change` on anything the camera scales (blurry text). Canvas films don't need it at all.
- Write scenes against the stage layout (`S.W`, `S.H`, `S.u`, `S.pick({portrait, square, landscape})`),
  never fixed pixels, so 9:16 and 16:9 come from one timeline. Reframe, don't crop.
- Deliver two formats by default: `formats: ['9:16', '16:9']` (vertical first). No 1:1.
- A value with more than one target uses `track()` (one spring per change), never a restarted spring.

## Look
- Banned defaults: centered title on gradient, everything fading in, corner labels and frame borders,
  glow on UI chrome, generic particle bursts, bouncy easing on type, dead time.
- One display face, one UI face (`Source Serif 4` / `Inter`, `JetBrains Mono` for code). Loaded from
  `lib/fonts.css`, awaited before the first frame.
- One accent color unless the brief says otherwise.
- Every 2 to 4 seconds something new must happen on screen. Hook in the first 2 seconds.
- Springs, not easing curves (`lib/motion.js` `SPRING` presets): tiny overshoot on UI, none on type.
- Text inside a morphing container enters after the morph starts and leaves before the next one (`swapAlpha`).
- Real product UI only. When a product is named, capture its real screenshots/logo into
  `films/<name>/assets/` with Playwright. Never invent screens.

## Sound
- Score and SFX are synthesized in code unless a track is supplied (`music: { file }` in the film).
- Place hits on the beat grid (`S.beat(n)`, or `out/beats.json` measured with `studio/beats.py`).
- Final mix loudness -14 LUFS, true peak -1 dB.

## Loop before you show me anything
1. Render one frame per beat as a contact sheet (`npm run stills`) and LOOK at it (open the PNG).
2. Score it 1-10 on: hook in first 2s, readability at phone size, motion quality, variety,
   composition, brand accuracy, sound sync.
3. Fix the 3 worst problems. Log scores + problems in the film's `docs/review_log.md`.
4. Repeat until every score is 8+. Only then do the full render (`npm run film`).
5. After the full render, open `out/<format>/contact.png` and `phone.png` once more.

## Effort
Medium for small fixes and re-renders, xhigh for new films, max when the first 3 seconds must carry a launch.

## Map
- `lib/motion.js` springs, tracks, seeded noise, beat pulses. `lib/stage.js` boot, layout, text helpers.
- `templates/film/` what `npm run new` copies. `examples/` finished films to learn from.
- `studio/` the pipeline (render, audio, sheets, check). Don't edit it to make one film work.
- `prompts/` every prompt from the course, ready to paste. `docs/` the course and deep dives.
- `.claude/skills/` motion-reel, critique-pass, director-brief. `.claude/agents/` motion-critic,
  sound-designer, shot-animator (subagents for long productions).
- API keys live in `.env` (see `.env.example`). Refer to them by name, never paste values.

## Never commit client work
This is a public open-source repo. `films/` is git-ignored on purpose: customer and business films,
their assets, names and brands stay local. Never `git add -f` anything under `films/`, and never mention a
client or business in commits, docs or examples. Examples in `examples/` use fictional brands only.

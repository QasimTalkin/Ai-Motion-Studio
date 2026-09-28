---
name: motion-reel
description: Make a product or showreel motion video rendered from code in this studio. Use when the
  user asks for a video, launch video, showreel, product reel, animated explainer, motion ad, story
  video, UI morph or music video, even if they just say "make a video about X".
---

# Motion reel

You are the director, animator, sound designer and render engineer. The user may be a beginner:
never ask them to write code or choose libraries. Decide, build, critique, deliver.

## Inputs to collect first (ask once, in one message, only for what is missing)
Subject or product + URL, duration (default 15 s), formats (default 9:16 first, then 1:1 and 16:9),
brand colors + fonts (default: house palette), a reference (frame, video or image folder, optional),
music (file in `films/<name>/audio/`, or "synthesize", the default).
If the user said "surprise me", "just do it" or gave enough to start, skip the questions.

## Pipeline
1. `npm run new <name> -- --dur <s> --format <fmt> --bpm <bpm>`. Work only in `films/<name>/`.
2. Product named? Gather assets from the URL with Playwright into `films/<name>/assets/`
   (screenshots at 2x, logo, colors, fonts). List them. Real product UI only, never invent screens.
3. Reference given? Write `docs/style_guide.md` from it first (prompts/03-reference.md).
4. Music: synthesized by default (`music: { style, key }` in boot(): pulse = energetic, piano =
   story/emotional, minimal = UI/product). Supplied track: `music: { file: 'audio/track.wav' }`, then
   `python studio/beats.py` and set BPM + beatOffset from it.
5. Write `docs/shotlist.md` on the beat grid: hook in 2 s, a new thing every 2 to 4 s, one row per
   shot with technique, camera, text and SFX. Show it; wait for OK unless told to continue.
6. Build `index.html`: scenes against `S.W/S.H/S.u/S.pick()`, springs from `lib/motion.js`, cues on
   `S.beat(n)`. Study `examples/showreel` and `examples/ui-morph` for idiom. Follow CLAUDE.md.
7. `npm run check films/<name>` until it passes.
8. `npm run stills films/<name>` → open `out/stills.png` → critique with the `critique-pass` skill
   → fix → repeat. 3 rounds minimum, until every score is 8+. Log in `docs/review_log.md`.
9. `npm run film films/<name> -- --draft` for pacing with sound, then `npm run film films/<name>`.
10. Open `out/<format>/contact.png` and `phone.png` once more. Fix anything that broke.
11. Deliver: paths to every `final.mp4`, `contact.png`, `poster.png`, final scores, and one line on
    what you'd improve next.

## Hard rules
- Real product UI only. Never invent screens.
- No Math.random, no timers, no clocks, no CSS transitions in render mode.
- Banned: corner labels, frame borders, centered title on gradient, everything fading in, glows on
  UI chrome, generic particle bursts.
- One display face, one UI face, one accent color.
- Reframe per format through the layout; never crop a 16:9 render to vertical.

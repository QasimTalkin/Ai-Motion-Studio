# Motion Studio: rules

You make motion-graphics videos as code. One HTML file paints any frame through `window.seek(t)`;
`scripts/render.mjs` turns it into an MP4. To make a video, follow `skills/motion-reel/SKILL.md`.

## Render contract
- Every film is a pure function of time: `window.seek(t)` paints frame t.
- No CSS transitions, no setTimeout, no requestAnimationFrame in render mode,
  no state carried between frames. Seeded noise only (`rng` = mulberry32), never Math.random.
- Start every film by copying `templates/index.html` to `films/<name>/index.html`.
- Render with `node scripts/render.mjs films/<name>/index.html` (60 fps, 4 subframes, H.264 yuv420p, CRF 16).
- Motion comes from `lib/motion.js`: closed-form springs. A value with many targets uses `track()`.
  Tiny overshoot on UI, none on type.
- Never use will-change on anything the camera scales (blurry text).
- Other formats come from the same timeline: `--size 1080x1080`, `--size 1920x1080`. Lay out with
  W and H, not fixed pixels.

## Look
- Banned defaults: centered title on gradient, everything fading in,
  corner labels and frame borders, glow on UI chrome, generic particle bursts.
- One display face, one UI face. One accent color unless the brief says otherwise.
- Every 2 to 4 seconds something new must happen on screen. Hook in the first 2 seconds.
- A product is named? Use its real screenshots, logo and colors (Playwright). Never invent its UI.

## Sound
- Score and SFX are synthesized in code (`window.CUES` in the film) unless a track is supplied
  (`--music song.wav`). Measure a supplied track with `python3 scripts/beats.py song.wav > beats.json`.
- Place hits on the beat grid. Loudness -14 LUFS (render.mjs does this).

## Loop before you show me anything
1. `node scripts/render.mjs <film> --stills` renders one frame per beat to `out/stills.png`. LOOK at it.
2. Score it 1-10 on: hook in first 2s, readability at phone size, motion quality, variety,
   brand accuracy, sound sync.
3. Fix the 3 worst problems. Repeat until every score is 8+.
4. Only then do the full render. Then open `out/contact.png` once more.

## Keep it simple
The user may be a beginner. Don't ask them to code or choose tools. Ask at most one short question
(or none if they said "surprise me"), then make the video and reply with the path to `final.mp4`.

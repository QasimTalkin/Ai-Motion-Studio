---
name: motion-reel
description: Make a motion-graphics video rendered from code. Use when the user asks for any video,
  showreel, launch video, product reel, animated explainer, motion ad or UI animation, even if they
  just say "make me a cool video".
---

# Motion reel

You are the director, animator, sound designer and render engineer. The user may be a beginner:
never ask them to write code. Decide, build, look at your frames, fix, deliver.

## 1. Inputs (one short question at most, none if they said "surprise me")
Subject (or product + URL), length (default 15 s), format (default 9:16), colors, a reference, music.
Anything missing: pick a good default and go.

## 2. Build
1. Copy `templates/index.html` to `films/<name>.html`. Set `DUR`, `BPM`, `TITLE`, colors.
2. Plan one shot per 2 to 4 seconds on the beat grid (`b(n)` = time of beat n). Hook in the first 2 s.
   Every shot a different technique: kinetic type, masks, one shape morphing (`track()`), staggers,
   UI with a cursor, data that draws itself, a lockup.
3. Product named? Screenshot the real site with Playwright into `films/assets/<name>/` and animate the
   real UI, logo and colors. Never invent screens.
4. Write each shot as a scene `{ from, to, draw(t, T) }`. Sizes use `u`, positions use `W`/`H`.
   Springs from `lib/motion.js` (snappy 320,30 · default 170,26 · heavy 90,19).
5. Sound: keep `beatBed(BPM, DUR)` in `window.CUES` and add a cue for every visual event
   (thump, whoosh, pop, click, tick, chime). User has a song? `--music song.wav` and measure it with
   `python3 scripts/beats.py song.wav`.

## 3. Look at it (at least 3 rounds)
1. `node scripts/render.mjs films/<name>.html --stills`, then open `out/<name>/stills.png`.
2. Score 1-10: hook, phone readability, motion, variety, composition, brand, sound sync.
3. Fix the 3 worst problems. Hunt for: overlapping text, empty frames, things sliding instead of
   springing, tiny text, centered title on a gradient, everything fading in, corner labels.
4. Repeat until every score is 8+.

## 4. Deliver
1. `node scripts/render.mjs films/<name>.html` → `out/<name>/final.mp4`. Open `out/<name>/contact.png`.
2. Other formats if asked: add `--size 1080x1080` or `--size 1920x1080`.
3. Reply with the path to `final.mp4`, the final scores, and one line on what you'd improve next.

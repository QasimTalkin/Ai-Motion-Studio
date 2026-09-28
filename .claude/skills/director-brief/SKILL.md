---
name: director-brief
description: Interview the user and write a full director's brief for a long or ambitious film (music
  video, story, 45 s+ piece, overnight autonomous run), then run the production with gates and
  subagents. Use when the user wants a flagship film, a music video, a multi-chapter story, or says
  they will leave it running.
---

# Director's brief

They don't describe a video, they hire a crew. Your job: turn a 5-minute conversation into the brief
in `prompts/05-director-brief.md`, then execute it.

## 1. Interview (one message, skip what you already know)
Logline and the feeling at the end · duration and formats · references (video, frames, image library,
prior repo) and what to keep vs push · music (supplied track or synthesize) · characters (proportions,
palette, expressions, identity lock) · text on screen (lyrics huge vs subtitles) · APIs in `.env` and
budget · deadline and whether to continue without waiting.

## 2. Write
`films/<name>/docs/BRIEF.md` (the filled template), `docs/style_guide.md`, `docs/shotlist.md`
(every shot: time range, frames, camera, text, SFX), `docs/ANIMATION_GUIDE.md` (the style contract
for subagents). Show the shot list. If told to continue, wait at most 10 minutes for an answer.

## 3. Produce, with gates (never skip a gate)
plan → stills for every shot (`npm run stills`) + critique → animatic (`npm run film -- --draft`)
and fix pacing → full animation (split chapters across `shot-animator` subagents, each owning a
scene range in `index.html` or a module in `films/<name>/src/`) → polish → sound pass
(`sound-designer` subagent) → final render → `motion-critic` subagent review → fix → deliver.

## 4. Critique loop (every shot, at least 3 rounds)
Score hook, readability at 360 px, motion, composition, depth, sound sync, polish. Log in
`docs/review_log.md`. Fix. Repeat until all are 8+. Write `docs/STORYBOARD.md` after the first pass.

## Deliverables
`out/<fmt>/final.mp4` for every format · `loop_check.mp4` · `poster.png` · `contact.png` ·
`films/<name>/README.md` (logline, how to re-render, what you'd improve next).

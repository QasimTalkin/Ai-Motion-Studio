---
name: critique-pass
description: Critique a rendered film in this studio by looking at its frames, score it, and fix the
  worst problems. Use after npm run stills or npm run film, or when the user says a video looks mid,
  asks for feedback, or asks to polish or improve a film.
---

# Critique pass

Be a harsh motion director, not a proud author. Iteration is the method, not a failure.

1. Make sure the sheets exist: `npm run stills films/<name>` (always), and if a video was rendered,
   `npm run sheets films/<name> -- --at <busiest second>`.
2. Open and LOOK at `out/stills.png`, and if present `out/<fmt>/contact.png`, `strip.png`, `phone.png`.
3. Score 1-10: hook in first 2s · readability at phone size (360 px wide) · motion quality (springs,
   no dead frames) · variety (new thing every 2-4s) · composition · brand accuracy · sound sync.
4. List the 3 biggest problems with timestamps. Hunt specifically for:
   text overlapping during swaps · anything sliding instead of easing · corner labels and frame
   borders · centered-on-gradient shots · blurry scaled text · a dead beat with nothing happening ·
   a stutter at the loop seam · text under 34 units that must be read · two accents fighting.
5. Append the round to `films/<name>/docs/review_log.md` (scores table, problems, fixes).
6. Fix the 3 problems in `index.html`. Re-check with `npm run check`, re-render only affected
   seconds (`npm run render films/<name> -- --from A --to B`) or re-run stills.
7. Repeat until every score is 8+ (3 rounds minimum on a new film). Report the final scores.

For long productions, delegate a round to the `motion-critic` subagent for an independent opinion.

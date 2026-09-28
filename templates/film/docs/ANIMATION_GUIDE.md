# Animation guide

> Brief for every subagent that writes scenes for this film. Read before coding a shot.
> (Pattern from PDoomVideo: write this first so parallel chapters share one style.)

- Stage: `boot()` from `/lib/stage.js`. Draw in stage units: `S.u` = 1px on a 1080-wide canvas.
  Positions from `S.W`, `S.H`, `S.pick({ portrait, square, landscape })`. Never fixed pixels.
- Time: each scene gets local `t` in seconds. Beat n = `S.beat(n)`. Moves start on beats.
- Motion: `spring(t - start, SPRING.<preset>)`. Snappy for UI, heavy for type/logo, default for
  containers/camera, playful only for mascots. Multi-target values use `track()`.
- Text: `S.text(str, x, y, { size, weight, face, color, tracking, alpha })`. Display face for big
  moments only. Minimum 34 units for anything that must be read on a phone.
- Colors: `P.bg`, `P.ink`, `P.dim`, one `P.accent`. No new colors without updating the style guide.
- Randomness: `rng(seed)` or `hash(i, seed)` only. No clocks, timers, CSS animation.
- Hand-off: a scene is done when `npm run check` passes and its stills score 8+ in review_log.md.

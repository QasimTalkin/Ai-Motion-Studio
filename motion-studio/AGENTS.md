# AGENTS.md (10-second version)

This repo makes videos from code. To make one, follow `skills/motion-reel/SKILL.md`.

1. Copy `templates/index.html` to `films/<name>/index.html` and rewrite the scenes.
2. Everything is a pure function of time: `window.seek(t)`. No Math.random, timers or CSS animation.
3. Springs from `lib/motion.js`. One accent color. Something new every 2-4 s. No centered title on a gradient.
4. `node scripts/render.mjs films/<name>/index.html --stills` → look at `out/stills.png`, fix, repeat until it's good.
5. `node scripts/render.mjs films/<name>/index.html` → `films/<name>/out/final.mp4`.

Full rules: `CLAUDE.md`. Ready-made prompts: `prompts/`.

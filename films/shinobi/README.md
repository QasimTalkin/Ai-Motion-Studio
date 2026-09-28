# ShinobiMedia.ca · "The Way of the Shinobi"

A 2:16 brand film for [shinobimedia.ca](https://shinobimedia.ca), rendered from code in 9:16. The layout also reframes to 1:1 and 16:9 on request (`--format 16:9`).

- `index.html`: the film. 11 scenes on a 120 BPM grid (shot list in `docs/shotlist.md`).
- `score.mjs`: the original score (koto, taiko, bamboo flute and a modern kit in D hirajoshi).
  `node films/shinobi/score.mjs` rebuilds `audio/score.wav`.
- `assets/img`: real captures of shinobimedia.ca (2026-09-28) and of the client sites it built,
  taken from the site repo's portfolio images. `assets/fonts`: the site's own Space Grotesk / Geist.
- `docs/`: style guide, shot list, review log with scores per round.

Render: `npm run film films/shinobi` (9:16), or `-- --format 16:9` / `-- --format 1:1`.

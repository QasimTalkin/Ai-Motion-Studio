# Workflow

## Gates
Plan → stills → animatic → full pass → polish → audio → render. Don't skip gates.

| Gate | Command | Look at | Pass when |
|---|---|---|---|
| Plan | `npm run new <name>` | `docs/shotlist.md` | hook in 2 s, new thing every 2-4 s, every shot has technique + SFX |
| Rules | `npm run check <film>` | terminal | no errors (banned APIs, determinism, loop seam) |
| Stills | `npm run stills <film>` | `out/stills.png` | every critique score 8+ |
| Animatic | `npm run film <film> -- --draft` | `out/<fmt>/draft.mp4` | pacing feels right with sound |
| Final | `npm run film <film>` | `out/<fmt>/contact.png`, `phone.png`, `strip.png` | still 8+, no pops, seam clean |

## The critique loop
1. Render one frame per beat as a sheet and LOOK at it.
2. Score 1-10: hook in first 2 s · readability at phone size · motion quality · variety ·
   composition · brand accuracy · sound sync.
3. Fix the 3 worst problems. Log the round in `docs/review_log.md`.
4. Repeat until every score is 8+. Only then do the full render.

`examples/showreel/docs/review_log.md` shows real rounds from building the demo.

## Formats
Write scenes against the stage, not pixels: `S.W`, `S.H`, `S.u` (1 unit = 1 px on a 1080-wide canvas),
`S.pick({ portrait, square, landscape })`. `npm run film` renders every entry of `formats`; reframe type
and UI per format instead of cropping.

## Effort
| Task | Effort |
|---|---|
| small fixes, re-renders, a critique round | medium |
| a new film | xhigh |
| a launch where the first 3 seconds must carry it, a flagship film | max |

## Overnight / long productions
1. Use the `director-brief` skill (or fill `prompts/05-director-brief.md`).
2. The director writes `docs/ANIMATION_GUIDE.md` first, then splits chapters across `shot-animator`
   subagents, then writes `docs/STORYBOARD.md` after the first generation.
3. `motion-critic` reviews each round independently; `sound-designer` owns the sound pass.
4. `.claude/settings.json` pre-approves the studio commands so the run doesn't stall on prompts.

## Turn it into a service
A skill plus a critique loop lets you deliver in an afternoon what cost ~$1,000 a year earlier.
A good offer template: music, a mascot in any style, product features, an offer at the end, any
language, up to 3 edits.

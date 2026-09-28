# UI morph loop: review log

Built from `prompts/04-ui-morph-spec.xml`. Loop seam verified by `npm run check` (diff 0.00).

## Round 1 (stills, 9:16)
| Hook | Phone readability | Motion | Variety | Composition | Brand | Sound sync |
|---|---|---|---|---|---|---|
| 8 | 6 | 9 | 8 | 7 | 8 | 8 |

Problems:
1. Whole film: UI copy (30-38 units) is too small at phone size in 9:16.
2. The canvas around the container feels empty in portrait.
3. None in motion: springs, stretching palette highlight and cursor path read well; seam is clean.

Fixes: stage zoom 1.32 (portrait), 1.12 (square), 1.15 (landscape).

## Round 2 (full render, phone test)
| Hook | Phone readability | Motion | Variety | Composition | Brand | Sound sync |
|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 8 | 8 |

Problems:
1. 5.9 s: the dashboard counter ghosts two numbers ("1,276"): the frame hold rounded down, so 3 of 4 blended
   subframes showed the previous value. Fixed with `frameHold()` (rounds up into the frame's shutter window).
2. Phone test samples land on exact beats and show empty containers mid-swap (content out 0.1 s before the
   morph, in 0.08 s after). That is the spec's swap rule; at 60 fps it reads as a blur, not a dead beat.
3. Poster frame set at the tooltip moment (7.9 s), the most information-dense state.

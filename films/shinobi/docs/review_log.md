# ShinobiMedia.ca: review log

> One entry per critique round. Score 1-10 each, the 3 biggest problems with timestamps, then the fixes.
> Stills sampled per scene with `npm run stills films/shinobi -- --times …` (the default sheet caps at
> 40 frames, too coarse for 136 s), in 9:16 first, then 16:9 and 1:1.

## Round 1 (9:16)
| Hook (first 2s) | Phone readability | Motion | Variety | Composition | Brand | Sound sync |
|---|---|---|---|---|---|---|
| 8 | 5 | 7 | 8 | 5 | 8 | 7 |

Problems:
1. 50-60 s: the services spotlight framed empty space. Tile rects were eyeballed from a thumbnail.
2. 10-22 s: "the usual way" list set at 74 u in 9:16, pinned to the top third with the bottom half empty.
3. 33.0 s: a full second of flat vermilion between the disc flood and the site reveal (dead time).

Fixes:
- Measured the tile rects from the live DOM (Playwright, css px × 5/3 minus the crop offset).
- List type 96 u in 9:16; the camera now keeps whatever is on screen centered, one spring per new line.
- Site circle-reveal starts 0.55 s earlier; scene windows overlap so the flood hands straight over.
- Hook: second headline enters half a beat earlier (no empty frame at 3.2 s); shorter site pill in 9:16 so it reads.

## Round 2 (9:16)
| Hook (first 2s) | Phone readability | Motion | Variety | Composition | Brand | Sound sync |
|---|---|---|---|---|---|---|
| 8 | 7 | 8 | 9 | 7 | 9 | 7 |

Problems:
1. 99-101 s: after the slash, "$2,400" was drawn on top of the surviving half of "$3,000", and the
   "20% UNDER" stamp sat on the TOTAL label.
2. 107.5 s: a blank beat between the quote leaving and the testimonial text arriving.
3. 78 s: the 10-site grid ran off the bottom in 9:16 (2 columns × 5 rows), caption lost.

Fixes:
- Both halves of the old total now leave (top slides up, bottom falls) and fade; ours counts down only
  after they clear; the stamp moved above the total.
- Testimonial timings pulled 1.5 beats earlier; words light from 107.7 s.
- Grid is 3 columns in 9:16 with the last row centered; caption back on screen.
- Prices, promises and testimonial type up one step in 9:16.

## Round 3 (16:9 and 1:1)
| Hook (first 2s) | Phone readability | Motion | Variety | Composition | Brand | Sound sync |
|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 9 | 8 | 9 | 8 |

Problems:
1. 64-75 s (16:9): client names overlapped the bottom of the wall cards.
2. 68.5 s (16:9): cards already passed swung toward the camera and covered the title.
3. 28 s (1:1): the wordmark ran to 2% of the right edge.

Fixes:
- Wall cards 720 u wide in 16:9, wall raised; labels clear.
- Passed cards now slide off left and back instead of toward the lens.
- 1:1 wordmark max width 46% of the frame.
- Draft with sound (`--draft`): mix -14.0 LUFS, true peak -3.9 dBTP; SFX sit ~9 LU under the score
  with their transients on top. Score hits line up with the picture's: slash 1.5 s, disc 22 s, drop and
  slash 98-98.5 s, final hit 130 s.

Every score 8+. Full render next.

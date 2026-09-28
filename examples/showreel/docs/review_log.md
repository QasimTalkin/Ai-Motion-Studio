# Showreel: review log

Real rounds from building this demo with `npm run stills` / `npm run film`.

## Round 1 (stills, 9:16)
| Hook | Phone readability | Motion | Variety | Composition | Brand | Sound sync |
|---|---|---|---|---|---|---|
| 8 | 6 | 7 | 9 | 6 | 8 | 8 |

Problems:
1. 6.25-7.75s: the UI card is too small in 9:16; "render.mjs" and the frame counter don't read at phone size.
2. 12.75-15s: the lockup sits in the top half with the bottom 45% empty, and the mark's spring curve rises so fast it reads as a "⌐" glyph.
3. 10.25s: the flat grid assembling into the sphere reads as noise, not a deliberate move.

Fixes: card group scaled 1.22× in portrait; lockup vertically centered as one group and the curve sampled
over 0.62 s so the overshoot shows; the sphere now assembles from a single line; hook lowered to 0.58 H.

## Round 2 (stills, all formats)
| Hook | Phone readability | Motion | Variety | Composition | Brand | Sound sync |
|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 9 | 8 | 8 | 8 |

Problems:
1. 13.5-15s: tagline and command pill still small for a phone (44 / 38 units).
2. Checked 16:9: reframed, not cropped. Type stack centers as a block in landscape. OK.
3. Suspected missing shape labels in 16:9 at 2.9 s: false alarm, the label is in its 0.1 s swap gap (swapAlpha).

Fixes: tagline 48, pill text 42, pill 420 wide.

## Round 3 (full render, contact + strip)
| Hook | Phone readability | Motion | Variety | Composition | Brand | Sound sync |
|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 9 | 8 | 8 | 9 |

Problems:
1. 8.25-8.75s: the counter's digits change between the 4 blended subframes and smear into ghosted numbers.
2. Same issue, milder, on the "frame n / 900" progress counter.
3. None blocking beyond that; strip at 5 s shows the swap timing clean (no overlapping text).

Fixes: counters hold their value per output frame (`frameHold(t)` in lib/motion.js), so motion blur applies to
movement, not to digits. (A later round caught that the first version rounded down: 3 of 4 subframes still
showed the previous number.)
Final: every score 8+. Next improvement: a supplied track and a real product in shot 4.

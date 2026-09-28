# yourbrand.ca: review log

Real rounds from building this example with `npm run stills` / `npm run film`.

## Round 1 (stills, 9:16 + 16:9)
| Hook | Phone readability | Motion | Variety | Composition | Brand | Sound sync |
|---|---|---|---|---|---|---|
| 8 | 6 | 7 | 8 | 6 | 8 | 8 |

Problems:
1. 15.25-17s (9:16): the metric number at 400 units pushed "days" off the right edge.
2. 13.75-15s: the invoice row that flips to Paid read as a white sliver: low contrast on paper, and drawn
   offset by its own crop origin (a real bug, caught only by looking).
3. 3-6s (9:16): the assembled dashboard sat in the top 75% with the bottom quarter empty; in 16:9 the hook
   type and the reminder/pay cards were undersized.

Fixes: metric size fitted to width; row drawn at its crop origin with a shadow; portrait dashboard gets a
kinetic caption ("Every invoice, one calm screen.") under the stack; 16:9 hook, reminder and pay card enlarged.
Also: `npm run check` failed determinism on the modal frames. The first draw of a lazily decoded image
differs from later draws, so `lib/stage.js` now `decode()`s every image before the first frame.

## Round 2 (spot stills)
| Hook | Phone readability | Motion | Variety | Composition | Brand | Sound sync |
|---|---|---|---|---|---|---|
| 8 | 7 | 8 | 9 | 8 | 9 | 8 |

Problems:
1. 1.2-2.75s (16:9): "late." clipped the right edge. The fit measured the line in Inter, but "late." is set in the narrower serif.
2. 6.8s (9:16): the dashboard caption peeked out under the dimmed dialog.
3. 14.8s: the row crop cut the client name ("rthbeam Coffee").

Fixes: fit to 0.86 W; caption leaves before the dialog opens (`swapAlpha`); row crop widened to client · amount · status.

## Round 3 (full render, contact + phone, both formats)
| Hook | Phone readability | Motion | Variety | Composition | Brand | Sound sync |
|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 9 | 8 | 9 | 8 |

Remaining, not blocking: in 16:9 the full desktop dashboard (shot 2) is small text by nature. It reads as a
product, not as copy. The Paid row in shot 5 is the smallest UI in the film.
Next improvement: a tighter camera move onto the Paid pill as it flips, and a supplied track.

# Critique pass

Opus reads images, so it can look at what it rendered. This habit separates the clips that went
viral from the ones posted with "it's a bit mid". Run it after `npm run stills` (before a full
render) and after `npm run film` (on the sheets).

```
Open films/[name]/out/stills.png (and out/<format>/contact.png, strip.png, phone.png if they exist)
and look at them properly. Be a harsh motion director, not a proud author.

Score 1-10: hook in first 2s · readability at phone size · motion quality (springs,
no dead frames) · variety (new thing every 2-4s) · composition · brand accuracy · sound sync.

List the 3 biggest problems with timestamps. Hunt specifically for: text overlapping during
swaps, anything sliding instead of easing, corner labels and frame borders, centered-on-gradient
shots, blurry scaled text, a dead beat with nothing happening, a stutter at the loop seam.

Log scores and problems in films/[name]/docs/review_log.md.
Fix them, re-render only the affected seconds (npm run render films/[name] -- --from A --to B),
show me the new stills and new scores. Repeat until every score is 8+.
```

## The sheets, by hand (what `npm run sheets` runs)

```
# Contact sheet: 2 frames per second, 6 across
ffmpeg -i out/final.mp4 -vf "fps=2,scale=270:-1,tile=6x5" -frames:v 1 out/contact.png
# Strip: 12 consecutive frames around a fast action at 4.2s (catch pops and overlaps)
ffmpeg -ss 4.1 -i out/final.mp4 -vf "scale=320:-1,tile=12x1" -frames:v 1 out/strip.png
# Phone test: how it reads at 360 px wide
ffmpeg -i out/final.mp4 -vf "fps=1,scale=360:-1,tile=5x3" -frames:v 1 out/phone.png
# Loop check: play it twice back to back and watch the seam
ffmpeg -stream_loop 1 -i out/final.mp4 -c copy out/loop_check.mp4
```

Determinism (frames rendered twice must hash the same) is checked by `npm run check`.

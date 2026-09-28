# L1 · The one-liner showreel

Four of the nine posts that defined the trend used this exact sentence. Use it to test your setup,
then move on: hundreds of identical prompts produced reels that rhyme with each other
("brief contagion").

```
make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are,
like it's your showreel for a résumé. go all out.
```

Why it works:
- **"showreel for a résumé"** sets a genre with known rules: fast cuts, a new technique every shot,
  the best work first. The model already knows what a reel looks like.
- **"what an incredible motion designer you are"** makes the model the subject, so it shows
  techniques instead of explaining a product. No content to get wrong.
- **"15-second"** is short enough to finish in one pass and long enough for 6 to 8 shots.
- **"go all out"** works as an effort multiplier on top of xhigh or max.

In this repo, add one line so it lands in the pipeline:

```
Scaffold it with npm run new showreel -- --dur 15, follow CLAUDE.md, and run the critique loop before the final render.
```

## Variants that shipped and worked

```
# Longer, with a sound bar (pattern from @kloss_xyz's 90-second piano reel)
make a dynamic 16:9, 60-second motion graphics showreel that shows your real creative limits.
S-tier sound design, no generic synth pads. Compose an original piano score and sync every
cut to it. Export 1080p MP4.
```

```
# Anti-slop guardrail (pattern from @1littlecoder)
make a dynamic 10-second motion graphics video that introduces who you are as Opus 5.5.
Avoid frames and text in the corners, the usual giveaways of AI-made video.
```

```
# Story instead of techniques (pattern from @sonnylazuardi)
use your showreel energy, but tell a story: the history of [TOPIC] from [START] to today,
surprise me with the storyboard. 45 seconds, vertical 9:16.
```

```
# Agency persona
make a 30-second showreel as if you were a niche branding studio for startup founders.
Create every graphic from scratch. One accent color. Every shot is a different technique.
```

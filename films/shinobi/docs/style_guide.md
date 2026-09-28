# ShinobiMedia.ca: style guide

Source: the live site (shinobimedia.ca, captured 2026-09-28) and its design tokens in
`shinobi-media-web/client/src/index.css`. The brand overrides the house faces and palette.

## Palette (hex), the site's own tokens
- Ground: #0a0d10 (surface-0), panels #161b21 / #1f262e, rules rgba(237,241,245,.085)
- Ink: #edf1f5 · Dim: #a9b4bf · Muted: #8592a0
- Accent (one): vermilion #e2564e (fills), #ec6a5e (accent text), #a33530 (deep, for shade only)

## Type (the site's faces, self-hosted from the site repo)
- Display: Space Grotesk 700, tracking -0.03em. Headlines, prices, big moments.
- UI: Geist 400/500/600. Body, captions, card copy.
- Mono: Geist Mono 400/500, uppercase tracked +0.12em for tags (the site's pill/eyebrow style).

## Motifs
- The katana cut: one vermilion diagonal line that slices the frame; the halves separate along it.
  Used for the hook and for the big turns (old way → shinobi, quote → our price). Never more than 4 times.
- The shuriken: the four-point star from the wordmark. It pins the "old way" lines and lands the lockup.
- The hinomaru: a vermilion disc the mascot rises into. Once.

## Pacing
- 120 BPM, bar = 2 s. Something new every 2-4 beats. Scenes change on bar lines.
- Transitions: cut along the slash, disc wipe, browser → phone morph, push. No crossfades.
- Text rises out of a mask slot on a critically damped spring and leaves before the next move.

## Camera
- Slow push on every hold, handheld drift via noise() at ≤4 px. Big moves land on downbeats.

## Texture
- Flat slate ground with a faint 64 px grid (the site's hero grid) and a soft vermilion corner bloom like
  the site header. No glows on UI chrome.

## Banned for this film
- Centered title on gradient, everything fading in, corner labels, frame borders, particle bursts,
  invented screens (every UI shown is a real capture of shinobimedia.ca or a client site it built).

# Beginner: just ask

You don't need to know anything about code. Open Claude Code in this folder and say one of these.
The `motion-reel` skill and `CLAUDE.md` do the rest: plan, build, critique its own frames, render.

```
Use the motion studio to make a 15-second vertical video about my coffee shop "Northbound".
Warm, calm, one accent color. Surprise me.
```

```
Make a 20-second launch video for https://example.com. Use the real screenshots and logo.
Vertical first, then square and landscape.
```

```
Make a 30-second story video about the history of the bicycle, 1817 to today. 9:16, piano score.
```

```
Look at ./films/my-film/out/stills.png, tell me what's weak, fix it and re-render.
```

What you get back: `films/<name>/out/<format>/final.mp4` for every format, a contact sheet, a phone
test, a poster frame, and the scores from the critique loop in `films/<name>/docs/review_log.md`.

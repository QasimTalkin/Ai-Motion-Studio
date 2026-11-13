# French explainer films (WIP): source only

Four films live here as code: `recherche-demo` (30 s), `recherche-script1`, `recherche-script2` and
`recherche-script3`. Each one has `index.html`, `js/`, `audio/script.json` (narration and subtitles),
`audio/timing.json` (word timings) and `docs/` (shot list, script for review, review log).

This branch does not include anything that can be generated again: renders (`out/`), the voice track
(`audio/voice.wav`) and cached voice clips (`audio/vo/`).

To rebuild a film:

```bash
npm install
npm run tts films/recherche-script3                  # needs GOOGLE_TTS_API_KEY in .env, rewrites audio/voice.wav + timing.json
node films/recherche-script3/audio/envelope.mjs     # script 3 only: voice loudness → audio/env.json
npm run check films/recherche-script3
npm run stills films/recherche-script3              # contact sheet → out/stills.png
npm run film films/recherche-script3                # → out/9x16/final.mp4 and out/16x9/final.mp4
```

Pictures render without a voice track, because the timings are committed. Re-running `tts` can move the word
timings slightly; if it does, check the stills before the full render.

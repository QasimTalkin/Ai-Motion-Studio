# L2 · Name a look, feed a frame

Without a reference the model falls back to its default: centered text, gradient background,
everything fading in. Naming a style beats describing one, and a reference gives the model pacing,
type and transitions to copy.

- **A frame:** screenshot one frame of a video you love into `films/[name]/refs/`. Say what to take
  (palette, type, grain) and what not to take (subject).
- **A video:** give the file or link; have it extract frames and describe pacing shot by shot first.
- **A library:** a folder of your images or past work. Ask for a style guide from it first.
  Your own library is a reference nobody else can copy.
- Sources: whatships.com (launch videos), Dribbble motion, your competitors' launch films.

```
Reference: films/[name]/refs/launch.mp4 (and films/[name]/refs/frames/*.png)

1. Extract one frame every 0.5s with ffmpeg. Study them.
2. Write films/[name]/docs/style_guide.md: palette (hex), type (family, weight, tracking),
   shot lengths, transition types, camera moves, texture/grain, how text enters and exits.
3. Write films/[name]/docs/shotlist.md for a [DURATION]s video about [SUBJECT] in THAT style.
   Take the grammar of the reference, never its content, logos or characters.
4. Show me both files. Wait for my OK before any code.
```

Frame extraction (ffmpeg ships with this repo via ffmpeg-static):

```
node -e "console.log(require('ffmpeg-static'))"      # path to the bundled ffmpeg
<ffmpeg> -i refs/launch.mp4 -vf fps=2 refs/frames/%03d.png
```

When you give a reference, let the model pick the technique. Specify the look and the constraints,
not the library, unless you need a specific framework for reuse.

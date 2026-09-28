# Route B · Frameworks (Remotion, HyperFrames)

This repo is route A: zero dependencies beyond a browser, one `index.html`, a `seek(t)` function,
frame-by-frame capture, ffmpeg. It's what Opus picks by default, even when frameworks are available.
If you want a framework, say so explicitly.

```
# Remotion (React): best for series, templates, data-driven videos
npx create-video@latest launch-film && cd launch-film
npx skills add remotion-dev/skills
claude
> /remotion-create a 20s 9:16 launch film for [PRODUCT], springs only, one accent color
npx remotion studio                 # live timeline preview
npx remotion render Main out/launch.mp4
```

```
# HyperFrames (HTML + GSAP): best when you think in web pages
npx hyperframes init my-video && cd my-video
npx hyperframes skills update
claude
> Using /hyperframes, turn ./notes.md into a 45-second pitch video with kinetic captions
npx hyperframes preview && npx hyperframes render
```

```
# Hand-drawn look: Node canvas rigs, pens, synthesized sound
claude plugin marketplace add buildwithhanif/claude-animation-skill
claude plugin install claude-animation@claude-animation-skill
```

The rest of this repo still applies on route B: the critique prompt, the sheets (`npm run sheets`
works on any MP4 you drop into `films/<name>/out/<format>/final.mp4`), the sound synth and the
director's brief.

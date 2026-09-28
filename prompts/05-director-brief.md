# L4 · The director's brief (overnight run)

Donald dictated for five minutes, went to sleep, and woke up to a 142-second music video
(~9,500-character brief). The "Pip" robot film used 19,000 characters. They don't describe a video,
they hire a crew. Fill in the brackets, delete what you don't need, and start Claude Code at max effort.
The `director-brief` skill interviews you and writes this for you if you'd rather talk.

```
You are the director, animator, sound designer and render engineer for a [DURATION] film
made in code. Treat this as a multi-session production. Don't rush to a final render.
Work in films/[name] (npm run new [name] -- --dur [SECONDS]). House rules: CLAUDE.md.

## The film in one line
[LOGLINE. What the viewer should feel at the end.]

## References and inputs
- films/[name]/refs/ : [video / frames / image library]. Take the grammar, never the content.
- films/[name]/audio/track.wav : use it unchanged. Measure beats with studio/beats.py first.
- Skills available: [/motion-reel | /critique-pass | /remotion-best-practices | /hyperframes | /claude-animation].
- APIs in .env: [ELEVENLABS_API_KEY, FAL_KEY]. Budget: [$X]. Be economical.

## Look
[3-5 lines: palette, type, texture, camera language. Banned looks.]

## Character bible (if any)
[Proportions, palette sampled from a sheet, expressions, an identity lock that survives every style change.]

## Beat sheet
0:00-0:02  hook: [the single most striking image]
0:02-0:10  [act 1]
...        a new visual payoff every 3-5 seconds
[END]      the last frame sets up the first frame (loop)

## Text on screen
[When lyrics or captions go huge, when they sit like subtitles. Composition leaves room for them.]

## Workflow, with gates
1. Write docs/style_guide.md and docs/shotlist.md (every shot: frames, camera, text, SFX).
   Show me the shot list. Then continue without waiting if I don't answer in 10 minutes.
2. Build stills for every shot (npm run stills). Contact sheet. Critique.
3. Animatic at 960x540 with placeholder audio (npm run film -- --draft). Fix pacing before polish.
4. Full animation, polish pass, sound pass, final render (npm run film).
5. Split work across subagents per chapter (shot-animator). Write docs/ANIMATION_GUIDE.md first
   so every subagent codes in the same style. Write docs/STORYBOARD.md after the first pass.

## Critique loop (every shot, at least 3 rounds)
Render 3-5 stills, score 1-10 on: hook, readability at 360px wide, motion, composition,
depth, sound sync, polish. Log scores + 3 biggest problems in docs/review_log.md. Fix. Repeat
until all are 8+. Use the motion-critic subagent for a second opinion.

## Deliverables
out/<format>/final.mp4 · out/<format>/loop_check.mp4 · out/<format>/poster.png · out/<format>/contact.png · README.md
```

## Generate-then-trace (optional, needs an image/video API)

The key move in Donald's brief: a video model renders base shots with characters and physics, then
the model redraws the whole video in JavaScript on top, so the viewer only sees the code-drawn layer.
Video models give motion that's hard to hand-code; the JS layer gives a consistent, ownable look.

```
For shots [N-M], generate base clips with the video API (FAL_KEY in .env), extract frames to
films/[name]/refs/base/, and trace them in code: the viewer must only ever see the JS layer.
```

# L2 · Point the reel at your product

Tony Dinh paid over $1,000 for a similar launch video a year earlier; this took under 30 minutes.
Three extra lines did it: the product URL, "use actual product screenshot, logo, assets", and
"must have music". Keep one session per brand: the second video is faster because the renderer,
audio synth and export pipeline already exist.

```
Make a dynamic 20-second motion graphics video for [PRODUCT] ([URL]), with the energy
of a motion designer's showreel. Go all out. Scaffold it with npm run new [name] -- --dur 20.

Assets
- Visit the site. Use real screenshots (Playwright), the real logo, real colors and fonts.
  Save everything to films/[name]/assets and list what you found before you animate.
- Never redraw the product UI from imagination. Crop and animate the real thing.

Story (one beat each, 2 to 4 seconds)
1. Hook: the problem in 5 words of huge kinetic type.
2. The product appears, the UI assembles itself piece by piece.
3. Three features, each as a UI moment with a cursor doing a real action.
4. One number that proves it works: [METRIC].
5. Logo lockup + [CTA].

Sound
- Original music, 120 BPM, synthesized in code. UI clicks and whooshes on the beat.

Format: 1080x1920 (9:16) and 1920x1080 (16:9) from the same timeline.
Before the full render, show me a contact sheet of one frame per beat (npm run stills).
```

## Upgrade: a talking character (pattern from @achxvi's Pocketsflow film)

Add to the prompt:

```
Add a mascot character who explains the product in 3 short lines. Voice it with ElevenLabs:
the key is ELEVENLABS_API_KEY in .env. Save the voice lines to films/[name]/audio/vo_*.mp3,
place them on the timeline, and duck the music under the voice.
```

Put the key in `.env`, never in a prompt you'll screenshot.

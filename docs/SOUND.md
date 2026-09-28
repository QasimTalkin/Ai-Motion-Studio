# Sound

Sound is where "AI video" starts feeling like a film. Two paths: if you supply a track, measure it;
if you don't, synthesize it on the same timeline as the picture.

## Synthesized (default)
`music: { style, key, seed, intro, breaks, end, gain, volume }` in `boot()`.

| Style | Feel | Built from |
|---|---|---|
| `pulse` | launch, showreel, energy | four-on-the-floor kick, claps on 2 and 4, offbeat hats, plucked bass, piano stabs, 8th-note arp in the second half, sidechain ducking |
| `piano` | story, brand film, emotion | felt-piano arpeggios, sub bass, soft kick on 1 |
| `minimal` | UI morphs, product films | sub kick, clicks, single plucked motif |

The progression is i-VI-III-VII in the chosen minor key. `end` is the time of the final hit: kick,
full chord and sub ring out, drums stop. `breaks: [3]` drops drums for bar 3 (before a reveal).

## Supplied track
```js
music: { file: 'audio/track.wav', start: 12.0 }   // start = offset into the track
```
`npm run audio` converts it unchanged, and if numpy + librosa are installed runs `studio/beats.py`
into `out/beats.json` (`bpm`, `beats`, `downbeats`, `hits`). Copy the BPM and first downbeat into
`bpm` / `beatOffset` so `S.beat(n)` matches the track, and put SFX on `hits`.

## SFX cues
`cues: [{ t, type, gain }]`, or a function of the stage: `cues: (S) => [{ t: S.beat(8), type: 'whoosh' }]`.

| Voice | Use |
|---|---|
| `click` | UI click, cursor press |
| `pop` | element appears, bubble, sticker |
| `thump` | hook, heavy type landing |
| `whoosh` | transitions, camera moves |
| `swipe` | short wipe, card slide |
| `tick` | stagger items, counters (vary pitch per index automatically) |
| `type` | keystrokes |
| `riser` | builds into a moment: it ENDS at `t` |
| `impact` | reveal, logo lockup |
| `chime` | success, completion |
| `glitch` | digital stutter |

## Mix
`studio/audio.mjs` mixes music + SFX, fades out the last 0.4 s (unless `loop`), and runs a two-pass
EBU R128 loudnorm to **-14 LUFS integrated, -1 dBTP**. Voice-over files (e.g. from ElevenLabs) can
be added as a supplied track or mixed in with a small edit to `audio.mjs`.

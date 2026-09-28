# Prompt library

Every prompt from the course, ready to paste into Claude Code inside this repo. The house rules in
`CLAUDE.md` are already loaded on every run, so none of these prompts repeat them.

| Level | You have | Use | Effort |
|---|---|---|---|
| L0 | Nothing, just want a video | [`00-beginner.md`](00-beginner.md) | xhigh |
| L1 | Want to test the setup | [`01-showreel-one-liner.md`](01-showreel-one-liner.md) | xhigh / max |
| L2 | A product + URL | [`02-brand-reel.md`](02-brand-reel.md) | xhigh |
| L2 | A look you love (frame, video, library) | [`03-reference.md`](03-reference.md) | xhigh |
| L3 | A product story as UI states | [`04-ui-morph-spec.xml`](04-ui-morph-spec.xml) | xhigh / max |
| L4 | A film, a night, a budget | [`05-director-brief.md`](05-director-brief.md) | max |
| any | A render to judge | [`06-critique-pass.md`](06-critique-pass.md) | medium / xhigh |
| any | Motion that feels cheap | [`07-spring-refactor.md`](07-spring-refactor.md) | medium |
| any | You want Remotion / HyperFrames | [`08-frameworks-route-b.md`](08-frameworks-route-b.md) | xhigh |

Rules of thumb from the course:
- A one-liner tests the engine. It never tests the idea, because it doesn't contain one.
- Naming a style beats describing one. A reference frame beats both.
- Write the state list, not the vibe.
- Iteration is the method, not a failure. Make the model watch its own frames.
- Keep one Claude session per brand: the renderer, synth and export already exist the second time.
- API keys live in `.env`. Say "the ElevenLabs key is ELEVENLABS_API_KEY in .env". Never paste a key.

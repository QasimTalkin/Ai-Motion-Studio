# Prompt gallery

Copy a file, paste it into Claude Code / Cursor / Codex inside this folder, fill in the [brackets].

| Prompt | Use it when | What you get | Effort |
|---|---|---|---|
| [showreel.txt](showreel.txt) | you just want to see what it can do | 15 s showreel, every shot a new technique, with sound | xhigh |
| [product-reel.txt](product-reel.txt) | you have a product and a URL | 20 s launch video with your real screenshots and logo | xhigh |
| [ui-morph.txt](ui-morph.txt) | your product is an app | one shape morphing through your UI, a perfect loop | xhigh / max |
| [reference-style.txt](reference-style.txt) | you love the look of another video | a style guide + shot list in that style, then the video | xhigh |
| [director-brief.txt](director-brief.txt) | you want a long film and can wait (even overnight) | a 30 s to 3 min film, planned, critiqued, polished | max |
| [critique.txt](critique.txt) | a video looks "mid" | scores, the 3 worst problems, fixed | medium |

Tips from the course:
- A one-liner tests the engine. It never tests the idea, because it doesn't contain one.
- Naming a style beats describing one. A reference frame beats both.
- Iteration is the method. Make the model look at its own frames.
- Put API keys in `.env` and refer to them by name. Never paste a key into a prompt.

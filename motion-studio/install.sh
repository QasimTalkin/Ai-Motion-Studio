#!/usr/bin/env bash
# One-command setup:  ./install.sh
# Installs Node (via Homebrew on macOS), Playwright + Chromium, ffmpeg, and the Python beat detector.
# Safe to run again: every step is skipped when it's already done.
set -e
cd "$(dirname "$0")"
step() { printf "\n\033[1m→ %s\033[0m\n" "$1"; }

step "Node.js"
if ! command -v node >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then brew install node
  else echo "Please install Node.js 20+ from https://nodejs.org, then run ./install.sh again."; exit 1; fi
fi
node -v

step "Playwright + headless Chromium"
npm install --no-audit --no-fund
node -e "require('playwright').chromium.launch().then(b => b.close())" 2>/dev/null \
  && echo "Chromium ready" || npx playwright install chromium

step "ffmpeg"
if command -v ffmpeg >/dev/null 2>&1; then echo "using $(command -v ffmpeg)"
elif command -v brew >/dev/null 2>&1; then brew install ffmpeg
else npm install --no-save --no-audit --no-fund ffmpeg-static && echo "using the bundled ffmpeg"; fi

step "Beat detection (optional: only for music files you bring)"
if command -v python3 >/dev/null 2>&1 && python3 -m pip install --user --quiet numpy librosa soundfile 2>/dev/null; then
  echo "librosa ready"
else
  echo "skipped (videos work without it; to measure your own songs: pip install numpy librosa soundfile)"
fi

printf "\n\033[1m✓ Ready.\033[0m Try:  make demo\n"
printf "Then open Claude Code, Cursor or Codex in this folder and say:\n"
printf "  \"make me a cool 15-second motion design video\"\n\n"

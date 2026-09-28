// npm run doctor — is this machine ready to make films?
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ffmpeg, ROOT } from './common.mjs';

const ok = (m) => console.log(`  ✓ ${m}`), bad = (m) => console.log(`  ✖ ${m}`), meh = (m) => console.log(`  · ${m}`);
let fails = 0;
console.log('\nAI Motion Studio doctor\n');

const major = Number(process.versions.node.split('.')[0]);
major >= 20 ? ok(`Node ${process.versions.node}`) : (fails++, bad(`Node ${process.versions.node} — need 20+ (22 recommended)`));

const ff = spawnSync(ffmpeg(), ['-hide_banner', '-encoders'], { encoding: 'utf8' });
if (ff.status === 0 && ff.stdout.includes('libx264')) ok(`ffmpeg with libx264 (${ffmpeg()})`);
else { fails++; bad('ffmpeg with libx264 not found — run npm install (ffmpeg-static) or install ffmpeg'); }

try {
  const { chromium } = await import('playwright');
  const b = await chromium.launch(); await b.close();
  ok('headless Chromium (Playwright)');
} catch (e) { fails++; bad(`headless Chromium — run: npx playwright install chromium (${e.message.split('\n')[0]})`); }

existsSync(join(ROOT, 'node_modules', '@fontsource', 'inter')) ? ok('house fonts (Fontsource)') : (fails++, bad('fonts missing — run npm install'));

const py = spawnSync(process.platform === 'win32' ? 'python' : 'python3', ['-c', 'import numpy, librosa; print(librosa.__version__)'], { encoding: 'utf8' });
py.status === 0 ? ok(`librosa ${py.stdout.trim()} (beat measurement for supplied tracks)`)
  : meh('optional: pip install numpy librosa soundfile — only needed to measure a supplied music track');

const env = join(ROOT, '.env');
if (existsSync(env)) {
  const keys = readFileSync(env, 'utf8').split('\n').filter((l) => /^\w+=\S/.test(l)).map((l) => l.split('=')[0]);
  keys.length ? ok(`.env keys: ${keys.join(', ')}`) : meh('.env present but empty (optional)');
} else meh('optional: cp .env.example .env for ElevenLabs / fal keys');

console.log(fails ? `\n${fails} problem(s). Fix them, then run npm run doctor again.\n` : '\nReady. Try: npm run demo\n');
process.exit(fails ? 1 : 0);

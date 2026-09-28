// Installs the headless Chromium that Playwright drives, unless the machine already provides one.
import { spawnSync } from 'node:child_process';

if (process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD || process.env.CI) process.exit(0);
const r = spawnSync('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit', shell: process.platform === 'win32' });
if (r.status !== 0) console.warn('\n[ai-motion-studio] Could not install Chromium automatically. Run: npx playwright install chromium\n');

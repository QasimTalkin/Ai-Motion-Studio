// Shared plumbing for the studio scripts: args, film lookup, static server, browser, ffmpeg.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, extname, resolve, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

export const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

// argv -> { _: [positionals], key: value | true }. Numbers are converted.
export function args(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const [k, inline] = a.slice(2).split('=');
    const next = inline ?? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true);
    out[k] = next !== true && next !== '' && !isNaN(next) ? Number(next) : next;
  }
  return out;
}

// "showreel" | "examples/showreel" | "films/launch" | absolute path -> absolute film dir
export function findFilm(name) {
  if (!name) fail('Which film? e.g. npm run film examples/showreel');
  for (const c of [resolve(name), join(ROOT, name), join(ROOT, 'films', name), join(ROOT, 'examples', name)])
    if (existsSync(join(c, 'index.html'))) return c;
  fail(`No film found for "${name}" (looked for index.html in films/ and examples/).`);
}

export const fmtDir = (format) => format.replace(':', 'x');

export function fail(msg) { console.error(`\n✖ ${msg}\n`); process.exit(1); }

let ffmpegBin;
export function ffmpeg() {
  if (ffmpegBin) return ffmpegBin;
  if (process.env.FFMPEG_PATH) return (ffmpegBin = process.env.FFMPEG_PATH);
  try { ffmpegBin = createRequire(import.meta.url)('ffmpeg-static'); } catch { /* fall through */ }
  return (ffmpegBin ||= 'ffmpeg');
}

// Run a command, resolve with stdout+stderr text, reject on non-zero exit.
export function run(cmd, argv, { quiet = true } = {}) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, argv, { stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    p.stdout.on('data', (d) => { log += d; if (!quiet) process.stdout.write(d); });
    p.stderr.on('data', (d) => { log += d; if (!quiet) process.stderr.write(d); });
    p.on('error', rej);
    p.on('close', (code) => (code === 0 ? res(log) : rej(new Error(`${cmd} exited ${code}\n${log.slice(-2000)}`))));
  });
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.gif': 'image/gif', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.wav': 'audio/wav', '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4', '.txt': 'text/plain', '.md': 'text/plain',
};

// Static server rooted at the repo, so films can import '/lib/motion.js' and '/lib/fonts.css'.
export function serve(port = 0) {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = join(ROOT, path);
    if (!file.startsWith(ROOT + sep) && file !== ROOT) { res.writeHead(403).end(); return; }
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(body);
    } catch { res.writeHead(404).end('not found'); }
  });
  return new Promise((res) => server.listen(port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${server.address().port}`;
    res({ url, server, close: () => new Promise((r) => server.close(r)) });
  }));
}

export const filmUrl = (base, dir, query = {}) =>
  `${base}/${relative(ROOT, dir).split(sep).join('/')}/index.html?` + new URLSearchParams(query);

export async function launch() {
  const { chromium } = await import('playwright');
  try {
    return await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none'] });
  } catch (e) {
    fail(`Could not start headless Chromium. Run: npx playwright install chromium\n${e.message.split('\n')[0]}`);
  }
}

// Open a film page for one format and wait until fonts and images are loaded.
export async function openFilm(browser, base, dir, { format, scale = 1 } = {}) {
  const page = await browser.newPage({ viewport: { width: 400, height: 400 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const q = { render: 1, scale };
  if (format) q.format = format;
  await page.goto(filmUrl(base, dir, q));
  const ok = await page.waitForFunction(() => window.__studio?.ready, null, { timeout: 30000 }).catch(() => null);
  if (!ok) fail(`Film did not boot. Page errors:\n${errors.join('\n') || '(none) - does index.html call boot()?'}`);
  await page.evaluate(() => window.__studio.ready);
  const meta = await page.evaluate(() => window.__studio.meta);
  return { page, meta, errors };
}

// seek(t) then grab the canvas as PNG in one round trip.
export async function frame(page, t) {
  const b64 = await page.evaluate((t) => {
    window.seek(t);
    return document.getElementById('c').toDataURL('image/png').slice(22);
  }, t);
  return Buffer.from(b64, 'base64');
}

export async function filmMeta(dir) {
  const { url, close } = await serve();
  const browser = await launch();
  const { meta } = await openFilm(browser, url, dir);
  await browser.close(); await close();
  return meta;
}

// True when the calling module is the script node was started with.
export const isMain = (metaUrl) => metaUrl === pathToFileURL(process.argv[1] || '').href;

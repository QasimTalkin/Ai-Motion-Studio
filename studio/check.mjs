// npm run check <film>
// The house rules as code. Fails (exit 1) on errors, prints warnings for taste problems.
//   1. Lint: banned APIs in the film source (clocks, timers, Math.random, CSS transitions, will-change)
//   2. Determinism: frames rendered in shuffled order twice must hash identically
//   3. Loop seam: for loop films, seek(dur) must equal seek(0) and the last frame must be close to it
//   4. Dead time: warns when nothing changes on screen for 2 s or more
//   5. Sound: cues outside the film, unknown SFX voices
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { args, findFilm, serve, launch, openFilm, frame, isMain, ROOT } from './common.mjs';
import { VOICES } from './sfx.mjs';

const BANNED = [
  [/Math\.random\s*\(/, 'Math.random - use rng(seed) or hash() from /lib/motion.js'],
  [/\bsetTimeout\s*\(|\bsetInterval\s*\(/, 'timers - animation must be a pure function of t'],
  [/requestAnimationFrame\s*\(/, 'requestAnimationFrame - stage.js owns the preview loop'],
  [/Date\.now\s*\(|performance\.now\s*\(|new Date\s*\(/, 'wall clock - use the t passed to draw()'],
  [/transition\s*:/, 'CSS transition - not seekable'],
  [/@keyframes|animation\s*:/, 'CSS animation - not seekable'],
  [/will-change/, 'will-change - blurry text when scaled'],
];

function* sources(dir) {
  for (const f of readdirSync(dir)) {
    if (['out', 'assets', 'refs', 'node_modules', 'docs', 'audio'].includes(f)) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) yield* sources(p);
    else if (/\.(html|js|mjs|css)$/.test(f)) yield p;
  }
}

export async function check(dir, { quiet = false } = {}) {
  const errors = [], warns = [];
  const log = (...m) => { if (!quiet) console.log(...m); };

  for (const file of sources(dir)) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      const code = line.replace(/\/\/.*$/, '');
      for (const [re, why] of BANNED) if (re.test(code)) errors.push(`${relative(ROOT, file)}:${i + 1}  ${why}`);
    });
  }

  const { url, close } = await serve();
  const browser = await launch();
  const { page, meta, errors: pageErrors } = await openFilm(browser, url, dir, { scale: 0.25 });
  const { dur } = meta;
  const hashOf = async (t) => createHash('md5').update(await frame(page, t)).digest('hex');

  // Determinism: forward pass vs shuffled pass
  const times = Array.from({ length: 16 }, (_, i) => Math.round((dur * (i + 0.5) / 16) * 1000) / 1000);
  const fwd = {};
  for (const t of times) fwd[t] = await hashOf(t);
  const shuffled = times.map((t, i) => [t, (i * 7919) % 16]).sort((a, b) => a[1] - b[1]).map(([t]) => t);
  for (const t of shuffled) if ((await hashOf(t)) !== fwd[t]) errors.push(`not deterministic at t=${t}s (frame depends on render order or a clock)`);

  const fontStatus = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'error').map((f) => f.family));
  if (fontStatus.length) errors.push(`fonts failed to load: ${[...new Set(fontStatus)].join(', ')}`);
  for (const e of pageErrors) errors.push(`page error: ${e}`);

  // Pixel difference between two times, 0..255 mean per channel
  const diff = (a, b) => page.evaluate(([a, b]) => {
    const c = document.getElementById('c'), g = c.getContext('2d', { willReadFrequently: true });
    window.seek(a); const A = g.getImageData(0, 0, c.width, c.height).data;
    window.seek(b); const B = g.getImageData(0, 0, c.width, c.height).data;
    let s = 0; for (let i = 0; i < A.length; i += 4) s += Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]);
    return s / (A.length / 4 * 3);
  }, [a, b]);

  if (meta.loop) {
    const wrap = await diff(0, dur), seam = await diff(0, dur - 1 / 60);
    if (wrap > 0.01) errors.push(`loop: seek(${dur}) != seek(0) (diff ${wrap.toFixed(2)}) - wrap time with loopT(t, DUR)`);
    if (seam > 2.5) warns.push(`loop seam jumps: last frame vs first differ by ${seam.toFixed(2)} - pin the end state to the start`);
    else log(`  ✓ loop seam (diff ${seam.toFixed(2)})`);
  }

  // Dead time: nothing moving for >= 2 s
  const step = 0.25, still = [];
  for (let t = 0; t + step <= dur; t += step) still.push((await diff(t, t + step)) < 0.05);
  let run = 0;
  for (let i = 0; i <= still.length; i++) {
    if (still[i]) { run++; continue; }
    if (run * step >= 2) warns.push(`dead time ${((i - run) * step).toFixed(2)}s-${(i * step).toFixed(2)}s: nothing moves for ${(run * step).toFixed(2)}s`);
    run = 0;
  }

  for (const c of meta.cues) {
    if (!VOICES[c.type]) errors.push(`cue at ${c.t}s: unknown sfx "${c.type}"`);
    if (c.t < 0 || c.t > dur) warns.push(`cue at ${c.t}s is outside the film (0-${dur}s)`);
  }

  const claude = join(ROOT, 'CLAUDE.md'), agents = join(ROOT, 'AGENTS.md');
  if (existsSync(claude) && existsSync(agents)) {
    const body = (f) => readFileSync(f, 'utf8').split('\n').filter((l) => !/^(#|>)/.test(l) && l.trim()).join('\n');
    if (body(claude) !== body(agents)) warns.push('AGENTS.md has drifted from CLAUDE.md - copy the rules across');
  }

  await browser.close(); await close();
  log(`  ✓ ${times.length * 2} frames rendered for determinism`);
  for (const w of warns) log(`  ! ${w}`);
  for (const e of errors) log(`  ✖ ${e}`);
  log(errors.length ? `\n  check failed: ${errors.length} error(s)` : `  ✓ check passed${warns.length ? ` with ${warns.length} warning(s)` : ''}`);
  return { errors, warns };
}

if (isMain(import.meta.url)) {
  const { errors } = await check(findFilm(args()._[0]));
  process.exit(errors.length ? 1 : 0);
}

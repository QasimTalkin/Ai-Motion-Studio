// node scripts/render.mjs films/my-film.html            → out/my-film/final.mp4 (+ contact.png, phone.png)
// node scripts/render.mjs films/my-film.html --stills   → out/my-film/stills.png (one frame per beat, seconds)
// Options: --size 1920x1080 (16:9)   --draft (fast preview)   --music song.wav   --fps 60 --sub 4 --dur 15
//
// The course's route A: the page paints any moment with window.seek(t); headless Chrome walks time,
// ffmpeg blends SUB subframes per frame for motion blur. Sound comes from the film's window.CUES.
import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, basename, extname, join, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { synth, wav } from './sfx.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (k) => argv.includes('--' + k);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const file = resolve(argv.find((a, i) => !a.startsWith('--') && !argv[i - 1]?.match(/^--(fps|sub|dur|size|music)$/)) || 'index.html');
if (!existsSync(file)) { console.error(`No film at ${file}`); process.exit(1); }

const draft = flag('draft');
const FPS = Number(arg('fps', draft ? 30 : 60)), SUB = Number(arg('sub', draft ? 1 : 4));
const [W, H] = (arg('size', '1080x1920')).split('x').map(Number);
const name = basename(file, extname(file)) === 'index' ? basename(resolve(file, '..')) : basename(file, extname(file));
const suffix = arg('size') ? `-${W}x${H}` : '';
const OUT = join(ROOT, 'out', name);
mkdirSync(OUT, { recursive: true });

const localFfmpeg = join(ROOT, 'node_modules/ffmpeg-static/ffmpeg' + (process.platform === 'win32' ? '.exe' : ''));
const FF = process.env.FFMPEG_PATH || (existsSync(localFfmpeg) ? localFfmpeg : 'ffmpeg');
if (spawnSync(FF, ['-version']).error) { console.error('ffmpeg not found. Run ./install.sh first.'); process.exit(1); }
const ffmpeg = (args, opts) => spawn(FF, ['-y', '-loglevel', 'error', ...args], { stdio: ['ignore', 'inherit', 'inherit'], ...opts });
const done = (p) => new Promise((r, j) => p.on('close', (c) => (c ? j(new Error('ffmpeg failed')) : r())));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto(pathToFileURL(file).href + `?w=${W}&h=${H}`);
await page.evaluate(() => window.ready || document.fonts.ready);   // canvas text needs loaded fonts
const film = await page.evaluate(() => ({ dur: window.DUR, bpm: window.BPM, cues: window.CUES || [] }));
const DUR = Number(arg('dur', film.dur || 15));
const grab = async (t) => Buffer.from(await page.evaluate((t) => {
  window.seek(t); return document.querySelector('canvas').toDataURL('image/png').slice(22);
}, t), 'base64');

if (flag('stills')) {
  // one frame per beat, taken half a beat in so each new state is visible
  const spb = 60 / (film.bpm || 120), times = [];
  for (let t = spb / 2; t < DUR; t += spb * Math.max(1, Math.ceil(DUR / spb / 36))) times.push(t);
  const cols = W > H ? 4 : 6, rows = Math.ceil(times.length / cols);
  const ff = ffmpeg(['-f', 'image2pipe', '-i', '-', '-vf', `scale=${W > H ? 480 : 270}:-2,tile=${cols}x${rows}:padding=6:color=0x222222`,
    '-frames:v', '1', join(OUT, `stills${suffix}.png`)], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (const t of times) ff.stdin.write(await grab(t));
  ff.stdin.end(); await done(ff); await browser.close();
  console.log(`${times.length} stills (one per beat, left to right) → out/${name}/stills${suffix}.png`);
  process.exit(0);
}

// tmix averages SUB consecutive subframes; select keeps the last of each group
const vf = SUB > 1 ? `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB` : `setpts=N/${FPS}/TB`;
const silent = join(OUT, 'silent.mp4');
const ff = ffmpeg(['-f', 'image2pipe', '-framerate', String(FPS * SUB), '-i', '-',
  '-vf', vf, '-r', String(FPS), '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });

const total = Math.round(DUR * FPS * SUB);
for (let i = 0; i < total; i++) {
  const png = await grab(i / (FPS * SUB));
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % (FPS * SUB) === 0) process.stdout.write(`\rrendered ${i / (FPS * SUB)}s / ${DUR}s `);
}
ff.stdin.end(); await done(ff); await browser.close();
console.log(`\rrendered ${DUR}s / ${DUR}s`);

// Sound: synthesized cues (+ an optional supplied track), mixed to -14 LUFS, muxed into the video
const final = join(OUT, `${draft ? 'draft' : 'final'}${suffix}.mp4`);
const music = arg('music');
if (film.cues.length || music) {
  const sfx = join(OUT, 'sfx.wav');
  writeFileSync(sfx, wav(synth(film.cues, DUR)));
  const inputs = ['-i', silent, '-i', sfx, ...(music ? ['-i', resolve(music)] : [])];
  const mix = `${music ? '[1:a][2:a]amix=inputs=2:normalize=0[m];[m]' : '[1:a]'}atrim=0:${DUR},alimiter=limit=0.35:level=false,loudnorm=I=-14:TP=-1.5:LRA=11`;
  // pass 1 measures loudness, pass 2 applies it linearly: lands on -14 LUFS without pumping
  let log = ''; const probe = spawn(FF, ['-hide_banner', ...inputs, '-filter_complex', `${mix}:print_format=json`, '-f', 'null', '-']);
  probe.stderr.on('data', (d) => (log += d)); await done(probe);
  const m = JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));
  await done(ffmpeg([...inputs, '-filter_complex', `${mix}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true[a]`,
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', final]));
} else await done(ffmpeg(['-i', silent, '-c', 'copy', final]));

// Critique sheets from the course: contact sheet (2 fps) and phone test (360 px wide)
if (!draft) {
  const n = Math.ceil(DUR * 2);
  await done(ffmpeg(['-i', final, '-vf', `fps=2,scale=${W > H ? 400 : 270}:-2,tile=6x${Math.ceil(n / 6)}`, '-frames:v', '1', join(OUT, `contact${suffix}.png`)]));
  await done(ffmpeg(['-i', final, '-vf', `fps=1,scale=360:-2,tile=5x${Math.ceil(DUR / 5)}`, '-frames:v', '1', join(OUT, `phone${suffix}.png`)]));
}
console.log(`✓ out/${name}/${basename(final)}${draft ? '' : `  (look at out/${name}/contact${suffix}.png)`}`);

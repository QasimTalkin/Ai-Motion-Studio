// npm run render <film> -- [--format 9:16|all] [--fps 60] [--sub 4] [--from 4 --to 6] [--draft] [--workers 4]
//
// Walks time, calls window.seek(t), captures the canvas and pipes PNGs into ffmpeg.
// --sub renders N subframes per output frame and blends them (tmix) for real motion blur.
// Frames are split across --workers browser pages; because every frame is a pure function of t,
// the chunks are independent and are concatenated losslessly at the end.
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { cpus } from 'node:os';
import { args, findFilm, ffmpeg, fmtDir, serve, launch, openFilm, frame, run, isMain, filmMeta } from './common.mjs';

export async function render(dir, o = {}) {
  const draft = !!o.draft;
  const fps = o.fps ?? (draft ? 30 : 60);
  const sub = o.sub ?? (draft ? 1 : 4);
  const scale = o.scale ?? (draft ? 0.5 : 1);
  const workers = Math.max(1, o.workers ?? Math.min(4, cpus().length));

  const { url, close } = await serve();
  const browser = await launch();
  const probe = await openFilm(browser, url, dir, { format: o.format, scale });
  const meta = probe.meta;
  const format = o.format || meta.formats[0];
  const from = o.from ?? 0, to = Math.min(o.to ?? meta.dur, meta.dur);
  const outDir = join(dir, 'out', fmtDir(format));
  mkdirSync(outDir, { recursive: true });
  const partial = o.from != null || o.to != null;
  const outFile = o.out || join(outDir, partial ? `silent_${from}-${to}.mp4` : draft ? 'draft.mp4' : 'silent.mp4');

  const f0 = Math.round(from * fps), f1 = Math.round(to * fps), frames = f1 - f0;
  const chunk = Math.ceil(frames / workers);
  const t0 = Date.now();
  let done = 0;
  const tick = () => {
    done++;
    const every = process.stdout.isTTY ? Math.max(1, Math.round(fps / 2)) : Math.ceil(frames / 4);
    if (done % every === 0 || done === frames) {
      const pct = ((done / frames) * 100).toFixed(0).padStart(3);
      const line = `  ${format} ${meta.W}x${meta.H} ${fps}fps x${sub} ${pct}%  ${((Date.now() - t0) / 1000).toFixed(0)}s`;
      process.stdout.write(process.stdout.isTTY ? `\r${line} ` : `${line}\n`);
    }
  };

  const segs = [];
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const a = f0 + w * chunk, b = Math.min(f1, a + chunk);
    if (a >= b) return;
    const seg = join(outDir, `.seg${w}.mp4`);
    segs[w] = seg;
    const page = w === 0 ? probe.page : (await openFilm(browser, url, dir, { format, scale })).page;
    await encode(page, seg, { a, b, fps, sub, tick });
  }));
  if (process.stdout.isTTY) process.stdout.write('\n');

  const list = join(outDir, '.segs.txt');
  writeFileSync(list, segs.filter(Boolean).map((s) => `file '${s.replace(/'/g, "'\\''")}'`).join('\n'));
  await run(ffmpeg(), ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', outFile]);
  for (const s of segs.filter(Boolean)) rmSync(s, { force: true });
  rmSync(list, { force: true });

  await browser.close(); await close();
  console.log(`  → ${outFile}`);
  return { outFile, meta, format, fps };
}

// Render output frames [a, b) into one H.264 segment.
async function encode(page, file, { a, b, fps, sub, tick }) {
  // tmix averages SUB consecutive subframes; select keeps the last of each group
  const vf = sub > 1
    ? `tmix=frames=${sub},select='eq(mod(n\\,${sub})\\,${sub - 1})',setpts=N/${fps}/TB`
    : `setpts=N/${fps}/TB`;
  const ff = spawn(ffmpeg(), ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps * sub), '-i', '-',
    '-vf', vf, '-r', String(fps), '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', file],
  { stdio: ['pipe', 'inherit', 'inherit'] });
  const closed = new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg failed')))));

  for (let f = a; f < b; f++) {
    for (let s = 0; s < sub; s++) {
      // subframes sample the shutter interval leading up to the frame time (frame f shows [f-1, f])
      const t = sub > 1 ? (f - 1 + (s + 1) / sub) / fps : f / fps;
      const png = await frame(page, Math.max(0, t));
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
    }
    tick();
  }
  ff.stdin.end();
  await closed;
}

if (isMain(import.meta.url)) {
  const a = args();
  const dir = findFilm(a._[0]);
  const o = { draft: !!a.draft, fps: a.fps, sub: a.sub, from: a.from, to: a.to, scale: a.scale, workers: a.workers, out: a.out };
  const formats = a.format === 'all' ? null : [a.format].filter(Boolean);
  if (formats && formats.length) for (const f of formats) await render(dir, { ...o, format: f });
  else {
    const meta = await filmMeta(dir);
    for (const f of a.format === 'all' ? meta.formats : [meta.formats[0]]) await render(dir, { ...o, format: f });
  }
}

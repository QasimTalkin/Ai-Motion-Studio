// npm run film <film> -- [--draft] [--format 9:16|all] [--no-sheets] [--force]
//
// The one command: check → soundtrack → render every format → mux → critique sheets.
// --draft renders 540p/30fps without motion blur in seconds, for pacing passes.
import { join } from 'node:path';
import { rmSync } from 'node:fs';
import { args, findFilm, filmMeta, ffmpeg, fmtDir, run, isMain, ROOT } from './common.mjs';
import { check } from './check.mjs';
import { audio } from './audio.mjs';
import { render } from './render.mjs';
import { sheets } from './sheets.mjs';
import { relative } from 'node:path';

export async function film(dir, o = {}) {
  const t0 = Date.now();
  const meta = await filmMeta(dir);
  const formats = !o.format || o.format === 'all' ? meta.formats : [o.format];
  const rel = (p) => relative(ROOT, p);
  console.log(`\n▶ ${meta.title} — ${meta.dur}s @ ${meta.bpm} BPM — ${formats.join(', ')}${o.draft ? ' (draft)' : ''}\n`);

  console.log('1/4 check');
  const { errors } = await check(dir, { quiet: false });
  if (errors.length && !o.force) process.exit(1);

  console.log('2/4 sound');
  const mix = await audio(dir, meta);

  console.log('3/4 picture');
  const finals = [];
  for (const format of formats) {
    const out = join(dir, 'out', fmtDir(format));
    const silent = join(out, o.draft ? 'draft_silent.mp4' : 'silent.mp4');
    await render(dir, { format, draft: o.draft, out: silent });
    const final = join(out, o.draft ? 'draft.mp4' : 'final.mp4');
    await run(ffmpeg(), ['-y', '-loglevel', 'error', '-i', silent, '-i', mix, '-map', '0:v', '-map', '1:a',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
    rmSync(silent, { force: true });
    finals.push(final);
  }

  if (!o['no-sheets']) {
    console.log('4/4 critique sheets');
    await sheets(dir, { meta, format: formats[0] });
  }

  const out = join(dir, 'out', fmtDir(formats[0]));
  console.log(`\n✓ done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  for (const f of finals) console.log(`  ${rel(f)}`);
  if (!o['no-sheets']) console.log(`  ${rel(out)}/contact.png  ← look at this before you call it finished`);
  console.log();
  return finals;
}

if (isMain(import.meta.url)) {
  const a = args();
  await film(findFilm(a._[0]), a);
}

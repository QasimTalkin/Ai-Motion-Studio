// npm run sheets <film> -- [--format 9:16] [--at 4.2] [--poster 6]
// The critique kit from the course, made from the rendered video (final.mp4, else draft/silent):
//   contact.png     2 frames per second, 6 across
//   strip.png       12 consecutive frames around --at (catch pops and overlaps)
//   phone.png       1 frame per second at 360 px wide (does it read on a phone?)
//   poster.png      one full-res frame (--poster seconds, default 40% in)
//   loop_check.mp4  the film twice back to back (watch the seam)
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { args, findFilm, filmMeta, ffmpeg, fmtDir, run, fail, isMain } from './common.mjs';

export async function sheets(dir, o = {}) {
  const meta = o.meta || await filmMeta(dir);
  const format = o.format || meta.formats[0];
  const out = join(dir, 'out', fmtDir(format));
  const src = ['final.mp4', 'draft.mp4', 'silent.mp4', 'draft_silent.mp4'].map((f) => join(out, f)).find(existsSync);
  if (!src) fail(`No video in ${out}. Run: npm run render ${dir}`);
  const ff = (...a) => run(ffmpeg(), ['-y', '-loglevel', 'error', ...a]);
  const { dur } = meta;
  const landscape = meta.W > meta.H;

  const perSec = dur > 30 ? 30 / dur : 2, count = Math.ceil(dur * perSec), cols = landscape ? 4 : 6;
  await ff('-i', src, '-vf', `fps=${perSec},scale=${landscape ? 400 : 270}:-2,tile=${cols}x${Math.ceil(count / cols)}:padding=4:color=0x0c0c0b`, '-frames:v', '1', join(out, 'contact.png'));
  const at = o.at ?? Math.round(dur / 3 * 10) / 10;
  await ff('-ss', String(Math.max(0, at - 0.1)), '-i', src, '-vf', 'scale=320:-2,tile=12x1', '-frames:v', '1', join(out, 'strip.png'));
  const secs = Math.min(Math.ceil(dur), 30);
  await ff('-i', src, '-vf', `fps=${secs / dur},scale=360:-2,tile=5x${Math.ceil(secs / 5)}:padding=4:color=0x0c0c0b`, '-frames:v', '1', join(out, 'phone.png'));
  await ff('-ss', String(o.poster ?? meta.poster ?? dur * 0.4), '-i', src, '-frames:v', '1', join(out, 'poster.png'));
  await ff('-stream_loop', '1', '-i', src, '-c', 'copy', join(out, 'loop_check.mp4'));
  console.log(`  sheets → ${out}/{contact,strip,phone,poster}.png + loop_check.mp4`);
  return out;
}

if (isMain(import.meta.url)) {
  const a = args();
  await sheets(findFilm(a._[0]), { format: a.format, at: a.at, poster: a.poster });
}

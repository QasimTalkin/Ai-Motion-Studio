// npm run audio <film>
// Builds the soundtrack on the film's own timeline:
//   music.wav  - synthesized score (or the supplied track, converted, unchanged)
//   sfx.wav    - every cue from the film's `cues`
//   mix.wav    - both, mixed and normalized to -14 LUFS / -1 dBTP (two-pass loudnorm)
//   beats.json - beat grid (measured with beats.py for supplied tracks when librosa is installed)
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { args, findFilm, filmMeta, ffmpeg, run, isMain } from './common.mjs';
import { writeWav } from './wav.mjs';
import { synthScore, beatGrid } from './music.mjs';
import { synthSfx } from './sfx.mjs';

export async function audio(dir, meta) {
  meta ||= await filmMeta(dir);
  const out = join(dir, 'out');
  mkdirSync(out, { recursive: true });
  const { dur, bpm, beatOffset = 0, cues = [] } = meta;
  const music = meta.music || false;
  const musicWav = join(out, 'music.wav'), sfxWav = join(out, 'sfx.wav'), mixWav = join(out, 'mix.wav');
  let grid = beatGrid({ bpm, dur, beatOffset, cues });

  if (music && music.file) {
    const src = resolve(dir, music.file);
    if (!existsSync(src)) throw new Error(`music.file not found: ${src}`);
    await run(ffmpeg(), ['-y', '-i', src, '-ss', String(music.start || 0), '-t', String(dur), '-ac', '1', '-ar', '48000', musicWav]);
    const py = spawnSync(process.platform === 'win32' ? 'python' : 'python3', [join(import.meta.dirname, 'beats.py'), musicWav], { encoding: 'utf8' });
    if (py.status === 0) grid = { ...JSON.parse(py.stdout), hits: JSON.parse(py.stdout).hits };
    else console.log('  (librosa not installed: beats.json uses the film bpm; pip install numpy librosa soundfile to measure)');
    console.log(`  music: ${music.file} (supplied)`);
  } else if (music) {
    writeWav(musicWav, [synthScore({ bpm, dur, beatOffset, ...music })]);
    console.log(`  music: synthesized "${music.style || 'pulse'}" in ${music.key || 'A'} minor at ${bpm} BPM`);
  }
  writeFileSync(join(out, 'beats.json'), JSON.stringify(grid, null, 1));

  writeWav(sfxWav, [synthSfx(cues, dur)]);
  console.log(`  sfx: ${cues.length} cues`);

  const inputs = [], weights = [];
  if (music) { inputs.push('-i', musicWav); weights.push(music.volume ?? 1); }
  inputs.push('-i', sfxWav); weights.push(meta.sfxVolume ?? 0.9);
  const pre = `amix=inputs=${weights.length}:weights=${weights.join(' ')}:normalize=0:duration=longest,atrim=0:${dur},` +
    (meta.loop ? '' : `afade=t=out:st=${Math.max(0, dur - 0.4)}:d=0.4,`);
  // pass 1: measure
  const log = await run(ffmpeg(), ['-hide_banner', ...inputs, '-filter_complex',
    `${pre}loudnorm=I=-14:TP=-1:LRA=11:print_format=json`, '-f', 'null', '-']);
  const m = JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));
  // pass 2: apply linear normalization with the measured values
  await run(ffmpeg(), ['-y', '-hide_banner', ...inputs, '-filter_complex',
    `${pre}loudnorm=I=-14:TP=-1:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`,
    '-ac', '2', mixWav]);
  console.log(`  mix: ${mixWav} (-14 LUFS target, measured input ${m.input_i} LUFS)`);
  return mixWav;
}

if (isMain(import.meta.url)) await audio(findFilm(args()._[0]));

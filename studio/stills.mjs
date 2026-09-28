// npm run stills <film> -- [--every beat|2beats|0.5] [--times 1,2.5,4] [--format 9:16] [--offset 0.5]
//
// The cheapest critique there is: one frame per beat, labeled, on one sheet -> out/stills.png.
// No video render needed. Open the PNG and look at it before any full render.
// Frames are sampled `offset` of a beat after each beat (default: halfway), where the new state is visible.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { args, findFilm, serve, launch, openFilm, frame, isMain } from './common.mjs';

export async function stills(dir, o = {}) {
  const { url, close } = await serve();
  const browser = await launch();
  const { page, meta } = await openFilm(browser, url, dir, { format: o.format, scale: o.scale ?? 0.5 });
  const spb = 60 / meta.bpm, off = meta.beatOffset || 0;

  let times;
  if (o.times) times = String(o.times).split(',').map(Number);
  else {
    const every = o.every ?? 'beat';
    let step = typeof every === 'number' ? every : spb * (parseInt(every) || 1);
    while (meta.dur / step > 40) step *= 2;               // keep the sheet readable
    const shift = typeof every === 'number' ? 0 : spb * (o.offset ?? 0.5);
    times = [];
    for (let t = off + shift; t < meta.dur - 1e-6; t += step) times.push(Math.round(t * 1000) / 1000);
  }

  const shots = [];
  for (const t of times) shots.push({ t, png: (await frame(page, t)).toString('base64') });
  const cols = meta.W > meta.H ? 4 : 6, thumb = meta.W > meta.H ? 400 : 240;
  const label = (t) => {
    const beat = (t - off) / spb;
    return `${t.toFixed(2)}s · beat ${Math.floor(beat)} · bar ${Math.floor(beat / 4)}`;
  };
  const html = `<body style="margin:0;background:#0c0c0b;font:13px ui-monospace,monospace;color:#b8b6ad">
  <div style="padding:14px 16px 4px;color:#F0EEE6">${meta.title} · ${o.format || meta.formats[0]} · ${meta.dur}s · ${meta.bpm} BPM · ${shots.length} stills</div>
  <div style="display:grid;grid-template-columns:repeat(${cols},${thumb}px);gap:10px;padding:10px 16px 16px">
  ${shots.map((s) => `<figure style="margin:0"><img src="data:image/png;base64,${s.png}" style="width:${thumb}px;display:block;outline:1px solid #2a2926">
  <figcaption style="padding-top:5px">${label(s.t)}</figcaption></figure>`).join('')}</div></body>`;
  const sheet = await browser.newPage({ viewport: { width: cols * (thumb + 10) + 22, height: 400 } });
  await sheet.setContent(html);
  await sheet.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
  mkdirSync(join(dir, 'out'), { recursive: true });
  const file = o.out || join(dir, 'out', 'stills.png');
  writeFileSync(file, await sheet.screenshot({ fullPage: true }));
  await browser.close(); await close();
  console.log(`  ${shots.length} stills → ${file}`);
  return file;
}

if (isMain(import.meta.url)) {
  const a = args();
  await stills(findFilm(a._[0]), { every: a.every, times: a.times, format: a.format, offset: a.offset, scale: a.scale, out: a.out });
}

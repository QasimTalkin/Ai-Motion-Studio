// lib/stage.js — boots a film: sizes the canvas for the requested format, loads fonts and images,
// exposes window.seek(t) for the renderer, and runs a scrubbable live preview in a normal browser.
//
//   boot({ title, dur, bpm, formats, palette, music, cues, scenes, draw })
//
// Scenes get (localTime, S, progress). S is the stage: layout, beat grid, drawing helpers.
import { clamp } from './motion.js';

export const FORMATS = {
  '9:16': [1080, 1920],
  '1:1': [1080, 1080],
  '4:5': [1080, 1350],
  '16:9': [1920, 1080],
};

export const FONTS = {
  display: '"Source Serif 4", Georgia, serif',
  ui: 'Inter, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

const params = new URLSearchParams(location.search);
const RENDER = navigator.webdriver || params.has('render');

export function boot(film) {
  const format = params.get('format') || film.formats?.[0] || '9:16';
  const scale = Number(params.get('scale') || 1);
  const [W0, H0] = FORMATS[format] || format.split('x').map(Number);
  const W = Math.round(W0 * scale), H = Math.round(H0 * scale);

  let canvas = document.getElementById('c');
  if (!canvas) { canvas = document.createElement('canvas'); canvas.id = 'c'; document.body.append(canvas); }
  canvas.width = W; canvas.height = H;
  const g = canvas.getContext('2d');

  const bpm = film.bpm || 120, offset = film.beatOffset || 0, spb = 60 / bpm;
  const images = {};
  const S = {
    g, W, H, format, scale, dur: film.dur,
    u: Math.min(W, H) / 1080,                 // 1 unit = 1px on a 1080-wide canvas
    cx: W / 2, cy: H / 2,
    orientation: W < H * 0.9 ? 'portrait' : W > H * 1.1 ? 'landscape' : 'square',
    palette: film.palette || {},
    fonts: FONTS,
    bpm, spb,
    beat: (n) => offset + n * spb,            // time of beat n (0-based)
    bar: (n) => offset + n * 4 * spb,         // time of bar n (0-based)
    // Per-format values: S.pick({ portrait: 180, square: 150, landscape: 130 })
    pick: (o) => (S.orientation in o ? o[S.orientation] : o.portrait ?? o.default),
    // Canvas font string with size in stage units: S.font(120, 700, 'display')
    font: (size, weight = 400, face = 'ui') => `${weight} ${size * S.u}px ${FONTS[face] || face}`,
    img: (name) => images[name],
    text: (str, x, y, o = {}) => text(g, S, str, x, y, o),
    rrect: (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); },
  };

  const background = film.background || S.palette.bg || '#141413';
  function draw(t) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.filter = 'none'; g.globalCompositeOperation = 'source-over';
    g.fillStyle = background; g.fillRect(0, 0, W, H);
    for (const sc of film.scenes || []) {
      if (t < sc.from || t >= sc.to) continue;
      g.save(); sc.draw(t - sc.from, S, (t - sc.from) / (sc.to - sc.from)); g.restore();
    }
    if (film.draw) { g.save(); film.draw(t, S); g.restore(); }
  }

  const ready = (async () => {
    if (document.readyState !== 'complete') await new Promise((r) => addEventListener('load', r, { once: true }));
    await Promise.all([...document.fonts].map((f) => f.load().catch(() => {})));
    await document.fonts.ready;
    await Promise.all(Object.entries(film.images || {}).map(([k, src]) => new Promise((res) => {
      const im = new Image(); im.onload = () => { images[k] = im; res(); };
      im.onerror = () => { console.warn('missing image', src); res(); }; im.src = src;
    })));
    draw(0);
    return true;
  })();

  const cues = typeof film.cues === 'function' ? film.cues(S) : film.cues || [];
  window.seek = (t) => { draw(t); return true; };
  window.__studio = {
    ready,
    meta: {
      title: film.title || document.title, dur: film.dur, bpm, beatOffset: offset,
      formats: film.formats || ['9:16', '16:9'], loop: !!film.loop, music: film.music ?? { style: 'pulse' },
      cues: cues.slice().sort((a, b) => a.t - b.t), W, H,
    },
  };

  if (!RENDER) ready.then(() => preview(canvas, draw, film.dur, S));
  return S;
}

// Text with tracking (em), alpha and alignment. Returns the drawn width.
export function text(g, S, str, x, y, o = {}) {
  const { size = 48, weight = 400, face = 'ui', color = '#F0EEE6', align = 'left',
    baseline = 'alphabetic', tracking = 0, alpha = 1 } = o;
  if (alpha <= 0) return 0;
  g.save();
  g.globalAlpha *= clamp(alpha);
  g.font = S.font(size, weight, face);
  g.letterSpacing = `${tracking * size * S.u}px`;
  g.fillStyle = color; g.textAlign = align; g.textBaseline = baseline;
  g.fillText(str, x, y);
  const w = g.measureText(str).width;
  g.restore();
  return w;
}

// Live preview: the clock only exists here, never in render mode.
// Space = play/pause, arrows = scrub 0.5s (shift: one frame), Home = restart, click bar = seek.
function preview(canvas, draw, dur, S) {
  const style = document.createElement('style');
  style.textContent = `html,body{height:100%;margin:0;background:#0c0c0b;overflow:hidden}
  body{display:grid;place-items:center}
  #c{max-width:100vw;max-height:calc(100vh - 44px);width:auto;height:auto}
  #hud{position:fixed;left:0;right:0;bottom:0;height:44px;display:flex;gap:12px;align-items:center;
  padding:0 14px;font:12px/1 ui-monospace,monospace;color:#b8b6ad;background:#0c0c0b}
  #bar{flex:1;height:6px;background:#2a2926;border-radius:3px;cursor:pointer;position:relative}
  #fill{position:absolute;inset:0 auto 0 0;background:#D97757;border-radius:3px}`;
  document.head.append(style);
  const hud = document.createElement('div');
  hud.id = 'hud';
  hud.innerHTML = '<span id="tc"></span><div id="bar"><div id="fill"></div></div><span>space ◂ ▸ home</span>';
  document.body.append(hud);
  const tc = hud.querySelector('#tc'), bar = hud.querySelector('#bar'), fill = hud.querySelector('#fill');

  const audio = new Audio('out/mix.wav');
  let hasAudio = false;
  audio.addEventListener('canplay', () => { hasAudio = true; }, { once: true });

  let t = params.has('t') ? Number(params.get('t')) : 0, playing = !params.has('t'), last = performance.now();
  const seekTo = (x) => { t = ((x % dur) + dur) % dur; if (hasAudio) audio.currentTime = t; };
  addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 1 / 60 : 0.5;
    if (e.code === 'Space') { playing = !playing; if (hasAudio) playing ? audio.play() : audio.pause(); e.preventDefault(); }
    if (e.code === 'ArrowRight') seekTo(t + step);
    if (e.code === 'ArrowLeft') seekTo(t - step);
    if (e.code === 'Home') seekTo(0);
  });
  bar.addEventListener('click', (e) => { const r = bar.getBoundingClientRect(); seekTo(((e.clientX - r.left) / r.width) * dur); });
  canvas.addEventListener('click', () => { playing = !playing; if (hasAudio) playing ? audio.play().catch(() => {}) : audio.pause(); });

  (function loop(now) {
    if (playing) {
      if (hasAudio && !audio.paused) t = audio.currentTime;
      else t += (now - last) / 1000;
      if (t >= dur) { t = 0; if (hasAudio) audio.currentTime = 0; }
    }
    last = now;
    draw(t);
    const beat = Math.floor((t - (S.beat(0))) / S.spb);
    tc.textContent = `${t.toFixed(2)}s / ${dur}s · beat ${beat} · ${S.format}`;
    fill.style.width = `${(t / dur) * 100}%`;
    requestAnimationFrame(loop);
  })(performance.now());
}

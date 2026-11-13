// Shared kit for this film: palette, springs, layout, text, icons that draw themselves, subtitles.
// Everything is a pure function of t.
import { spring, clamp, lerp, range, mixColor, SPRING } from '/lib/motion.js';
export { spring, clamp, lerp, range, mixColor, SPRING };
export { track, hash, noise, beatPulse, swapAlpha, frameHold, typed } from '/lib/motion.js';

export const P = { bg: '#0F172A', bg2: '#15233F', blue: '#3B82F6', amber: '#F59E0B', ink: '#F8FAFC', dim: '#94A3B8',
  slate: '#334155', card: '#1E293B', card2: '#172338', deep: '#0A1020', sky: '#93C5FD', light: '#60A5FA' };

// The brief's organic spring (stiffness 120, damping 14) for cards, icons, shapes.
// Type never bounces (TYPE). CAM settles camera moves.
export const ORG = [120, 14], TYPE = [260, 34], CAM = [150, 24], SNAP = SPRING.snappy, HEAVY = SPRING.heavy, DROP = [200, 8];
export const sp = (t, k = TYPE) => spring(t, k);
export const BPM = 120;

export function measure(S, str, size, weight = 400, face = 'ui', tracking = 0) {
  const { g } = S;
  g.save(); g.font = S.font(size, weight, face); g.letterSpacing = `${tracking * size * S.u}px`;
  const w = g.measureText(str).width; g.restore();
  return w;
}
export const fitSize = (S, str, weight, face, maxW, maxSize) => Math.min(maxSize, (100 * maxW) / measure(S, str, 100, weight, face));
export const circle = (g, x, y, r) => { g.beginPath(); g.arc(x, y, Math.max(0, r), 0, Math.PI * 2); };

// Step layout: numeral top-left, title under it, the visual in its zone, subtitles in the bottom 15 %.
export function lay(S) {
  const { W, H, u } = S;
  return S.pick({
    portrait: { nx: 84 * u, ny: 400 * u, ns: 290, tx: 90 * u, ty: 548 * u, ts: 96, tMax: W * 0.84,
      vx: W * 0.5, vy: H * 0.565, vr: 300 * u, subY: H * 0.87, subMax: W * 0.86, subSize: 46 },
    landscape: { nx: 150 * u, ny: 440 * u, ns: 290, tx: 158 * u, ty: 580 * u, ts: 90, tMax: W * 0.4,
      vx: W * 0.67, vy: H * 0.465, vr: 305 * u, subY: H * 0.9, subMax: W * 0.62, subSize: 42 },
  });
}

// Big step numeral with a small "/3".
export function numeral(S, n, x, y, { alpha = 1, rise = 0, clip = false, of = 3 } = {}) {
  const { g, u } = S, Ly = lay(S);
  g.save();
  if (clip) { g.beginPath(); g.rect(x - 40 * u, y - Ly.ns * 0.8 * u, 560 * u, Ly.ns * 0.86 * u); g.clip(); }
  const w = S.text(String(n), x, y + rise, { size: Ly.ns, weight: 800, color: P.blue, tracking: -0.05, alpha });
  S.text(`/${of}`, x + w + 12 * u, y - Ly.ns * 0.6 * u + rise, { size: 38, weight: 500, face: 'mono', color: P.dim, alpha });
  g.restore();
}

// Odometer: digits roll through a slot. 0 shows as "?", so a question can roll into a number.
export function odometer(S, v, x, y, size, { color = P.blue, weight = 800, slot = true, alpha = 1, face = 'ui' } = {}) {
  const { g, u } = S;
  const lh = size * u;
  g.save();
  if (slot) { g.beginPath(); g.rect(x - size * u * 0.1, y - size * u * 0.82, size * u * 0.9, size * u * 0.9); g.clip(); }
  for (let k = Math.floor(v); k <= Math.ceil(v); k++) {
    const off = (k - v) * lh;
    if (Math.abs(off) > lh * 1.1) continue;
    S.text(k === 0 ? '?' : String(k), x, y + off, { size, weight, color, face, tracking: -0.05, alpha });
  }
  g.restore();
}

// Background: navy with a faint dot grid that moves with the camera.
export function dotGrid(S, cx, cy, alpha = 1) {
  const { g, W, H, u } = S;
  const gap = 64 * u, ox = ((-cx % gap) + gap) % gap, oy = ((-cy % gap) + gap) % gap;
  g.fillStyle = `rgba(148,163,184,${0.11 * alpha})`;
  for (let x = ox - gap; x < W + gap; x += gap) for (let y = oy - gap; y < H + gap; y += gap) g.fillRect(x - 1.5 * u, y - 1.5 * u, 3 * u, 3 * u);
}
export function vignette(S) {
  const { g, W, H } = S;
  const v = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.62);
  v.addColorStop(0, 'rgba(5,8,18,0)'); v.addColorStop(1, 'rgba(5,8,18,0.55)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// ── text ────────────────────────────────────────────────────────────────────
export function wrap(S, text, size, weight, face, maxW) {
  const words = text.split(' '), lines = [[]];
  const space = measure(S, ' ', size, weight, face);
  let w = 0;
  for (const wd of words) {
    const ww = measure(S, wd, size, weight, face);
    if (lines.at(-1).length && w + space + ww > maxW) { lines.push([]); w = 0; }
    w += (lines.at(-1).length ? space : 0) + ww; lines.at(-1).push(wd);
  }
  return lines;
}
const bare = (w) => w.replace(/[^\p{L}\d]/gu, '').toLowerCase();

// Wrapped paragraph. marks: [{ phrase, t, color }] lights a phrase (colour + underline) at time t.
// Returns the block height in px.
export function paragraph(S, t, text, x, y, o = {}) {
  const { g, u } = S;
  const { size = 48, weight = 600, face = 'ui', color = P.ink, maxW = 800 * u, lh = 1.3, align = 'left', alpha = 1, marks = [], rise = 0 } = o;
  const lines = wrap(S, text, size, weight, face, maxW);
  const space = measure(S, ' ', size, weight, face);
  const flat = lines.flat();
  const lit = new Array(flat.length).fill(null);
  for (const m of marks) {
    const pw = m.phrase.split(' ').map(bare);
    for (let i = 0; i + pw.length <= flat.length; i++) {
      if (pw.every((w, j) => bare(flat[i + j]) === w)) { for (let j = 0; j < pw.length; j++) lit[i + j] = m; break; }
    }
  }
  let wi = 0;
  lines.forEach((ln, li) => {
    const widths = ln.map((w) => measure(S, w, size, weight, face));
    const total = widths.reduce((a, b) => a + b, 0) + space * (ln.length - 1);
    let xx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    const yy = y + li * size * u * lh + rise * (1 + li * 0.35);
    ln.forEach((w, k) => {
      const m = lit[wi++];
      const on = m ? sp(t - m.t, [170, 26]) : 0;
      const col = m ? mixColor(color, m.color, on) : color;
      S.text(w, xx, yy, { size, weight, face, color: col, alpha });
      if (m && on > 0.001) {
        g.save(); g.globalAlpha *= alpha; g.fillStyle = m.color;
        const ext = k < ln.length - 1 && lit[wi] === m ? space : 0;
        g.fillRect(xx, yy + size * u * 0.16, (widths[k] + ext) * on, Math.max(3, size * 0.09) * u);
        g.restore();
      }
      xx += widths[k] + space;
    });
  });
  return lines.length * size * u * lh;
}

// Pill chip with text. Returns its width.
export function chip(S, x, y, text, o = {}) {
  const { g, u } = S;
  const { size = 34, weight = 600, face = 'ui', color = P.ink, bg = P.card, stroke = null, align = 'left', alpha = 1, scale = 1, padX = 26, h = 2.0 } = o;
  const tw = measure(S, text, size, weight, face), w = tw + padX * 2 * u, hh = size * u * h;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  g.save(); g.globalAlpha *= alpha;
  g.translate(x0 + w / 2, y); g.scale(scale, scale); g.translate(-(x0 + w / 2), -y);
  if (bg) { g.fillStyle = bg; S.rrect(x0, y - hh / 2, w, hh, hh / 2); g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = 3 * u; S.rrect(x0, y - hh / 2, w, hh, hh / 2); g.stroke(); }
  S.text(text, x0 + padX * u, y + size * u * 0.36, { size, weight, face, color });
  g.restore();
  return w;
}

// ── icons that draw themselves (pathLength 0 → 1) ───────────────────────────
const arc = (cx, cy, r, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * (i / n); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
const person = (cx, cy, s) => [arc(cx, cy - 0.55 * s, 0.24 * s, -Math.PI / 2, Math.PI * 1.5), arc(cx, cy + 0.62 * s, 0.5 * s, Math.PI, Math.PI * 2, 18)];
export const ICONS = {
  school: () => [[[-0.85, -0.12], [0, -0.62], [0.85, -0.12]], rect(-0.68, -0.12, 0.68, 0.8), rect(-0.16, 0.36, 0.16, 0.8),
    arc(0, -0.2, 0.12, 0, Math.PI * 2, 16), [[0, -0.62], [0, -0.98], [0.3, -0.9], [0, -0.82]]],
  ladder: () => [[[-0.28, 0.9], [-0.28, -0.9]], [[0.28, 0.9], [0.28, -0.9]], ...[0.6, 0.25, -0.1, -0.45, -0.8].map((y) => [[-0.28, y], [0.28, y]])],
  arrowUp: () => [[[0, 0.85], [0, -0.85]], [[-0.38, -0.47], [0, -0.85], [0.38, -0.47]]],
  barrier: () => [rect(-0.85, -0.18, 0.85, 0.18), [[-0.5, -0.18], [-0.2, 0.18]], [[0, -0.18], [0.3, 0.18]], [[0.5, -0.18], [0.8, 0.18]], [[-0.6, 0.18], [-0.6, 0.85]], [[0.6, 0.18], [0.6, 0.85]]],
  person: () => person(0, 0, 1),
  parentChild: () => [...person(-0.42, -0.05, 0.95), ...person(0.5, 0.28, 0.6)],
  book: () => [[[0, -0.45], [-0.85, -0.62], [-0.85, 0.5], [0, 0.66], [0.85, 0.5], [0.85, -0.62], [0, -0.45], [0, 0.66]]],
  cap: () => [[[-0.9, 0], [0, -0.38], [0.9, 0], [0, 0.38], [-0.9, 0]], [[-0.5, 0.2], [-0.5, 0.58], [0.5, 0.58], [0.5, 0.2]], [[0.9, 0], [0.9, 0.62]]],
  institution: () => [[[-0.95, -0.3], [0, -0.85], [0.95, -0.3], [-0.95, -0.3]], ...[-0.66, -0.22, 0.22, 0.66].map((x) => [[x, -0.18], [x, 0.58]]),
    [[-0.98, 0.68], [0.98, 0.68]], [[-1.05, 0.86], [1.05, 0.86]]],
  questionnaire: () => [rect(-0.62, -0.88, 0.62, 0.88), ...[-0.48, 0, 0.48].flatMap((y) => [rect(-0.44, y - 0.12, -0.2, y + 0.12), [[-0.05, y], [0.44, y]]])],
  interview: () => [arc(-0.3, -0.2, 0.42, Math.PI * 0.75, Math.PI * 2.62, 26).concat([[-0.66, 0.35], [-0.6, 0.02]]), arc(0.42, 0.3, 0.34, -Math.PI * 0.6, Math.PI * 1.35, 22)],
  eye: () => [[...arc(0, 0.62, 1.0, -Math.PI * 0.82, -Math.PI * 0.18, 20)], [...arc(0, -0.62, 1.0, Math.PI * 0.18, Math.PI * 0.82, 20)], arc(0, 0, 0.24, 0, Math.PI * 2, 18)],
  shield: () => [[[0, -0.88], [0.72, -0.6], [0.66, 0.1], [0.4, 0.55], [0, 0.88], [-0.4, 0.55], [-0.66, 0.1], [-0.72, -0.6], [0, -0.88]], [[-0.3, 0], [-0.06, 0.25], [0.34, -0.22]]],
  clipboard: () => [rect(-0.62, -0.75, 0.62, 0.9), rect(-0.25, -0.9, 0.25, -0.62), [[-0.38, -0.25], [0.38, -0.25]], [[-0.38, 0.1], [0.38, 0.1]], [[-0.38, 0.45], [0.15, 0.45]]],
  chart: () => [[[-0.8, -0.85], [-0.8, 0.8], [0.85, 0.8]], rect(-0.55, 0.2, -0.25, 0.8), rect(-0.1, -0.15, 0.2, 0.8), rect(0.35, -0.6, 0.65, 0.8)],
  table: () => [rect(-0.85, -0.65, 0.85, 0.65), [[-0.85, -0.22], [0.85, -0.22]], [[-0.85, 0.22], [0.85, 0.22]], [[-0.28, -0.65], [-0.28, 0.65]], [[0.28, -0.65], [0.28, 0.65]]],
  doc: () => [[[-0.6, -0.85], [0.3, -0.85], [0.6, -0.55], [0.6, 0.85], [-0.6, 0.85], [-0.6, -0.85]], [[0.3, -0.85], [0.3, -0.55], [0.6, -0.55]], [[-0.38, -0.2], [0.38, -0.2]], [[-0.38, 0.12], [0.38, 0.12]], [[-0.38, 0.44], [0.1, 0.44]]],
  flask: () => [[[-0.22, -0.82], [-0.22, -0.2], [-0.7, 0.78], [0.7, 0.78], [0.22, -0.2], [0.22, -0.82]], [[-0.38, -0.82], [0.38, -0.82]], [[-0.47, 0.3], [0.47, 0.3]]],
  people: () => [...person(-0.55, 0.1, 0.62), ...person(0, -0.05, 0.75), ...person(0.55, 0.1, 0.62)],
  books: () => [rect(-0.7, 0.42, 0.7, 0.82), rect(-0.6, 0.02, 0.62, 0.42), rect(-0.72, -0.38, 0.5, 0.02), [[-0.45, 0.62], [0.4, 0.62]], [[-0.35, 0.22], [0.35, 0.22]]],
  star: () => [Array.from({ length: 11 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.38 : 0.9; return [Math.cos(a) * r, Math.sin(a) * r]; })],
  check: () => [[[-0.6, 0.02], [-0.16, 0.44], [0.64, -0.42]]],
  cross: () => [[[-0.5, -0.5], [0.5, 0.5]], [[0.5, -0.5], [-0.5, 0.5]]],
  bulb: () => [arc(0, -0.18, 0.55, Math.PI * 0.75, Math.PI * 2.25, 24).concat([[0.22, 0.5], [-0.22, 0.5]]), [[-0.22, 0.66], [0.22, 0.66]], [[-0.14, 0.82], [0.14, 0.82]]],
  funnel: () => [[[-0.9, -0.8], [0.9, -0.8], [0.18, 0.15], [0.18, 0.85], [-0.18, 0.65], [-0.18, 0.15], [-0.9, -0.8]]],
  stethoscope: () => [[[-0.62, -0.9], [-0.42, -0.9]], [[-0.5, -0.9], [-0.56, -0.42], [-0.38, -0.04], [0, 0.12]],
    [[0.42, -0.9], [0.62, -0.9]], [[0.5, -0.9], [0.56, -0.42], [0.38, -0.04], [0, 0.12]],
    [[0, 0.12], [0, 0.44], [0.1, 0.64], [0.3, 0.7]], arc(0.5, 0.62, 0.2, Math.PI, Math.PI * 3, 20)],
  scales: () => [[[0, -0.76], [0, 0.82]], [[-0.42, 0.86], [0.42, 0.86]], [[-0.78, -0.56], [0.78, -0.56]], arc(0, -0.84, 0.08, 0, Math.PI * 2, 10),
    [[-1.0, 0.06], [-0.78, -0.56], [-0.56, 0.06]], arc(-0.78, 0.06, 0.22, 0, Math.PI, 12),
    [[0.56, 0.06], [0.78, -0.56], [1.0, 0.06]], arc(0.78, 0.06, 0.22, 0, Math.PI, 12)],
  board: () => [rect(-0.86, -0.72, 0.86, 0.42), [[-0.55, 0.42], [-0.72, 0.92]], [[0.55, 0.42], [0.72, 0.92]],
    [[-0.6, -0.42], [0.08, -0.42]], [[-0.6, -0.15], [0.46, -0.15]], [[-0.6, 0.12], [-0.06, 0.12]]],
  seal: () => [arc(0, 0, 0.86, -Math.PI / 2, Math.PI * 1.5, 28), arc(0, 0, 0.64, -Math.PI / 2, Math.PI * 1.5, 24), [[-0.3, 0.02], [-0.08, 0.24], [0.34, -0.22]]],
  key: () => [arc(-0.52, 0, 0.32, 0, Math.PI * 2, 18), [[-0.2, 0], [0.9, 0]], [[0.62, 0], [0.62, 0.28]], [[0.82, 0], [0.82, 0.22]]],
  padlock: () => [[[-0.4, 0.02], ...arc(0, -0.28, 0.4, Math.PI, Math.PI * 2, 14), [0.4, 0.02]], rect(-0.62, 0.02, 0.62, 0.86),
    arc(0, 0.36, 0.1, 0, Math.PI * 2, 10), [[0, 0.46], [0, 0.64]]],
  bubble: () => [[[-0.86, -0.62], [0.86, -0.62], [0.86, 0.3], [-0.12, 0.3], [-0.5, 0.74], [-0.46, 0.3], [-0.86, 0.3], [-0.86, -0.62]],
    [[-0.52, -0.3], [0.52, -0.3]], [[-0.52, -0.02], [0.2, -0.02]]],
  pie: () => [arc(0, 0, 0.84, -Math.PI / 2, Math.PI * 1.5, 30), [[0, -0.84], [0, 0], [0.73, 0.42]]],
  calendar: () => [rect(-0.8, -0.6, 0.8, 0.82), [[-0.8, -0.24], [0.8, -0.24]], [[-0.44, -0.82], [-0.44, -0.44]], [[0.44, -0.82], [0.44, -0.44]]],
  smile: () => [arc(0, 0, 0.86, 0, Math.PI * 2, 28), arc(0, 0.06, 0.46, Math.PI * 0.18, Math.PI * 0.82, 12), [[-0.3, -0.3], [-0.3, -0.18]], [[0.3, -0.3], [0.3, -0.18]]],
  gate: () => [[[-0.8, 0.86], [-0.8, -0.86]], [[0.8, 0.86], [0.8, -0.86]], [[-0.8, -0.5], [0.8, -0.5]], [[-0.8, 0.4], [0.8, 0.4]],
    [[-0.4, -0.5], [-0.4, 0.4]], [[0, -0.5], [0, 0.4]], [[0.4, -0.5], [0.4, 0.4]]],
};
const plen = (pts) => pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);

// Draw icon `name` centred at (x, y), `size` px half-extent, drawn to progress p (0..1).
export function icon(S, name, x, y, size, p, { color = P.ink, width = 5, alpha = 1 } = {}) {
  if (p <= 0) return;
  const { g, u } = S;
  const polys = ICONS[name]();
  const lens = polys.map(plen), total = lens.reduce((a, b) => a + b, 0);
  let budget = clamp(p) * total;
  g.save(); g.globalAlpha *= alpha;
  g.strokeStyle = color; g.lineWidth = width * u; g.lineCap = 'round'; g.lineJoin = 'round';
  polys.forEach((pts, k) => {
    if (budget <= 0) return;
    let left = Math.min(budget, lens[k]); budget -= lens[k];
    g.beginPath(); g.moveTo(x + pts[0][0] * size, y + pts[0][1] * size);
    for (let i = 1; i < pts.length && left > 0; i++) {
      const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const f = Math.min(1, left / seg);
      g.lineTo(x + lerp(pts[i - 1][0], pts[i][0], f) * size, y + lerp(pts[i - 1][1], pts[i][1], f) * size);
      left -= seg;
    }
    g.stroke();
  });
  g.restore();
}

// Rounded card with optional accent edge.
export function card(S, x, y, w, h, { r = 28, fill = P.card, stroke = null, alpha = 1, edge = null } = {}) {
  const { g, u } = S;
  if (w <= 1 || h <= 1) return;
  g.save(); g.globalAlpha *= alpha;
  g.fillStyle = fill; S.rrect(x, y, w, h, r * u); g.fill();
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = 2.5 * u; S.rrect(x, y, w, h, r * u); g.stroke(); }
  if (edge) { g.save(); S.rrect(x, y, w, h, r * u); g.clip(); g.fillStyle = edge; g.fillRect(x, y, 8 * u, h); g.restore(); }
  g.restore();
}

// Terminal-style block cursor after typed text.
export function cursor(S, t, x, y, size, color = P.blue, on = true) {
  if (!on) return;
  const { g, u } = S;
  if (Math.floor(t * 3.5) % 2 === 0) { g.fillStyle = color; g.fillRect(x + 8 * u, y - size * 0.72 * u, size * 0.42 * u, size * 0.86 * u); }
}

// ── subtitles: English, Inter 600, white on a black pill, bottom 15 % ───────
export function subtitles(t, S, SUBS) {
  const { g, u } = S;
  const Ly = lay(S);
  const sub = SUBS.find((s) => t >= s.from - 0.001 && t < s.to);
  if (!sub) return;
  const a = Math.min(range(t, sub.from, sub.from + 0.1), 1 - range(t, sub.to - 0.1, sub.to));
  const size = Ly.subSize, words = sub.text.split(' ');
  const keyAt = new Array(words.length).fill(null);
  for (const k of sub.keys || []) {
    const kw = k.text.split(' ').map(bare);
    for (let i = 0; i + kw.length <= words.length; i++) {
      if (kw.every((w, j) => bare(words[i + j]) === w)) { for (let j = 0; j < kw.length; j++) keyAt[i + j] = k.t; break; }
    }
  }
  const lines = wrap(S, sub.text, size, 600, 'ui', Ly.subMax - 70 * u);
  const lh = size * u * 1.32, space = measure(S, ' ', size, 600);
  const widths = lines.map((ln) => ln.reduce((s, w, i) => s + measure(S, w, size, 600) + (i ? space : 0), 0));
  const bw = Math.max(...widths) + 64 * u, bh = lh * lines.length + 34 * u;
  const cx = S.W / 2, top = Ly.subY - bh / 2;
  g.save(); g.globalAlpha = a;
  g.fillStyle = 'rgba(0,0,0,0.6)'; S.rrect(cx - bw / 2, top, bw, bh, lines.length === 1 ? bh / 2 : 30 * u); g.fill();
  let wi = 0;
  lines.forEach((ln, li) => {
    let x = cx - widths[li] / 2;
    const y = top + 17 * u + lh * li + lh * 0.72;
    for (const w of ln) {
      const kt = keyAt[wi++];
      const lit = kt == null ? 0 : range(t, kt, kt + 0.1);
      x += S.text(w, x, y, { size, weight: 600, color: mixColor('#FFFFFF', P.amber, lit) }) + space;
    }
  });
  g.restore();
}

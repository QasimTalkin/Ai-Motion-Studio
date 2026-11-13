// The film's material: paper documents (forms, rules, policies), rubber stamps, notebooks, people,
// and the frame ("le cadre") that institutions draw around them. Documents are light paper on navy;
// institutions are blue; lived experience is amber.
import { P, sp, spring, clamp, lerp, range, hash, noise, mixColor, circle, icon, measure } from './kit.js';
import { voiceAt } from './timing.js';

export const PAPER = '#EEF2F7', PAPER2 = '#DCE3EC', INK = '#1E293B', INK2 = '#5B6B82', RULE = '#C3CCD8';

// ── paper ───────────────────────────────────────────────────────────────────
// A sheet at (x, y) w × h, with a folded corner, an optional header band and title, and ruled text bars
// that write themselves (lineP 0..1). Returns the y where free content can start.
export function paper(S, x, y, w, h, o = {}) {
  const { g, u } = S;
  const { rot = 0, alpha = 1, scale = 1, title = null, titleSize = 30, sub = null, lines = 0, lineP = 1, lineY = null,
    fold = true, band = P.blue, shadow = 1, seed = 1, tint = PAPER, lineGap = 34, lineX = 0 } = o;
  if (alpha <= 0.002 || w < 2 || h < 2) return y;
  const cx = x + w / 2, cy = y + h / 2;
  g.save(); g.globalAlpha *= clamp(alpha);
  g.translate(cx, cy); g.rotate(rot); g.scale(scale, scale); g.translate(-cx, -cy);
  if (shadow) { g.fillStyle = `rgba(2,6,23,${0.42 * shadow})`; S.rrect(x + 12 * u, y + 16 * u, w, h, 8 * u); g.fill(); }
  const f = fold ? Math.min(w, h) * 0.11 : 0, r = 8 * u;
  g.fillStyle = tint;
  g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - f, y); g.lineTo(x + w, y + f); g.lineTo(x + w, y + h - r);
  g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath(); g.fill();
  if (f) { g.fillStyle = PAPER2; g.beginPath(); g.moveTo(x + w - f, y); g.lineTo(x + w - f, y + f); g.lineTo(x + w, y + f); g.closePath(); g.fill(); }
  let cy0 = y + 28 * u;
  if (band) { g.fillStyle = band; g.fillRect(x + 24 * u, y + 22 * u, 46 * u, 7 * u); cy0 = y + 46 * u; }
  if (title) { S.text(title, x + 24 * u, cy0 + titleSize * 0.8 * u, { size: titleSize, weight: 800, color: INK, tracking: 0.02 }); cy0 += titleSize * 1.25 * u; }
  if (sub) { S.text(sub, x + 24 * u, cy0 + 20 * u, { size: 20, weight: 500, face: 'mono', color: INK2, tracking: 0.04 }); cy0 += 36 * u; }
  const ly = lineY ?? cy0 + 18 * u;
  for (let i = 0; i < lines; i++) {
    const p = clamp(lineP * lines - i);
    if (p <= 0) break;
    const lw = (w - 48 * u - lineX) * (i % 4 === 3 ? 0.55 : 0.72 + 0.26 * hash(i, seed));
    g.fillStyle = RULE; S.rrect(x + 24 * u + lineX, ly + i * lineGap * u, lw * p, 11 * u, 5.5 * u); g.fill();
  }
  g.restore();
  return ly + lines * lineGap * u;
}

// A labelled form field: label in mono, a box, and a value (text, bars, or a checkbox row).
export function field(S, x, y, w, label, o = {}) {
  const { g, u } = S;
  const { value = null, h = 46, state = 0, p = 1, bars = 0, color = INK, alpha = 1 } = o;
  if (p <= 0 || alpha <= 0) return;
  g.save(); g.globalAlpha *= clamp(p * 2) * alpha;
  S.text(label, x, y, { size: 19, weight: 700, face: 'mono', color: INK2, tracking: 0.06 });
  const by = y + 12 * u, bh = h * u;
  g.fillStyle = state < 0 ? mixColor('#FFFFFF', P.amber, 0.22 * -state) : '#FFFFFF'; S.rrect(x, by, w, bh, 6 * u); g.fill();
  g.strokeStyle = state < 0 ? mixColor('#94A3B8', P.amber, -state) : state > 0 ? mixColor('#94A3B8', P.blue, state) : '#94A3B8';
  g.lineWidth = (2 + Math.abs(state) * 2) * u; S.rrect(x, by, w, bh, 6 * u); g.stroke();
  if (value) S.text(value, x + 14 * u, by + bh * 0.66, { size: 24, weight: 600, color });
  for (let i = 0; i < bars; i++) { g.fillStyle = RULE; S.rrect(x + 14 * u + i * 80 * u, by + bh / 2 - 6 * u, 64 * u, 12 * u, 6 * u); g.fill(); }
  g.restore();
}

export function checkbox(S, x, y, label, on, o = {}) {
  const { g, u } = S;
  const { size = 24, color = INK, mark = P.blue, alpha = 1 } = o;
  g.save(); g.globalAlpha *= alpha;
  g.fillStyle = '#FFFFFF'; S.rrect(x, y - 22 * u, 26 * u, 26 * u, 5 * u); g.fill();
  g.strokeStyle = '#94A3B8'; g.lineWidth = 2 * u; S.rrect(x, y - 22 * u, 26 * u, 26 * u, 5 * u); g.stroke();
  if (on > 0) icon(S, 'check', x + 13 * u, y - 9 * u, 10 * u, on, { color: mark, width: 4 });
  S.text(label, x + 38 * u, y, { size, weight: 600, color });
  g.restore();
}

// Rubber stamp: overshoots onto the page, ink with gaps.
export function stamp(S, x, y, text, t0, t, o = {}) {
  const { g, u } = S;
  const { rot = -0.18, color = P.amber, size = 44, onPaper = PAPER } = o;
  const s = spring(t - t0, [300, 15]);
  if (s <= 0) return;
  const sc = lerp(2.3, 1, clamp(s, 0, 1.15)), w = measure(S, text, size, 900, 'ui', 0.08) + 44 * u, h = size * 1.55 * u;
  g.save(); g.globalAlpha *= clamp(s * 3); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  g.strokeStyle = color; g.lineWidth = 5 * u; S.rrect(-w / 2, -h / 2, w, h, 10 * u); g.stroke();
  g.lineWidth = 2 * u; S.rrect(-w / 2 + 8 * u, -h / 2 + 8 * u, w - 16 * u, h - 16 * u, 6 * u); g.stroke();
  S.text(text, 0, size * 0.36 * u, { size, weight: 900, color, align: 'center', tracking: 0.08 });
  g.fillStyle = onPaper;                                    // ink gaps
  for (let i = 0; i < 26; i++) circle(g, (hash(i, 61) - 0.5) * w, (hash(i, 62) - 0.5) * h, (1 + 2.5 * hash(i, 63)) * u), g.fill();
  g.restore();
}

// Notebook (lived experience): amber cover edge, rings, handwritten lines in the display italic.
export function notebook(S, x, y, w, h, o = {}) {
  const { g, u } = S;
  const { alpha = 1, rot = 0, title = null, lines = [], lineP = 1, size = 28, t = 0 } = o;
  if (alpha <= 0) return;
  g.save(); g.globalAlpha *= clamp(alpha);
  g.translate(x + w / 2, y + h / 2); g.rotate(rot); g.translate(-x - w / 2, -y - h / 2);
  g.fillStyle = 'rgba(2,6,23,0.42)'; S.rrect(x + 12 * u, y + 16 * u, w, h, 12 * u); g.fill();
  g.fillStyle = P.amber; S.rrect(x - 8 * u, y - 6 * u, w + 14 * u, h + 12 * u, 14 * u); g.fill();
  g.fillStyle = '#FFF8EC'; S.rrect(x, y, w, h, 10 * u); g.fill();
  g.strokeStyle = 'rgba(245,158,11,0.25)'; g.lineWidth = 2 * u;
  for (let yy = y + 70 * u; yy < y + h - 20 * u; yy += size * 1.45 * u) { g.beginPath(); g.moveTo(x + 50 * u, yy); g.lineTo(x + w - 20 * u, yy); g.stroke(); }
  g.strokeStyle = 'rgba(245,158,11,0.5)'; g.beginPath(); g.moveTo(x + 40 * u, y + 10 * u); g.lineTo(x + 40 * u, y + h - 10 * u); g.stroke();
  for (let k = 0; k < Math.floor(h / (46 * u)); k++) { g.fillStyle = P.bg; circle(g, x + 18 * u, y + (30 + k * 46) * u, 7 * u); g.fill(); }
  if (title) S.text(title, x + 56 * u, y + 48 * u, { size: 22, weight: 700, face: 'mono', color: '#B45309', tracking: 0.08 });
  lines.forEach((ln, i) => {
    const p = clamp(lineP * lines.length - i);
    if (p <= 0) return;
    const n = Math.max(1, Math.floor(ln.length * p));
    S.text(ln.slice(0, n), x + 56 * u, y + 70 * u + (i + 0.8) * size * 1.45 * u - 6 * u, { size, weight: 'italic 500', face: 'display', color: '#3B2A10' });
  });
  g.restore();
}

// ── people ──────────────────────────────────────────────────────────────────
// Outline of a standing person with feet at (x, y) and height s, as points (for morphing).
export function personPts(x, y, s, n = 96) {
  const hr = s * 0.125, hy = y - s * 0.84, sh = y - s * 0.66, bw = s * 0.2, nw = s * 0.055;
  const path = [[x - bw * 0.82, y], [x - bw, sh + s * 0.1], [x - bw * 0.88, sh + s * 0.02], [x - bw * 0.62, sh - s * 0.015], [x - nw, sh - s * 0.03]];
  const a0 = Math.PI / 2 + Math.asin(nw / hr), a1 = Math.PI * 2.5 - Math.asin(nw / hr);
  for (let i = 0; i <= 24; i++) { const a = a0 + (a1 - a0) * (i / 24); path.push([x + Math.cos(a) * hr, hy + Math.sin(a) * hr]); }
  path.push([x + nw, sh - s * 0.03], [x + bw * 0.62, sh - s * 0.015], [x + bw * 0.88, sh + s * 0.02], [x + bw, sh + s * 0.1], [x + bw * 0.82, y]);
  return resample(path, n);
}
export function rectPts(x, y, w, h, n = 96) {
  // starts bottom-left, goes up the left side, across the top, down the right: same order as personPts
  return resample([[x, y + h], [x, y], [x + w, y], [x + w, y + h]], n);
}
function resample(path, n) {
  const seg = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  const total = seg.reduce((a, b) => a + b, 0), out = [];
  for (let k = 0; k < n; k++) {
    let d = (k / (n - 1)) * total, i = 0;
    while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; }
    const f = seg[i] ? d / seg[i] : 0;
    out.push([lerp(path[i][0], path[i + 1][0], f), lerp(path[i][1], path[i + 1][1], f)]);
  }
  return out;
}
export function fillPts(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); }

// A person as a pictogram: head, torso, arms and legs as capsules, the far limbs a shade darker.
// Breathing and a slight sway are pure functions of t. arms: 0 down, 1 raised (talking / reaching).
export function figure(S, x, y, s, o = {}) {
  const { g, u } = S;
  const { color = P.amber, alpha = 1, t = 0, seed = 0, arms = 0, face = 0 } = o;
  if (alpha <= 0 || s <= 1) return;
  const br = Math.sin(t * 2.2 + seed * 1.7), sw = Math.sin(t * 0.9 + seed) * 0.012 * s;
  const dark = mixColor(color, '#0F172A', 0.28);
  const cap = (x0, y0, x1, y1, w, c) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
  g.save(); g.globalAlpha *= clamp(alpha);
  const hipY = y - 0.4 * s, shY = y - 0.74 * s + br * 0.004 * s, lw = 0.1 * s, aw = 0.078 * s;
  // legs
  cap(x - 0.055 * s, hipY, x - 0.07 * s + sw * 0.3, y - lw / 2, lw, dark);
  cap(x + 0.055 * s, hipY, x + 0.07 * s + sw * 0.3, y - lw / 2, lw, color);
  // far arm
  const ra = arms * (0.5 + 0.12 * Math.sin(t * 6 + seed));
  cap(x - 0.165 * s + sw, shY + aw * 0.4, x - 0.2 * s + sw - ra * 0.05 * s, shY + (0.36 - ra * 0.5) * s, aw, dark);
  // torso
  g.fillStyle = color; g.beginPath();
  const tw = 0.15 * s, bwd = 0.115 * s, r = 0.06 * s;
  g.moveTo(x - tw + sw + r, shY); g.lineTo(x + tw + sw - r, shY); g.quadraticCurveTo(x + tw + sw, shY, x + tw + sw, shY + r);
  g.lineTo(x + bwd, hipY + 0.02 * s); g.quadraticCurveTo(x + bwd, hipY + 0.06 * s, x + bwd - r * 0.6, hipY + 0.06 * s);
  g.lineTo(x - bwd + r * 0.6, hipY + 0.06 * s); g.quadraticCurveTo(x - bwd, hipY + 0.06 * s, x - bwd, hipY + 0.02 * s);
  g.lineTo(x - tw + sw, shY + r); g.quadraticCurveTo(x - tw + sw, shY, x - tw + sw + r, shY); g.closePath(); g.fill();
  // near arm
  cap(x + 0.165 * s + sw, shY + aw * 0.4, x + 0.2 * s + sw + ra * 0.08 * s, shY + (0.36 - ra * 0.62) * s, aw, color);
  // head, with a highlight
  const hx = x + sw * 1.4, hy = y - 0.87 * s + br * 0.003 * s, hr = 0.105 * s;
  g.fillStyle = color; circle(g, hx, hy, hr); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.16)'; circle(g, hx - hr * 0.3, hy - hr * 0.3, hr * 0.45); g.fill();
  if (face) { g.fillStyle = 'rgba(15,23,42,0.55)'; circle(g, hx + hr * 0.38, hy - hr * 0.05, hr * 0.12); g.fill(); }
  g.restore();
}

// Voice bars beside a speaker: they follow the real voice track while the line plays.
export function voiceBars(S, x, y, t, line, o = {}) {
  const { g, u } = S;
  const { color = P.amber, n = 7, h = 60 } = o;
  const on = range(t, line.start - 0.1, line.start + 0.1) * (1 - range(t, line.end, line.end + 0.25));
  if (on <= 0) return;
  for (let i = 0; i < n; i++) {
    const v = voiceAt(t - Math.abs(i - (n - 1) / 2) * 0.035) * (0.55 + 0.45 * hash(i, 77));
    const bh = Math.max(6, v * h) * u * on;
    g.fillStyle = color; S.rrect(x + i * 12 * u, y - bh / 2, 7 * u, bh, 3.5 * u); g.fill();
  }
}

// ── the frame (le cadre) ────────────────────────────────────────────────────
// Corner brackets + thin edges; label tab on top.
export function cadre(S, x, y, w, h, o = {}) {
  const { g, u } = S;
  const { color = P.blue, alpha = 1, label = null, edge = 0.35, bw = 5, arm = 0.18 } = o;
  if (alpha <= 0 || w <= 2 || h <= 2) return;
  g.save(); g.globalAlpha *= clamp(alpha);
  g.strokeStyle = color; g.lineCap = 'round';
  g.globalAlpha *= edge; g.lineWidth = 2 * u; g.strokeRect(x, y, w, h); g.globalAlpha /= edge;
  const a = Math.min(w, h) * arm; g.lineWidth = bw * u;
  [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([cx, cy, dx, dy]) => {
    g.beginPath(); g.moveTo(cx + dx * a, cy); g.lineTo(cx, cy); g.lineTo(cx, cy + dy * a); g.stroke();
  });
  if (label) {
    const tw = measure(S, label, 18, 700, 'mono', 0.1) + 20 * u;
    g.fillStyle = color; S.rrect(x, y - 30 * u, tw, 26 * u, 5 * u); g.fill();
    S.text(label, x + 10 * u, y - 11 * u, { size: 18, weight: 700, face: 'mono', color: P.bg, tracking: 0.1 });
  }
  g.restore();
}

// ── small parts ─────────────────────────────────────────────────────────────
export function tag(S, x, y, text, o = {}) {
  const { g, u } = S;
  const { color = P.amber, alpha = 1, size = 20, fill = null, align = 'left' } = o;
  if (alpha <= 0) return 0;
  const w = measure(S, text, size, 700, 'mono', 0.1) + 22 * u, h = size * 1.5 * u, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  g.save(); g.globalAlpha *= clamp(alpha);
  if (fill) { g.fillStyle = fill; S.rrect(x0, y - h / 2, w, h, h / 2); g.fill(); }
  g.strokeStyle = color; g.lineWidth = 2 * u; S.rrect(x0, y - h / 2, w, h, h / 2); g.stroke();
  S.text(text, x0 + 11 * u, y + size * 0.36 * u, { size, weight: 700, face: 'mono', color, tracking: 0.1 });
  g.restore();
  return w;
}

// Line that draws itself from (x0, y0) to (x1, y1), with an arrowhead and optional dash.
export function arrow(S, x0, y0, x1, y1, p, o = {}) {
  const { g, u } = S;
  const { color = P.blue, width = 4, head = 16, dash = null, bend = 0, alpha = 1 } = o;
  if (p <= 0 || alpha <= 0) return;
  const mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend;
  const pt = (s) => [(1 - s) ** 2 * x0 + 2 * (1 - s) * s * mx + s * s * x1, (1 - s) ** 2 * y0 + 2 * (1 - s) * s * my + s * s * y1];
  g.save(); g.globalAlpha *= clamp(alpha);
  g.strokeStyle = color; g.lineWidth = width * u; g.lineCap = 'round';
  if (dash) g.setLineDash(dash.map((d) => d * u));
  g.beginPath(); const n = 30;
  for (let i = 0; i <= n * clamp(p); i++) { const [x, y] = pt(i / n); i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke(); g.setLineDash([]);
  if (head && p > 0.2) {
    const s = clamp(p), [ex, ey] = pt(s), [bx, by] = pt(Math.max(0, s - 0.04)), a = Math.atan2(ey - by, ex - bx);
    g.fillStyle = color; g.beginPath(); g.moveTo(ex, ey);
    g.lineTo(ex - Math.cos(a - 0.45) * head * u, ey - Math.sin(a - 0.45) * head * u);
    g.lineTo(ex - Math.cos(a + 0.45) * head * u, ey - Math.sin(a + 0.45) * head * u); g.closePath(); g.fill();
  }
  g.restore();
}

// Point on the same quadratic as arrow() (for things that travel along it).
export function along(x0, y0, x1, y1, s, bend = 0) {
  const mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend;
  return [(1 - s) ** 2 * x0 + 2 * (1 - s) * s * mx + s * s * x1, (1 - s) ** 2 * y0 + 2 * (1 - s) * s * my + s * s * y1];
}

// Words revealed in time with a line that has no word marks (the testimonies): each word appears at a
// time proportional to its position in the spoken line, weighted by length.
export function wordTimes(text, t0, t1) {
  const words = text.split(' '), wts = words.map((w) => w.replace(/[^\p{L}]/gu, '').length + 1.5);
  const tot = wts.reduce((a, b) => a + b, 0);
  let acc = 0;
  return words.map((w, i) => { const at = t0 + (acc / tot) * (t1 - t0); acc += wts[i]; return at; });
}

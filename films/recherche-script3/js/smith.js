// S  Dorothy Smith. The institution sees case numbers; neglect greys them; one turns amber and we dive
//    into it: a home, a kitchen table, children, a clock — the situated standpoint. A thread ties her to a text.
// SX the definition: knowledge born of concrete experience, where she lives and where she works.
// S2 a magnifier follows the thread to the text; the method's name assembles from paper strips.
// S3 ?→4: "4 assises", four foundation stones under the EI monogram.
import { P, ORG, TYPE, SNAP, HEAVY, sp, spring, clamp, lerp, range, track, hash, noise, swapAlpha, typed, mixColor,
  measure, fitSize, circle, icon, odometer, paragraph } from './kit.js';
import { L, T } from './timing.js';
import { PAPER, INK, INK2, RULE, paper, figure, voiceBars, cadre, tag, arrow, along, stamp } from './paper.js';

const { s1, sx, s2, s3 } = L;

export function layS(S) {
  const { W, H, u } = S;
  return S.pick({
    portrait: { nx: 84 * u, ny: 330 * u, ns: 76, zx: 84 * u, zy: 560 * u, zw: W - 168 * u, zh: 900 * u, cols: 8, rows: 9 },
    landscape: { nx: 150 * u, ny: 330 * u, ns: 70, zx: 940 * u, zy: 110 * u, zw: 860 * u, zh: 780 * u, cols: 9, rows: 8 },
  });
}
const HOT = [5, 3];                                   // the case we dive into (row, col)

// The home: a lamp, a window at night, a wall clock, a calendar, a table with papers, her and two children.
function home(t, S, x, y, w, h, o = {}) {
  const { g, u } = S;
  const { alpha = 1, label = true } = o;
  if (alpha <= 0) return;
  g.save(); g.globalAlpha *= alpha;
  g.beginPath(); S.rrect(x, y, w, h, 22 * u); g.clip();
  g.fillStyle = '#16213A'; g.fillRect(x, y, w, h);
  const floor = y + h * 0.78;
  g.fillStyle = '#111A2E'; g.fillRect(x, floor, w, h - (floor - y));
  // lamp glow
  const lg = g.createRadialGradient(x + w * 0.52, y + h * 0.18, 0, x + w * 0.52, y + h * 0.18, w * 0.6);
  lg.addColorStop(0, 'rgba(245,158,11,0.22)'); lg.addColorStop(1, 'rgba(245,158,11,0)');
  g.fillStyle = lg; g.fillRect(x, y, w, h);
  g.strokeStyle = P.slate; g.lineWidth = 2 * u; g.beginPath(); g.moveTo(x + w * 0.52, y); g.lineTo(x + w * 0.52, y + h * 0.12); g.stroke();
  g.fillStyle = P.amber; g.beginPath(); g.moveTo(x + w * 0.47, y + h * 0.17); g.lineTo(x + w * 0.57, y + h * 0.17); g.lineTo(x + w * 0.545, y + h * 0.12); g.lineTo(x + w * 0.495, y + h * 0.12); g.closePath(); g.fill();
  // window with the night outside
  const wx = x + w * 0.07, wy = y + h * 0.12, ww = w * 0.26, wh = h * 0.3;
  g.fillStyle = '#0A1226'; g.fillRect(wx, wy, ww, wh);
  g.fillStyle = '#E2E8F0'; circle(g, wx + ww * 0.7, wy + wh * 0.3, 12 * u); g.fill();
  g.fillStyle = '#0A1226'; circle(g, wx + ww * 0.7 + 6 * u, wy + wh * 0.3 - 4 * u, 11 * u); g.fill();
  for (let k = 0; k < 7; k++) { g.fillStyle = `rgba(226,232,240,${0.3 + 0.5 * hash(k, 3)})`; circle(g, wx + ww * hash(k, 4), wy + wh * hash(k, 5), 1.6 * u); g.fill(); }
  g.strokeStyle = P.slate; g.lineWidth = 4 * u; g.strokeRect(wx, wy, ww, wh);
  g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh / 2); g.lineTo(wx + ww, wy + wh / 2); g.stroke();
  // wall clock running fast: the evening goes by
  const cx = x + w * 0.82, cy = y + h * 0.2, cr = Math.min(w, h) * 0.08;
  g.fillStyle = PAPER; circle(g, cx, cy, cr); g.fill(); g.strokeStyle = P.slate; g.lineWidth = 3 * u; circle(g, cx, cy, cr); g.stroke();
  const hm = (t * 0.9) % (Math.PI * 2);
  g.strokeStyle = INK; g.lineCap = 'round';
  g.lineWidth = 3 * u; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(hm) * cr * 0.75, cy - Math.cos(hm) * cr * 0.75); g.stroke();
  g.lineWidth = 4 * u; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(hm / 12 + 2.6) * cr * 0.5, cy - Math.cos(hm / 12 + 2.6) * cr * 0.5); g.stroke();
  // calendar on the wall
  const kx = x + w * 0.68, ky = y + h * 0.36, kw = w * 0.2, kh = h * 0.2;
  g.fillStyle = PAPER; g.fillRect(kx, ky, kw, kh); g.fillStyle = P.amber; g.fillRect(kx, ky, kw, kh * 0.18);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { g.fillStyle = (r * 5 + c) % 3 ? RULE : P.amber; g.fillRect(kx + kw * (0.08 + c * 0.18), ky + kh * (0.3 + r * 0.22), kw * 0.12, kh * 0.13); }
  // table with papers and a laptop
  const tx = x + w * 0.36, ty = floor - h * 0.2, tw = w * 0.5;
  g.fillStyle = '#2B3A52'; g.fillRect(tx, ty, tw, 12 * u);
  g.fillStyle = '#26354D'; g.fillRect(tx + 14 * u, ty + 12 * u, 10 * u, floor - ty - 12 * u); g.fillRect(tx + tw - 24 * u, ty + 12 * u, 10 * u, floor - ty - 12 * u);
  g.save(); g.translate(tx + tw * 0.62, ty); g.rotate(-0.08); g.fillStyle = PAPER; g.fillRect(-40 * u, -8 * u, 80 * u, 8 * u); g.restore();
  g.fillStyle = P.slate; g.fillRect(tx + tw * 0.2, ty - 50 * u, 80 * u, 50 * u); g.fillStyle = 'rgba(147,197,253,0.6)'; g.fillRect(tx + tw * 0.2 + 6 * u, ty - 44 * u, 68 * u, 38 * u);
  // her, and the children
  figure(S, x + w * 0.3, floor, h * 0.52, { color: P.amber, t, seed: 2 });
  figure(S, x + w * 0.14, floor, h * 0.27, { color: '#FBBF24', t, seed: 5 });
  figure(S, x + w * 0.9, floor, h * 0.22, { color: '#FBBF24', t, seed: 6 });
  g.restore();
  g.save(); g.globalAlpha *= alpha; g.strokeStyle = 'rgba(245,158,11,0.5)'; g.lineWidth = 2 * u; S.rrect(x, y, w, h, 22 * u); g.stroke(); g.restore();
}

function work(t, S, x, y, w, h, alpha) {
  const { g, u } = S;
  if (alpha <= 0) return;
  g.save(); g.globalAlpha *= alpha;
  g.beginPath(); S.rrect(x, y, w, h, 22 * u); g.clip();
  g.fillStyle = '#152238'; g.fillRect(x, y, w, h);
  const floor = y + h * 0.8;
  g.fillStyle = '#101A2D'; g.fillRect(x, floor, w, h);
  // office windows grid, a desk, two screens, a colleague, the clock in/out terminal
  for (let c = 0; c < 4; c++) { g.fillStyle = 'rgba(147,197,253,0.12)'; g.fillRect(x + w * (0.06 + c * 0.12), y + h * 0.1, w * 0.09, h * 0.3); }
  g.fillStyle = '#2B3A52'; g.fillRect(x + w * 0.42, floor - h * 0.2, w * 0.5, 12 * u);
  [0.5, 0.7].forEach((k) => { g.fillStyle = P.slate; g.fillRect(x + w * k, floor - h * 0.2 - 54 * u, 70 * u, 46 * u); g.fillStyle = 'rgba(59,130,246,0.6)'; g.fillRect(x + w * k + 5 * u, floor - h * 0.2 - 49 * u, 60 * u, 36 * u); });
  g.fillStyle = P.card2; g.fillRect(x + w * 0.08, floor - h * 0.5, w * 0.1, h * 0.5);
  S.text('08:57', x + w * 0.13, floor - h * 0.38, { size: 20, weight: 700, face: 'mono', color: P.amber, align: 'center' });
  figure(S, x + w * 0.3, floor, h * 0.55, { color: P.amber, t, seed: 4 });
  figure(S, x + w * 0.86, floor, h * 0.5, { color: P.blue, t, seed: 9 });
  g.restore();
  g.save(); g.globalAlpha *= alpha; g.strokeStyle = 'rgba(245,158,11,0.5)'; g.lineWidth = 2 * u; S.rrect(x, y, w, h, 22 * u); g.stroke(); g.restore();
}

function pin(S, x, y, s, label, color = P.amber) {
  const { g, u } = S;
  if (s <= 0) return;
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = color; g.beginPath(); g.arc(0, -46 * u, 24 * u, Math.PI * 0.82, Math.PI * 2.18); g.lineTo(0, 0); g.closePath(); g.fill();
  g.fillStyle = P.bg; circle(g, 0, -46 * u, 9 * u); g.fill();
  if (label) S.text(label, 34 * u, -38 * u, { size: 24, weight: 800, face: 'mono', color, tracking: 0.1 });
  g.restore();
}

// ── S1 + SX ─────────────────────────────────────────────────────────────────
export function chapterS(t, S) {
  const { g, W, H, u } = S;
  const Z = layS(S), m = s1.marks, mx = sx.marks;
  const out = clamp(sp(t - (s2.start - 0.35), [130, 22]));
  if (out >= 1) return;
  g.save(); g.globalAlpha = 1 - out; g.translate(0, -out * 200 * u);
  // name card → definition card
  const nA = swapAlpha(t, T.S + 0.1, sx.start - 0.25), dA = swapAlpha(t, sx.start - 0.1);
  if (nA > 0) {
    const ns = fitSize(S, 'Dorothy E. Smith', 600, 'display', S.pick({ portrait: W * 0.84, landscape: 720 * u }), Z.ns);
    S.text('Dorothy E. Smith', Z.nx, Z.ny + (1 - sp(t - m.ds + 0.1)) * 30 * u, { size: ns, weight: 600, face: 'display', color: P.ink, alpha: nA });
    S.text(typed('SOCIOLOGUE CANADIENNE · 1926–2022', t - m.ds - 0.2, 40), Z.nx + 2 * u, Z.ny + 58 * u, { size: 24, weight: 700, face: 'mono', color: P.amber, tracking: 0.08, alpha: nA });
  }
  if (dA > 0) {
    S.text('Point de vue situé', Z.nx, Z.ny + (1 - sp(t - mx.a)) * 30 * u, { size: Z.ns - 6, weight: 600, face: 'display', color: P.amber, alpha: dA });
    paragraph(S, t, '= un savoir né de l’expérience concrète', Z.nx, Z.ny + 66 * u, { size: 36, weight: 'italic 400', face: 'display', color: P.ink, maxW: S.pick({ portrait: W * 0.84, landscape: 720 * u }), alpha: dA * range(t, mx.b - 0.1, mx.b + 0.2),
      marks: [{ phrase: 'expérience concrète', t: mx.exp, color: P.amber }] });
  }

  // the institution's view: identical case numbers
  const dive = sp(t - T.DIVE, [45, 14]);
  const cw = Z.zw / Z.cols, ch = Z.zh / Z.rows;
  const hx = Z.zx + (HOT[1] + 0.5) * cw, hy = Z.zy + (HOT[0] + 0.5) * ch;
  const zoom = lerp(1, 14, dive);
  if (dive < 0.98) {
    g.save();
    g.beginPath(); g.rect(Z.zx - 20 * u, Z.zy - 60 * u, Z.zw + 40 * u, Z.zh + 80 * u); g.clip();
    g.translate(hx, hy); g.scale(zoom, zoom); g.translate(-hx, -hy);
    tag(S, Z.zx, Z.zy - 30 * u, 'VUE DE L’INSTITUTION', { color: P.sky, alpha: range(t, m.inst - 0.2, m.inst + 0.2) * (1 - dive) });
    const neg = sp(t - m.neg, [60, 16]);
    for (let r = 0; r < Z.rows; r++) for (let c = 0; c < Z.cols; c++) {
      const k = r * Z.cols + c, hot = r === HOT[0] && c === HOT[1];
      const s = spring(t - (m.inst - 0.3 + (c + r) * 0.03), [220, 18]);
      if (s <= 0) continue;
      const x = Z.zx + c * cw + 6 * u, y = Z.zy + r * ch + 6 * u, w = cw - 12 * u, h = ch - 12 * u;
      const amb = hot ? sp(t - m.exp, [170, 18]) : 0;
      const grey = (1 - amb) * neg;
      g.save(); g.globalAlpha *= clamp(s * 2) * (1 - 0.6 * grey);
      g.translate(x + w / 2, y + h / 2); g.scale(clamp(s, 0, 1.1) * (1 + 0.15 * amb), clamp(s, 0, 1.1) * (1 + 0.15 * amb)); g.translate(-x - w / 2, -y - h / 2);
      g.fillStyle = mixColor(mixColor('#1D3A6E', P.slate, grey), P.amber, amb); S.rrect(x, y, w, h, 10 * u); g.fill();
      g.fillStyle = mixColor(P.sky, P.bg, amb); circle(g, x + w / 2, y + h * 0.36, h * 0.13); g.fill();
      g.beginPath(); g.ellipse(x + w / 2, y + h * 0.74, h * 0.2, h * 0.14, 0, Math.PI, Math.PI * 2); g.fill();
      S.text('#' + String(1000 + Math.floor(hash(k, 17) * 8999)), x + w / 2, y + h - 6 * u, { size: 13, weight: 600, face: 'mono', color: amb > 0.5 ? P.bg : P.dim, align: 'center' });
      g.restore();
    }
    if (neg > 0 && neg < 1) {                                  // a scan passes: neglected
      const sy = Z.zy + Z.zh * neg;
      g.fillStyle = 'rgba(147,197,253,0.18)'; g.fillRect(Z.zx, sy - 8 * u, Z.zw, 16 * u);
    }
    g.restore();
  }
  // the situated standpoint: her home, where the dot was
  const hA = range(dive, 0.45, 0.9);
  const split = sp(t - mx.loc + 0.1, [120, 20]);
  if (hA > 0) {
    const hh = lerp(Z.zh, Z.zh * 0.48, split);
    home(t, S, Z.zx, Z.zy, S.pick({ portrait: Z.zw, landscape: lerp(Z.zw, Z.zw * 0.49, split) }), S.pick({ portrait: hh, landscape: Z.zh * lerp(1, 0.7, split) }), { alpha: hA });
    pin(S, Z.zx + Z.zw * S.pick({ portrait: 0.3, landscape: lerp(0.3, 0.15, split) }), Z.zy + S.pick({ portrait: hh * 0.22, landscape: Z.zh * 0.22 }), spring(t - (m.pv + 0.2), [260, 15]), 'ICI');
    tag(S, Z.zx + 20 * u, Z.zy + 40 * u, 'POINT DE VUE SITUÉ', { color: P.amber, fill: P.bg, alpha: range(t, m.pv + 0.3, m.pv + 0.6) * (1 - split) });
    // the relationship: a thread from her up to the institution's text
    const rl = sp(t - m.rel + 0.1, [70, 16]) * (1 - split);
    if (rl > 0) {
      const dx = Z.zx + Z.zw * 0.62, dy = Z.zy - S.pick({ portrait: 30, landscape: 0 }) * u;
      paper(S, dx, dy + 30 * u, Z.zw * 0.3, Z.zw * 0.2, { title: 'RÈGLEMENT', titleSize: 20, lines: 2, alpha: rl, rot: 0.04, seed: 21 });
      arrow(S, Z.zx + Z.zw * 0.3, Z.zy + Z.zh * 0.42, dx + Z.zw * 0.1, dy + Z.zw * 0.2 + 34 * u, rl, { color: P.amber, dash: [12, 9], width: 3, bend: 0.2, head: 0 });
      S.text('rapport', Z.zx + Z.zw * 0.5, Z.zy + Z.zh * 0.3, { size: 28, weight: 'italic 600', face: 'display', color: P.amber, align: 'center', alpha: rl });
    }
    if (split > 0) {
      const [wx, wy, ww, wh] = S.pick({ portrait: [Z.zx, Z.zy + Z.zh * 0.52, Z.zw, Z.zh * 0.48], landscape: [Z.zx + Z.zw * 0.51, Z.zy, Z.zw * 0.49, Z.zh * 0.7] });
      work(t, S, wx + (1 - split) * 120 * u, wy, ww, wh, split);
      tag(S, Z.zx + 20 * u, S.pick({ portrait: Z.zy + hh - 30 * u, landscape: Z.zy + Z.zh * 0.7 - 30 * u }), 'LÀ OÙ ELLE VIT', { color: P.amber, fill: P.bg, alpha: range(t, mx.loc, mx.loc + 0.2) });
      tag(S, wx + 20 * u, wy + wh - 30 * u, 'ET TRAVAILLE', { color: P.amber, fill: P.bg, alpha: range(t, mx.work, mx.work + 0.2) });
    }
    // knowledge born of experience: chips rise from her
    const KN = [['calendar', 'horaires'], ['people', 'soins'], ['arrowUp', 'trajets'], ['clipboard', 'contraintes']];
    KN.forEach(([ic, w], i) => {
      const tt = t - (mx.b + 0.2 + i * 0.3);
      if (tt <= 0 || t > s2.start) return;
      const s = spring(tt, ORG), drift = tt * 26 * u;
      const bx = S.pick({ portrait: Z.zx + Z.zw * (0.46 + (i % 2) * 0.24), landscape: Z.zx + Z.zw * (0.1 + i * 0.22) });
      const by = S.pick({ portrait: Z.zy + 90 * u + Math.floor(i / 2) * 70 * u, landscape: Z.zy + Z.zh * 0.78 + 20 * u }) - drift * 0.3;
      const ww = measure(S, w, 24, 700) + 66 * u;
      g.save(); g.globalAlpha *= clamp(s * 2); g.translate(bx, by); g.scale(clamp(s, 0, 1.1), clamp(s, 0, 1.1));
      g.fillStyle = P.amber; S.rrect(0, -22 * u, ww, 44 * u, 22 * u); g.fill();
      icon(S, ic, 24 * u, 0, 11 * u, 1, { color: P.bg, width: 3 });
      S.text(w, 44 * u, 8 * u, { size: 24, weight: 700, color: P.bg });
      g.restore();
    });
  }
  g.restore();
}

// ── S2 + S3 ─────────────────────────────────────────────────────────────────
const DISCOURSE = ['Le candidat doit fournir', 'les pièces exigées.', 'Tout retard entraîne', 'l’annulation du dossier.'];
export function chapterEI(t, S) {
  const { g, W, H, u } = S;
  const Z = layS(S), m = s2.marks, m3 = s3.marks;
  const out = clamp(sp(t - T.F1, [130, 22]));
  const inn = range(t, s2.start - 0.4, s2.start);
  if (inn <= 0 || out >= 1) return;
  g.save(); g.globalAlpha = inn * (1 - out); g.translate(0, -out * 240 * u);
  const lock = sp(t - T.EI, [110, 20]);                     // the study scene folds away for the name
  // study: person at the bottom, the institution's text at the top, the thread between them
  if (lock < 1) {
    g.save(); g.globalAlpha *= 1 - lock; g.translate(0, -lock * 100 * u);
    const [px, py, ph] = S.pick({ portrait: [W * 0.28, Z.zy + Z.zh * 0.95, 280 * u], landscape: [Z.zx + 120 * u, Z.zy + Z.zh * 0.95, 260 * u] });
    const [dx, dy, dw] = S.pick({ portrait: [W * 0.42, Z.zy - 40 * u, W * 0.5], landscape: [Z.zx + Z.zw * 0.38, Z.zy, Z.zw * 0.56] });
    const big = sp(t - m.disc + 0.1, [120, 18]);
    const dh = dw * lerp(0.7, 1.05, big);
    figure(S, px, py, ph, { color: P.amber, t });
    const x0 = px + 20 * u, y0 = py - ph * 0.9, x1 = dx + dw * 0.2, y1 = dy + dh;
    arrow(S, x0, y0, x1, y1, sp(t - s2.start + 0.3, [60, 15]), { color: P.amber, dash: [12, 9], width: 3, bend: -0.15, head: 0 });
    const yy = paper(S, dx, dy, dw, dh, { title: 'RÈGLEMENT', sub: 'ART. 7 · ADMISSION', lines: 0, seed: 31 });
    DISCOURSE.forEach((ln, i) => {
      const s = sp(t - (m.disc + i * 0.18), [170, 24]);
      if (s <= 0) return;
      const ly = yy + 30 * u + i * 46 * u;
      g.fillStyle = `rgba(245,158,11,${0.35 * s})`; g.fillRect(dx + 22 * u, ly - 26 * u, (measure(S, ln, 28, 600) + 8 * u) * s, 36 * u);
      S.text(ln, dx + 26 * u, ly, { size: 28, weight: 600, color: INK, alpha: s });
    });
    // "une méthode inédite": stamped across the institution's text
    stamp(S, dx + dw * 0.52, dy + dh * 0.62, 'MÉTHODE INÉDITE', m.c + 0.1, t, { rot: -0.14, size: S.pick({ portrait: 36, landscape: 34 }) });
    // the magnifier follows the thread, from her to the text
    const mg = sp(t - m.b, [40, 14]);
    if (mg > 0) {
      const [mx, my] = along(x0, y0, x1, y1, clamp(mg), -0.15), r = 54 * u;
      g.strokeStyle = P.ink; g.lineWidth = 7 * u; circle(g, mx, my, r); g.stroke();
      g.lineCap = 'round'; g.lineWidth = 12 * u; g.beginPath(); g.moveTo(mx + r * 0.72, my + r * 0.72); g.lineTo(mx + r * 1.45, my + r * 1.45); g.stroke();
      g.fillStyle = 'rgba(147,197,253,0.12)'; circle(g, mx, my, r - 4 * u); g.fill();
    }
    const nw = S.pick({ portrait: 0, landscape: 0 });
    tag(S, S.pick({ portrait: 84 * u, landscape: Z.nx }), S.pick({ portrait: 330 * u, landscape: 330 * u }), 'ÉTUDIER LE RAPPORT', { color: P.amber, alpha: range(t, m.b, m.b + 0.3) });
    S.text('ou le discours institutionnel', S.pick({ portrait: 84 * u, landscape: Z.nx }), S.pick({ portrait: 410 * u, landscape: 410 * u }),
      { size: 44, weight: 'italic 400', face: 'display', color: P.ink, alpha: range(t, m.disc, m.disc + 0.3) });
    g.restore();
  }
  // the name, from paper strips
  if (lock > 0) {
    const words = ['Ethnographie', 'institutionnelle'];
    const size = fitSize(S, 'institutionnelle', 700, 'display', S.pick({ portrait: W * 0.84, landscape: 760 * u }), S.pick({ portrait: 128, landscape: 112 }));
    const [x0, y0] = S.pick({ portrait: [84 * u, 640 * u], landscape: [150 * u, 420 * u] });
    const up = sp(t - m3.a, [110, 20]) * S.pick({ portrait: 80, landscape: 120 }) * u;
    words.forEach((w, wi) => {
      let x = x0;
      [...w].forEach((ch, ci) => {
        const s = spring(t - (m.ei - 0.25 + wi * 0.3 + ci * 0.03), [240, 20]);
        const cw = measure(S, ch, size, 700, 'display');
        if (s > 0) {
          const y = y0 + wi * size * 1.05 * u - up;
          g.save(); g.globalAlpha *= clamp(s * 2);
          g.translate(x + cw / 2, y - size * 0.35 * u); g.rotate((1 - clamp(s)) * (hash(ci, wi) - 0.5) * 0.8); g.translate(-x - cw / 2, -y + size * 0.35 * u);
          g.fillStyle = PAPER; g.fillRect(x - 3 * u, y - size * 0.8 * u + (1 - clamp(s)) * 40 * u, cw + 6 * u, size * 0.98 * u);
          S.text(ch, x, y + (1 - clamp(s)) * 40 * u, { size, weight: 700, face: 'display', color: (ci === 0) ? '#B45309' : INK });
          g.restore();
        }
        x += cw;
      });
    });
    // EI monogram
    const ms = spring(t - (m.ei + 0.7), [200, 14]);
    if (ms > 0) {
      const [mx, my, mr] = S.pick({ portrait: [W - 170 * u, 300 * u, 86 * u], landscape: [W - 260 * u, 520 * u, 120 * u] });
      g.save(); g.translate(mx, my - up * 0); g.scale(ms, ms); g.rotate((1 - clamp(ms)) * -0.6);
      g.fillStyle = P.card2; circle(g, 0, 0, mr); g.fill();
      g.strokeStyle = P.amber; g.lineWidth = 8 * u; circle(g, 0, 0, mr); g.stroke();
      g.lineWidth = 2 * u; circle(g, 0, 0, mr - 16 * u); g.stroke();
      S.text('EI', 0, mr * 0.28, { size: mr / u * 0.8, weight: 800, face: 'display', color: P.ink, align: 'center' });
      g.restore();
    }
    // S3 · four foundations: ?→4 and four stones
    const roll = sp(t - (m3.four - 0.3), SNAP) + 3 * sp(t - (m3.four - 0.05), SNAP);
    const sa = range(t, m3.a - 0.2, m3.a + 0.1);
    if (sa > 0) {
      const [ox, oy, os] = S.pick({ portrait: [84 * u, 1060 * u, 190], landscape: [150 * u, 720 * u, 150] });
      g.save(); g.globalAlpha *= sa;
      odometer(S, roll, ox, oy, os, { color: P.amber });
      const dWd = measure(S, '4', os, 800, 'ui', -0.05) + 26 * u;
      g.save(); g.beginPath(); g.rect(ox + dWd - 10 * u, oy - os * u * 0.85, W, os * u * 1.1); g.clip();
      S.text('assises', ox + dWd, oy + (1 - sp(t - m3.four)) * os * u * 1.1, { size: os * 0.8, weight: 800, color: P.ink, tracking: -0.02 });
      g.restore();
      // stones
      const [sx0, sy0, sw, sh] = S.pick({ portrait: [84 * u, 1150 * u, (W - 168 * u - 18 * u) / 2, 150 * u], landscape: [1000 * u, 690 * u, 190 * u, 150 * u] });
      const NAMES = ['Textes', 'Savoirs situés', 'Régulation', 'Confronter'];
      for (let i = 0; i < 4; i++) {
        const s = spring(t - (m3.four + 0.25 + i * 0.16), [220, 14]);
        if (s <= 0) continue;
        const col = S.pick({ portrait: i % 2, landscape: i }), row = S.pick({ portrait: Math.floor(i / 2), landscape: 0 });
        const x = sx0 + col * (sw + 18 * u), y = sy0 + row * (sh + 18 * u) - (1 - clamp(s)) * 200 * u;
        g.fillStyle = mixColor(P.card, '#3A4A63', hash(i, 3) * 0.4); S.rrect(x, y, sw, sh, 12 * u); g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 2 * u;
        for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + sw * hash(k + i * 3, 9), y); g.lineTo(x + sw * hash(k + i * 3, 10), y + sh); g.stroke(); }
        S.text(String(i + 1), x + 20 * u, y + 56 * u, { size: 52, weight: 800, color: P.blue });
        S.text(NAMES[i], x + 20 * u, y + sh - 26 * u, { size: S.pick({ portrait: 32, landscape: 24 }), weight: 700, color: P.ink });
      }
      g.restore();
    }
  }
  g.restore();
}

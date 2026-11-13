// The five steps. Each step: the question (the demo's visual), then the explanation with a running example
// (parents' schooling and children's success), every beat keyed to a spoken word.
import { P, ORG, TYPE, SNAP, HEAVY, CAM, sp, spring, clamp, lerp, range, track, hash, noise, swapAlpha, typed, mixColor,
  measure, fitSize, circle, lay, numeral, odometer, paragraph, icon, card, chip, wrap, cursor } from './kit.js';
import { L, T } from './timing.js';
import { lay3, nodePos } from './solution.js';

const { q1, x1, q2, x2, q3, x3, q4, x4, q5, x5 } = L;

// ═════ 1 · Problématique ═════════════════════════════════════════════════════
const DOTS = Array.from({ length: 84 }, (_, i) => ({ a: hash(i, 21) * Math.PI * 2, r: Math.sqrt(hash(i, 22)) * 0.9, s: 0.6 + hash(i, 23) * 0.8 }));
const BANDS = [
  { w0: 2.4, w1: 2.0, label: 'Population : élèves du primaire', at: 'who' },
  { w0: 1.9, w1: 1.5, label: 'Lieu : Montréal', at: 'where' },
  { w0: 1.4, w1: 1.0, label: 'Période : 2020–2024', at: 'when' },
];
const funnelY = (S) => S.pick({ portrait: 0, landscape: -0.12 });
const RQ = 'Le niveau de scolarité des parents influence-t-il la réussite scolaire des enfants ?';

export function step1(t, S) {
  const { g, u } = S;
  const Ly = lay(S), A = lay3(S), R = Ly.vr;
  const { q, scope, rel } = q1.marks;
  const p = sp(t - T.TX, [110, 21]);
  const [n1x, n1y] = nodePos(S, 0);
  const cx = lerp(n1x, Ly.vx, p), cy = lerp(n1y, Ly.vy, p), Rr = lerp(A.nodeR, R, p);
  const ex = sp(t - T.X1, [150, 22]);                     // target → funnel
  const tA = 1 - range(t, T.X1, T.X1 + 0.35);
  const top = Ly.vy + funnelY(S) * R - 0.8 * R, pillY = top - 0.34 * R;
  const pillText = 'Constat : écarts de réussite scolaire';
  const pillS = fitSize(S, pillText, 600, 'ui', 2.5 * R - 60 * u, 34);
  const pillW = measure(S, pillText, pillS, 600) + 60 * u, pillH = pillS * u * 2.1;

  if (tA > 0) {
    const drift = sp(t - q1.start, [8, 6]) * 0.025;
    g.save(); g.globalAlpha = tA;
    g.translate(Ly.vx, Ly.vy); g.scale(1 + drift, 1 + drift); g.translate(-Ly.vx, -Ly.vy);
    g.fillStyle = P.blue; g.globalAlpha = tA * (1 - range(p, 0, 0.35)); circle(g, cx, cy, Rr); g.fill(); g.globalAlpha = tA;
    const sweep = sp(t - (T.TX + 0.35), [60, 16]);
    g.save(); g.translate(cx, cy); g.rotate(t * 0.12); g.strokeStyle = P.slate; g.lineWidth = 3 * u;
    for (let i = 0; i < 72 * sweep; i++) {
      const a = (i / 72) * Math.PI * 2, l = i % 6 === 0 ? 22 : 10;
      g.beginPath(); g.moveTo(Math.cos(a) * (Rr + 16 * u), Math.sin(a) * (Rr + 16 * u)); g.lineTo(Math.cos(a) * (Rr + (16 + l) * u), Math.sin(a) * (Rr + (16 + l) * u)); g.stroke();
    }
    g.restore();
    const rs = R * 0.56 * spring(t - scope, ORG), lit = sp(t - scope - 0.1, [170, 26]);
    for (const [i, d] of DOTS.entries()) {
      const appear = spring(t - (T.TX + 0.28) - d.r * 0.5, ORG);
      if (appear <= 0) continue;
      const dx = Math.cos(d.a + noise(t * 0.3, i) * 0.05) * d.r * R, dy = Math.sin(d.a + noise(t * 0.3, i) * 0.05) * d.r * R;
      const inside = Math.hypot(dx, dy) < R * 0.56, relevant = Math.hypot(dx, dy) < R * 0.2;
      let col = inside ? mixColor(P.dim, P.ink, lit) : P.dim;
      if (relevant) col = mixColor(col, P.amber, sp(t - rel, SNAP));
      g.fillStyle = col; g.globalAlpha = tA * (inside ? 1 : lerp(1, 0.22, lit)) * Math.min(1, appear);
      circle(g, Ly.vx + dx, Ly.vy + dy, 5.5 * u * d.s * appear); g.fill();
    }
    g.globalAlpha = tA;
    if (rs > 0) {
      g.save(); g.setLineDash([14 * u, 10 * u]); g.lineDashOffset = -t * 40 * u; g.strokeStyle = P.amber; g.lineWidth = 4 * u; circle(g, Ly.vx, Ly.vy, rs); g.stroke(); g.restore();
      const box = sp(t - scope - 0.22, SNAP), b0 = R * 0.56 * lerp(1.5, 1.12, box), arm = 34 * u * box;
      g.strokeStyle = P.amber; g.lineWidth = 5 * u; g.lineCap = 'square';
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        g.globalAlpha = tA * box; g.beginPath(); g.moveTo(Ly.vx + sx * b0, Ly.vy + sy * (b0 - arm)); g.lineTo(Ly.vx + sx * b0, Ly.vy + sy * b0); g.lineTo(Ly.vx + sx * (b0 - arm), Ly.vy + sy * b0); g.stroke();
      }
      g.globalAlpha = tA;
      const lead = sp(t - scope - 0.25, SNAP);
      const [ax, ay, exx, ey, lx, ly] = S.pick({
        portrait: [Ly.vx + b0, Ly.vy - b0, Ly.vx + R * 0.78, Ly.vy - R - 60 * u, Ly.vx + R * 0.78, Ly.vy - R - 76 * u],
        landscape: [Ly.vx - b0, Ly.vy - b0, Ly.vx - R - 56 * u, Ly.vy - b0, Ly.vx - R - 66 * u, Ly.vy - b0 + 12 * u],
      });
      g.strokeStyle = P.amber; g.lineWidth = 2.5 * u; g.beginPath(); g.moveTo(ax, ay); g.lineTo(lerp(ax, exx, lead), lerp(ay, ey, lead)); g.stroke();
      S.text(typed('délimitation', t - scope - 0.3, 30), lx, ly, { size: 36, weight: 700, face: 'mono', color: P.amber, align: 'right' });
    }
    const chr = sp(t - rel, [90, 19]);
    if (chr > 0) {
      g.strokeStyle = P.ink; g.lineWidth = 2.5 * u; g.globalAlpha = tA * 0.7;
      const ext = R * 1.08 * chr;
      g.beginPath(); g.moveTo(Ly.vx - ext, Ly.vy); g.lineTo(Ly.vx + ext, Ly.vy); g.moveTo(Ly.vx, Ly.vy - ext); g.lineTo(Ly.vx, Ly.vy + ext); g.stroke(); g.globalAlpha = tA;
      const eye = R * 0.13 * spring(t - rel - 0.08, ORG);
      g.fillStyle = P.amber; circle(g, Ly.vx, Ly.vy, eye); g.fill(); g.fillStyle = P.bg; circle(g, Ly.vx, Ly.vy, eye * 0.38); g.fill();
      const rip = range(t, rel + 0.1, rel + 0.9);
      if (rip > 0 && rip < 1) { g.strokeStyle = P.amber; g.lineWidth = 4 * u * (1 - rip); g.globalAlpha = tA * (1 - rip); circle(g, Ly.vx, Ly.vy, lerp(eye, R * 0.7, rip)); g.stroke(); g.globalAlpha = tA; }
      const lead = sp(t - rel - 0.18, SNAP);
      const [ax, ay, exx, ey, lx, ly] = S.pick({
        portrait: [Ly.vx, Ly.vy + eye, Ly.vx - R * 0.62, Ly.vy + R + 64 * u, Ly.vx - R * 0.62, Ly.vy + R + 104 * u],
        landscape: [Ly.vx + eye, Ly.vy, Ly.vx + R + 56 * u, Ly.vy, Ly.vx + R + 66 * u, Ly.vy + 12 * u],
      });
      g.strokeStyle = P.ink; g.lineWidth = 2.5 * u; g.globalAlpha = tA * 0.7; g.beginPath(); g.moveTo(ax, ay); g.lineTo(lerp(ax, exx, lead), lerp(ay, ey, lead)); g.stroke(); g.globalAlpha = tA;
      S.text(typed('pertinence', t - rel - 0.3, 30), lx, ly, { size: 36, weight: 700, face: 'mono', color: P.ink });
    }
    g.restore();
  }

  // the ring becomes the "constat" pill at the top of the funnel
  {
    const w = lerp(2 * Rr, pillW, ex), h = lerp(2 * Rr, pillH, ex);
    const x0 = lerp(cx, Ly.vx, ex), y0 = lerp(cy, pillY, ex);
    if (ex > 0.001) { g.fillStyle = P.card; g.globalAlpha = ex; S.rrect(x0 - w / 2, y0 - h / 2, w, h, Math.min(w, h) / 2); g.fill(); g.globalAlpha = 1; }
    g.strokeStyle = P.blue; g.lineWidth = lerp(lerp(4, 6, p), 3, ex) * u;
    S.rrect(x0 - w / 2, y0 - h / 2, w, h, Math.min(w, h) / 2); g.stroke();
    const ta = swapAlpha(t, T.X1 + 0.12);
    if (ta > 0) {
      S.text(pillText, Ly.vx, pillY + pillS * u * 0.36, { size: pillS, weight: 600, color: P.ink, align: 'center', alpha: ta });
      S.text('EXEMPLE', Ly.vx - pillW / 2 + 8 * u, pillY - pillH / 2 - 16 * u, { size: 24, weight: 700, face: 'mono', color: P.amber, tracking: 0.12, alpha: ta });
    }
  }
  if (t >= T.X1) funnel(t, S, Ly, top);

  // numeral 1 flies from node 1; title slides in with an amber underline
  const np = sp(t - T.TX - 0.06, [140, 24]);
  if (np < 0.999) S.text('1', lerp(n1x - 13 * u, Ly.nx, np), lerp(n1y + 15 * u, Ly.ny, np), { size: lerp(44, Ly.ns, np), weight: 800, color: mixColor(P.ink, P.blue, np), tracking: -0.05 });
  else numeral(S, 1, Ly.nx, Ly.ny);
  if (np > 0.9 && np < 0.999) S.text('/5', Ly.nx + measure(S, '1', Ly.ns, 800, 'ui', -0.05) + 12 * u, Ly.ny - Ly.ns * 0.6 * u, { size: 38, weight: 500, face: 'mono', color: P.dim, alpha: range(np, 0.9, 0.999) });
  const ts = fitSize(S, 'Problématique', 600, 'display', Ly.tMax, Ly.ts);
  S.text('Problématique', Ly.tx - (1 - sp(t - q)) * 50 * u, Ly.ty, { size: ts, weight: 600, face: 'display', color: P.ink, alpha: range(t, q, q + 0.18) });
  const uw = measure(S, 'Problématique', ts, 600, 'display') * sp(t - q - 0.22, [170, 26]);
  if (uw > 0) { g.save(); g.shadowColor = 'rgba(245,158,11,0.75)'; g.shadowBlur = 22 * u; g.fillStyle = P.amber; S.rrect(Ly.tx, Ly.ty + 26 * u, uw, 9 * u, 4.5 * u); g.fill(); g.restore(); }
}

function funnel(t, S, Ly, top) {
  const { g, u } = S;
  const R = Ly.vr, cx = Ly.vx, m = x1.marks;
  const bh = 0.34 * R, gap = 0.05 * R;
  BANDS.forEach((B, i) => {
    const y0 = top + i * (bh + gap), y1 = y0 + bh;
    const outline = sp(t - m.a - 0.35 - i * 0.1, [90, 19]);
    const fill = spring(t - m[B.at] + 0.05, ORG);
    const trap = () => { g.beginPath(); g.moveTo(cx - B.w0 * R / 2, y0); g.lineTo(cx + B.w0 * R / 2, y0); g.lineTo(cx + B.w1 * R / 2, y1); g.lineTo(cx - B.w1 * R / 2, y1); g.closePath(); };
    if (outline > 0) {
      g.save(); g.globalAlpha = outline; g.setLineDash([10 * u, 8 * u]); g.strokeStyle = P.slate; g.lineWidth = 3 * u; trap(); g.stroke(); g.restore();
    }
    if (fill > 0) {
      g.save(); trap(); g.clip();
      g.fillStyle = mixColor(P.card, P.blue, 0.35 + i * 0.2);
      const fh = bh * clamp(fill, 0, 1.08);
      g.fillRect(cx - B.w0 * R / 2, y0, B.w0 * R, fh);
      g.restore();
      const midW = ((B.w0 + B.w1) / 2) * R - 40 * u;
      const fs = fitSize(S, B.label, 600, 'ui', midW, 34);
      S.text(typed(B.label, t - m[B.at] - 0.05, 60), cx, (y0 + y1) / 2 + fs * u * 0.36, { size: fs, weight: 600, color: P.ink, align: 'center' });
    }
  });
  // relevance, scientific and social
  const yb = top + 3 * (bh + gap);
  const pa = swapAlpha(t, m.c, m.d);
  if (pa > 0) {
    S.text('PERTINENCE', cx, yb + 0.16 * R, { size: 28, weight: 700, face: 'mono', color: P.dim, align: 'center', tracking: 0.14, alpha: pa });
    [[m.sci, 'scientifique', 'flask', P.blue, -1], [m.soc, 'sociale', 'people', P.amber, 1]].forEach(([tm, txt, ic, col, side]) => {
      const s = spring(t - tm, ORG);
      if (s <= 0) return;
      const yy = yb + 0.42 * R, xx = cx + side * 0.62 * R;
      g.save(); g.globalAlpha = pa; g.translate(xx, yy); g.scale(s, s);
      const w = measure(S, txt, 36, 600) + 120 * u;
      g.fillStyle = P.card; S.rrect(-w / 2, -40 * u, w, 80 * u, 40 * u); g.fill();
      g.strokeStyle = col; g.lineWidth = 3 * u; S.rrect(-w / 2, -40 * u, w, 80 * u, 40 * u); g.stroke();
      icon(S, ic, -w / 2 + 44 * u, 0, 22 * u, 1, { color: col, width: 4 });
      S.text(txt, -w / 2 + 80 * u, 13 * u, { size: 36, weight: 600, color: P.ink });
      g.restore();
    });
  }
  // the research question drops out of the funnel
  const qd = spring(t - m.d, ORG);
  if (qd > 0) {
    const w = S.pick({ portrait: 2.8, landscape: 2.95 }) * R, size = 40;
    const lines = wrap(S, RQ, size, 600, 'display', w - 80 * u);
    const h = 70 * u + lines.length * size * u * 1.25 + 30 * u;
    const y0 = yb + 0.08 * R;
    g.save(); g.translate(cx, y0); g.scale(1, clamp(qd, 0, 1.1)); g.translate(-cx, -y0);
    card(S, cx - w / 2, y0, w, h, { fill: P.card, stroke: P.amber, r: 26 });
    g.restore();
    const ta = swapAlpha(t, m.d + 0.12);
    S.text('QUESTION DE RECHERCHE', cx - w / 2 + 40 * u, y0 + 50 * u, { size: 26, weight: 700, face: 'mono', color: P.amber, tracking: 0.12, alpha: ta });
    paragraph(S, t, RQ, cx - w / 2 + 40 * u, y0 + 60 * u + size * u * 1.1, { size, weight: 600, face: 'display', maxW: w - 80 * u, alpha: ta, lh: 1.25,
      marks: [{ phrase: 'scolarité des parents', t: m.rq + 0.2, color: P.blue }, { phrase: 'réussite scolaire', t: m.rq + 0.5, color: P.amber }],
      rise: (1 - sp(t - m.d - 0.12)) * 24 * u });
  }
}

// ═════ 2 · Cadre théorique ═══════════════════════════════════════════════════
const WORDS = [
  ['théorie', -0.3, 0.02, 56], ['concepts', 0.62, -0.62, 40], ['hypothèses', -0.62, -0.74, 40],
  ['modèle', 1.08, -0.18, 42], ['capital culturel', 0.72, 0.32, 32], ['variables', 1.12, 0.78, 36],
  ['reproduction', -1.08, 0.5, 36], ['paradigme', 0.0, 0.72, 44], ['inégalités', 0.62, 1.02, 34],
  ['littérature', -0.72, 0.95, 36], ['définitions', 0.18, -1.02, 34], ['cadre', -1.22, -0.3, 36],
  ['sociologie', 1.22, -0.86, 34], ['école', -1.1, -1.0, 34],
];
const HOT = { théorie: 0, concepts: 1, capital: 4 };
const wpos = (k) => [WORDS[k][1], WORDS[k][2]];
const diag = (S) => { const Ly = lay(S); return { x: Ly.vx, y: Ly.vy + S.pick({ portrait: -0.2, landscape: -0.32 }) * Ly.vr }; };

function wordField(S, cx, cy, R, { color = P.dim, hot = -1, alpha = 1, skip = -1 } = {}) {
  WORDS.forEach(([w, x, y, size], i) => {
    if (i === skip) return;
    S.text(w, cx + x * R, cy + y * R, { size, weight: 600, color: i === hot ? P.amber : color, align: 'center', alpha });
  });
}
function trackN2(t, keys, k, d) { return [0, 1].map((j) => track(t, keys.map(([kt, v]) => [kt, v[j]]), k, d)); }
export function lensPos(t, S) {
  const Ly = lay(S), D = diag(S);
  const m = x2.marks;
  const k = trackN2(t, [[0, [0.5, -0.35]], [q2.marks.q, [0.25, -0.25]], [q2.marks.lens - 0.15, wpos(HOT.théorie)],
    [m.b, wpos(HOT.concepts)], [m.d - 0.1, wpos(HOT.capital)]], 70, 15);
  const dg = sp(t - m.e, [130, 22]);
  const fx = Ly.vx + k[0] * Ly.vr + noise(t * 0.5, 31) * 10 * S.u * (1 - dg), fy = Ly.vy + k[1] * Ly.vr + noise(t * 0.5, 32) * 10 * S.u * (1 - dg);
  return [lerp(fx, D.x, dg), lerp(fy, D.y, dg), dg];
}
export const lensR = (t, S) => lay(S).vr * lerp(0.7, 0.46, sp(t - x2.marks.e, [130, 22])) * spring(t - q2.marks.q, ORG);

export function step2(t, S) {
  const { g, u } = S;
  const Ly = lay(S), R = Ly.vr, D = diag(S);
  const { q, lens, study } = q2.marks, m = x2.marks;
  const [lx, ly, dg] = lensPos(t, S);
  const fieldA = 1 - range(t, m.e - 0.1, m.e + 0.4);
  // the field, out of focus
  if (fieldA > 0) { g.save(); g.filter = `blur(${9 * u}px)`; g.globalAlpha = 0.75 * fieldA; wordField(S, Ly.vx, Ly.vy, R); g.restore(); }

  // diagram: family heritage → cultural capital → school success
  const nodes = [[m.her, -1, 'books', P.ink, ['Héritage', 'familial']], [m.reu, 1, 'cap', P.blue, ['Réussite', 'scolaire']]];
  const nr = 0.32 * R, nx = (side) => D.x + side * 1.08 * R;
  const arrows = sp(t - m.reu - 0.1, [70, 17]);
  if (arrows > 0) {
    g.strokeStyle = P.blue; g.lineWidth = 5 * u; g.lineCap = 'round';
    const segs = [[nx(-1) + nr + 14 * u, D.x - lensR(t, S) - 22 * u], [D.x + lensR(t, S) + 14 * u, nx(1) - nr - 22 * u]];
    segs.forEach(([a, b], k) => {
      const f = clamp(arrows * 2 - k);
      if (f <= 0) return;
      const xe = lerp(a, b, f);
      g.beginPath(); g.moveTo(a, D.y); g.lineTo(xe, D.y); g.stroke();
      g.beginPath(); g.moveTo(xe - 14 * u, D.y - 12 * u); g.lineTo(xe, D.y); g.lineTo(xe - 14 * u, D.y + 12 * u); g.stroke();
    });
  }
  nodes.forEach(([tm, side, ic, col, label]) => {
    const s = spring(t - tm + 0.05, ORG);
    if (s <= 0) return;
    g.save(); g.translate(nx(side), D.y); g.scale(s, s);
    g.fillStyle = P.card; circle(g, 0, 0, nr); g.fill(); g.strokeStyle = col; g.lineWidth = 4 * u; circle(g, 0, 0, nr); g.stroke();
    icon(S, ic, 0, 0, nr * 0.55, sp(t - tm, [70, 16]), { color: col, width: 4.5 });
    g.restore();
    label.forEach((ln, k) => S.text(ln, nx(side), D.y + nr + 52 * u + k * 40 * u, { size: 34, weight: 600, color: P.ink, align: 'center', alpha: swapAlpha(t, tm + 0.05) }));
  });

  // the lens: scales up on "Avec quelle", aperture opens on "lunette", focus snaps on "doit-on l'étudier"
  const rl = lensR(t, S);
  if (rl > 1) {
    const ap = sp(t - lens, [150, 20]), focus = sp(t - study, [400, 40]), mag = 1.32;
    g.save(); circle(g, lx, ly, rl); g.clip();
    g.fillStyle = P.deep; g.fillRect(lx - rl, ly - rl, rl * 2, rl * 2);
    const hot = t < m.b ? HOT.théorie : t < m.d ? HOT.concepts : HOT.capital;
    if (fieldA > 0) {
      g.save(); g.translate(lx, ly); g.scale(mag, mag); g.translate(-lx, -ly);
      g.filter = `blur(${lerp(10, 0, focus) * u}px)`;
      wordField(S, Ly.vx, Ly.vy, R, { color: P.ink, hot: focus > 0.5 ? hot : -1, alpha: fieldA });
      g.restore();
    }
    const la = swapAlpha(t, m.e + 0.05);
    if (la > 0) ['capital', 'culturel'].forEach((w, k) => S.text(w, lx, ly + (k - 0.25) * 44 * u + 6 * u, { size: 40, weight: 700, color: P.amber, align: 'center', alpha: la }));
    const hexR = lerp(rl * 0.12, rl * 1.25, ap), rot = lerp(0.9, 0, ap);
    g.beginPath(); g.arc(lx, ly, rl + 2, 0, Math.PI * 2);
    for (let i = 0; i < 6; i++) { const a = rot + (i / 6) * Math.PI * 2; i ? g.lineTo(lx + Math.cos(a) * hexR, ly + Math.sin(a) * hexR) : g.moveTo(lx + Math.cos(a) * hexR, ly + Math.sin(a) * hexR); }
    g.closePath(); g.fillStyle = '#060B16'; g.fill('evenodd');
    g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 10 * u; g.beginPath(); g.arc(lx, ly, rl * 0.82, -2.6, -1.9); g.stroke();
    g.restore();
    g.strokeStyle = P.blue; g.lineWidth = 16 * u; circle(g, lx, ly, rl + 8 * u); g.stroke();
    g.save(); g.translate(lx, ly); g.rotate(lerp(0, -0.7, focus) + t * 0.05);
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2, l = i % 4 === 0 ? 14 : 7;
      g.strokeStyle = i % 4 === 0 ? P.ink : P.dim; g.globalAlpha = 0.8; g.lineWidth = 2.5 * u;
      g.beginPath(); g.moveTo(Math.cos(a) * (rl + 20 * u), Math.sin(a) * (rl + 20 * u)); g.lineTo(Math.cos(a) * (rl + (20 + l) * u), Math.sin(a) * (rl + (20 + l) * u)); g.stroke();
    }
    g.globalAlpha = 1; g.restore();
    g.fillStyle = P.amber; g.globalAlpha = range(focus, 0.2, 0.6);
    g.beginPath(); g.moveTo(lx, ly - rl - 44 * u); g.lineTo(lx - 10 * u, ly - rl - 62 * u); g.lineTo(lx + 10 * u, ly - rl - 62 * u); g.fill(); g.globalAlpha = 1;
    // "chez Bourdieu"
    const ba = swapAlpha(t, m.bour);
    if (ba > 0) chip(S, lx, ly + rl + 74 * u + (1 - sp(t - m.bour)) * 20 * u, 'Pierre Bourdieu', { size: 30, face: 'mono', weight: 700, color: P.ink, bg: P.card, stroke: P.amber, align: 'center', alpha: ba });
  }

  // hypothesis card types out on "des hypothèses"
  const hc = spring(t - m.h, ORG);
  if (hc > 0) {
    const w = S.pick({ portrait: 2.8, landscape: 2.9 }) * R, size = 40;
    const text = 'Plus les parents sont scolarisés, plus leurs enfants réussissent.';
    const lines = wrap(S, text, size, 600, 'ui', w - 190 * u);
    const h = Math.max(150 * u, lines.length * size * u * 1.3 + 60 * u);
    const y0 = D.y + nr + S.pick({ portrait: 170, landscape: 178 }) * u;
    g.save(); g.translate(D.x, y0 + h / 2); g.scale(lerp(0.8, 1, hc), lerp(0.8, 1, hc)); g.translate(-D.x, -(y0 + h / 2));
    g.globalAlpha = clamp(hc * 2);
    card(S, D.x - w / 2, y0, w, h, { fill: P.card, stroke: P.slate, r: 26 });
    g.fillStyle = P.amber; S.rrect(D.x - w / 2 + 30 * u, y0 + h / 2 - 40 * u, 100 * u, 80 * u, 18 * u); g.fill();
    S.text('H1', D.x - w / 2 + 80 * u, y0 + h / 2 + 16 * u, { size: 44, weight: 800, face: 'mono', color: P.bg, align: 'center' });
    let n = Math.max(0, Math.floor((t - m.hyp + 0.25) * 46));
    lines.forEach((ln, k) => {
      const str = ln.join(' ');
      const vis = str.slice(0, n); n -= str.length + 1;
      const yy = y0 + h / 2 - ((lines.length - 1) * size * u * 1.3) / 2 + k * size * u * 1.3 + size * u * 0.36;
      if (vis) { const ww = S.text(vis, D.x - w / 2 + 160 * u, yy, { size, weight: 600, color: P.ink }); if (n < 0 && n > -str.length - 1) cursor(S, t, D.x - w / 2 + 160 * u + ww, yy, size, P.blue); }
    });
    g.restore();
  }

  numeral(S, 2, Ly.nx, Ly.ny);
  const ts = fitSize(S, 'Cadre théorique', 600, 'display', Ly.tMax, Ly.ts);
  const str = typed('Cadre théorique', t - q, 18);
  const w = S.text(str, Ly.tx, Ly.ty, { size: ts, weight: 600, face: 'display', color: P.ink });
  if (t >= q - 0.2) cursor(S, t, Ly.tx + w, Ly.ty, ts, P.blue, str.length < 15 || t < m.a + 1.5);
}

// ═════ 3 · Méthodologie ══════════════════════════════════════════════════════
const MOD = 0.5 / 12;
const GEARS = [
  { n: 12, color: P.blue, label: 'protocole', mark: 'q' },
  { n: 8, color: '#CBD5E1', label: 'terrain', mark: 'cond' },
  { n: 10, color: P.amber, label: 'analyse', mark: 'an' },
];
(() => {
  const dirs = [0, -0.35, 1.25];
  GEARS.forEach((G, i) => {
    G.r = G.n * MOD;
    if (i === 0) { G.x = -0.42; G.y = 0.05; return; }
    const P0 = GEARS[i - 1], d = P0.r + G.r;
    G.th = dirs[i]; G.x = P0.x + Math.cos(G.th) * d; G.y = P0.y + Math.sin(G.th) * d;
  });
})();
function gearAngles(t) {
  const a = [t * 0.9];
  for (let i = 1; i < GEARS.length; i++) { const A = GEARS[i - 1], B = GEARS[i]; a[i] = B.th + Math.PI + Math.PI / B.n - (A.n / B.n) * (a[i - 1] - B.th); }
  return a;
}
function gearPath(g, G, ang, s) {
  const ro = G.r + MOD * 0.95, ri = G.r - MOD * 1.1, n = G.n;
  g.beginPath();
  for (let k = 0; k < n; k++) {
    const a0 = ang + (k / n) * Math.PI * 2, st = (Math.PI * 2) / n;
    [[a0 - st * 0.25, ri], [a0 - st * 0.16, ro], [a0 + st * 0.16, ro], [a0 + st * 0.25, ri]].forEach(([a, r], j) => {
      const x = G.x + Math.cos(a) * r * s, y = G.y + Math.sin(a) * r * s; (k === 0 && j === 0) ? g.moveTo(x, y) : g.lineTo(x, y);
    });
    g.arc(G.x, G.y, ri * s, a0 + st * 0.25, a0 + st * 0.75);
  }
  g.closePath();
  g.moveTo(G.x + G.r * 0.34 * s, G.y); g.arc(G.x, G.y, G.r * 0.34 * s, 0, Math.PI * 2, true);
}

export function step3(t, S) {
  const { g, u } = S;
  const Ly = lay(S), R = Ly.vr;
  const m = q3.marks, xm = x3.marks;
  const gearsOut = sp(t - T.X3, [130, 22]);
  if (gearsOut < 0.999) {
    const scale = R * 1.25, ang = gearAngles(t);
    const oy = S.pick({ portrait: R * 0.12, landscape: -R * 0.16 });
    g.save(); g.globalAlpha = 1 - gearsOut;
    g.translate(Ly.vx, Ly.vy); g.scale(1 - 0.4 * gearsOut, 1 - 0.4 * gearsOut); g.translate(-Ly.vx, -Ly.vy - gearsOut * 0.5 * R);
    const iso = (fn) => { g.save(); g.translate(Ly.vx, Ly.vy + oy); g.transform(0.866 * scale, 0.5 * scale, -0.866 * scale, 0.5 * scale, 0, 0); fn(); g.restore(); };
    const plate = sp(t - T.TI, [60, 16]);
    iso(() => {
      g.strokeStyle = 'rgba(148,163,184,0.16)'; g.lineWidth = 2 * u / scale;
      for (let i = -4; i <= 4; i++) { const e = 1.15 * plate; g.beginPath(); g.moveTo(i * 0.28, -e); g.lineTo(i * 0.28, e); g.moveTo(-e, i * 0.28); g.lineTo(e, i * 0.28); g.stroke(); }
    });
    GEARS.forEach((G, i) => {
      const solid = spring(t - (m[G.mark] - 0.05), ORG), a = plate * clamp(1 - solid * 1.4);
      if (a <= 0.01) return;
      iso(() => { gearPath(g, G, ang[i], 1); g.setLineDash([8 * u / scale, 7 * u / scale]); g.strokeStyle = `rgba(147,197,253,${0.55 * a})`; g.lineWidth = 2.5 * u / scale; g.stroke(); });
    });
    GEARS.forEach((G, i) => {
      const t0 = m[G.mark] - 0.05, land = spring(t - t0, ORG), s = clamp(spring(t - t0, [200, 22]), 0, 1.2);
      if (s <= 0.001) return;
      const thick = 34 * u;
      g.save(); g.translate(0, (1 - land) * -260 * u);
      for (let k = 7; k >= 1; k--) { g.save(); g.translate(0, (k / 7) * thick); iso(() => { gearPath(g, G, ang[i], s); g.fillStyle = mixColor(G.color, '#020617', 0.55 + k * 0.03); g.fill('evenodd'); }); g.restore(); }
      iso(() => {
        gearPath(g, G, ang[i], s); g.fillStyle = G.color; g.fill('evenodd');
        g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2 * u / scale; g.stroke();
        g.strokeStyle = mixColor(G.color, '#020617', 0.35); g.lineWidth = 0.035 * s;
        for (let k = 0; k < 3; k++) { const a = ang[i] + k * 2.094; g.beginPath(); g.moveTo(G.x + Math.cos(a) * G.r * 0.36 * s, G.y + Math.sin(a) * G.r * 0.36 * s); g.lineTo(G.x + Math.cos(a) * G.r * 0.72 * s, G.y + Math.sin(a) * G.r * 0.72 * s); g.stroke(); }
      });
      g.restore();
      const sx = Ly.vx + (G.x - G.y) * 0.866 * scale, sy = Ly.vy + oy + (G.x + G.y) * 0.5 * scale;
      const ly = i === 2 ? sy + G.r * scale * 0.707 + thick + 64 * u : sy - G.r * scale * 0.707 - 34 * u;
      S.text(G.label, sx, ly + (1 - sp(t - t0 - 0.12)) * 20 * u, { size: 36, weight: 700, face: 'mono', color: i === 2 ? P.amber : P.ink, align: 'center', alpha: swapAlpha(t, t0 + 0.12) });
    });
    g.restore();
  }

  // quantitative | qualitative | both
  const panelsOut = sp(t - (xm.c - 0.15), [150, 22]);
  if (t >= xm.b - 0.2 && panelsOut < 0.999) {
    const pw = 1.5 * R, ph = 1.6 * R, py = Ly.vy - S.pick({ portrait: 0.15, landscape: 0.22 }) * R;
    const mix = sp(t - xm.mix, [140, 20]);
    const panels = [
      { tm: xm.b + 0.05, title: 'Quantitative', subs: ['questionnaires', 'statistiques'], subT: xm.q1, ic: 'questionnaire', col: P.blue, side: -1 },
      { tm: xm.quali - 0.05, title: 'Qualitative', subs: ['entretiens', 'observations'], subT: xm.q2, ic: 'interview', col: P.amber, side: 1 },
    ];
    const pcx = (side) => Ly.vx + side * lerp(0.8, 0.6, mix) * R;
    g.save(); g.globalAlpha = 1 - panelsOut; g.translate(0, -panelsOut * 0.6 * R);
    panels.forEach((Pn) => {
      const s = spring(t - Pn.tm + 0.1, ORG);
      if (s <= 0) return;
      const x = pcx(Pn.side) - pw / 2, y = py - ph / 2;
      g.save(); g.translate(x + pw / 2, py); g.scale(lerp(0.8, 1, s), lerp(0.8, 1, s)); g.translate(-(x + pw / 2), -py);
      g.globalAlpha *= clamp(s * 2);
      g.fillStyle = mixColor(P.card, Pn.col, 0.12); g.globalAlpha *= lerp(1, 0.82, mix); S.rrect(x, y, pw, ph, 30 * u); g.fill(); g.globalAlpha /= lerp(1, 0.82, mix);
      g.strokeStyle = Pn.col; g.lineWidth = 3 * u; S.rrect(x, y, pw, ph, 30 * u); g.stroke();
      const cxp = x + pw / 2 + Pn.side * mix * 0.2 * R;
      icon(S, Pn.ic, cxp, y + 0.42 * R, 0.24 * R, sp(t - Pn.tm, [70, 16]), { color: Pn.col, width: 5 });
      if (Pn.side < 0) {                                   // statistics: a tiny histogram grows
        [0.35, 0.7, 1, 0.55].forEach((hf, k) => { const hh = 0.22 * R * hf * spring(t - Pn.subT - k * 0.06, ORG); g.fillStyle = P.blue; g.fillRect(cxp + (k - 2) * 0.11 * R + 0.02 * R, y + 0.95 * R - hh, 0.08 * R, hh); });
      } else icon(S, 'eye', cxp, y + 0.85 * R, 0.13 * R, sp(t - Pn.subT, [70, 16]), { color: P.amber, width: 4 });
      const tt = fitSize(S, Pn.title, 700, 'ui', pw - 50 * u, 44);
      S.text(Pn.title, cxp, y + 1.13 * R, { size: tt, weight: 700, color: P.ink, align: 'center' });
      Pn.subs.forEach((sb, j) => S.text(sb, cxp, y + 1.13 * R + 46 * u + j * 38 * u, { size: 32, weight: 500, color: P.dim, align: 'center', alpha: swapAlpha(t, Pn.subT + j * 0.25) }));
      g.restore();
    });
    if (mix > 0.01) {                                       // the overlap: mixed methods
      g.save(); g.beginPath(); S.rrect(pcx(-1) - pw / 2, py - ph / 2, pw, ph, 30 * u); g.clip();
      g.fillStyle = `rgba(245,158,11,${0.28 * mix})`; S.rrect(pcx(1) - pw / 2, py - ph / 2, pw, ph, 30 * u); g.fill(); g.restore();
      chip(S, Ly.vx, py + ph / 2 + 2 * u, 'Mixte', { size: 32, weight: 700, color: P.bg, bg: P.amber, align: 'center', scale: spring(t - xm.mix - 0.1, ORG) });
    }
    g.restore();
  }

  // the checklist a methodology must answer
  if (t >= xm.c - 0.15) {
    const rows = [
      { tm: xm.ech, label: 'Échantillon', ic: 'sample' },
      { tm: xm.col, label: 'Outils de collecte', ic: 'clipboard' },
      { tm: xm.ana, label: 'Méthode d’analyse', ic: 'chart' },
      { tm: xm.eth, label: 'Règles éthiques', ic: 'shield', extra: ['consentement', xm.cons] },
    ];
    const rw = S.pick({ portrait: 3.0, landscape: 3.0 }) * R, rh = S.pick({ portrait: 0.44, landscape: 0.4 }) * R, gapY = 0.09 * R;
    const top = Ly.vy - S.pick({ portrait: 0.7, landscape: 1.02 }) * R;
    rows.forEach((row, i) => {
      const y = top + i * (rh + gapY), x = Ly.vx - rw / 2;
      const ghost = sp(t - xm.c - i * 0.06, [120, 20]);
      if (ghost > 0) { g.save(); g.globalAlpha = ghost * (1 - clamp(spring(t - row.tm + 0.12, ORG) * 2)); g.setLineDash([10 * u, 8 * u]); g.strokeStyle = P.slate; g.lineWidth = 3 * u; S.rrect(x, y, rw, rh, 22 * u); g.stroke(); g.restore(); }
      const s = spring(t - row.tm + 0.12, ORG);
      if (s <= 0) return;
      g.save(); g.globalAlpha = clamp(s * 2); g.translate(-(1 - s) * 60 * u, 0);
      card(S, x, y, rw, rh, { fill: P.card, r: 22 });
      const tile = rh - 24 * u;
      g.fillStyle = P.card2; S.rrect(x + 12 * u, y + 12 * u, tile, tile, 16 * u); g.fill();
      const icx = x + 12 * u + tile / 2, icy = y + rh / 2;
      if (row.ic === 'sample') {                          // a population; a sample is drawn from it
        const pick = sp(t - row.tm - 0.1, [90, 18]);
        for (let k = 0; k < 20; k++) {
          const gx = k % 5, gy = Math.floor(k / 5), chosen = [1, 7, 8, 13, 16].includes(k);
          g.fillStyle = chosen ? mixColor(P.dim, P.amber, pick) : P.dim; g.globalAlpha = clamp(s * 2) * (chosen ? 1 : lerp(1, 0.35, pick));
          circle(g, icx + (gx - 2) * tile * 0.17, icy + (gy - 1.5) * tile * 0.2, tile * 0.055 * (chosen ? 1 + 0.3 * pick : 1)); g.fill();
        }
        g.globalAlpha = clamp(s * 2);
      } else icon(S, row.ic, icx, icy, tile * 0.32, sp(t - row.tm, [70, 16]), { color: P.ink, width: 4 });
      const lsz = S.pick({ portrait: 42, landscape: 40 });
      const lw = S.text(row.label, x + tile + 44 * u, y + rh / 2 + lsz * u * 0.36, { size: lsz, weight: 600, color: P.ink });
      if (row.extra) {
        const es = spring(t - row.extra[1], ORG);
        if (es > 0) chip(S, x + tile + 44 * u + lw + 20 * u, y + rh / 2, row.extra[0], { size: 28, weight: 700, face: 'mono', color: P.bg, bg: P.amber, scale: es });
      }
      const ck = sp(t - row.tm - 0.35, [170, 22]);
      const cxk = x + rw - rh / 2;
      g.strokeStyle = mixColor(P.slate, P.blue, ck); g.lineWidth = 4 * u; circle(g, cxk, y + rh / 2, rh * 0.26); g.stroke();
      if (ck > 0.01) { g.fillStyle = P.blue; circle(g, cxk, y + rh / 2, rh * 0.26 * ck); g.fill(); icon(S, 'check', cxk, y + rh / 2, rh * 0.18, ck, { color: P.ink, width: 4.5 }); }
      g.restore();
    });
  }

  numeral(S, 3, Ly.nx, Ly.ny, { clip: true, rise: (1 - sp(t - (T.TI + 0.12))) * Ly.ns * 0.9 * u });
  const ts = fitSize(S, 'Méthodologie', 600, 'display', Ly.tMax, Ly.ts);
  flipText(S, 'Méthodologie', Ly.tx, Ly.ty, ts, (Math.PI / 2) * (1 - spring(t - m.n - 0.08, [140, 24])));
}

function flipText(S, str, x, y, size, theta) {
  const { g, u } = S;
  if (theta >= Math.PI / 2 - 0.01) return;
  const h = size * u * 1.1, top = -size * u * 0.82, f = 900 * u, N = 36;
  const cy = top + h / 2, w = measure(S, str, size, 600, 'display');
  const shade = mixColor(P.dim, P.ink, Math.cos(theta));
  for (let i = 0; i < N; i++) {
    const y0 = top + (i / N) * h, y1 = top + ((i + 1) / N) * h;
    const proj = (yy) => { const d = yy - cy, z = d * Math.sin(theta), s = f / (f + z); return [cy + d * Math.cos(theta) * s, s]; };
    const [Y0, s0] = proj(y0), [Y1] = proj(y1);
    const k = (Y1 - Y0) / (y1 - y0);
    if (!(k > 0.001)) continue;
    g.save(); g.translate(x + (w / 2) * (1 - s0), y + Y0 - y0 * k); g.scale(s0, k);
    g.beginPath(); g.rect(-20 * u, y0 - 0.5, w + 40 * u, (y1 - y0) + 1); g.clip();
    S.text(str, 0, 0, { size, weight: 600, face: 'display', color: shade });
    g.restore();
  }
}

// ═════ 4 · Résultats ═════════════════════════════════════════════════════════
// Illustrative data only: the bars show a trend, no invented figures.
const LEVELS = [['Faible', 0.42], ['Moyenne', 0.66], ['Élevée', 0.95]];
function chartGeom(S) {
  const Ly = lay(S), R = Ly.vr;
  const base = Ly.vy + 0.82 * R, maxH = 1.62 * R, bw = 0.44 * R, step = 0.72 * R;
  return { base, maxH, bw, left: Ly.vx - 1.15 * R, right: Ly.vx + 1.15 * R,
    bars: LEVELS.map(([lab, v], i) => ({ lab, v, x: Ly.vx + (i - 1) * step - bw / 2, w: bw })) };
}
// the three format cards of the explanation (table · chart · interview excerpt)
export function formatCards(S) {
  const Ly = lay(S), R = Ly.vr;
  const w = 0.8 * R, h = 1.02 * R, gap = 0.12 * R, y = Ly.vy - S.pick({ portrait: 0.45, landscape: 0.62 }) * R;
  return [-1, 0, 1].map((k) => ({ x: Ly.vx + k * (w + gap) - w / 2, y, w, h }));
}

export function step4(t, S) {
  const { g, u } = S;
  const Ly = lay(S), R = Ly.vr, C = chartGeom(S), F = formatCards(S);
  const { found } = q4.marks, m = x4.marks;
  const out = 1 - range(t, T.TM - 0.05, T.TM + 0.2);
  // the chart shrinks into the middle card on "des graphiques"
  const into = sp(t - m.tab - 0.05, [140, 22]);
  const chartBox = { x: C.left - 30 * u, y: C.base - C.maxH - 120 * u, w: C.right - C.left + 60 * u, h: C.maxH + 120 * u + 30 * u };
  const k = (F[1].w * 0.86) / chartBox.w;
  const tx = lerp(0, F[1].x + F[1].w / 2 - (chartBox.x + chartBox.w / 2) * lerp(1, k, 1), into);
  const chrome = 1 - range(t, m.tab - 0.1, m.tab + 0.15);

  // format cards: table, (chart), interview excerpt
  if (t >= m.tab - 0.1) {
    F.forEach((c, i) => {
      const s = spring(t - [m.tab, m.gra - 0.25, m.cit][i] + 0.05, ORG);
      if (s <= 0) return;
      g.save(); g.globalAlpha = out * clamp(s * 2);
      g.translate(c.x + c.w / 2, c.y + c.h / 2); g.scale(lerp(0.8, 1, s), lerp(0.8, 1, s)); g.translate(-(c.x + c.w / 2), -(c.y + c.h / 2));
      card(S, c.x, c.y, c.w, c.h, { fill: P.card, stroke: i === 1 ? P.blue : P.slate, r: 24 });
      if (i === 0) icon(S, 'table', c.x + c.w / 2, c.y + c.h * 0.45, c.w * 0.3, sp(t - m.tab, [70, 16]), { color: P.ink, width: 4 });
      if (i === 2) {
        S.text('«', c.x + 30 * u, c.y + 0.42 * c.h, { size: 90, weight: 700, face: 'display', color: P.amber });
        [0.62, 0.8, 0.5].forEach((wf, j) => { const ww = (c.w - 70 * u) * wf * sp(t - m.cit - 0.1 - j * 0.1, [170, 24]); g.fillStyle = P.slate; S.rrect(c.x + 35 * u, c.y + 0.5 * c.h + j * 30 * u, ww, 14 * u, 7 * u); g.fill(); });
      }
      const labels = [['Tableaux'], ['Graphiques'], ['Extraits', 'd’entretiens']][i];
      const tm = [m.tab, m.gra, m.cit][i];
      labels.forEach((ln, j) => S.text(ln, c.x + c.w / 2, c.y + c.h + 52 * u + j * 40 * u, { size: 34, weight: 600, color: sp(t - tm) > 0.5 ? P.ink : P.dim, align: 'center', alpha: swapAlpha(t, tm - 0.05) }));
      g.restore();
    });
  }

  if (t < T.TM + 0.2) {
    g.save(); g.globalAlpha = out;
    const s1 = lerp(1, k, into);
    const ox = chartBox.x + chartBox.w / 2, oy = chartBox.y + chartBox.h / 2;
    const dx = lerp(0, F[1].x + F[1].w / 2 - ox, into), dy = lerp(0, F[1].y + F[1].h * 0.47 - oy, into);
    g.translate(ox + dx, oy + dy); g.scale(s1, s1); g.translate(-ox, -oy);
    const axis = sp(t - (T.TU + 0.05), [90, 19]);
    g.globalAlpha = out * chrome;
    for (let j = 1; j <= 3; j++) { const yy = C.base - (C.maxH * j) / 3; g.strokeStyle = 'rgba(148,163,184,0.14)'; g.lineWidth = 2 * u; g.beginPath(); g.moveTo(C.left, yy); g.lineTo(lerp(C.left, C.right, sp(t - (T.TU + 0.12 + j * 0.06), [90, 19])), yy); g.stroke(); }
    g.globalAlpha = out;
    g.strokeStyle = P.dim; g.lineWidth = 4 * u; g.beginPath(); g.moveTo(C.left, C.base); g.lineTo(lerp(C.left, C.right, axis), C.base); g.stroke();
    const hi = sp(t - found - 0.12, [170, 26]);
    const tops = [];
    C.bars.forEach((b, i) => {
      const grow = spring(t - (q4.start - 0.05 + i * 0.12), ORG);
      const h = C.maxH * b.v * grow;
      tops.push([b.x + b.w / 2, C.base - h]);
      if (h <= 0.5) return;
      g.fillStyle = [P.blue, P.light, P.blue][i];
      S.rrect(b.x, C.base - h, b.w, h, 14 * u); g.fill(); g.fillRect(b.x, C.base - Math.min(h, 14 * u), b.w, Math.min(h, 14 * u));
      if (i === 2 && hi > 0) {
        g.save(); g.beginPath(); g.rect(b.x - 1, C.base - h * hi, b.w + 2, h * hi); g.clip();
        g.fillStyle = P.amber; S.rrect(b.x, C.base - h, b.w, h, 14 * u); g.fill(); g.fillRect(b.x, C.base - 14 * u, b.w, 14 * u); g.restore();
      }
      g.globalAlpha = out * chrome;
      S.text(b.lab, b.x + b.w / 2, C.base + 46 * u, { size: 32, weight: 600, color: P.dim, align: 'center', alpha: range(t, T.TU + 0.4 + i * 0.1, T.TU + 0.6 + i * 0.1) });
      g.globalAlpha = out;
    });
    // the trend draws through the tops on "trouvé"
    const tr = sp(t - found, [60, 16]);
    if (tr > 0) {
      g.strokeStyle = P.amber; g.lineWidth = 6 * u; g.lineCap = 'round'; g.setLineDash([2 * u, 14 * u]);
      const [a, b] = [tops[0], tops[2]];
      g.beginPath(); g.moveTo(a[0] - 0.2 * R, a[1] + 0.1 * R - 30 * u); g.lineTo(lerp(a[0] - 0.2 * R, b[0] + 0.2 * R, tr), lerp(a[1] + 0.1 * R, b[1] - 0.06 * R, tr) - 30 * u); g.stroke(); g.setLineDash([]);
    }
    g.globalAlpha = out * chrome;
    S.text('Réussite scolaire', C.left, C.base - C.maxH - 40 * u, { size: 30, weight: 600, color: P.dim, alpha: range(t, T.TU + 0.3, T.TU + 0.6) });
    S.text('Scolarité des parents', (C.left + C.right) / 2, C.base + 98 * u, { size: 30, weight: 600, color: P.dim, align: 'center', alpha: range(t, T.TU + 0.5, T.TU + 0.8) });
    S.text('EXEMPLE ILLUSTRATIF', C.left, C.base - C.maxH - 4 * u, { size: 24, weight: 700, face: 'mono', color: P.dim, align: 'left', tracking: 0.1, alpha: range(t, T.TU + 0.3, T.TU + 0.6) });
    // title pops at the apex of the tallest bar
    const pop = spring(t - found - 0.26, [300, 26]);
    if (pop > 0) {
      const tb = tops[2];
      g.save(); g.translate(tb[0], tb[1] - 30 * u - 40 * u); g.scale(lerp(0.4, 1, pop), lerp(0.4, 1, pop));
      S.text('Résultats', 0, 0, { size: S.pick({ portrait: 84, landscape: 76 }), weight: 600, face: 'display', color: P.ink, align: 'center', alpha: clamp(pop * 3) });
      g.restore();
    }
    g.restore();
  }

  // "sans encore les interpréter": interpretation belongs to step 5
  const ia = swapAlpha(t, m.c, m.tab - 0.15);
  if (ia > 0) {
    const [ix, iy, al] = S.pick({ portrait: [Ly.vx, C.base + 175 * u, 'center'], landscape: [Ly.tx, Ly.ty + 120 * u, 'left'] });
    const s = spring(t - m.c, ORG);
    g.save(); g.globalAlpha = ia;
    const w = chip(S, ix, iy, '      Interprétation → étape 5', { size: 30, weight: 600, color: P.dim, bg: null, stroke: P.slate, align: al, scale: lerp(0.8, 1, s) });
    const x0 = al === 'center' ? ix - w / 2 : ix;
    icon(S, 'bulb', x0 + 44 * u, iy, 22 * u, 1, { color: P.dim, width: 4 });
    g.strokeStyle = P.amber; g.lineWidth = 4 * u; g.beginPath(); g.moveTo(x0 + 24 * u, iy + 22 * u); g.lineTo(x0 + 64 * u, iy - 22 * u); g.stroke();
    g.restore();
  }
  if (t < T.TM) numeral(S, 4, Ly.nx, Ly.ny);
}

// ═════ 5 · Discussions et conclusion ═════════════════════════════════════════
function bubbleState(S, side) {
  const Ly = lay(S);
  return side === 0 ? [Ly.vx - Ly.vr * 0.72, Ly.vy - Ly.vr * 0.28, Ly.vr * 0.44] : [Ly.vx + Ly.vr * 0.72, Ly.vy - Ly.vr * 0.02, Ly.vr * 0.44];
}
function metaball(g, x1, y1, r1, x2, y2, r2, v = 0.5, handle = 2.4) {
  const d = Math.hypot(x2 - x1, y2 - y1);
  if (r1 <= 0 || r2 <= 0 || d > (r1 + r2) * 1.6 || d <= Math.abs(r1 - r2)) return false;
  let u1 = 0, u2 = 0;
  if (d < r1 + r2) { u1 = Math.acos(clamp((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d), -1, 1)); u2 = Math.acos(clamp((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d), -1, 1)); }
  const ab = Math.atan2(y2 - y1, x2 - x1), spread = Math.acos(clamp((r1 - r2) / d, -1, 1));
  const a1 = ab + u1 + (spread - u1) * v, a2 = ab - u1 - (spread - u1) * v;
  const a3 = ab + Math.PI - u2 - (Math.PI - u2 - spread) * v, a4 = ab - Math.PI + u2 + (Math.PI - u2 - spread) * v;
  const pol = (x, y, a, r) => [x + Math.cos(a) * r, y + Math.sin(a) * r];
  const p1a = pol(x1, y1, a1, r1), p1b = pol(x1, y1, a2, r1), p2a = pol(x2, y2, a3, r2), p2b = pol(x2, y2, a4, r2);
  const d2 = Math.min(v * handle, Math.hypot(p1a[0] - p2a[0], p1a[1] - p2a[1]) / (r1 + r2)) * Math.min(1, (d * 2) / (r1 + r2));
  const h1 = pol(...p1a, a1 - Math.PI / 2, r1 * d2), h2 = pol(...p2a, a3 + Math.PI / 2, r2 * d2);
  const h3 = pol(...p2b, a4 - Math.PI / 2, r2 * d2), h4 = pol(...p1b, a2 + Math.PI / 2, r1 * d2);
  g.beginPath(); g.moveTo(...p1a); g.bezierCurveTo(...h1, ...h2, ...p2a); g.lineTo(...p2b); g.bezierCurveTo(...h3, ...h4, ...p1b); g.closePath();
  return true;
}
export const S5 = { MERGE: x5.marks.b, PILL: x5.marks.b + 0.62, LOCK: x5.marks.b + 0.8 };
export const pillCenter = (S) => [S.W / 2, S.pick({ portrait: S.H * 0.47, landscape: S.H * 0.45 })];

export function step5(t, S) {
  const { g, W, u } = S;
  const Ly = lay(S), R = Ly.vr;
  const { q, res, ded } = q5.marks, m = x5.marks;
  const F = formatCards(S);
  const [midX, midY] = pillCenter(S);
  const title = 'Discussions et conclusion';
  const ts = fitSize(S, title, 600, 'display', S.pick({ portrait: W * 0.74, landscape: W * 0.5 }), 76);
  const pillW = measure(S, title, ts, 600, 'display') + 110 * u, pillH = ts * u * 1.9;
  const exit = sp(t - T.TR, [150, 22]);
  g.save(); g.globalAlpha = 1 - range(exit, 0, 0.6); g.translate(0, -exit * 0.35 * S.H);

  // cards → bubbles → one circle → pill
  const k = [130, 17];
  const shapes = [0, 1].map((side) => {
    const c = F[side === 0 ? 0 : 2];
    const [bx, by, br] = bubbleState(S, side);
    const cx = track(t, [[0, c.x + c.w / 2], [T.TM, bx], [S5.MERGE, midX]], ...k);
    const cy = track(t, [[0, c.y + c.h / 2], [T.TM, by], [S5.MERGE, midY]], ...k);
    const w = track(t, [[0, c.w], [T.TM, br * 2], [S5.MERGE, R], [S5.PILL, pillW]], ...k);
    const h = track(t, [[0, c.h], [T.TM, br * 2], [S5.MERGE, R], [S5.PILL, pillH]], ...k);
    return { cx, cy, w: Math.max(0, w), h: Math.max(0, h), side };
  });
  const colL = P.blue, colR = P.amber;
  const mc = 1 - sp(t - T.TM, SNAP);
  if (mc > 0.01) { const c = F[1]; g.save(); g.translate(c.x + c.w / 2, c.y + c.h / 2); g.scale(mc, mc); card(S, -c.w / 2, -c.h / 2, c.w, c.h, { fill: P.card, stroke: P.blue, r: 24 }); g.restore(); }
  const tail = (s, r, col) => {
    const tl = sp(t - T.TM - 0.25, ORG) * (1 - sp(t - S5.MERGE, SNAP));
    if (tl <= 0.01) return;
    const dir = s.side === 0 ? -1 : 1;
    g.fillStyle = col; g.beginPath(); g.moveTo(s.cx + dir * r * 0.35, s.cy + r * 0.8);
    g.lineTo(s.cx + dir * r * (0.35 + 0.55 * tl), s.cy + r * (0.8 + 0.5 * tl)); g.lineTo(s.cx + dir * r * 0.75, s.cy + r * 0.5); g.closePath(); g.fill();
  };
  const merging = t >= S5.MERGE;
  const [A, B] = shapes;
  const [lx, ly, lr] = bubbleState(S, 0), [rx, ry, rr] = bubbleState(S, 1);
  const preA = 1 - range(t, S5.MERGE - 0.2, S5.MERGE);

  // comparison with previous studies: documents fan out behind the left bubble, links to our results
  if (!merging || t < S5.MERGE + 0.3) {
    const fan = spring(t - m.prev + 0.05, ORG);
    if (fan > 0) {
      for (let d = 0; d < 3; d++) {
        const ang = (d - 1) * 0.28 * fan;
        const dx = lx + (d - 1) * 0.42 * R * fan, dy = ly - lr - 0.5 * R + Math.abs(d - 1) * 0.06 * R;
        g.save(); g.globalAlpha = preA * clamp(fan * 2); g.translate(dx, dy); g.rotate(ang);
        g.fillStyle = P.card; S.rrect(-0.24 * R, -0.3 * R, 0.48 * R, 0.6 * R, 10 * u); g.fill();
        icon(S, 'doc', 0, 0, 0.22 * R, 1, { color: P.dim, width: 3.5 });
        g.restore();
      }
      S.text('ÉTUDES ANTÉRIEURES', lx - lr * 0.4, ly + lr + 0.72 * R, { size: 24, weight: 700, face: 'mono', color: P.dim, align: 'center', tracking: 0.08, alpha: preA * swapAlpha(t, m.prev) });
      S.text('NOS RÉSULTATS', rx, ry + rr + 0.62 * R, { size: 24, weight: 700, face: 'mono', color: P.amber, align: 'center', tracking: 0.08, alpha: preA * swapAlpha(t, m.prev + 0.1) });
      // links with agree / disagree marks
      [[-0.32, 'check', P.blue], [0.05, 'check', P.blue], [0.42, 'cross', P.amber]].forEach(([off, ic, col], j) => {
        const lk = sp(t - m.prev - 0.25 - j * 0.15, [120, 20]);
        if (lk <= 0) return;
        const x0 = lx + lr * 0.9, y0 = ly + off * R, x1 = rx - rr * 0.95, y1 = ry + off * R * 0.6;
        g.save(); g.globalAlpha = preA; g.setLineDash([6 * u, 8 * u]); g.strokeStyle = P.slate; g.lineWidth = 3 * u;
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, lk), lerp(y0, y1, lk)); g.stroke(); g.setLineDash([]);
        const bs = spring(t - m.prev - 0.45 - j * 0.15, ORG);
        if (bs > 0) { const mx = (x0 + x1) / 2, my = (y0 + y1) / 2; g.fillStyle = P.bg; circle(g, mx, my, 24 * u * bs); g.fill(); g.strokeStyle = col; g.lineWidth = 3 * u; circle(g, mx, my, 24 * u * bs); g.stroke(); icon(S, ic, mx, my, 14 * u * bs, 1, { color: col, width: 4 }); }
        g.restore();
      });
    }
  }

  if (merging && t < S5.PILL + 0.05) {
    const ra = Math.min(A.w, A.h) / 2, rb = Math.min(B.w, B.h) / 2;
    tail(A, ra, colL); tail(B, rb, colR);
    g.fillStyle = colL;
    S.rrect(A.cx - A.w / 2, A.cy - A.h / 2, A.w, A.h, Math.min(A.w, A.h) / 2); g.fill();
    S.rrect(B.cx - B.w / 2, B.cy - B.h / 2, B.w, B.h, Math.min(B.w, B.h) / 2); g.fill();
    if (metaball(g, A.cx, A.cy, ra, B.cx, B.cy, rb)) g.fill();
    const core = rb * (1 - sp(t - S5.MERGE - 0.12, [110, 21]));
    if (core > 0.5) { g.fillStyle = colR; circle(g, B.cx, B.cy, core); g.fill(); }
  } else if (!merging) {
    for (const s of shapes) {
      const col = s.side === 0 ? colL : colR, r = Math.min(s.w, s.h) / 2;
      g.fillStyle = col; S.rrect(s.cx - s.w / 2, s.cy - s.h / 2, s.w, s.h, lerp(24 * u, r, sp(t - T.TM, [130, 17]))); g.fill();
      tail(s, r, col);
    }
    const outA = 1 - range(t, m.a - 0.2, m.a + 0.1);
    g.fillStyle = 'rgba(15,23,42,0.6)';
    [0.62, 0.86, 0.48].forEach((wf, j) => { const w = lr * 1.1 * wf * sp(t - q - j * 0.2, [170, 24]); if (w > 1) { g.globalAlpha = outA; S.rrect(lx - lr * 0.55, ly - lr * 0.32 + j * lr * 0.3, w, lr * 0.15, lr * 0.075); g.fill(); } });
    [0.42, 0.7, 1].forEach((hf, j) => { const hh = rr * 0.75 * hf * spring(t - res - j * 0.1, ORG); if (hh > 1) { g.globalAlpha = 1; g.fillStyle = 'rgba(15,23,42,0.62)'; S.rrect(rx - rr * 0.48 + j * rr * 0.36, ry + rr * 0.4 - hh, rr * 0.24, hh, rr * 0.06); g.fill(); } });
    g.globalAlpha = 1;
    // "∴" therefore, on "en déduire"
    const th = spring(t - ded, ORG) * outA;
    if (th > 0) { g.fillStyle = P.amber; const mx = (lx + rx) / 2, my = (ly + ry) / 2 - 0.05 * R; [[0, -1], [-0.9, 0.6], [0.9, 0.6]].forEach(([a, b]) => { circle(g, mx + a * 16 * u, my + b * 16 * u, 9 * u * th); g.fill(); }); }
    // limits: a dashed ring around our results
    const lim = sp(t - m.lim, [120, 20]);
    if (lim > 0) {
      g.save(); g.globalAlpha = preA; g.setLineDash([10 * u, 9 * u]); g.lineDashOffset = -t * 30 * u; g.strokeStyle = P.amber; g.lineWidth = 3.5 * u;
      circle(g, rx, ry, rr * lerp(2.2, 1.32, lim)); g.stroke(); g.setLineDash([]);
      S.text('LIMITES', rx, ry - rr * 1.32 - 24 * u, { size: 28, weight: 700, face: 'mono', color: P.amber, align: 'center', tracking: 0.12, alpha: lim });
      g.restore();
    }
  } else {
    const s = shapes[0];
    g.save(); g.translate(s.cx, s.cy);
    g.fillStyle = P.blue; S.rrect(-s.w / 2, -s.h / 2, s.w, s.h, Math.min(s.w, s.h) / 2); g.fill();
    g.clip();
    const lock = sp(t - S5.LOCK, [200, 30]);
    S.text(title, 0, ts * u * 0.33 + (1 - lock) * 14 * u, { size: ts, weight: 600, face: 'display', color: P.ink, align: 'center', tracking: lerp(0.07, 0, lock), alpha: swapAlpha(t, S5.LOCK - 0.1) });
    g.restore();
    const ul = sp(t - S5.LOCK - 0.18, SNAP);
    g.fillStyle = P.amber; S.rrect(s.cx - s.w * 0.36 * ul, s.cy - s.h / 2 - 24 * u, s.w * 0.72 * ul, 8 * u, 4 * u); g.fill();
    // leads for future research branch out of the conclusion
    for (let j = 0; j < 3; j++) {
      const br = sp(t - m.fut - j * 0.12, [90, 18]);
      if (br <= 0) continue;
      const x0 = s.cx + (j - 1) * 0.25 * s.w, y0 = s.cy + s.h / 2, x1 = midX + (j - 1) * 0.95 * R, y1 = midY + S.pick({ portrait: 1.05, landscape: 0.95 }) * R;
      g.save(); g.setLineDash([4 * u, 10 * u]); g.strokeStyle = P.amber; g.lineWidth = 4 * u; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x0, y0);
      const f = br; g.bezierCurveTo(x0, lerp(y0, (y0 + y1) / 2, f), lerp(x0, x1, f), lerp(y0, (y0 + y1) / 2, f), lerp(x0, x1, f), lerp(y0, y1, f)); g.stroke(); g.restore();
      const nsp = spring(t - m.fut - 0.35 - j * 0.12, ORG);
      if (nsp > 0) { g.save(); g.translate(x1, y1); g.scale(nsp, nsp); g.fillStyle = P.card; circle(g, 0, 0, 38 * u); g.fill(); g.strokeStyle = P.amber; g.lineWidth = 3.5 * u; circle(g, 0, 0, 38 * u); g.stroke(); S.text('?', 0, 16 * u, { size: 44, weight: 800, color: P.amber, align: 'center' }); g.restore(); }
    }
    S.text('PISTES DE RECHERCHE', midX, midY + S.pick({ portrait: 1.05, landscape: 0.95 }) * R + 100 * u, { size: 26, weight: 700, face: 'mono', color: P.dim, align: 'center', tracking: 0.12, alpha: swapAlpha(t, m.fut + 0.5) });
  }

  const v = track(t, [[0, 4], [T.TM + 0.18, 5]], 200, 28);
  odometer(S, v, Ly.nx, Ly.ny, Ly.ns);
  S.text('/5', Ly.nx + measure(S, '5', Ly.ns, 800, 'ui', -0.05) + 12 * u, Ly.ny - Ly.ns * 0.6 * u, { size: 38, weight: 500, face: 'mono', color: P.dim });
  g.restore();
}

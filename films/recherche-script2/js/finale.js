// R  three lenses on the same criteria: fixed in advance / negotiated / used to close off access.
// K  conclusion: a key full of competence still fails: prestige, closure and control block the door
//    of the most prestigious professions.
// E  "Pour en savoir plus" + the references.
import { P, ORG, TYPE, SNAP, sp, spring, clamp, lerp, range, noise, swapAlpha, typed, mixColor,
  measure, fitSize, circle, icon, card, wrap, paragraph } from './kit.js';
import { L, T, DUR } from './timing.js';
import { lock, slotsOf, BLUE, AMBER, CUTS, LK, LOCKBOX, xs, at } from './lock.js';
import { door } from './door.js';
import { lensRing, APPROACHES, AP_ICONS } from './primer.js';

const { r, k: kl, e } = L;

// ── R · recap ───────────────────────────────────────────────────────────────
function layR(S) {
  const { W, u } = S;
  return S.pick({
    portrait: { hx: 84 * u, hy: 330 * u, hs: 92, sy: 412 * u, vertical: true, row0: 600 * u, rowH: 335 * u, lockX: 250 * u, lk: 0.56 * u, tx: 500 * u },
    landscape: { hx: 150 * u, hy: 190 * u, hs: 84, sy: 262 * u, vertical: false, col0: W / 2 - 560 * u, colW: 560 * u, lockY: 520 * u, lk: 0.55 * u, ty: 740 * u },
  });
}
const STATES = ['Fixés d’avance', 'Négociés avec les clients', 'Utilisés pour fermer l’accès'];

export function recap(t, S) {
  const { g, W, H, u } = S;
  const R = layR(S), m = r.marks;
  const exit = clamp(sp(t - T.TK, [150, 22]));
  g.save(); g.globalAlpha = 1 - range(exit, 0, 0.5); g.translate(0, -exit * 0.3 * H);
  const head = 'Trois regards';
  const hs = fitSize(S, head, 600, 'display', W * 0.8, R.hs);
  g.save(); g.beginPath(); g.rect(0, R.hy - hs * u, W, hs * u * 1.3); g.clip();
  S.text(head, R.hx, R.hy + (1 - sp(t - T.TR - 0.05)) * hs * u * 1.2, { size: hs, weight: 600, face: 'display', color: P.ink });
  g.restore();
  g.save(); g.beginPath(); g.rect(0, R.sy + 10 * u - 60 * u, W, 80 * u); g.clip();
  S.text('sur les mêmes critères', R.hx + 4 * u, R.sy + 30 * u + (1 - sp(t - m.b)) * 70 * u, { size: 48, weight: 'italic 400', face: 'display', color: P.dim });
  g.restore();

  const lit = [m.f, m.i, m.c];
  for (let j = 0; j < 3; j++) {
    const s = spring(t - (T.TR + 0.25 + j * 0.12), ORG);
    if (s <= 0) continue;
    const on = sp(t - lit[j], SNAP);
    const [lx, ly] = R.vertical ? [R.lockX, R.row0 + j * R.rowH + 120 * u] : [R.col0 + j * R.colW, R.lockY];
    g.save(); g.globalAlpha *= clamp(s * 2); g.translate(0, (1 - s) * 80 * u);
    // the same lock, three readings
    const slots = slotsOf();
    // fixed: stamped by the group and the State · negotiated: pins keep moving · closed: padlocked pins
    let glow = 0;
    if (j === 0) { [0, 6].forEach((i, q) => { slots[i].badge = { p: spring(t - lit[0] - q * 0.12, [260, 16]), icon: q ? 'institution' : 'people', color: P.amber }; }); glow = 0.6 * on; }
    if (j === 1) BLUE.forEach((i, q) => { slots[i].lk = LK[i] + Math.sin(t * 3.2 + q * 1.7) * 14 * (0.3 + 0.7 * on); if (q === 1 || q === 2) slots[i].badge = { p: spring(t - lit[1] - (q - 1) * 0.12, [260, 16]), icon: 'bubble', color: q === 1 ? P.blue : P.amber }; });
    if (j === 2) AMBER.forEach((i, q) => { slots[i].open = 1; slots[i].pin = 1; slots[i].badge = { p: spring(t - lit[2] - q * 0.1, [260, 16]), icon: 'padlock', color: P.amber }; });
    lock(S, lx, ly, R.lk, { slots, glow });
    // label
    const col = j === 2 ? P.amber : P.blue;
    const [tx, ty, al] = R.vertical ? [R.tx, ly - 34 * u, 'left'] : [lx, R.ty, 'center'];
    S.text(`${j + 1} · ${APPROACHES[j]}`, tx, ty, { size: S.pick({ portrait: 32, landscape: 30 }), weight: 700, color: mixColor(P.dim, col, on), align: al });
    const sl = STATES[j];
    const maxW = S.pick({ portrait: W - R.tx - 60 * u, landscape: R.colW - 60 * u });
    const ss = Math.min(S.pick({ portrait: 46, landscape: 40 }), fitSize(S, sl, 600, 'display', maxW, 46));
    S.text(sl, tx, ty + 62 * u, { size: ss, weight: 600, face: 'display', color: mixColor(P.slate, P.ink, on), align: al });
    if (on > 0) { const w = measure(S, sl, ss, 600, 'display') * sp(t - lit[j] - 0.1, [170, 26]); g.fillStyle = col; S.rrect(al === 'center' ? tx - w / 2 : tx, ty + 80 * u, w, 6 * u, 3 * u); g.fill(); }
    g.restore();
  }
  g.restore();
}

// ── K · conclusion ──────────────────────────────────────────────────────────
function layK(S) {
  const { W, H, u } = S;
  return S.pick({
    portrait: { ex: 84 * u, ey: 300 * u, hx: 84 * u, hy: 400 * u, hs: 70, hw: W * 0.84, lx: W / 2 + 100 * u, ly: 1040 * u, k: 1.0 * u,
      barY: 1270 * u, chipsY: 1290 * u,
      dX: W / 2 - 230 * u, dY: 730 * u, dW: 460 * u, dH: 640 * u },
    landscape: { ex: 150 * u, ey: 260 * u, hx: 150 * u, hy: 360 * u, hs: 64, hw: 640 * u, lx: W * 0.67, ly: 480 * u, k: 0.78 * u,
      barY: 760 * u, chipsY: 770 * u,
      dX: W * 0.67 - 190 * u, dY: 150 * u, dW: 380 * u, dH: 560 * u },
  });
}
const BLOCKERS = [['star', 'Prestige', 'pres'], ['padlock', 'Fermetures', 'ferm'], ['pie', 'Contrôle', 'ctrl']];

export function conclusion(t, S) {
  const { g, W, H, u } = S;
  const K = layK(S), m = kl.marks;
  const exit = clamp(sp(t - T.TE, [150, 22]));
  g.save(); g.globalAlpha = 1 - range(exit, 0, 0.5); g.translate(0, -exit * 0.3 * H);
  const ent = sp(t - m.ent + 0.1, [55, 15]);              // pull back to the door

  // words
  const ey = typed('CE QUE LES RECHERCHES ONT DÉCOUVERT', t - m.a + 0.1, 40);
  if (ey) S.text(ey, K.ex, K.ey, { size: S.pick({ portrait: 28, landscape: 26 }), weight: 700, face: 'mono', color: P.amber, tracking: 0.08 });
  const hA = swapAlpha(t, m.comp - 0.1);
  if (hA > 0) paragraph(S, t, 'Les compétences ne suffisent pas.', K.hx, K.hy + 40 * u, { size: K.hs, weight: 600, face: 'display', maxW: K.hw, alpha: hA,
    rise: (1 - sp(t - m.comp + 0.1)) * 40 * u, marks: [{ phrase: 'ne suffisent pas', t: m.ns + 0.1, color: P.amber }] });

  // the scene, in door space: the lock sits at the handle of a tall door; we start pushed in on the lock
  const hx = K.dX + 0.56 * K.dW, hy = K.dY + 0.5 * K.dH, kf = 0.24 * u;
  const Z = lerp(K.k / kf, 1, ent);
  const cxs = lerp(K.lx, hx, ent), cys = lerp(K.ly, hy, ent);
  g.save();
  g.translate(cxs, cys); g.scale(Z, Z); g.translate(-hx, -hy);
  // the door, its steps and its neighbours appear as we pull back
  if (ent > 0.01) {
    g.save(); g.globalAlpha *= range(ent, 0.15, 0.7);
    const st = 34 * u;
    for (let s = 0; s < 3; s++) { g.fillStyle = s === 0 ? '#2B3A52' : s === 1 ? '#26354D' : P.card; g.fillRect(K.dX - (40 + s * 50) * u, K.dY + K.dH + s * st, K.dW + (80 + s * 100) * u, st); }
    const small = [[-1, 0], [-2, 1], [1, 0], [2, 1]];
    small.forEach(([side, lvl], q) => {
      const w = K.dW * 0.42, h = K.dH * 0.5, x = side < 0 ? K.dX + side * (w + 40 * u) - (side === -2 ? 0 : 0) : K.dX + K.dW + 40 * u + (side - 1) * (w + 40 * u);
      door(S, { x, y: K.dY + K.dH + 3 * st - h + lvl * 0, w, h }, { build: 1, alpha: 0.35, label: 0, name: null });
    });
    door(S, { x: K.dX, y: K.dY, w: K.dW, h: K.dH }, { build: 1, light: 0.7, label: 0, name: null, edge: P.amber });
    g.restore();
  }
  // the lock: competence pins align, closure pins don't
  const slots = slotsOf();
  AMBER.forEach((i) => { slots[i].open = 1; slots[i].pin = spring(t - (m.a + 0.3), [180, 16]); });
  BLOCKERS.forEach(([ic, , mk], j) => {
    const i = AMBER[j];
    slots[i].badge = { p: spring(t - m[mk] + 0.05, ORG), icon: ic, draw: sp(t - m[mk], [60, 15]), color: P.amber };
  });
  const kIn = m.comp + 0.45, ins = clamp(spring(t - kIn, [50, 15]));
  const flag = sp(t - (kIn + 1.15), SNAP);
  BLUE.forEach((i, j) => { slots[i].badge = { p: spring(t - (kIn + 1.0 + j * 0.06), [260, 16]), icon: 'check', color: P.blue }; });
  const shake = t > kIn + 1.15 ? 10 * Math.sin((t - kIn - 1.15) * 42) * Math.exp(-(t - kIn - 1.15) * 6) : 0;
  // drawn at the handle in door space with the scale that reads as K.k on screen before the pull-back
  lock(S, hx, hy, kf, { build: spring(t - (m.a - 0.1), ORG), slots, key: { ins, cuts: CUTS, shake, bow: { icon: 'cap', color: P.sky } }, flag });
  g.restore();

  // competence gauge (before the pull-back)
  const ga = spring(t - (m.comp - 0.15), ORG) * (1 - range(t, m.log - 0.2, m.log + 0.1));
  if (ga > 0) {
    g.save(); g.globalAlpha *= clamp(ga * 2);
    const bw = S.pick({ portrait: 560, landscape: 520 }) * u, x0 = S.pick({ portrait: W / 2 - bw / 2 + 70 * u, landscape: K.lx - bw / 2 }), y = K.barY;
    S.text('Compétences', x0, y - 26 * u, { size: 34, weight: 700, color: P.ink });
    const segW = (bw - 4 * 10 * u) / 5;
    for (let q = 0; q < 5; q++) {
      const on = sp(t - (m.comp + 0.05 + q * 0.08), SNAP);
      g.fillStyle = mixColor(P.card, P.sky, on); S.rrect(x0 + q * (segW + 10 * u), y, segW, 28 * u, 8 * u); g.fill();
    }
    const ck = spring(t - m.comp - 0.5, [260, 16]);
    if (ck > 0) { g.save(); g.translate(x0 + bw + 40 * u, y + 14 * u); g.scale(ck, ck); g.fillStyle = P.sky; circle(g, 0, 0, 22 * u); g.fill(); icon(S, 'check', 0, 0, 12 * u, 1, { color: P.bg, width: 4.5 }); g.restore(); }
    g.restore();
  }
  // the three blockers, named
  BLOCKERS.forEach(([ic, label, mk], j) => {
    const s = spring(t - m[mk] + 0.05, ORG) * (1 - range(t, m.ent - 0.1, m.ent + 0.2));
    if (s <= 0) return;
    const cw = S.pick({ portrait: 290, landscape: 262 }) * u, gap = S.pick({ portrait: 20, landscape: 16 }) * u, x0 = S.pick({ portrait: W / 2 - (3 * cw + 2 * gap) / 2, landscape: K.lx - (3 * cw + 2 * gap) / 2 }) + j * (cw + gap);
    g.save(); g.globalAlpha *= clamp(s * 2); g.translate(0, (1 - s) * 40 * u);
    card(S, x0, K.chipsY - 40 * u, cw, 80 * u, { fill: P.card2, r: 40, stroke: P.amber });
    icon(S, ic, x0 + 44 * u, K.chipsY, 17 * u, sp(t - m[mk], [60, 15]), { color: P.amber, width: 4 });
    S.text(label, x0 + 78 * u, K.chipsY + 12 * u, { size: S.pick({ portrait: 34, landscape: 30 }), weight: 700, color: P.ink });
    g.restore();
  });
  // after the pull-back: the door of the most prestigious professions
  const tp = spring(t - m.top + 0.05, ORG);
  if (tp > 0) {
    const sx = K.dX + K.dW / 2, sy = K.dY - 64 * u;
    g.save(); g.globalAlpha *= clamp(tp * 2); g.translate(sx, sy); g.scale(clamp(tp, 0, 1.2), clamp(tp, 0, 1.2));
    g.fillStyle = P.amber; circle(g, 0, 0, 40 * u); g.fill();
    icon(S, 'star', 0, 0, 24 * u, 1, { color: P.bg, width: 4.5 });
    g.restore();
    const lab = 'Les professions les plus prestigieuses';
    const ls = fitSize(S, lab, 600, 'ui', S.pick({ portrait: W * 0.86, landscape: 760 * u }), 38);
    S.text(lab, S.pick({ portrait: W / 2, landscape: K.dX + K.dW / 2 }), S.pick({ portrait: K.dY + K.dH + 3 * 34 * u + 70 * u, landscape: K.dY + K.dH + 3 * 34 * u + 60 * u }),
      { size: ls, weight: 600, color: P.ink, align: 'center', alpha: clamp(tp * 2) });
  }
  g.restore();
}

// ── E · references ──────────────────────────────────────────────────────────
const REFS = [
  { authors: 'Dubar, C., Tripier, P., & Boussard, V. (2015).', title: 'De Weber aux « nouvelles » théories des professions.', titleStyle: '400',
    lines: [['Dans ', 'Sociologie des professions', ' (p. 119‑148). Armand Colin.']], doi: 'https://doi.org/10.3917/arco.dubar.2015.01.0119', col: P.blue },
  { authors: 'Macdonald, K. M. (1995).', title: 'The Sociology of the Professions.', titleStyle: 'italic 400', lines: [['', '', 'SAGE Publications.']], col: P.amber },
];

export function ending(t, S) {
  const { g, W, u } = S;
  const m = e.marks;
  const E = S.pick({
    portrait: { x: 84 * u, hy: 440 * u, hs: 84, sy: 520 * u, ly: 660 * u, y0: 700 * u, w: W - 168 * u, ts: 36, sigY: S.H * 0.79 },
    landscape: { x: 150 * u, hy: 190 * u, hs: 76, sy: 258 * u, ly: 360 * u, y0: 390 * u, w: W - 300 * u, ts: 34, sigY: S.H * 0.86 },
  });
  const push = 1 + 0.035 * range(t, m.b, DUR);
  g.save(); g.translate(W / 2, S.H / 2); g.scale(push, push); g.translate(-W / 2, -S.H / 2);
  const head = 'Pour en savoir plus';
  const hs = fitSize(S, head, 600, 'display', W * 0.8, E.hs);
  g.save(); g.beginPath(); g.rect(0, E.hy - hs * u, W, hs * u * 1.25); g.clip();
  S.text(head, E.x, E.hy + (1 - sp(t - T.TE - 0.25)) * hs * u * 1.2, { size: hs, weight: 600, face: 'display', color: P.ink });
  g.restore();
  const uw = measure(S, head, hs, 600, 'display') * sp(t - m.a - 0.3, [170, 26]);
  if (uw > 0) { g.fillStyle = P.amber; S.rrect(E.x, E.hy + 24 * u, uw, 9 * u, 4.5 * u); g.fill(); }
  const sub = typed('SOCIOLOGIE DES PROFESSIONS', t - m.soc, 36);
  if (sub) S.text(sub, E.x + 2 * u, E.sy + 30 * u, { size: 30, weight: 700, face: 'mono', color: P.amber, tracking: 0.1 });
  S.text('RÉFÉRENCES', E.x + 2 * u, E.ly, { size: 26, weight: 700, face: 'mono', color: P.dim, tracking: 0.14, alpha: swapAlpha(t, m.soc + 0.4) });

  let y = E.y0;
  REFS.forEach((R, i) => {
    const s = spring(t - (i ? m.b - 0.05 : m.soc + 0.55), ORG);
    const tx = E.x + 130 * u, maxW = E.w - 170 * u;
    const lines = wrap(S, R.title, E.ts, R.titleStyle, 'display', maxW);
    const extra = (R.doi ? 1 : 0);
    const h = 40 * u + 44 * u + lines.length * E.ts * u * 1.3 + 46 * u * (1 + extra) + 26 * u;
    if (s > 0) {
      g.save(); g.globalAlpha = clamp(s * 2); g.translate((1 - s) * 80 * u, 0);
      card(S, E.x, y, E.w, h, { fill: P.card, r: 26 });
      g.fillStyle = R.col; S.rrect(E.x + 34 * u, y + 34 * u, 64 * u, h - 68 * u, 8 * u); g.fill();
      g.fillStyle = 'rgba(15,23,42,0.35)'; g.fillRect(E.x + 46 * u, y + 34 * u, 6 * u, h - 68 * u);
      S.text(R.authors, tx, y + 64 * u, { size: 32, weight: 700, color: P.ink });
      lines.forEach((ln, k) => S.text(ln.join(' '), tx, y + 64 * u + 54 * u + k * E.ts * u * 1.3, { size: E.ts, weight: R.titleStyle, face: 'display', color: P.ink }));
      let yy = y + 64 * u + 54 * u + lines.length * E.ts * u * 1.3 + 8 * u;
      R.lines.forEach(([a, it, b]) => {
        let x = tx;
        if (a) x += S.text(a, x, yy, { size: 28, weight: 500, color: P.dim });
        if (it) x += S.text(it, x, yy, { size: 30, weight: 'italic 400', face: 'display', color: P.ink });
        if (b) S.text(b, x, yy, { size: 28, weight: 500, color: P.dim });
      });
      if (R.doi) S.text(R.doi, tx, yy + 44 * u, { size: S.pick({ portrait: 22, landscape: 24 }), weight: 500, face: 'mono', color: P.sky });
      g.restore();
    }
    y += h + 30 * u;
  });
  g.restore();
  // signature: the three lenses, a light running across them, once the subtitles are gone
  const sa = range(t, e.end + 0.3, e.end + 0.8);
  if (sa > 0) {
    const gap = S.pick({ portrait: 200, landscape: 170 }) * u, x0 = W / 2 - gap, y = E.sigY;
    const run = ((t - e.end) * 0.5) % 1.2;
    g.save(); g.globalAlpha = sa;
    g.strokeStyle = P.slate; g.lineWidth = 3 * u; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 2 * gap, y); g.stroke();
    for (let i = 0; i < 3; i++) {
      const glow = Math.max(0, 1 - Math.abs(run * 3 - i) * 1.2);
      g.fillStyle = mixColor(P.card, i === 2 ? P.amber : P.blue, 0.25 + 0.6 * glow); circle(g, x0 + i * gap, y, 40 * u); g.fill();
      lensRing(S, x0 + i * gap, y, 40 * u, { color: i === 2 ? P.amber : P.blue, width: 4, ticks: false, caret: false });
      icon(S, AP_ICONS[i], x0 + i * gap, y, 18 * u, 1, { color: P.ink, width: 3.5 });
    }
    g.restore();
  }
}

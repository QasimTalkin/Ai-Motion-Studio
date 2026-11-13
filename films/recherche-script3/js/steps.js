// R  the tools leave sociology for an organization: magnifier, map, notebook, recorder fly to an office tower.
// 6  ?→6 "6 étapes".
// K  one institutional map, built step by step on the running example (a diploma from elsewhere):
//    1 the reported problem · 2 the organization's text · 3 laws, policies, procedures · 4 impacts ·
//    5 the two discourses compared · 6 the text amended and the frame redrawn around her.
// Z  the three people from the start: threads to their texts, then each frame redraws to fit.
import { P, ORG, TYPE, SNAP, HEAVY, sp, spring, clamp, lerp, range, track, hash, noise, swapAlpha, typed, mixColor,
  measure, fitSize, circle, icon, odometer, numeral, lay } from './kit.js';
import { L, T } from './timing.js';
import { PAPER, INK, INK2, RULE, paper, field, stamp, notebook, figure, cadre, tag, arrow, along } from './paper.js';
import { headF, zone } from './assises.js';

const { r1, r2, k1, k2, k3, k4, k5, k6, z } = L;

// ── R · from sociology to organizations ─────────────────────────────────────
export function chapterR(t, S) {
  const { g, W, H, u } = S;
  const m = r1.marks, m2 = r2.marks;
  const out = clamp(sp(t - (T.K - 0.1), [130, 22]));
  if (out >= 1) return;
  g.save(); g.globalAlpha = 1 - out; g.translate(0, -out * 200 * u);
  const toSix = sp(t - T.SIX, [110, 20]);
  // two places: the sociology lab (left/top) and the organization (right/bottom)
  if (toSix < 1) {
    g.save(); g.globalAlpha *= 1 - toSix; g.translate(0, -toSix * 120 * u);
    const [hx, hy] = S.pick({ portrait: [84 * u, 330 * u], landscape: [150 * u, 300 * u] });
    S.text('Des outils', hx, hy + (1 - sp(t - T.R - 0.1)) * 30 * u, { size: S.pick({ portrait: 84, landscape: 76 }), weight: 600, face: 'display', color: P.ink });
    S.text('transposables', hx, hy + S.pick({ portrait: 92, landscape: 84 }) * u + (1 - sp(t - T.R - 0.2)) * 30 * u, { size: S.pick({ portrait: 84, landscape: 76 }), weight: 'italic 600', face: 'display', color: P.amber });
    const L1 = S.pick({ portrait: { x: 84 * u, y: 690 * u, w: 420 * u, h: 560 * u }, landscape: { x: 900 * u, y: 190 * u, w: 380 * u, h: 560 * u } });
    const L2 = S.pick({ portrait: { x: W - 84 * u - 360 * u, y: 640 * u, w: 360 * u, h: 760 * u }, landscape: { x: 1440 * u, y: 120 * u, w: 340 * u, h: 700 * u } });
    // the lab: a card with a bookshelf
    const la = spring(t - (m.soc - 0.6), ORG);
    g.save(); g.globalAlpha *= clamp(la * 2);
    g.fillStyle = P.card; S.rrect(L1.x, L1.y, L1.w, L1.h, 22 * u); g.fill();
    S.text('SOCIOLOGIE', L1.x + 26 * u, L1.y + 46 * u, { size: 24, weight: 700, face: 'mono', color: P.sky, tracking: 0.12 });
    for (let s = 0; s < 3; s++) {
      const sy = L1.y + L1.h * (0.55 + s * 0.14);
      g.fillStyle = '#2B3A52'; g.fillRect(L1.x + 20 * u, sy, L1.w - 40 * u, 8 * u);
      for (let b = 0; b < 9; b++) { const bh = (30 + 26 * hash(b + s * 9, 3)) * u; g.fillStyle = mixColor('#334155', P.blue, hash(b + s * 9, 4) * 0.6); g.fillRect(L1.x + 26 * u + b * (L1.w - 60 * u) / 9, sy - bh, (L1.w - 60 * u) / 9 - 4 * u, bh); }
    }
    g.restore();
    // the organization: an office tower whose windows light up
    const ta = spring(t - (m.org - 0.5), ORG), lit = sp(t - m.org, [40, 14]);
    if (ta > 0) {
      g.save(); g.globalAlpha *= clamp(ta * 2);
      const bh = L2.h * clamp(ta, 0, 1.05);
      g.fillStyle = '#1B2A44'; g.fillRect(L2.x, L2.y + L2.h - bh, L2.w, bh);
      g.strokeStyle = P.slate; g.lineWidth = 3 * u; g.strokeRect(L2.x, L2.y + L2.h - bh, L2.w, bh);
      const cols = 4, rows = 9, ww = L2.w / cols, wh = (L2.h - 120 * u) / rows;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const wy = L2.y + 90 * u + r * wh;
        if (wy < L2.y + L2.h - bh) continue;
        const on = clamp(lit * 2.2 - hash(r * cols + c, 8) * 1.2);
        g.fillStyle = mixColor('#22324D', P.amber, on * 0.85); g.fillRect(L2.x + c * ww + 10 * u, wy + 8 * u, ww - 20 * u, wh - 16 * u);
      }
      S.text('ORGANISATION', L2.x + L2.w / 2, L2.y + 54 * u, { size: 22, weight: 700, face: 'mono', color: P.amber, align: 'center', tracking: 0.12 });
      g.restore();
    }
    // the tools: hang in the lab, glow on "outils", fly over on "transposer"
    const TOOLS = [['eye', 'observer'], ['doc', 'textes'], ['clipboard', 'entretiens'], ['funnel', 'cartographier']];
    TOOLS.forEach(([ic, name], i) => {
      const s = spring(t - (m.soc - 0.3 + i * 0.1), ORG);
      if (s <= 0) return;
      const ax = L1.x + L1.w * (0.2 + (i % 2) * 0.48), ay = L1.y + L1.h * (0.2 + Math.floor(i / 2) * 0.17);
      const bx = L2.x + L2.w * (0.25 + (i % 2) * 0.5), by = L2.y + L2.h * (0.62 + Math.floor(i / 2) * 0.16);
      const f = sp(t - (m.tr + i * 0.12), [60, 14]);
      const [x, y] = along(ax, ay, bx, by, clamp(f), 0.25);
      const glow = sp(t - m.b, SNAP);
      g.save(); g.globalAlpha *= clamp(s * 2); g.translate(x, y); g.scale(clamp(s, 0, 1.1), clamp(s, 0, 1.1));
      const gl = glow * (1 - clamp(f * 1.5));
      g.fillStyle = mixColor(P.card2, P.amber, gl * 0.9); circle(g, 0, 0, 40 * u); g.fill();
      g.strokeStyle = P.amber; g.lineWidth = 3 * u; circle(g, 0, 0, 40 * u); g.stroke();
      icon(S, ic, 0, 0, 19 * u, 1, { color: gl > 0.5 ? P.bg : P.amber, width: 4 });
      S.text(name, 0, 66 * u, { size: 20, weight: 700, color: P.ink, align: 'center' });
      g.restore();
      if (f > 0 && f < 1) arrow(S, ax, ay, x, y, 1, { color: 'rgba(245,158,11,0.35)', dash: [6, 8], width: 2, bend: 0.25, head: 0 });
    });
    g.restore();
  }
  // 6 étapes
  if (toSix > 0) {
    const [x, y, size] = S.pick({ portrait: [84 * u, 560 * u, 170], landscape: [150 * u, 520 * u, 170] });
    const v = sp(t - (m2.six - 0.35), SNAP) * 3 + sp(t - (m2.six - 0.1), SNAP) * 3;
    g.save(); g.globalAlpha *= clamp(toSix * 1.5);
    S.text(typed('POUR UNE ORGANISATION PLUS INCLUSIVE', t - m2.inc + 0.4, 40), x + 4 * u, y - size * u * 0.95, { size: 26, weight: 700, face: 'mono', color: P.amber, tracking: 0.08 });
    odometer(S, v, x, y, size, { color: P.amber });
    const dW = measure(S, '6', size, 800, 'ui', -0.05) + 26 * u;
    g.save(); g.beginPath(); g.rect(x + dW - 10 * u, y - size * u * 0.85, W, size * u * 1.1); g.clip();
    S.text('étapes', x + dW, y + (1 - sp(t - m2.six)) * size * u * 1.1, { size, weight: 800, color: P.ink, tracking: -0.03 });
    g.restore();
    // six steps on a rail
    const NAMES = ['Documenter', 'Repérer', 'Forces exogènes', 'Impacts', 'Comparer', 'Améliorer'];
    const [rx, ry, gap, cols] = S.pick({ portrait: [84 * u, 740 * u, 116 * u, 1], landscape: [1080 * u, 220 * u, 112 * u, 1] });
    NAMES.forEach((nm, i) => {
      const s = spring(t - (m2.six + 0.3 + i * 0.1), ORG);
      if (s <= 0) return;
      const ny = ry + i * gap, nr = 40 * u;
      g.save(); g.globalAlpha *= clamp(s * 2);
      g.fillStyle = P.card2; circle(g, rx + nr, ny, nr * clamp(s, 0, 1.1)); g.fill();
      g.strokeStyle = i === 5 ? P.amber : P.blue; g.lineWidth = 4 * u; circle(g, rx + nr, ny, nr * clamp(s, 0, 1.1)); g.stroke();
      S.text(String(i + 1), rx + nr, ny + 14 * u, { size: 38, weight: 800, color: P.ink, align: 'center' });
      S.text(nm, rx + nr * 2 + 28 * u, ny + 15 * u, { size: 42, weight: 600, color: P.ink });
      if (i < 5) { g.strokeStyle = P.slate; g.lineWidth = 3 * u; g.beginPath(); g.moveTo(rx + nr, ny + nr + 6 * u); g.lineTo(rx + nr, ny + gap - nr - 6 * u); g.stroke(); }
      g.restore();
    });
    g.restore();
  }
  g.restore();
}

// ── K · the map ─────────────────────────────────────────────────────────────
const STEP_T = ['Documenter le problème', 'Repérer le discours', 'Forces exogènes', 'Analyser les impacts', 'Comparer les discours', 'Améliorer le cadre'];
function layK(S) {
  const { W, u } = S;
  return S.pick({
    portrait: { forceY: 640 * u, orgY: 830 * u, perY: 1545 * u, cx: W / 2, w: W - 168 * u, x: 84 * u, docW: 300 * u, orgW: 640 * u, ph: 240 * u, cmpY: 860 * u, fh: 112 * u },
    landscape: { forceY: 96 * u, orgY: 250 * u, perY: 815 * u, cx: 1350 * u, w: 900 * u, x: 900 * u, docW: 270 * u, orgW: 580 * u, ph: 210 * u, cmpY: 300 * u, fh: 90 * u },
  });
}
export function chapterK(t, S) {
  const { g, W, H, u } = S;
  const K = layK(S);
  const steps = [k1, k2, k3, k4, k5, k6];
  const cur = steps.reduce((a, l, i) => (t >= l.start - 0.5 ? i : a), 0);
  const out = clamp(sp(t - T.Z, [130, 22]));
  if (out >= 1) return;
  g.save(); g.globalAlpha = range(t, T.K, T.K + 0.3) * (1 - out); g.translate(0, -out * 200 * u);
  // header: the step number and name swap with each step
  steps.forEach((l, i) => {
    const a = swapAlpha(t, l.start - 0.45, i < 5 ? steps[i + 1].start - 0.5 : Infinity);
    if (a <= 0) return;
    g.save(); g.globalAlpha *= a;
    headF(t, S, i + 1, STEP_T[i], l.start - 0.5, 6);
    g.restore();
  });
  const cmp = sp(t - k5.marks.cmp + 0.1, [100, 18]) * (1 - sp(t - k6.start + 0.3, [100, 18]));   // step 5 rearranges the map
  const fix = (m) => sp(t - m, [170, 24]);
  // the map's layers, waiting: dashed outlines filled in by steps 2 and 3
  const sk = range(t, T.K + 0.2, T.K + 0.6) * (1 - cmp);
  if (sk > 0) {
    g.save(); g.globalAlpha *= sk; g.setLineDash([10 * u, 9 * u]); g.lineWidth = 2.5 * u;
    const fwd = (K.w - 48 * u) / 3;
    const fill3 = (i) => spring(t - [k3.marks.lois, k3.marks.pol, k3.marks.proc][i] + 0.1, ORG);
    for (let i = 0; i < 3; i++) if (fill3(i) <= 0) { g.strokeStyle = 'rgba(147,197,253,0.45)'; S.rrect(K.x + i * (fwd + 24 * u), K.forceY, fwd, K.fh, 16 * u); g.stroke(); }
    if (spring(t - (k2.marks.disc - 0.25), ORG) <= 0) { g.strokeStyle = 'rgba(147,197,253,0.45)'; S.rrect(K.cx - K.orgW / 2, K.orgY, K.orgW, K.ph * 1.12, 10 * u); g.stroke(); }
    g.setLineDash([]);
    if (fill3(0) <= 0) S.text('?', K.x + fwd / 2, K.forceY + 72 * u, { size: 52, weight: 700, color: 'rgba(147,197,253,0.5)', align: 'center' });
    if (spring(t - (k2.marks.disc - 0.25), ORG) <= 0) S.text('?', K.cx, K.orgY + K.ph * 0.6, { size: 64, weight: 700, color: 'rgba(147,197,253,0.5)', align: 'center' });
    S.text('FORCES EXOGÈNES', K.x, K.forceY - 18 * u, { size: 18, weight: 700, face: 'mono', color: 'rgba(147,197,253,0.6)', tracking: 0.1, alpha: 1 - range(t, k3.marks.an - 0.2, k3.marks.an) });
    S.text('DISCOURS DE L’ORGANISATION', K.cx - K.orgW / 2, K.orgY - 14 * u, { size: 18, weight: 700, face: 'mono', color: 'rgba(147,197,253,0.6)', tracking: 0.1, alpha: 1 - range(t, k2.marks.disc - 0.3, k2.marks.disc) });
    g.restore();
  }
  // ── person + reported problem (1) ──
  const p1 = spring(t - (k1.marks.doc - 0.2), ORG);
  const px = K.x + K.w * S.pick({ portrait: 0.18, landscape: 0.14 }), py = K.perY;
  const inc = sp(t - k6.marks.cad, [70, 14]);
  if (p1 > 0) {
    // the frame around her: too tight, then redrawn to fit on step 6
    const fw = K.ph * lerp(0.42, 0.78, inc), fh = K.ph * lerp(0.76, 1.12, inc);
    cadre(S, px - fw / 2, py - fh + lerp(0, 18, inc) * u, fw, fh, { color: mixColor(P.blue, P.amber, inc), alpha: clamp(p1 * 2), bw: 6, label: inc > 0.5 ? 'INCLUSIF' : 'CADRE' });
    figure(S, px, py, K.ph * clamp(p1, 0, 1.06), { color: P.amber, t, seed: 3 });
    const nbx = px + K.ph * 0.5, nby = py - K.ph * 0.95, nbw = K.w - (nbx - K.x), nbh = K.ph * 0.78;
    const lines = ['« Je ne peux pas fournir', 'ce document… »'];
    notebook(S, lerp(nbx, K.x + 8 * u, cmp), lerp(nby, K.cmpY, cmp), lerp(nbw, K.w * 0.46, cmp), nbh,
      { alpha: clamp(p1 * 2), title: 'PROBLÈME RAPPORTÉ', lines, lineP: sp(t - k1.marks.rap + 0.1, [40, 14]), size: S.pick({ portrait: 30, landscape: 28 }) });
    // "one or more people": two more reports stack behind
    [1, 2].forEach((j) => {
      const s = spring(t - (k1.marks.rap + 0.4 + j * 0.15), ORG) * (1 - cmp);
      if (s > 0) { g.save(); g.globalAlpha *= clamp(s) * 0.7; g.fillStyle = P.amber; S.rrect(nbx + j * 14 * u, nby - j * 14 * u, nbw - 10 * u, 10 * u, 5 * u); g.fill(); g.restore(); }
    });
    tag(S, K.x, py + 44 * u, 'EXEMPLE', { color: P.amber, alpha: clamp(p1) });
  }
  // ── organization's text (2), amended on (6) ──
  const p2 = spring(t - (k2.marks.disc - 0.25), ORG);
  const ox = K.cx - K.orgW / 2, oh = K.ph * 1.12;
  const oxC = lerp(ox, K.x + K.w * 0.54, cmp), oyC = lerp(K.orgY, K.cmpY, cmp);
  const ow = lerp(K.orgW, K.w * 0.46, cmp);
  if (p2 > 0) {
    const yy = paper(S, oxC, oyC + (1 - clamp(p2)) * 140 * u, ow, oh, { title: 'POLITIQUE D’ADMISSION', titleSize: S.pick({ portrait: 24, landscape: 22 }), sub: 'ART. 4', alpha: clamp(p2 * 2), seed: 91 });
    const a4 = 'Relevé de notes officiel', a4b = 'd’un établissement d’ici exigé.';
    const hl = sp(t - k2.marks.same, [120, 20]);
    const fs = S.pick({ portrait: 25, landscape: 22 });
    g.save(); g.globalAlpha *= clamp(p2 * 2);
    g.fillStyle = `rgba(245,158,11,${0.32 * hl})`; g.fillRect(oxC + 20 * u, yy + 4 * u, (measure(S, a4b, fs, 600) + 10 * u) * hl, fs * 2.6 * u);
    S.text(a4, oxC + 24 * u, yy + 28 * u, { size: fs, weight: 600, color: INK });
    S.text(a4b, oxC + 24 * u, yy + 28 * u + fs * 1.3 * u, { size: fs, weight: 600, color: INK });
    const am = fix(k6.marks.amel);
    if (am > 0) {
      g.fillStyle = INK; g.fillRect(oxC + 22 * u, yy + 28 * u + fs * 1.3 * u - fs * 0.32 * u, (measure(S, a4b, fs, 600) + 4 * u) * am, 3 * u);
      S.text('… ou une évaluation comparative des études.', oxC + 24 * u, yy + 28 * u + fs * 2.7 * u, { size: fs - 1, weight: 700, color: '#B45309', alpha: am });
    }
    g.restore();
    const v2 = spring(t - (k6.marks.amel + 0.7), [260, 15]);
    if (v2 > 0) { g.save(); g.translate(oxC + ow - 46 * u, oyC + 40 * u); g.scale(v2, v2); g.fillStyle = P.amber; S.rrect(-32 * u, -18 * u, 64 * u, 36 * u, 18 * u); g.fill(); S.text('v2', 0, 9 * u, { size: 24, weight: 800, face: 'mono', color: P.bg, align: 'center' }); g.restore(); }
    // link to the person: the same problem
    const lk = sp(t - k2.marks.same, [70, 16]) * (1 - cmp);
    if (lk > 0) arrow(S, px + 20 * u, py - K.ph * 1.0, oxC + 60 * u, oyC + oh, lk, { color: P.amber, dash: [10, 8], width: 3, head: 0, bend: 0.15 });
  }
  // ── external forces (3) ──
  const FORCES = [['Lois', 'scales', k3.marks.lois], ['Politiques', 'institution', k3.marks.pol], ['Procédures', 'clipboard', k3.marks.proc]];
  const fa = 1 - cmp;
  FORCES.forEach(([name, ic, tm], i) => {
    const s = spring(t - tm + 0.1, ORG);
    if (s <= 0 || fa <= 0) return;
    const fwd = (K.w - 2 * 24 * u) / 3, fx = K.x + i * (fwd + 24 * u), fy = K.forceY - (1 - clamp(s)) * 100 * u;
    g.save(); g.globalAlpha *= clamp(s * 2) * fa;
    g.fillStyle = P.card; S.rrect(fx, fy, fwd, K.fh, 16 * u); g.fill();
    g.strokeStyle = P.sky; g.lineWidth = 2.5 * u; S.rrect(fx, fy, fwd, K.fh, 16 * u); g.stroke();
    icon(S, ic, fx + 44 * u, fy + 56 * u, 20 * u, sp(t - tm, [60, 15]), { color: P.sky, width: 4 });
    S.text(name, fx + 80 * u, fy + 66 * u, { size: S.pick({ portrait: 28, landscape: 26 }), weight: 700, color: P.ink });
    g.restore();
    const ar = sp(t - (k3.marks.inf + i * 0.12), [90, 16]) * fa;
    arrow(S, fx + fwd / 2, K.forceY + K.fh + 6 * u, K.cx + (i - 1) * 140 * u, K.orgY - 8 * u, ar, { color: P.sky, width: 3, head: 14 });
  });
  if (fa > 0) tag(S, K.x + K.w, K.forceY - 30 * u, 'FORCES EXOGÈNES', { color: P.sky, align: 'right', alpha: range(t, k3.marks.an, k3.marks.an + 0.3) * fa });
  // ── impacts (4) ──
  const IMP = [['Dossier bloqué', 0], ['Délais', 0.25], ['Exclusion', 0.5]];
  const ia = (1 - cmp);
  const ip = sp(t - k4.marks.an + 0.1, [90, 16]) * ia;
  if (ip > 0) {
    arrow(S, K.cx - 40 * u, K.orgY + oh + 6 * u, px + 40 * u, py - K.ph * 1.02, ip, { color: P.amber, width: 5, head: 18, bend: -0.12 });
    IMP.forEach(([name, dt], i) => {
      const s = spring(t - (k4.marks.exp - 0.2 + dt), [260, 15]) * ia * (1 - inc);
      if (s <= 0) return;
      const rowY = (K.orgY + oh + py - K.ph * 1.05) / 2, wds = IMP.map(([n]) => measure(S, n, 24, 700) + 40 * u);
      const tx = K.x + K.w - wds.reduce((a, b) => a + b + 16 * u, 0) + wds.slice(0, i).reduce((a, b) => a + b + 16 * u, 0), ty = rowY;
      g.save(); g.globalAlpha *= clamp(s * 2); g.translate(tx, ty); g.scale(clamp(s, 0, 1.1), clamp(s, 0, 1.1));
      const w = measure(S, name, 24, 700) + 40 * u;
      g.fillStyle = P.bg; S.rrect(0, -22 * u, w, 44 * u, 22 * u); g.fill();
      g.strokeStyle = P.amber; g.lineWidth = 3 * u; S.rrect(0, -22 * u, w, 44 * u, 22 * u); g.stroke();
      S.text(name, 20 * u, 8 * u, { size: 24, weight: 700, color: P.amber });
      g.restore();
    });
  }
  // ── compare (5): the two side by side, gap marked ──
  if (cmp > 0.05) {
    const y = K.cmpY + K.ph * 0.45, cxm = K.x + K.w * 0.5;
    const s = spring(t - k5.marks.vs, [260, 15]) * (1 - sp(t - k6.marks.amel - 0.3, [120, 20]));
    tag(S, K.x, K.cmpY - 40 * u, 'INDIVIDUEL', { color: P.amber, alpha: range(t, k5.marks.ind, k5.marks.ind + 0.3) * cmp });
    tag(S, K.x + K.w, K.cmpY - 40 * u, 'INSTITUTIONNEL', { color: P.sky, align: 'right', alpha: range(t, k5.marks.vs, k5.marks.vs + 0.3) * cmp });
    if (s > 0) { g.save(); g.translate(cxm, y); g.scale(s, s); g.fillStyle = P.amber; circle(g, 0, 0, 40 * u); g.fill(); S.text('≠', 0, 18 * u, { size: 56, weight: 800, color: P.bg, align: 'center' }); g.restore(); }
  }
  // ── step 6: the problem from the start, now answered ──
  const ok = spring(t - k6.marks.init, [260, 15]);
  if (ok > 0) {
    g.save(); g.translate(px + K.ph * 0.39, py - K.ph * 1.1 + 18 * u); g.scale(ok, ok);
    g.fillStyle = P.amber; circle(g, 0, 0, 34 * u); g.fill(); icon(S, 'check', 0, 0, 18 * u, 1, { color: P.bg, width: 5 });
    g.restore();
  }
  g.restore();
}

// ── Z · recap ───────────────────────────────────────────────────────────────
export function chapterZ(t, S) {
  const { g, W, H, u } = S;
  const m = z.marks;
  const out = clamp(sp(t - T.E, [140, 22]));
  if (out >= 1) return;
  g.save(); g.globalAlpha = range(t, T.Z, T.Z + 0.3) * (1 - out); g.translate(0, -out * 200 * u);
  const words = [['Partir des gens', m.a, P.amber], ['suivre les textes', m.b, P.sky], ['changer le cadre', m.c, P.amber]];
  const [hx, hy, hs] = S.pick({ portrait: [84 * u, 330 * u, 70], landscape: [150 * u, 300 * u, 64] });
  words.forEach(([w, tm, col], i) => {
    const s = sp(t - tm + 0.15);
    S.text(w + (i < 2 ? ',' : '.'), hx, hy + i * hs * 1.15 * u + (1 - s) * 30 * u, { size: hs, weight: i === 2 ? 'italic 700' : 600, face: 'display', color: mixColor(P.ink, col, sp(t - tm - 0.2, [170, 26])), alpha: clamp(s * 1.5) });
  });
  const Zn = S.pick({ portrait: { x: 84 * u, w: W - 168 * u, feet: 1480 * u, docY: 760 * u, ph: 300 * u }, landscape: { x: 940 * u, w: 860 * u, feet: 860 * u, docY: 140 * u, ph: 280 * u } });
  const docs = ['EXAMEN', 'ADMISSION', 'ÉVALUATION'];
  const fit = sp(t - m.c, [70, 13]);
  for (let i = 0; i < 3; i++) {
    const x = Zn.x + Zn.w * (0.17 + i * 0.33), s = spring(t - (T.Z + 0.1 + i * 0.1), ORG);
    figure(S, x, Zn.feet, Zn.ph * clamp(s, 0, 1.06), { color: P.amber, t, seed: i });
    const dw = Zn.w * 0.27, dx = x - dw / 2;
    const ds = spring(t - (m.b - 0.1 + i * 0.12), ORG);
    paper(S, dx, Zn.docY - (1 - clamp(ds)) * 80 * u, dw, dw * 0.66, { title: docs[i], titleSize: 22, lines: 2, alpha: clamp(ds * 2), seed: 100 + i, rot: (i - 1) * 0.03 });
    const th = sp(t - (m.b + 0.1 + i * 0.12), [70, 16]);
    arrow(S, x, Zn.feet - Zn.ph * 1.02, x, Zn.docY + dw * 0.66 + 8 * u, th, { color: P.sky, dash: [8, 8], width: 3, head: 12 });
    const fw = Zn.ph * lerp(0.5, 0.8, fit), fh = Zn.ph * lerp(0.74, 1.14, fit);
    cadre(S, x - fw / 2, Zn.feet - fh + 10 * u, fw, fh, { color: mixColor(P.blue, P.amber, fit), alpha: clamp(s * 2), bw: 6 });
    const ok = spring(t - (m.c + 0.5 + i * 0.12), [260, 15]);
    if (ok > 0) { g.save(); g.translate(x + fw / 2, Zn.feet - fh + 10 * u); g.scale(ok, ok); g.fillStyle = P.amber; circle(g, 0, 0, 26 * u); g.fill(); icon(S, 'check', 0, 0, 14 * u, 1, { color: P.bg, width: 5 }); g.restore(); }
  }
  g.restore();
}

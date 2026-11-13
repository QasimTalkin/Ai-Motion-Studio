// A  three testimonies, three voices. Each is a case: the person's words, and the institutional text they hit.
//    1 exam + week planner · 2 admission form + diploma from elsewhere · 3 meeting behind a glass wall
// P  the question: three people in frames too small, under a ceiling of requirements.
import { P, ORG, TYPE, SNAP, HEAVY, sp, spring, clamp, lerp, range, hash, noise, swapAlpha, typed, mixColor,
  measure, fitSize, circle, icon, wrap, paragraph } from './kit.js';
import { L, T } from './timing.js';
import { PAPER, INK, INK2, RULE, paper, field, checkbox, stamp, figure, voiceBars, cadre, tag, arrow, along, wordTimes } from './paper.js';

const { t1, t2, t3, p } = L;
const QUOTES = [
  '« J’ai échoué l’examen… parce que j’étais occupée avec les enfants, à la maison. »',
  '« Je ne peux pas fournir ce document… car je n’ai pas fait mes études ici. »',
  '« J’ai l’impression… de ne pas être compris par mes directeurs. »',
];

export function layA(S) {
  const { W, H, u } = S;
  return S.pick({
    portrait: { lx: 84 * u, ly: 252 * u, qx: 84 * u, qy: 350 * u, qs: 58, qw: W * 0.84,
      zx: 84 * u, zy: 720 * u, zw: W - 168 * u, zh: 760 * u, av: [170 * u, 1540 * u, 230 * u] },
    landscape: { lx: 150 * u, ly: 170 * u, qx: 150 * u, qy: 250 * u, qs: 52, qw: 720 * u,
      zx: 960 * u, zy: 120 * u, zw: 840 * u, zh: 760 * u, av: [250 * u, 850 * u, 210 * u] },
  });
}

// The quote, one word at a time, in time with the voice.
function quote(t, S, A, k, line, alpha) {
  const { u } = S;
  const text = QUOTES[k], times = wordTimes(text, line.start + 0.25, line.end - 0.2);
  const lines = wrap(S, text, A.qs, 'italic 500', 'display', A.qw);
  let wi = 0;
  lines.forEach((ln, li) => {
    let x = A.qx;
    ln.forEach((w) => {
      const tw = times[wi++], s = sp(t - tw + 0.12, [220, 26]);
      const hot = /échoué|enfants|document|ici|compris/.test(w);
      const col = hot ? mixColor(P.ink, P.amber, sp(t - tw - 0.1, [170, 26])) : P.ink;
      S.text(w, x, A.qy + li * A.qs * 1.28 * u - clamp(s) * 4 * u, { size: A.qs, weight: 'italic 500', face: 'display', color: col, alpha: alpha * (0.2 + 0.8 * clamp(s)) });
      x += measure(S, w + ' ', A.qs, 'italic 500', 'display');
    });
  });
}

function label(t, S, A, k, alpha) {
  const { g, u } = S;
  S.text('TÉMOIGNAGE', A.lx, A.ly, { size: 26, weight: 700, face: 'mono', color: P.amber, tracking: 0.12, alpha });
  const x0 = A.lx + measure(S, 'TÉMOIGNAGE', 26, 700, 'mono', 0.12) + 22 * u;
  for (let i = 0; i < 3; i++) {
    const on = i <= k ? 1 : 0;
    g.save(); g.globalAlpha *= alpha;
    g.fillStyle = on ? P.amber : P.slate; S.rrect(x0 + i * 30 * u, A.ly - 20 * u, 22 * u, 22 * u, 5 * u); g.fill();
    g.restore();
  }
}

// ── 1 · the exam and the week ───────────────────────────────────────────────
function case1(t, S, A) {
  const { g, u } = S;
  const s0 = t1.start;
  const pw = A.zw * 0.44, ph = A.zh * 0.66;
  const ex = A.zx + 8 * u, ey = A.zy + 10 * u;
  const pin = spring(t + 0.4, ORG);
  paper(S, ex, ey + (1 - pin) * 120 * u, pw, ph, { rot: -0.05, title: 'EXAMEN FINAL', sub: 'SESSION D’AUTOMNE', lines: 7, lineP: sp(t + 0.2, [40, 14]), alpha: clamp(pin * 2), seed: 3 });
  // grade box
  g.save(); g.translate(ex + pw / 2, ey + ph / 2); g.rotate(-0.05); g.translate(-ex - pw / 2, -ey - ph / 2);
  g.strokeStyle = INK2; g.lineWidth = 2 * u; g.globalAlpha = clamp(pin * 2);
  g.strokeRect(ex + pw - 150 * u, ey + ph - 90 * u, 120 * u, 60 * u);
  S.text('NOTE', ex + pw - 146 * u, ey + ph - 100 * u, { size: 18, weight: 700, face: 'mono', color: INK2 });
  g.restore();
  stamp(S, ex + pw * 0.5, ey + ph * 0.55, 'ÉCHEC', s0 + 0.5, t, { rot: -0.2, size: 56 });

  // the week: evenings fill with the children; study time finds no room
  const gx = A.zx + A.zw * 0.5, gy = A.zy + 20 * u, gw = A.zw * 0.5, gh = A.zh * 0.62;
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'], hours = ['16 h', '17 h', '18 h', '19 h', '20 h', '21 h'];
  const cw = (gw - 70 * u) / 7, rh = (gh - 60 * u) / 6, x0 = gx + 70 * u, y0 = gy + 60 * u;
  const gin = spring(t + 0.5, ORG);
  if (gin > 0) {
    g.save(); g.globalAlpha *= clamp(gin * 2); g.translate((1 - gin) * 60 * u, 0);
    g.fillStyle = P.card; S.rrect(gx, gy, gw, gh, 16 * u); g.fill();
    S.text('SEMAINE', gx + 4 * u, gy - 14 * u, { size: 20, weight: 700, face: 'mono', color: P.dim, tracking: 0.1 });
    days.forEach((d, i) => S.text(d, x0 + (i + 0.5) * cw, gy + 36 * u, { size: 22, weight: 700, color: P.ink, align: 'center' }));
    hours.forEach((h, r) => S.text(h, gx + 12 * u, y0 + (r + 0.6) * rh, { size: 17, weight: 500, face: 'mono', color: P.dim }));
    g.strokeStyle = 'rgba(148,163,184,0.18)'; g.lineWidth = 1.5 * u;
    for (let i = 0; i <= 7; i++) { g.beginPath(); g.moveTo(x0 + i * cw, y0); g.lineTo(x0 + i * cw, y0 + 6 * rh); g.stroke(); }
    for (let r = 0; r <= 6; r++) { g.beginPath(); g.moveTo(x0, y0 + r * rh); g.lineTo(x0 + 7 * cw, y0 + r * rh); g.stroke(); }
    // children's blocks (amber), day by day, on "occupée avec les enfants"
    const kid = [[0, 0, 4], [1, 0, 5], [2, 0, 4], [3, 0, 5], [4, 0, 4], [5, 0, 6], [6, 0, 6]];
    kid.forEach(([d, r0, r1], j) => {
      const s = spring(t - (s0 + 1.35 + j * 0.2), [260, 18]);
      if (s <= 0) return;
      const h = (r1 - r0) * rh * clamp(s, 0, 1.05);
      g.fillStyle = P.amber; S.rrect(x0 + d * cw + 3 * u, y0 + r0 * rh + 3 * u, cw - 6 * u, h - 6 * u, 6 * u); g.fill();
      if (d === 0 && s > 0.6) icon(S, 'people', x0 + d * cw + cw / 2, y0 + r0 * rh + 26 * u, 12 * u, 1, { color: P.bg, width: 3 });
    });
    // the exam: Thursday 18 h, already on the week from the first frame; the evening blocks land on it
    const exd = 3, exr = 2, clash = sp(t - (s0 + 1.95), SNAP), fl = clash > 0 ? 0.5 + 0.5 * Math.sin(t * 14) : 0;
    g.save(); g.translate(x0 + exd * cw + cw / 2, y0 + exr * rh + rh / 2); g.scale(1 + 0.06 * fl * clash, 1 + 0.06 * fl * clash);
    g.fillStyle = mixColor(P.blue, P.amber, 0.25 * clash); S.rrect(-cw / 2 + 3 * u, -rh / 2 + 3 * u, cw - 6 * u, rh - 6 * u, 6 * u); g.fill();
    g.strokeStyle = clash > 0 ? P.ink : 'rgba(255,255,255,0.4)'; g.lineWidth = (2 + 2 * clash) * u; S.rrect(-cw / 2 + 3 * u, -rh / 2 + 3 * u, cw - 6 * u, rh - 6 * u, 6 * u); g.stroke();
    g.restore();
    const lab = 'EXAMEN 18 h', lw2 = measure(S, lab, 18, 800, 'mono') + 18 * u, lx2 = Math.min(x0 + exd * cw + cw / 2 - lw2 / 2, gx + gw - lw2 - 6 * u);
    g.fillStyle = P.blue; S.rrect(lx2, y0 + exr * rh - 34 * u, lw2, 28 * u, 6 * u); g.fill();
    S.text(lab, lx2 + 9 * u, y0 + exr * rh - 14 * u, { size: 18, weight: 800, face: 'mono', color: P.ink });
    // study blocks try to land and bounce off
    [[1, 4, 2.55], [3, 4, 2.9], [5, 2, 3.25], [6, 4, 3.5]].forEach(([d, r, dt], j) => {
      const tt = t - (s0 + dt);
      if (tt <= 0) return;
      const fall = Math.min(1, tt / 0.28), bounce = tt > 0.28 ? (tt - 0.28) : 0;
      const yy = y0 + r * rh - (1 - fall) * 120 * u - bounce * 260 * u + bounce * bounce * 420 * u * 0;
      const a = 1 - range(bounce, 0.05, 0.45);
      if (a <= 0) return;
      g.save(); g.globalAlpha *= a; g.translate(x0 + d * cw + cw / 2, yy + rh / 2); g.rotate(bounce * (j % 2 ? 1.6 : -1.6));
      g.fillStyle = P.blue; S.rrect(-cw / 2 + 4 * u, -rh / 2 + 4 * u, cw - 8 * u, rh - 8 * u, 6 * u); g.fill();
      g.restore();
    });
    // legend
    const ly = gy + gh + 40 * u;
    g.fillStyle = P.amber; S.rrect(gx + 6 * u, ly - 18 * u, 22 * u, 22 * u, 5 * u); g.fill();
    S.text('Enfants', gx + 38 * u, ly, { size: 24, weight: 600, color: P.ink });
    g.fillStyle = P.blue; S.rrect(gx + 170 * u, ly - 18 * u, 22 * u, 22 * u, 5 * u); g.fill();
    S.text('Révision', gx + 202 * u, ly, { size: 24, weight: 600, color: P.ink });
    g.restore();
  }
}

// ── 2 · the form and the diploma from elsewhere ─────────────────────────────
function case2(t, S, A) {
  const { g, u } = S;
  const s0 = t2.start;
  const fw = A.zw * 0.66, fh = A.zh * S.pick({ portrait: 0.76, landscape: 0.86 }), fx = A.zx, fy = A.zy;
  const yy = paper(S, fx, fy, fw, fh, { title: 'DOSSIER D’ADMISSION', sub: 'FORMULAIRE · PIÈCES JUSTIFICATIVES', band: P.blue, seed: 5 });
  const iw = fw - 48 * u, ix0 = fx + 24 * u;
  field(S, ix0, yy + 26 * u, iw, 'NOM', { bars: 2, p: sp(t - s0 + 0.6, SNAP) });
  field(S, ix0, yy + 116 * u, iw, 'PROGRAMME', { bars: 3, p: sp(t - s0 + 0.5, SNAP) });
  field(S, ix0, yy + 206 * u, iw, 'PIÈCE OBLIGATOIRE', { value: 'Relevé de notes officiel', p: sp(t - s0 + 0.4, SNAP) });
  // upload slot
  const sx = ix0, sy = yy + 300 * u, sw = iw, sh = fh - (sy - fy) - 40 * u;
  const hit = s0 + 1.7, bad = sp(t - hit, SNAP);
  g.save();
  g.setLineDash([10 * u, 8 * u]); g.strokeStyle = mixColor('#94A3B8', P.amber, bad); g.lineWidth = (2.5 + 2 * bad) * u;
  S.rrect(sx, sy, sw, sh, 12 * u); g.stroke(); g.setLineDash([]);
  if (bad > 0) { g.fillStyle = `rgba(245,158,11,${0.12 * bad})`; S.rrect(sx, sy, sw, sh, 12 * u); g.fill(); }
  S.text(bad > 0.5 ? '✕  Document non reconnu' : 'Déposer le document ici', sx + sw / 2, sy + sh / 2 + 10 * u,
    { size: 26, weight: 700, color: bad > 0.5 ? '#B45309' : INK2, align: 'center' });
  g.restore();
  // the diploma: arrives, hits the slot, is pushed back
  const dw = A.zw * 0.36, dh = dw * 0.72;
  const tt = t - (s0 + 0.6);
  if (tt > 0) {
    const go = clamp(tt / 1.1), ease = 1 - (1 - go) ** 3, back = sp(t - hit, [200, 12]);
    const startX = A.zx + A.zw - dw * 0.9, startY = A.zy + A.zh * 0.16;
    const tx = sx + sw / 2 - dw / 2, ty = sy + sh / 2 - dh / 2;
    const dx = lerp(startX, tx, ease) + back * 140 * u, dy = lerp(startY, ty, ease) - back * 40 * u;
    const shake = t > hit ? Math.sin((t - hit) * 50) * Math.exp(-(t - hit) * 7) * 0.08 : 0;
    paper(S, dx, dy, dw, dh, { tint: '#FFF6E3', band: P.amber, title: 'DIPLÔME', titleSize: 26, sub: 'ÉTABLISSEMENT ÉTRANGER', rot: 0.08 + shake - back * 0.12, fold: false, lines: 2, seed: 9 });
    g.save(); g.translate(dx + dw / 2, dy + dh / 2); g.rotate(0.08 + shake - back * 0.12); g.translate(-dx - dw / 2, -dy - dh / 2);
    const scx = dx + dw - 56 * u, scy = dy + dh - 50 * u;
    g.fillStyle = P.amber; g.beginPath(); g.moveTo(scx - 14 * u, scy); g.lineTo(scx - 22 * u, scy + 44 * u); g.lineTo(scx - 4 * u, scy + 34 * u); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(scx + 14 * u, scy); g.lineTo(scx + 22 * u, scy + 44 * u); g.lineTo(scx + 4 * u, scy + 34 * u); g.closePath(); g.fill();
    g.fillStyle = '#D97706'; circle(g, scx, scy, 26 * u); g.fill();
    g.strokeStyle = '#FDE68A'; g.lineWidth = 2 * u; circle(g, scx, scy, 18 * u); g.stroke();
    g.restore();
  }
  // "je n'ai pas fait mes études ici": a route from elsewhere to here
  const rt = sp(t - (s0 + 2.3), [60, 15]);
  if (rt > 0) {
    const gxp = A.zx + A.zw - 70 * u, gyp = A.zy + A.zh * 0.66, hx = fx + fw * 0.5, hy = sy + sh * 0.25;
    g.save(); g.globalAlpha *= clamp(rt * 2);
    g.strokeStyle = P.sky; g.lineWidth = 3 * u; circle(g, gxp, gyp, 48 * u); g.stroke();
    g.beginPath(); g.ellipse(gxp, gyp, 20 * u, 48 * u, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(gxp - 48 * u, gyp); g.lineTo(gxp + 48 * u, gyp); g.stroke();
    S.text('AILLEURS', gxp, gyp + 80 * u, { size: 20, weight: 700, face: 'mono', color: P.sky, align: 'center', tracking: 0.1 });
    arrow(S, gxp - 10 * u, gyp - 52 * u, hx + 20 * u, hy, rt, { color: P.sky, dash: [10, 9], width: 3, bend: -0.35, head: 14 });
    const [px, py] = along(gxp - 10 * u, gyp - 52 * u, hx + 20 * u, hy, clamp(rt), -0.35);
    g.fillStyle = P.amber; circle(g, px, py, 9 * u); g.fill();
    const pa = range(t, s0 + 2.9, s0 + 3.2);
    if (pa > 0) tag(S, hx - 30 * u, hy - 40 * u, 'ICI', { color: '#B45309', alpha: pa, fill: '#FFFFFF' });
    g.restore();
  }
}

// ── 3 · the meeting behind glass ────────────────────────────────────────────
function case3(t, S, A) {
  const { g, u } = S;
  const s0 = t3.start;
  const cx = A.zx + A.zw / 2, base = A.zy + A.zh * 0.78;
  // table
  g.fillStyle = P.card; g.beginPath();
  g.moveTo(A.zx + A.zw * 0.48, base - 30 * u); g.lineTo(A.zx + A.zw, base - 30 * u); g.lineTo(A.zx + A.zw, base + 30 * u); g.lineTo(A.zx + A.zw * 0.44, base + 30 * u); g.closePath(); g.fill();
  // managers
  [0, 1, 2].forEach((i) => {
    const mx = A.zx + A.zw * (0.62 + i * 0.15), s = spring(t - (s0 - 0.3 + i * 0.1), ORG);
    figure(S, mx, base - 26 * u, A.zh * 0.42 * clamp(s, 0, 1.1), { color: mixColor(P.blue, '#1D4ED8', i * 0.3), t, seed: i + 3 });
    const q = spring(t - (s0 + 1.9 + i * 0.12), [260, 15]);
    if (q > 0) {
      const by = base - A.zh * 0.42 - 70 * u;
      g.save(); g.translate(mx + 30 * u, by); g.scale(q, q);
      g.fillStyle = P.card2; S.rrect(-30 * u, -30 * u, 60 * u, 52 * u, 16 * u); g.fill();
      g.strokeStyle = P.sky; g.lineWidth = 3 * u; S.rrect(-30 * u, -30 * u, 60 * u, 52 * u, 16 * u); g.stroke();
      S.text('?', 0, 10 * u, { size: 36, weight: 800, color: P.sky, align: 'center' });
      g.restore();
    }
  });
  // the person
  const px = A.zx + A.zw * 0.16;
  figure(S, px, base + 30 * u, A.zh * 0.5, { color: P.amber, t, seed: 1 });
  // glass wall
  const gxw = A.zx + A.zw * 0.42, gy0 = A.zy + A.zh * 0.12, gy1 = base + 40 * u;
  const gs = sp(t - (s0 - 0.2), [90, 18]);
  g.save(); g.globalAlpha *= gs;
  const gg = g.createLinearGradient(gxw - 20 * u, 0, gxw + 20 * u, 0);
  gg.addColorStop(0, 'rgba(147,197,253,0.04)'); gg.addColorStop(0.5, 'rgba(147,197,253,0.18)'); gg.addColorStop(1, 'rgba(147,197,253,0.04)');
  g.fillStyle = gg; g.fillRect(gxw - 20 * u, gy1 - (gy1 - gy0) * gs, 40 * u, (gy1 - gy0) * gs);
  g.strokeStyle = 'rgba(147,197,253,0.5)'; g.lineWidth = 2 * u;
  g.beginPath(); g.moveTo(gxw - 6 * u, gy0 + 40 * u); g.lineTo(gxw + 8 * u, gy0 + 140 * u); g.stroke();
  g.beginPath(); g.moveTo(gxw - 10 * u, gy0 + 180 * u); g.lineTo(gxw + 2 * u, gy0 + 230 * u); g.stroke();
  g.restore();
  // words fly, hit the glass, fall apart
  const WORDS = ['mes horaires', 'ma charge', 'mes besoins', 'mon contexte'];
  WORDS.forEach((w, i) => {
    const tw = s0 + 0.35 + i * 0.5, tt = t - tw;
    if (tt <= 0) return;
    const sx0 = px + 70 * u, sy0 = base - A.zh * 0.42 - i * 26 * u;
    const fly = Math.min(1, tt / 0.45), x = lerp(sx0, gxw - 10 * u, 1 - (1 - fly) ** 2), y = sy0 - Math.sin(fly * Math.PI) * 40 * u;
    if (tt < 0.45) {
      const ww = measure(S, w, 24, 700) + 30 * u;
      g.fillStyle = P.amber; S.rrect(x - ww, y - 22 * u, ww, 40 * u, 20 * u); g.fill();
      S.text(w, x - ww + 15 * u, y + 7 * u, { size: 24, weight: 700, color: P.bg });
    } else {
      const bt = tt - 0.45;
      for (let k = 0; k < 12; k++) {
        const ang = Math.PI * (0.6 + hash(k + i * 13, 5) * 0.8), v = (120 + hash(k, 7 + i) * 220) * u;
        const dx = Math.cos(ang) * v * bt, dy = -Math.sin(ang) * v * bt * 0.4 + 600 * u * bt * bt;
        g.fillStyle = `rgba(245,158,11,${Math.max(0, 1 - bt * 1.6)})`;
        circle(g, gxw - 14 * u + dx, y + dy, (3 + 3 * hash(k, i)) * u); g.fill();
      }
    }
  });
}

export function chapterA(t, S) {
  const { g, W, u } = S;
  const A = layA(S);
  const wh1 = sp(t - T.A2, [150, 22]), wh2 = sp(t - T.A3, [150, 22]);
  const out = clamp(sp(t - (T.P - 0.05), [130, 22]));
  const cases = [[case1, t1, -wh1 * W], [case2, t2, W * (1 - wh1) - wh2 * W], [case3, t3, W * (1 - wh2)]];
  cases.forEach(([fn, line, dx], k) => {
    if (Math.abs(dx) >= W * 0.999) return;
    if (k === 2 && t < T.A3 - 0.1) return;
    if (k === 1 && t < T.A2 - 0.1) return;
    g.save(); g.translate(dx, -out * 220 * u); g.globalAlpha = 1 - out;
    label(t, S, A, k, 1);
    quote(t, S, A, k, line, 1);
    fn(t, S, A);
    // the speaker and the voice
    const [ax, ay, ah] = A.av;
    if (k === 0) { figure(S, ax - 40 * u, ay, ah * 0.5, { color: P.amber, t, seed: 7, alpha: 0.85 }); figure(S, ax + 50 * u, ay, ah * 0.42, { color: P.amber, t, seed: 8, alpha: 0.85 }); }
    if (k < 2) { figure(S, ax, ay, ah, { color: P.amber, t, seed: k }); voiceBars(S, ax + 70 * u, ay - ah * 0.86, t, line); }
    else voiceBars(S, A.zx + A.zw * 0.16 + 60 * u, A.zy + A.zh * 0.78 + 30 * u - A.zh * 0.5 * 0.9, t, line);
    g.restore();
  });
}

// ── P · the question ────────────────────────────────────────────────────────
export function chapterP(t, S) {
  const { g, W, H, u } = S;
  const A = layA(S);
  const m = p.marks;
  const ex = clamp(sp(t - T.S, [140, 22]));
  if (ex >= 1) return;
  g.save(); g.globalAlpha = 1 - ex; g.translate(0, -ex * 180 * u);
  paragraph(S, t, 'Pourquoi je vis ces émotions et n’arrive pas à répondre aux exigences institutionnelles ?', A.qx, A.qy,
    { size: A.qs + 2, weight: 600, face: 'display', maxW: A.qw, rise: (1 - sp(t - T.P - 0.1)) * 40 * u, alpha: range(t, T.P, T.P + 0.3),
      marks: [{ phrase: 'ces émotions', t: m.emo, color: P.amber }, { phrase: 'exigences institutionnelles', t: m.exi, color: P.sky }] });
  // the ceiling of requirements, slammed down a notch on "exigences institutionnelles"
  const Z = S.pick({ portrait: { y0: 760 * u, x0: 84 * u, w: W - 168 * u, feet: 1470 * u, ph: 330 * u }, landscape: { y0: 150 * u, x0: 960 * u, w: 840 * u, feet: 850 * u, ph: 300 * u } });
  const drop = spring(t - m.exi, HEAVY) * 70 * u;
  const docs = ['EXAMEN', 'ADMISSION', 'ÉVALUATION'];
  docs.forEach((d, i) => {
    const s = spring(t - (T.P + 0.15 + i * 0.12), ORG);
    const dw = Z.w / 3 - 20 * u, dx = Z.x0 + i * (dw + 30 * u), dy = Z.y0 - (1 - s) * 300 * u + drop;
    paper(S, dx, dy, dw, dw * 0.72, { title: d, titleSize: 24, lines: 3, alpha: clamp(s * 2), rot: (i - 1) * 0.03, seed: i + 11 });
  });
  const ceil = Z.y0 + (Z.w / 3 - 20 * u) * 0.72 + drop + 18 * u;
  S.text('EXIGENCES', Z.x0 + Z.w / 2, ceil + 38 * u, { size: 22, weight: 700, face: 'mono', color: P.sky, align: 'center', tracking: 0.3, alpha: range(t, T.P + 0.4, T.P + 0.7) });
  // three people, three frames too small
  const labs = ['Examen', 'Diplôme', 'Directeurs'];
  for (let i = 0; i < 3; i++) {
    const x = Z.x0 + Z.w * (0.17 + i * 0.33), s = spring(t - (T.P + 0.25 + i * 0.1), ORG);
    figure(S, x, Z.feet, Z.ph * clamp(s, 0, 1.08), { color: P.amber, t, seed: i });
    const fw = Z.ph * lerp(0.62, 0.5, sp(t - m.exi, [120, 16])), fh = Z.ph * lerp(0.86, 0.74, sp(t - m.exi, [120, 16]));
    cadre(S, x - fw / 2, Z.feet - fh, fw, fh, { alpha: sp(t - (T.P + 0.5 + i * 0.1), [120, 18]), bw: 6 });
    // pulse line above the head: spikes on "émotions"
    const py = Z.feet - Z.ph - 36 * u, amp = 4 + 30 * spring(t - m.emo - i * 0.08, [200, 9]) * (1 - range(t, m.emo + 1.2, m.emo + 2.2));
    g.save(); g.globalAlpha *= clamp(s * 2); g.strokeStyle = P.amber; g.lineWidth = 3 * u; g.beginPath();
    for (let k = 0; k <= 40; k++) {
      const xx = x - 70 * u + k * 3.5 * u, ph = ((k / 40) * 3 + t * 1.8 + i) % 1;
      const v = ph > 0.45 && ph < 0.55 ? Math.sin((ph - 0.45) * Math.PI * 20) * amp : noise(t * 4 + k * 0.3, i) * 2;
      k ? g.lineTo(xx, py - v * u) : g.moveTo(xx, py - v * u);
    }
    g.stroke(); g.restore();
    S.text(labs[i], x, Z.feet + 40 * u, { size: 24, weight: 700, face: 'mono', color: P.dim, align: 'center', tracking: 0.06, alpha: clamp(s) });
  }
  g.restore();
}

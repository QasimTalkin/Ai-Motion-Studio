// Recap: the five steps as one path; the primer's claims come back, their "?" turns into a check.
// Ending: "Pour en savoir plus" + the references.
import { P, ORG, TYPE, SNAP, sp, spring, clamp, lerp, range, swapAlpha, typed, mixColor,
  measure, fitSize, circle, icon, card, wrap } from './kit.js';
import { L, T, DUR } from './timing.js';
import { STEPS } from './solution.js';
import { chipContent, layA } from './amorce.js';

const { r, e } = L;

function layR(S) {
  const { W, u } = S;
  return S.pick({
    portrait: { hx: 84 * u, hy: 300 * u, hs: 84, vertical: true, nx: 140 * u, ny0: 520 * u, gap: 132 * u, nr: 40 * u, ls: 50,
      rowY: 1330 * u, chipW: (W - 168 * u - 48 * u) / 3, chipH: 128 * u, x0: 84 * u, cgap: 24 * u },
    landscape: { hx: 150 * u, hy: 190 * u, hs: 76, vertical: false, ny: 400 * u, nx0: 300 * u, gap: (W - 600 * u) / 4, nr: 40 * u, ls: 34,
      rowY: 690 * u, chipW: 360 * u, chipH: 112 * u, x0: (W - 3 * 360 * u - 48 * u) / 2, cgap: 24 * u },
  });
}
const nodeXY = (Rl, i) => (Rl.vertical ? [Rl.nx, Rl.ny0 + i * Rl.gap] : [Rl.nx0 + i * Rl.gap, Rl.ny]);

export function recap(t, S) {
  const { g, W, H, u } = S;
  const Rl = layR(S);
  const m = r.marks, marks = [m.a, m.b, m.c, m.d, m.e];
  const exit = sp(t - T.TE, [150, 22]);
  g.save(); g.globalAlpha = 1 - range(exit, 0, 0.5); g.translate(0, -exit * 0.3 * H);

  // header
  const head = 'Le chemin de la recherche';
  const hs = fitSize(S, head, 600, 'display', S.pick({ portrait: W * 0.84, landscape: W * 0.6 }), Rl.hs);
  g.save(); g.beginPath(); g.rect(0, Rl.hy - hs * u, W, hs * u * 1.25); g.clip();
  S.text(head, Rl.hx, Rl.hy + (1 - sp(t - T.TR - 0.1)) * hs * u * 1.2, { size: hs, weight: 600, face: 'display', color: P.ink });
  g.restore();

  // path segments draw as each step is named; a light runs along it on "c'est ce chemin"
  for (let i = 0; i < 4; i++) {
    const [x0, y0] = nodeXY(Rl, i), [x1, y1] = nodeXY(Rl, i + 1);
    g.strokeStyle = P.slate; g.lineWidth = 4 * u;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, sp(t - T.TR - 0.2 - i * 0.06, [90, 19])), lerp(y0, y1, sp(t - T.TR - 0.2 - i * 0.06, [90, 19]))); g.stroke();
    const on = sp(t - marks[i + 1], [120, 20]);
    if (on > 0) { g.strokeStyle = P.amber; g.lineWidth = lerp(6, 9, sp(t - m.f, SNAP) * (1 - sp(t - m.f - 0.9, SNAP))) * u; g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, on), lerp(y0, y1, on)); g.stroke(); }
  }
  const run = range(t, m.f, m.f + 0.75);
  if (run > 0 && run < 1) {
    const seg = Math.min(3, Math.floor(run * 4)), f = run * 4 - seg;
    const [x0, y0] = nodeXY(Rl, seg), [x1, y1] = nodeXY(Rl, seg + 1);
    g.fillStyle = P.ink; circle(g, lerp(x0, x1, f), lerp(y0, y1, f), 13 * u); g.fill();
  }
  STEPS.forEach((name, i) => {
    const [x, y] = nodeXY(Rl, i);
    const pop = spring(t - T.TR - 0.15 - i * 0.06, ORG), on = sp(t - marks[i], SNAP);
    if (pop <= 0) return;
    g.fillStyle = mixColor(P.bg, i === 4 ? P.amber : P.blue, on); circle(g, x, y, Rl.nr * pop); g.fill();
    g.strokeStyle = i === 4 ? P.amber : P.blue; g.lineWidth = 4 * u; circle(g, x, y, Rl.nr * pop); g.stroke();
    S.text(String(i + 1), x, y + 15 * u, { size: 42, weight: 800, color: mixColor(P.dim, i === 4 ? P.bg : P.ink, on), align: 'center', alpha: clamp(pop) });
    const col = mixColor(P.dim, P.ink, on);
    if (Rl.vertical) S.text(name, x + Rl.nr + 34 * u, y + Rl.ls * 0.36 * u, { size: Rl.ls, weight: 600, color: col, alpha: clamp(pop) });
    else S.text(name, x, y + Rl.nr + 56 * u, { size: Rl.ls, weight: 600, color: col, align: 'center', alpha: clamp(pop) });
  });

  // the claims from the start come back; "?" flips to a check on "comme celles du début"
  for (let i = 0; i < 3; i++) {
    const s = spring(t - m.g - i * 0.1, ORG);
    if (s <= 0) continue;
    const x = Rl.x0 + i * (Rl.chipW + Rl.cgap), y = Rl.rowY - Rl.chipH / 2 + (1 - s) * 220 * u;
    g.save(); g.globalAlpha *= clamp(s * 2);
    card(S, x, y, Rl.chipW, Rl.chipH, { r: 24, fill: P.card, edge: [P.blue, P.blue, P.amber][i] });
    chipContent(S, i, x, y, Rl.chipW, Rl.chipH, 1, 0);
    const fl = sp(t - m.h - 0.1 - i * 0.15, [170, 22]);
    const sx = Math.abs(Math.cos(fl * Math.PI));
    g.save(); g.translate(x + Rl.chipW - 6 * u, y + 6 * u); g.scale(sx * clamp(s), clamp(s));
    g.fillStyle = fl < 0.5 ? P.amber : P.blue; circle(g, 0, 0, 26 * u); g.fill();
    if (fl < 0.5) S.text('?', 0, 12 * u, { size: 34, weight: 800, color: P.bg, align: 'center' });
    else icon(S, 'check', 0, 0, 15 * u, 1, { color: P.ink, width: 5 });
    g.restore(); g.restore();
  }
  g.restore();
}

const REFS = [
  { authors: 'Fortin, M.-F., & Gagnon, J. (2016).', title: 'Fondements et étapes du processus de recherche : Méthodes quantitatives et qualitatives.', pub: 'Chenelière Éducation.', col: P.blue },
  { authors: 'Gaudet, S., & Robert, D. (2018).', title: 'L’aventure de la recherche qualitative : Du questionnement à la rédaction scientifique.', pub: 'Les Presses de l’Université d’Ottawa.', col: P.amber },
];

export function ending(t, S) {
  const { g, W, u } = S;
  const m = e.marks;
  const E = S.pick({
    portrait: { x: 84 * u, hy: 470 * u, hs: 84, sy: 550 * u, ly: 690 * u, y0: 730 * u, w: W - 168 * u, ts: 38, sigY: S.H * 0.82 },
    landscape: { x: 150 * u, hy: 200 * u, hs: 76, sy: 268 * u, ly: 380 * u, y0: 410 * u, w: W - 300 * u, ts: 36, sigY: S.H * 0.88 },
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
  const sub = typed('SCIENCES HUMAINES ET SOCIALES', t - m.shs, 36);
  if (sub) S.text(sub, E.x + 2 * u, E.sy + 30 * u, { size: 30, weight: 700, face: 'mono', color: P.amber, tracking: 0.1 });
  S.text('RÉFÉRENCES', E.x + 2 * u, E.ly, { size: 26, weight: 700, face: 'mono', color: P.dim, tracking: 0.14, alpha: swapAlpha(t, m.b - 0.1) });

  let y = E.y0;
  REFS.forEach((R, i) => {
    const s = spring(t - m.b - 0.1 - i * 0.35, ORG);
    const tx = E.x + 130 * u, maxW = E.w - 170 * u;
    const lines = wrap(S, R.title, E.ts, 'italic 400', 'display', maxW);
    const h = 40 * u + 44 * u + lines.length * E.ts * u * 1.3 + 44 * u + 20 * u;
    if (s > 0) {
      g.save(); g.globalAlpha = clamp(s * 2); g.translate((1 - s) * 80 * u, 0);
      card(S, E.x, y, E.w, h, { fill: P.card, r: 26 });
      // book spine
      g.fillStyle = R.col; S.rrect(E.x + 34 * u, y + 34 * u, 64 * u, h - 68 * u, 8 * u); g.fill();
      g.fillStyle = 'rgba(15,23,42,0.35)'; g.fillRect(E.x + 46 * u, y + 34 * u, 6 * u, h - 68 * u);
      S.text(R.authors, tx, y + 64 * u, { size: 34, weight: 700, color: P.ink });
      lines.forEach((ln, k) => S.text(ln.join(' '), tx, y + 64 * u + 54 * u + k * E.ts * u * 1.3, { size: E.ts, weight: 'italic 400', face: 'display', color: P.ink }));
      S.text(R.pub, tx, y + 64 * u + 54 * u + lines.length * E.ts * u * 1.3 + 8 * u, { size: 30, weight: 500, color: P.dim });
      g.restore();
    }
    y += h + 30 * u;
  });
  g.restore();
  // signature: the five steps, a light running along them, once the subtitles are gone
  const sa = range(t, e.end + 0.3, e.end + 0.8);
  if (sa > 0) {
    const gap = S.pick({ portrait: 150, landscape: 120 }) * u, x0 = W / 2 - 2 * gap, y = E.sigY;
    const run = ((t - e.end) * 0.6) % 1.4;
    g.save(); g.globalAlpha = sa;
    g.strokeStyle = P.slate; g.lineWidth = 3 * u; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 4 * gap, y); g.stroke();
    for (let i = 0; i < 5; i++) {
      const glow = Math.max(0, 1 - Math.abs(run * 4 - i) * 1.2);
      g.fillStyle = mixColor(P.card, i === 4 ? P.amber : P.blue, 0.35 + 0.65 * glow); circle(g, x0 + i * gap, y, 24 * u); g.fill();
      S.text(String(i + 1), x0 + i * gap, y + 10 * u, { size: 28, weight: 800, color: P.ink, align: 'center' });
    }
    g.restore();
  }
}

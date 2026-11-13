// E  "Pour en savoir plus": the reference, then the EI signature: a frame that opens to fit a person.
import { P, ORG, SNAP, sp, spring, clamp, lerp, range, swapAlpha, typed, mixColor, measure, fitSize, circle, icon, card, wrap } from './kit.js';
import { L, T, DUR } from './timing.js';
import { figure, cadre } from './paper.js';

const { e } = L;
export function ending(t, S) {
  const { g, W, H, u } = S;
  const m = e.marks;
  const E = S.pick({
    portrait: { x: 84 * u, hy: 440 * u, hs: 84, sy: 520 * u, ly: 660 * u, y0: 700 * u, w: W - 168 * u, ts: 40, sigY: H * 0.76 },
    landscape: { x: 150 * u, hy: 200 * u, hs: 76, sy: 268 * u, ly: 380 * u, y0: 410 * u, w: W - 300 * u, ts: 38, sigY: H * 0.84 },
  });
  const push = 1 + 0.03 * range(t, m.b, DUR);
  g.save(); g.translate(W / 2, H / 2); g.scale(push, push); g.translate(-W / 2, -H / 2);
  const head = 'Pour en savoir plus';
  const hs = fitSize(S, head, 600, 'display', W * 0.8, E.hs);
  g.save(); g.beginPath(); g.rect(0, E.hy - hs * u, W, hs * u * 1.25); g.clip();
  S.text(head, E.x, E.hy + (1 - sp(t - T.E - 0.2)) * hs * u * 1.2, { size: hs, weight: 600, face: 'display', color: P.ink });
  g.restore();
  const uw = measure(S, head, hs, 600, 'display') * sp(t - m.a - 0.3, [170, 26]);
  if (uw > 0) { g.fillStyle = P.amber; S.rrect(E.x, E.hy + 24 * u, uw, 9 * u, 4.5 * u); g.fill(); }
  const sub = typed('ETHNOGRAPHIE INSTITUTIONNELLE', t - m.a - 0.4, 36);
  if (sub) S.text(sub, E.x + 2 * u, E.sy + 30 * u, { size: 30, weight: 700, face: 'mono', color: P.amber, tracking: 0.1 });
  S.text('RÉFÉRENCE', E.x + 2 * u, E.ly, { size: 26, weight: 700, face: 'mono', color: P.dim, tracking: 0.14, alpha: swapAlpha(t, m.b - 0.2) });
  const s = spring(t - m.b, ORG);
  if (s > 0) {
    const tx = E.x + 130 * u, maxW = E.w - 170 * u;
    const lines = wrap(S, 'L’ethnographie institutionnelle : Une sociologie pour les gens', E.ts, 'italic 400', 'display', maxW);
    const tr = wrap(S, '(F. Malbois, M. Barthélémy et J. Hedström, trad.). Economica.', 28, 500, 'ui', maxW);
    const h = 64 * u + 54 * u + lines.length * E.ts * u * 1.3 + tr.length * 40 * u + 40 * u;
    g.save(); g.globalAlpha = clamp(s * 2); g.translate((1 - s) * 80 * u, 0);
    card(S, E.x, E.y0, E.w, h, { fill: P.card, r: 26 });
    g.fillStyle = P.amber; S.rrect(E.x + 34 * u, E.y0 + 34 * u, 64 * u, h - 68 * u, 8 * u); g.fill();
    g.fillStyle = 'rgba(15,23,42,0.35)'; g.fillRect(E.x + 46 * u, E.y0 + 34 * u, 6 * u, h - 68 * u);
    S.text('Smith, D. E. (2018).', tx, E.y0 + 64 * u, { size: 34, weight: 700, color: P.ink });
    lines.forEach((ln, k) => S.text(ln.join(' '), tx, E.y0 + 118 * u + k * E.ts * u * 1.3, { size: E.ts, weight: 'italic 400', face: 'display', color: P.ink }));
    tr.forEach((ln, k) => S.text(ln.join(' '), tx, E.y0 + 118 * u + lines.length * E.ts * u * 1.3 + 10 * u + k * 40 * u, { size: 28, weight: 500, color: P.dim }));
    g.restore();
  }
  g.restore();
  // signature: a frame that opens to fit the person inside it, under the EI monogram
  const sa = range(t, e.end + 0.4, e.end + 0.9);
  if (sa > 0) {
    const x = W / 2, y = E.sigY, ph = 150 * u;
    const fit = sp(t - e.end - 1.2, [60, 13]);
    g.save(); g.globalAlpha = sa;
    figure(S, x, y + ph * 0.5, ph, { color: P.amber, t });
    const fw = ph * lerp(0.42, 0.78, fit), fh = ph * lerp(0.72, 1.14, fit);
    cadre(S, x - fw / 2, y + ph * 0.5 - fh + 8 * u, fw, fh, { color: mixColor(P.blue, P.amber, fit), bw: 5 });
    g.fillStyle = P.card2; circle(g, x + 120 * u, y - 10 * u, 44 * u); g.fill();
    g.strokeStyle = P.amber; g.lineWidth = 4 * u; circle(g, x + 120 * u, y - 10 * u, 44 * u); g.stroke();
    S.text('EI', x + 120 * u, y + 4 * u, { size: 36, weight: 800, face: 'display', color: P.ink, align: 'center' });
    g.restore();
  }
}

// Chapter S: "Voici 5 questions…". The "?" that dropped in chapter P rolls 1→5 in the headline and in a
// giant background digit; five "?" nodes pop in, the rail draws, numbers and step names morph in.
import { P, ORG, TYPE, SNAP, HEAVY, sp, spring, lerp, range, track, hash, noise, beatPulse, swapAlpha, typed, mixColor,
  measure, fitSize, circle, odometer, BPM } from './kit.js';
import { L, T } from './timing.js';

export const STEPS = ['Problématique', 'Cadre théorique', 'Méthodologie', 'Résultats', 'Discussion'];
const t0 = T.Q_TO_S + 0.5;
export const ROLL = [t0, t0 + 0.08, t0 + 0.16, t0 + 0.24, L.s.marks.five - 0.06];   // ? → 1 → 2 → 3 → 4 → 5

export function lay3(S) {
  const { W, H, u } = S;
  const A = S.pick({
    portrait: { x: 84 * u, eyeY: 300 * u, headY: 470 * u, headSize: 150, headMax: W * 0.84, subY: 562 * u,
      slotX: 140 * u, slotY0: 790 * u, gap: 150 * u, nodeR: 42 * u, labelSize: 56, fx: W * 0.56, fy: H * 0.46, fs: 1500 },
    landscape: { x: 150 * u, eyeY: 350 * u, headY: 520 * u, headSize: 160, headMax: 800 * u, subY: 615 * u,
      slotX: 1150 * u, slotY0: H / 2 - 2 * 138 * u - 20 * u, gap: 138 * u, nodeR: 38 * u, labelSize: 50, fx: W * 0.29, fy: H * 0.56, fs: 1250 },
  });
  A.headSize = fitSize(S, '5 questions', 800, 'ui', A.headMax, A.headSize);
  return A;
}
export const nodePos = (S, i) => { const A = lay3(S); return [A.slotX, A.slotY0 + i * A.gap]; };

export function chapterS(t, S) {
  const { g, W, u } = S;
  const A = lay3(S);
  const { five, before, each, emp } = L.s.marks;
  const zoomP = sp(t - T.TX, [110, 21]);
  const fadeOut = 1 - range(zoomP, 0.05, 0.55);
  const [n1x, n1y] = nodePos(S, 0);
  const pre = sp(t - (T.TX - 0.9), [60, 16]) * 0.04;

  g.save();
  g.translate(n1x, n1y); g.scale(1 + pre + zoomP * 3.2, 1 + pre + zoomP * 3.2); g.translate(-n1x, -n1y);
  g.globalAlpha = fadeOut;

  const v = ROLL.reduce((a, r) => a + spring(t - r, SNAP), 0);
  // giant background digit: grows in behind the headline, rolls with it, slams on "cinq"
  const grow = sp(t - t0 + 0.15, [90, 19]);
  const slam = spring(t - five, HEAVY);
  const gs = A.fs * (1.18 - 0.18 * slam + 0.03 * spring(t - five - 0.5, [20, 9])) * lerp(0.5, 1, grow);
  const ga = lerp(0.14, 0.055, range(t, five, five + 0.7)) * grow;
  g.save();
  g.translate(A.fx + noise(t * 0.3, 4) * 10 * u, A.fy + noise(t * 0.25, 8) * 10 * u);
  g.rotate(-0.06 + noise(t * 0.2, 2) * 0.01);
  odometer(S, v, -gs * u * 0.29, gs * u * 0.36, gs, { color: `rgba(255,255,255,${ga})`, slot: false });
  g.restore();

  const eye = 'LA RECHERCHE EMPIRIQUE';
  const eyeT = typed(eye, t - emp, 34);
  if (eyeT) {
    const w = S.text(eyeT, A.x + 4 * u, A.eyeY, { size: 34, weight: 700, face: 'mono', color: P.amber, tracking: 0.1 });
    if (eyeT.length < eye.length || Math.floor(t * 4) % 2 === 0) { g.fillStyle = P.amber; g.fillRect(A.x + 4 * u + w + 6 * u, A.eyeY - 28 * u, 18 * u, 34 * u); }
  }

  odometer(S, v, A.x, A.headY, A.headSize, { color: P.amber });
  const dW = measure(S, '5', A.headSize, 800, 'ui', -0.05) + 26 * u;
  g.save();
  g.beginPath(); g.rect(A.x + dW - 10 * u, A.headY - A.headSize * u * 0.85, W, A.headSize * u * 1.1); g.clip();
  let x = A.x + dW;
  for (const [i, ch] of [...'questions'].entries()) {
    const s = sp(t - five + 0.06 - i * 0.025);
    S.text(ch, x, A.headY + (1 - s) * A.headSize * u * 1.12, { size: A.headSize, weight: 800, color: P.ink, tracking: -0.03 });
    x += measure(S, ch, A.headSize, 800, 'ui', -0.03);
  }
  g.restore();
  g.fillStyle = P.blue;
  g.fillRect(A.x, A.headY + 30 * u, (x - A.x) * sp(t - five - 0.2, SNAP), 10 * u);

  g.save();
  g.beginPath(); g.rect(0, A.subY - 60 * u, W, 76 * u); g.clip();
  S.text('avant toute conclusion', A.x + 4 * u, A.subY + (1 - sp(t - before)) * 70 * u, { size: 54, weight: 'italic 400', face: 'display', color: P.dim });
  g.restore();

  const tPop = five + 0.36;
  const rail = sp(t - each, [70, 17]);
  const top = A.slotY0, bot = A.slotY0 + 4 * A.gap;
  g.strokeStyle = P.slate; g.lineWidth = 4 * u;
  g.beginPath(); g.moveTo(A.slotX, top); g.lineTo(A.slotX, lerp(top, bot, sp(t - tPop, [60, 16]))); g.stroke();
  g.strokeStyle = P.blue; g.lineWidth = 6 * u;
  g.beginPath(); g.moveTo(A.slotX, top); g.lineTo(A.slotX, lerp(top, bot, rail)); g.stroke();

  for (let i = 0; i < 5; i++) {
    const [nx, ny] = nodePos(S, i);
    const tIn = tPop + i * 0.15, tOn = each + 0.08 + i * 0.15;
    const pop = spring(t - tIn, ORG);
    const on = sp(t - tOn, SNAP);
    const pulse = 1 + 0.06 * beatPulse(t, BPM, { decay: 7 }) * (1 - on);
    const r = A.nodeR * pop * pulse;
    if (!(i === 0 && t >= T.TX)) {
      g.fillStyle = mixColor(P.bg, P.blue, on); circle(g, nx, ny, r); g.fill();
      g.strokeStyle = mixColor(P.slate, P.blue, on); g.lineWidth = 4 * u; circle(g, nx, ny, r); g.stroke();
      g.save(); circle(g, nx, ny, r); g.clip();
      const roll = on * A.nodeR * 2.2;
      S.text('?', nx, ny + 15 * u - roll, { size: 44, weight: 700, color: P.dim, align: 'center', alpha: pop });
      S.text(String(i + 1), nx, ny + 15 * u + A.nodeR * 2.2 - roll, { size: 44, weight: 800, color: P.ink, align: 'center' });
      g.restore();
    }
    const lx = nx + A.nodeR + 34 * u;
    const lw = measure(S, STEPS[i], A.labelSize, 600);
    const bw = track(t, [[0, 0], [tIn + 0.05, 150 + 40 * hash(i, 3)], [tOn, lw / u + 24]], 170, 24) * u;
    const ba = 1 - range(t, tOn + 0.1, tOn + 0.3);
    g.fillStyle = P.card; g.globalAlpha = fadeOut * ba;
    S.rrect(lx - 12 * u, ny - 18 * u, bw, 36 * u, 18 * u); g.fill();
    g.globalAlpha = fadeOut;
    S.text(STEPS[i], lx, ny + A.labelSize * 0.36 * u + (1 - sp(t - tOn - 0.04)) * 20 * u,
      { size: A.labelSize, weight: 600, color: i === 0 ? P.ink : mixColor(P.ink, P.dim, range(t, T.TX - 0.8, T.TX - 0.4)), alpha: swapAlpha(t, tOn) });
  }
  const ring = sp(t - (T.TX - 0.75), ORG);
  if (ring > 0 && t < T.TX) { g.strokeStyle = P.amber; g.lineWidth = 4 * u; circle(g, n1x, n1y, A.nodeR * (1 + 0.45 * ring)); g.stroke(); }
  g.restore();
}

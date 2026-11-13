// A  primer: three doors (médecine · droit · enseignement), then the wall of regulated professions.
// P  problem: a sociological lens x-rays the locks; iris into one lock; a candidate's key jams.
// S  solution: the "?" on the key rolls to "3 approches"; three lenses pop in.
import { P, ORG, TYPE, SNAP, HEAVY, sp, spring, clamp, lerp, range, track, hash, noise, beatPulse, swapAlpha, typed, mixColor,
  measure, fitSize, circle, icon, odometer, paragraph, BPM } from './kit.js';
import { L, T } from './timing.js';
import { wall, door } from './door.js';
import { lock, slotsOf, BLUE, WRONG, bowAt } from './lock.js';

const { a0, a1, p, s } = L;

// ── lens ring (shared with the solution and the finale) ─────────────────────
export function lensRing(S, x, y, R, { alpha = 1, color = P.blue, width = 6, ticks = true, caret = true } = {}) {
  const { g, u } = S;
  if (R <= 0.5 || alpha <= 0) return;
  g.save(); g.globalAlpha *= clamp(alpha);
  g.strokeStyle = color; g.lineWidth = width * u; circle(g, x, y, R); g.stroke();
  if (ticks) {
    g.lineWidth = 2 * u; g.strokeStyle = mixColor(color, P.bg, 0.35);
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2, r0 = R + 9 * u, r1 = R + (i % 4 ? 15 : 22) * u;
      g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke();
    }
  }
  if (caret) { g.fillStyle = P.amber; g.beginPath(); g.moveTo(x - 10 * u, y - R - 34 * u); g.lineTo(x + 10 * u, y - R - 34 * u); g.lineTo(x, y - R - 20 * u); g.closePath(); g.fill(); }
  g.restore();
}

// ── A · the doors ───────────────────────────────────────────────────────────
const heroIn = [-0.62, a0.marks.dro - 0.25, a0.marks.ens - 0.25];
function camA(t, S, Wl) {
  const [h0, h1] = Wl.heroes;
  const f0 = [h0.x + h0.w / 2, h0.y + h0.h * 0.56], f1 = [h1.x + h1.w / 2, h1.y + h1.h * 0.56], fw = [S.W / 2, S.H / 2];
  const z0 = S.pick({ portrait: 3.5, landscape: 3.3 }), z1 = S.pick({ portrait: 1.78, landscape: 2.2 });
  const keys = [[0, f0], [a0.marks.dro - 0.35, f1], [T.PULL, fw]];
  const fx = track(t, keys.map(([k, v]) => [k, v[0]]), 70, 17), fy = track(t, keys.map(([k, v]) => [k, v[1]]), 70, 17);
  const z = track(t, [[0, z0 * 1.04], [0.0001, z0], [a0.marks.dro - 0.35, z1], [T.PULL, 1]], 60, 16);
  return { z: z * (1 + 0.012 * (1 - range(t, 0, T.PULL))), fx: fx + noise(t * 0.4, 5) * 4 * S.u, fy: fy + noise(t * 0.4, 6) * 4 * S.u };
}

function drawWall(t, S, Wl, { xray = 0, dim = 0 } = {}) {
  const hc = [Wl.heroes[1].x + Wl.heroes[1].w / 2, Wl.heroes[1].y + Wl.heroes[1].h / 2];
  const maxD = Math.hypot(Wl.tw / 2, Wl.th / 2);
  for (const d of Wl.doors) {
    const dist = Math.hypot(d.x + d.w / 2 - hc[0], d.y + d.h / 2 - hc[1]) / maxD;
    const tb = d.hero >= 0 ? heroIn[d.hero] : T.PULL + 0.08 + dist * 0.42 + hash(d.idx, 3) * 0.08;
    const build = spring(t - tb, ORG);
    const iconP = d.hero >= 0 ? sp(t - tb - 0.15, d.hero === 0 ? [40, 12] : [26, 10]) : 0;
    const seal = d.ghost ? 0 : spring(t - (a1.marks.reg + 0.02 + dist * 0.5), [260, 16]);
    const light = d.hero >= 0 ? sp(t - tb - 0.3, [40, 14]) * (1 - 0.6 * range(t, T.PULL, T.PULL + 1)) : 0;
    door(S, d, { build, iconP, seal, light, xray, alpha: 1 - dim, nameSize: 24 });
  }
}

export function chapterA(t, S) {
  const { g, W, H, u } = S;
  const Wl = wall(S);
  const { z, fx, fy } = camA(t, S, Wl);
  // the problem's lens dims the wall around it and x-rays what it covers
  const lensOn = sp(t - T.P_IN, [90, 18]);
  const iris = spring(t - T.P_LOCK, [80, 17]);
  const [lx, ly] = lensXY(t, S, Wl), R0 = lensR0(S, Wl);
  const far = Math.max(Math.hypot(lx, ly), Math.hypot(W - lx, ly), Math.hypot(lx, H - ly), Math.hypot(W - lx, H - ly));
  const R = lerp(R0, far * 1.06, iris) * lensOn;
  if (t >= T.P_LOCK && R >= far) return;

  g.save();
  g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-fx, -fy);
  drawWall(t, S, Wl, { dim: 0.55 * lensOn });
  g.restore();

  // header: typed after the seals land, leaves when the lens comes in
  const hx = S.pick({ portrait: 84 * u, landscape: Wl.x0 }), hy = S.pick({ portrait: 262 * u, landscape: 96 * u });
  const ha = 1 - range(t, T.P_IN - 0.1, T.P_IN + 0.25);
  const h1 = typed('PROFESSIONS RÉGLEMENTÉES', t - a1.marks.reg + 0.05, 40), h2 = typed('AU CANADA', t - a1.marks.ca, 30);
  if (h1 && ha > 0) {
    g.fillStyle = P.amber; g.globalAlpha = ha; circle(g, hx + 12 * u, hy - 10 * u, 12 * u * sp(t - a1.marks.reg, [260, 16])); g.fill(); g.globalAlpha = 1;
    const w1 = S.text(h1, hx + 38 * u, hy, { size: 30, weight: 700, face: 'mono', color: P.ink, tracking: 0.08, alpha: ha });
    if (h2) S.text('· ' + h2, hx + 38 * u + w1 + 14 * u, hy, { size: 30, weight: 700, face: 'mono', color: P.amber, tracking: 0.08, alpha: ha });
  }
  const ey = typed('POINT DE VUE SOCIOLOGIQUE', t - p.marks.a, 34);
  if (ey) S.text(ey, hx, hy, { size: 30, weight: 700, face: 'mono', color: P.sky, tracking: 0.08, alpha: range(t, p.marks.a, p.marks.a + 0.1) * (1 - range(t, T.P_LOCK, T.P_LOCK + 0.2)) });

  if (lensOn <= 0.001) return;
  // inside the lens: the same wall, magnified, in x-ray: every door has a lock behind its handle
  const mag = 1.35, xa = 1 - range(t, T.P_LOCK, T.P_LOCK + 0.3);
  g.save();
  circle(g, lx, ly, R); g.clip();
  g.fillStyle = mixColor(P.deep, P.bg2, iris); g.fillRect(lx - R, ly - R, R * 2, R * 2);
  if (xa > 0) {
    g.save(); g.globalAlpha = xa;
    g.translate(lx, ly); g.scale(mag, mag); g.translate(-lx, -ly);
    g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-fx, -fy);
    drawWall(t, S, Wl, { xray: 1 });
    g.restore();
  }
  g.restore();
  if (t < T.P_LOCK) lensRing(S, lx, ly, R, { alpha: lensOn, width: 6 });
}

const lensR0 = (S, Wl) => Wl.dw * S.pick({ portrait: 1.2, landscape: 1.3 });
export function lensXY(t, S, Wl = wall(S)) {
  const h = Wl.heroes[0], R0 = lensR0(S, Wl);
  const pts = [[T.P_IN - 0.2, [-R0 * 1.4, Wl.y0 + Wl.dh * 0.5]], [T.P_IN, [Wl.x0 + Wl.tw * 0.22, Wl.y0 + Wl.dh * 0.55]],
    [T.P_IN + 0.75, [Wl.x0 + Wl.tw * 0.78, Wl.y0 + Wl.dh * 1.4 + Wl.gy]], [p.marks.b - 0.75, [h.x + h.w / 2, h.y + h.h * 0.5]]];
  return [0, 1].map((j) => track(t, pts.map(([k, v]) => [k, v[j]]), 34, 11));
}

// ── P · the lock and the candidate's key ────────────────────────────────────
export function layP(S) {
  const { W, u } = S;
  return S.pick({
    portrait: { lx: W / 2 + 105 * u, ly: 1080 * u, k: 1.12 * u, qx: 84 * u, qy: 400 * u, qs: 64, qw: W * 0.84 },
    landscape: { lx: W * 0.68, ly: 600 * u, k: 0.92 * u, qx: 150 * u, qy: 330 * u, qs: 62, qw: 640 * u },
  });
}
const keyP = (t) => ({ ins: clamp(spring(t - T.P_KEY, [50, 15])), cuts: WRONG,
  shake: t > T.P_JAM ? 13 * Math.sin((t - T.P_JAM) * 42) * Math.exp(-(t - T.P_JAM) * 6) : 0 });
export function bowPos(t, S) {
  const Lp = layP(S), [bx, by] = bowAt(keyP(t));
  return [Lp.lx + bx * Lp.k, Lp.ly + by * Lp.k];
}

export function chapterP(t, S) {
  const { g, W, H, u } = S;
  const Lp = layP(S);
  const iris = spring(t - T.P_LOCK, [80, 17]);
  if (iris <= 0) return;
  const Wl = wall(S);
  const [lx, ly] = lensXY(t, S, Wl), R0 = lensR0(S, Wl);
  const far = Math.max(Math.hypot(lx, ly), Math.hypot(W - lx, ly), Math.hypot(lx, H - ly), Math.hypot(W - lx, H - ly));
  const R = lerp(R0, far * 1.06, iris);
  const ex = clamp(sp(t - T.Q_TO_S - 0.05, [120, 20]));

  g.save();
  if (R < far) { circle(g, lx, ly, R); g.clip(); }
  const sc = lerp(0.32, 1, iris), ox = lerp(lx, Lp.lx, iris), oy = lerp(ly, Lp.ly, iris);
  g.translate(ox, oy); g.scale(sc, sc); g.translate(-Lp.lx, -Lp.ly);
  g.globalAlpha = range(t, T.P_LOCK, T.P_LOCK + 0.25) * (1 - ex);
  g.translate(0, ex * 0.3 * H);

  // the question, in French, set like a headline
  const q1a = swapAlpha(t, p.marks.b - 0.1, p.marks.c - 0.2), q2a = swapAlpha(t, p.marks.c);
  const q1r = (1 - sp(t - p.marks.b + 0.1)) * 50 * u - sp(t - p.marks.c + 0.2) * 60 * u, q2r = (1 - sp(t - p.marks.c)) * 50 * u;
  if (q1a > 0) paragraph(S, t, 'Comment fonctionnent ces professions ?', Lp.qx, Lp.qy, { size: Lp.qs, weight: 600, face: 'display', maxW: Lp.qw, alpha: q1a, rise: q1r,
    marks: [{ phrase: 'fonctionnent', t: p.marks.b + 0.5, color: P.sky }] });
  if (q2a > 0) paragraph(S, t, 'Pourquoi est-il difficile pour certains d’intégrer une profession prestigieuse ?', Lp.qx, Lp.qy, { size: Lp.qs, weight: 600, face: 'display', maxW: Lp.qw, alpha: q2a, rise: q2r,
    marks: [{ phrase: 'difficile', t: p.marks.c + 0.4, color: P.sky }, { phrase: 'profession prestigieuse', t: p.marks.pres, color: P.amber }] });

  // the lock: four criteria, unknown for now
  const key = keyP(t);
  const flag = sp(t - T.P_JAM, SNAP);
  const slots = slotsOf();
  BLUE.forEach((i, j) => {
    const bp = spring(t - T.P_LOCK - 0.45 - j * 0.09, ORG);
    slots[i].badge = { p: bp, glyph: '?', color: mixColor(P.blue, P.amber, flag), fill: P.card2 };
  });
  const bowPulse = 1 + 0.18 * spring(t - p.marks.pres, [200, 10]) * (1 - range(t, p.marks.pres + 0.5, p.marks.pres + 0.9));
  key.bow = { glyph: '?', color: P.amber, scale: bowPulse, glyphAlpha: t < T.Q_TO_S ? 1 : 0 };
  lock(S, Lp.lx, Lp.ly, Lp.k, { build: spring(t - T.P_LOCK - 0.1, ORG), slots, key, flag });
  g.restore();
  if (R < far) lensRing(S, lx, ly, R, { alpha: 1 - iris, width: lerp(6, 14, iris) });
}

// ── S · "3 approches" ───────────────────────────────────────────────────────
export const APPROACHES = ['Fonctionnaliste', 'Interactionniste', 'Conflictualiste'];
export const AP_ICONS = ['institution', 'bubble', 'padlock'];
const t0 = T.Q_TO_S + 0.5;
export const ROLL = [t0, t0 + 0.12, s.marks.three - 0.06];

export function lay3(S) {
  const { W, H, u } = S;
  const A = S.pick({
    portrait: { x: 84 * u, eyeY: 300 * u, headY: 470 * u, headSize: 150, headMax: W * 0.84, subY: 562 * u,
      slotX: 150 * u, slotY0: 820 * u, gap: 196 * u, nodeR: 62 * u, labelSize: 54, fx: W * 0.56, fy: H * 0.46, fs: 1500 },
    landscape: { x: 150 * u, eyeY: 350 * u, headY: 520 * u, headSize: 150, headMax: 820 * u, subY: 615 * u,
      slotX: 1130 * u, slotY0: H / 2 - 196 * u - 30 * u, gap: 196 * u, nodeR: 58 * u, labelSize: 52, fx: W * 0.3, fy: H * 0.56, fs: 1250 },
  });
  A.headSize = fitSize(S, '3 approches', 800, 'ui', A.headMax, A.headSize);
  return A;
}
export const nodePos = (S, i) => { const A = lay3(S); return [A.slotX, A.slotY0 + i * A.gap]; };

export function chapterS(t, S) {
  const { g, W, u } = S;
  const A = lay3(S);
  const { three, exp, est } = s.marks;
  const zoomP = sp(t - T.TF, [110, 21]);
  const fadeOut = 1 - range(zoomP, 0.05, 0.55);
  const [n1x, n1y] = nodePos(S, 0);
  const pre = sp(t - (T.TF - 0.9), [60, 16]) * 0.04;

  g.save();
  g.translate(n1x, n1y); g.scale(1 + pre + zoomP * 3.2, 1 + pre + zoomP * 3.2); g.translate(-n1x, -n1y);
  g.globalAlpha = fadeOut;

  const v = ROLL.reduce((a, r) => a + spring(t - r, SNAP), 0);
  // giant background digit
  const grow = sp(t - t0 + 0.15, [90, 19]);
  const slam = spring(t - three, HEAVY);
  const gs = A.fs * (1.18 - 0.18 * slam + 0.03 * spring(t - three - 0.5, [20, 9])) * lerp(0.5, 1, grow);
  const ga = lerp(0.14, 0.055, range(t, three, three + 0.7)) * grow;
  g.save();
  g.translate(A.fx + noise(t * 0.3, 4) * 10 * u, A.fy + noise(t * 0.25, 8) * 10 * u);
  g.rotate(-0.06 + noise(t * 0.2, 2) * 0.01);
  odometer(S, v, -gs * u * 0.29, gs * u * 0.36, gs, { color: `rgba(255,255,255,${ga})`, slot: false });
  g.restore();

  const eye = 'SOCIOLOGIE DES PROFESSIONS';
  const eyeT = typed(eye, t - three - 0.55, 34);
  if (eyeT) {
    const w = S.text(eyeT, A.x + 4 * u, A.eyeY, { size: 34, weight: 700, face: 'mono', color: P.amber, tracking: 0.1 });
    if (eyeT.length < eye.length || Math.floor(t * 4) % 2 === 0) { g.fillStyle = P.amber; g.fillRect(A.x + 4 * u + w + 6 * u, A.eyeY - 28 * u, 18 * u, 34 * u); }
  }

  // the "?" from the key flies into the headline, then rolls to 3
  const fl = sp(t - T.Q_TO_S, [120, 20]);
  if (t < t0) {
    const [bx, by] = bowPos(T.Q_TO_S, S), Lp = layP(S);
    const size0 = (78 * Lp.k) / u;
    const x = lerp(bx, A.x + measure(S, '?', A.headSize, 800, 'ui', -0.05) / 2, fl), y = lerp(by + 27 * Lp.k, A.headY, fl) - Math.sin(fl * Math.PI) * 120 * u;
    S.text('?', x, y, { size: lerp(size0, A.headSize, fl), weight: 800, color: P.amber, align: 'center', tracking: -0.05 });
  } else odometer(S, v, A.x, A.headY, A.headSize, { color: P.amber });

  const dW = measure(S, '3', A.headSize, 800, 'ui', -0.05) + 26 * u;
  g.save();
  g.beginPath(); g.rect(A.x + dW - 10 * u, A.headY - A.headSize * u * 0.85, W, A.headSize * u * 1.1); g.clip();
  let x = A.x + dW;
  for (const [i, ch] of [...'approches'].entries()) {
    const sI = sp(t - three + 0.06 - i * 0.025);
    S.text(ch, x, A.headY + (1 - sI) * A.headSize * u * 1.12, { size: A.headSize, weight: 800, color: P.ink, tracking: -0.03 });
    x += measure(S, ch, A.headSize, 800, 'ui', -0.03);
  }
  g.restore();
  g.fillStyle = P.blue;
  g.fillRect(A.x, A.headY + 30 * u, (x - A.x) * sp(t - three - 0.2, SNAP), 10 * u);

  g.save();
  g.beginPath(); g.rect(0, A.subY - 60 * u, W, 76 * u); g.clip();
  S.text('théoriques, pour les professions établies', A.x + 4 * u, A.subY + (1 - sp(t - three - 0.45)) * 70 * u, { size: S.pick({ portrait: 44, landscape: 46 }), weight: 'italic 400', face: 'display', color: P.dim });
  g.restore();

  const tPop = three + 0.36;
  const top = A.slotY0, bot = A.slotY0 + 2 * A.gap;
  g.strokeStyle = P.slate; g.lineWidth = 4 * u;
  g.beginPath(); g.moveTo(A.slotX, top); g.lineTo(A.slotX, lerp(top, bot, sp(t - tPop, [60, 16]))); g.stroke();
  g.strokeStyle = P.blue; g.lineWidth = 6 * u;
  g.beginPath(); g.moveTo(A.slotX, top); g.lineTo(A.slotX, lerp(top, bot, sp(t - est, [70, 17]))); g.stroke();

  for (let i = 0; i < 3; i++) {
    const [nx, ny] = nodePos(S, i);
    const tIn = tPop + i * 0.15, tOn = exp + 0.1 + i * 0.22;
    const pop = spring(t - tIn, ORG), on = sp(t - tOn, SNAP);
    const pulse = 1 + 0.05 * beatPulse(t, BPM, { decay: 7 }) * (1 - on);
    const r = A.nodeR * pop * pulse;
    if (!(i === 0 && t >= T.TF)) {
      g.fillStyle = mixColor(P.bg, P.card2, on); circle(g, nx, ny, r); g.fill();
      lensRing(S, nx, ny, r, { color: mixColor(P.slate, i === 2 ? P.amber : P.blue, on), width: 5, ticks: on > 0.5, caret: false, alpha: clamp(pop) });
      icon(S, AP_ICONS[i], nx, ny, r * 0.5, sp(t - tOn, [60, 15]), { color: i === 2 ? P.amber : P.ink, width: 4.5 });
      S.text('?', nx, ny + 15 * u, { size: 44, weight: 700, color: P.dim, align: 'center', alpha: pop * (1 - on) });
    }
    const lx = nx + A.nodeR + 40 * u;
    const lw = measure(S, APPROACHES[i], A.labelSize, 600);
    const bw = track(t, [[0, 0], [tIn + 0.05, 160 + 40 * hash(i, 3)], [tOn, lw / u + 24]], 170, 24) * u;
    g.fillStyle = P.card; g.globalAlpha = fadeOut * (1 - range(t, tOn + 0.1, tOn + 0.3));
    S.rrect(lx - 12 * u, ny - 18 * u, bw, 36 * u, 18 * u); g.fill();
    g.globalAlpha = fadeOut;
    S.text(APPROACHES[i], lx, ny + A.labelSize * 0.36 * u + (1 - sp(t - tOn - 0.04)) * 20 * u,
      { size: A.labelSize, weight: 600, color: i === 0 ? P.ink : mixColor(P.ink, P.dim, range(t, T.TF - 0.8, T.TF - 0.4)), alpha: swapAlpha(t, tOn) });
  }
  const ring = sp(t - (T.TF - 0.75), ORG);
  if (ring > 0 && t < T.TF) { g.strokeStyle = P.amber; g.lineWidth = 4 * u; circle(g, n1x, n1y, A.nodeR * (1 + 0.45 * ring)); g.stroke(); }
  g.restore();
}

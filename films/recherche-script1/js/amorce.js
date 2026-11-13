// Chapter A (primer): "On a découvert que…" + three findings, each a card whose icon draws itself on
// the spoken words, then collapses into a chip. Chapter P (problem): the chips gather, get a "?",
// fall away; a giant "?" drops in; the question sweeps; the "?" flies into the next chapter's headline.
import { P, ORG, TYPE, SNAP, DROP, sp, spring, clamp, lerp, range, track, mixColor, swapAlpha, noise,
  measure, fitSize, circle, paragraph, icon, card, wrap } from './kit.js';
import { L, T } from './timing.js';

const FINDINGS = [
  { line: L.a1, text: 'L’école ne contribue pas seulement à l’ascension sociale, mais aussi à la discrimination.',
    chip: ['École et', 'discrimination'], chipIcon: 'school',
    marks: [{ phrase: 'l’ascension sociale,', t: L.a1.marks.asc, color: P.blue }, { phrase: 'la discrimination.', t: L.a1.marks.disc, color: P.amber }] },
  { line: L.a2, text: 'Les enfants réussissent mieux à l’école quand les parents sont très scolarisés et participent aux apprentissages.',
    chip: ['Parents', 'scolarisés'], chipIcon: 'parentChild',
    marks: [{ phrase: 'très scolarisés', t: L.a2.marks.scol, color: P.blue }, { phrase: 'participent aux apprentissages.', t: L.a2.marks.part, color: P.amber }] },
  { line: L.a3, text: 'Les institutions ont tendance à négliger les expériences des groupes minoritaires au profit des groupes majoritaires.',
    chip: ['Minorités', 'négligées'], chipIcon: 'institution',
    marks: [{ phrase: 'négliger', t: L.a3.marks.neg, color: P.amber }, { phrase: 'groupes minoritaires', t: L.a3.marks.min, color: P.amber }, { phrase: 'groupes majoritaires.', t: L.a3.marks.maj, color: P.blue }] },
];
// card i lands at its line, collapses into chip i just before the next line
const tIn = (i) => FINDINGS[i].line.start - 0.15;
const tOut = (i) => (i < 2 ? FINDINGS[i + 1].line.start - 0.55 : T.A_END - 0.5);

export function layA(S) {
  const { W, H, u } = S;
  return S.pick({
    portrait: { hx: 84 * u, hy: 300 * u, hs: 84, rowY: 440 * u, chipW: (W - 168 * u - 48 * u) / 3, chipH: 128 * u, x0: 84 * u, gap: 24 * u,
      cx: 84 * u, cy: 560 * u, cw: W - 168 * u, ch: 780 * u, ix: W / 2 + 20 * u, iy: 560 * u + 270 * u, is: 205 * u,
      px: 84 * u + 52 * u, py: 560 * u + 560 * u, pw: W - 168 * u - 104 * u, ps: 50, gx: W / 2, gy: H * 0.42 },
    landscape: { hx: 150 * u, hy: 190 * u, hs: 76, rowY: 300 * u, chipW: 360 * u, chipH: 112 * u, x0: 150 * u, gap: 24 * u,
      cx: 150 * u, cy: 390 * u, cw: W - 300 * u, ch: 480 * u, ix: 470 * u, iy: 390 * u + 250 * u, is: 190 * u,
      px: 760 * u, py: 390 * u + 150 * u, pw: W - 150 * u - 760 * u - 60 * u, ps: 50, gx: W / 2, gy: H * 0.42 },
  });
}
const chipRect = (A, i) => [A.x0 + i * (A.chipW + A.gap), A.rowY - A.chipH / 2, A.chipW, A.chipH];

// Big illustrations, one per finding, keyed to the spoken words.
function illustration(i, t, S, A, alpha) {
  const { g, u } = S;
  const s = A.is, x = A.ix, y = A.iy;
  g.save(); g.globalAlpha *= alpha;
  if (i === 0) {
    const { a, asc, disc } = FINDINGS[0].line.marks;
    icon(S, 'school', x - 0.82 * s, y + 0.18 * s, 0.6 * s, sp(t - a, [60, 16]), { color: P.ink, width: 5 });
    // the ladder of social mobility rises out of the school
    const lad = sp(t - asc + 0.15, [70, 16]);
    g.save(); g.beginPath(); g.rect(x - 0.4 * s, y + 0.75 * s - 1.7 * s * lad, 0.8 * s, 1.7 * s * lad + 2); g.clip();
    icon(S, 'ladder', x + 0.02 * s, y - 0.1 * s, 0.85 * s, 1, { color: P.blue, width: 6 });
    g.restore();
    const climb = track(t, [[0, 0], [asc + 0.2, 1]], 60, 15);
    icon(S, 'person', x + 0.02 * s, y + 0.5 * s - climb * 1.05 * s, 0.24 * s, sp(t - asc, [90, 18]), { color: P.blue, width: 5 });
    icon(S, 'arrowUp', x + 0.42 * s, y - 0.5 * s, 0.34 * s, sp(t - asc - 0.35, [90, 18]), { color: P.blue, width: 6 });
    // a second pupil, stopped by a barrier: discrimination
    const st = sp(t - disc + 0.1, [90, 18]);
    icon(S, 'person', x + 1.08 * s, y + 0.5 * s, 0.24 * s, st, { color: P.amber, width: 5 });
    const bar = spring(t - disc - 0.12, ORG);
    if (bar > 0) {
      g.save(); g.translate(x + 0.72 * s, y + 0.42 * s); g.scale(bar, bar);
      icon(S, 'barrier', 0, 0, 0.3 * s, 1, { color: P.amber, width: 5 }); g.restore();
    }
  } else if (i === 1) {
    const { a, scol, part } = FINDINGS[1].line.marks;
    const px = x - 0.45 * s, py = y + 0.2 * s, ps = 0.7 * s;
    icon(S, 'parentChild', px, py, ps, sp(t - a, [60, 16]), { color: P.ink, width: 5 });
    // diploma cap lands on the parent: "très scolarisés"
    const drop = spring(t - scol + 0.05, ORG);
    if (drop > 0) icon(S, 'cap', px - 0.42 * ps, py - 0.98 * ps - (1 - drop) * 0.8 * s, 0.24 * s, 1, { color: P.blue, width: 5, alpha: clamp(drop * 2) });
    // book between them, a dotted link: "participent aux apprentissages"
    icon(S, 'book', px + 0.05 * ps, py + 0.62 * ps, 0.2 * s, sp(t - part, [90, 18]), { color: P.amber, width: 5 });
    const link = sp(t - part - 0.15, [90, 18]);
    if (link > 0) {
      g.save(); g.setLineDash([6 * u, 9 * u]); g.strokeStyle = P.amber; g.lineWidth = 3.5 * u; g.lineCap = 'round';
      g.beginPath(); g.arc(px + 0.05 * ps, py - 0.1 * ps, 0.5 * ps, Math.PI * 1.05, Math.PI * (1.05 + 0.9 * link)); g.stroke(); g.restore();
    }
    // success curve rises on the right
    const cx0 = x + 0.45 * s, cy0 = y + 0.55 * s, cw = 0.95 * s, ch = 0.95 * s;
    const ax = sp(t - a - 0.5, [70, 16]);
    g.strokeStyle = P.slate; g.lineWidth = 4 * u; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx0, cy0 - ch * ax); g.lineTo(cx0, cy0); g.lineTo(cx0 + cw * ax, cy0); g.stroke();
    const cv = sp(t - scol - 0.2, [50, 14]);
    if (cv > 0) {
      g.strokeStyle = P.blue; g.lineWidth = 7 * u; g.beginPath();
      for (let k = 0; k <= 30 * cv; k++) { const f = k / 30; const xx = cx0 + 0.08 * cw + f * 0.85 * cw, yy = cy0 - 0.12 * ch - Math.pow(f, 1.6) * 0.75 * ch; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
      g.stroke();
      if (cv > 0.95) { g.fillStyle = P.blue; circle(g, cx0 + 0.93 * cw, cy0 - 0.87 * ch, 11 * u); g.fill(); }
    }
  } else {
    const { a, neg, min, maj } = FINDINGS[2].line.marks;
    const bx = x, by = y - 0.42 * s;
    icon(S, 'institution', bx, by, 0.5 * s, sp(t - a, [60, 16]), { color: P.ink, width: 5 });
    // spotlight from the institution falls on the majority only
    const light = sp(t - neg, [90, 19]);
    const crowdY = y + 0.62 * s, xs = [-1.05, -0.7, -0.35, 0, 0.35, 0.82, 1.17].map((k) => x + k * s * 0.9);
    if (light > 0) {
      g.fillStyle = `rgba(248,250,252,${0.09 * light})`;
      g.beginPath(); g.moveTo(bx - 0.25 * s, by + 0.45 * s); g.lineTo(bx + 0.25 * s, by + 0.45 * s);
      g.lineTo(lerp(bx, xs[4] + 0.25 * s, light), crowdY + 0.4 * s); g.lineTo(lerp(bx, xs[0] - 0.25 * s, light), crowdY + 0.4 * s); g.fill();
    }
    xs.forEach((cx, k) => {
      const minority = k >= 5;
      const pop = spring(t - a - 0.45 - k * 0.07, ORG);
      if (pop <= 0) return;
      const col = minority ? P.amber : P.ink;
      const dimmed = minority ? lerp(1, 0.45, light) : 1;
      g.save(); g.translate(cx, crowdY); g.scale(pop, pop);
      icon(S, 'person', 0, 0, 0.21 * s, 1, { color: col, width: 5, alpha: dimmed });
      g.restore();
    });
    // minority groups: a dashed ring; majority groups: a blue bracket
    const ring = sp(t - min, [120, 20]);
    if (ring > 0) {
      g.save(); g.setLineDash([9 * u, 8 * u]); g.lineDashOffset = -t * 30 * u; g.strokeStyle = P.amber; g.lineWidth = 3.5 * u;
      g.beginPath(); g.ellipse((xs[5] + xs[6]) / 2, crowdY + 0.05 * s, 0.42 * s * ring, 0.38 * s * ring, 0, 0, Math.PI * 2); g.stroke(); g.restore();
    }
    const br = sp(t - maj, [120, 22]);
    if (br > 0) {
      g.strokeStyle = P.blue; g.lineWidth = 5 * u; g.lineCap = 'round';
      const y0 = crowdY + 0.36 * s, xl = xs[0] - 0.12 * s, xr = lerp(xl, xs[4] + 0.12 * s, br);
      g.beginPath(); g.moveTo(xl, y0 - 12 * u); g.lineTo(xl, y0); g.lineTo(xr, y0); g.lineTo(xr, y0 - 12 * u); g.stroke();
    }
  }
  g.restore();
}

// Chip content: small icon + two-line label.
export function chipContent(S, i, x, y, w, h, alpha, badge = 0) {
  const { g, u } = S;
  if (alpha <= 0) return;
  const F = FINDINGS[i];
  const is = h * 0.3;
  icon(S, F.chipIcon, x + h * 0.48, y + h / 2, is, 1, { color: i === 1 ? P.blue : i === 2 ? P.amber : P.ink, width: 3.5, alpha });
  const size = S.pick({ portrait: 28, landscape: 30 });
  F.chip.forEach((ln, k) => S.text(ln, x + h * 0.9, y + h / 2 - 4 * u + (k - 0.35) * size * u * 1.15, { size, weight: 600, color: P.ink, alpha }));
  if (badge > 0) {                                        // "?" badge: is this true? how do they know?
    g.save(); g.translate(x + w - 6 * u, y + 6 * u); g.scale(badge, badge);
    g.fillStyle = P.amber; circle(g, 0, 0, 26 * u); g.fill();
    S.text('?', 0, 12 * u, { size: 34, weight: 800, color: P.bg, align: 'center' });
    g.restore();
  }
}

export function chapterA(t, S) {
  const { g, W, H, u } = S;
  const A = layA(S);

  // a giant faint "?" behind everything from frame 0: the question this film answers
  const ghost = sp(t, [40, 12]), gq = S.pick({ portrait: 1500, landscape: 1250 });
  const gout = 1 - range(t, T.A_END, T.A_END + 0.8);
  if (gout > 0) {
    g.save(); g.translate(S.pick({ portrait: W * 0.72, landscape: W * 0.8 }) + noise(t * 0.2, 3) * 12 * u, S.pick({ portrait: H * 0.62, landscape: H * 0.66 }));
    g.rotate(0.12 - 0.05 * ghost + noise(t * 0.15, 5) * 0.02); g.scale(lerp(1.35, 1, ghost), lerp(1.35, 1, ghost));
    S.text('?', 0, gq * u * 0.36, { size: gq, weight: 800, color: '#FFFFFF', align: 'center', alpha: 0.05 * gout * Math.min(1, ghost * 1.5) });
    g.restore();
  }

  // header: words rise out of a slot, leaves when the chips gather
  const head = 'On a découvert que…';
  const hs = fitSize(S, head, 600, 'display', S.pick({ portrait: W * 0.84, landscape: W * 0.6 }), A.hs);
  const hOut = sp(t - T.A_END, [170, 26]);
  if (hOut < 0.999) {
    g.save(); g.beginPath(); g.rect(0, A.hy - hs * u * 0.95, W, hs * u * 1.2); g.clip();
    let x = A.hx;
    head.split(' ').forEach((w, k) => {
      const r = sp(t - 0.15 - k * 0.1);
      S.text(w, x, A.hy + (1 - r) * hs * u * 1.15 - hOut * hs * u * 1.2, { size: hs, weight: 600, face: 'display', color: P.ink });
      x += measure(S, w + ' ', hs, 600, 'display');
    });
    g.restore();
  }

  // empty slots draw in from frame 0: three findings are coming
  const gather = sp(t - T.A_END, [150, 22]);
  const fall = (k) => { const tau = t - T.Q_DROP - 0.05 - k * 0.07; return tau > 0 ? 0.5 * 9000 * u * tau * tau : 0; };
  for (let i = 0; i < 3; i++) {
    const [x, y, w, h] = chipRect(A, i);
    const draw = sp(t - 0.08 - i * 0.14, [90, 18]);
    const filled = t >= tOut(i) + 0.05;
    if (!filled && t < tIn(i) + 0.3) {
      g.save(); g.setLineDash([10 * u, 8 * u]); g.strokeStyle = P.dim; g.lineWidth = 3 * u; g.globalAlpha = draw * 0.7;
      S.rrect(x, y, w, h, 24 * u); g.stroke(); g.restore();
      const q = spring(t - 0.3 - i * 0.14, ORG);
      if (q > 0) { g.save(); g.translate(x + w / 2, y + h / 2); g.scale(q, q); S.text('?', 0, 16 * u, { size: 48, weight: 800, color: P.dim, align: 'center' }); g.restore(); }
    }
  }

  // focus cards: scale 0.8 → 1 in, then morph into their chip
  for (let i = 0; i < 3; i++) {
    if (t < tIn(i)) continue;
    const enter = spring(t - tIn(i), ORG), fade = range(t, tIn(i), tIn(i) + 0.15);
    const [cx2, cy2, cw2, ch2] = chipRect(A, i);
    const k = [170, 26];
    let x = track(t, [[0, A.cx], [tOut(i), cx2]], ...k), y = track(t, [[0, A.cy], [tOut(i), cy2]], ...k);
    let w = track(t, [[0, A.cw], [tOut(i), cw2]], ...k), h = track(t, [[0, A.ch], [tOut(i), ch2]], ...k);
    // chapter P: chips gather in the middle, then fall off-screen
    const gs = S.pick({ portrait: 1.55, landscape: 1.3 });
    const gcx = S.pick({ portrait: A.gx, landscape: A.gx + (i - 1) * (A.chipW * gs + 40 * u) });
    const gcy = S.pick({ portrait: A.gy + (i - 1) * (A.chipH * gs + 44 * u), landscape: A.gy });
    x = lerp(x, gcx - A.chipW / 2, gather); y = lerp(y, gcy - A.chipH / 2, gather);
    const gsc = lerp(1, gs, gather);
    y += fall(i);
    if (y > H + 50 * u) continue;
    const sc = lerp(0.8, 1, enter) * gsc * (1 - 0.3 * sp(t - T.Q_DROP - i * 0.07, [120, 20]));
    g.save(); g.globalAlpha = fade;
    g.translate(x + w / 2, y + h / 2); g.scale(sc, sc); g.translate(-(x + w / 2), -(y + h / 2));
    card(S, x, y, w, h, { r: lerp(36, 24, range(t, tOut(i), tOut(i) + 0.4)), fill: P.card, edge: [P.blue, P.blue, P.amber][i] });
    // focus content leaves before the morph; chip content enters after it starts
    const fa = swapAlpha(t, tIn(i) + 0.05, tOut(i));
    if (fa > 0) {
      S.text(`0${i + 1}`, A.px, A.py - S.pick({ portrait: 84, landscape: 74 }) * u, { size: 30, weight: 700, face: 'mono', color: P.amber, alpha: fa });
      paragraph(S, t, FINDINGS[i].text, A.px, A.py, { size: A.ps, weight: 600, maxW: A.pw, alpha: fa, marks: FINDINGS[i].marks,
        rise: (1 - sp(t - tIn(i) - 0.1)) * 30 * u });
      illustration(i, t, S, A, fa);
    }
    const ca = swapAlpha(t, tOut(i));
    chipContent(S, i, x, y, w, h, ca, spring(t - L.p.marks.a - 0.05 - i * 0.12, ORG));
    g.restore();
  }
}

// Chapter P: the giant "?" and the question.
export function chapterP(t, S) {
  const { g, W, H, u } = S;
  if (t < T.Q_DROP) return;
  const { c, d } = L.p.marks;
  const hs = S.pick({ portrait: 640, landscape: 560 });
  // drop with a bouncy spring (damping 8), then fly into the next headline as its first digit
  const drop = spring(t - T.Q_DROP - 0.08, DROP);
  const restY = S.pick({ portrait: H * 0.5, landscape: H * 0.6 });
  let x = W / 2 - measure(S, '?', hs, 800, 'ui', -0.05) / 2, y = lerp(-0.1 * H, restY, drop), size = hs;
  const fly = sp(t - T.Q_TO_S, [170, 26]);
  const A3 = solutionHeadline(S);
  x = lerp(x, A3.x, fly); y = lerp(y, A3.y, fly); size = lerp(size, A3.size, fly);
  const sway = (1 - fly) * noise(t * 0.6, 7) * 0.03;
  if (t < T.Q_TO_S + 0.55) {
    g.save(); g.translate(x + measure(S, '?', size, 800, 'ui', -0.05) / 2, y); g.rotate(sway); g.translate(-(x + measure(S, '?', size, 800, 'ui', -0.05) / 2), -y);
    S.text('?', x, y, { size, weight: 800, color: mixColor(P.ink, P.amber, fly), tracking: -0.05 });
    g.restore();
  }

  // the question, with a highlight sweeping across it
  const qa = swapAlpha(t, c - 0.05, T.Q_TO_S);
  if (qa > 0) {
    const text = 'Comment arrive-t-on à ces affirmations ?';
    const size = S.pick({ portrait: 66, landscape: 64 });
    const lines = wrap(S, text, size, 600, 'display', S.pick({ portrait: W * 0.84, landscape: W * 0.7 }));
    const y0 = S.pick({ portrait: H * 0.62, landscape: H * 0.76 });
    const sweep = range(t, d, d + 1.0);
    lines.forEach((ln, k) => {
      const str = ln.join(' ');
      const w = measure(S, str, size, 600, 'display');
      const yy = y0 + k * size * u * 1.25 + (1 - sp(t - c - k * 0.08)) * 40 * u;
      let col = P.ink;
      if (sweep > 0 && sweep < 1) {
        const sx = lerp(W / 2 - w / 2 - 300 * u, W / 2 + w / 2 + 300 * u, sweep);
        const gr = g.createLinearGradient(sx - 260 * u, 0, sx + 260 * u, 0);
        gr.addColorStop(0, P.ink); gr.addColorStop(0.5, P.amber); gr.addColorStop(1, P.ink);
        col = gr;
      }
      S.text(str, W / 2, yy, { size, weight: 600, face: 'display', color: col, align: 'center', alpha: qa });
    });
  }
}

// Where the "?" lands: the digit slot of the "5 questions" headline (chapter S).
export function solutionHeadline(S) {
  const { W, u } = S;
  const A = S.pick({
    portrait: { x: 84 * u, y: 470 * u, size: 150, max: W * 0.84 },
    landscape: { x: 150 * u, y: 520 * u, size: 160, max: 800 * u },
  });
  return { x: A.x, y: A.y, size: fitSize(S, '5 questions', 800, 'ui', A.max, A.size) };
}

// The three approaches. Each reads the same lock (the criteria for getting into a profession) differently.
// 1 Fonctionnaliste: pins fixed in advance, stamped by the professional group and the State; Parsons' pillars;
//   the attributes; the key that fits; provinces and territories regulate.
// 2 Interactionniste: pins negotiated with the client; Hughes and the Chicago School; the network of
//   interactions; "good work" negotiated day to day; the title earned by convincing others.
// 3 Conflictualiste: closure pins, prestige, market control; Larson's professional project; three gates;
//   social closure (Weber); fewer practitioners, more prestige, a monopoly.
import { P, ORG, TYPE, SNAP, sp, spring, clamp, lerp, range, track, hash, noise, swapAlpha, typed, mixColor,
  measure, fitSize, circle, icon, card, chip, numeral, lay } from './kit.js';
import { L, T } from './timing.js';
import { lock, slotsOf, BLUE, AMBER, CUTS, LK, LOCKBOX, xs, at } from './lock.js';
import { lensRing } from './primer.js';

const { f, fx, i: li, ix, c: lc, cx } = L;

// ── shared pieces ───────────────────────────────────────────────────────────
export function head(t, S, n, title, tIn, tName) {
  const { g, W, u } = S;
  const Ly = lay(S);
  numeral(S, n, Ly.nx, Ly.ny, { rise: (1 - sp(t - tIn - 0.05)) * 300 * u, clip: true });
  const ts = fitSize(S, title, 600, 'display', Ly.tMax, Ly.ts);
  g.save(); g.beginPath(); g.rect(0, Ly.ty - ts * u, W, ts * u * 1.3); g.clip();
  S.text(title, Ly.tx, Ly.ty + (1 - sp(t - tName + 0.1)) * ts * u * 1.2, { size: ts, weight: 600, face: 'display', color: P.ink });
  g.restore();
  const uw = measure(S, title, ts, 600, 'display') * sp(t - tName - 0.2, [170, 26]);
  if (uw > 0) { g.fillStyle = P.amber; S.rrect(Ly.tx, Ly.ty + 20 * u, uw, 8 * u, 4 * u); g.fill(); }
}

// Citation chip: author in bold, work and year in mono. Slides in from the left.
function cite(t, S, tIn, tOut, author, work, { x, y, lit = Infinity } = {}) {
  const { g, u } = S;
  const s = spring(t - tIn, ORG), out = clamp(sp(t - tOut, [150, 22]));
  if (s <= 0 || out >= 1) return;
  const w = Math.max(measure(S, author, 40, 700), measure(S, work, 25, 500, 'mono')) + 110 * u, h = 112 * u;
  g.save(); g.globalAlpha *= clamp(s * 2) * (1 - out); g.translate((1 - s) * -90 * u - out * 60 * u, 0);
  card(S, x, y, w, h, { fill: P.card, r: 22, edge: P.amber });
  icon(S, 'book', x + 52 * u, y + h / 2, 22 * u, sp(t - tIn - 0.1, [60, 15]), { color: P.amber, width: 4 });
  S.text(author, x + 90 * u, y + 50 * u, { size: 40, weight: 700, color: P.ink });
  S.text(work, x + 90 * u, y + 88 * u, { size: 25, weight: 500, face: 'mono', color: mixColor(P.dim, P.amber, sp(t - lit, [170, 26])) });
  g.restore();
}

// Legend row: icon in a ring + label. p = appearance.
function legend(t, S, x, y, ic, label, tIn, { color = P.blue, size = 40, lit = Infinity } = {}) {
  const { g, u } = S;
  const s = spring(t - tIn, ORG);
  if (s <= 0) return;
  g.save(); g.globalAlpha *= clamp(s * 2); g.translate((1 - s) * 40 * u, 0);
  g.fillStyle = P.card2; circle(g, x + 30 * u, y, 30 * u); g.fill();
  g.strokeStyle = color; g.lineWidth = 3.5 * u; circle(g, x + 30 * u, y, 30 * u); g.stroke();
  icon(S, ic, x + 30 * u, y, 15 * u, sp(t - tIn, [60, 15]), { color, width: 3.5 });
  S.text(label, x + 80 * u, y + size * 0.36 * u, { size, weight: 600, color: mixColor(P.ink, P.amber, sp(t - lit, [170, 26]) * (1 - sp(t - lit - 0.9, [60, 16]))) });
  g.restore();
}

// Seal stamp: a disc with an icon, overshoots onto the page with a shock ring.
function stamp(t, S, x, y, r, ic, label, tIn, color = P.amber) {
  const { g, u } = S;
  const s = spring(t - tIn, [260, 16]);
  if (s <= 0) return;
  const sc = lerp(1.9, 1, clamp(s, 0, 1.2));
  const ring = range(t, tIn + 0.05, tIn + 0.5);
  if (ring > 0 && ring < 1) { g.strokeStyle = color; g.globalAlpha = (1 - ring) * 0.6; g.lineWidth = 3 * u; circle(g, x, y, r * (1 + ring * 0.9)); g.stroke(); g.globalAlpha = 1; }
  g.save(); g.globalAlpha *= clamp(s * 2.5); g.translate(x, y); g.scale(sc, sc); g.rotate(-0.12 * (1 - clamp(s)));
  g.fillStyle = color; circle(g, 0, 0, r); g.fill();
  g.strokeStyle = P.bg; g.lineWidth = 3 * u; g.setLineDash([5 * u, 5 * u]); circle(g, 0, 0, r * 0.82); g.stroke(); g.setLineDash([]);
  icon(S, ic, 0, -r * 0.05, r * 0.42, 1, { color: P.bg, width: 5 });
  g.restore();
  if (label) S.text(label, x, y + r + 40 * u, { size: 26, weight: 700, color: P.ink, align: 'center', alpha: clamp(s * 2) });
}

const person = (S, x, y, r, color, p = 1) => icon(S, 'person', x, y, r, p, { color, width: 5 });

// ════════════════════════════════════════════════════════════════════════════
// 1 · FONCTIONNALISTE
// ════════════════════════════════════════════════════════════════════════════
function layF(S) {
  const { W, u } = S;
  const Ly = lay(S);
  return S.pick({
    portrait: { lx: W / 2, ly: 930 * u, k: 0.95 * u, cardX: 84 * u, cardY: 1130 * u, cardW: W - 168 * u, cardH: 300 * u, sealR: 72 * u,
      citeX: 84 * u, citeY: 618 * u, tx: W / 2, tW: 780 * u, tApex: 790 * u, tRoof: 905 * u, tCol: 1300 * u, lab: 1415 * u,
      l3x: W / 2 + 90 * u, l3y: 965 * u, k3: 1.0 * u, legX: 110 * u, legY: 1200 * u, legDY: 94 * u, legCols: 1,
      gx: W / 2, gy: 790 * u, chipW: 160 * u, chipH: 88 * u, chipG: 22 * u, ordY: 1300 * u },
    landscape: { lx: Ly.vx, ly: 400 * u, k: 0.8 * u, cardX: Ly.vx - 400 * u, cardY: 590 * u, cardW: 800 * u, cardH: 255 * u, sealR: 58 * u,
      citeX: 158 * u, citeY: 660 * u, tx: Ly.vx + 50 * u, tW: 640 * u, tApex: 190 * u, tRoof: 290 * u, tCol: 650 * u, lab: 760 * u,
      l3x: Ly.vx + 60 * u, l3y: 420 * u, k3: 0.85 * u, legX: Ly.vx - 400 * u, legY: 660 * u, legDY: 84 * u, legCols: 2,
      gx: Ly.vx, gy: 230 * u, chipW: 140 * u, chipH: 80 * u, chipG: 20 * u, ordY: 690 * u },
  });
}
const ATTR = [['book', 'Savoir spécialisé', 'sav'], ['cap', 'Longue formation', 'for'], ['shield', 'Code de déontologie', 'code'], ['doc', 'Permis d’exercice', 'perm']];
const PROV = ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL'], TERR = ['YT', 'NT', 'NU'];

export function approachF(t, S) {
  const { g, W, H, u } = S;
  const F = layF(S), m = f.marks, mx = fx.marks;
  // through lens 1: its ring opens past the frame
  const op = sp(t - T.TF, [70, 16]);
  if (op < 1) lensRing(S, W / 2, H / 2, lerp(60 * u * 4.2, Math.hypot(W, H) * 0.6, op), { alpha: 1 - op, width: 10 });
  head(t, S, 1, 'Fonctionnaliste', T.TF, m.name);

  // F1 · criteria and rules, fixed in advance, stamped by the group and the State
  const ex1 = clamp(sp(t - (mx.a - 0.25), [130, 22]));
  if (ex1 < 1) {
    g.save(); g.globalAlpha *= 1 - ex1; g.translate(0, -ex1 * 120 * u);
    const slots = slotsOf();
    BLUE.forEach((i, j) => { slots[i].pin = spring(t - (m.a + 0.15 + j * 0.1), [180, 16]); });
    lock(S, F.lx, F.ly, F.k, { build: spring(t - (m.name + 0.35), ORG), slots, glow: 0.35 * sp(t - m.crit, SNAP) * (1 - sp(t - m.crit - 0.8, [60, 16])) });
    // bracket "CRITÈRES" above the pins
    const br = sp(t - m.crit + 0.1, [120, 20]);
    if (br > 0) {
      const [x0, yb] = at(F.lx, F.ly, F.k, xs(0) - 30, LOCKBOX.HTOP - 36), [x1] = at(F.lx, F.ly, F.k, xs(6) + 30, 0);
      const xm = (x0 + x1) / 2, hw = (x1 - x0) / 2 * br;
      g.strokeStyle = P.amber; g.lineWidth = 4 * u; g.lineCap = 'round';
      g.beginPath(); g.moveTo(xm - hw, yb + 16 * u); g.lineTo(xm - hw, yb); g.lineTo(xm + hw, yb); g.lineTo(xm + hw, yb + 16 * u); g.stroke();
      S.text('CRITÈRES', xm, yb - 22 * u, { size: 30, weight: 700, face: 'mono', color: P.amber, align: 'center', tracking: 0.12, alpha: br });
    }
    // the rule sheet: printed before anyone arrives
    const cs = spring(t - (m.pre - 0.15), ORG);
    if (cs > 0) {
      g.save(); g.globalAlpha *= clamp(cs * 2); g.translate(0, (1 - cs) * 120 * u);
      card(S, F.cardX, F.cardY, F.cardW, F.cardH, { fill: P.card, r: 26 });
      S.text('RÈGLES D’ACCÈS', F.cardX + 40 * u, F.cardY + 62 * u, { size: 28, weight: 700, face: 'mono', color: P.dim, tracking: 0.1 });
      const bw = S.pick({ portrait: [330, 270, 300, 220], landscape: [330, 270, 300, 220] });
      bw.forEach((w, j) => {
        const pw = sp(t - (m.pre + 0.05 + j * 0.07), SNAP);
        g.fillStyle = j === 0 ? P.slate : '#2B3A52';
        S.rrect(F.cardX + 40 * u, F.cardY + (100 + j * 44) * u, w * u * pw, 18 * u, 9 * u); g.fill();
      });
      const sx = F.cardX + F.cardW - S.pick({ portrait: 330, landscape: 300 }) * u, sy = F.cardY + F.cardH * 0.46;
      stamp(t, S, sx, sy, F.sealR, 'people', 'Groupe professionnel', m.grp);
      stamp(t, S, sx + S.pick({ portrait: 200, landscape: 175 }) * u, sy, F.sealR, 'institution', 'État', m.etat);
      g.restore();
    }
    g.restore();
  }

  // F2 · Parsons: professions hold society up
  cite(t, S, mx.par - 0.05, mx.c - 0.35, 'Talcott Parsons', 'The Professions and Social Structure · 1939', { x: F.citeX, y: F.citeY });
  const tIn = sp(t - (mx.par + 0.7), ORG), tOut = clamp(sp(t - (mx.c - 0.2), [130, 22]));
  if (tIn > 0 && tOut < 1) temple(t, S, F, tIn, tOut);

  // F3 · the attributes, one per pin; the key cut to match them opens the lock
  const in3 = spring(t - (mx.c - 0.05), ORG), out3 = clamp(sp(t - (mx.d - 0.15), [130, 22]));
  if (in3 > 0 && out3 < 1) {
    g.save(); g.globalAlpha *= clamp(in3 * 2) * (1 - out3); g.translate(-out3 * 200 * u, (1 - in3) * 160 * u);
    const slots = slotsOf();
    BLUE.forEach((i, j) => {
      const tm = mx[ATTR[j][2]];
      slots[i].badge = { p: spring(t - tm + 0.05, ORG), icon: ATTR[j][0], draw: sp(t - tm, [60, 15]), color: P.blue };
    });
    const kIn = mx.perm + 0.6, ins = clamp(spring(t - kIn, [50, 15]));
    const glow = sp(t - kIn - 1.05, [90, 18]);
    lock(S, F.l3x, F.l3y, F.k3, { build: 1, slots, key: { ins, cuts: CUTS, bow: { icon: 'person', color: P.sky } }, glow });
    if (glow > 0.01) {
      const [cx0, cy0] = at(F.l3x, F.l3y, F.k3, 346, 0), s = spring(t - kIn - 1.1, [260, 16]);
      g.save(); g.translate(cx0, cy0); g.scale(s, s);
      g.fillStyle = P.amber; circle(g, 0, 0, 28 * u); g.fill(); icon(S, 'check', 0, 0, 15 * u, 1, { color: P.bg, width: 5 });
      g.restore();
    }
    ATTR.forEach(([ic, label, mk], j) => {
      const col = F.legCols === 1 ? 0 : j % 2, row = F.legCols === 1 ? j : Math.floor(j / 2);
      legend(t, S, F.legX + col * 420 * u, F.legY + row * F.legDY, ic, label, mx[mk] - 0.05, { size: S.pick({ portrait: 40, landscape: 34 }), lit: mx[mk] });
    });
    g.restore();
  }

  // F4 · in Canada: ten provinces and three territories regulate, often through professional orders
  const in4 = range(t, mx.d - 0.1, mx.d + 0.2);
  if (in4 > 0) provinces(t, S, F, mx);
}

function temple(t, S, F, tIn, tOut) {
  const { g, u } = S;
  const mx = fx.marks;
  g.save(); g.globalAlpha *= clamp(tIn * 2) * (1 - tOut); g.translate(0, tOut * 200 * u);
  const hw = F.tW / 2, x0 = F.tx - hw;
  // base steps
  const st = sp(t - (mx.par + 0.8), [90, 18]);
  g.fillStyle = P.card;
  g.fillRect(F.tx - hw * st, F.tCol, F.tW * st, 26 * u);
  g.fillRect(F.tx - (hw + 30 * u) * st, F.tCol + 26 * u, (F.tW + 60 * u) * st, 26 * u);
  // pillars rise on "soigner, défendre, instruire"
  const cols = [['stethoscope', 'Soigner', mx.soi], ['scales', 'Défendre', mx.def], ['board', 'Instruire', mx.ins]];
  const pw = F.tW * 0.17, colTop = F.tRoof + 30 * u, colH = F.tCol - colTop;
  cols.forEach(([ic, label, tm], j) => {
    const cxj = x0 + F.tW * (0.2 + j * 0.3), rise = spring(t - tm + 0.05, [140, 15]);
    if (rise <= 0) return;
    const h = colH * clamp(rise, 0, 1.05);
    g.fillStyle = '#26354D'; g.fillRect(cxj - pw / 2, F.tCol - h, pw, h);
    g.strokeStyle = '#3B4A61'; g.lineWidth = 2 * u;
    for (let k = 1; k < 4; k++) { const fxk = cxj - pw / 2 + (pw * k) / 4; g.beginPath(); g.moveTo(fxk, F.tCol - h + 30 * u); g.lineTo(fxk, F.tCol - 10 * u); g.stroke(); }
    g.fillStyle = '#30415C'; g.fillRect(cxj - pw / 2 - 12 * u, F.tCol - h, pw + 24 * u, 22 * u);
    const iy = F.tCol - h * 0.55, ir = pw * 0.42;
    g.fillStyle = P.card2; circle(g, cxj, iy, ir); g.fill(); g.strokeStyle = P.blue; g.lineWidth = 3.5 * u; circle(g, cxj, iy, ir); g.stroke();
    icon(S, ic, cxj, iy, ir * 0.55, sp(t - tm, [40, 13]), { color: P.ink, width: 3.5 });
    S.text(label, cxj, F.lab, { size: S.pick({ portrait: 40, landscape: 34 }), weight: 600, color: mixColor(P.amber, P.ink, sp(t - tm - 0.5, [60, 16])), align: 'center', alpha: clamp(rise * 2) });
  });
  // the roof: hovers, unsupported, until the third pillar is up, then settles onto them
  const drop = spring(t - (mx.par + 1.0), ORG), settle = spring(t - mx.ins - 0.12, [200, 13]);
  const lift = (1 - clamp(settle)) * 70 * u + Math.sin((t - mx.par) * 2.4) * 10 * u * (1 - clamp(settle));
  const ry = -(1 - drop) * 300 * u - lift;
  g.save(); g.translate(0, ry); g.globalAlpha *= clamp(drop * 2);
  g.fillStyle = P.card; g.strokeStyle = P.blue; g.lineWidth = 4 * u; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x0 - 30 * u, F.tRoof - 4 * u); g.lineTo(F.tx, F.tApex); g.lineTo(x0 + F.tW + 30 * u, F.tRoof - 4 * u); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#26354D'; g.fillRect(x0 - 30 * u, F.tRoof, F.tW + 60 * u, 30 * u);
  g.strokeStyle = P.blue; g.strokeRect(x0 - 30 * u, F.tRoof, F.tW + 60 * u, 30 * u);
  S.text('SOCIÉTÉ', F.tx, F.tRoof - (F.tRoof - F.tApex) * 0.28, { size: S.pick({ portrait: 34, landscape: 30 }), weight: 700, face: 'mono', color: P.ink, align: 'center', tracking: 0.16 });
  g.restore();
  // dust where the roof lands
  const dust = range(t, mx.ins + 0.2, mx.ins + 0.8);
  if (dust > 0 && dust < 1) {
    g.fillStyle = `rgba(148,163,184,${0.5 * (1 - dust)})`;
    for (let k = 0; k < 14; k++) { const side = k % 2 ? 1 : -1, d = (0.3 + hash(k, 9) * 0.7) * dust; circle(g, F.tx + side * (hw + 30 * u + d * 90 * u), F.tRoof + 30 * u - d * 26 * u * hash(k, 4), (3 + 4 * hash(k, 5)) * u); g.fill(); }
  }
  g.restore();
}

function provinces(t, S, F, mx) {
  const { g, u } = S;
  const all = [...PROV.map((p) => [p, false]), ...TERR.map((p) => [p, true])];
  const cw = F.chipW, ch = F.chipH, gap = F.chipG, cols = 5;
  const gw = cols * cw + (cols - 1) * gap, x0 = F.gx - gw / 2;
  const ey = typed('AU CANADA', t - mx.d, 26);
  if (ey) S.text(ey, x0, F.gy - 50 * u, { size: 30, weight: 700, face: 'mono', color: P.amber, tracking: 0.12 });
  const pos = all.map(([, terr], j) => {
    if (!terr) return [x0 + (j % cols) * (cw + gap), F.gy + Math.floor(j / cols) * (ch + gap)];
    const k = j - 10, tw3 = 3 * cw + 2 * gap;
    return [F.gx - tw3 / 2 + k * (cw + gap), F.gy + 2 * (ch + gap) + 18 * u];
  });
  const tChip = (j) => (j < 10 ? mx.prov + j * 0.085 : mx.prov + 10 * 0.085 + 0.2 + (j - 10) * 0.1);
  // links down to the professional orders
  const ordX = F.gx, ordY = F.ordY;
  const os = spring(t - mx.ord + 0.1, ORG);
  if (os > 0) {
    all.forEach(([, terr], j) => {
      const [px, py] = pos[j], lk = sp(t - mx.ord - j * 0.03, [70, 16]);
      if (lk <= 0) return;
      const ax = px + cw / 2, ay = py + ch / 2, bx = ordX + (j - 6) * 14 * u, by = ordY - 40 * u;
      g.strokeStyle = terr ? 'rgba(147,197,253,0.45)' : 'rgba(59,130,246,0.55)'; g.lineWidth = 2.5 * u;
      g.beginPath(); g.moveTo(ax, ay);
      const steps = 20;
      for (let q = 1; q <= steps * lk; q++) { const s = q / steps; g.lineTo(lerp(ax, bx, s), lerp(ay, by, s * s * 0.4 + s * 0.6)); }
      g.stroke();
      const dp = ((t - mx.ord) * 0.7 + hash(j, 7)) % 1;
      if (lk >= 1) { g.fillStyle = P.amber; circle(g, lerp(ax, bx, dp), lerp(ay, by, dp * dp * 0.4 + dp * 0.6), 4 * u); g.fill(); }
    });
    g.save(); g.globalAlpha *= clamp(os * 2);
    const label = 'Ordres professionnels';
    const w = measure(S, label, 40, 700) + 120 * u, h = 84 * u;
    g.translate(ordX, ordY); g.scale(lerp(0.8, 1, clamp(os)), lerp(0.8, 1, clamp(os)));
    card(S, -w / 2, -h / 2, w, h, { fill: P.card2, r: 42, stroke: P.amber });
    icon(S, 'seal', -w / 2 + 50 * u, 0, 22 * u, sp(t - mx.ord, [60, 15]), { color: P.amber, width: 4 });
    S.text(label, -w / 2 + 88 * u, 14 * u, { size: 40, weight: 700, color: P.ink });
    g.restore();
  }
  all.forEach(([name, terr], j) => {
    const s = spring(t - tChip(j), [260, 16]);
    if (s <= 0) return;
    const [px, py] = pos[j];
    g.save(); g.globalAlpha *= clamp(s * 2.5);
    g.translate(px + cw / 2, py + ch / 2); g.scale(lerp(1.5, 1, clamp(s, 0, 1.2)), lerp(1.5, 1, clamp(s, 0, 1.2)));
    g.fillStyle = terr ? P.card2 : mixColor(P.card, P.blue, 0.75); S.rrect(-cw / 2, -ch / 2, cw, ch, 16 * u); g.fill();
    if (terr) { g.strokeStyle = P.sky; g.lineWidth = 3 * u; S.rrect(-cw / 2, -ch / 2, cw, ch, 16 * u); g.stroke(); }
    S.text(name, 0, 14 * u, { size: 40, weight: 800, color: terr ? P.sky : P.ink, align: 'center', tracking: 0.04 });
    g.restore();
  });
  const capA = range(t, tChip(12) + 0.1, tChip(12) + 0.4);
  if (capA > 0) S.text('10 provinces · 3 territoires', x0 + gw, F.gy - 50 * u, { size: 30, weight: 600, color: P.dim, align: 'right', alpha: capA });
}

// ════════════════════════════════════════════════════════════════════════════
// 2 · INTERACTIONNISTE
// ════════════════════════════════════════════════════════════════════════════
function layI(S) {
  const { W, u } = S;
  const Ly = lay(S);
  return S.pick({
    portrait: { lx: W / 2, ly: 905 * u, k: 0.95 * u, proX: 170 * u, cliX: W - 170 * u, figY: 1290 * u, figR: 70 * u, gX: W / 2, gY: 1350 * u, gR: 130 * u,
      citeX: 84 * u, citeY: 618 * u, nx: W / 2, ny: 1010 * u, nR: 330 * u, nodeR: 66 * u,
      cardX: 84 * u, cardY: 780 * u, cardW: W - 168 * u, cardH: 640 * u },
    landscape: { lx: Ly.vx, ly: 390 * u, k: 0.8 * u, proX: Ly.vx - 290 * u, cliX: Ly.vx + 440 * u, figY: 660 * u, figR: 58 * u, gX: Ly.vx, gY: 790 * u, gR: 100 * u,
      citeX: 158 * u, citeY: 660 * u, nx: Ly.vx, ny: 440 * u, nR: 300 * u, nodeR: 58 * u,
      cardX: Ly.vx - 410 * u, cardY: 150 * u, cardW: 820 * u, cardH: 640 * u },
  });
}
// Negotiation: each bubble moves one pin. [time offset, speaker 0 pro / 1 client, slot, delta lu]
const BUBBLES = [[0, 1, 2, 16], [0.42, 0, 0, -12], [0.84, 1, 4, 14], [1.26, 0, 6, -10], [1.68, 1, 2, -8]];
const SLIDERS = ['Délais', 'Méthodes', 'Résultats attendus'];
const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN'];

export function approachI(t, S) {
  const { g, W, u } = S;
  const I = layI(S), m = li.marks, mx = ix.marks;
  head(t, S, 2, 'Interactionniste', T.TI, m.name);

  // I1 · same criteria, but negotiated with the client
  const out1 = clamp(sp(t - (mx.a - 0.25), [170, 26]));
  if (out1 < 1) {
    g.save(); g.globalAlpha *= 1 - out1; g.translate(0, -out1 * 90 * u);
    const k = I.k * (1 - 0.7 * out1);
    const slots = slotsOf();
    BLUE.forEach((i, j) => { slots[i].pin = spring(t - (m.a - 0.1 + j * 0.08), [180, 16]); });
    BUBBLES.forEach(([dt, , slot, d]) => { slots[slot].lk = slots[slot].lk + d * spring(t - (m.neg + dt + 0.25), [180, 12]); });
    const settle = sp(t - m.sat - 1.2, [60, 16]);
    BLUE.forEach((i, j) => { slots[i].jiggle = noise(t * 3 + j * 7, 40 + j) * 6 * (1 - settle) * range(t, m.a, m.a + 0.6); });
    const lyy = lerp(I.ly, I.ny, out1);
    lock(S, I.lx, lyy, k, { build: spring(t - (m.name + 0.35), ORG), slots, glow: 0.5 * settle });
    // the two parties
    [[I.proX, P.blue, 'Professionnel·le'], [I.cliX, P.amber, 'Client·e']].forEach(([x, col, label], side) => {
      const s = spring(t - (m.neg - 0.25 + side * 0.12), ORG);
      if (s <= 0) return;
      g.save(); g.globalAlpha *= clamp(s * 2);
      g.fillStyle = P.card2; circle(g, x, I.figY, I.figR * s); g.fill();
      g.strokeStyle = col; g.lineWidth = 4 * u; circle(g, x, I.figY, I.figR * s); g.stroke();
      person(S, x, I.figY + 6 * u, I.figR * 0.55, col, sp(t - m.neg + 0.2, [60, 15]));
      S.text(label, x, I.figY + I.figR + 44 * u, { size: S.pick({ portrait: 30, landscape: 28 }), weight: 600, color: P.ink, align: 'center' });
      g.restore();
    });
    BUBBLES.forEach(([dt, who, slot]) => {
      const tb = m.neg + dt, s = spring(t - tb, [220, 16]), gone = range(t, tb + 0.5, tb + 0.75);
      if (s <= 0 || gone >= 1) return;
      const x = who ? I.cliX : I.proX, y = I.figY - I.figR - 70 * u;
      g.save(); g.globalAlpha *= clamp(s * 2) * (1 - gone); g.translate(x, y); g.scale(s, s);
      g.fillStyle = who ? P.amber : P.blue;
      S.rrect(-56 * u, -40 * u, 112 * u, 70 * u, 22 * u); g.fill();
      g.beginPath(); g.moveTo((who ? 18 : -18) * u, 28 * u); g.lineTo((who ? 30 : -30) * u, 52 * u); g.lineTo((who ? 2 : -2) * u, 28 * u); g.fill();
      g.fillStyle = P.bg; for (let q = 0; q < 3; q++) { circle(g, (-22 + q * 22) * u, -5 * u, 6 * u); g.fill(); }
      g.restore();
      // a spark flies from the bubble to the pin it moves
      const fl = range(t, tb + 0.08, tb + 0.3);
      if (fl > 0 && fl < 1) {
        const [px, py] = at(I.lx, lyy, k, xs(slot), -120);
        g.fillStyle = who ? P.amber : P.sky;
        circle(g, lerp(x, px, fl), lerp(y, py, fl) - Math.sin(fl * Math.PI) * 120 * u, 9 * u); g.fill();
      }
    });
    // satisfaction gauge
    const gs = spring(t - (m.sat - 0.15), ORG), fill = sp(t - m.sat, [22, 9]);
    if (gs > 0) {
      g.save(); g.globalAlpha *= clamp(gs * 2);
      g.lineCap = 'round'; g.lineWidth = 20 * u;
      g.strokeStyle = P.slate; g.beginPath(); g.arc(I.gX, I.gY, I.gR, Math.PI, Math.PI * 2); g.stroke();
      g.strokeStyle = P.amber; g.beginPath(); g.arc(I.gX, I.gY, I.gR, Math.PI, Math.PI * (1 + clamp(fill))); g.stroke();
      const na = Math.PI * (1 + clamp(fill, 0, 1.02));
      g.strokeStyle = P.ink; g.lineWidth = 5 * u; g.beginPath(); g.moveTo(I.gX, I.gY); g.lineTo(I.gX + Math.cos(na) * I.gR * 0.72, I.gY + Math.sin(na) * I.gR * 0.72); g.stroke();
      g.fillStyle = P.ink; circle(g, I.gX, I.gY, 10 * u); g.fill();
      icon(S, 'smile', I.gX, I.gY - I.gR * 0.42, I.gR * 0.2, range(t, m.sat + 0.6, m.sat + 1.2), { color: P.amber, width: 3.5 });
      S.text('Satisfaction des clients', I.gX, I.gY + 54 * u, { size: S.pick({ portrait: 30, landscape: 28 }), weight: 600, color: P.ink, align: 'center' });
      g.restore();
    }
    g.restore();
  }

  // I2–I4 · Hughes: a profession is made in interactions
  cite(t, S, mx.a - 0.05, T.TC + 0.2, 'Everett C. Hughes', 'École de Chicago · Men and Their Work, 1958', { x: I.citeX, y: I.citeY, lit: mx.chi });
  const netIn = spring(t - (mx.a + 0.1), ORG);
  if (netIn > 0) network(t, S, I, mx, netIn);
  const cardIn = spring(t - (mx.c - 0.1), ORG), cardOut = clamp(sp(t - (mx.d - 0.25), [130, 22]));
  if (cardIn > 0 && cardOut < 1) goodWork(t, S, I, mx, cardIn, cardOut);
}

function network(t, S, I, mx, netIn) {
  const { g, u } = S;
  // the network folds away while "good work" is on screen, then comes back
  const fold = clamp(sp(t - (mx.c - 0.25), [130, 22])) * (1 - clamp(sp(t - (mx.d - 0.15), [120, 20])));
  const sc = lerp(1, 0.001, fold);
  if (sc < 0.02) return;
  g.save(); g.globalAlpha *= clamp(netIn * 2) * (1 - fold);
  g.translate(I.nx, I.ny); g.scale(sc, sc); g.translate(-I.nx, -I.ny);
  const nodes = [['Clients', mx.cli, Math.PI * 1.1, P.amber], ['Collègues', mx.col, -Math.PI * 0.1, P.sky], ['Public', mx.pub, Math.PI * 0.5, P.sky]];
  const pos = nodes.map(([, , a]) => [I.nx + Math.cos(a) * I.nR, I.ny + Math.sin(a) * I.nR * S.pick({ portrait: 1, landscape: 0.95 })]);
  const earn = [0, 1, 2].map((j) => range(t, mx.gag + j * 0.22, mx.gag + j * 0.22 + 0.35));
  const earned = earn.reduce((a, b) => a + b, 0) / 3;
  // "se construit dans les interactions": ripples leave the centre, three places wait to be named
  for (let q = 0; q < 6; q++) {
    const tq = mx.b - 0.1 + q * 0.45, pr = range(t, tq, tq + 1.3);
    if (pr <= 0 || pr >= 1 || tq > mx.pub) continue;
    g.strokeStyle = P.blue; g.globalAlpha *= 1; g.lineWidth = 3 * u;
    g.save(); g.globalAlpha *= (1 - pr) * 0.55; circle(g, I.nx, I.ny, lerp(I.nodeR * 1.2, I.nR * 1.08, pr)); g.stroke(); g.restore();
  }
  nodes.forEach(([, tm], j) => {
    const ph = sp(t - (mx.b + 0.35 + j * 0.18), [120, 18]) * (1 - range(t, tm - 0.05, tm + 0.15));
    if (ph <= 0) return;
    const [x, y] = pos[j];
    g.save(); g.globalAlpha *= ph * 0.8;
    g.setLineDash([10 * u, 9 * u]); g.strokeStyle = P.dim; g.lineWidth = 3 * u; circle(g, x, y, I.nodeR * ph); g.stroke(); g.setLineDash([]);
    S.text('?', x, y + 15 * u, { size: 44, weight: 700, color: P.dim, align: 'center' });
    g.restore();
  });
  // links + interactions travelling both ways
  nodes.forEach(([, tm, , col], j) => {
    const lk = sp(t - tm + 0.05, [90, 18]);
    if (lk <= 0) return;
    const [x, y] = pos[j];
    g.strokeStyle = P.slate; g.lineWidth = 4 * u;
    g.beginPath(); g.moveTo(I.nx, I.ny); g.lineTo(lerp(I.nx, x, lk), lerp(I.ny, y, lk)); g.stroke();
    if (lk > 0.95) for (let q = 0; q < 3; q++) {
      const ph = ((t - tm) * 0.75 + q / 3) % 1, dir = q % 2;
      const pp = dir ? ph : 1 - ph, r = 7 * u;
      g.fillStyle = dir ? col : P.blue;
      circle(g, lerp(I.nx, x, pp), lerp(I.ny, y, pp), r); g.fill();
    }
    // the beam that earns the title
    const e = earn[j];
    if (e > 0 && e < 1) { g.fillStyle = P.amber; circle(g, lerp(x, I.nx, e), lerp(y, I.ny, e), 13 * u); g.fill(); }
  });
  // satellites
  nodes.forEach(([label, tm, , col], j) => {
    const s = spring(t - tm + 0.05, ORG);
    if (s <= 0) return;
    const [x, y] = pos[j], r = I.nodeR * s;
    g.fillStyle = P.card2; circle(g, x, y, r); g.fill();
    g.strokeStyle = col; g.lineWidth = 4 * u; circle(g, x, y, r); g.stroke();
    icon(S, 'people', x, y + 4 * u, r * 0.55, sp(t - tm, [60, 15]), { color: col, width: 4 });
    S.text(label, x, y + I.nodeR + 46 * u, { size: S.pick({ portrait: 34, landscape: 30 }), weight: 600, color: P.ink, align: 'center', alpha: clamp(s) });
    const ok = spring(t - (mx.conv + 0.1 + j * 0.12), [260, 16]);
    if (ok > 0) {
      g.save(); g.translate(x + r * 0.72, y - r * 0.72); g.scale(ok, ok);
      g.fillStyle = P.amber; circle(g, 0, 0, 22 * u); g.fill(); icon(S, 'check', 0, 0, 12 * u, 1, { color: P.bg, width: 4.5 });
      g.restore();
    }
  });
  // centre: the professional, who becomes a recognised profession
  const cr = I.nodeR * 1.12 * clamp(netIn, 0, 1.1);
  const full = sp(t - mx.conv - 0.3, [170, 18]);
  g.fillStyle = mixColor(P.card2, P.amber, full); circle(g, I.nx, I.ny, cr); g.fill();
  g.strokeStyle = P.blue; g.lineWidth = 5 * u; circle(g, I.nx, I.ny, cr); g.stroke();
  if (earned > 0) { g.strokeStyle = P.amber; g.lineWidth = 9 * u; g.lineCap = 'round'; g.beginPath(); g.arc(I.nx, I.ny, cr + 14 * u, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * earned); g.stroke(); }
  const badge = sp(t - mx.d, [120, 20]);
  person(S, I.nx, I.ny + 6 * u, cr * 0.55 * (1 - badge), P.ink);
  if (badge > 0) icon(S, 'seal', I.nx, I.ny, cr * 0.6, badge, { color: full > 0.5 ? P.bg : P.amber, width: 5 });
  const lab = badge > 0.5 ? 'Titre de profession' : 'Professionnel·le';
  S.text(lab, I.nx, I.ny + cr + 50 * u, { size: S.pick({ portrait: 34, landscape: 30 }), weight: 700, color: badge > 0.5 ? P.amber : P.ink, align: 'center', alpha: badge > 0.5 ? range(badge, 0.5, 0.8) : 1 - range(badge, 0.2, 0.5) });
  g.restore();
}

function goodWork(t, S, I, mx, cin, cout) {
  const { g, u } = S;
  g.save(); g.globalAlpha *= clamp(cin * 2) * (1 - cout);
  const cxm = I.cardX + I.cardW / 2, cym = I.cardY + I.cardH / 2, sc = lerp(0.6, 1, clamp(cin)) * lerp(1, 0.6, cout);
  g.translate(cxm, cym); g.scale(sc, sc); g.translate(-cxm, -cym);
  card(S, I.cardX, I.cardY, I.cardW, I.cardH, { fill: P.card, r: 28 });
  S.text('Un travail bien fait ?', I.cardX + 44 * u, I.cardY + 84 * u, { size: 54, weight: 600, face: 'display', color: P.ink });
  // the week: the active day moves on "au quotidien"
  const dayT = (d) => mx.day - 0.1 + d * 0.34;
  const cur = DAYS.reduce((a, _, d) => a + spring(t - dayT(d), SNAP), 0) - 1;
  const dw = (I.cardW - 88 * u - 4 * 16 * u) / 5;
  DAYS.forEach((d, j) => {
    const x = I.cardX + 44 * u + j * (dw + 16 * u), y = I.cardY + 130 * u;
    const on = clamp(1 - Math.abs(cur - j)), past = cur >= j - 0.01 ? 1 : 0;
    g.fillStyle = mixColor(P.card2, P.blue, on); S.rrect(x, y, dw, 56 * u, 14 * u); g.fill();
    S.text(d, x + dw / 2, y + 38 * u, { size: 26, weight: 700, face: 'mono', color: mixColor(P.dim, P.ink, Math.max(on, 0.5 * past)), align: 'center', tracking: 0.08 });
  });
  // three sliders: professional (blue) and client (amber) start apart and meet, every day again
  const AG = [[0.3, 0.55, 0.45, 0.7, 0.6], [0.7, 0.4, 0.55, 0.35, 0.5], [0.45, 0.75, 0.6, 0.8, 0.65]];
  const SPREAD = [[0.22, 0.18, 0.2, 0.15, 0.2], [0.2, 0.24, 0.16, 0.2, 0.18], [0.18, 0.2, 0.22, 0.16, 0.2]];
  SLIDERS.forEach((label, r) => {
    const y = I.cardY + (290 + r * 120) * u, x0 = I.cardX + 44 * u, tx0 = I.cardX + I.cardW * S.pick({ portrait: 0.47, landscape: 0.44 }), tx1 = I.cardX + I.cardW - 60 * u;
    S.text(label, x0, y + 12 * u, { size: S.pick({ portrait: 36, landscape: 34 }), weight: 600, color: P.ink });
    g.fillStyle = P.slate; S.rrect(tx0, y - 4 * u, tx1 - tx0, 8 * u, 4 * u); g.fill();
    const keys = [[0, AG[r][0]], ...DAYS.map((_, d) => [dayT(d), AG[r][d]])];
    const mid = track(t, keys, 120, 20);
    let div = 0;
    DAYS.forEach((_, d) => { div = t >= dayT(d) ? SPREAD[r][d] * (1 - sp(t - dayT(d) - 0.04, [90, 15])) : div; });
    if (t < dayT(0)) div = SPREAD[r][0];
    const bx = lerp(tx0, tx1, clamp(mid - div)), ax = lerp(tx0, tx1, clamp(mid + div));
    g.fillStyle = 'rgba(245,158,11,0.25)'; g.fillRect(bx, y - 4 * u, ax - bx, 8 * u);
    g.fillStyle = P.blue; circle(g, bx, y, 17 * u); g.fill();
    g.fillStyle = P.amber; circle(g, ax, y, 17 * u); g.fill();
    if (div < 0.01) { g.strokeStyle = P.ink; g.lineWidth = 3 * u; circle(g, (ax + bx) / 2, y, 24 * u); g.stroke(); }
  });
  // legend
  const ly = I.cardY + I.cardH - 50 * u;
  g.fillStyle = P.blue; circle(g, I.cardX + 60 * u, ly - 9 * u, 11 * u); g.fill();
  const w1 = S.text('professionnel·le', I.cardX + 82 * u, ly, { size: 26, weight: 500, color: P.dim });
  g.fillStyle = P.amber; circle(g, I.cardX + 120 * u + w1, ly - 9 * u, 11 * u); g.fill();
  S.text('client·e', I.cardX + 142 * u + w1, ly, { size: 26, weight: 500, color: P.dim });
  g.restore();
}

// ════════════════════════════════════════════════════════════════════════════
// 3 · CONFLICTUALISTE
// ════════════════════════════════════════════════════════════════════════════
function layC(S) {
  const { W, H, u } = S;
  const Ly = lay(S);
  return S.pick({
    portrait: { lx: W / 2 - 40 * u, ly: 1000 * u, k: 0.82 * u, step: 34 * u, mX: W - 120 * u, mTop: 760 * u, mBot: 1110 * u,
      gX: W / 2 - 40 * u, gY: 1210 * u, gCols: 6, gRows: 2, gS: 92 * u, gG: 14 * u, citeX: 84 * u, citeY: 618 * u,
      cardX: 84 * u, cardY: 790 * u, cardW: W - 168 * u, cardH: 470 * u,
      vertical: true, s0: 700 * u, s1: 1470 * u, a0: 130 * u, a1: 640 * u, gates: [860 * u, 1030 * u, 1200 * u], ringX: 385 * u, ringY: 1380 * u, ringR: 108 * u,
      c4x: 300 * u, c4y: 980 * u, m4x: 640 * u, g4x: W / 2, g4y: 1230 * u },
    landscape: { lx: Ly.vx - 140 * u, ly: 430 * u, k: 0.72 * u, step: 24 * u, mX: Ly.vx + 280 * u, mTop: 230 * u, mBot: 550 * u,
      gX: Ly.vx - 60 * u, gY: 650 * u, gCols: 8, gRows: 2, gS: 74 * u, gG: 12 * u, citeX: 158 * u, citeY: 660 * u,
      cardX: Ly.vx - 410 * u, cardY: 170 * u, cardW: 820 * u, cardH: 440 * u,
      vertical: false, s0: 880 * u, s1: 1660 * u, a0: 230 * u, a1: 690 * u, gates: [1050 * u, 1220 * u, 1390 * u], ringX: 1590 * u, ringY: 460 * u, ringR: 92 * u,
      c4x: Ly.vx - 260 * u, c4y: 450 * u, m4x: Ly.vx + 20 * u, g4x: Ly.vx + 300 * u, g4y: 300 * u },
  });
}
function market(t, S, x, y, cols, rows, sz, gap, fillAt, frac, { label, alpha = 1 } = {}) {
  const { g, u } = S;
  const gw = cols * sz + (cols - 1) * gap, x0 = x - gw / 2;
  g.save(); g.globalAlpha *= alpha;
  if (label) S.text(label, x0, y - 22 * u, { size: 26, weight: 700, face: 'mono', color: P.dim, tracking: 0.1 });
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const j = r * cols + c, owned = hash(j, 31) < frac || frac >= 1;
    const tf = fillAt + c * 0.05 + r * 0.04;
    const on = owned ? sp(t - tf, [170, 20]) : 0, pop = spring(t - tf, [260, 14]);
    const sc = 1 + 0.12 * (pop - on);
    const cx0 = x0 + c * (sz + gap) + sz / 2, cy0 = y + r * (sz + gap) + sz / 2;
    g.save(); g.translate(cx0, cy0); g.scale(sc, sc);
    g.fillStyle = mixColor(P.card, P.amber, on); S.rrect(-sz / 2, -sz / 2, sz, sz, 12 * u); g.fill();
    g.restore();
  }
  g.restore();
}

export function approachC(t, S) {
  const { g, W, u } = S;
  const C = layC(S), m = lc.marks, mx = cx.marks;
  head(t, S, 3, 'Conflictualiste', T.TC, m.name);

  // C1 · closures, prestige, control of the market
  const out1 = clamp(sp(t - (mx.a - 0.2), [130, 22]));
  if (out1 < 1) {
    g.save(); g.globalAlpha *= 1 - out1; g.translate(0, -out1 * 120 * u);
    const lift = sp(t - m.pres, [90, 15]) * 3 * C.step;
    const slots = slotsOf();
    BLUE.forEach((i, j) => { slots[i].pin = spring(t - (m.a - 0.1 + j * 0.08), [180, 16]); });
    AMBER.forEach((i, j) => {
      slots[i].open = sp(t - (m.ferm - 0.45 + j * 0.14), [120, 20]);
      slots[i].pin = spring(t - (m.ferm - 0.05 + j * 0.14), [220, 15]);
      slots[i].badge = { p: spring(t - (m.ferm + 0.25 + j * 0.1), ORG), icon: 'padlock', color: P.amber };
    });
    lock(S, C.lx, C.ly - lift, C.k, { build: spring(t - (m.name + 0.35), ORG), slots });
    // plinth: the lock is raised, step by step
    const base = C.ly + 142 * C.k + 8 * u;
    for (let s = 0; s < 3; s++) {
      const h = clamp(lift / C.step - s) * C.step, w = (600 * C.k) + (s + 1) * 70 * u;
      if (h <= 0) continue;
      g.fillStyle = s === 0 ? '#2B3A52' : s === 1 ? '#26354D' : P.card;
      g.fillRect(C.lx - w / 2, base - lift + s * C.step, w, h);
    }
    // prestige meter
    const ms = spring(t - (m.pres - 0.2), ORG);
    if (ms > 0) {
      g.save(); g.globalAlpha *= clamp(ms * 2);
      const mw = 34 * u, mh = C.mBot - C.mTop, lv = 0.25 + 0.6 * sp(t - m.pres, [60, 14]);
      g.fillStyle = P.card; S.rrect(C.mX - mw / 2, C.mTop, mw, mh, mw / 2); g.fill();
      g.fillStyle = P.amber; S.rrect(C.mX - mw / 2, C.mBot - mh * lv, mw, mh * lv, mw / 2); g.fill();
      icon(S, 'star', C.mX, C.mTop - 44 * u, 26 * u, sp(t - m.pres, [60, 15]), { color: P.amber, width: 4 });
      S.text('Prestige', C.mX, C.mBot + 44 * u, { size: 28, weight: 600, color: P.ink, align: 'center' });
      g.restore();
    }
    const fa = range(t, m.ferm + 0.2, m.ferm + 0.5);
    if (fa > 0) { const [fx0, fy0] = at(C.lx, C.ly - lift, C.k, 0, LOCKBOX.BADGE - 64); S.text('FERMETURES', fx0, fy0, { size: 28, weight: 700, face: 'mono', color: P.amber, align: 'center', tracking: 0.14, alpha: fa }); }
    // the market of services, taken over
    const ga = range(t, m.ctrl - 0.3, m.ctrl);
    if (ga > 0) market(t, S, C.gX, C.gY, C.gCols, C.gRows, C.gS, C.gG, m.ctrl + 0.05, 0.7, { label: 'MARCHÉ DES SERVICES', alpha: ga });
    g.restore();
  }

  // C2 · Larson's professional project
  cite(t, S, mx.lar - 0.05, mx.c - 0.3, 'Magali Sarfatti Larson', 'The Rise of Professionalism · 1977', { x: C.citeX, y: C.citeY });
  chronology(t, S, mx);
  const pin = spring(t - (mx.b - 0.15), ORG), pout = clamp(sp(t - (mx.c - 0.25), [130, 22]));
  if (pin > 0 && pout < 1) {
    g.save(); g.globalAlpha *= clamp(pin * 2) * (1 - pout); g.translate(0, (1 - pin) * 120 * u - pout * 120 * u);
    card(S, C.cardX, C.cardY, C.cardW, C.cardH, { fill: P.card, r: 28, edge: P.amber });
    const ttl = typed('« Projet professionnel »', t - mx.proj + 0.15, 30);
    S.text(ttl, C.cardX + 50 * u, C.cardY + 100 * u, { size: S.pick({ portrait: 60, landscape: 56 }), weight: 'italic 600', face: 'display', color: P.ink });
    [['pie', 'Contrôler son marché', mx.mkt], ['arrowUp', 'Élever son statut', mx.stat]].forEach(([ic, label, tm], j) => {
      const y = C.cardY + (210 + j * 120) * u, s = spring(t - tm + 0.05, ORG);
      if (s <= 0) return;
      g.save(); g.globalAlpha *= clamp(s * 2); g.translate((1 - s) * 40 * u, 0);
      g.fillStyle = P.card2; circle(g, C.cardX + 90 * u, y, 40 * u); g.fill();
      g.strokeStyle = P.amber; g.lineWidth = 4 * u; circle(g, C.cardX + 90 * u, y, 40 * u); g.stroke();
      icon(S, ic, C.cardX + 90 * u, y, 20 * u, sp(t - tm, [60, 15]), { color: P.amber, width: 4 });
      S.text(label, C.cardX + 156 * u, y + 16 * u, { size: S.pick({ portrait: 46, landscape: 42 }), weight: 600, color: P.ink });
      const ck = spring(t - tm - 0.35, [260, 16]);
      if (ck > 0) { const kx = C.cardX + C.cardW - 70 * u; g.translate(kx, y); g.scale(ck, ck); g.fillStyle = P.amber; circle(g, 0, 0, 26 * u); g.fill(); icon(S, 'check', 0, 0, 14 * u, 1, { color: P.bg, width: 5 }); }
      g.restore();
    });
    g.restore();
  }

  // C3 · three gates thin the stream; those who pass are closed in
  const sIn = range(t, mx.c - 0.5, mx.c - 0.2), sOut = clamp(sp(t - (mx.d - 0.2), [120, 20]));
  if (sIn > 0) closure(t, S, C, mx, sIn, sOut);
}

// The three theories on one time line: 1939 · 1958 · 1977. Shown while Larson is introduced.
function chronology(t, S, mx) {
  const { g, u } = S;
  const Ly = lay(S);
  const tIn = mx.lar + 0.35, out = clamp(sp(t - (mx.b - 0.35), [150, 22]));
  const d = sp(t - tIn, [70, 17]);
  if (d <= 0 || out >= 1) return;
  const [x0, x1, y] = S.pick({ portrait: [130 * u, S.W - 130 * u, 1060 * u], landscape: [Ly.vx - 360 * u, Ly.vx + 360 * u, 470 * u] });
  const X = (yr) => lerp(x0, x1, (yr - 1935) / (1981 - 1935));
  g.save(); g.globalAlpha *= 1 - out; g.translate(0, -out * 60 * u);
  g.strokeStyle = P.slate; g.lineWidth = 4 * u; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x0, y); g.lineTo(lerp(x0, x1, d), y); g.stroke();
  [[1939, 'Parsons', 'Fonctionnaliste', P.blue], [1958, 'Hughes', 'Interactionniste', P.blue], [1977, 'Larson', 'Conflictualiste', P.amber]].forEach(([yr, who, ap, col], j) => {
    const s = spring(t - (tIn + 0.15 + j * 0.28), [220, 15]);
    if (s <= 0) return;
    const x = X(yr), last = j === 2;
    g.fillStyle = last ? P.amber : P.card2; circle(g, x, y, 16 * u * s); g.fill();
    g.strokeStyle = col; g.lineWidth = 4 * u; circle(g, x, y, 16 * u * s); g.stroke();
    if (last) { const pr = ((t - tIn) * 0.9) % 1; g.save(); g.globalAlpha *= (1 - pr) * 0.6; circle(g, x, y, 16 * u + pr * 40 * u); g.stroke(); g.restore(); }
    S.text(String(yr), x, y - 40 * u, { size: 40, weight: 800, face: 'mono', color: last ? P.amber : P.ink, align: 'center', alpha: clamp(s) });
    S.text(who, x, y + 58 * u, { size: 34, weight: 700, color: P.ink, align: 'center', alpha: clamp(s) });
    S.text(ap, x, y + 96 * u, { size: 24, weight: 500, color: P.dim, align: 'center', alpha: clamp(s) });
  });
  g.restore();
}

// Candidates flow along an axis; each gate stops some of them. Survivors gather and a ring closes.
const N = 56, THR = [0.3, 0.36, 0.45];
function closure(t, S, C, mx, sIn, sOut) {
  const { g, u } = S;
  const V = C.vertical;
  const P2 = (s, a) => (V ? [a, s] : [s, a]);           // along-axis s, across-axis a → x, y
  const speed = 470 * u, t0 = mx.c - 0.6;
  const gateT = [mx.c - 0.35, mx.c - 0.1, mx.c + 0.15], lit = [mx.c, mx.exa, mx.pla];
  const labels = [['cap', 'Diplômes exigés'], ['questionnaire', 'Examens'], ['people', 'Places limitées']];
  // survivors' slots inside the ring (sunflower packing)
  const surv = [];
  for (let i = 0; i < N; i++) if (THR.every((th, gI) => hash(i, 10 + gI) >= th)) surv.push(i);
  const slot = (k) => { const r = Math.sqrt((k + 0.5) / surv.length) * C.ringR * 0.72, a = k * 2.39996; return [Math.cos(a) * r, Math.sin(a) * r]; };
  // C4 moves the ring to the left and tightens it
  const c4 = sp(t - mx.d + 0.1, [90, 18]);
  const ringX = lerp(C.ringX, C.c4x, c4), ringY = lerp(C.ringY, C.c4y, c4) - sp(t - mx.more, [90, 15]) * 70 * u;
  const tight = lerp(1, 0.84, sp(t - mx.d, [120, 16]));
  g.save(); g.globalAlpha *= sIn;
  // gates
  C.gates.forEach((gp, j) => {
    const s = clamp(sp(t - gateT[j], [120, 18])) * (1 - sOut), l = clamp(sp(t - lit[j], SNAP)) * (1 - sOut);
    if (s <= 0.01) return;
    const [ax, ay] = P2(gp, C.a0 - 20 * u), [bx, by] = P2(gp, lerp(C.a0 - 20 * u, C.a1 + 20 * u, s));
    g.strokeStyle = mixColor(P.slate, P.amber, l); g.lineWidth = 8 * u; g.lineCap = 'round';
    g.setLineDash([46 * u, 22 * u]); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); g.setLineDash([]);
    const [lx, ly] = V ? [C.a1 + 56 * u, gp + 12 * u] : [gp, j === 1 ? C.a1 + 74 * u : C.a0 - 60 * u];
    g.save(); g.globalAlpha *= l;
    const tw = measure(S, labels[j][1], 34, 700);
    const x0 = V ? lx : lx - (tw + 60 * u) / 2;
    icon(S, labels[j][0], x0 + 22 * u, ly - 10 * u, 18 * u, sp(t - lit[j], [60, 15]), { color: P.amber, width: 4 });
    S.text(labels[j][1], x0 + 56 * u, ly, { size: 34, weight: 700, color: P.ink });
    g.restore();
  });
  // dots
  let k = 0;
  for (let i = 0; i < N; i++) {
    const ts = t0 + i * 0.06;
    if (t < ts) continue;
    const a = lerp(C.a0 + 30 * u, C.a1 - 30 * u, hash(i, 3)) + noise(t * 0.8 + i, 50 + i) * 12 * u;
    let fail = -1;
    for (let gI = 0; gI < 3; gI++) if (hash(i, 10 + gI) < THR[gI]) { fail = gI; break; }
    const sNow = C.s0 + (t - ts) * speed;
    if (fail >= 0) {
      const sg = C.gates[fail] - 18 * u, tHit = ts + (sg - C.s0) / speed;
      const back = Math.max(0, t - tHit), s = t < tHit ? sNow : sg - 60 * u * (1 - Math.exp(-back * 5));
      const fade = 1 - 0.75 * range(t, tHit, tHit + 0.6);
      const [x, y] = P2(s, a);
      g.save(); g.fillStyle = mixColor(P.sky, P.slate, range(t, tHit, tHit + 0.3)); g.globalAlpha *= clamp(fade * (1 - sOut));
      circle(g, x, y, 11 * u); g.fill(); g.restore();
    } else {
      const kk = k++;
      const tEnd = ts + (C.s1 - C.s0) / speed;
      const [sx, sy] = slot(kk);
      let x, y;
      if (t < tEnd) [x, y] = P2(sNow, a);
      else {
        const [ex, ey] = P2(C.s1, a), j = sp(t - tEnd, [90, 16]);
        x = lerp(ex, ringX + sx * tight, j); y = lerp(ey, ringY + sy * tight, j);
      }
      const big = sp(t - mx.d - kk * 0.02, [170, 16]);
      g.fillStyle = mixColor(P.sky, P.amber, range(t, tEnd, tEnd + 0.4));
      circle(g, x, y, (11 + 3 * big) * u); g.fill();
    }
  }
  // the ring closes: social closure
  const rc = sp(t - mx.clo + 0.15, [60, 15]);
  if (rc > 0) {
    g.strokeStyle = P.amber; g.lineWidth = 7 * u; g.lineCap = 'round';
    g.beginPath(); g.arc(ringX, ringY, C.ringR * tight, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(rc)); g.stroke();
    const la = range(t, mx.clo + 0.2, mx.clo + 0.5) * (1 - clamp(sp(t - mx.d + 0.2, [120, 20])));
    const [tx, ty, al] = V ? [ringX + C.ringR + 30 * u, ringY + 12 * u, 'left'] : [ringX, ringY + C.ringR + 56 * u, 'center'];
    S.text('Fermeture sociale', tx, ty, { size: 36, weight: 700, color: P.amber, align: al, alpha: la });
    const wa = spring(t - mx.web, ORG) * (1 - clamp(sp(t - mx.d + 0.2, [120, 20])));
    if (wa > 0) {
      const [wx, wy] = V ? [ringX + C.ringR + 30 * u, ringY + 70 * u] : [ringX, ringY + C.ringR + 112 * u];
      g.save(); g.globalAlpha *= clamp(wa * 2);
      const w = chip(S, wx, wy, 'concept de Max Weber', { size: 28, weight: 600, bg: P.card2, stroke: P.slate, align: al === 'left' ? 'left' : 'center', color: P.ink, scale: lerp(0.8, 1, clamp(wa)) });
      g.restore();
    }
  }
  // C4 · fewer practitioners → more prestige → a monopoly
  const c4a = range(t, mx.d - 0.1, mx.d + 0.3);
  if (c4a > 0) {
    const lab = range(t, mx.d + 0.1, mx.d + 0.4);
    S.text('Moins de praticiens', ringX, ringY + C.ringR * tight + 54 * u, { size: 32, weight: 600, color: P.ink, align: 'center', alpha: lab });
    // prestige meter
    const mh = S.pick({ portrait: 360, landscape: 320 }) * u, mTop = ringY - mh / 2 - 20 * u, mw = 34 * u;
    const ms = spring(t - (mx.more - 0.2), ORG), lv = 0.3 + 0.62 * sp(t - mx.more, [60, 14]);
    if (ms > 0) {
      g.save(); g.globalAlpha *= clamp(ms * 2);
      g.fillStyle = P.card; S.rrect(C.m4x - mw / 2, mTop, mw, mh, mw / 2); g.fill();
      g.fillStyle = P.amber; S.rrect(C.m4x - mw / 2, mTop + mh * (1 - lv), mw, mh * lv, mw / 2); g.fill();
      icon(S, 'star', C.m4x, mTop - 44 * u, 26 * u, sp(t - mx.more, [60, 15]), { color: P.amber, width: 4 });
      S.text('Prestige', C.m4x, mTop + mh + 44 * u, { size: 28, weight: 600, color: P.ink, align: 'center' });
      g.restore();
    }
    const gA = range(t, mx.mono - 0.3, mx.mono);
    if (gA > 0) {
      const cols = S.pick({ portrait: 6, landscape: 3 }), rows = S.pick({ portrait: 2, landscape: 4 }), sz = S.pick({ portrait: 92, landscape: 76 }) * u;
      market(t, S, C.g4x, C.g4y, cols, rows, sz, 14 * u, mx.mono + 0.05, 1, { label: 'MONOPOLE', alpha: gA });
      const gw = cols * sz + (cols - 1) * 14 * u, gh = rows * sz + (rows - 1) * 14 * u;
      const ps = spring(t - mx.mono - 0.5, [260, 16]);
      if (ps > 0) {
        g.save(); g.translate(C.g4x, C.g4y + gh / 2); g.scale(ps, ps);
        g.fillStyle = P.bg; circle(g, 0, 0, 46 * u); g.fill();
        icon(S, 'padlock', 0, -2 * u, 24 * u, 1, { color: P.amber, width: 5 });
        g.restore();
      }
    }
  }
  g.restore();
}

// The lock on a profession's door, in cross-section. Its pins are the criteria for getting in.
// A pin-tumbler lock: a key's teeth lift each pin stack, and the plug can only turn when the top of
// every key pin sits on the shear line. Geometry is in lock units (lu), y down, origin = centre of the
// shear line. Callers pass k = px per lu (already multiplied by S.u).
import { P, clamp, lerp, mixColor, circle, icon } from './kit.js';

export const PITCH = 74;
export const BLUE = [0, 2, 4, 6], AMBER = [1, 3, 5];
export const xs = (i) => (i - 3) * PITCH;
const REST = 108, DRIVER = 60, TOP = -196, HW = 300, HTOP = -214, HBOT = 142, PLUG = 276, PLUGB = 120;
const BLADE0 = -330, TIP = 272, KEYOUT = 780;

// Key pin lengths: the lock's criteria. The blue pins are the "competence" criteria; the amber ones
// (slots 1, 3, 5) only exist once the profession closes itself off.
export const CUTS = [74, 54, 88, 60, 62, 50, 80];                       // the key that fits the blue pins
export const LK = CUTS.map((c, i) => (AMBER.includes(i) ? c + 34 : c));  // amber pins can never sit on the line
export const WRONG = [50, 70, 104, 40, 92, 62, 52];                     // a key cut for other criteria

function profile(cuts, x) {
  const pts = [[BLADE0, 40]];
  for (let i = 0; i < 7; i++) {
    pts.push([xs(i) - 12, cuts[i]], [xs(i) + 12, cuts[i]]);
    if (i < 6) pts.push([xs(i) + PITCH / 2, Math.max(28, Math.min(cuts[i], cuts[i + 1]) - 14)]);
  }
  pts.push([TIP - 12, Math.min(104, cuts[6] + 14)], [TIP, 112]);
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]));
  return 112;
}
const keyDx = (key) => -(1 - key.ins) * KEYOUT + (key.shake || 0);

// Bottom of the pin stack in slot i: on the key's teeth when the blade is under it, else at rest.
function pinBottom(i, key) {
  if (!key || key.ins <= 0) return REST;
  const x = xs(i) - keyDx(key);
  if (x < BLADE0 || x > TIP) return REST;
  return Math.min(REST, profile(key.cuts, x));
}
// Where the top of key pin i sits relative to the shear line (0 = aligned).
export const pinTop = (i, key, lk = LK[i]) => pinBottom(i, key) - lk;

// Default slot states: blue chambers open and loaded, amber chambers closed.
export function slotsOf(o = {}) {
  return Array.from({ length: 7 }, (_, i) => {
    const amber = AMBER.includes(i);
    return { open: amber ? 0 : 1, pin: amber ? 0 : 1, color: amber ? P.amber : P.blue, lk: LK[i], badge: null, ...(o[i] || {}) };
  });
}

// lock(S, x, y, k, { build, alpha, slots, key: { ins, cuts, shake, bow: { glyph | icon, color } }, glow, flag })
export function lock(S, x, y, k, o = {}) {
  const { g, u } = S;
  const { build = 1, alpha = 1, slots = slotsOf(), key = null, glow = 0, flag = 0, dim = 0 } = o;
  if (build <= 0.001 || alpha <= 0.001) return;
  g.save();
  g.globalAlpha *= clamp(alpha) * clamp(build * 1.6);
  g.translate(x, y); g.scale(k * lerp(0.9, 1, build), k * lerp(0.9, 1, build));
  g.lineCap = 'round'; g.lineJoin = 'round';
  const dx = key ? keyDx(key) : 0;

  // housing and plug
  g.fillStyle = P.card; S.rrect(-HW, HTOP, HW * 2, HBOT - HTOP, 30); g.fill();
  g.fillStyle = '#243249'; S.rrect(-PLUG, 0, PLUG * 2, PLUGB, 16); g.fill();
  g.fillStyle = P.deep; g.fillRect(-HW - 1, 34, HW - PLUG + 2, 86);              // keyway mouth

  // chambers (the amber ones are drilled open from the top)
  slots.forEach((s, i) => {
    if (s.open <= 0) return;
    g.fillStyle = P.deep;
    g.fillRect(xs(i) - 24, TOP, 48, (REST + 8 - TOP) * clamp(s.open));
    if (s.open < 1) { g.fillStyle = s.color; g.globalAlpha *= 0.9; g.fillRect(xs(i) - 24, TOP + (REST + 8 - TOP) * s.open - 4, 48, 4); g.globalAlpha /= 0.9; }
  });

  // the key: blade under the pins, bow outside the lock
  if (key && key.ins > 0) {
    const a = Math.min(BLADE0, -HW - 60) + dx;
    g.fillStyle = '#CBD5E1';
    g.beginPath(); g.moveTo(BLADE0 + dx, 118);
    for (let xx = BLADE0; xx <= TIP; xx += 6) g.lineTo(xx + dx, profile(key.cuts, xx));
    g.lineTo(TIP + dx, 118); g.closePath(); g.fill();
    g.fillStyle = '#94A3B8'; g.fillRect(BLADE0 + dx, 98, TIP - BLADE0, 4);         // groove
    g.fillStyle = '#CBD5E1'; S.rrect(a - 34, 52, 40, 48, 8); g.fill();               // neck
    const bx = a - 96, by = 76, br = 64, bow = key.bow || {};
    g.fillStyle = P.card2; circle(g, bx, by, br); g.fill();
    g.strokeStyle = bow.color || '#CBD5E1'; g.lineWidth = 10; circle(g, bx, by, br); g.stroke();
    if (bow.glyph) S.text(bow.glyph, bx, by + 27 * (bow.scale || 1), { size: (78 * (bow.scale || 1)) / (u || 1), weight: 800, color: bow.color || P.ink, align: 'center', alpha: bow.glyphAlpha ?? 1 });
    if (bow.icon) icon(S, bow.icon, bx, by, 34, bow.iconP ?? 1, { color: bow.color || P.ink, width: 6 / (u || 1) });
  }

  // pins: key pin (coloured, pointed), driver pin, spring
  slots.forEach((s, i) => {
    if (s.open <= 0 || s.pin <= 0) return;
    const drop = (1 - clamp(s.pin)) * -260;
    const bot = pinBottom(i, key) + drop + (s.jiggle || 0), top = bot - s.lk, x0 = xs(i);
    const blocked = flag > 0 && key && Math.abs(top) > 3;
    g.save(); g.globalAlpha *= clamp(s.pin * 1.4) * (1 - dim * 0.6);
    g.beginPath(); g.rect(x0 - 24, TOP - 300, 48, REST + 8 - TOP + 300); g.clip();
    // spring
    const sTop = TOP, sBot = top - DRIVER, n = 7;
    g.strokeStyle = '#64748B'; g.lineWidth = 3.5;
    g.beginPath(); g.moveTo(x0, sTop);
    for (let j = 1; j <= n * 2; j++) g.lineTo(x0 + (j % 2 ? -13 : 13) * (j === n * 2 ? 0 : 1), lerp(sTop, sBot, j / (n * 2)));
    g.stroke();
    // driver
    g.fillStyle = blocked && top > 0 ? mixColor('#94A3B8', P.amber, flag) : '#94A3B8';
    S.rrect(x0 - 19, top - DRIVER, 38, DRIVER - 3, 8); g.fill();
    // key pin
    g.fillStyle = blocked && top < 0 ? mixColor(s.color, P.amber, flag) : s.color;
    g.beginPath(); g.moveTo(x0 - 19, top + 6); g.quadraticCurveTo(x0 - 19, top, x0 - 13, top);
    g.lineTo(x0 + 13, top); g.quadraticCurveTo(x0 + 19, top, x0 + 19, top + 6);
    g.lineTo(x0 + 19, bot - 12); g.lineTo(x0, bot); g.lineTo(x0 - 19, bot - 12); g.closePath(); g.fill();
    g.restore();
  });

  // shear line
  g.save();
  g.setLineDash([10, 9]); g.strokeStyle = '#475569'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(-PLUG, 0); g.lineTo(PLUG, 0); g.stroke();
  g.restore();
  if (glow > 0) {
    g.save(); g.globalAlpha *= clamp(glow);
    g.shadowColor = P.amber; g.shadowBlur = 24 * k;
    g.strokeStyle = P.amber; g.lineWidth = 6;
    g.beginPath(); g.moveTo(-PLUG, 0); g.lineTo(lerp(-PLUG, PLUG, clamp(glow * 1.3)), 0); g.stroke();
    g.restore();
  }
  // blocked pins get an "×" on the line
  if (flag > 0 && key) slots.forEach((s, i) => {
    if (s.open <= 0 || s.pin <= 0) return;
    if (Math.abs(pinBottom(i, key) - s.lk) <= 3) return;
    g.save(); g.translate(xs(i), 0); g.scale(flag, flag);
    g.fillStyle = P.amber; circle(g, 0, 0, 17); g.fill();
    g.strokeStyle = P.bg; g.lineWidth = 5;
    g.beginPath(); g.moveTo(-7, -7); g.lineTo(7, 7); g.moveTo(7, -7); g.lineTo(-7, 7); g.stroke();
    g.restore();
  });
  // housing edge on top so the pins read as inside it
  g.strokeStyle = '#475569'; g.lineWidth = 3; S.rrect(-HW, HTOP, HW * 2, HBOT - HTOP, 30); g.stroke();

  // badges above the chambers: criteria icons
  slots.forEach((s, i) => {
    const b = s.badge;
    if (!b || !(b.p > 0)) return;
    const sc = clamp(b.p * 1.2), bx = xs(i), by = HTOP - 58;
    g.save(); g.translate(bx, by); g.scale(sc, sc);
    g.fillStyle = b.fill || P.card2; circle(g, 0, 0, 34); g.fill();
    g.strokeStyle = b.color || s.color; g.lineWidth = 4; circle(g, 0, 0, 34); g.stroke();
    if (b.glyph) S.text(b.glyph, 0, 15, { size: 42 / (u || 1), weight: 800, color: b.color || s.color, align: 'center' });
    if (b.icon) icon(S, b.icon, 0, 0, 18, b.draw ?? 1, { color: b.color || s.color, width: 4 / (u || 1) });
    g.restore();
    g.save(); g.strokeStyle = b.color || s.color; g.globalAlpha *= 0.5 * clamp(b.p); g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(bx, by + 36); g.lineTo(bx, HTOP); g.stroke(); g.restore();
  });
  g.restore();
}

// Map a point from lock units to px.
export const at = (x, y, k, lx, ly) => [x + lx * k, y + ly * k];
// Key bow centre (lu) for a given insertion.
export const bowAt = (key) => [Math.min(BLADE0, -HW - 60) + keyDx(key) - 96, 76];
export const LOCKBOX = { HW, HTOP, HBOT, BADGE: HTOP - 58 };

// Doors: every profession is a door. The wall holds professions regulated in Canada (named, sealed)
// and blank doors for the many occupations that are not.
import { P, clamp, lerp, mixColor, circle, icon, fitSize } from './kit.js';

const HEROES = [['Médecine', 'stethoscope'], ['Droit', 'scales'], ['Enseignement', 'board']];
const NAMED = ['Soins infirmiers', 'Pharmacie', 'Génie', 'Architecture', 'Dentisterie', 'Psychologie', 'Comptabilité',
  'Travail social', 'Physiothérapie', 'Ergothérapie', 'Optométrie', 'Arpentage', 'Diététique'];

export function wall(S) {
  const { W, u } = S;
  const G = S.pick({
    portrait: { cols: 5, rows: 4, dw: 150 * u, dh: 228 * u, gx: 36 * u, gy: 72 * u, y0: 360 * u, heroRow: 1, ghosts: [0, 9, 14, 19] },
    landscape: { cols: 7, rows: 3, dw: 128 * u, dh: 190 * u, gx: 62 * u, gy: 66 * u, y0: 150 * u, heroRow: 1, ghosts: [0, 6, 13, 14, 20] },
  });
  const tw = G.cols * G.dw + (G.cols - 1) * G.gx, x0 = (W - tw) / 2;
  const heroCols = [Math.floor(G.cols / 2) - 1, Math.floor(G.cols / 2), Math.floor(G.cols / 2) + 1];
  const doors = [];
  let n = 0;
  for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) {
    const idx = r * G.cols + c, hero = r === G.heroRow ? heroCols.indexOf(c) : -1;
    const ghost = hero < 0 && G.ghosts.includes(idx);
    const name = hero >= 0 ? HEROES[hero][0] : ghost ? null : NAMED[n++ % NAMED.length];
    doors.push({ x: x0 + c * (G.dw + G.gx), y: G.y0 + r * (G.dh + G.gy), w: G.dw, h: G.dh, r, c, idx, hero, ghost, name,
      icon: hero >= 0 ? HEROES[hero][1] : null });
  }
  const heroes = heroCols.map((c) => doors[G.heroRow * G.cols + c]);
  const th = G.rows * G.dh + (G.rows - 1) * G.gy;
  return { ...G, doors, heroes, x0, tw, th, cx: x0 + tw / 2, cy: G.y0 + th / 2 };
}

// One door at (x, y) (top-left), w × h. Drawn in the current transform.
export function door(S, d, o = {}) {
  const { g, u } = S;
  const { build = 1, iconP = 0, seal = 0, light = 0, alpha = 1, xray = 0, label = 1, name = d.name, nameSize = 24, edge = null } = o;
  if (build <= 0.001 || alpha <= 0.001) return;
  const { x, y, w, h } = d;
  g.save(); g.globalAlpha *= clamp(alpha) * clamp(build * 1.5);
  g.translate(x + w / 2, y + h); g.scale(1, lerp(0.7, 1, clamp(build, 0, 1.2))); g.translate(-(x + w / 2), -(y + h));
  g.lineJoin = 'round';
  if (d.ghost) {
    g.setLineDash([8 * u, 8 * u]); g.strokeStyle = '#334155'; g.lineWidth = 2.5 * u;
    S.rrect(x, y, w, h, 10 * u); g.stroke(); g.setLineDash([]);
    g.restore(); return;
  }
  if (light > 0) {                                     // light spilling under the door
    const lg = g.createRadialGradient(x + w / 2, y + h, 0, x + w / 2, y + h, w * 0.9);
    lg.addColorStop(0, `rgba(245,158,11,${0.32 * light})`); lg.addColorStop(1, 'rgba(245,158,11,0)');
    g.fillStyle = lg; g.fillRect(x - w * 0.5, y + h - w * 0.2, w * 2, w * 0.9);
    g.fillStyle = `rgba(245,158,11,${0.9 * light})`; g.fillRect(x + 6 * u, y + h - 3 * u, w - 12 * u, 3 * u);
  }
  // frame
  g.strokeStyle = xray ? mixColor('#475569', P.sky, xray) : '#475569'; g.lineWidth = 3 * u;
  g.beginPath(); g.moveTo(x - 7 * u, y + h); g.lineTo(x - 7 * u, y - 7 * u); g.lineTo(x + w + 7 * u, y - 7 * u); g.lineTo(x + w + 7 * u, y + h); g.stroke();
  // leaf
  g.fillStyle = xray ? mixColor(P.card, P.deep, xray) : P.card; S.rrect(x, y, w, h, 8 * u); g.fill();
  g.strokeStyle = edge || (xray ? P.sky : '#3B4A61'); g.lineWidth = 2.5 * u; S.rrect(x, y, w, h, 8 * u); g.stroke();
  g.strokeStyle = xray ? 'rgba(147,197,253,0.5)' : '#334155'; g.lineWidth = 2 * u;
  S.rrect(x + 0.13 * w, y + 0.08 * h, 0.6 * w, 0.4 * h, 5 * u); g.stroke();
  S.rrect(x + 0.13 * w, y + 0.56 * h, 0.6 * w, 0.34 * h, 5 * u); g.stroke();
  // handle, or in x-ray the lock behind it
  const hx = x + 0.86 * w, hy = y + 0.52 * h;
  if (xray > 0) {
    g.save(); g.globalAlpha *= xray;
    g.strokeStyle = P.sky; g.lineWidth = 2 * u;
    S.rrect(hx - 0.1 * w, hy - 0.12 * w, 0.2 * w, 0.2 * w, 3 * u); g.stroke();
    for (let i = 0; i < 4; i++) { const px = hx - 0.07 * w + i * 0.047 * w; g.beginPath(); g.moveTo(px, hy - 0.1 * w); g.lineTo(px, hy + 0.02 * w); g.stroke(); }
    g.beginPath(); g.moveTo(hx - 0.09 * w, hy - 0.01 * w); g.lineTo(hx + 0.09 * w, hy - 0.01 * w); g.stroke();
    g.restore();
  }
  g.fillStyle = mixColor(P.dim, P.sky, xray); circle(g, hx, hy, 0.045 * w); g.fill();
  if (d.icon && iconP > 0) icon(S, d.icon, x + 0.43 * w, y + 0.28 * h, 0.22 * w, iconP, { color: P.ink, width: 0.022 * w / u });
  // seal: stamped on, overshoots and settles
  if (seal > 0) {
    const sx = x + w - 0.02 * w, sy = y + 0.04 * h, sr = 0.17 * w * lerp(1.7, 1, clamp(seal));
    g.save(); g.globalAlpha *= clamp(seal * 2);
    g.fillStyle = P.amber; circle(g, sx, sy, sr); g.fill();
    g.strokeStyle = P.bg; g.lineWidth = 0.028 * w; g.lineCap = 'round';
    g.beginPath(); g.moveTo(sx - sr * 0.38, sy + sr * 0.02); g.lineTo(sx - sr * 0.1, sy + sr * 0.3); g.lineTo(sx + sr * 0.42, sy - sr * 0.28); g.stroke();
    g.restore();
  }
  g.restore();
  if (name && label > 0) {
    const sz = Math.min(nameSize, fitSize(S, name, 600, 'ui', w + 30 * u, nameSize));
    S.text(name, x + w / 2, y + h + 38 * u * (nameSize / 24), { size: sz, weight: 600, color: xray ? P.sky : P.ink, align: 'center', alpha: alpha * clamp(build) * label });
  }
}

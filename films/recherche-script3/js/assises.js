// The four foundations of institutional ethnography.
// 1 texts have power: a giant form, its field drops around a person whose outline morphs into the box;
//   then the same texts everywhere: one form copied into nine offices whose people act in sync.
// 2 situated knowledge, organized by texts: an architectural floor plan, local knowledge per room, documents in the corridors.
// 3 ruling relations, external influences: the week planner hangs from strings, like a marionette.
// 4 confront the discourses: lived experience vs the institution's text, gaps marked, the text revised.
import { P, ORG, TYPE, SNAP, HEAVY, sp, spring, clamp, lerp, range, track, hash, noise, swapAlpha, typed, mixColor,
  measure, fitSize, circle, icon, numeral, lay } from './kit.js';
import { L, T } from './timing.js';
import { PAPER, INK, INK2, RULE, paper, field, checkbox, stamp, notebook, figure, personPts, rectPts, fillPts, cadre, tag, arrow, along } from './paper.js';

const { f1, f1x, f2, f3, f4 } = L;

export function headF(t, S, n, title, tIn, of = 4) {
  const { g, W, u } = S;
  const Ly = lay(S);
  numeral(S, n, Ly.nx, Ly.ny, { rise: (1 - sp(t - tIn - 0.05)) * 300 * u, clip: true, of });
  const ts = fitSize(S, title, 600, 'display', S.pick({ portrait: Ly.tMax, landscape: 660 * u }), Ly.ts * 0.86);
  g.save(); g.beginPath(); g.rect(0, Ly.ty - ts * u, W, ts * u * 1.3); g.clip();
  S.text(title, Ly.tx, Ly.ty + (1 - sp(t - tIn - 0.35)) * ts * u * 1.2, { size: ts, weight: 600, face: 'display', color: P.ink });
  g.restore();
  const uw = measure(S, title, ts, 600, 'display') * sp(t - tIn - 0.55, [170, 26]);
  if (uw > 0) { g.fillStyle = P.amber; S.rrect(Ly.tx, Ly.ty + 20 * u, uw, 8 * u, 4 * u); g.fill(); }
}
export function zone(S) {
  const { W, u } = S;
  return S.pick({ portrait: { x: 84 * u, y: 650 * u, w: W - 168 * u, h: 900 * u }, landscape: { x: 900 * u, y: 110 * u, w: 900 * u, h: 790 * u } });
}

// ════ 1 · the power of texts ══════════════════════════════════════════════════
export function assise1(t, S) {
  const { g, W, u } = S;
  const Z = zone(S), m = f1.marks, mx = f1x.marks;
  headF(t, S, 1, 'Le pouvoir des textes', T.F1);
  const outA = clamp(sp(t - (mx.a - 0.3), [130, 22]));
  if (outA < 1) {
    g.save(); g.globalAlpha *= 1 - outA; g.translate(0, -outA * 160 * u);
    const fw = Z.w * S.pick({ portrait: 0.86, landscape: 0.7 }), fh = Z.h * 0.46, fx = Z.x + (Z.w - fw) / 2;
    const dn = spring(t - (m.txt - 0.1), [120, 15]), loom = sp(t - m.pow, [60, 15]);
    const fy = Z.y - (1 - dn) * 500 * u;
    // the shadow it casts
    if (loom > 0) {
      const sg = g.createLinearGradient(0, fy + fh, 0, Z.y + Z.h);
      sg.addColorStop(0, `rgba(2,6,23,${0.55 * loom})`); sg.addColorStop(1, 'rgba(2,6,23,0)');
      g.fillStyle = sg; g.beginPath(); g.moveTo(fx, fy + fh); g.lineTo(fx + fw, fy + fh); g.lineTo(fx + fw * 0.85, Z.y + Z.h); g.lineTo(fx + fw * 0.15, Z.y + Z.h); g.closePath(); g.fill();
    }
    const sc = 1 + 0.06 * loom;
    const yy = paper(S, fx, fy, fw, fh, { title: 'FORMULAIRE', sub: 'À REMPLIR OBLIGATOIREMENT', scale: sc, alpha: clamp(dn * 2), seed: 41 });
    g.save(); g.translate(fx + fw / 2, fy + fh / 2); g.scale(sc, sc); g.translate(-fx - fw / 2, -fy - fh / 2); g.globalAlpha *= clamp(dn * 2);
    const iw = (fw - 72 * u) / 2;
    field(S, fx + 24 * u, yy + 24 * u, iw, 'NOM', { bars: 2 });
    field(S, fx + 48 * u + iw, yy + 24 * u, iw, 'STATUT', { bars: 1 });
    const boxW = fw * 0.34, boxH = fh * 0.34, bx = fx + (fw - boxW) / 2, by = yy + 110 * u;
    const hot = sp(t - m.ind + 0.2, SNAP);
    S.text('CASE 3', bx, by - 8 * u, { size: 18, weight: 700, face: 'mono', color: mixColor(INK2, P.blue, hot) });
    g.strokeStyle = mixColor('#94A3B8', P.blue, hot); g.lineWidth = (2 + 3 * hot) * u; g.strokeRect(bx, by, boxW, boxH);
    g.restore();
    // the person, organic, then pressed into the field's shape
    const ph = Z.h * 0.42, px = Z.x + Z.w / 2, py = Z.y + Z.h - 20 * u;
    const pa = spring(t - (m.txt - 0.4), ORG);
    const rw = ph * 0.42, rh = ph * 0.86, rx = px - rw / 2, ry = py - rh;
    const proj = sp(t - m.ind, [90, 16]);
    if (proj > 0) {                                           // the box comes down from the form
      const sy = lerp(yy + 110 * u, ry, proj), sh = lerp(fh * 0.34, rh, proj), sw = lerp(fw * 0.34, rw, proj);
      cadre(S, px - sw / 2, sy, sw, sh, { color: P.blue, alpha: proj, bw: 6, label: proj > 0.9 ? 'CASE 3' : null });
      g.strokeStyle = `rgba(59,130,246,${0.25 * (1 - proj) + 0.1})`; g.lineWidth = 2 * u; g.setLineDash([8 * u, 8 * u]);
      g.beginPath(); g.moveTo(fx + (fw - fw * 0.34) / 2, yy + 110 * u + fh * 0.34); g.lineTo(px - sw / 2, sy); g.moveTo(fx + (fw + fw * 0.34) / 2, yy + 110 * u + fh * 0.34); g.lineTo(px + sw / 2, sy); g.stroke(); g.setLineDash([]);
    }
    const mo = sp(t - m.conf, [70, 15]);
    const A = personPts(px, py, ph * clamp(pa, 0, 1.06)), B = rectPts(rx + 6 * u, ry + 6 * u, rw - 12 * u, rh - 12 * u, A.length);
    g.save(); g.globalAlpha *= clamp(pa * 2);
    g.fillStyle = mixColor(P.amber, '#D97706', mo); fillPts(g, A.map(([x, y], i) => [lerp(x, B[i][0], mo), lerp(y, B[i][1], mo)]));
    g.restore();
    if (mo > 0.6) tag(S, px + rw / 2 + 20 * u, ry + 40 * u, 'CONFORME', { color: P.sky, alpha: range(mo, 0.6, 1), fill: P.bg });
    g.restore();
  }
  // 1b · the same texts, everywhere
  const inB = range(t, mx.a - 0.2, mx.a + 0.1);
  if (inB > 0) {
    g.save(); g.globalAlpha *= inB;
    const docs = [['FORMULAIRE', mx.a, 'form', 'À REMPLIR'], ['RÈGLEMENT', mx.b, 'rule', 'D’EXAMEN'], ['POLITIQUE', mx.c, 'policy', 'D’EMBAUCHE']];
    const shrink = sp(t - mx.d + 0.1, [110, 20]);
    const dw = Z.w * lerp(0.36, 0.26, shrink), dh = dw * 1.2;
    docs.forEach(([title, tm, kind, sub], i) => {
      const s = spring(t - tm + 0.1, ORG);
      if (s <= 0) return;
      const fanX = Z.x + Z.w / 2 + (i - 1) * dw * 0.8, fanY = Z.y + lerp(80, 10, shrink) * u;
      const x = fanX - dw / 2, y = fanY + (1 - s) * 200 * u, rot = (i - 1) * 0.12 * (1 - shrink * 0.5);
      paper(S, x, y, dw, dh, { title, sub, titleSize: S.pick({ portrait: 22, landscape: 20 }), lines: kind === 'form' ? 0 : 5, rot, alpha: clamp(s * 2), seed: 50 + i, band: i === 0 ? P.blue : i === 1 ? P.sky : P.light });
      if (kind === 'form') {
        g.save(); g.translate(x + dw / 2, y + dh / 2); g.rotate(rot); g.translate(-x - dw / 2, -y - dh / 2); g.globalAlpha *= clamp(s * 2);
        for (let k = 0; k < 4; k++) { g.strokeStyle = '#94A3B8'; g.lineWidth = 2 * u; g.strokeRect(x + 22 * u, y + (110 + k * 46) * u * (dw / (Z.w * 0.36)), dw - 44 * u, 30 * u * (dw / (Z.w * 0.36))); }
        g.restore();
      }
    });
    // nine offices, one form each, people acting in sync
    const ga = sp(t - mx.d, [90, 16]);
    if (ga > 0) {
      const gy = Z.y + Z.h * 0.42, gh = Z.h * 0.56, cols = 3, cw = Z.w / cols, rh = gh / 3;
      const beat = (t - mx.act) > 0 ? Math.max(0, Math.sin((t - mx.act) * Math.PI * 2 * 1.0)) : 0;
      for (let r = 0; r < 3; r++) for (let c = 0; c < cols; c++) {
        const k = r * cols + c, s = spring(t - (mx.d + k * 0.05), [220, 16]);
        if (s <= 0) continue;
        const ox = Z.x + c * cw + 10 * u, oy = gy + r * rh + 10 * u, ow = cw - 20 * u, oh = rh - 20 * u;
        g.save(); g.globalAlpha *= clamp(s * 2);
        g.fillStyle = P.card; S.rrect(ox, oy, ow, oh, 14 * u); g.fill();
        g.strokeStyle = P.slate; g.lineWidth = 2 * u; S.rrect(ox, oy, ow, oh, 14 * u); g.stroke();
        S.text(['MONTRÉAL', 'QUÉBEC', 'LAVAL', 'GATINEAU', 'SHERBROOKE', 'LÉVIS', 'TROIS-RIVIÈRES', 'SAGUENAY', 'LONGUEUIL'][k], ox + 14 * u, oy + 28 * u, { size: 15, weight: 700, face: 'mono', color: P.dim, tracking: 0.06 });
        // the copy of the form arrives
        const cp = sp(t - (mx.same + k * 0.06), [150, 18]);
        if (cp > 0) {
          const sx = Z.x + Z.w / 2 - 20 * u, sy = Z.y + 60 * u, tx = ox + ow * 0.62, ty = oy + oh * 0.3;
          const fxp = lerp(sx, tx, cp), fyp = lerp(sy, ty, cp) - Math.sin(cp * Math.PI) * 60 * u;
          paper(S, fxp, fyp, ow * 0.28, oh * 0.5, { band: P.blue, lines: 2, lineGap: 18, fold: false, shadow: 0.5, seed: 60 + k });
        }
        // a person at each desk, stamping on the same beat
        const ppx = ox + ow * 0.3, ppy = oy + oh - 12 * u;
        figure(S, ppx, ppy, oh * 0.6, { color: P.amber, t, seed: k });
        if (t > mx.act) {
          const sy2 = oy + oh * 0.5 - beat * 16 * u;
          g.fillStyle = P.sky; g.fillRect(ppx + 18 * u, sy2 - 10 * u, 22 * u, 10 * u); g.fillRect(ppx + 26 * u, sy2 - 24 * u, 6 * u, 14 * u);
        }
        g.restore();
      }
      if (t > mx.act) tag(S, Z.x + Z.w / 2, gy - 22 * u, 'MÊMES TEXTES · MÊMES GESTES', { color: P.sky, align: 'center', fill: P.bg, alpha: range(t, mx.act, mx.act + 0.3) });
    }
    g.restore();
  }
}

// ════ 2 · situated knowledge, organized by texts ═════════════════════════════
export function assise2(t, S) {
  const { g, u } = S;
  const Z = zone(S), m = f2.marks;
  headF(t, S, 2, 'Des savoirs situés', T.F2);
  const x0 = Z.x + 10 * u, y0 = Z.y + 20 * u, w = Z.w - 20 * u, h = Z.h * 0.86;
  const cor = h * 0.16, rw = w / 2, rh = (h - cor) / 2;
  const draw = sp(t - (T.F2 + 0.2), [40, 14]);
  const wall = (ax, ay, bx, by, k) => {
    const p = clamp(draw * 5 - k * 0.3);
    if (p <= 0) return;
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(lerp(ax, bx, p), lerp(ay, by, p)); g.stroke();
  };
  const glow = sp(t - m.esp, [90, 16]);
  g.save();
  g.strokeStyle = mixColor('#94A3B8', P.blue, glow); g.lineWidth = 7 * u; g.lineCap = 'square';
  // outer walls with an entrance gap
  wall(x0, y0, x0 + w, y0, 0); wall(x0 + w, y0, x0 + w, y0 + h, 1); wall(x0 + w, y0 + h, x0 + w * 0.56, y0 + h, 2); wall(x0 + w * 0.44, y0 + h, x0, y0 + h, 2); wall(x0, y0 + h, x0, y0, 3);
  // inner walls: rooms above and below the corridor, with door gaps
  g.lineWidth = 5 * u;
  wall(x0, y0 + rh, x0 + rw * 0.35, y0 + rh, 4); wall(x0 + rw * 0.6, y0 + rh, x0 + rw * 1.35, y0 + rh, 4); wall(x0 + rw * 1.6, y0 + rh, x0 + w, y0 + rh, 4);
  wall(x0, y0 + rh + cor, x0 + rw * 0.35, y0 + rh + cor, 5); wall(x0 + rw * 0.6, y0 + rh + cor, x0 + rw * 1.35, y0 + rh + cor, 5); wall(x0 + rw * 1.6, y0 + rh + cor, x0 + w, y0 + rh + cor, 5);
  wall(x0 + rw, y0, x0 + rw, y0 + rh, 6); wall(x0 + rw, y0 + rh + cor, x0 + rw, y0 + h, 6);
  // door swings
  g.lineWidth = 2 * u; g.strokeStyle = `rgba(148,163,184,${0.6 * clamp(draw * 2 - 0.8)})`;
  [[x0 + rw * 0.35, y0 + rh, -1], [x0 + rw * 1.35, y0 + rh, -1], [x0 + rw * 0.35, y0 + rh + cor, 1], [x0 + rw * 1.35, y0 + rh + cor, 1]].forEach(([dx, dy, s]) => {
    const r = rw * 0.25; g.beginPath(); g.moveTo(dx, dy); g.lineTo(dx, dy + s * r); g.arc(dx, dy, r, s > 0 ? Math.PI / 2 : -Math.PI / 2, s > 0 ? 0 : 0, s < 0); g.stroke();
  });
  g.restore();
  // furniture: desks, exam rows, cabinets (thin outlines)
  const fa = clamp(draw * 2 - 1);
  g.save(); g.globalAlpha *= fa; g.strokeStyle = 'rgba(148,163,184,0.55)'; g.lineWidth = 2 * u;
  g.strokeRect(x0 + rw * 0.15, y0 + rh * 0.55, rw * 0.5, rh * 0.18);                                  // accueil counter
  g.strokeRect(x0 + rw * 1.2, y0 + rh * 0.3, rw * 0.3, rh * 0.2); g.strokeRect(x0 + rw * 1.6, y0 + rh * 0.3, rw * 0.3, rh * 0.2);   // bureau desks
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) g.strokeRect(x0 + rw * (0.1 + c * 0.22), y0 + rh + cor + rh * (0.35 + r * 0.3), rw * 0.15, rh * 0.14);   // exam rows
  for (let c = 0; c < 3; c++) g.strokeRect(x0 + rw * (1.1 + c * 0.14), y0 + rh + cor + rh * 0.62, rw * 0.11, rh * 0.28);   // RH cabinets
  g.restore();
  const ROOMS = [['ACCUEIL', 0, 0, 'people', 'les files du matin'], ['BUREAU', 1, 0, 'clipboard', 'les dossiers urgents'],
    ['SALLE D’EXAMEN', 0, 1, 'calendar', 'les horaires réels'], ['RESSOURCES HUMAINES', 1, 1, 'doc', 'les exceptions']];
  ROOMS.forEach(([name, cx, cy, ic, know], i) => {
    const rx = x0 + cx * rw, ry = y0 + cy * (rh + cor);
    S.text(name, rx + 18 * u, ry + 34 * u, { size: S.pick({ portrait: 19, landscape: 18 }), weight: 700, face: 'mono', color: P.dim, tracking: 0.08, alpha: fa });
    // local knowledge, situated in the room
    const s = spring(t - (m.sav - 0.1 + i * 0.15), [240, 15]);
    if (s <= 0) return;
    const px = rx + rw * 0.5, py = ry + rh * 0.86;
    figure(S, px - rw * 0.24, py, rh * 0.42 * clamp(s, 0, 1.08), { color: P.amber, t, seed: i });
    const bx = px - rw * 0.06, by = ry + rh * 0.5, bw = measure(S, know, 21, 600) + 70 * u;
    g.save(); g.globalAlpha *= clamp(s * 2); g.translate(bx, by); g.scale(clamp(s, 0, 1.1), clamp(s, 0, 1.1));
    g.fillStyle = P.amber; S.rrect(0, -24 * u, Math.min(bw, rw * 0.62), 48 * u, 14 * u); g.fill();
    icon(S, ic, 24 * u, 0, 11 * u, 1, { color: P.bg, width: 3 });
    g.save(); g.beginPath(); g.rect(0, -24 * u, Math.min(bw, rw * 0.62) - 8 * u, 48 * u); g.clip();
    S.text(know, 44 * u, 8 * u, { size: 21, weight: 600, color: P.bg }); g.restore();
    g.restore();
  });
  // texts organize them: documents travel the corridor from room to room
  const ta = sp(t - m.org, [70, 16]);
  if (ta > 0) {
    const cyc = y0 + rh + cor / 2;
    g.save(); g.globalAlpha *= ta;
    g.strokeStyle = 'rgba(147,197,253,0.6)'; g.setLineDash([10 * u, 9 * u]); g.lineWidth = 3 * u;
    g.beginPath(); g.moveTo(x0 + rw * 0.48, y0 + rh * 0.62); g.lineTo(x0 + rw * 0.48, cyc); g.lineTo(x0 + rw * 1.48, cyc); g.lineTo(x0 + rw * 1.48, y0 + rh * 0.62);
    g.moveTo(x0 + rw * 0.48, cyc); g.lineTo(x0 + rw * 0.48, y0 + rh + cor + rh * 0.4); g.moveTo(x0 + rw * 1.48, cyc); g.lineTo(x0 + rw * 1.48, y0 + rh + cor + rh * 0.4); g.stroke(); g.setLineDash([]);
    for (let k = 0; k < 4; k++) {
      const ph = ((t - m.org) * 0.5 + k / 4) % 1, x = lerp(x0 + rw * 0.2, x0 + rw * 1.8, ph);
      paper(S, x - 22 * u, cyc - 28 * u, 44 * u, 56 * u, { band: P.blue, fold: false, shadow: 0.4, lines: 2, lineGap: 14, seed: 70 + k });
    }
    g.restore();
  }
  if (glow > 0) tag(S, x0 + w / 2, y0 + h + 44 * u, 'ESPACE INSTITUTIONNEL', { color: P.blue, align: 'center', alpha: glow });
}

// ════ 3 · ruling relations, like strings ═════════════════════════════════════
export function assise3(t, S) {
  const { g, u } = S;
  const Z = zone(S), m = f3.marks;
  headF(t, S, 3, 'Des rapports de régulation', T.F3);
  const top = Z.y + 20 * u, mid = Z.y + Z.h * 0.24, gy = Z.y + Z.h * 0.46, gh = Z.h * 0.5;
  const sway = Math.sin(t * 1.4) * 8 * u * sp(t - m.reg, [60, 16]);
  // planner
  const days = 7, rows = 5, cw = Z.w / days, rh = gh / rows;
  g.fillStyle = P.card; S.rrect(Z.x, gy, Z.w, gh, 16 * u); g.fill();
  g.strokeStyle = 'rgba(148,163,184,0.16)'; g.lineWidth = 1.5 * u;
  for (let i = 1; i < days; i++) { g.beginPath(); g.moveTo(Z.x + i * cw, gy); g.lineTo(Z.x + i * cw, gy + gh); g.stroke(); }
  for (let r = 1; r < rows; r++) { g.beginPath(); g.moveTo(Z.x, gy + r * rh); g.lineTo(Z.x + Z.w, gy + r * rh); g.stroke(); }
  ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach((d, i) => S.text(d, Z.x + (i + 0.5) * cw, gy - 14 * u, { size: 22, weight: 700, color: P.dim, align: 'center' }));
  // the regulators and the influences above them
  const REG = [['Horaires', 'calendar'], ['Règlements', 'doc'], ['Évaluations', 'clipboard']], EXT = ['Lois', 'Politiques', 'Marché'];
  const bw = Z.w / 3 - 24 * u;
  const regX = (i) => Z.x + 12 * u + i * (bw + 24 * u);
  // experiences: loose blocks that the strings pull into the grid
  const BLOCKS = [[0, 0, 2, 1], [1, 1, 2, 0], [2, 0, 3, 2], [3, 2, 2, 1], [4, 0, 2, 0], [5, 1, 3, 2], [6, 3, 2, 1], [2, 3, 2, 0], [0, 3, 2, 2]];
  const snap = sp(t - m.reg - 0.2, [110, 14]);
  BLOCKS.forEach(([d, r0, n, reg], k) => {
    const s = spring(t - (m.exp - 0.1 + k * 0.06), [220, 16]);
    if (s <= 0) return;
    const gx = Z.x + d * cw + 5 * u, gyb = gy + r0 * rh + 5 * u, w = cw - 10 * u, h = n * rh - 10 * u;
    const lx = Z.x + Z.w * hash(k, 3) * 0.85, ly = gy + gh * hash(k, 4) * 0.6;
    const x = lerp(lx, gx, snap) + sway * (1 - snap * 0.5), y = lerp(ly, gyb, snap), rot = (1 - snap) * (hash(k, 5) - 0.5) * 0.9;
    // string from its regulator
    if (snap > 0) {
      const ax = regX(reg) + bw / 2 + sway, ay = mid + 64 * u;
      g.strokeStyle = 'rgba(226,232,240,0.55)'; g.lineWidth = 1.5 * u;
      g.beginPath(); g.moveTo(ax, ay); g.lineTo(lerp(ax, x + w / 2, clamp(snap * 1.3)), lerp(ay, y, clamp(snap * 1.3))); g.stroke();
    }
    g.save(); g.globalAlpha *= clamp(s * 2); g.translate(x + w / 2, y + h / 2); g.rotate(rot); g.scale(clamp(s, 0, 1.1), clamp(s, 0, 1.1));
    g.fillStyle = P.amber; S.rrect(-w / 2, -h / 2, w, h, 8 * u); g.fill();
    g.fillStyle = 'rgba(15,23,42,0.35)'; circle(g, -w / 2 + 10 * u, -h / 2 + 10 * u, 4 * u); g.fill();
    g.restore();
  });
  REG.forEach(([name, ic], i) => {
    const s = spring(t - (m.reg - 0.15 + i * 0.12), ORG);
    if (s <= 0) return;
    const x = regX(i) + sway, y = mid - (1 - clamp(s)) * 120 * u;
    g.save(); g.globalAlpha *= clamp(s * 2);
    g.fillStyle = mixColor(P.card, P.blue, 0.7); S.rrect(x, y, bw, 64 * u, 14 * u); g.fill();
    icon(S, ic, x + 34 * u, y + 32 * u, 14 * u, 1, { color: P.ink, width: 3.5 });
    S.text(name, x + 62 * u, y + 41 * u, { size: S.pick({ portrait: 26, landscape: 24 }), weight: 700, color: P.ink });
    // the rod they hang from
    g.strokeStyle = P.dim; g.lineWidth = 4 * u; g.beginPath(); g.moveTo(x + 10 * u, y + 64 * u); g.lineTo(x + bw - 10 * u, y + 64 * u); g.stroke();
    g.restore();
  });
  EXT.forEach((name, i) => {
    const s = spring(t - (m.ext - 0.1 + i * 0.12), ORG);
    if (s <= 0) return;
    const x = regX(i) + sway * 0.4, y = top - (1 - clamp(s)) * 100 * u;
    g.save(); g.globalAlpha *= clamp(s * 2);
    g.strokeStyle = P.sky; g.lineWidth = 2.5 * u; S.rrect(x, y, bw, 56 * u, 28 * u); g.stroke();
    S.text(name, x + bw / 2, y + 37 * u, { size: S.pick({ portrait: 26, landscape: 24 }), weight: 700, color: P.sky, align: 'center' });
    // influences run down into every regulator
    for (let j = 0; j < 3; j++) {
      const p = sp(t - (m.ext + 0.2 + i * 0.1 + j * 0.05), [90, 16]);
      arrow(S, x + bw / 2, y + 56 * u, regX(j) + bw / 2 + sway, mid - 4 * u, p, { color: 'rgba(147,197,253,0.6)', width: 2, head: 10 });
    }
    g.restore();
  });
  tag(S, Z.x, gy + gh + 40 * u, 'EXPÉRIENCES', { color: P.amber, alpha: range(t, m.exp, m.exp + 0.3) });
  tag(S, Z.x + Z.w, gy + gh + 40 * u, 'INFLUENCES EXTERNES', { color: P.sky, align: 'right', alpha: range(t, m.ext + 0.3, m.ext + 0.6) });
}

// ════ 4 · confront the discourses ═════════════════════════════════════════════
const LIVED = ['examen le soir', 'enfants à la maison', 'diplôme d’ailleurs', 'parler en réunion'];
const INST = ['présence à 18 h', 'aucune exception', 'diplôme d’ici exigé', 'réunion mensuelle'];
const MATCH = [false, false, false, true];
const FIX = [null, 'aménagement possible', 'ou évaluation comparative', null];
export function assise4(t, S) {
  const { g, u } = S;
  const Z = zone(S), m = f4.marks;
  headF(t, S, 4, 'Confronter les discours', T.F4);
  const colW = Z.w * 0.46, gap = Z.w - colW * 2, h = Z.h * 0.78;
  const lx = Z.x, rx = Z.x + colW + gap, y0 = Z.y + 30 * u;
  const rowY = (i) => y0 + 150 * u + i * (h - 190 * u) / 4;
  // lived experience (notebook) and institutional discourse (paper)
  const nb = spring(t - (m.pv - 0.2), ORG), dc = spring(t - (m.pv + 0.1), ORG);
  notebook(S, lx, y0 + (1 - clamp(nb)) * 120 * u, colW, h, { alpha: clamp(nb * 2), title: 'EXPÉRIENCE VÉCUE', size: 1 });
  paper(S, rx, y0 + (1 - clamp(dc)) * 120 * u, colW, h, { alpha: clamp(dc * 2), title: 'DISCOURS', sub: 'INSTITUTIONNEL', titleSize: 26, seed: 81 });
  const fs = S.pick({ portrait: 32, landscape: 28 });
  LIVED.forEach((txt, i) => {
    const s = sp(t - (m.exp - 0.1 + i * 0.22), [170, 24]);
    if (s > 0) S.text(txt, lx + 56 * u, rowY(i) + (1 - s) * 20 * u, { size: fs, weight: 'italic 600', face: 'display', color: '#3B2A10', alpha: s });
  });
  const amel = (i) => sp(t - (m.amel + 0.15 + i * 0.25), [170, 24]);
  INST.forEach((txt, i) => {
    const s = sp(t - (m.exp + 0.3 + i * 0.22), [170, 24]);
    if (s <= 0) return;
    const y = rowY(i), fx = FIX[i] ? amel(i) : 0;
    S.text(txt, rx + 24 * u, y, { size: fs, weight: 600, color: INK, alpha: s * (1 - 0.5 * fx) });
    if (fx > 0) {
      g.fillStyle = INK; g.fillRect(rx + 22 * u, y - fs * 0.32 * u, (measure(S, txt, fs, 600) + 4 * u) * fx, 3 * u);
      S.text(FIX[i], rx + 24 * u, y + 34 * u, { size: fs - 3, weight: 700, color: '#B45309', alpha: fx });
      g.fillStyle = '#B45309'; g.beginPath(); g.moveTo(rx + 12 * u, y + 30 * u); g.lineTo(rx + 20 * u, y + 18 * u); g.lineTo(rx + 28 * u, y + 30 * u); g.closePath(); g.fill();
    }
  });
  // confronting: links row to row, = where they agree, ≠ where they don't
  const cf = (i) => sp(t - (m.conf + i * 0.22), [120, 18]);
  for (let i = 0; i < 4; i++) {
    const c = cf(i);
    if (c <= 0) continue;
    const y = rowY(i) - 9 * u, ax = lx + colW - 6 * u, bx = rx + 6 * u, mxp = (ax + bx) / 2;
    const ok = MATCH[i] || (FIX[i] && amel(i) > 0.5);
    g.strokeStyle = ok ? P.blue : P.amber; g.lineWidth = 3 * u; g.setLineDash(ok ? [] : [8 * u, 6 * u]);
    g.beginPath(); g.moveTo(ax, y); g.lineTo(lerp(ax, bx, c), y); g.stroke(); g.setLineDash([]);
    const s = spring(t - (m.conf + i * 0.22 + 0.25), [260, 15]);
    if (s > 0) {
      g.save(); g.translate(mxp, y); g.scale(s, s);
      g.fillStyle = ok ? P.blue : P.amber; circle(g, 0, 0, 22 * u); g.fill();
      S.text(ok ? '=' : '≠', 0, 11 * u, { size: 30, weight: 800, color: P.bg, align: 'center' });
      g.restore();
    }
  }
  const v2 = spring(t - (m.amel + 0.9), [260, 15]);
  if (v2 > 0) {
    g.save(); g.translate(rx + colW - 50 * u, y0 + 40 * u); g.scale(v2, v2);
    g.fillStyle = P.amber; S.rrect(-34 * u, -20 * u, 68 * u, 40 * u, 20 * u); g.fill();
    S.text('v2', 0, 10 * u, { size: 26, weight: 800, face: 'mono', color: P.bg, align: 'center' });
    g.restore();
  }
}

// node examples/yourbrand/site/capture.mjs
// Captures the (fictional) yourbrand.ca product UI the way you would capture a real product:
// Playwright, 2x, one PNG per UI piece on a transparent background, plus the click targets inside
// each piece (assets/layout.json) so the film's cursor lands on real buttons.
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, launch } from '../../../studio/common.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'assets');
mkdirSync(OUT, { recursive: true });

const CLEAR = 'html,body,.app,main{background:transparent!important}.scrim{background:transparent!important}';
const SHOTS = [
  // [file, page query, element, click targets inside it]
  ['sidebar', '', '.side', {}],
  ['topbar', '', '#top', { newBtn: '#new-btn' }],
  ['kpi1', '', '#k1', {}],
  ['kpi2', '', '#k2', {}],
  ['kpi3', '', '#k3', {}],
  ['table', '', '#table', { row: '#row-1042', pill: '#pill-1042' }],
  ['table_paid', '?paid=1', '#table', { row: '#row-1042', pill: '#pill-1042' }],
  ['remind_off', '', '#remind', { toggle: '#switch' }],
  ['remind_on', '?remind=1', '#remind', { toggle: '#switch', steps: '.steps' }],
  ['modal', '?modal=1', '#dialog', { send: '#send-btn' }],
  ['modal_sent', '?modal=1&sent=1', '#dialog', { send: '#sent-btn' }],
  ['pay', 'pay.html', '#paycard', { pay: '#pay-btn' }],
  ['pay_paid', 'pay.html?paid=1', '#paycard', {}],
];

const { url, close } = await serve();
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const base = `${url}/examples/yourbrand/site/`;
const layout = {};

await page.goto(base);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(OUT, 'dashboard_full.png') });

for (const [name, query, sel, targets] of SHOTS) {
  await page.goto(base + query);
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: CLEAR });
  const el = page.locator(sel);
  await el.screenshot({ path: join(OUT, `${name}.png`), omitBackground: true });
  const box = await el.boundingBox();
  const entry = { w: Math.round(box.width), h: Math.round(box.height) };
  for (const [k, ts] of Object.entries(targets)) {
    const r = await page.locator(ts).boundingBox();
    entry[k] = [r.x - box.x, r.y - box.y, r.width, r.height].map(Math.round);
  }
  layout[name] = entry;
  console.log(`  ${name}.png  ${entry.w}×${entry.h} CSS px @2x`);
}

copyFileSync(join(HERE, 'logo.svg'), join(OUT, 'logo.svg'));
writeFileSync(join(OUT, 'layout.json'), JSON.stringify(layout, null, 1) + '\n');
await browser.close(); await close();
console.log(`  → ${OUT}`);

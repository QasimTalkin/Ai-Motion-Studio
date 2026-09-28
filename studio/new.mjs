// npm run new <name> -- [--dur 15] [--format 9:16] [--formats 9:16,16:9] [--bpm 120] [--title "My Film"]
// Default is 9:16 + 16:9. --format picks one; --formats sets the list.
// Scaffolds films/<name>/ from templates/film: index.html, docs/ (shotlist, style guide, review log,
// animation guide), assets/, refs/ and audio/ folders.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { args, fail, ROOT } from './common.mjs';

const a = args();
const name = a._[0];
if (!name || !/^[\w.-]+$/.test(name)) fail('Usage: npm run new <name> -- [--dur 15] [--format 9:16] [--bpm 120]');
const dir = join(ROOT, 'films', name);
if (existsSync(dir)) fail(`films/${name} already exists.`);

cpSync(join(ROOT, 'templates', 'film'), dir, { recursive: true });
for (const d of ['assets', 'refs', 'audio']) mkdirSync(join(dir, d), { recursive: true });

const title = a.title || name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const formats = a.formats ? String(a.formats).split(',') : a.format ? [a.format] : ['9:16', '16:9'];
const file = join(dir, 'index.html');
let html = readFileSync(file, 'utf8')
  .replace(/<title>.*<\/title>/, `<title>${title}</title>`)
  .replace(/const TITLE = .*;/, `const TITLE = ${JSON.stringify(title)};`)
  .replace(/const DUR = .*;/, `const DUR = ${Number(a.dur) || 12};`)
  .replace(/const BPM = .*;/, `const BPM = ${Number(a.bpm) || 120};`)
  .replace(/const FORMATS = .*;/, `const FORMATS = ${JSON.stringify(formats)};`);
writeFileSync(file, html);
for (const f of ['shotlist.md', 'style_guide.md', 'review_log.md'])
  writeFileSync(join(dir, 'docs', f), readFileSync(join(dir, 'docs', f), 'utf8').replaceAll('{{TITLE}}', title));

const rel = relative(ROOT, dir);
console.log(`
✓ Created ${rel}/

  index.html        your film (edit the scenes)
  docs/shotlist.md  plan the beats here first
  assets/ refs/ audio/

Next:
  npm run preview ${rel}     live preview
  npm run stills ${rel}      one frame per beat → ${rel}/out/stills.png
  npm run film ${rel}        final render, all formats

Or just tell Claude: "use the motion-reel skill to make ${rel} about <your idea>"
`);

// npm run preview [film] -- [--port 4321] [--format 1:1]
// Serves the repo and prints live-preview links. Space = play/pause, ←/→ = scrub, click the bar to seek.
// If the film has out/mix.wav (npm run audio), the preview plays in sync with the soundtrack.
import { readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { args, serve, filmUrl, findFilm, ROOT } from './common.mjs';

const a = args();
const { url } = await serve(a.port || 4321);
const films = a._[0] ? [findFilm(a._[0])] : ['examples', 'films', 'templates'].flatMap((d) => {
  const p = join(ROOT, d);
  return existsSync(p) ? readdirSync(p).map((f) => join(p, f)).filter((f) => existsSync(join(f, 'index.html'))) : [];
});
console.log(`\nAI Motion Studio preview — ${url}\n`);
for (const f of films) console.log(`  ${relative(ROOT, f).padEnd(28)} ${filmUrl(url, f, a.format ? { format: a.format } : {})}`);
console.log('\n  space play/pause · ←/→ scrub 0.5s · shift+←/→ one frame · ?format=1:1 · ?t=3.2 freezes\n  Ctrl+C to stop\n');

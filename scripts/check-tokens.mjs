import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const files = readdirSync('src').filter(n => /\.(jsx|css)$/.test(n));
const definitions = ['vendor/cadence-ui/src/tokens.css', 'src/tokens.css'].map(f => readFileSync(f,'utf8')).join('\n');
const declared = new Set([...definitions.matchAll(/(--[\w-]+)\s*:/g)].map(m=>m[1]));
for (const name of files) {
 const source = readFileSync(`src/${name}`,'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
 assert(!/\bstyle\s*=|\.style\s*\./.test(source), `${name}: inline style`);
 if (name !== 'tokens.css') assert(!/#[\da-f]{3,8}\b|rgba?\(/i.test(source), `${name}: literal color`);
 for (const [, token] of source.matchAll(/var\((--[\w-]+)/g)) assert(declared.has(token),`${name}: undefined ${token}`);
 if (name === 'styles.css') {
  const withoutMedia = source.replace(/@media\s*\(max-width:\s*760px\)/g,'');
  assert(!/\d+(?:\.\d+)?(?:px|rem|em)\b/.test(withoutMedia),`${name}: static dimension outside tokens`);
 }
}
console.log('Tokens OK: no application inline styles, no raw colors outside tokens, all referenced tokens defined.');

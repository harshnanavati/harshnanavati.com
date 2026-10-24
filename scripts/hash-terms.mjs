// Turns a local plaintext list of banned terms (one per line, never committed)
// into scripts/banned-hashes.json.
// Usage: node scripts/hash-terms.mjs ../banned_terms.local.txt
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { hashTerm, normalize } from './check-banned.mjs';

const source = process.argv[2];
if (!source) {
  console.error('Usage: node scripts/hash-terms.mjs <plaintext-list>');
  process.exit(1);
}

const terms = readFileSync(source, 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));

const tooLong = terms.filter((t) => normalize(t).length > 4);
if (tooLong.length > 0) {
  console.error(`Terms longer than 4 words can't be matched; shorten them:\n${tooLong.join('\n')}`);
  process.exit(1);
}

const hashes = [...new Set(terms.map(hashTerm))].sort();
const out = fileURLToPath(new URL('./banned-hashes.json', import.meta.url));
writeFileSync(out, `${JSON.stringify(hashes, null, 2)}\n`);
console.log(`Wrote ${hashes.length} hashes to scripts/banned-hashes.json`);

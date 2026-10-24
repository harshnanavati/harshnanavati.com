// Confidentiality check: fails if any banned term appears anywhere in the built site.
// Banned terms (client names, internal systems, colleagues) are stored only as SHA-256
// hashes in banned-hashes.json, so this public repo never reveals them.
// Regenerate the hashes from a local plaintext list with scripts/hash-terms.mjs.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const MAX_TERM_WORDS = 4;
const SCANNED_EXTENSIONS = new Set(['.html', '.xml', '.txt', '.json', '.svg', '.md', '.mdx', '.ts', '.astro', '.mjs', '.css', '.yml']);
const PATTERNS = [/\b(?:172\.16|192\.168)\.\d{1,3}\.\d{1,3}\b/g, /masterlysolutions\.com/gi];

export function normalize(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function hashTerm(term) {
  return createHash('sha256').update(normalize(term).join(' ')).digest('hex');
}

export function findBanned(text, hashes) {
  const tokens = normalize(text);
  const found = new Set();
  for (let i = 0; i < tokens.length; i++) {
    for (let n = 1; n <= MAX_TERM_WORDS && i + n <= tokens.length; n++) {
      const hash = hashTerm(tokens.slice(i, i + n).join(' '));
      if (hashes.has(hash)) found.add(hash);
    }
  }
  return [...found];
}

export function findPatterns(text) {
  return PATTERNS.flatMap((pattern) => [...text.matchAll(pattern)].map((m) => m[0]));
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

export function loadHashes() {
  const file = fileURLToPath(new URL('./banned-hashes.json', import.meta.url));
  return new Set(JSON.parse(readFileSync(file, 'utf8')));
}

function main(dir) {
  const hashes = loadHashes();
  let hits = 0;
  for (const file of walk(dir)) {
    if (!SCANNED_EXTENSIONS.has(extname(file))) continue;
    const text = readFileSync(file, 'utf8');
    for (const hash of findBanned(text, hashes)) {
      console.error(`BANNED TERM ${hash.slice(0, 12)}… in ${relative(dir, file)}`);
      hits++;
    }
    for (const match of findPatterns(text)) {
      console.error(`BANNED PATTERN "${match}" in ${relative(dir, file)}`);
      hits++;
    }
  }
  if (hits > 0) {
    console.error(`Confidentiality check failed: ${hits} hit(s).`);
    process.exit(1);
  }
  console.log(`Confidentiality check passed (${hashes.size} banned terms, ${PATTERNS.length} patterns).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv[2] ?? 'dist');
}

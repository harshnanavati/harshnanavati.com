// Confidentiality check: fails if any banned term (client names, internal systems,
// colleagues) appears in the built site or in any file tracked by git.
//
// The banned list itself is never committed. It comes from, in order:
//   1. the BANNED_TERMS environment variable (one term per line; a GitHub Actions secret in CI)
//   2. the file named by BANNED_TERMS_FILE
//   3. ../banned_terms.local.txt, next to this repo
// Matches are printed masked, so CI logs never reveal a term either.
//
// Usage: node scripts/check-banned.mjs <dir>    scan a folder (e.g. dist)
//        node scripts/check-banned.mjs --repo   scan every file tracked by git
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const MAX_TERM_WORDS = 4;
const PATTERNS = [/\b(?:172\.16|192\.168)\.\d{1,3}\.\d{1,3}\b/g, /masterlysolutions\.com/gi];
// Dependency metadata: third-party names and random hashes, not our content.
const REPO_SKIP = new Set(['package-lock.json']);

export function normalize(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function parseTerms(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

// Maps every accepted spelling of a term to its canonical form.
// "Acme Corp" matches as "acme corp" and as the joined "acmecorp" (CamelCase, domains).
export function buildTermSet(terms) {
  const set = new Map();
  for (const term of terms) {
    const tokens = normalize(term);
    if (tokens.length === 0 || tokens.length > MAX_TERM_WORDS) {
      throw new Error(`Banned terms must be 1–${MAX_TERM_WORDS} words: "${term.slice(0, 1)}…"`);
    }
    const canonical = tokens.join(' ');
    set.set(canonical, canonical);
    set.set(tokens.join(''), canonical);
  }
  return set;
}

export function findBanned(text, termSet) {
  const tokens = normalize(text);
  const found = new Set();
  for (let i = 0; i < tokens.length; i++) {
    for (let n = 1; n <= MAX_TERM_WORDS && i + n <= tokens.length; n++) {
      const gram = tokens.slice(i, i + n);
      const hit = termSet.get(gram.join(' ')) ?? termSet.get(gram.join(''));
      if (hit) found.add(hit);
    }
  }
  return [...found].sort();
}

export function findPatterns(text) {
  return PATTERNS.flatMap((pattern) => [...text.matchAll(pattern)].map((m) => m[0]));
}

export function loadTerms() {
  if (process.env.BANNED_TERMS?.trim()) return parseTerms(process.env.BANNED_TERMS);
  const file = process.env.BANNED_TERMS_FILE ?? resolve(process.cwd(), '..', 'banned_terms.local.txt');
  if (existsSync(file)) return parseTerms(readFileSync(file, 'utf8'));
  return null;
}

const mask = (term) => `${term[0]}${'*'.repeat(Math.max(term.length - 1, 2))}`;

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter((f) => f && !REPO_SKIP.has(f));
}

function main(target) {
  const terms = loadTerms();
  if (!terms || terms.length === 0) {
    console.error('Confidentiality check cannot run: no banned list (set BANNED_TERMS or create ../banned_terms.local.txt).');
    process.exit(2);
  }
  const termSet = buildTermSet(terms);
  const files = target === '--repo' ? trackedFiles() : [...walk(target)];
  let hits = 0;
  for (const file of files) {
    const buffer = readFileSync(file);
    if (buffer.includes(0)) continue; // binary (images, fonts, PDF)
    const text = buffer.toString('utf8');
    const name = target === '--repo' ? file : relative(target, file);
    for (const term of findBanned(text, termSet)) {
      console.error(`BANNED TERM "${mask(term)}" in ${name}`);
      hits++;
    }
    for (const match of findPatterns(text)) {
      console.error(`BANNED PATTERN in ${name}`);
      hits++;
    }
  }
  if (hits > 0) {
    console.error(`Confidentiality check failed: ${hits} hit(s).`);
    process.exit(1);
  }
  console.log(`Confidentiality check passed: ${files.length} files, ${terms.length} terms, ${PATTERNS.length} patterns.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv[2] ?? 'dist');
}

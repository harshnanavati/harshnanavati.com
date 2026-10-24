// Link check: every internal href/src in the built site must point at a file that exists.
// External links aren't fetched (that would make builds flaky); they're listed for a manual look.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const ATTRIBUTE = /\s(?:href|src)=["']([^"']+)["']/g;

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

function resolves(distDir, href) {
  const path = decodeURIComponent(href.split(/[?#]/)[0]);
  const base = join(distDir, path);
  if (existsSync(base) && statSync(base).isFile()) return true;
  return existsSync(join(base, 'index.html')) || existsSync(`${base}.html`);
}

function attributes(html) {
  return [...html.matchAll(ATTRIBUTE)].map((m) => m[1]);
}

export async function findBrokenLinks(distDir) {
  const broken = [];
  for (const file of htmlFiles(distDir)) {
    const page = relative(distDir, file).split(sep).join('/');
    for (const href of attributes(readFileSync(file, 'utf8'))) {
      const internal = href.startsWith('/') && !href.startsWith('//');
      if (internal && !resolves(distDir, href)) broken.push({ page, href });
    }
  }
  return broken;
}

export function findExternalLinks(distDir) {
  const external = new Set();
  for (const file of htmlFiles(distDir)) {
    for (const href of attributes(readFileSync(file, 'utf8'))) {
      if (/^https?:\/\//.test(href) || href.startsWith('//')) external.add(href);
    }
  }
  return [...external].sort();
}

async function main(dir) {
  const broken = await findBrokenLinks(dir);
  for (const { page, href } of broken) console.error(`BROKEN ${href} on ${page}`);
  if (broken.length > 0) {
    console.error(`Link check failed: ${broken.length} broken link(s).`);
    process.exit(1);
  }
  console.log('Link check passed. External links to review by hand:');
  for (const href of findExternalLinks(dir)) console.log(`  ${href}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main(process.argv[2] ?? 'dist');
}

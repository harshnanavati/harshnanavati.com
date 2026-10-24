import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { findBrokenLinks } from '../../scripts/check-links.mjs';

let dist: string;

function write(path: string, content: string) {
  const file = join(dist, path);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, content);
}

beforeEach(() => {
  dist = mkdtempSync(join(tmpdir(), 'hn-links-'));
  write('about/index.html', '<p>about</p>');
  write('resume/x.pdf', 'pdf');
  write('404.html', 'missing');
});

afterEach(() => rmSync(dist, { recursive: true, force: true }));

describe('findBrokenLinks', () => {
  it('accepts links to pages and files that exist', async () => {
    write('index.html', '<a href="/about">a</a><a href="/about/#top">b</a><a href="/resume/x.pdf?v=1">c</a><a href="/">home</a>');
    expect(await findBrokenLinks(dist)).toEqual([]);
  });

  it('reports a link to a missing page', async () => {
    write('index.html', '<a href="/missing">gone</a>');
    expect(await findBrokenLinks(dist)).toEqual([{ page: 'index.html', href: '/missing' }]);
  });

  it('checks src attributes too', async () => {
    write('index.html', '<img src="/og/none.png" alt="">');
    expect(await findBrokenLinks(dist)).toEqual([{ page: 'index.html', href: '/og/none.png' }]);
  });

  it('ignores external, mailto and fragment-only links', async () => {
    write('index.html', '<a href="https://example.com">x</a><a href="mailto:a@b.c">m</a><a href="#work">w</a>');
    expect(await findBrokenLinks(dist)).toEqual([]);
  });
});

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_PAGES, DIST, loadPage } from './helpers';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe.each(ALL_PAGES)('SEO for %s', (path) => {
  const head = () => loadPage(path).querySelector('head')!;

  it('has a description and canonical URL', () => {
    expect(head().querySelector('meta[name="description"]')?.getAttribute('content')?.length).toBeGreaterThan(20);
    expect(head().querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `https://harshnanavati.com${path}`,
    );
  });

  it('has an Open Graph image that exists and is a real PNG', () => {
    const url = head().querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '';
    expect(url).toMatch(/^https:\/\/harshnanavati\.com\/og\/.+\.png$/);
    const file = join(DIST, new URL(url).pathname);
    expect(existsSync(file)).toBe(true);
    expect(readFileSync(file).subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);
  });
});

describe('sitemap', () => {
  it('lists exactly the site pages', () => {
    expect(existsSync(join(DIST, 'sitemap-index.xml'))).toBe(true);
    const xml = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    expect(urls).toEqual(ALL_PAGES.map((p) => `https://harshnanavati.com${p}`).sort());
  });
});

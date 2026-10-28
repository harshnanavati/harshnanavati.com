import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_PAGES, DIST, loadPage } from './helpers';

const SIGNATURES = {
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  jpg: Buffer.from([0xff, 0xd8, 0xff]),
};

describe.each(ALL_PAGES)('SEO for %s', (path) => {
  const head = () => loadPage(path).querySelector('head')!;

  it('has a description and canonical URL', () => {
    expect(head().querySelector('meta[name="description"]')?.getAttribute('content')?.length).toBeGreaterThan(20);
    expect(head().querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `https://harshnanavati.com${path}`,
    );
  });

  // GitHub Pages sends the Content-Type for the extension, so the bytes have to match it.
  it('has an Open Graph image that exists and is a real PNG or JPEG', () => {
    const url = head().querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '';
    const ext = url.match(/^https:\/\/harshnanavati\.com\/og\/.+\.(png|jpg)$/)?.[1] as keyof typeof SIGNATURES | undefined;
    expect(ext).toBeDefined();
    const file = join(DIST, new URL(url).pathname);
    expect(existsSync(file)).toBe(true);
    expect(readFileSync(file).subarray(0, SIGNATURES[ext!].length).equals(SIGNATURES[ext!])).toBe(true);
  });
});

describe('sitemap', () => {
  it('lists exactly the site pages', () => {
    expect(existsSync(join(DIST, 'sitemap-index.xml'))).toBe(true);
    const xml = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    expect(urls).toEqual(ALL_PAGES.map((p) => `https://harshnanavati.com${p}`).sort());
  });

  // The date comes from git, so a build without git leaves it out rather than guessing.
  it('dates each page by its last commit, when git knows one', () => {
    const xml = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
    for (const [, lastmod] of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
      const date = new Date(lastmod);
      expect(Number.isNaN(date.getTime())).toBe(false);
      expect(date.getTime()).toBeLessThanOrEqual(Date.now());
    }
  });
});

describe('IndexNow', () => {
  it('serves its key at /<key>.txt, as the deploy workflow announces it', () => {
    const workflow = readFileSync(join(DIST, '..', '.github', 'workflows', 'deploy.yml'), 'utf8');
    const key = workflow.match(/KEY: ([0-9a-f]{32})\b/)?.[1];
    expect(key).toBeDefined();
    expect(readFileSync(join(DIST, `${key}.txt`), 'utf8').trim()).toBe(key);
  });
});

describe('search result snippets', () => {
  it.each(ALL_PAGES)('%s has a title and description short enough not to be cut off', (path) => {
    const doc = loadPage(path);
    expect(doc.querySelector('title')!.text.length).toBeLessThanOrEqual(60);
    expect(doc.querySelector('meta[name="description"]')!.getAttribute('content')!.length).toBeLessThanOrEqual(160);
  });

  it('case study descriptions are in the third person and name Harsh', () => {
    for (const path of ALL_PAGES.filter((p) => p.startsWith('/work/') && p !== '/work/')) {
      const description = loadPage(path).querySelector('meta[name="description"]')!.getAttribute('content')!;
      expect(description).toContain('Harsh Nanavati');
      expect(description).not.toMatch(/\bI\b/);
    }
  });

  it('case study articles carry publish and update dates', () => {
    const graph = JSON.parse(loadPage('/work/docupilot/').querySelector('script[type="application/ld+json"]')!.text)['@graph'];
    const article = graph.find((n: { '@type': string }) => n['@type'] === 'Article');
    expect(Date.parse(article.datePublished)).not.toBeNaN();
    expect(Date.parse(article.dateModified)).toBeGreaterThanOrEqual(Date.parse(article.datePublished));
  });
});

describe('profiles', () => {
  it('links GitHub and LinkedIn from the footer as his own profiles', () => {
    const links = loadPage('/').querySelectorAll('footer a[rel~="me"]').map((a) => a.getAttribute('href'));
    expect(links).toEqual(expect.arrayContaining(['https://www.linkedin.com/in/harshnanavati', 'https://github.com/harshnanavati']));
  });
});

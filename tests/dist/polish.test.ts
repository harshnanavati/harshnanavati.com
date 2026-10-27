import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_PAGES, DIST, loadPage, rawPage, WORK_SLUGS } from './helpers';

const PAGES_WITH_404 = [...ALL_PAGES, '/404'];
const raw404 = () => readFileSync(join(DIST, '404.html'), 'utf8');
const rawAny = (p: string) => (p === '/404' ? raw404() : rawPage(p));

describe('fonts and assets', () => {
  it.each(ALL_PAGES)('%s has no arrow glyph (it pulls in an 85 KB extra font)', (p) => {
    expect(rawPage(p)).not.toContain('→');
  });

  it.each(ALL_PAGES)('%s inlines its CSS and preloads the two main fonts', (p) => {
    const html = rawPage(p);
    expect(html).not.toMatch(/<link[^>]+rel="stylesheet"/);
    expect((html.match(/<link[^>]+rel="preload"[^>]+as="font"/g) ?? []).length).toBe(2);
  });

  it('has a 180×180 Apple touch icon', () => {
    expect(loadPage('/').querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href')).toBe(
      '/apple-touch-icon.png',
    );
    const png = readFileSync(join(DIST, 'apple-touch-icon.png'));
    expect(png.readUInt32BE(16)).toBe(180);
    expect(png.readUInt32BE(20)).toBe(180);
  });
});

describe('links', () => {
  it.each(PAGES_WITH_404)('%s links to /about/ and /resume/ with trailing slashes', (p) => {
    expect(rawAny(p)).not.toMatch(/href="\/(about|resume)"/);
  });
});

describe('sharing and indexing', () => {
  it('keeps the 404 page out of search results', () => {
    const html = raw404();
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).not.toContain('rel="canonical"');
    expect(html).not.toContain('property="og:url"');
  });

  it('gives the home page a 1200×630 share card with the headshot on it', () => {
    const png = readFileSync(join(DIST, 'og', 'home.png'));
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
    // A photo makes the file several times heavier than a text-only card.
    expect(png.length).toBeGreaterThan(3 * readFileSync(join(DIST, 'og', 'about.png')).length);
  });

  it.each(ALL_PAGES)('%s has complete link-preview tags', (p) => {
    const head = loadPage(p).querySelector('head')!;
    const meta = (sel: string) => head.querySelector(sel)?.getAttribute('content');
    expect(meta('meta[property="og:site_name"]')).toBe('Harsh Nanavati');
    expect(meta('meta[property="og:image:width"]')).toBe('1200');
    expect(meta('meta[property="og:image:height"]')).toBe('630');
    expect(meta('meta[property="og:image:alt"]')!.length).toBeGreaterThan(10);
    expect(meta('meta[name="twitter:image:alt"]')!.length).toBeGreaterThan(10);
    const type = p.startsWith('/work/') ? 'article' : 'website';
    expect(meta('meta[property="og:type"]')).toBe(type);
  });
});

describe('diagram accessibility', () => {
  it.each(WORK_SLUGS)('%s diagram labels have no doubled periods', (slug) => {
    for (const fig of loadPage(`/work/${slug}/`).querySelectorAll('figure[role="img"]')) {
      expect(fig.getAttribute('aria-label')).not.toContain('..');
    }
  });

  // The concierge page tells its story with a before-and-after step diagram instead.
  it.each(WORK_SLUGS.filter((s) => s !== 'concierge-chatbot'))('%s architecture SVG is hidden behind its figure label', (slug) => {
    const svg = loadPage(`/work/${slug}/`).querySelector('figure.architecture svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('every page exists', () => {
  it('builds the 404 page', () => {
    expect(existsSync(join(DIST, '404.html'))).toBe(true);
  });
});

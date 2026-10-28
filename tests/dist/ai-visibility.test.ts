import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { ALL_PAGES, DIST, loadPage, WORK_SLUGS } from './helpers';

// Structured data, plain-text summaries and snippet hints that let search engines and AI
// assistants identify Harsh and cite the right pages.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Node = Record<string, any>;
const graph = (doc: HTMLElement): Node[] =>
  JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.text)['@graph'];
const ofType = (doc: HTMLElement, type: string) => graph(doc).find((n) => n['@type'] === type);
const text = (file: string) => readFileSync(join(DIST, file), 'utf8');
const FOOTER =
  'Harsh Nanavati is an Applied AI Engineer at Masterly Solutions in Ahmedabad, India, building production LLM systems: RAG, AI agents and evaluation. Open to remote roles.';

describe('JSON-LD', () => {
  it.each(ALL_PAGES)('%s has Harsh as a Person and the WebSite in one graph', (path) => {
    const doc = loadPage(path);
    expect(doc.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
    const person = ofType(doc, 'Person')!;
    expect(person['@id']).toBe('https://harshnanavati.com/#person');
    expect(person.name).toBe('Harsh Nanavati');
    expect(person.jobTitle).toBe('Applied AI Engineer');
    // Others share the name, so the node says which one this is.
    expect(person.disambiguatingDescription).toMatch(/Applied AI Engineer from Ahmedabad/);
    expect(person.worksFor).toMatchObject({ '@type': 'Organization', name: 'Masterly Solutions Pvt. Ltd.' });
    expect(person.address).toMatchObject({ addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', addressCountry: 'IN' });
    expect(person.sameAs).toEqual(
      expect.arrayContaining(['https://www.linkedin.com/in/harshnanavati', 'https://github.com/harshnanavati']),
    );
    expect(person.alumniOf.map((s: Node) => s.name)).toEqual(['Nirma University', 'LDRP-ITR']);
    expect(person.email).toBe('mailto:nanavatiharsh00@gmail.com');
    const website = ofType(doc, 'WebSite')!;
    expect(website['@id']).toBe('https://harshnanavati.com/#website');
    expect(website.publisher['@id']).toBe(person['@id']);
  });

  it('points the Person image at a photo that exists', () => {
    expect(ofType(loadPage('/'), 'Person')!.image).toBe('https://harshnanavati.com/harsh-nanavati.jpg');
    expect(existsSync(join(DIST, 'harsh-nanavati.jpg'))).toBe(true);
  });

  it('marks /about/ as his ProfilePage, and only /about/', () => {
    const profile = ofType(loadPage('/about/'), 'ProfilePage')!;
    expect(profile.url).toBe('https://harshnanavati.com/about/');
    expect(profile.mainEntity['@id']).toBe('https://harshnanavati.com/#person');
    for (const path of ALL_PAGES.filter((p) => p !== '/about/')) {
      expect(ofType(loadPage(path), 'ProfilePage')).toBeUndefined();
    }
  });

  it.each(WORK_SLUGS)('%s is an Article by Harsh with a breadcrumb trail', (slug) => {
    const doc = loadPage(`/work/${slug}/`);
    const url = `https://harshnanavati.com/work/${slug}/`;
    const article = ofType(doc, 'Article')!;
    // The article keeps the project's full title, even where the browser tab uses a shorter one.
    expect(article.headline).toContain(doc.querySelector('main h1')!.text.trim());
    expect(article.description).toBe(doc.querySelector('meta[name="description"]')!.getAttribute('content'));
    expect(article.url).toBe(url);
    expect(article.image).toBe(`https://harshnanavati.com/og/${slug}.png`);
    expect(article.author['@id']).toBe('https://harshnanavati.com/#person');
    expect(article.inLanguage).toBe('en');
    expect(article.keywords.split(', ')).toHaveLength(3);
    const crumbs = ofType(doc, 'BreadcrumbList')!.itemListElement;
    expect(crumbs.map((c: Node) => c.item)).toEqual([
      'https://harshnanavati.com/',
      'https://harshnanavati.com/work/',
      url,
    ]);
    expect(crumbs[2].name).toBe(doc.querySelector('main h1')!.text.trim());
  });
});

describe('case study byline', () => {
  it.each(WORK_SLUGS)('%s says who built it, between the descriptor and the outcome', (slug) => {
    const doc = loadPage(`/work/${slug}/`);
    const hero = doc.querySelector('.hero-text')!;
    const personal = doc.querySelector('.meta-card')!.text.includes('Personal project');
    expect(hero.querySelector('.byline')!.text.trim()).toBe(
      personal ? 'Personal project by Harsh Nanavati' : 'Built by Harsh Nanavati at Masterly Solutions',
    );
    expect(personal).toBe(slug === 'vipermind');
    const order = hero.querySelectorAll('p').map((p) => p.classList.value[0]);
    expect(order.indexOf('byline')).toBeGreaterThan(order.indexOf('descriptor'));
    expect(order.indexOf('byline')).toBeLessThan(order.indexOf('outcome'));
  });
});

describe('snippet hints', () => {
  it.each(WORK_SLUGS)('%s keeps the name bar and the illustration out of snippets', (slug) => {
    const doc = loadPage(`/work/${slug}/`);
    expect(doc.querySelector('.case-bar')!.hasAttribute('data-nosnippet')).toBe(true);
    expect(doc.querySelector('.stage')!.hasAttribute('data-nosnippet')).toBe(true);
  });

  it('keeps every citation card out of snippets', () => {
    const cards = ALL_PAGES.flatMap((p) => loadPage(p).querySelectorAll('.cite-card'));
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) expect(card.hasAttribute('data-nosnippet')).toBe(true);
  });

  it('keeps every card preview out of snippets', () => {
    const previews = ['/', '/work/'].flatMap((p) => loadPage(p).querySelectorAll('.row .preview'));
    expect(previews.length).toBeGreaterThan(0);
    for (const preview of previews) expect(preview.hasAttribute('data-nosnippet')).toBe(true);
  });
});

describe('footer', () => {
  it.each(ALL_PAGES)('%s says who Harsh is in one sentence', (path) => {
    expect(loadPage(path).querySelector('footer .footer-about')!.text.trim()).toBe(FOOTER);
  });

  it('the 404 page has it too', () => {
    expect(text('404.html')).toContain(FOOTER);
  });
});

describe('llms.txt', () => {
  it('opens with his name and a one-paragraph summary', () => {
    const lines = text('llms.txt').split('\n');
    expect(lines[0]).toBe('# Harsh Nanavati');
    expect(lines[2]).toMatch(/^> Harsh Nanavati is an Applied AI Engineer at Masterly Solutions Pvt\. Ltd\. in Ahmedabad/);
    expect(lines[2]).toContain('UTC+5:30');
    expect(lines[2]).toContain('remote roles');
    expect(lines[4]).toMatch(/^Other people share the name Harsh Nanavati\. This site is only about one of them: the Applied AI Engineer from Ahmedabad/);
  });

  it('lists the facts, every case study in order and the main pages', () => {
    const body = text('llms.txt');
    expect(body).toContain('SDE – Artificial Intelligence (Applied AI Engineer), Masterly Solutions Pvt. Ltd.');
    expect(body).toContain('Deloitte Haskins & Sells LLP');
    expect(body).toContain('Nirma University');
    expect(body).toContain('nanavatiharsh00@gmail.com');
    expect(body).toContain('https://www.linkedin.com/in/harshnanavati');
    const cases = body.slice(body.indexOf('## Case studies'), body.indexOf('## Pages'));
    const urls = [...cases.matchAll(/\]\((https:[^)]+)\): \S/g)].map((m) => m[1]);
    expect(urls).toEqual(WORK_SLUGS.map((s) => `https://harshnanavati.com/work/${s}/`));
    for (const page of ['about', 'work', 'talks', 'resume']) {
      expect(body).toContain(`(https://harshnanavati.com/${page}/)`);
    }
    expect(body).toMatch(/\(https:\/\/harshnanavati\.com\/resume\/[^)]+\.pdf\)/);
  });

  it('never carries a phone number', () => {
    expect(text('llms.txt') + text('llms-full.txt')).not.toMatch(/\+91|[6-9]\d{4}[\s-]?\d{5}/);
  });
});

describe('llms-full.txt', () => {
  it('has the same header, then every case study in full without MDX code', () => {
    const body = text('llms-full.txt');
    const header = text('llms.txt').split('## Case studies')[0];
    expect(body.startsWith(header)).toBe(true);
    for (const slug of WORK_SLUGS) expect(body).toContain(`- URL: https://harshnanavati.com/work/${slug}/`);
    expect(body).toContain('### The problem');
    expect(body).not.toMatch(/^import /m);
    expect(body).not.toContain('<ProjectDiagram');
  });
});

describe('favicons', () => {
  it('links a 48×48 PNG fallback after the SVG icon', () => {
    const icons = loadPage('/')
      .querySelectorAll('link[rel="icon"]')
      .map((l) => l.getAttribute('href'));
    expect(icons).toEqual(['/favicon.svg', '/favicon-48.png']);
    const png = readFileSync(join(DIST, 'favicon-48.png'));
    expect(png.subarray(1, 4).toString()).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(48);
    expect(png.readUInt32BE(20)).toBe(48);
  });

  it('serves /favicon.ico as a real icon file', () => {
    const ico = readFileSync(join(DIST, 'favicon.ico'));
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBeGreaterThan(0);
    const offset = ico.readUInt32LE(6 + 12);
    expect(ico.subarray(offset + 1, offset + 4).toString()).toBe('PNG');
  });
});

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { beforeAll, describe, expect, it } from 'vitest';
import BaseLayout from '../../src/layouts/BaseLayout.astro';

let container: AstroContainer;

async function render(path = '/about') {
  const html = await container.renderToString(BaseLayout, {
    props: { title: 'About', description: 'About Harsh', path },
    slots: { default: '<p>body</p>' },
  });
  return parse(html);
}

beforeAll(async () => {
  container = await AstroContainer.create();
});

describe('BaseLayout', () => {
  it('has the name, the Email me button and the four tabs, in order', async () => {
    const doc = await render();
    const links = doc.querySelectorAll('header nav a').map((a) => [a.text.trim(), a.getAttribute('href')]);
    expect(links).toEqual([
      ['Harsh Nanavati', '/'],
      ['Email me', 'mailto:nanavatiharsh00@gmail.com'],
      ['Work', '/work/'],
      ['Talks', '/talks/'],
      ['About', '/about/'],
      ['Resume', '/resume/'],
    ]);
  });

  it('has email and LinkedIn in the footer', async () => {
    const doc = await render();
    const hrefs = doc.querySelectorAll('footer a').map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('mailto:nanavatiharsh00@gmail.com');
    expect(hrefs).toContain('https://www.linkedin.com/in/harshnanavati');
  });

  it('sets the canonical URL from the path', async () => {
    const doc = await render('/about');
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://harshnanavati.com/about');
  });

  it('formats the title with the name', async () => {
    const doc = await render();
    expect(doc.querySelector('title')?.text).toBe('About · Harsh Nanavati');
  });

  it('includes Person structured data', async () => {
    const doc = await render();
    const json = JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.text);
    expect(json['@type']).toBe('Person');
    expect(json.sameAs).toContain('https://www.linkedin.com/in/harshnanavati');
  });

  it('has no analytics script when GoatCounter is off', async () => {
    const doc = await render();
    expect(doc.toString()).not.toContain('goatcounter');
  });
});

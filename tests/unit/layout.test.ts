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
  it('has the name, the four tabs and the Email me button, in the order they appear on screen', async () => {
    const doc = await render();
    const links = doc.querySelectorAll('header nav a').map((a) => [a.text.trim(), a.getAttribute('href')]);
    expect(links).toEqual([
      ['Harsh Nanavati', '/'],
      ['Work', '/work/'],
      ['Talks', '/talks/'],
      ['About', '/about/'],
      ['Resume', '/resume/'],
      ['Email me', 'mailto:nanavatiharsh00@gmail.com'],
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

  it('includes a JSON-LD graph with Harsh as a Person and the WebSite', async () => {
    const doc = await render();
    const json = JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.text);
    expect(json['@context']).toBe('https://schema.org');
    const person = json['@graph'].find((n: { '@type': string }) => n['@type'] === 'Person');
    expect(person['@id']).toBe('https://harshnanavati.com/#person');
    expect(person.jobTitle).toBe('Applied AI Engineer');
    expect(person.worksFor.name).toBe('Masterly Solutions Pvt. Ltd.');
    expect(person.address.addressLocality).toBe('Ahmedabad');
    expect(person.image).toBe('https://harshnanavati.com/harsh-nanavati.jpg');
    expect(person.sameAs).toEqual(['https://www.linkedin.com/in/harshnanavati', 'https://github.com/harshnanavati']);
    const website = json['@graph'].find((n: { '@type': string }) => n['@type'] === 'WebSite');
    expect(website.publisher['@id']).toBe(person['@id']);
  });

  it('adds a ProfilePage only on /about/, and merges extra schema nodes', async () => {
    const types = async (path: string, schema?: object[]) => {
      const html = await container.renderToString(BaseLayout, {
        props: { title: 'T', description: 'D', path, schema },
        slots: { default: '<p>body</p>' },
      });
      const json = JSON.parse(parse(html).querySelector('script[type="application/ld+json"]')!.text);
      return json['@graph'].map((n: { '@type': string }) => n['@type']);
    };
    expect(await types('/about/')).toEqual(['Person', 'WebSite', 'ProfilePage']);
    expect(await types('/talks/')).toEqual(['Person', 'WebSite']);
    expect(await types('/work/x/', [{ '@type': 'Article' }])).toEqual(['Person', 'WebSite', 'Article']);
  });

  it('mirrors the Open Graph title and description for Twitter', async () => {
    const doc = await render();
    const meta = (sel: string) => doc.querySelector(sel)?.getAttribute('content');
    expect(meta('meta[name="twitter:title"]')).toBe(meta('meta[property="og:title"]'));
    expect(meta('meta[name="twitter:description"]')).toBe('About Harsh');
  });

  it('says who Harsh is in one sentence in the footer', async () => {
    const doc = await render();
    expect(doc.querySelector('footer .footer-about')?.text).toContain('Applied AI Engineer at Masterly Solutions');
  });

  it('has no analytics script when GoatCounter is off', async () => {
    const doc = await render();
    expect(doc.toString()).not.toContain('goatcounter');
  });
});

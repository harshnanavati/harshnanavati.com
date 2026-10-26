import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import Cite from '../../src/components/Cite.astro';

const props = {
  n: 2,
  id: 'hero-users',
  source: 'DocuPilot – Enterprise RAG Platform',
  basis: 'Production user count at the time of writing.',
  href: '/work/docupilot/#results',
  linkText: 'See the Results section',
};

async function render() {
  const container = await AstroContainer.create();
  return parse(await container.renderToString(Cite, { props }));
}

describe('Cite', () => {
  it('renders a numbered marker that opens its evidence card', async () => {
    const doc = await render();
    const button = doc.querySelector('button.cite')!;
    expect(button.text.trim()).toBe('2');
    expect(button.getAttribute('popovertarget')).toBe('cite-hero-users');
    expect(button.getAttribute('aria-label')).toBe('Evidence 2: DocuPilot – Enterprise RAG Platform');
    expect(button.getAttribute('data-href')).toBe('/work/docupilot/#results');
  });

  it('puts the source, basis and evidence link in the card', async () => {
    const card = (await render()).querySelector('#cite-hero-users')!;
    expect(card.hasAttribute('popover')).toBe(true);
    expect(card.text).toContain('DocuPilot – Enterprise RAG Platform');
    expect(card.text).toContain('Production user count at the time of writing.');
    expect(card.querySelector('a')!.getAttribute('href')).toBe('/work/docupilot/#results');
    expect(card.querySelector('a')!.text.trim()).toBe('See the Results section');
  });
});

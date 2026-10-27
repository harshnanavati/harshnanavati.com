import { describe, expect, it } from 'vitest';
import { loadPage, WORK_SLUGS } from './helpers';

describe('home page citations', () => {
  const home = () => loadPage('/').querySelector('main')!;

  it('cites both hero claims, numbered in reading order', () => {
    const cites = home().querySelectorAll('.hero button.cite');
    expect(cites.map((c) => c.text.trim())).toEqual(['1', '2']);
    expect(cites[0].getAttribute('data-href')).toBe('/work/');
    expect(cites[0].getAttribute('popovertarget')).toBe('cite-hero-systems');
    expect(cites[1].getAttribute('data-href')).toBe('/work/rag-support-chatbot/#results');
  });

  it('lets the evidence markers speak for themselves, with no instructions line', () => {
    expect(home().querySelector('.cite-note')).toBeNull();
  });

  it('backs each "How I build" stage with a proof that links to its case study', () => {
    const stages = home().querySelectorAll('.build ol.stages > li');
    expect(stages.map((li) => li.querySelector('h3')!.text.trim())).toEqual([
      'Understand the problem',
      'Prove it works',
      'Build the system',
      'Ship to production',
      'Optimize in production',
    ]);
    expect(stages.map((li) => li.querySelector('a.proof')!.getAttribute('href'))).toEqual([
      '/work/concierge-chatbot/#key-decisions',
      '/work/crickpal-intelligence-layer/#results',
      '/work/docupilot/#key-decisions',
      '/work/ai-face-matching/#results',
      '/work/rag-support-chatbot/#results',
    ]);
    expect(home().querySelector('.build-lede')!.text).toContain('I owned all five stages myself');
  });

  it('gives every marker a unique evidence card', () => {
    const ids = home()
      .querySelectorAll('button.cite')
      .map((b) => b.getAttribute('popovertarget'));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(home().querySelector(`#${id}[popover]`)).not.toBeNull();
  });
});

describe.each(WORK_SLUGS)('case-study citations on %s', (slug) => {
  const main = () => loadPage(`/work/${slug}/`).querySelector('main')!;

  it('cites every number, with a basis and an evidence link on this page', () => {
    const numbers = main().querySelectorAll('.stats li, .meta-card .result');
    expect(numbers.length).toBeGreaterThan(0);
    numbers.forEach((n, i) => {
      const cite = n.querySelector('button.cite')!;
      expect(cite, `number ${i + 1}`).not.toBeNull();
      expect(cite.text.trim()).toBe(String(i + 1));
      const card = main().querySelector(`#${cite.getAttribute('popovertarget')}`)!;
      expect(card.querySelector('.cite-basis')!.text.trim().length).toBeGreaterThan(15);
      const href = card.querySelector('a')!.getAttribute('href')!;
      expect(href).toMatch(/^#/);
      expect(main().querySelector(href)).not.toBeNull();
    });
  });
});

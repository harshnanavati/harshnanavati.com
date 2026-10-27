import { describe, expect, it } from 'vitest';
import { loadPage, WORK_SLUGS } from './helpers';

describe('home page citations', () => {
  const home = () => loadPage('/').querySelector('main')!;

  it('cites both hero claims, numbered in reading order', () => {
    const cites = home().querySelectorAll('.hero button.cite');
    expect(cites.map((c) => c.text.trim())).toEqual(['1', '2']);
    expect(cites[0].getAttribute('data-href')).toBe('#work');
    expect(cites[0].getAttribute('popovertarget')).toBe('cite-hero-systems');
    expect(cites[1].getAttribute('data-href')).toBe('/work/rag-support-chatbot/#results');
  });

  it('explains the idea in one quiet line', () => {
    expect(home().querySelector('.cite-note')!.text).toContain('link to their evidence');
  });

  it('backs each "How I build" principle with a project', () => {
    const cites = home().querySelectorAll('.principles button.cite');
    expect(cites.map((c) => c.getAttribute('data-href'))).toEqual([
      '/work/docupilot/#key-decisions',
      '/work/crickpal-intelligence-layer/#key-decisions',
      '/work/ai-face-matching/#key-decisions',
    ]);
    expect(cites.map((c) => c.text.trim())).toEqual(['3', '4', '5']);
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

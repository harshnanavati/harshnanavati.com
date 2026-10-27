import { describe, expect, it } from 'vitest';
import { loadPage, rawPage, WORK_SLUGS } from './helpers';

// The product name leads; the descriptor sits under it.
const TITLES: Record<(typeof WORK_SLUGS)[number], [string, string?]> = {
  docupilot: ['DocuPilot', 'Enterprise RAG Platform'],
  'crickpal-intelligence-layer': ['CrickPal Intelligence Layer', 'AI Win-Prediction Platform'],
  'crickpal-ai-summary': ['CrickPal AI Summary', 'Real-Time LLM Commentary Engine'],
  'ai-face-matching': ['AI Face Matching System', 'GPU Photo-Tagging Pipeline'],
  quantumcopilot: ['QuantumCopilot', 'AI Loan & Financial Assistant'],
  'rag-support-chatbot': ['RAG Support Chatbot', 'Customer Support Assistant'],
  'concierge-chatbot': ['Concierge Chatbot', 'Long-Context Visitor Assistant'],
  vipermind: ['ViperMind', 'Multi-Agent Python Tutor'],
};

const CHIP_VALUES: Record<(typeof WORK_SLUGS)[number], string[]> = {
  docupilot: ['600+', '14', '12,000+', '~40%', 'sub-100 ms'],
  'crickpal-intelligence-layer': ['4.1k', '0.643', '0.227', '~800'],
  'crickpal-ai-summary': ['2'],
  'ai-face-matching': ['~70%'],
  quantumcopilot: ['6', 'Up to 3', '~3x'],
  'rag-support-chatbot': ['30,000+', '8,800+', '20,000+', '~86%', '~60%'],
  'concierge-chatbot': ['~50'],
  vipermind: ['30', '7'],
};

const SECTION_ORDER = [
  'The problem',
  'Constraints',
  'How it works',
  'Key decisions',
  'Hard problems',
  'Results',
  "What I'd do next",
];
const REQUIRED_SECTIONS = ['The problem', 'How it works', 'Key decisions', 'Results', "What I'd do next"];

const KINDS: Record<(typeof WORK_SLUGS)[number], string> = {
  docupilot: 'Client project',
  'crickpal-intelligence-layer': 'In-house product',
  'crickpal-ai-summary': 'In-house product, live',
  'ai-face-matching': 'Client project',
  quantumcopilot: 'In-house product, live',
  'rag-support-chatbot': 'Client project',
  'concierge-chatbot': 'Client project',
  vipermind: 'Personal project',
};

const CRICKPAL = 'https://www.crickpal.com/';
const QUANTUM = 'https://www.loanquantum.com/quantumcopilot';

const page = (slug: string) => loadPage(`/work/${slug}/`);
const main = (slug: string) => page(slug).querySelector('main')!;

describe.each(WORK_SLUGS)('work page %s', (slug) => {
  it('has the spec title as h1', () => {
    const [name, descriptor] = TITLES[slug];
    expect(main(slug).querySelector('h1')?.text.trim()).toBe(name);
    expect(main(slug).querySelector('.hero .descriptor')?.text.trim()).toBe(descriptor);
    // The browser tab and search results keep the full title.
    expect(page(slug).querySelector('title')?.text).toContain(descriptor ?? name);
  });

  it('has the template sections in order', () => {
    // Markdown renders straight apostrophes as typographic ones.
    const headings = main(slug)
      .querySelectorAll('h2')
      .map((h) => h.text.trim().replace(/’/g, "'"))
      .filter((h) => SECTION_ORDER.includes(h));
    for (const required of REQUIRED_SECTIONS) expect(headings).toContain(required);
    const positions = headings.map((h) => SECTION_ORDER.indexOf(h));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('shows the spec metric values, as result cells or in the details card', () => {
    const values = main(slug)
      .querySelectorAll('.stats .value, .meta-card .result-value')
      .map((v) => v.text.trim());
    for (const v of CHIP_VALUES[slug]) expect(values).toContain(v);
  });

  it('only puts real numbers in result cells', () => {
    const values = main(slug).querySelectorAll('.stats .value').map((v) => v.text.trim());
    for (const v of values) expect(v).toMatch(/\d/);
    if (values.length > 0) expect(values.length).toBeGreaterThanOrEqual(2);
  });

  it('has a project details card with the type and stack', () => {
    const card = main(slug).querySelector('.meta-card')!;
    expect(card).not.toBeNull();
    expect(card.text).toContain(KINDS[slug]);
    // The stack reads as a plain list, not a row of chips.
    expect(card.querySelector('.stack-tags')).toBeNull();
    expect(card.querySelector('dd.stack')!.text.split(', ').length).toBeGreaterThan(3);
  });

  it('has a section nav pointing at every section', () => {
    const tocTargets = main(slug)
      .querySelectorAll('nav.toc a')
      .map((a) => a.getAttribute('href'));
    const sectionIds = main(slug)
      .querySelectorAll('.prose h2[id]')
      .map((h) => `#${h.getAttribute('id')}`);
    expect(tocTargets).toEqual(sectionIds);
    expect(tocTargets.length).toBeGreaterThanOrEqual(5);
  });

  it('opens with a product illustration in the stage panel', () => {
    expect(main(slug).querySelector('.stage .product-moment')).not.toBeNull();
  });

  it('has no video placeholder', () => {
    expect(main(slug).text).not.toContain('Video coming soon');
  });

  it('links to the next project', () => {
    expect(main(slug).querySelector('a.next-project')).not.toBeNull();
  });

  it('shows each diagram exactly once', () => {
    expect(main(slug).querySelectorAll('figure.diagram')).toHaveLength(1);
  });
});

describe('external product links', () => {
  const external = (slug: string) =>
    main(slug)
      .querySelectorAll('.links-out a')
      .map((a) => ({ href: a.getAttribute('href'), text: a.text.trim() }));

  it('QuantumCopilot links to the live product', () => {
    expect(external('quantumcopilot')).toEqual([{ href: QUANTUM, text: 'Try it live' }]);
  });

  it.each(['crickpal-intelligence-layer', 'crickpal-ai-summary'])('%s links to CrickPal', (slug) => {
    expect(external(slug)).toEqual([{ href: CRICKPAL, text: 'CrickPal, the platform this runs on' }]);
  });

  it.each(['docupilot', 'ai-face-matching', 'rag-support-chatbot', 'concierge-chatbot', 'vipermind'])('%s has no product links', (slug) => {
    expect(external(slug)).toEqual([]);
  });
});

describe('roles', () => {
  it.each(WORK_SLUGS)('%s says Harsh built it solo', (slug) => {
    const role = main(slug)
      .querySelectorAll('.meta-card dl > div')
      .find((d) => d.querySelector('dt')?.text.trim() === 'Role');
    expect(role?.querySelector('dd')?.text).toMatch(/^Solo/);
  });

  it('QuantumCopilot keeps the scope Harsh owned', () => {
    expect(main('quantumcopilot').querySelector('.meta-card')!.text).toContain('backend and LLM pipeline');
  });
});

describe('face matching privacy', () => {
  it('shows the privacy note and no images', () => {
    const m = main('ai-face-matching');
    expect(m.text).toContain('No real photos are shown on this page.');
    expect(m.querySelector('.privacy-note')!.text).toContain("shared with the client's approval");
    expect(m.querySelectorAll('img')).toHaveLength(0);
  });
});

describe('next project links', () => {
  it('follows the home order and wraps from the last project to the first', () => {
    const next = (slug: string) => main(slug).querySelector('a.next-project')?.getAttribute('href');
    expect(next('docupilot')).toBe('/work/rag-support-chatbot/');
    expect(next('rag-support-chatbot')).toBe('/work/crickpal-intelligence-layer/');
    expect(next('concierge-chatbot')).toBe('/work/vipermind/');
    expect(next('vipermind')).toBe('/work/docupilot/');
  });
});

describe('the old shared chatbots page', () => {
  it('redirects to the support chatbot', () => {
    const html = rawPage('/work/support-concierge-chatbots/');
    expect(html).toMatch(/http-equiv="refresh"[^>]*\/work\/rag-support-chatbot\//);
    expect(html).toContain('noindex');
  });
});

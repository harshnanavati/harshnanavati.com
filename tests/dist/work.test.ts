import { describe, expect, it } from 'vitest';
import { loadPage, WORK_SLUGS } from './helpers';

const TITLES: Record<(typeof WORK_SLUGS)[number], string> = {
  docupilot: 'DocuPilot – Enterprise RAG Platform',
  'crickpal-intelligence-layer': 'CrickPal Intelligence Layer – AI Win-Prediction Platform',
  'crickpal-ai-summary': 'CrickPal AI Summary – Real-Time LLM Commentary Engine',
  'ai-face-matching': 'AI Face Matching System',
  quantumcopilot: 'QuantumCopilot – AI Loan & Financial Assistant',
  'support-concierge-chatbots': 'RAG Support & Concierge Chatbots',
};

const CHIP_VALUES: Record<(typeof WORK_SLUGS)[number], string[]> = {
  docupilot: ['600+', '14', '12,000+', '~40%', 'sub-100 ms'],
  'crickpal-intelligence-layer': ['4.1k', '0.643', '0.227', '~800'],
  'crickpal-ai-summary': ['2'],
  'ai-face-matching': ['~70%'],
  quantumcopilot: ['6', 'Up to 3', '~3x'],
  'support-concierge-chatbots': ['~60%'],
};

const SECTION_ORDER = [
  'The problem',
  'Constraints',
  'How it works',
  'Key decisions',
  'Hard problems',
  'Results',
  "What I'd do next",
  'Stack',
];
const REQUIRED_SECTIONS = ['The problem', 'How it works', 'Key decisions', 'Results', "What I'd do next", 'Stack'];

const CRICKPAL = 'https://www.crickpal.com/';
const QUANTUM = 'https://www.loanquantum.com/quantumcopilot';

const page = (slug: string) => loadPage(`/work/${slug}/`);
const main = (slug: string) => page(slug).querySelector('main')!;

describe.each(WORK_SLUGS)('work page %s', (slug) => {
  it('has the spec title as h1', () => {
    expect(main(slug).querySelector('h1')?.text.trim()).toBe(TITLES[slug]);
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

  it('shows the spec metric values', () => {
    const values = main(slug).querySelectorAll('.chips .value').map((v) => v.text.trim());
    for (const v of CHIP_VALUES[slug]) expect(values).toContain(v);
  });

  it('links to the next project', () => {
    expect(main(slug).querySelector('a.next-project')).not.toBeNull();
  });

  it('shows each diagram exactly once', () => {
    const expected = slug === 'support-concierge-chatbots' ? 2 : 1;
    expect(main(slug).querySelectorAll('figure.diagram')).toHaveLength(expected);
  });
});

describe('external product links', () => {
  const external = (slug: string) =>
    main(slug)
      .querySelectorAll('.links-out a')
      .map((a) => ({ href: a.getAttribute('href'), text: a.text.trim() }));

  it('QuantumCopilot links to the live product', () => {
    expect(external('quantumcopilot')).toEqual([{ href: QUANTUM, text: 'Try it live →' }]);
  });

  it.each(['crickpal-intelligence-layer', 'crickpal-ai-summary'])('%s links to CrickPal', (slug) => {
    expect(external(slug)).toEqual([{ href: CRICKPAL, text: 'CrickPal, the platform this runs on →' }]);
  });

  it.each(['docupilot', 'ai-face-matching', 'support-concierge-chatbots'])('%s has no product links', (slug) => {
    expect(external(slug)).toEqual([]);
  });
});

describe('face matching privacy', () => {
  it('shows the privacy note and no images', () => {
    const m = main('ai-face-matching');
    expect(m.text).toContain('No real photos are shown on this page.');
    expect(m.querySelectorAll('img')).toHaveLength(0);
  });
});

describe('next project links', () => {
  it('goes from DocuPilot to the Intelligence Layer, and wraps from the last to the first', () => {
    expect(main('docupilot').querySelector('a.next-project')?.getAttribute('href')).toBe(
      '/work/crickpal-intelligence-layer/',
    );
    expect(main('support-concierge-chatbots').querySelector('a.next-project')?.getAttribute('href')).toBe(
      '/work/docupilot/',
    );
  });
});

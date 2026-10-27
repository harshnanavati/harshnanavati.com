import { describe, expect, it } from 'vitest';
import { loadPage, WORK_SLUGS } from './helpers';

const main = (slug: string) => loadPage(`/work/${slug}/`).querySelector('main')!;

// What each architecture diagram must single out as the project's key idea.
const KEY_IDEA: Record<(typeof WORK_SLUGS)[number], string> = {
  docupilot: 'citation selection',
  'crickpal-intelligence-layer': 'Verification harness',
  'crickpal-ai-summary': 'new balls only',
  'ai-face-matching': 'Job queue',
  quantumcopilot: 'typed parameters',
  'rag-support-chatbot': 'correction loop',
  'concierge-chatbot': 'cached prompt',
  vipermind: 'graded by code',
};

describe.each(WORK_SLUGS)('visuals on %s', (slug) => {
  it('opens with a product illustration that is labelled as one', () => {
    const moment = main(slug).querySelector('.stage .product-moment');
    expect(moment).not.toBeNull();
    expect(moment!.querySelector('figcaption')!.text).toContain('Illustration');
  });

  it('has an accessible architecture diagram with exactly one key component', () => {
    // The concierge story is a before-and-after, told by its step diagram instead.
    const fig = main(slug).querySelector(slug === 'concierge-chatbot' ? 'figure.diagram' : 'figure.architecture');
    expect(fig).not.toBeNull();
    expect(fig!.getAttribute('role')).toBe('img');
    expect(fig!.getAttribute('aria-label')!.length).toBeGreaterThan(80);
    const keys = fig!.querySelectorAll('.key, .step.key');
    expect(keys).toHaveLength(1);
    expect(keys[0].text).toContain(KEY_IDEA[slug]);
  });

  it('makes no HMAC claim', () => {
    expect(main(slug).toString()).not.toMatch(/hmac/i);
  });
});

describe('face matching illustration', () => {
  it('uses silhouettes only, never images', () => {
    const m = main('ai-face-matching');
    expect(m.querySelectorAll('img')).toHaveLength(0);
    expect(m.querySelector('.product-moment figcaption')!.text).toContain('silhouettes');
  });
});

// Standard EMI formula, computed independently of the site's code.
function emi(principal: number, annualRate: number, years: number) {
  const r = annualRate / 1200;
  const n = years * 12;
  const f = (1 + r) ** n;
  return (principal * r * f) / (f - 1);
}
const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

describe('QuantumCopilot illustration', () => {
  it('shows three scenarios whose EMIs and interest are mathematically correct', () => {
    const rows = main('quantumcopilot').querySelectorAll('.product-moment tbody tr');
    expect(rows).toHaveLength(3);
    const rates = [9, 8.5, 8];
    rows.forEach((row, i) => {
      const cells = row.querySelectorAll('td').map((c) => c.text.trim());
      const monthly = emi(2_000_000, rates[i], 15);
      expect(cells[0]).toBe(`${rates[i].toFixed(1)}%`);
      expect(cells[1]).toBe(inr(monthly));
      expect(cells[2]).toBe(inr(monthly * 180 - 2_000_000));
    });
  });
});

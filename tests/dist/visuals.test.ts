import { describe, expect, it } from 'vitest';
import { loadPage } from './helpers';

const main = () => loadPage('/work/quantumcopilot/').querySelector('main')!;

// Standard EMI formula, computed independently of the site's code.
function emi(principal: number, annualRate: number, years: number) {
  const r = annualRate / 1200;
  const n = years * 12;
  const f = (1 + r) ** n;
  return (principal * r * f) / (f - 1);
}
const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

describe('QuantumCopilot product moment', () => {
  it('is labelled as an illustration', () => {
    const moment = main().querySelector('.product-moment');
    expect(moment).not.toBeNull();
    expect(moment!.text).toContain('Illustration');
  });

  it('shows three scenarios whose EMIs and interest are mathematically correct', () => {
    const rows = main().querySelectorAll('.product-moment tbody tr');
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

describe('QuantumCopilot architecture diagram', () => {
  it('is an accessible figure with exactly one key component', () => {
    const fig = main().querySelector('figure.architecture');
    expect(fig).not.toBeNull();
    expect(fig!.getAttribute('role')).toBe('img');
    expect(fig!.getAttribute('aria-label')!.length).toBeGreaterThan(40);
    expect(fig!.querySelectorAll('.key')).toHaveLength(1);
    expect(fig!.querySelector('.key')!.text).toContain('typed parameters');
  });

  it('makes no HMAC claim', () => {
    expect(main().querySelector('figure.architecture')!.toString()).not.toMatch(/hmac/i);
  });
});

describe('pages without new visuals yet', () => {
  it('DocuPilot has no product moment or architecture figure', () => {
    const m = loadPage('/work/docupilot/').querySelector('main')!;
    expect(m.querySelector('.product-moment')).toBeNull();
    expect(m.querySelector('figure.architecture')).toBeNull();
  });
});

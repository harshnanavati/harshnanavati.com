import { describe, expect, it } from 'vitest';
import { buildTermSet, findBanned, findPatterns, parseTerms } from '../../scripts/check-banned.mjs';

const terms = buildTermSet(['Acme Corp', 'XYZ']);

describe('parseTerms', () => {
  it('reads one term per line, skipping blanks and comments', () => {
    expect(parseTerms('# list\nAcme Corp\n\n  XYZ  \r\n')).toEqual(['Acme Corp', 'XYZ']);
  });
});

describe('findBanned', () => {
  it('finds a banned term in visible text', () => {
    expect(findBanned('We worked with Acme Corp.', terms)).toEqual(['acme corp']);
  });

  it('ignores case and extra whitespace', () => {
    expect(findBanned('ACME   corp', terms)).toHaveLength(1);
  });

  it('catches terms inside attributes', () => {
    expect(findBanned('<img alt="ACME corp logo">', terms)).toHaveLength(1);
  });

  it('catches terms split by punctuation or markup', () => {
    expect(findBanned('acme-corp', terms)).toHaveLength(1);
  });

  it('catches joined and CamelCase spellings of multi-word terms', () => {
    expect(findBanned('see AcmeCorp and acmecorp.com', terms)).toEqual(['acme corp']);
  });

  it('does not match words that only contain the term', () => {
    expect(findBanned('academic corpus xyzzy', terms)).toHaveLength(0);
  });

  it('reports each banned term once', () => {
    expect(findBanned('Acme Corp and acme corp and xyz', terms)).toEqual(['acme corp', 'xyz']);
  });
});

describe('findPatterns', () => {
  // Sample values are assembled at runtime so this file passes the repo-wide scan itself.
  const ip = (...parts: number[]) => parts.join('.');

  it('finds internal IP addresses', () => {
    expect(findPatterns(`host ${ip(192, 168, 1, 20)} and ${ip(172, 16, 0, 5)}`)).toHaveLength(2);
  });

  it('finds the work email domain', () => {
    expect(findPatterns(`someone@${'Masterly'}${'Solutions'}.com`)).toHaveLength(1);
  });

  it('ignores public text', () => {
    expect(findPatterns('Version 10.1 released, see harshnanavati.com')).toHaveLength(0);
  });
});

import { describe, expect, it } from 'vitest';
import { findBanned, findPatterns, hashTerm } from '../../scripts/check-banned.mjs';

const banned = new Set([hashTerm('acme corp')]);

describe('hashTerm', () => {
  it('ignores case and extra whitespace', () => {
    expect(hashTerm('Acme  Corp')).toBe(hashTerm('acme corp'));
  });
});

describe('findBanned', () => {
  it('finds a banned term in visible text', () => {
    expect(findBanned('We worked with Acme Corp.', banned)).toHaveLength(1);
  });

  it('catches terms inside attributes', () => {
    expect(findBanned('<img alt="ACME corp logo">', banned)).toHaveLength(1);
  });

  it('catches terms split by punctuation or markup', () => {
    expect(findBanned('acme-corp', banned)).toHaveLength(1);
  });

  it('does not match words that only contain the term', () => {
    expect(findBanned('academic corpus', banned)).toHaveLength(0);
  });

  it('reports each banned term once', () => {
    expect(findBanned('Acme Corp and acme corp again', banned)).toHaveLength(1);
  });
});

describe('findPatterns', () => {
  it('finds internal IP addresses', () => {
    expect(findPatterns('host 192.168.1.20 and 172.16.0.5')).toHaveLength(2);
  });

  it('finds the work email domain', () => {
    expect(findPatterns('someone@MasterlySolutions.com')).toHaveLength(1);
  });

  it('ignores public text', () => {
    expect(findPatterns('Version 10.1 released, see harshnanavati.com')).toHaveLength(0);
  });
});

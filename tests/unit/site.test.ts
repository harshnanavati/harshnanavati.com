import { describe, expect, it } from 'vitest';
import { SITE } from '../../src/lib/site';

describe('SITE', () => {
  it('points at the production domain', () => {
    expect(SITE.url).toBe('https://harshnanavati.com');
  });

  it('never contains the phone number or work email', () => {
    expect(JSON.stringify(SITE)).not.toMatch(/\+91|[6-9]\d{4}[\s-]?\d{5}|masterlysolutions/);
  });
});

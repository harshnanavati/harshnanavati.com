import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// An Indian mobile number (10 digits starting 6–9), allowing a short separator
// between the two 5-digit halves: a space, a dash, or a regex escape.
const MOBILE = /[6-9]\d{4}\D{0,3}\d{5}/;

describe('public repo', () => {
  it('contains no mobile phone number in any tracked text file', () => {
    const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
      .split('\0')
      .filter((f) => f && f !== 'package-lock.json');
    const offenders = files.filter((file) => {
      const buffer = readFileSync(file);
      return !buffer.includes(0) && MOBILE.test(buffer.toString('utf8'));
    });
    expect(offenders).toEqual([]);
  });
});

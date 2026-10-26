import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_PAGES, DIST, loadPage, rawPage, WORK_SLUGS } from './helpers';

const RESUME_PDF = '/resume/HarshNanavati_AppliedAIEngineer_Resume_2026.pdf';

describe('home page', () => {
  const home = () => loadPage('/').querySelector('main')!;

  it('has the spec headline', () => {
    expect(home().querySelector('h1')?.text.trim()).toBe('I build production AI systems that people actually use.');
  });

  it('lists the six projects in order, with their home summaries', () => {
    const rows = home().querySelectorAll('#work li a');
    expect(rows.map((a) => a.getAttribute('href'))).toEqual(WORK_SLUGS.map((s) => `/work/${s}/`));
    expect(rows[0].text).toContain('with a source for every answer');
  });

  it('goes straight from the hero to the selected work, with no numbers strip', () => {
    expect(home().querySelector('.chips')).toBeNull();
    expect(home().text).not.toContain('users on one system');
  });

  it('has a correctly spaced closing line', () => {
    const closing = home().querySelector('.closing')!.text.replace(/\s+/g, ' ').trim();
    expect(closing).toBe(
      'Looking for an Applied AI or GenAI engineering role, remote, full-time or contract. Email me or connect on LinkedIn.',
    );
  });

  it('has the "How I build" section and the three calls to action', () => {
    expect(home().querySelectorAll('h2').map((h) => h.text.trim())).toContain('How I build');
    const ctas = home().querySelectorAll('.ctas a').map((a) => a.getAttribute('href'));
    expect(ctas).toEqual(['#work', '/resume', 'mailto:nanavatiharsh00@gmail.com']);
  });
});

describe('about page', () => {
  const about = () => loadPage('/about/').querySelector('main')!;

  it('has the heading, time zone and what Harsh is looking for', () => {
    expect(about().querySelector('h1')?.text.trim()).toBe('About');
    expect(about().text).toContain('IST (UTC+5:30)');
    expect(about().text.replace(/’/g, "'")).toContain("What I'm looking for");
  });

  it('has correctly spaced contact links', () => {
    expect(about().querySelector('.contact')!.text.replace(/\s+/g, ' ').trim()).toBe('Email me · LinkedIn · Resume');
  });

  it('has a video slot', () => {
    expect(about().querySelector('.video-slot')).not.toBeNull();
  });

  it('shows an HN placeholder when there is no headshot yet', () => {
    const hasHeadshot = ['jpg', 'jpeg', 'png', 'webp'].some((ext) =>
      existsSync(join(process.cwd(), 'src', 'assets', `headshot.${ext}`)),
    );
    if (hasHeadshot) {
      expect(about().querySelector('img.headshot')).not.toBeNull();
    } else {
      expect(about().querySelector('.headshot')?.text.trim()).toBe('HN');
    }
  });
});

describe('resume page', () => {
  it('links to the PDF, and the PDF is published', () => {
    const page = loadPage('/resume/').querySelector('main')!;
    expect(page.querySelector(`a[href="${RESUME_PDF}"]`)).not.toBeNull();
    expect(existsSync(join(DIST, RESUME_PDF))).toBe(true);
  });
});

describe('every page', () => {
  it.each(ALL_PAGES)('%s never shows the phone number', (path) => {
    // Any Indian mobile number, with or without the country code.
    expect(rawPage(path)).not.toMatch(/\+91|[6-9]\d{4}[\s-]?\d{5}/);
  });
});

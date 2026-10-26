import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_PAGES, DIST, loadPage, rawPage, WORK_SLUGS } from './helpers';

const RESUME_PDF = '/resume/HarshNanavati_AppliedAIEngineer_Resume_2026.pdf';

describe('home page', () => {
  const home = () => loadPage('/').querySelector('main')!;

  it('names Harsh above a headline that says what his systems do', () => {
    expect(home().querySelector('.hero .kicker')?.text.trim()).toBe('Harsh Nanavati, Applied AI Engineer');
    expect(home().querySelector('h1')?.text.trim()).toBe(
      'I build production LLM systems: RAG, AI agents and evaluation.',
    );
  });

  it('lists the seven projects in order, with their home summaries', () => {
    const rows = home().querySelectorAll('#work li a');
    expect(rows.map((a) => a.getAttribute('href'))).toEqual(WORK_SLUGS.map((s) => `/work/${s}/`));
    expect(rows[0].text).toContain('with a source for every answer');
  });

  it('introduces Harsh in one paragraph, by scope rather than years', () => {
    const hero = home().querySelector('.hero')!;
    expect(hero.querySelectorAll('.sub, .current')).toHaveLength(0);
    const lede = hero.querySelector('.lede')!.text.replace(/\s+/g, ' ');
    expect(lede).toContain('Masterly Solutions');
    expect(lede).toContain('six AI systems');
    expect(lede).toContain('600+ staff');
    expect(hero.text).not.toContain('2+ years');
  });

  it('says how remote work with Harsh works, in plain sentences', () => {
    const remote = home().querySelector('.hero .remote')!.text.replace(/\s+/g, ' ');
    for (const fact of ['India', 'IST (UTC+5:30)', '4+ hours', 'US East', 'Europe', 'full-time', 'contract', 'employer of record']) {
      expect(remote).toContain(fact);
    }
    expect(remote).not.toContain('·');
  });

  it('shows a preview of each project’s illustration, hidden from screen readers', () => {
    const previews = home().querySelectorAll('#work li .preview');
    expect(previews).toHaveLength(7);
    for (const p of previews) {
      expect(p.getAttribute('aria-hidden')).toBe('true');
      expect(p.querySelector('.product-moment')).not.toBeNull();
    }
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
    expect(ctas).toEqual(['#work', '/resume/', 'mailto:nanavatiharsh00@gmail.com']);
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

  it('has an experience and education timeline, newest first', () => {
    const items = about().querySelectorAll('ol.timeline > li');
    expect(items).toHaveLength(4);
    const text = items.map((li) => li.text.replace(/\s+/g, ' '));
    expect(text[0]).toContain('Masterly Solutions');
    expect(text[0]).toContain('SDE – Artificial Intelligence (Applied AI Engineer)');
    expect(text[0]).toContain('2024');
    expect(text[1]).toContain('Deloitte');
    expect(text[2]).toContain('Nirma University');
    expect(text[3]).toContain('LDRP-ITR');
  });

  it('shows no video placeholder until the intro video exists', () => {
    expect(about().text).not.toContain('Video coming soon');
    expect(about().querySelector('.video-slot figure.diagram')).toBeNull();
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
  const resume = () => loadPage('/resume/').querySelector('main')!;

  it('links to the PDF, and the PDF is published', () => {
    expect(resume().querySelector(`a[href="${RESUME_PDF}"]`)).not.toBeNull();
    expect(existsSync(join(DIST, RESUME_PDF))).toBe(true);
  });

  it('shows the resume as readable text instead of an embedded PDF', () => {
    expect(resume().querySelector('object, embed, iframe')).toBeNull();
    const headings = (selector: string) =>
      resume()
        .querySelectorAll(`${selector} h2`)
        .map((h) => h.text.trim());
    // The story reads first; the facts sit in a side column.
    expect(headings('.resume-main')).toEqual(['Summary', 'Experience']);
    expect(headings('.resume-aside')).toEqual(['Skills', 'Education', 'Project', 'Research']);
    // The personal project links to its case study.
    expect(resume().querySelector('.resume-aside a[href="/work/vipermind/"]')?.text).toContain('ViperMind');
    // Skills read as plain lists, not a wall of tags.
    expect(resume().querySelector('.skill-tags')).toBeNull();
    const lists = resume().querySelectorAll('.resume-aside .skill-list');
    expect(lists).toHaveLength(5);
    expect(lists.reduce((n, l) => n + l.text.split(', ').length, 0)).toBeGreaterThan(30);
    expect(resume().text).toContain('SDE – Artificial Intelligence (Applied AI Engineer)');
    expect(resume().text).toContain('Deloitte Haskins & Sells LLP');
    expect(resume().text).toContain('DocuPilot – Enterprise RAG Platform');
  });
});

describe('every page', () => {
  it.each(ALL_PAGES)('%s never shows the phone number', (path) => {
    // Any Indian mobile number, with or without the country code.
    expect(rawPage(path)).not.toMatch(/\+91|[6-9]\d{4}[\s-]?\d{5}/);
  });
});

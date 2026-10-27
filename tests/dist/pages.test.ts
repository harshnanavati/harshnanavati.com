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

  it('features four projects, in order, and links to the full Work page', () => {
    const rows = home().querySelectorAll('#work li.row > a');
    expect(rows.map((a) => a.getAttribute('href'))).toEqual([
      '/work/docupilot/',
      '/work/rag-support-chatbot/',
      '/work/crickpal-intelligence-layer/',
      '/work/ai-face-matching/',
    ]);
    expect(rows[0].text).toContain('with a cited source page for every answer');
    const all = home().querySelector('.all-work a')!;
    expect(all.getAttribute('href')).toBe('/work/');
    expect(all.text.trim()).toBe('View all 8 case studies');
  });

  it('lists all eight projects in order on the Work page, with their summaries', () => {
    const rows = loadPage('/work/').querySelectorAll('main ul.rows li.row > a');
    expect(rows.map((a) => a.getAttribute('href'))).toEqual(WORK_SLUGS.map((s) => `/work/${s}/`));
    expect(loadPage('/work/').querySelector('main h1')?.text.trim()).toBe('Work');
  });

  it('introduces Harsh in one paragraph, by scope rather than years', () => {
    const hero = home().querySelector('.hero')!;
    expect(hero.querySelectorAll('.sub, .current')).toHaveLength(0);
    const lede = hero.querySelector('.lede')!.text.replace(/\s+/g, ' ');
    expect(lede).toContain('Masterly Solutions');
    expect(lede).toContain('seven AI systems');
    expect(lede).toContain('8,800+ people');
    expect(hero.text).not.toContain('2+ years');
  });

  it('says how remote work with Harsh works, in plain sentences', () => {
    const remote = home().querySelector('.hero .remote')!.text.replace(/\s+/g, ' ').replace(/’/g, "'");
    // He works the team's hours; the page must not claim he works remotely today.
    expect(remote).not.toMatch(/I work remotely/);
    for (const fact of ['Open to remote roles', 'India', 'IST', "your team's hours", 'US', 'Europe']) {
      expect(remote).toContain(fact);
    }
    expect(remote).not.toContain('·');
  });

  it('shows a preview of each project’s illustration, hidden from screen readers', () => {
    const previews = loadPage('/work/').querySelectorAll('main ul.rows li .preview');
    expect(previews).toHaveLength(8);
    // The home page keeps its four highlights light: text only, no illustrations.
    expect(home().querySelectorAll('#work li .preview')).toHaveLength(0);
    for (const p of previews) {
      expect(p.getAttribute('aria-hidden')).toBe('true');
      expect(p.querySelector('.product-moment')).not.toBeNull();
    }
  });

  it('goes straight from the hero to the selected work, with no numbers strip', () => {
    expect(home().querySelector('.chips')).toBeNull();
    expect(home().text).not.toContain('users on one system');
  });

  it('ends with a contact card: email first, then LinkedIn and the resume', () => {
    const card = home().querySelector('.contact-card')!;
    expect(card.querySelector('h2')!.text.trim()).toBe('Have an AI project or a role in mind?');
    expect(card.querySelectorAll('.contact-actions a').map((a) => a.getAttribute('href'))).toEqual([
      'mailto:nanavatiharsh00@gmail.com',
      'https://www.linkedin.com/in/harshnanavati',
      '/resume/',
    ]);
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
    expect(about().querySelector('h1')?.text.trim()).toBe('About Harsh Nanavati');
    expect(about().text).toContain('IST (UTC+5:30)');
    expect(about().text.replace(/’/g, "'")).toContain("What I'm looking for");
  });

  it('has a facts card with the contact links: email first, then LinkedIn and the resume', () => {
    const card = about().querySelector('aside.about-card')!;
    expect(card.querySelectorAll('dt').map((d) => d.text.trim())).toEqual(['Based in', 'Time zone', 'Open to']);
    const visible = (a: { text: string }) => a.text.replace(' (opens in a new tab)', '').trim();
    expect(card.querySelectorAll('.contact a').map(visible)).toEqual(['Email me', 'LinkedIn', 'Resume']);
    // LinkedIn opens in a new tab, and says so to screen readers.
    expect(card.querySelector('.contact a[target="_blank"] .visually-hidden')!.text).toBe(' (opens in a new tab)');
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

  it('links every Masterly project heading to its case study', () => {
    const links = resume().querySelectorAll('.points a.lead').map((a) => a.getAttribute('href')!.split('#')[0]);
    expect(links).toHaveLength(8);
    for (const slug of WORK_SLUGS.filter((s) => s !== 'vipermind')) expect(links).toContain(`/work/${slug}/`);
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

describe('talks page', () => {
  const talks = () => loadPage('/talks/').querySelector('main')!;

  it('has its heading', () => {
    expect(talks().querySelector('h1')?.text.trim()).toBe('Talks and sessions');
  });

  it('marks the Talks tab as the current page, and only that tab', () => {
    const current = loadPage('/talks/').querySelectorAll('header a[aria-current="page"]');
    expect(current.map((a) => a.text.trim())).toEqual(['Talks']);
    expect(loadPage('/work/docupilot/').querySelector('header a[aria-current="page"]')?.text.trim()).toBe('Work');
    expect(loadPage('/').querySelector('header a[aria-current="page"]')).toBeNull();
  });

  it('lists talks and sessions newest first, each with a described photo', () => {
    const items = talks().querySelectorAll('ul.talks > li');
    expect(items.map((li) => li.querySelector('.when')!.text.trim())).toEqual([
      'Sep 2026',
      'May 2026',
      'Aug 2025',
      'Apr 2025',
      'Jan 2025',
    ]);
    for (const li of items) expect(li.querySelector('img')!.getAttribute('alt')!.length).toBeGreaterThan(10);
    expect(items[1].text).toContain('35+ engineering students');
    expect(items[2].text).toContain('80+ people');
    expect(items[3].text).toContain('60+ IT professionals');
    expect(items[4].text).toContain('120+ students');
  });

  it('loads the first photo straight away and offers every photo at card size', () => {
    const imgs = talks().querySelectorAll('ul.talks img');
    expect(imgs[0].getAttribute('loading')).toBe('eager');
    expect(imgs[0].getAttribute('fetchpriority')).toBe('high');
    for (const img of imgs.slice(1)) expect(img.getAttribute('loading')).toBe('lazy');
    for (const img of imgs) {
      expect(img.getAttribute('srcset')).toMatch(/ 480w,.+ 720w,.+ 960w/);
      expect(img.getAttribute('sizes')).toMatch(/^\(min-width: 1000px\) (339|524)px, /);
    }
  });

  it('shows the whole webinar poster instead of cropping through its text', () => {
    const poster = talks().querySelectorAll('ul.talks img')[1];
    expect(poster.getAttribute('src')).toContain('may-2026-rag-webinar');
    expect(poster.getAttribute('style')).toMatch(/object-fit: contain; background: #[0-9a-f]{6}/);
  });
});

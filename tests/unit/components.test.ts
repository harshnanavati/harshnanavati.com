import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { beforeAll, describe, expect, it } from 'vitest';
import LinksOut from '../../src/components/LinksOut.astro';
import ProjectRow from '../../src/components/ProjectRow.astro';
import VideoSlot from '../../src/components/VideoSlot.astro';

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

const render = async (component: any, props: Record<string, unknown>) =>
  parse(await container.renderToString(component, { props }));

describe('VideoSlot', () => {
  it('shows a click-to-play embed with a plain link fallback', async () => {
    const doc = await render(VideoSlot, { title: 'A video', youtubeId: 'dQw4w9WgXcQ' });
    expect(doc.querySelector('lite-youtube[videoid="dQw4w9WgXcQ"]')).not.toBeNull();
    expect(doc.querySelector('a[href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"]')).not.toBeNull();
    expect(doc.querySelector('iframe')).toBeNull();
    expect(doc.text).not.toContain('Video coming soon');
  });
});

describe('LinksOut', () => {
  it('opens every link in a new tab safely', async () => {
    const doc = await render(LinksOut, {
      links: [
        { label: 'Try it live', href: 'https://example.com/a' },
        { label: 'Other', href: 'https://example.com/b' },
      ],
    });
    const links = doc.querySelectorAll('a');
    expect(links).toHaveLength(2);
    for (const a of links) {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toBe('noopener');
    }
    expect(links[0].text.trim()).toBe('Try it live (opens in a new tab)');
    expect(links[0].querySelector('.visually-hidden')!.text).toBe(' (opens in a new tab)');
  });
});

describe('ProjectRow', () => {
  it('links to the project with its title, outcome and tags', async () => {
    const doc = await render(ProjectRow, {
      href: '/work/docupilot/',
      title: 'DocuPilot – Enterprise RAG Platform',
      outcome: 'Answers for 600+ staff',
      tags: ['rag', 'docling', 'faiss'],
    });
    const a = doc.querySelector('a');
    expect(a?.getAttribute('href')).toBe('/work/docupilot/');
    expect(doc.text).toContain('DocuPilot – Enterprise RAG Platform');
    expect(doc.text).toContain('Answers for 600+ staff');
    expect(doc.querySelectorAll('.tag').map((t) => t.text)).toEqual(['rag', 'docling', 'faiss']);
  });
});

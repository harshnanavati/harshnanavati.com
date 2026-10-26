import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { SITE } from '../../lib/site';

const require = createRequire(import.meta.url);
const font = (weight: 400 | 500) =>
  readFileSync(require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`));

export const getStaticPaths = (async () => {
  const work = await getCollection('work');
  return [
    { params: { slug: 'index' }, props: { title: SITE.name, subtitle: 'Applied AI Engineer. I build LLM systems that cite their sources and test their own code.' } },
    { params: { slug: 'about' }, props: { title: `About ${SITE.name}`, subtitle: 'Applied AI engineer from India, looking for a remote role.' } },
    { params: { slug: 'resume' }, props: { title: 'Resume', subtitle: `${SITE.name} · ${SITE.role}` } },
    ...work.map((entry) => ({
      params: { slug: entry.id },
      props: { title: entry.data.title, subtitle: entry.data.outcome },
    })),
  ];
}) satisfies GetStaticPaths;

const node = (type: string, style: Record<string, unknown>, children: unknown) => ({ type, props: { style, children } });

export const GET: APIRoute = async ({ props }) => {
  const { title, subtitle } = props as { title: string; subtitle: string };
  const svg = await satori(
    node('div', { display: 'flex', width: '100%', height: '100%', background: '#ffffff', fontFamily: 'Inter' }, [
      node('div', { width: 24, height: '100%', background: '#1f3864' }, ''),
      node(
        'div',
        { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px', flex: 1 },
        [
          node('div', { display: 'flex', flexDirection: 'column', gap: 28 }, [
            node('div', { fontSize: 64, fontWeight: 500, color: '#1a1a1a', lineHeight: 1.15 }, title),
            node('div', { fontSize: 32, color: '#5f5e5a', lineHeight: 1.4 }, subtitle),
          ]),
          node('div', { fontSize: 28, color: '#1f3864' }, 'harshnanavati.com'),
        ],
      ),
    ]) as never,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: font(400), weight: 400, style: 'normal' },
        { name: 'Inter', data: font(500), weight: 500, style: 'normal' },
      ],
    },
  );
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};

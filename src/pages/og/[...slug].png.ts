import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../../lib/site';
import { renderCard } from './_card';

// The home card has a photo, so it lives at /og/home.jpg instead.
export const getStaticPaths = (async () => {
  const work = await getCollection('work');
  return [
    { params: { slug: 'about' }, props: { title: `About ${SITE.name}`, subtitle: 'Applied AI engineer from India, looking for a remote role.' } },
    { params: { slug: 'resume' }, props: { title: 'Resume', subtitle: `${SITE.name} · ${SITE.role}` } },
    { params: { slug: 'work' }, props: { title: 'Work', subtitle: 'Case studies of production AI systems: RAG, AI agents, real-time LLM pipelines and computer vision.' } },
    { params: { slug: 'talks' }, props: { title: 'Talks and sessions', subtitle: `${SITE.name} on AI, RAG and LLM systems, for engineers and students.` } },
    ...work.map((entry) => ({
      params: { slug: entry.id },
      props: { title: entry.data.title, subtitle: entry.data.outcome },
    })),
  ];
}) satisfies GetStaticPaths;

// Text on white needs few colours, so a palette PNG is a fraction of the size of a full-colour one.
export const GET: APIRoute = async ({ props }) => {
  const { title, subtitle } = props as { title: string; subtitle: string };
  const png = await (await renderCard({ title, subtitle })).png({ palette: true, compressionLevel: 9, effort: 10 }).toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};

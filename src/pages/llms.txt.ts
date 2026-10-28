import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { RESUME, RESUME_PDF } from '../lib/resume';
import { SITE } from '../lib/site';
import { splitTitle } from '../lib/title';

// /llms.txt (https://llmstxt.org): a plain-text summary of who Harsh is and which pages to read,
// for AI assistants. Everything is read from SITE, the resume and the case studies, so it can't drift.
export const prerender = true;

const abs = (path: string) => new URL(path, SITE.url).href;

export async function caseStudies(): Promise<CollectionEntry<'work'>[]> {
  return (await getCollection('work')).sort((a, b) => a.data.order - b.data.order);
}

/** "Name – descriptor", rebuilt from the title so the dash is always the same. */
export function projectTitle(entry: CollectionEntry<'work'>): string {
  const { name, descriptor } = splitTitle(entry.data.title);
  return descriptor ? `${name} – ${descriptor}` : name;
}

export const caseStudyUrl = (entry: CollectionEntry<'work'>) => abs(`/work/${entry.id}/`);

/** The title, summary and facts that open both /llms.txt and /llms-full.txt. */
export function header(): string {
  const { locality, region, country, timeZone } = SITE.location;
  const summary =
    `${SITE.name} is an ${SITE.role} at ${SITE.employer} in ${locality}, ${region}, ${country} (${timeZone}). ` +
    'He builds production LLM systems: RAG with source-cited answers, AI agents with automated checks, ' +
    'real-time LLM pipelines and computer vision, and owns them end to end, from retrieval design and evaluation ' +
    'to FastAPI backends and deployment. He is open to remote roles (full-time, contract or through an employer of record) and works the team’s hours, in the US or Europe.';
  const experience = RESUME.experience.map(
    (job) => `- Experience: ${job.role}, ${job.company}, ${job.where}, ${job.when}`,
  );
  const education = RESUME.education.map(
    (school) => `- Education: ${school.degree}, ${school.school} (${school.when})`,
  );
  return [
    `# ${SITE.name}`,
    '',
    `> ${summary}`,
    '',
    `Other people share the name ${SITE.name}. This site is only about one of them: ${SITE.disambiguation.charAt(0).toLowerCase()}${SITE.disambiguation.slice(1)}`,
    '',
    `- Role: ${SITE.role}`,
    ...experience,
    ...education,
    `- Location: ${locality}, ${region}, ${country} (${timeZone}); open to remote roles, working the team’s hours in the US or Europe`,
    `- Email: ${SITE.email}`,
    `- LinkedIn: ${SITE.linkedin}`,
    `- GitHub: ${SITE.github}`,
    `- Website: ${SITE.url}/`,
    '',
  ].join('\n');
}

export const pages = () => [
  `- [About](${abs('/about/')}): background, education and how to get in touch`,
  `- [Work](${abs('/work/')}): all case studies, each with the evidence behind its results`,
  `- [Talks](${abs('/talks/')}): talks and sessions on AI, RAG and LLM systems`,
  `- [Resume](${abs('/resume/')}): the resume as a web page`,
  `- [Resume (PDF)](${abs(RESUME_PDF)}): the resume to download`,
];

export const textResponse = (body: string) =>
  new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

export const GET: APIRoute = async () => {
  const work = await caseStudies();
  const body = [
    header(),
    '## Case studies',
    '',
    ...work.map((entry) => `- [${projectTitle(entry)}](${caseStudyUrl(entry)}): ${entry.data.outcome}`),
    '',
    '## Pages',
    '',
    ...pages(),
    '',
    '## Optional',
    '',
    `- [Full text](${abs('/llms-full.txt')}): every case study in full, as plain text`,
    '',
  ].join('\n');
  return textResponse(body);
};

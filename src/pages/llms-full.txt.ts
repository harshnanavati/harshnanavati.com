import type { APIRoute } from 'astro';
import { RESUME } from '../lib/resume';
import { caseStudies, caseStudyUrl, header, pages, projectTitle, textResponse } from './llms.txt.ts';

// /llms-full.txt: the /llms.txt header, then every case study in full as plain text, so an
// assistant can answer questions about the work without fetching each page.
export const prerender = true;

/** The MDX body without its import and diagram-component lines, headings nested under the project. */
function plainBody(body = ''): string {
  return body
    .split('\n')
    .filter((line) => !line.startsWith('import ') && !line.trimStart().startsWith('<ProjectDiagram'))
    .map((line) => (/^#{1,5} /.test(line) ? `#${line}` : line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const GET: APIRoute = async () => {
  const work = await caseStudies();
  const skills = RESUME.skills.map((s) => `- ${s.group}: ${s.items}`);
  const studies = work.flatMap((entry) => {
    const { data } = entry;
    return [
      `## ${projectTitle(entry)}`,
      '',
      `- URL: ${caseStudyUrl(entry)}`,
      `- Outcome: ${data.outcome}`,
      ...(data.role ? [`- Role: ${data.role}`] : []),
      `- Type: ${data.kind}`,
      `- Stack: ${data.stack.join(', ')}`,
      '',
      plainBody(entry.body),
      '',
    ];
  });
  const body = [
    header(),
    '## Skills',
    '',
    ...skills,
    '',
    '## Pages',
    '',
    ...pages(),
    '',
    ...studies,
  ].join('\n');
  return textResponse(body);
};

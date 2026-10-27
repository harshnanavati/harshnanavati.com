import { describe, expect, it } from 'vitest';
import { ALL_PAGES, loadPage, WORK_SLUGS } from './helpers';

const main = (path: string) => loadPage(path).querySelector('main')!;
const text = (path: string) => main(path).text.replace(/\s+/g, ' ').replace(/’/g, "'");

describe('project cards on the Work page', () => {
  const rows = () => main('/work/').querySelectorAll('ul.rows li.row');

  it('lead with the product name, the descriptor under it', () => {
    const first = rows()[0];
    expect(first.querySelector('.title')!.text.trim()).toBe('DocuPilot');
    expect(first.querySelector('.descriptor')!.text.trim()).toBe('Enterprise RAG Platform');
    const face = rows()[4];
    expect(face.querySelector('.title')!.text.trim()).toBe('AI Face Matching System');
    expect(face.querySelector('.descriptor')!.text.trim()).toBe('GPU Photo-Tagging Pipeline');
  });

  it('label each preview as an illustration and drop the arrow', () => {
    for (const row of rows()) {
      expect(row.querySelector('.preview-label')?.text.trim()).toBe('Illustration');
      expect(row.querySelector('.arrow')).toBeNull();
    }
  });
});

describe('product illustrations', () => {
  it.each(ALL_PAGES)('%s draws no fake browser bar', (path) => {
    expect(main(path).querySelector('.product-moment .bar, .product-moment .dots')).toBeNull();
  });
});

describe('next project link', () => {
  it('names the product without its descriptor', () => {
    expect(main('/work/docupilot/').querySelector('.next-title')!.text.trim()).toBe('RAG Support Chatbot');
  });
});

describe('labels say exactly what was measured', () => {
  const statLabels = (slug: string) =>
    main(`/work/${slug}/`)
      .querySelectorAll('.stats li, .meta-card .result')
      .map((li) => li.text.replace(/\s+/g, ' '));

  it('Intelligence Layer scores are named as the Elo baseline', () => {
    const labels = statLabels('crickpal-intelligence-layer');
    expect(labels.some((l) => l.includes('0.643') && l.includes('Elo baseline log-loss'))).toBe(true);
    expect(labels.some((l) => l.includes('0.227') && l.includes('Elo baseline Brier score'))).toBe(true);
  });

  it('QuantumCopilot speed-up is scoped to the scenario stage', () => {
    const labels = statLabels('quantumcopilot');
    expect(labels.some((l) => l.includes('~3x') && l.includes('faster scenario stage'))).toBe(true);
    expect(text('/work/quantumcopilot/')).not.toContain('lower latency');
  });

  it('DocuPilot names the decision for what it does', () => {
    expect(text('/work/docupilot/')).toContain('Answer-grounded citation selection');
    expect(text('/work/docupilot/')).not.toMatch(/rerank after answering/i);
  });

  it('AI Summary qualifies exactly-once as a single-instance guarantee', () => {
    expect(text('/work/crickpal-ai-summary/')).toMatch(/exactly-once processing on a single instance/i);
  });

  it('the resume uses the same wording', () => {
    const resume = text('/resume/');
    expect(resume).toContain('answer-grounded citation selection');
    expect(resume).not.toContain('answer-grounded reranking');
    expect(resume).toContain('~3x faster scenario stage');
    expect(resume).toMatch(/exactly-once batching on a single instance/);
  });
});

describe('resume', () => {
  it('leads the Deloitte role with the Spark, Scala and SQL work', () => {
    const jobs = main('/resume/').querySelectorAll('.job');
    const deloitte = jobs.find((j) => j.text.includes('Deloitte'))!;
    expect(deloitte.querySelector('.points li')!.text.trim()).toMatch(/^Used Spark, Scala and SQL/);
  });

  it('describes the Power BI work plainly, without an unbacked percentage', () => {
    const deloitte = main('/resume/').querySelectorAll('.job').find((j) => j.text.includes('Deloitte'))!;
    expect(deloitte.text).toContain('Built Power BI dashboards for enterprise audit reporting workflows.');
    expect(deloitte.text).not.toMatch(/\d+%/);
  });
});

describe('case studies', () => {
  it.each(WORK_SLUGS)('%s keeps the full title in its share card', (slug) => {
    const og = loadPage(`/work/${slug}/`).querySelector('meta[property="og:title"]')!.getAttribute('content')!;
    expect(og).toContain(main(`/work/${slug}/`).querySelector('h1')!.text.trim());
  });
});

describe('skills are backed by the work', () => {
  it('lists no cloud platform that no project uses', () => {
    const skills = main('/resume/').querySelector('.resume-aside')!.text;
    expect(skills).not.toMatch(/AWS|Kubernetes/);
  });

  it('ViperMind shows the agent, cache, database and container stack it is cited for', () => {
    const stack = main('/work/vipermind/').querySelector('.meta-card dd.stack')!.text;
    for (const tool of ['LangGraph', 'LangChain', 'Redis', 'PostgreSQL', 'Docker Compose']) expect(stack).toContain(tool);
  });

  it('the hero counts only the Masterly Solutions systems', () => {
    const basis = main('/').querySelector('#cite-hero-systems .cite-basis')!.text;
    expect(basis).toContain('Masterly Solutions');
    expect(basis).toContain('personal project');
  });
});

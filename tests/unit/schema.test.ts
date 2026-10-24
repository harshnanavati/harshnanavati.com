import { describe, expect, it } from 'vitest';
import { workSchema } from '../../src/content/schema';

const valid = {
  title: 'DocuPilot – Enterprise RAG Platform',
  order: 1,
  outcome: 'An AI assistant that answers staff questions.',
  summary: 'Answers for 600+ staff, with a source for every answer',
  chips: [
    { value: '600+', label: 'staff' },
    { value: '14', label: 'document categories' },
    { value: '~40%', label: 'fewer manual queries' },
  ],
  tags: ['rag', 'docling', 'faiss'],
  videoTitle: 'How DocuPilot backs every answer with a source',
  stack: ['Python', 'FastAPI'],
};

describe('workSchema', () => {
  it('accepts a valid entry', () => {
    expect(() => workSchema.parse(valid)).not.toThrow();
  });

  it('rejects a missing outcome', () => {
    const { outcome, ...rest } = valid;
    expect(() => workSchema.parse(rest)).toThrow();
  });

  it('rejects a missing home summary', () => {
    const { summary, ...rest } = valid;
    expect(() => workSchema.parse(rest)).toThrow();
  });

  it('rejects anything other than exactly 3 tags', () => {
    expect(() => workSchema.parse({ ...valid, tags: ['rag', 'faiss'] })).toThrow();
  });

  it('rejects a malformed YouTube id', () => {
    expect(() => workSchema.parse({ ...valid, youtubeId: 'short' })).toThrow();
  });

  it('rejects an order outside 1–6', () => {
    expect(() => workSchema.parse({ ...valid, order: 7 })).toThrow();
  });

  it('rejects a link that is not a URL', () => {
    expect(() => workSchema.parse({ ...valid, links: [{ label: 'x', href: 'not a url' }] })).toThrow();
  });
});

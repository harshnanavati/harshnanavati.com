import type { Diagram } from './types';

export const diagrams: Diagram[] = [
  {
    lanes: [
      {
        label: 'Ingest',
        steps: [
          { label: 'Upload' },
          { label: 'Duplicate check', tech: 'sha-256' },
          { label: 'Parse structure', tech: 'docling · ocr · tables' },
          { label: 'Structure-aware chunks', tech: 'page + position kept' },
          { label: 'Embed', tech: 'text-embedding-3-small' },
          { label: 'One index per document', tech: 'faiss' },
        ],
      },
      {
        label: 'Ask',
        steps: [
          { label: 'Login', tech: 'jwt' },
          { label: 'Allowed documents for this role' },
          { label: 'Search each allowed document', tech: 'faiss' },
          { label: 'Write the answer', tech: 'gpt-4o-mini' },
          { label: 'Answer-grounded citation selection', key: true },
          { label: 'Answer with page highlights' },
        ],
      },
    ],
  },
];

import type { Diagram } from './types';

export const diagrams: Diagram[] = [
  {
    lanes: [
      {
        label: 'Answer',
        steps: [
          { label: 'Q&A knowledge base' },
          { label: 'Chunk on question-answer boundaries' },
          { label: 'Embed', tech: 'text-embedding-3-large' },
          { label: 'Search', tech: 'faiss' },
          { label: "Passages + history + the user's team and schedule" },
          { label: 'LLM answer' },
        ],
      },
      {
        label: 'Learn',
        steps: [
          { label: 'Staff mark an answer wrong' },
          { label: 'Staff correction loop', key: true },
          { label: 'Written back to the knowledge base' },
          { label: 'Index rebuilt' },
        ],
      },
    ],
  },
];

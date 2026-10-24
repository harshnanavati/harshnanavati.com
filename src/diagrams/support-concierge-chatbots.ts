import type { Diagram } from './types';

export const diagrams: Diagram[] = [
  {
    caption: 'Support bot',
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
  {
    caption: 'Concierge bot, before and after',
    lanes: [
      {
        label: 'Before',
        steps: [
          { label: 'Website scrape' },
          { label: 'Q&A pairs' },
          { label: 'Change detection', tech: 'content hash' },
          { label: 'Versioned index', tech: 'faiss' },
          { label: 'Daily scheduler' },
          { label: 'Scope classifier' },
          { label: 'Answer' },
        ],
      },
      {
        label: 'After',
        steps: [
          { label: 'All ~50 FAQs in one cached prompt', key: true },
          { label: 'One model call: route + answer + follow-up' },
          { label: 'Fixed replies for out-of-scope questions' },
        ],
      },
    ],
  },
];

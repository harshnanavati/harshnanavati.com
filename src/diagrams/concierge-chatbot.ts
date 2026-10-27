import type { Diagram } from './types';

export const diagrams: Diagram[] = [
  {
    caption: 'The concierge, before and after',
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

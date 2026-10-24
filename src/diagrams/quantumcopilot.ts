import type { Diagram } from './types';

export const diagrams: Diagram[] = [
  {
    caption: 'If no loan details are found, it falls back to a general finance chat.',
    lanes: [
      {
        steps: [
          { label: 'Question' },
          { label: 'API key check', tech: 'hmac' },
          { label: 'Load conversation memory', tech: 'sql server' },
          { label: 'LLM extracts typed parameters', tech: 'gpt-4.1-nano', key: true },
          { label: 'Build up to 3 scenarios' },
          { label: 'Calculation engine, in parallel', tech: 'asyncio' },
          { label: 'Comparison table + memory update' },
        ],
      },
    ],
  },
];

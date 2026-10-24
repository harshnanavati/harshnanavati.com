import type { Diagram } from './types';

export const diagrams: Diagram[] = [
  {
    lanes: [
      {
        label: 'Process',
        steps: [
          { label: 'Live commentary', tech: 'mongodb' },
          { label: 'Poller checks active matches' },
          { label: 'Batch every few deliveries' },
          { label: 'Previous summary + new deliveries only', key: true },
          { label: 'Self-hosted LLM', tech: 'ollama' },
          { label: 'Narrative + headline' },
        ],
      },
      {
        label: 'Serve',
        steps: [
          { label: 'Saved together', tech: 'sql server · one transaction' },
          { label: 'Summary API', tech: 'fastapi' },
          { label: 'Admin console', tech: 'angular · jwt' },
        ],
      },
    ],
  },
];

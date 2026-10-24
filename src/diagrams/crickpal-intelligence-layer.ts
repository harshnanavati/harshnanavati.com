import type { Diagram } from './types';

export const diagrams: Diagram[] = [
  {
    lanes: [
      {
        label: 'Model pipeline',
        steps: [
          { label: 'Match history', tech: 'mongodb' },
          { label: 'Chronological replay' },
          { label: 'Elo ratings' },
          { label: 'Feature modules' },
          { label: 'Logistic regression', tech: 'chronological splits' },
          { label: 'Backtests' },
        ],
      },
      {
        label: 'Feature agent',
        steps: [
          { label: 'Analyst spec + worked examples' },
          { label: 'LLM agent writes code', tech: 'openai' },
          { label: 'Verification harness', tech: 'golden · symmetry · leakage · determinism', key: true },
          { label: 'Repair loop' },
          { label: 'Human approval' },
          { label: 'Feature goes live' },
        ],
      },
    ],
  },
];

import type { Diagram } from './types';

export const diagrams: Diagram[] = [
  {
    caption: 'If OpenAI fails, a pre-written lesson, question set or hint is served instead.',
    lanes: [
      {
        label: 'Learn',
        steps: [
          { label: 'Learner request', tech: 'jwt sign-in' },
          { label: 'LangGraph router', tech: '4 agents' },
          { label: 'Lesson cache', tech: 'redis · hashed context' },
          { label: 'LLM writes the lesson', tech: 'gpt-4 · json' },
        ],
      },
      {
        label: 'Test',
        steps: [
          { label: 'LLM writes questions', tech: 'with an answer key' },
          { label: 'Learner answers' },
          { label: 'Answers graded by code', tech: 'answer key · pass mark', key: true },
          { label: 'Progress saved', tech: 'postgresql' },
        ],
      },
    ],
  },
];

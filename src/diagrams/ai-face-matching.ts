import type { Diagram } from './types';

export const diagrams: Diagram[] = [
  {
    lanes: [
      {
        label: 'Schedule',
        steps: [
          { label: 'Scheduler', tech: 'apscheduler' },
          { label: 'Find new games' },
          { label: 'Job queue', tech: 'retry budget · lease recovery · parking', key: true },
        ],
      },
      {
        label: 'Roster photos',
        steps: [
          { label: 'Detect face', tech: 'mtcnn' },
          { label: 'Align' },
          { label: 'Embed', tech: 'facenet · 512-d' },
          { label: 'Cache' },
        ],
      },
      {
        label: 'Game photos',
        steps: [
          { label: 'Detect every face', tech: 'mtcnn' },
          { label: 'Embed', tech: 'facenet' },
          { label: "Compare against the game's team rosters" },
          { label: 'Matches for staff review' },
        ],
      },
    ],
  },
];

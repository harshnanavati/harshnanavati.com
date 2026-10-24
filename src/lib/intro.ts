import type { Diagram } from '../diagrams/types';

// Video 0, "Who I am and what I build". Paste the 11-character YouTube ID here
// once it's uploaded; it then appears on the About page and as a link on the home page.
export const INTRO_VIDEO: { title: string; youtubeId?: string } = {
  title: 'Who I am and what I build',
  youtubeId: undefined,
};

// Shown in the About page's video slot until the intro video exists.
export const INTRO_DIAGRAM: Diagram = {
  lanes: [
    {
      steps: [
        { label: 'Ship production AI' },
        { label: 'Ground answers in sources', key: true },
        { label: 'Verify before shipping' },
        { label: 'Keep it running' },
      ],
    },
  ],
};

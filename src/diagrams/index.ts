import type { Diagram } from './types';
import { diagrams as aiFaceMatching } from './ai-face-matching';
import { diagrams as crickpalAiSummary } from './crickpal-ai-summary';
import { diagrams as crickpalIntelligenceLayer } from './crickpal-intelligence-layer';
import { diagrams as docupilot } from './docupilot';
import { diagrams as quantumcopilot } from './quantumcopilot';
import { diagrams as supportConciergeChatbots } from './support-concierge-chatbots';

export type WorkSlug =
  | 'docupilot'
  | 'crickpal-intelligence-layer'
  | 'crickpal-ai-summary'
  | 'ai-face-matching'
  | 'quantumcopilot'
  | 'support-concierge-chatbots';

export const DIAGRAMS: Record<WorkSlug, Diagram[]> = {
  docupilot,
  'crickpal-intelligence-layer': crickpalIntelligenceLayer,
  'crickpal-ai-summary': crickpalAiSummary,
  'ai-face-matching': aiFaceMatching,
  quantumcopilot,
  'support-concierge-chatbots': supportConciergeChatbots,
};

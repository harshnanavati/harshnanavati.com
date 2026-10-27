import type { Diagram } from './types';
import { diagrams as aiFaceMatching } from './ai-face-matching';
import { diagrams as crickpalAiSummary } from './crickpal-ai-summary';
import { diagrams as crickpalIntelligenceLayer } from './crickpal-intelligence-layer';
import { diagrams as docupilot } from './docupilot';
import { diagrams as quantumcopilot } from './quantumcopilot';
import { diagrams as conciergeChatbot } from './concierge-chatbot';
import { diagrams as ragSupportChatbot } from './rag-support-chatbot';
import { diagrams as vipermind } from './vipermind';

export type WorkSlug =
  | 'docupilot'
  | 'crickpal-intelligence-layer'
  | 'crickpal-ai-summary'
  | 'ai-face-matching'
  | 'quantumcopilot'
  | 'rag-support-chatbot'
  | 'concierge-chatbot'
  | 'vipermind';

export const DIAGRAMS: Record<WorkSlug, Diagram[]> = {
  docupilot,
  'crickpal-intelligence-layer': crickpalIntelligenceLayer,
  'crickpal-ai-summary': crickpalAiSummary,
  'ai-face-matching': aiFaceMatching,
  quantumcopilot,
  'rag-support-chatbot': ragSupportChatbot,
  'concierge-chatbot': conciergeChatbot,
  vipermind,
};

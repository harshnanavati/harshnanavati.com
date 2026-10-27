// Per-project visuals: a "product moment" illustration that opens the page, and a
// system architecture diagram for desktop widths inside "How it works".
import AiSummaryArchitecture from '../components/visuals/AiSummaryArchitecture.astro';
import AiSummaryMoment from '../components/visuals/AiSummaryMoment.astro';
import ConciergeMoment from '../components/visuals/ConciergeMoment.astro';
import DocuPilotArchitecture from '../components/visuals/DocuPilotArchitecture.astro';
import DocuPilotMoment from '../components/visuals/DocuPilotMoment.astro';
import FaceMatchingArchitecture from '../components/visuals/FaceMatchingArchitecture.astro';
import FaceMatchingMoment from '../components/visuals/FaceMatchingMoment.astro';
import IntelligenceLayerArchitecture from '../components/visuals/IntelligenceLayerArchitecture.astro';
import IntelligenceLayerMoment from '../components/visuals/IntelligenceLayerMoment.astro';
import QuantumCopilotArchitecture from '../components/visuals/QuantumCopilotArchitecture.astro';
import QuantumCopilotMoment from '../components/visuals/QuantumCopilotMoment.astro';
import SupportBotArchitecture from '../components/visuals/SupportBotArchitecture.astro';
import SupportMoment from '../components/visuals/SupportMoment.astro';
import ViperMindArchitecture from '../components/visuals/ViperMindArchitecture.astro';
import ViperMindMoment from '../components/visuals/ViperMindMoment.astro';
import type { WorkSlug } from '../diagrams';

type AstroComponent = typeof QuantumCopilotMoment;

export const MOMENTS: Partial<Record<WorkSlug, AstroComponent>> = {
  docupilot: DocuPilotMoment,
  'crickpal-intelligence-layer': IntelligenceLayerMoment,
  'crickpal-ai-summary': AiSummaryMoment,
  'ai-face-matching': FaceMatchingMoment,
  quantumcopilot: QuantumCopilotMoment,
  'rag-support-chatbot': SupportMoment,
  'concierge-chatbot': ConciergeMoment,
  vipermind: ViperMindMoment,
};

export const ARCHITECTURES: Partial<Record<WorkSlug, AstroComponent>> = {
  docupilot: DocuPilotArchitecture,
  'crickpal-intelligence-layer': IntelligenceLayerArchitecture,
  'crickpal-ai-summary': AiSummaryArchitecture,
  'ai-face-matching': FaceMatchingArchitecture,
  quantumcopilot: QuantumCopilotArchitecture,
  'rag-support-chatbot': SupportBotArchitecture,
  vipermind: ViperMindArchitecture,
};

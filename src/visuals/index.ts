// Optional per-project visuals: a "product moment" illustration near the top of the page,
// and a system architecture diagram for desktop widths inside "How it works".
// Projects without an entry keep the step-by-step diagram only.
import QuantumCopilotArchitecture from '../components/visuals/QuantumCopilotArchitecture.astro';
import QuantumCopilotMoment from '../components/visuals/QuantumCopilotMoment.astro';
import type { WorkSlug } from '../diagrams';

type AstroComponent = typeof QuantumCopilotMoment;

export const MOMENTS: Partial<Record<WorkSlug, AstroComponent>> = {
  quantumcopilot: QuantumCopilotMoment,
};

export const ARCHITECTURES: Partial<Record<WorkSlug, AstroComponent>> = {
  quantumcopilot: QuantumCopilotArchitecture,
};

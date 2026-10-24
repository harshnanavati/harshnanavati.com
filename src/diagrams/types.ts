import { z } from 'astro/zod';

export type Step = { label: string; tech?: string; key?: boolean };
export type Lane = { label?: string; steps: Step[] };
export type Diagram = { caption?: string; lanes: Lane[] };

const stepSchema = z.object({ label: z.string().min(1), tech: z.string().optional(), key: z.boolean().optional() });
const laneSchema = z.object({ label: z.string().optional(), steps: z.array(stepSchema).min(1) });

// Every diagram highlights exactly one step: the key idea of that project.
export const diagramSchema = z
  .object({ caption: z.string().optional(), lanes: z.array(laneSchema).min(1) })
  .refine((d) => d.lanes.flatMap((l) => l.steps).filter((s) => s.key).length === 1, {
    message: 'A diagram must have exactly one key step',
  });

import { z } from 'astro/zod';

const chip = z.object({ value: z.string().min(1), label: z.string().min(1) });
const link = z.object({ label: z.string().min(1), href: z.url() });

export const workSchema = z.object({
  title: z.string().min(1),
  order: z.number().int().min(1).max(6),
  outcome: z.string().min(1),
  summary: z.string().min(1),
  kind: z.string().min(1),
  role: z.string().min(1).optional(),
  chips: z.array(chip).min(3),
  tags: z.array(z.string().min(1)).length(3),
  links: z.array(link).optional(),
  videoTitle: z.string().min(1),
  youtubeId: z
    .string()
    .regex(/^[\w-]{11}$/)
    .optional(),
  privacyNote: z.string().optional(),
  stack: z.array(z.string().min(1)).min(1),
});

export type Work = z.infer<typeof workSchema>;

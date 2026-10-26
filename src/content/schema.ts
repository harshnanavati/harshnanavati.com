import { z } from 'astro/zod';

// A result chip. Any chip whose value contains a number must say how that number was
// arrived at (basis) and which section of the page backs it (evidence, a heading id).
const chip = z
  .object({
    value: z.string().min(1),
    label: z.string().min(1),
    basis: z.string().min(15).optional(),
    evidence: z.string().min(1).optional(),
  })
  .refine((c) => !/\d/.test(c.value) || (c.basis !== undefined && c.evidence !== undefined), {
    message: 'Numbers need a basis and an evidence section',
  });
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

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { workSchema } from './content/schema';

const work = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/work' }),
  schema: workSchema,
});

export const collections = { work };

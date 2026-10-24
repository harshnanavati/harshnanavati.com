// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://harshnanavati.com',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/og/') && !page.includes('/404'),
    }),
  ],
});

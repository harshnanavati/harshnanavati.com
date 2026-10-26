// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://harshnanavati.com',
  // One request per page: the CSS is small, so it ships inside the HTML.
  build: { inlineStylesheets: 'always' },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/og/') && !page.includes('/404'),
    }),
  ],
});

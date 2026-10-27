// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://harshnanavati.com',
  // One request per page: the CSS is small, so it ships inside the HTML.
  build: { inlineStylesheets: 'always' },
  // The two chatbots used to share one page; keep its old address working.
  redirects: { '/work/support-concierge-chatbots': '/work/rag-support-chatbot/' },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/og/') && !page.includes('/404') && !page.includes('support-concierge-chatbots'),
    }),
  ],
});

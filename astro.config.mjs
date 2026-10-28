// @ts-check
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const root = fileURLToPath(new URL('.', import.meta.url));

// Every file a page's content comes from, so the sitemap can say when that content last changed:
// the page itself and the data files it reads (the resume page's text lives in resume.ts, for example).
const sourceFiles = (pathname) => {
  if (pathname === '/') return ['src/pages/index.astro', 'src/lib/site.ts', 'src/content/work'];
  if (pathname === '/work/') return ['src/pages/work/index.astro', 'src/content/work'];
  if (pathname === '/about/') return ['src/pages/about.astro', 'src/lib/site.ts'];
  if (pathname === '/resume/') return ['src/pages/resume.astro', 'src/lib/resume.ts'];
  if (pathname === '/talks/') return ['src/pages/talks.astro', 'src/assets/talks'];
  const work = pathname.match(/^\/work\/([^/]+)\/$/);
  return work ? [`src/content/work/${work[1]}.mdx`] : [`src/pages${pathname.replace(/\/$/, '')}.astro`];
};

// The last commit to touch any of the files. Without git, or for files never committed, there's no date,
// and the URL goes out without a lastmod rather than failing the build.
const lastCommitDate = (files) => {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI', '--', ...files], { cwd: root, encoding: 'utf8' }).trim() || undefined;
  } catch {
    return undefined;
  }
};

// Only the latin file of each Fontsource variable font, read from node_modules, so the build needs no network.
// Anything outside latin (the rupee sign, arrows) comes from the size-matched fallback or a system font.
const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const font = (name, cssVariable, file, weight, fallbacks) => ({
  provider: fontProviders.local(),
  name,
  cssVariable,
  fallbacks,
  options: { variants: [{ src: [file], weight, style: /** @type {const} */ ('normal'), unicodeRange: [LATIN] }] },
});

export default defineConfig({
  site: 'https://harshnanavati.com',
  // One request per page: the CSS is small, so it ships inside the HTML.
  build: { inlineStylesheets: 'always' },
  // The two chatbots used to share one page; keep its old address working.
  redirects: { '/work/support-concierge-chatbots': '/work/rag-support-chatbot/' },
  fonts: [
    font('Inter', '--font-inter', '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', '100 900', ['system-ui', 'sans-serif']),
    font('Source Serif 4', '--font-source-serif', '@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2', '200 900', ['Georgia', 'serif']),
    font('JetBrains Mono', '--font-jetbrains-mono', '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2', '100 800', ['ui-monospace', 'monospace']),
  ],
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/og/') && !page.includes('/404') && !page.includes('support-concierge-chatbots'),
      serialize: (item) => {
        const lastmod = lastCommitDate(sourceFiles(new URL(item.url).pathname));
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
});

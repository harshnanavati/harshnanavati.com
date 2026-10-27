import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import type { APIRoute } from 'astro';
import satori from 'satori';

const require = createRequire(import.meta.url);
const font = readFileSync(require.resolve('@fontsource/inter/files/inter-latin-700-normal.woff'));

/** The favicon's HN mark (navy rounded square, white bold "HN") as a PNG of the given size. */
export async function renderMark(size: number): Promise<Uint8Array> {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          borderRadius: Math.round((size * 14) / 64),
          background: '#1f3864',
          color: '#ffffff',
          fontSize: Math.round(size * 0.42),
          fontWeight: 700,
          fontFamily: 'Inter',
          letterSpacing: -size / 90,
        },
        children: 'HN',
      },
    },
    { width: size, height: size, fonts: [{ name: 'Inter', data: font, weight: 700, style: 'normal' }] },
  );
  return new Uint8Array(new Resvg(svg).render().asPng());
}

// A PNG fallback for browsers and crawlers that don't use the SVG favicon.
export const GET: APIRoute = async () =>
  new Response(await renderMark(48), { headers: { 'Content-Type': 'image/png' } });

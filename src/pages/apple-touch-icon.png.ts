import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import type { APIRoute } from 'astro';
import satori from 'satori';

const require = createRequire(import.meta.url);
const font = readFileSync(require.resolve('@fontsource/inter/files/inter-latin-500-normal.woff'));

// The home-screen icon for iPhones and iPads: the favicon's monogram on a full square,
// since iOS rounds the corners itself and fills any transparency with black.
export const GET: APIRoute = async () => {
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
          background: '#1f3864',
          color: '#ffffff',
          fontSize: 72,
          fontWeight: 500,
          fontFamily: 'Inter',
          letterSpacing: 2,
        },
        children: 'HN',
      },
    },
    { width: 180, height: 180, fonts: [{ name: 'Inter', data: font, weight: 500, style: 'normal' }] },
  );
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};

// Draws the 1200×630 link-preview cards. The routes beside this file encode them: the home card is a
// photo, so it ships as a JPEG; the text-only cards are small palette PNGs.
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';
import { SITE } from '../../lib/site';

const require = createRequire(import.meta.url);
const font = (weight: 400 | 500) =>
  readFileSync(require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`));

// The home card is the one shared most, so it carries a headshot. It has its own, tighter crop: a face
// reads at link-preview size, and LinkedIn caches the card, so it shouldn't change with the site photo.
const cardPhoto = 'src/assets/og/headshot-card.jpg';
const headshot = existsSync(cardPhoto) && `data:image/jpeg;base64,${readFileSync(cardPhoto).toString('base64')}`;

const node = (type: string, style: Record<string, unknown>, children: unknown) => ({ type, props: { style, children } });

// Big enough to read when LinkedIn shrinks the card to a third of a phone screen.
const homeCard = (photo: string) =>
  node('div', { display: 'flex', width: '100%', height: '100%', background: '#ffffff', fontFamily: 'Inter' }, [
    node('div', { width: 24, height: '100%', background: '#1f3864' }, ''),
    node(
      'div',
      { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 64px 64px 72px', flex: 1 },
      [
        node('div', { display: 'flex', flexDirection: 'column' }, [
          node('div', { fontSize: 76, fontWeight: 500, color: '#1a1a1a', lineHeight: 1.05 }, SITE.name),
          node('div', { fontSize: 44, fontWeight: 500, color: '#1f3864', marginTop: 20 }, SITE.role),
          node('div', { fontSize: 34, color: '#5f5e5a', lineHeight: 1.35, marginTop: 36 }, 'Production LLM systems used by 8,800+ people'),
        ]),
        node('div', { fontSize: 30, color: '#1f3864' }, 'harshnanavati.com'),
      ],
    ),
    { type: 'img', props: { src: photo, width: 460, height: 630, style: { objectFit: 'cover' } } },
  ]);

const textCard = (title: string, subtitle: string) =>
  node('div', { display: 'flex', width: '100%', height: '100%', background: '#ffffff', fontFamily: 'Inter' }, [
    node('div', { width: 24, height: '100%', background: '#1f3864' }, ''),
    node(
      'div',
      { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px', flex: 1 },
      [
        node('div', { display: 'flex', flexDirection: 'column', gap: 28 }, [
          node('div', { fontSize: 64, fontWeight: 500, color: '#1a1a1a', lineHeight: 1.15 }, title),
          node('div', { fontSize: 32, color: '#5f5e5a', lineHeight: 1.4 }, subtitle),
        ]),
        node('div', { fontSize: 28, color: '#1f3864' }, 'harshnanavati.com'),
      ],
    ),
  ]);

/** The card as a sharp pipeline, ready to encode. Without the headshot file the home card falls back to text. */
export async function renderCard({ title, subtitle, home = false }: { title: string; subtitle: string; home?: boolean }) {
  const svg = await satori((home && headshot ? homeCard(headshot) : textCard(title, subtitle)) as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: font(400), weight: 400, style: 'normal' },
      { name: 'Inter', data: font(500), weight: 500, style: 'normal' },
    ],
  });
  const image = new Resvg(svg).render();
  return sharp(image.pixels, { raw: { width: image.width, height: image.height, channels: 4 } });
}

export const HOME_CARD = {
  title: SITE.name,
  subtitle: 'Applied AI Engineer. I build production LLM systems: RAG, AI agents and evaluation.',
  home: true,
};

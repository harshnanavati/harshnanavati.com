import type { APIRoute } from 'astro';
import { HOME_CARD, renderCard } from './_card';

// A photo compresses far better as a JPEG: WhatsApp drops link thumbnails over about 300 KB.
// GitHub Pages sets the Content-Type from the extension, so this has to stay a .jpg URL.
export const GET: APIRoute = async () => {
  const jpeg = await (await renderCard(HOME_CARD)).flatten({ background: '#ffffff' }).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { 'Content-Type': 'image/jpeg' } });
};

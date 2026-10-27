import type { APIRoute } from 'astro';
import { renderMark } from './favicon-48.png.ts';

// /favicon.ico, which browsers and crawlers request without being told to. An ICO file may hold
// PNG images as they are, so this is just a small directory header in front of the rendered marks.
const SIZES = [16, 32, 48];

export const GET: APIRoute = async () => {
  const images = await Promise.all(SIZES.map(renderMark));
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((png, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(SIZES[i], entry); // width
    header.writeUInt8(SIZES[i], entry + 1); // height
    header.writeUInt8(0, entry + 2); // no palette
    header.writeUInt8(0, entry + 3); // reserved
    header.writeUInt16LE(1, entry + 4); // colour planes
    header.writeUInt16LE(32, entry + 6); // bits per pixel
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  const ico = Buffer.concat([header, ...images]);
  return new Response(new Uint8Array(ico), { headers: { 'Content-Type': 'image/x-icon' } });
};

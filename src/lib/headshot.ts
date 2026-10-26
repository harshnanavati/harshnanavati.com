import type { ImageMetadata } from 'astro';

// The headshot, once Harsh adds it as src/assets/headshot.(jpg|jpeg|png|webp).
// Pages show it when present and fall back gracefully when it isn't.
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/headshot.{jpg,jpeg,png,webp}', {
  eager: true,
});

export const HEADSHOT: ImageMetadata | undefined = Object.values(files)[0]?.default;

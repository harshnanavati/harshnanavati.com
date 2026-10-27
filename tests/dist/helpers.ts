import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';

export const DIST = join(process.cwd(), 'dist');

export const WORK_SLUGS = [
  'docupilot',
  'rag-support-chatbot',
  'crickpal-intelligence-layer',
  'crickpal-ai-summary',
  'ai-face-matching',
  'quantumcopilot',
  'concierge-chatbot',
  'vipermind',
] as const;

export const ALL_PAGES = ['/', '/work/', '/talks/', '/about/', '/resume/', ...WORK_SLUGS.map((s) => `/work/${s}/`)];

export function pageFile(path: string): string {
  return join(DIST, path, 'index.html');
}

export function loadPage(path: string): HTMLElement {
  const file = pageFile(path);
  if (!existsSync(file)) throw new Error(`Built page missing: ${file}. Run npm run build first.`);
  return parse(readFileSync(file, 'utf8'));
}

export function rawPage(path: string): string {
  return readFileSync(pageFile(path), 'utf8');
}

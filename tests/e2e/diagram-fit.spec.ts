import { expect, test } from '@playwright/test';

// Every label in an architecture box keeps at least this much room on each side, in screen pixels.
// Text renders a fraction wider or narrower on each OS, so this is the floor every machine must clear.
const CLEARANCE = 4;

const slugs = [
  'docupilot',
  'crickpal-intelligence-layer',
  'crickpal-ai-summary',
  'ai-face-matching',
  'quantumcopilot',
  'rag-support-chatbot',
  'vipermind',
];

for (const width of [1440, 1024]) {
  test.describe(`architecture labels fit their boxes at ${width}px`, () => {
    test.use({ viewport: { width, height: 1000 } });

    for (const slug of slugs) {
      test(slug, async ({ page }) => {
        await page.goto(`/work/${slug}/`);
        await expect(page.locator('figure.architecture')).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        // ArchNode draws a <rect>, or a <path> cylinder for stores, followed by its <text> lines.
        const overflows = await page.locator('figure.architecture g.node').evaluateAll((nodes, clearance) => {
          const out: string[] = [];
          for (const node of nodes) {
            const shape = node.querySelector(':scope > rect, :scope > path')!.getBoundingClientRect();
            for (const text of node.querySelectorAll('text')) {
              const t = text.getBoundingClientRect();
              const left = t.left - shape.left;
              const right = shape.right - t.right;
              if (left < clearance || right < clearance) {
                out.push(`"${text.textContent?.trim()}" has ${left.toFixed(1)}px left, ${right.toFixed(1)}px right`);
              }
            }
          }
          return out;
        }, CLEARANCE);
        expect(overflows).toEqual([]);
      });
    }
  });
}

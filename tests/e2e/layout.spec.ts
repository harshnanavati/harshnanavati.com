import { expect, test } from '@playwright/test';

const PAGES = [
  '/',
  '/work/',
  '/talks/',
  '/about/',
  '/resume/',
  '/404',
  '/work/docupilot/',
  '/work/crickpal-intelligence-layer/',
  '/work/crickpal-ai-summary/',
  '/work/ai-face-matching/',
  '/work/quantumcopilot/',
  '/work/rag-support-chatbot/',
  '/work/concierge-chatbot/',
];

test.describe('no horizontal overflow at 360px', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.goto(path);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(360);
    });
  }
});

test.describe('dark mode uses dark tokens', () => {
  test.beforeEach(async ({ page }) => {
    // Dark is a visitor's choice now, remembered from the toggle.
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  });

  test('page and key diagram box switch to dark colors', async ({ page }) => {
    await page.goto('/work/docupilot/');
    const body = await page.evaluate(() => {
      const s = getComputedStyle(document.body);
      return { bg: s.backgroundColor, color: s.color };
    });
    expect(body).toEqual({ bg: 'rgb(18, 18, 18)', color: 'rgb(236, 236, 236)' });
    const keyBorder = await page.locator('.diagram .key').first().evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(keyBorder).toBe('rgb(143, 176, 230)');
  });
});

test.describe('light mode', () => {
  test.use({ colorScheme: 'light' });

  test('page is white with dark text', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(255, 255, 255)');
  });
});

test('every case study opens with an illustration and no video placeholder', async ({ page }) => {
  for (const path of PAGES.filter((p) => p.startsWith('/work/') && p !== '/work/')) {
    await page.goto(path);
    await expect(page.locator('.stage .product-moment')).toBeVisible();
    await expect(page.getByText('Video coming soon')).toHaveCount(0);
  }
});

test.describe('mobile diagram stacks vertically', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('steps sit on top of each other', async ({ page }) => {
    await page.goto('/work/docupilot/');
    await expect(page.locator('figure.architecture')).toBeHidden();
    const steps = page.locator('.prose .phone-only .lane').first().locator('.step');
    const first = await steps.nth(0).boundingBox();
    const second = await steps.nth(1).boundingBox();
    expect(first && second).toBeTruthy();
    expect(Math.round(first!.x)).toBe(Math.round(second!.x));
    expect(second!.y).toBeGreaterThan(first!.y);
  });
});

test('desktop diagram flows left to right', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/work/concierge-chatbot/');
  const steps = page.locator('.prose > figure.diagram .lane').first().locator('.step');
  const first = await steps.nth(0).boundingBox();
  const second = await steps.nth(1).boundingBox();
  expect(second!.x).toBeGreaterThan(first!.x);
  expect(Math.round(second!.y)).toBe(Math.round(first!.y));
});

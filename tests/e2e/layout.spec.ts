import { expect, test } from '@playwright/test';

const PAGES = [
  '/',
  '/about/',
  '/resume/',
  '/404',
  '/work/docupilot/',
  '/work/crickpal-intelligence-layer/',
  '/work/crickpal-ai-summary/',
  '/work/ai-face-matching/',
  '/work/quantumcopilot/',
  '/work/support-concierge-chatbots/',
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
  test.use({ colorScheme: 'dark' });

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

test('video slot shows the diagram until a video exists', async ({ page }) => {
  await page.goto('/work/docupilot/');
  const slot = page.locator('.video-slot');
  await expect(slot.getByText('Video coming soon')).toBeVisible();
  await expect(slot.locator('.key')).toBeVisible();
});

test.describe('mobile diagram stacks vertically', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('steps sit on top of each other', async ({ page }) => {
    await page.goto('/work/docupilot/');
    const steps = page.locator('.video-slot .lane').first().locator('.step');
    const first = await steps.nth(0).boundingBox();
    const second = await steps.nth(1).boundingBox();
    expect(first && second).toBeTruthy();
    expect(Math.round(first!.x)).toBe(Math.round(second!.x));
    expect(second!.y).toBeGreaterThan(first!.y);
  });
});

test('desktop diagram flows left to right', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/work/docupilot/');
  const steps = page.locator('.video-slot .lane').first().locator('.step');
  const first = await steps.nth(0).boundingBox();
  const second = await steps.nth(1).boundingBox();
  expect(second!.x).toBeGreaterThan(first!.x);
  expect(Math.round(second!.y)).toBe(Math.round(first!.y));
});

import { expect, test, type Page } from '@playwright/test';

const box = async (page: Page, selector: string) => {
  const b = await page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top) };
  });
  return b;
};

test.describe('case study on a wide screen', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('hero, stage and architecture share the header’s left and right edges', async ({ page }) => {
    await page.goto('/work/quantumcopilot/');
    const nav = await box(page, 'header nav');
    const h1 = await box(page, 'main h1');
    const stage = await box(page, '.stage');
    const arch = await box(page, 'figure.architecture');
    expect(h1.left).toBe(nav.left);
    expect(stage.left).toBe(nav.left);
    expect(stage.right).toBe(nav.right);
    expect(arch.left).toBe(stage.left);
    expect(arch.right).toBe(stage.right);
  });

  test('the meta card sits beside the title', async ({ page }) => {
    await page.goto('/work/quantumcopilot/');
    const h1 = await box(page, 'main h1');
    const card = await box(page, '.meta-card');
    expect(card.left).toBeGreaterThan(h1.left + 400);
  });

  test('the section nav is visible and stays in view while reading', async ({ page }) => {
    await page.goto('/work/quantumcopilot/');
    const toc = page.locator('nav.toc');
    await expect(toc).toBeVisible();
    expect(await toc.evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
    await page.locator('#results').scrollIntoViewIfNeeded();
    await expect(toc).toBeInViewport();
  });

  test('key decisions sit in two columns', async ({ page }) => {
    await page.goto('/work/quantumcopilot/');
    const cards = page.locator('#key-decisions + ol > li');
    await expect(cards).toHaveCount(4);
    const a = (await cards.nth(0).boundingBox())!;
    const b = (await cards.nth(1).boundingBox())!;
    expect(Math.round(a.y)).toBe(Math.round(b.y));
    expect(b.x).toBeGreaterThan(a.x);
  });

  test('the chatbots page’s second diagram also uses the full width', async ({ page }) => {
    await page.goto('/work/support-concierge-chatbots/');
    const nav = await box(page, 'header nav');
    const second = await box(page, '.prose > figure.diagram');
    expect(second.left).toBe(nav.left);
    expect(second.right).toBe(nav.right);
  });
});

test.describe('architecture diagrams on a wide screen', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  for (const slug of [
    'docupilot',
    'crickpal-intelligence-layer',
    'crickpal-ai-summary',
    'ai-face-matching',
    'quantumcopilot',
    'support-concierge-chatbots',
  ]) {
    test(`${slug} shows its architecture aligned to the page edges`, async ({ page }) => {
      await page.goto(`/work/${slug}/`);
      const nav = await box(page, 'header nav');
      const arch = await box(page, 'figure.architecture');
      expect(arch.left).toBe(nav.left);
      expect(arch.right).toBe(nav.right);
    });
  }
});

test.describe('case study on a tablet', () => {
  test.use({ viewport: { width: 820, height: 1100 } });

  test('hides the section nav and keeps one column', async ({ page }) => {
    await page.goto('/work/quantumcopilot/');
    await expect(page.locator('nav.toc')).toBeHidden();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(820);
  });
});

test.describe('case study on a phone', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('decisions stack and the meta card follows the title', async ({ page }) => {
    await page.goto('/work/quantumcopilot/');
    const cards = page.locator('#key-decisions + ol > li');
    const a = (await cards.nth(0).boundingBox())!;
    const b = (await cards.nth(1).boundingBox())!;
    expect(Math.round(a.x)).toBe(Math.round(b.x));
    const h1 = await box(page, 'main h1');
    const card = await box(page, '.meta-card');
    expect(card.top).toBeGreaterThan(h1.top);
    expect(card.left).toBe(h1.left);
  });
});

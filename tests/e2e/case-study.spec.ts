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

  test('hero and stage share the header’s edges; the architecture fills the reading column', async ({ page }) => {
    await page.goto('/work/quantumcopilot/');
    const nav = await box(page, 'header nav');
    const h1 = await box(page, 'main h1');
    const stage = await box(page, '.stage');
    const arch = await box(page, 'figure.architecture');
    const text = await box(page, '.prose > p');
    expect(h1.left).toBe(nav.left);
    expect(stage.left).toBe(nav.left);
    expect(stage.right).toBe(nav.right);
    expect(arch.left).toBe(text.left);
    expect(arch.right).toBe(nav.right);
  });

  for (const slug of ['quantumcopilot', 'support-concierge-chatbots', 'docupilot']) {
    test(`the section nav is never covered while scrolling ${slug}`, async ({ page }) => {
      await page.goto(`/work/${slug}/`);
      const firstLink = page.locator('nav.toc a').first();
      const figures = page.locator('.prose figure:visible');
      const count = await figures.count();
      for (let i = 0; i < count; i++) {
        await figures.nth(i).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40));
        const b = (await firstLink.boundingBox())!;
        const onTop = await page.evaluate(
          ([x, y]) => document.elementFromPoint(x, y)?.closest('nav.toc') !== null,
          [b.x + b.width / 2, b.y + b.height / 2],
        );
        expect(onTop).toBe(true);
      }
    });
  }

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

  test('the chatbots page’s second diagram fills the reading column', async ({ page }) => {
    await page.goto('/work/support-concierge-chatbots/');
    const nav = await box(page, 'header nav');
    const text = await box(page, '.prose > p');
    const second = await box(page, '.prose > figure.diagram');
    expect(second.left).toBe(text.left);
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
    test(`${slug} shows its architecture across the reading column`, async ({ page }) => {
      await page.goto(`/work/${slug}/`);
      const nav = await box(page, 'header nav');
      const text = await box(page, '.prose > p');
      const arch = await box(page, 'figure.architecture');
      expect(arch.left).toBe(text.left);
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

test.describe('resume layout', () => {
  test('desktop: experience on the left, facts in a side column', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/resume/');
    const nav = await box(page, 'header nav');
    const main = await box(page, '.resume-main');
    const aside = await box(page, '.resume-aside');
    expect(main.left).toBe(nav.left);
    expect(aside.left).toBeGreaterThan(main.right);
    await expect(page.getByRole('link', { name: 'Download PDF' })).toBeInViewport();
  });

  test('phone: one column, experience before the facts', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/resume/');
    const main = await box(page, '.resume-main');
    const aside = await box(page, '.resume-aside');
    expect(aside.left).toBe(main.left);
    expect(aside.top).toBeGreaterThan(main.top);
  });
});

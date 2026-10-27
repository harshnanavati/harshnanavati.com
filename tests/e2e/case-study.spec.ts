import { expect, test, type Page } from '@playwright/test';

const box = async (page: Page, selector: string) => {
  const b = await page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom) };
  });
  return b;
};

test.describe('case study on a wide screen', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('the top runs full width: details strip and illustration share the header’s edges', async ({ page }) => {
    await page.goto('/work/quantumcopilot/');
    const nav = await box(page, 'header nav');
    const h1 = await box(page, 'main h1');
    const meta = await box(page, '.meta-card');
    const stage = await box(page, '.stage');
    const arch = await box(page, 'figure.architecture');
    const text = await box(page, '.prose > p');
    expect(h1.left).toBe(nav.left);
    // No side column at the top, so nothing can leave an empty gap beside a shorter neighbour.
    expect(meta.left).toBe(nav.left);
    expect(meta.right).toBe(nav.right);
    expect(stage.left).toBe(nav.left);
    expect(stage.right).toBe(nav.right);
    expect(stage.top).toBeGreaterThan(meta.bottom);
    expect(arch.left).toBe(text.left);
    expect(arch.right).toBe(nav.right);
  });

  for (const slug of ['quantumcopilot', 'rag-support-chatbot', 'docupilot']) {
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

  test('the details sit in one strip under the intro, with the stack in the widest column', async ({ page }) => {
    await page.goto('/work/quantumcopilot/');
    const intro = await box(page, '.outcome');
    const card = await box(page, '.meta-card');
    expect(card.top).toBeGreaterThan(intro.top);
    const cells = await page.locator('.meta-card dl > div').evaluateAll((els) =>
      els.map((el) => ({ top: Math.round(el.getBoundingClientRect().top), width: el.getBoundingClientRect().width })),
    );
    expect(new Set(cells.map((c) => c.top)).size).toBe(1);
    expect(cells.at(-1)!.width).toBe(Math.max(...cells.map((c) => c.width)));
  });

  test('the section nav is visible and stays in view while reading', async ({ page }) => {
    await page.goto('/work/quantumcopilot/');
    const toc = page.locator('nav.toc');
    await expect(toc).toBeVisible();
    expect(await toc.evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
    await page.locator('#results').scrollIntoViewIfNeeded();
    await expect(toc).toBeInViewport();
  });

  test('key decisions flow down two columns', async ({ page }) => {
    await page.goto('/work/quantumcopilot/');
    const cards = page.locator('#key-decisions + ol > li');
    await expect(cards).toHaveCount(4);
    const lefts = await cards.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().left)));
    expect(new Set(lefts).size).toBe(2);
    // Reading order runs down the first column, then the second.
    expect(lefts[0]).toBeLessThan(lefts.at(-1)!);
  });

  test('the concierge page’s before-and-after diagram fills the reading column', async ({ page }) => {
    await page.goto('/work/concierge-chatbot/');
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
    'rag-support-chatbot',
    'vipermind',
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

test.describe('project name while reading', () => {
  for (const width of [375, 1440]) {
    test(`appears in a bar under the header once the title scrolls away, and goes when it returns, at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/work/rag-support-chatbot/');
      const bar = page.locator('.case-bar');
      await expect(bar).toBeHidden();
      await page.mouse.wheel(0, 1500);
      await expect(bar).toBeVisible();
      await expect(bar).toContainText('RAG Support Chatbot');
      const headerBottom = await page.locator('.site-header').evaluate((el) => Math.round(el.getBoundingClientRect().bottom));
      // It slides in, so wait for it to settle right under the header.
      await expect.poll(async () => Math.round((await bar.boundingBox())!.y)).toBe(headerBottom);
      await page.mouse.wheel(0, -5000);
      await expect(bar).toBeHidden();
    });
  }
});

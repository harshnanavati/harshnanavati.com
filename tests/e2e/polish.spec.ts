import { expect, test, type Page } from '@playwright/test';

const left = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => Math.round(el.getBoundingClientRect().left));

test.describe('citation cards stay on screen', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('a marker near the bottom opens its card above it, fully visible', async ({ page }) => {
    await page.goto('/work/docupilot/');
    const marker = page.locator('.stats button.cite').first();
    await marker.evaluate((el) => {
      const r = el.getBoundingClientRect();
      window.scrollBy(0, r.top - (window.innerHeight - 30));
    });
    await marker.click();
    const card = page.locator(`#${await marker.getAttribute('popovertarget')}`);
    await expect(card).toBeVisible();
    const c = (await card.boundingBox())!;
    const m = (await marker.boundingBox())!;
    expect(c.y).toBeGreaterThanOrEqual(0);
    expect(c.y + c.height).toBeLessThanOrEqual(667);
    expect(c.y + c.height).toBeLessThanOrEqual(m.y);
  });

  test('scrolling closes an open card instead of leaving it behind', async ({ page }) => {
    await page.goto('/');
    const marker = page.locator('.hero button.cite').first();
    await marker.click();
    const card = page.locator(`#${await marker.getAttribute('popovertarget')}`);
    await expect(card).toBeVisible();
    await page.mouse.wheel(0, 400);
    await expect(card).toBeHidden();
  });

  test('markers have a comfortable tap area', async ({ page }) => {
    await page.goto('/');
    const box = (await page.locator('.hero button.cite').first().boundingBox())!;
    const hit = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x, y)?.closest('button.cite') !== null,
      [box.x - 3, box.y + box.height / 2],
    );
    expect(hit).toBe(true);
  });
});

test.describe('one frame on every page', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the header never shifts between pages, and narrow pages start at the same edge', async ({ page }) => {
    const edges: number[] = [];
    for (const path of ['/', '/about/', '/resume/', '/work/docupilot/', '/404']) {
      await page.goto(path);
      edges.push(await left(page, 'header nav'));
    }
    expect(new Set(edges).size).toBe(1);
    await page.goto('/about/');
    expect(await left(page, 'main h1')).toBe(edges[0]);
  });
});

test.describe('diagrams at tablet width', () => {
  test.use({ viewport: { width: 820, height: 1100 } });

  test('use the stacked diagram instead of a shrunken system drawing', async ({ page }) => {
    await page.goto('/work/quantumcopilot/');
    await expect(page.locator('figure.architecture')).toBeHidden();
    await expect(page.locator('.prose figure.diagram').first()).toBeVisible();
  });

  test('"How I build" reads in one column', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('.principles > p');
    const a = (await items.nth(0).boundingBox())!;
    const b = (await items.nth(1).boundingBox())!;
    expect(Math.round(a.x)).toBe(Math.round(b.x));
  });
});

test.describe('printing the resume', () => {
  test.use({ colorScheme: 'dark' });

  test('prints dark text on white without the site chrome, in at most two pages', async ({ page }) => {
    await page.goto('/resume/');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('header.site-header')).toBeHidden();
    await expect(page.locator('footer.site-footer')).toBeHidden();
    await expect(page.getByRole('link', { name: 'Download PDF' })).toBeHidden();
    const color = await page.evaluate(() => getComputedStyle(document.body).color);
    expect(color).toBe('rgb(17, 17, 17)');
    const pdf = await page.pdf({ format: 'A4' });
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    expect(pages).toBeLessThanOrEqual(2);
  });
});

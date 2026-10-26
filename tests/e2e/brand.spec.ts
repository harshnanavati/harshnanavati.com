import { expect, test } from '@playwright/test';

const style = (page: import('@playwright/test').Page, selector: string, props: string[]) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, names) => {
      const s = getComputedStyle(el);
      return Object.fromEntries(names.map((n) => [n, s.getPropertyValue(n)]));
    }, props);

test.describe('desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('citation markers are light superscripts, not boxed buttons', async ({ page }) => {
    await page.goto('/');
    const s = await style(page, '.hero button.cite', ['border-top-width', 'font-size', 'font-variant-numeric', 'border-radius']);
    expect(s['border-top-width']).toBe('0px');
    expect(s['font-size']).toBe('10.5px');
    expect(s['font-variant-numeric']).toContain('tabular-nums');
    expect(s['border-radius']).toBe('3px');
  });

  test('"View work" is the one solid button; the others are text links', async ({ page }) => {
    await page.goto('/');
    const primary = await style(page, '.ctas a.primary', ['background-color', 'color']);
    expect(primary['background-color']).toBe('rgb(31, 56, 100)');
    expect(primary.color).toBe('rgb(255, 255, 255)');
    for (const name of ['Resume', 'Email me']) {
      const link = page.locator('.ctas a', { hasText: name });
      const s = await link.evaluate((el) => {
        const c = getComputedStyle(el);
        return { bg: c.backgroundColor, border: c.borderTopWidth };
      });
      expect(s.bg).toBe('rgba(0, 0, 0, 0)');
      expect(s.border).toBe('0px');
    }
  });

  test('key decisions are a ruled two-column list, not boxed cards', async ({ page }) => {
    await page.goto('/work/docupilot/');
    const items = page.locator('#key-decisions + ol > li');
    const s = await style(page, '#key-decisions + ol > li', ['border-left-width', 'border-top-width', 'border-radius']);
    expect(s['border-left-width']).toBe('0px');
    expect(s['border-top-width']).toBe('1px');
    expect(s['border-radius']).toBe('0px');
    const a = (await items.nth(0).boundingBox())!;
    const b = (await items.nth(1).boundingBox())!;
    expect(b.x).toBeGreaterThan(a.x);
    const h = await style(page, '#key-decisions + ol > li > strong:first-child', ['font-family', 'font-weight', 'font-size']);
    expect(h['font-family']).toContain('Inter');
    expect(h['font-weight']).toBe('600');
    expect(h['font-size']).toBe('16px');
  });

  test('home previews fade out at the bottom', async ({ page }) => {
    await page.goto('/');
    const s = await style(page, '#work .preview', ['mask-image', '-webkit-mask-image']);
    expect(`${s['mask-image']}${s['-webkit-mask-image']}`).toContain('linear-gradient');
  });
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the illustration comes before the project details', async ({ page }) => {
    await page.goto('/work/docupilot/');
    const stage = (await page.locator('.stage').boundingBox())!;
    const meta = (await page.locator('.meta-card').boundingBox())!;
    const h1 = (await page.locator('main h1').boundingBox())!;
    expect(h1.y).toBeLessThan(stage.y);
    expect(stage.y).toBeLessThan(meta.y);
  });
});

import { expect, test, type Page } from '@playwright/test';

const bodyBg = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const WHITE = 'rgb(255, 255, 255)';
const DARK = 'rgb(18, 18, 18)';

test.describe('theme toggle', () => {
  test.use({ colorScheme: 'light' });

  test('switches to dark and remembers the choice after a reload', async ({ page }) => {
    await page.goto('/');
    expect(await bodyBg(page)).toBe(WHITE);
    const toggle = page.getByRole('button', { name: 'Switch to dark theme' });
    await toggle.click();
    expect(await bodyBg(page)).toBe(DARK);
    await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();
    await page.reload();
    expect(await bodyBg(page)).toBe(DARK);
    await page.goto('/about/');
    expect(await bodyBg(page)).toBe(DARK);
  });

  test('switches back to light', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    expect(await bodyBg(page)).toBe(WHITE);
    await page.reload();
    expect(await bodyBg(page)).toBe(WHITE);
  });
});

test.describe('theme on a device set to dark mode', () => {
  test.use({ colorScheme: 'dark' });

  test('still opens in light, and the toggle switches to dark', async ({ page }) => {
    await page.goto('/');
    expect(await bodyBg(page)).toBe(WHITE);
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    expect(await bodyBg(page)).toBe(DARK);
  });
});

test.describe('desktop layout', () => {
  test.use({ viewport: { width: 1600, height: 1000 } });

  const leftEdge = (page: Page, selector: string) =>
    page.locator(selector).first().evaluate((el) => Math.round(el.getBoundingClientRect().left));

  test('home page content lines up with the header and uses the wide layout', async ({ page }) => {
    await page.goto('/');
    expect(await leftEdge(page, 'main h1')).toBe(await leftEdge(page, 'header nav'));
    const workWidth = await page.locator('#work').evaluate((el) => el.getBoundingClientRect().width);
    expect(workWidth).toBeGreaterThan(900);
  });

  test('home projects sit in two columns', async ({ page }) => {
    await page.goto('/');
    const rows = page.locator('#work li');
    const a = (await rows.nth(0).boundingBox())!;
    const b = (await rows.nth(1).boundingBox())!;
    expect(Math.round(a.y)).toBe(Math.round(b.y));
    expect(b.x).toBeGreaterThan(a.x);
  });

  test('case study text lines up with the header', async ({ page }) => {
    await page.goto('/work/docupilot/');
    expect(await leftEdge(page, 'main h1')).toBe(await leftEdge(page, 'header nav'));
  });
});

test.describe('QuantumCopilot visuals', () => {
  test('desktop shows the architecture diagram and the product moment', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/work/quantumcopilot/');
    await expect(page.locator('.product-moment')).toBeVisible();
    await expect(page.locator('figure.architecture')).toBeVisible();
  });

  test('phones hide the wide architecture diagram but keep the product moment', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/work/quantumcopilot/');
    await expect(page.locator('.product-moment')).toBeVisible();
    await expect(page.locator('figure.architecture')).toBeHidden();
  });

  test('phones can open the full architecture diagram and close it again', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/work/quantumcopilot/');
    await page.getByRole('button', { name: 'View full diagram' }).click();
    const dialog = page.getByRole('dialog', { name: 'Full system diagram' });
    await expect(dialog.locator('figure.architecture')).toBeVisible();
    // Wider than the phone, so its labels stay readable; the dialog scrolls sideways.
    expect((await dialog.locator('figure.architecture').boundingBox())!.width).toBeGreaterThan(800);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator('figure.architecture')).toHaveCount(1);
    await expect(page.locator('figure.architecture')).toBeHidden();
  });

  test('desktop has no full-diagram button, since the drawing is already on the page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/work/quantumcopilot/');
    await expect(page.getByRole('button', { name: 'View full diagram' })).toBeHidden();
  });
});

test.describe('QuantumCopilot visuals in dark mode', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test.beforeEach(async ({ page }) => {
    // Dark is a visitor's choice now, remembered from the toggle.
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  });

  test('architecture key component uses the dark accent', async ({ page }) => {
    await page.goto('/work/quantumcopilot/');
    const stroke = await page
      .locator('figure.architecture .key rect')
      .first()
      .evaluate((el) => getComputedStyle(el).stroke);
    expect(stroke).toBe('rgb(143, 176, 230)');
  });
});

test.describe('phone layout', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('home projects stack in one column', async ({ page }) => {
    await page.goto('/');
    const rows = page.locator('#work li');
    const a = (await rows.nth(0).boundingBox())!;
    const b = (await rows.nth(1).boundingBox())!;
    expect(Math.round(a.x)).toBe(Math.round(b.x));
    expect(b.y).toBeGreaterThan(a.y);
  });
});

test.describe('header', () => {
  for (const width of [375, 1280]) {
    test(`stays at the top of the screen while scrolling at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/work/docupilot/');
      await page.mouse.wheel(0, 2500);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
      const top = await page.locator('.site-header').evaluate((el) => el.getBoundingClientRect().top);
      expect(top).toBe(0);
      await expect(page.getByRole('link', { name: 'Talks' })).toBeInViewport();
      await expect(page.locator('.header-cta')).toBeInViewport();
    });
  }

  test('puts the name on the left and the tabs and Email me on the right on a wide screen', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const box = (selector: string) =>
      page.locator(selector).first().evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { left: Math.round(r.left), right: Math.round(r.right) };
      });
    const nav = await box('header nav');
    const name = await box('header .name');
    const tabs = await box('header .links');
    const cta = await box('header .header-cta');
    expect(name.left).toBe(nav.left);
    expect(cta.right).toBe(nav.right);
    // The tabs sit beside Email me, not beside the name.
    expect(tabs.left - name.right).toBeGreaterThan(200);
  });

  test('puts Email me at the right edge on a phone too', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    const navRight = await page.locator('header nav').evaluate((el) => Math.round(el.getBoundingClientRect().right));
    const ctaRight = await page.locator('header .header-cta').evaluate((el) => Math.round(el.getBoundingClientRect().right));
    expect(ctaRight).toBe(navRight);
  });
});

test.describe('How I build on a wide screen', () => {
  test('runs the five stages across one row, with every proof on the same line', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    const tops = async (selector: string) =>
      page.locator(selector).evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    const steps = await tops('.stages .step');
    expect(steps).toHaveLength(5);
    expect(new Set(steps).size).toBe(1);
    expect(new Set(await tops('.stages .proof-value')).size).toBe(1);
  });
});

test.describe('About page card', () => {
  test('stays exactly where it starts while the page scrolls', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/about/');
    const top = () => page.locator('.about-card').evaluate((el) => Math.round(el.getBoundingClientRect().top));
    const start = await top();
    for (const y of [1, 40, 200]) {
      await page.evaluate((v) => scrollTo(0, v), y);
      expect(await top()).toBe(start);
    }
  });

  test('stays put at the very end of the page on a laptop-height screen, not under the header', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 800 });
    await page.goto('/about/');
    const top = () => page.locator('.about-card').evaluate((el) => Math.round(el.getBoundingClientRect().top));
    const start = await top();
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    expect(await top()).toBe(start);
  });
});

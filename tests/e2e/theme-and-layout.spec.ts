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

test.describe('theme toggle with a dark system setting', () => {
  test.use({ colorScheme: 'dark' });

  test('starts dark and can switch to light', async ({ page }) => {
    await page.goto('/');
    expect(await bodyBg(page)).toBe(DARK);
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    expect(await bodyBg(page)).toBe(WHITE);
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
  test.use({ colorScheme: 'dark', viewport: { width: 1280, height: 900 } });

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

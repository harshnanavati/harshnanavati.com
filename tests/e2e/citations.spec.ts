import { expect, test } from '@playwright/test';

test('clicking a marker opens its evidence card near it, and Esc closes it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const marker = page.locator('.hero button.cite').nth(1);
  await marker.click();
  const card = page.locator('#cite-hero-users');
  await expect(card).toBeVisible();
  await expect(card).toContainText('DocuPilot');
  const m = (await marker.boundingBox())!;
  const c = (await card.boundingBox())!;
  expect(c.y).toBeGreaterThan(m.y);
  expect(c.y - (m.y + m.height)).toBeLessThan(40);
  await page.keyboard.press('Escape');
  await expect(card).toBeHidden();
});

test('the evidence link takes you to the proof', async ({ page }) => {
  await page.goto('/');
  await page.locator('.hero button.cite').nth(1).click();
  await page.locator('#cite-hero-users a').click();
  await expect(page).toHaveURL(/\/work\/docupilot\/#results$/);
});

test('works from the keyboard', async ({ page }) => {
  await page.goto('/');
  await page.locator('.hero button.cite').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#cite-hero-systems')).toBeVisible();
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('the card stays inside the screen', async ({ page }) => {
    await page.goto('/work/docupilot/');
    const marker = page.locator('.stats button.cite').last();
    await marker.click();
    const card = page.locator(`#${await marker.getAttribute('popovertarget')}`);
    await expect(card).toBeVisible();
    const c = (await card.boundingBox())!;
    expect(c.x).toBeGreaterThanOrEqual(8);
    expect(c.x + c.width).toBeLessThanOrEqual(352);
  });
});

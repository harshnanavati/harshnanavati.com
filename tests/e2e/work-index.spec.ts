import { expect, test } from '@playwright/test';

test.describe('Work page on a wide screen', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('lists every project, and pointing at one shows its card beside the list', async ({ page }) => {
    await page.goto('/work/');
    const rows = page.locator('.index-row');
    await expect(rows).toHaveCount(8);
    const shown = page.locator('.index-stage li.row.shown');
    await expect(shown).toHaveCount(1);
    await expect(shown.locator('.title')).toHaveText('DocuPilot');

    await rows.nth(5).hover();
    await expect(shown.locator('.title')).toHaveText('QuantumCopilot');
    await expect(rows.nth(5)).toHaveClass(/active/);

    // Tabbing works the same way as pointing.
    await rows.nth(2).focus();
    await expect(shown.locator('.title')).toHaveText('CrickPal Intelligence Layer');

    const list = (await page.locator('.index-list').boundingBox())!;
    const card = (await shown.boundingBox())!;
    expect(card.x).toBeGreaterThan(list.x + list.width);
  });
});

test.describe('Work page on a tablet', () => {
  test.use({ viewport: { width: 820, height: 1100 } });

  test('skips the list and shows every card', async ({ page }) => {
    await page.goto('/work/');
    await expect(page.locator('.index-list')).toBeHidden();
    await expect(page.locator('.index-stage li.row')).toHaveCount(8);
    for (const card of await page.locator('.index-stage li.row').all()) await expect(card).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test('superheroes table renders with data', async ({ page }) => {
  await page.goto('/');

  const table = page.locator('table');
  await expect(table).toBeVisible();
  await expect(table.locator('thead tr th')).toHaveText([
    'ID',
    'Name',
    'Image',
    'Select',
    'Intelligence',
    'Strength',
    'Speed',
    'Durability',
    'Power',
    'Combat',
  ]);
  await expect(table.locator('tbody tr').first()).toBeVisible();
});

test('superheroes table is readable without horizontal overflow on narrow screens', async ({ page }) => {
  for (const width of [375, 619, 820, 821]) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto('/');

    const table = page.locator('table');
    await expect(table).toBeVisible();
    if (width <= 820) {
      await expect(page.locator('thead')).toBeHidden();
      await expect(table.locator('tbody tr').first().locator('td').first()).toHaveAttribute('data-label', 'ID');
    }

    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(documentWidth).toBeLessThanOrEqual(width);
  }
});

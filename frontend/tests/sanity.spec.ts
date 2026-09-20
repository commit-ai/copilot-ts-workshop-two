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

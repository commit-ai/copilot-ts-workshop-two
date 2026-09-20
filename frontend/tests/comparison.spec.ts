import { test, expect } from '@playwright/test';

test('compares two selected heroes and returns to the table', async ({ page }) => {
  await page.goto('/');

  const compareButton = page.getByRole('button', { name: 'Compare selected heroes' });
  await expect(compareButton).toBeDisabled();

  const aBombRow = page.locator('tbody tr', { hasText: 'A-Bomb' });
  const antManRow = page.locator('tbody tr', { hasText: 'Ant-Man' });

  await aBombRow.locator('td').nth(3).click();
  await antManRow.locator('td').nth(3).click();
  await expect(compareButton).toBeEnabled();
  await expect(aBombRow).toHaveClass('selected-hero');
  await expect(antManRow).toHaveClass('selected-hero');

  await compareButton.click();

  await expect(page.getByRole('heading', { name: 'Hero comparison' })).toBeVisible();
  await expect(page.getByText('A-Bomb vs Ant-Man')).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('A-Bomb wins!');

  await page.getByRole('button', { name: 'Back to table' }).click();
  await expect(page.getByRole('heading', { name: 'Hero comparison' })).not.toBeVisible();
  await expect(page.locator('table')).toBeVisible();
  await expect(aBombRow).toHaveClass('selected-hero');
});
import { test, expect } from '@playwright/test';

async function selectHeroes(page, firstHeroName, secondHeroName) {
  await page.getByRole('checkbox', { name: `Select ${firstHeroName}` }).check();
  await page.getByRole('checkbox', { name: `Select ${secondHeroName}` }).check();
}

test('limits selection to two heroes, compares their categories, and returns to the table', async ({ page }) => {
  await page.goto('/');

  const compareButton = page.getByRole('button', { name: 'Compare selected heroes' });
  const aBombCheckbox = page.getByRole('checkbox', { name: 'Select A-Bomb' });
  const antManCheckbox = page.getByRole('checkbox', { name: 'Select Ant-Man' });
  const baneCheckbox = page.getByRole('checkbox', { name: 'Select Bane' });
  await expect(compareButton).toBeDisabled();

  await aBombCheckbox.check();
  await expect(page.getByText('Selected: A-Bomb', { exact: true })).toBeVisible();
  await antManCheckbox.check();
  await expect(compareButton).toBeEnabled();
  await expect(page.getByText('Selected: A-Bomb vs Ant-Man', { exact: true })).toBeVisible();
  await expect(baneCheckbox).toBeDisabled();
  await expect(aBombCheckbox).toBeChecked();
  await expect(antManCheckbox).toBeChecked();

  await aBombCheckbox.uncheck();
  await expect(compareButton).toBeDisabled();
  await expect(baneCheckbox).toBeEnabled();
  await aBombCheckbox.check();

  await compareButton.click();

  await expect(page.getByRole('heading', { name: 'Hero comparison' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A-Bomb' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ant-Man' })).toBeVisible();
  await expect(page.getByText('3 category wins', { exact: true })).toHaveCount(2);
  await expect(page.getByRole('status')).toHaveText("It's a tie!");

  const comparisonTable = page.locator('.comparison-table');
  await expect(comparisonTable.locator('tbody tr')).toHaveCount(6);
  await expect(
    comparisonTable.locator('tbody tr', { hasText: 'Intelligence' }).locator('td').nth(1),
  ).toHaveClass(/stat-winner/);
  await expect(
    comparisonTable.locator('tbody tr', { hasText: 'Strength' }).locator('td').first(),
  ).toHaveClass(/stat-winner/);

  await page.getByRole('button', { name: 'Back to table' }).click();
  await expect(page.getByRole('heading', { name: 'Hero comparison' })).not.toBeVisible();
  await expect(page.locator('table')).toBeVisible();
  await expect(aBombCheckbox).toBeChecked();
  await expect(antManCheckbox).toBeChecked();
  await expect(compareButton).toBeEnabled();
});

test('declares the hero with more category wins as the winner', async ({ page }) => {
  await page.goto('/');
  await selectHeroes(page, 'A-Bomb', 'Bane');

  await page.getByRole('button', { name: 'Compare selected heroes' }).click();

  await expect(page.getByRole('status')).toHaveText('Bane wins!');
  await expect(page.getByRole('heading', { name: 'A-Bomb' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bane' })).toBeVisible();
  await expect(page.getByText('4 category wins', { exact: true })).toBeVisible();
  await expect(page.getByText('2 category wins', { exact: true })).toBeVisible();
});

test('shows a neutral draw for equal category values', async ({ page }) => {
  await page.goto('/');
  await selectHeroes(page, 'A-Bomb', 'Aquaman');

  await page.getByRole('button', { name: 'Compare selected heroes' }).click();

  const durabilityRow = page.locator('.comparison-table tbody tr', { hasText: 'Durability' });
  await expect(durabilityRow.getByText('Draw', { exact: true })).toBeVisible();
  await expect(durabilityRow.locator('.stat-winner')).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText('Aquaman wins!');
});
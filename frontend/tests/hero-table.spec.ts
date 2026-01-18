import { test, expect } from '@playwright/test';

test.describe('Superhero Table View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('should display the main heading', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Superheroes');
  });

  test('should display selection info text', async ({ page }) => {
    await expect(page.getByText(/Select 2 superheroes to compare/)).toBeVisible();
  });

  test('should display superhero table with correct headers', async ({ page }) => {
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check all table headers
    const headers = ['Select', 'ID', 'Name', 'Image', 'Intelligence', 'Strength', 'Speed', 'Durability', 'Power', 'Combat'];
    for (const header of headers) {
      await expect(table.locator('th', { hasText: header })).toBeVisible();
    }
  });

  test('should load and display superhero data', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('tbody tr');
    
    // Check that we have at least 3 heroes (from the data file)
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(3);
    
    // Verify first hero (A-Bomb)
    const firstRow = rows.first();
    await expect(firstRow.locator('td').nth(1)).toHaveText('1');
    await expect(firstRow.locator('td').nth(2)).toHaveText('A-Bomb');
    await expect(firstRow.locator('td').nth(4)).toHaveText('38');
    await expect(firstRow.locator('td').nth(5)).toHaveText('100');
  });

  test('should display hero images', async ({ page }) => {
    await page.waitForSelector('tbody tr');
    
    const firstImage = page.locator('tbody tr').first().locator('img');
    await expect(firstImage).toBeVisible();
    await expect(firstImage).toHaveAttribute('alt', 'A-Bomb');
    await expect(firstImage).toHaveAttribute('src', /superhero-api/);
  });

  test('should have checkboxes for hero selection', async ({ page }) => {
    await page.waitForSelector('tbody tr');
    
    const checkboxes = page.locator('tbody tr input[type="checkbox"]');
    await expect(checkboxes).toHaveCount(3);
    
    // All checkboxes should be initially unchecked
    for (let i = 0; i < 3; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked();
    }
  });

  test('should disable compare button when no heroes selected', async ({ page }) => {
    const compareButton = page.getByRole('button', { name: /Compare Heroes/i });
    await expect(compareButton).toBeVisible();
    await expect(compareButton).toBeDisabled();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Sanity Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/React/i);
    
    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Superheroes');
    
    // Check essential UI elements are present
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeVisible();
    
    // Check initial state
    await expect(page.getByText('Select 2 superheroes to compare (0/2 selected)')).toBeVisible();
  });

  test('page has proper semantic structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading hierarchy
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check table has proper structure
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    
    // Check table has header row and data rows
    await expect(page.getByRole('row')).toHaveCount(4); // 1 header + 3 data rows
    
    // Check accessibility labels
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeVisible();
  });

  test('initial page state is correct', async ({ page }) => {
    await page.goto('/');
    
    // Wait for data to load
    await expect(page.getByRole('row')).toHaveCount(4); // 1 header + 3 data rows
    
    // Check that no heroes are initially selected
    const checkboxes = page.getByRole('checkbox');
    for (const checkbox of await checkboxes.all()) {
      await expect(checkbox).not.toBeChecked();
    }
    
    // Compare button should be disabled
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeDisabled();
  });
});

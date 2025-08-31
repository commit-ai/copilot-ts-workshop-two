import { test, expect } from '@playwright/test';

test.describe('Superhero Table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for data to load by checking for table rows
    await expect(page.getByRole('row')).toHaveCount(4); // header + 3 data rows
  });

  test('displays table with correct headers and structure', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Superheroes');
    
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    
    // Check header row contains expected text
    const headerRow = page.getByRole('row').first();
    const expectedHeaders = [
      'Select', 'ID', 'Name', 'Image', 'Intelligence', 
      'Strength', 'Speed', 'Durability', 'Power', 'Combat'
    ];
    
    for (const header of expectedHeaders) {
      await expect(headerRow).toContainText(header);
    }
  });

  test('loads superhero data with correct content', async ({ page }) => {
    // Verify total rows (including header)
    await expect(page.getByRole('row')).toHaveCount(4);
    
    // Check first hero (A-Bomb) data by searching for the row containing A-Bomb
    const aBombRow = page.getByRole('row', { name: /A-Bomb/ });
    await expect(aBombRow).toBeVisible();
    await expect(aBombRow).toContainText('1'); // ID
    await expect(aBombRow).toContainText('A-Bomb'); // Name
    
    // Check hero image with proper alt text
    await expect(aBombRow.getByRole('img', { name: 'A-Bomb' })).toBeVisible();
  });

  test('displays accurate superhero statistics', async ({ page }) => {
    // Test A-Bomb's specific stats based on known data
    const aBombRow = page.getByRole('row', { name: /A-Bomb/ });
    
    const expectedStats = ['1', 'A-Bomb', '38', '100', '17', '80', '24', '64'];
    
    // Verify each stat appears in the row
    for (const stat of expectedStats) {
      await expect(aBombRow).toContainText(stat);
    }
  });

  test('shows selection interface elements', async ({ page }) => {
    // Check selection counter with exact text
    await expect(page.getByText('Select 2 superheroes to compare (0/2 selected)')).toBeVisible();
    
    // Check compare button state
    const compareButton = page.getByRole('button', { name: 'Compare Heroes' });
    await expect(compareButton).toBeVisible();
    await expect(compareButton).toBeDisabled();
  });

  test('provides interactive checkboxes for selection', async ({ page }) => {
    const checkboxes = page.getByRole('checkbox');
    await expect(checkboxes).toHaveCount(3);
    
    // All checkboxes should be unchecked initially
    for (const checkbox of await checkboxes.all()) {
      await expect(checkbox).not.toBeChecked();
      await expect(checkbox).toBeEnabled();
    }
  });

  test('displays all hero names correctly', async ({ page }) => {
    const expectedHeroes = ['A-Bomb', 'Ant-Man', 'Bane'];
    
    for (const heroName of expectedHeroes) {
      await expect(page.getByRole('row', { name: new RegExp(heroName) })).toBeVisible();
    }
  });

  test('maintains proper table accessibility', async ({ page }) => {
    const table = page.getByRole('table');
    
    // Check that table has proper structure
    await expect(table).toBeVisible();
    
    // Verify row count (including header)
    await expect(page.getByRole('row')).toHaveCount(4);
    
    // Check that each data row has checkboxes (skip header row)
    const dataRows = page.getByRole('row').filter({ hasText: /A-Bomb|Ant-Man|Bane/ });
    await expect(dataRows).toHaveCount(3);
    
    for (const row of await dataRows.all()) {
      await expect(row.getByRole('checkbox')).toBeVisible();
    }
  });
});

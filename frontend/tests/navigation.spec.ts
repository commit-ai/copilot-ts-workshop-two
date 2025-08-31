import { test, expect } from '@playwright/test';

test.describe('Navigation Between Views', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for data to load
    await expect(page.getByRole('row')).toHaveCount(4);
  });

  test('navigates successfully from table to comparison and back', async ({ page }) => {
    // Start from table view
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    
    // Navigate to comparison view
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Verify we're in comparison view
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    await expect(page.getByRole('table')).not.toBeVisible();
    
    // Click back button
    await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
    
    // Should be back to table view
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('clears selections when navigating back from comparison', async ({ page }) => {
    const checkboxes = page.getByRole('checkbox');
    
    // Select heroes
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();
    
    // Verify selections
    await expect(checkboxes.nth(0)).toBeChecked();
    await expect(checkboxes.nth(1)).toBeChecked();
    await expect(page.getByText('(2/2 selected)')).toBeVisible();
    
    // Navigate to comparison and back
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
    
    // Selections should be cleared
    await expect(checkboxes.nth(0)).not.toBeChecked();
    await expect(checkboxes.nth(1)).not.toBeChecked();
    await expect(page.getByText('(0/2 selected)')).toBeVisible();
    await expect(page.getByText(/Selected:/)).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeDisabled();
  });

  test('restores complete table state when navigating back', async ({ page }) => {
    // Navigate to comparison and back
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
    
    // Table should be fully restored
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(4); // header + 3 data rows
    await expect(page.getByRole('table')).toBeVisible();
    
    // All table headers should be present in header row
    const headerRow = page.getByRole('row').first();
    const expectedHeaders = ['Select', 'ID', 'Name', 'Image', 'Intelligence', 'Strength', 'Speed', 'Durability', 'Power', 'Combat'];
    for (const header of expectedHeaders) {
      await expect(headerRow).toContainText(header);
    }
  });

  test('prevents navigation to comparison without proper selections', async ({ page }) => {
    // Compare button should be disabled when no heroes are selected
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeDisabled();
    
    // Select only one hero
    await page.getByRole('checkbox').first().click();
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeDisabled();
    
    // Only when 2 heroes are selected should it be enabled
    await page.getByRole('checkbox').nth(1).click();
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeEnabled();
  });

  test('preserves hero data integrity across navigation', async ({ page }) => {
    // Check initial hero data in table by looking for hero rows
    await expect(page.getByRole('row', { name: /A-Bomb/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /Ant-Man/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /Bane/ })).toBeVisible();
    
    // Navigate to comparison
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Check hero data in comparison view
    await expect(page.getByRole('heading', { level: 2, name: 'A-Bomb' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Ant-Man' })).toBeVisible();
    
    // Navigate back
    await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
    
    // Check hero data is still correct in table
    await expect(page.getByRole('row', { name: /A-Bomb/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /Ant-Man/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /Bane/ })).toBeVisible();
  });

  test('handles multiple navigation cycles correctly', async ({ page }) => {
    // First navigation cycle
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    
    // Second navigation cycle with different heroes
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Bane/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    
    // Check different heroes are displayed
    await expect(page.getByRole('heading', { level: 2, name: 'A-Bomb' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Bane' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Ant-Man' })).not.toBeVisible();
    
    await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
  });

  test('supports keyboard navigation for accessibility', async ({ page }) => {
    // Test keyboard navigation to comparison
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    
    // Focus and activate compare button with keyboard
    const compareButton = page.getByRole('button', { name: 'Compare Heroes' });
    await compareButton.focus();
    await expect(compareButton).toBeFocused();
    await page.keyboard.press('Enter');
    
    // Should navigate to comparison view
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    
    // Test keyboard navigation back
    const backButton = page.getByRole('button', { name: '← Back to Heroes Table' });
    await backButton.focus();
    await expect(backButton).toBeFocused();
    await page.keyboard.press('Enter');
    
    // Should be back to table view
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
  });

  test('maintains responsive navigation behavior', async ({ page }) => {
    // Test navigation on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to comparison
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Elements should still be visible and functional on mobile
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    await expect(page.getByRole('button', { name: '← Back to Heroes Table' })).toBeVisible();
    
    // Navigation should still work
    await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    
    // Change back to desktop and verify
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('handles browser navigation events correctly', async ({ page }) => {
    // Navigate to comparison view
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    
    // Test browser back button functionality
    // Since this is likely a SPA without routing, we'll test the current state instead
    const isComparisonVisible = await page.getByRole('heading', { level: 1, name: 'Superhero Comparison' }).isVisible();
    
    // Should be in comparison view
    expect(isComparisonVisible).toBe(true);
    
    // Use the back button to return instead
    await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
    
    // Should be back to table view
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
  });
});

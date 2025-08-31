import { test, expect } from '@playwright/test';

test.describe('Hero Selection Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for data to load
    await expect(page.getByRole('row')).toHaveCount(4);
  });

  test('allows selecting a single hero', async ({ page }) => {
    const firstCheckbox = page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox');
    
    // Initially unchecked
    await expect(firstCheckbox).not.toBeChecked();
    
    // Click to select
    await firstCheckbox.click();
    await expect(firstCheckbox).toBeChecked();
    
    // Check selection counter updated
    await expect(page.getByText('Select 2 superheroes to compare (1/2 selected)')).toBeVisible();
    
    // Check selected heroes display
    await expect(page.getByText('Selected: A-Bomb')).toBeVisible();
    
    // Compare button should remain disabled (need 2 heroes)
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeDisabled();
  });

  test('enables comparison when two heroes are selected', async ({ page }) => {
    const checkboxes = page.getByRole('checkbox');
    
    // Select first hero
    await checkboxes.nth(0).click();
    await expect(page.getByText('(1/2 selected)')).toBeVisible();
    
    // Select second hero
    await checkboxes.nth(1).click();
    await expect(page.getByText('(2/2 selected)')).toBeVisible();
    
    // Check both heroes are shown in selection
    await expect(page.getByText('Selected: A-Bomb, Ant-Man')).toBeVisible();
    
    // Compare button should now be enabled
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeEnabled();
  });

  test('replaces first selection when selecting third hero', async ({ page }) => {
    const checkboxes = page.getByRole('checkbox');
    
    // Select first two heroes
    await checkboxes.nth(0).click(); // A-Bomb
    await checkboxes.nth(1).click(); // Ant-Man
    
    // Verify both are selected
    await expect(checkboxes.nth(0)).toBeChecked();
    await expect(checkboxes.nth(1)).toBeChecked();
    await expect(page.getByText('Selected: A-Bomb, Ant-Man')).toBeVisible();
    
    // Select third hero (should replace first)
    await checkboxes.nth(2).click(); // Bane
    
    // First should be deselected, second and third should be selected
    await expect(checkboxes.nth(0)).not.toBeChecked();
    await expect(checkboxes.nth(1)).toBeChecked();
    await expect(checkboxes.nth(2)).toBeChecked();
    
    // Should still show 2/2 selected with new selection
    await expect(page.getByText('(2/2 selected)')).toBeVisible();
    await expect(page.getByText('Selected: Ant-Man, Bane')).toBeVisible();
  });

  test('allows deselecting heroes', async ({ page }) => {
    const firstCheckbox = page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox');
    
    // Select and then deselect
    await firstCheckbox.click();
    await expect(firstCheckbox).toBeChecked();
    await expect(page.getByText('(1/2 selected)')).toBeVisible();
    
    await firstCheckbox.click();
    await expect(firstCheckbox).not.toBeChecked();
    await expect(page.getByText('(0/2 selected)')).toBeVisible();
    
    // Selected heroes section should not be visible
    await expect(page.getByText(/Selected:/)).not.toBeVisible();
    
    // Compare button should be disabled
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeDisabled();
  });

  test('maintains correct selection state during complex interactions', async ({ page }) => {
    const checkboxes = page.getByRole('checkbox');
    
    // Select first hero
    await checkboxes.nth(0).click();
    
    // Select second hero
    await checkboxes.nth(1).click();
    
    // Deselect first hero
    await checkboxes.nth(0).click();
    
    // Only second hero should be selected
    await expect(checkboxes.nth(0)).not.toBeChecked();
    await expect(checkboxes.nth(1)).toBeChecked();
    await expect(page.getByText('(1/2 selected)')).toBeVisible();
    await expect(page.getByText('Selected: Ant-Man')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeDisabled();
  });

  test('provides keyboard accessibility for selection', async ({ page }) => {
    const firstCheckbox = page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox');
    
    // Focus the checkbox
    await firstCheckbox.focus();
    await expect(firstCheckbox).toBeFocused();
    
    // Use Space key to select
    await page.keyboard.press('Space');
    await expect(firstCheckbox).toBeChecked();
    await expect(page.getByText('(1/2 selected)')).toBeVisible();
    
    // Use Space key to deselect
    await page.keyboard.press('Space');
    await expect(firstCheckbox).not.toBeChecked();
    await expect(page.getByText('(0/2 selected)')).toBeVisible();
  });

  test('shows visual feedback for selected rows', async ({ page }) => {
    const firstRow = page.getByRole('row', { name: /A-Bomb/ });
    const firstCheckbox = firstRow.getByRole('checkbox');
    
    // Select hero and check for visual styling
    await firstCheckbox.click();
    await expect(firstCheckbox).toBeChecked();
    
    // The selection should be visually indicated
    // (Note: This depends on CSS implementation, adjust selector as needed)
    await expect(firstRow).toHaveClass(/selected/i);
  });

  test('handles rapid selection changes gracefully', async ({ page }) => {
    const checkboxes = page.getByRole('checkbox');
    
    // Rapidly click through selections
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();
    await checkboxes.nth(2).click();
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();
    
    // Should end up with stable state
    await expect(page.getByText('(2/2 selected)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeEnabled();
  });
});

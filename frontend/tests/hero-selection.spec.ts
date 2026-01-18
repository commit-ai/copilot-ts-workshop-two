import { test, expect } from '@playwright/test';

test.describe('Hero Selection Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForSelector('tbody tr');
  });

  test('should select a single hero', async ({ page }) => {
    // Select first hero
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    await firstCheckbox.check();
    
    await expect(firstCheckbox).toBeChecked();
    await expect(page.getByText(/1\/2 selected/)).toBeVisible();
    await expect(page.getByText(/Selected: A-Bomb/)).toBeVisible();
  });

  test('should select two heroes', async ({ page }) => {
    // Select first hero
    const firstCheckbox = page.locator('tbody tr').nth(0).locator('input[type="checkbox"]');
    await firstCheckbox.check();
    
    // Select second hero
    const secondCheckbox = page.locator('tbody tr').nth(1).locator('input[type="checkbox"]');
    await secondCheckbox.check();
    
    await expect(firstCheckbox).toBeChecked();
    await expect(secondCheckbox).toBeChecked();
    await expect(page.getByText(/2\/2 selected/)).toBeVisible();
    await expect(page.getByText(/Selected: A-Bomb, Ant-Man/)).toBeVisible();
  });

  test('should unselect a hero', async ({ page }) => {
    // Select and then unselect first hero
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    await firstCheckbox.check();
    await expect(page.getByText(/1\/2 selected/)).toBeVisible();
    
    await firstCheckbox.uncheck();
    await expect(firstCheckbox).not.toBeChecked();
    await expect(page.getByText(/0\/2 selected/)).toBeVisible();
  });

  test('should enable compare button when two heroes selected', async ({ page }) => {
    const compareButton = page.getByRole('button', { name: /Compare Heroes/i });
    await expect(compareButton).toBeDisabled();
    
    // Select first hero
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await expect(compareButton).toBeDisabled();
    
    // Select second hero
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await expect(compareButton).toBeEnabled();
  });

  test('should replace first selection when selecting third hero', async ({ page }) => {
    // Select first two heroes
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    
    await expect(page.getByText(/Selected: A-Bomb, Ant-Man/)).toBeVisible();
    
    // Select third hero - should replace A-Bomb with Bane
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').check();
    
    // First checkbox should be unchecked, second and third should be checked
    await expect(page.locator('tbody tr').nth(0).locator('input[type="checkbox"]')).not.toBeChecked();
    await expect(page.locator('tbody tr').nth(1).locator('input[type="checkbox"]')).toBeChecked();
    await expect(page.locator('tbody tr').nth(2).locator('input[type="checkbox"]')).toBeChecked();
    await expect(page.getByText(/Selected: Ant-Man, Bane/)).toBeVisible();
  });

  test('should highlight selected rows', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    
    // Row should not have selected class initially
    await expect(firstRow).not.toHaveClass(/selected-row/);
    
    // Select hero and check for selected class
    await firstRow.locator('input[type="checkbox"]').check();
    await expect(firstRow).toHaveClass(/selected-row/);
  });
});

import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('should fetch superhero data from backend API', async ({ page }) => {
    // Intercept API call
    const apiPromise = page.waitForResponse(response => 
      response.url().includes('/api/superheroes') && !response.url().includes('/powerstats')
    );
    
    await page.goto('http://localhost:3001');
    
    const response = await apiPromise;
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('powerstats');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept and fail the API request
    await page.route('**/api/superheroes', route => route.abort());
    
    await page.goto('http://localhost:3001');
    
    // Should still render the page structure even if API fails
    await expect(page.locator('h1')).toHaveText('Superheroes');
    await expect(page.locator('table')).toBeVisible();
    
    // Table body should be empty or show no data
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(0);
  });

  test('should display superhero data immediately after API response', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Wait for API response and data to be rendered
    await page.waitForResponse(response => response.url().includes('/api/superheroes'));
    await page.waitForSelector('tbody tr');
    
    // Verify data is displayed
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(3);
  });
});

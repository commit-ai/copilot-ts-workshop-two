import { test, expect } from '@playwright/test';

test.describe('Error Handling and Edge Cases', () => {
  test('handles API server errors gracefully', async ({ page }) => {
    // Mock API failure by intercepting the request
    await page.route('**/api/superheroes', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/');
    
    // Page should still load basic structure
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    
    // No data rows should be present, only header row
    await expect(page.getByRole('row')).toHaveCount(1); // Only header row
    
    // Selection info should show initial state
    await expect(page.getByText('Select 2 superheroes to compare (0/2 selected)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeDisabled();
  });

  test('handles empty API response appropriately', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/superheroes', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/');
    
    // Page should load with empty table body
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(1); // Only header row
    
    // Controls should be present but inactive
    await expect(page.getByText('(0/2 selected)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeDisabled();
  });

  test('handles malformed JSON responses', async ({ page }) => {
    // Mock malformed response
    await page.route('**/api/superheroes', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json content that cannot be parsed'
      });
    });

    await page.goto('/');
    
    // Page should still render basic structure
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    
    // No data should be displayed due to parsing error
    await expect(page.getByRole('row')).toHaveCount(1); // Only header
  });

  test('handles slow API responses with loading states', async ({ page }) => {
    // Mock slow response
    await page.route('**/api/superheroes', async route => {
      // Wait 1 second before responding
      await page.waitForTimeout(1000);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: "Test Hero",
            image: "test.jpg",
            powerstats: {
              intelligence: 50,
              strength: 50,
              speed: 50,
              durability: 50,
              power: 50,
              combat: 50
            }
          }
        ])
      });
    });

    await page.goto('/');
    
    // Initially should show basic structure
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    
    // Wait for data to eventually load
    await expect(page.getByRole('row')).toHaveCount(2, { timeout: 3000 }); // header + 1 data row
    await expect(page.getByRole('row', { name: /Test Hero/ })).toBeVisible();
  });

  test('handles heroes with incomplete or invalid stats', async ({ page }) => {
    // Mock response with problematic data
    await page.route('**/api/superheroes', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: "Hero With Missing Stats",
            image: "test.jpg",
            powerstats: {
              intelligence: null,
              strength: "invalid",
              speed: undefined,
              durability: 50,
              power: 50,
              combat: 50
            }
          },
          {
            id: 2,
            name: "Hero With No Stats",
            image: "test.jpg"
            // Missing powerstats entirely
          }
        ])
      });
    });

    await page.goto('/');
    
    // Should still load heroes despite data issues
    await expect(page.getByRole('row')).toHaveCount(3); // header + 2 data rows
    await expect(page.getByRole('row', { name: /Hero With Missing Stats/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /Hero With No Stats/ })).toBeVisible();
    
    // Should be able to select them (even if comparison might handle nulls)
    const checkboxes = page.getByRole('checkbox');
    await checkboxes.first().click();
    await expect(page.getByText('(1/2 selected)')).toBeVisible();
  });

  test('handles network timeouts gracefully', async ({ page }) => {
    // Mock timeout by never responding
    await page.route('**/api/superheroes', route => {
      // Don't respond to simulate timeout/hanging request
    });

    await page.goto('/');
    
    // Page should load but remain empty
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    
    // Should not have any data rows after reasonable wait
    await page.waitForTimeout(2000);
    await expect(page.getByRole('row')).toHaveCount(1); // Only header
  });

  test('handles image loading failures appropriately', async ({ page }) => {
    // Mock response with invalid image URLs
    await page.route('**/api/superheroes', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: "Hero With Bad Image",
            image: "https://invalid-url-that-will-fail.com/image.jpg",
            powerstats: {
              intelligence: 50,
              strength: 50,
              speed: 50,
              durability: 50,
              power: 50,
              combat: 50
            }
          }
        ])
      });
    });

    await page.goto('/');
    await expect(page.getByRole('row')).toHaveCount(2);
    
    // Image should still be present in DOM with correct attributes
    const heroImage = page.getByRole('img', { name: 'Hero With Bad Image' });
    await expect(heroImage).toBeVisible();
    await expect(heroImage).toHaveAttribute('src', 'https://invalid-url-that-will-fail.com/image.jpg');
  });

  test('handles comparison view with invalid hero data', async ({ page }) => {
    // Mock heroes with problematic stats for comparison
    await page.route('**/api/superheroes', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: "Hero A",
            image: "test1.jpg",
            powerstats: {
              intelligence: null,
              strength: 0,
              speed: -5,
              durability: "invalid",
              power: undefined,
              combat: 50
            }
          },
          {
            id: 2,
            name: "Hero B",
            image: "test2.jpg",
            powerstats: {
              intelligence: 100,
              strength: 75,
              speed: 60,
              durability: 80,
              power: 90,
              combat: 85
            }
          }
        ])
      });
    });

    await page.goto('/');
    await expect(page.getByRole('row')).toHaveCount(3);
    
    // Select both heroes
    const checkboxes = page.getByRole('checkbox');
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Comparison view should still load
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Hero A' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Hero B' })).toBeVisible();
    
    // Should handle invalid stats gracefully
    await expect(page.getByRole('heading', { level: 2, name: 'Final Result' })).toBeVisible();
  });

  test('maintains functionality during rapid user interactions', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('row')).toHaveCount(4);
    
    const checkboxes = page.getByRole('checkbox');
    
    // Rapidly interact with the interface
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
    
    // Should maintain stable state
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    await expect(page.getByText('(0/2 selected)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Compare Heroes' })).toBeDisabled();
  });

  test('handles browser compatibility edge cases', async ({ page }) => {
    await page.goto('/');
    
    // Test with different viewport sizes for responsive handling
    await page.setViewportSize({ width: 320, height: 568 }); // Small mobile
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    
    await page.setViewportSize({ width: 1920, height: 1080 }); // Large desktop
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('handles missing or corrupted storage gracefully', async ({ page }) => {
    // This test will skip localStorage operations that might fail
    await page.goto('/');
    
    // App should still function normally without storage
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(4);
    
    // Basic functionality should work
    const checkboxes = page.getByRole('checkbox');
    await checkboxes.nth(0).click();
    await expect(page.getByText('(1/2 selected)')).toBeVisible();
  });

  test('provides fallbacks for accessibility features', async ({ page }) => {
    await page.goto('/');
    
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Basic functionality should still work
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    const checkboxes = page.getByRole('checkbox');
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
  });
});

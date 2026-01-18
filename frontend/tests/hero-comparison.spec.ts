import { test, expect } from '@playwright/test';

test.describe('Hero Comparison View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForSelector('tbody tr');
    
    // Mock the comparison API endpoint for A-Bomb vs Ant-Man (tie)
    await page.route('**/api/superheroes/compare*', async (route) => {
      const url = new URL(route.request().url());
      const id1 = url.searchParams.get('id1');
      const id2 = url.searchParams.get('id2');
      
      // A-Bomb (1) vs Ant-Man (2) - Tie 3-3
      if ((id1 === '1' && id2 === '2') || (id1 === '2' && id2 === '1')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id1: 1,
            id2: 2,
            categories: [
              { name: 'intelligence', winner: 2, id1_value: 38, id2_value: 100 },
              { name: 'strength', winner: 1, id1_value: 100, id2_value: 18 },
              { name: 'speed', winner: 2, id1_value: 17, id2_value: 23 },
              { name: 'durability', winner: 1, id1_value: 80, id2_value: 28 },
              { name: 'power', winner: 2, id1_value: 24, id2_value: 32 },
              { name: 'combat', winner: 1, id1_value: 64, id2_value: 32 }
            ],
            overall_winner: 'tie'
          })
        });
      }
    });
    
    // Select A-Bomb (id: 1) and Ant-Man (id: 2)
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    
    // Click compare button
    await page.getByRole('button', { name: /Compare Heroes/i }).click();
    
    // Wait for comparison to load
    await page.waitForSelector('.final-result', { timeout: 5000 });
  });

  test('should navigate to comparison view', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Superhero Comparison');
    await expect(page.getByRole('button', { name: /Back to Heroes Table/i })).toBeVisible();
  });

  test('should display both heroes in comparison', async ({ page }) => {
    // Check hero names
    const heroCards = page.locator('.hero-card h2');
    await expect(heroCards).toHaveCount(2);
    await expect(heroCards.nth(0)).toHaveText('A-Bomb');
    await expect(heroCards.nth(1)).toHaveText('Ant-Man');
  });

  test('should display hero images in comparison', async ({ page }) => {
    const images = page.locator('.hero-card img');
    await expect(images).toHaveCount(2);
    
    await expect(images.nth(0)).toHaveAttribute('alt', 'A-Bomb');
    await expect(images.nth(1)).toHaveAttribute('alt', 'Ant-Man');
  });

  test('should display VS section', async ({ page }) => {
    await expect(page.locator('.vs-section')).toBeVisible();
    await expect(page.locator('.vs-section h2')).toHaveText('VS');
  });

  test('should display all stats comparison', async ({ page }) => {
    const stats = ['Intelligence', 'Strength', 'Speed', 'Durability', 'Power', 'Combat'];
    
    for (const stat of stats) {
      await expect(page.locator('.stat-name', { hasText: stat })).toBeVisible();
    }
  });

  test('should highlight winning stats correctly', async ({ page }) => {
    // A-Bomb vs Ant-Man comparison:
    // Intelligence: 38 vs 100 (Ant-Man wins)
    // Strength: 100 vs 18 (A-Bomb wins)
    // Speed: 17 vs 23 (Ant-Man wins)
    // Durability: 80 vs 28 (A-Bomb wins)
    // Power: 24 vs 32 (Ant-Man wins)
    // Combat: 64 vs 32 (A-Bomb wins)
    // Result: A-Bomb 3, Ant-Man 3 - TIE
    
    const intelligenceRow = page.locator('.stat-row', { has: page.locator('.stat-name', { hasText: 'Intelligence' }) });
    const intelligenceValues = intelligenceRow.locator('.stat-value');
    await expect(intelligenceValues.nth(0)).toHaveText('38');
    await expect(intelligenceValues.nth(1)).toHaveText('100');
    await expect(intelligenceValues.nth(1)).toHaveClass(/winner/);
    
    const strengthRow = page.locator('.stat-row', { has: page.locator('.stat-name', { hasText: 'Strength' }) });
    const strengthValues = strengthRow.locator('.stat-value');
    await expect(strengthValues.nth(0)).toHaveText('100');
    await expect(strengthValues.nth(1)).toHaveText('18');
    await expect(strengthValues.nth(0)).toHaveClass(/winner/);
  });

  test('should display final result section', async ({ page }) => {
    await expect(page.locator('.final-result h2')).toHaveText('Final Result');
  });

  test('should show tie result for A-Bomb vs Ant-Man', async ({ page }) => {
    // A-Bomb wins 3 categories, Ant-Man wins 3 categories
    await expect(page.locator('.tie-announcement h3')).toHaveText("🤝 It's a Tie!");
    await expect(page.locator('.tie-announcement p')).toHaveText('Score: 3-3');
  });

  test('should navigate back to table view', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /Back to Heroes Table/i });
    await backButton.click();
    
    // Should be back on table view
    await expect(page.locator('h1')).toHaveText('Superheroes');
    await expect(page.locator('table')).toBeVisible();
    
    // Selections should be cleared
    await expect(page.getByText(/0\/2 selected/)).toBeVisible();
    const checkboxes = page.locator('tbody tr input[type="checkbox"]');
    for (let i = 0; i < 3; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked();
    }
  });
});

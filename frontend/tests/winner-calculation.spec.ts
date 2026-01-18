import { test, expect } from '@playwright/test';

test.describe('Winner Calculation Logic', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocking for different hero comparisons
    await page.route('**/api/superheroes/compare*', async (route) => {
      const url = new URL(route.request().url());
      const id1 = parseInt(url.searchParams.get('id1') || '0');
      const id2 = parseInt(url.searchParams.get('id2') || '0');
      
      // A-Bomb (1) vs Ant-Man (2) - Tie 3-3
      if ((id1 === 1 && id2 === 2) || (id1 === 2 && id2 === 1)) {
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
      // Ant-Man (2) vs Bane (3) - Bane wins 4-1
      else if ((id1 === 2 && id2 === 3) || (id1 === 3 && id2 === 2)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id1: 2,
            id2: 3,
            categories: [
              { name: 'intelligence', winner: 2, id1_value: 100, id2_value: 88 },
              { name: 'strength', winner: 3, id1_value: 18, id2_value: 38 },
              { name: 'speed', winner: null, id1_value: 23, id2_value: 23 },
              { name: 'durability', winner: 3, id1_value: 28, id2_value: 56 },
              { name: 'power', winner: 3, id1_value: 32, id2_value: 51 },
              { name: 'combat', winner: 3, id1_value: 32, id2_value: 95 }
            ],
            overall_winner: 3
          })
        });
      }
      // A-Bomb (1) vs Bane (3) - Bane wins 4-2
      else if ((id1 === 1 && id2 === 3) || (id1 === 3 && id2 === 1)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id1: 1,
            id2: 3,
            categories: [
              { name: 'intelligence', winner: 3, id1_value: 38, id2_value: 88 },
              { name: 'strength', winner: 1, id1_value: 100, id2_value: 38 },
              { name: 'speed', winner: 3, id1_value: 17, id2_value: 23 },
              { name: 'durability', winner: 1, id1_value: 80, id2_value: 56 },
              { name: 'power', winner: 3, id1_value: 24, id2_value: 51 },
              { name: 'combat', winner: 3, id1_value: 64, id2_value: 95 }
            ],
            overall_winner: 3
          })
        });
      }
    });
    
    await page.goto('http://localhost:3001');
    await page.waitForSelector('tbody tr');
  });

  test('should show A-Bomb wins against Ant-Man (tie scenario)', async ({ page }) => {
    // Select A-Bomb (id: 1) and Ant-Man (id: 2)
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /Compare Heroes/i }).click();
    
    // Wait for comparison result
    await page.waitForSelector('.final-result', { timeout: 5000 });
    
    // Should show tie with score 3-3
    await expect(page.locator('.tie-announcement h3')).toBeVisible();
    await expect(page.locator('.tie-announcement h3')).toContainText("It's a Tie!");
    await expect(page.locator('.tie-announcement p')).toContainText('3-3');
  });

  test('should show Bane wins against Ant-Man', async ({ page }) => {
    // Select Ant-Man (id: 2) and Bane (id: 3)
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /Compare Heroes/i }).click();
    
    // Wait for comparison result
    await page.waitForSelector('.final-result', { timeout: 5000 });
    
    // Bane vs Ant-Man:
    // Intelligence: 88 vs 100 (Ant-Man wins)
    // Strength: 38 vs 18 (Bane wins)
    // Speed: 23 vs 23 (Tie)
    // Durability: 56 vs 28 (Bane wins)
    // Power: 51 vs 32 (Bane wins)
    // Combat: 95 vs 32 (Bane wins)
    // Result: Bane wins 4-1
    
    await expect(page.locator('.winner-announcement h3')).toBeVisible();
    await expect(page.locator('.winner-announcement h3')).toContainText('Bane Wins!');
    await expect(page.locator('.winner-announcement p')).toContainText('4-1');
  });

  test('should show A-Bomb wins against Bane', async ({ page }) => {
    // Select A-Bomb (id: 1) and Bane (id: 3)
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /Compare Heroes/i }).click();
    
    // Wait for comparison result
    await page.waitForSelector('.final-result', { timeout: 5000 });
    
    // A-Bomb vs Bane:
    // Intelligence: 38 vs 88 (Bane wins)
    // Strength: 100 vs 38 (A-Bomb wins)
    // Speed: 17 vs 23 (Bane wins)
    // Durability: 80 vs 56 (A-Bomb wins)
    // Power: 24 vs 51 (Bane wins)
    // Combat: 64 vs 95 (Bane wins)
    // Result: Bane wins 4-2
    
    await expect(page.locator('.winner-announcement h3')).toBeVisible();
    await expect(page.locator('.winner-announcement h3')).toContainText('Bane Wins!');
    await expect(page.locator('.winner-announcement p')).toContainText('4-2');
  });

  test('should display correct stat values in comparison', async ({ page }) => {
    // Select A-Bomb and Bane
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /Compare Heroes/i }).click();
    
    // Wait for comparison result
    await page.waitForSelector('.stats-comparison', { timeout: 5000 });
    
    // Verify intelligence row
    const intelligenceRow = page.locator('.stat-row', { has: page.locator('.stat-name', { hasText: 'Intelligence' }) });
    const intelValues = intelligenceRow.locator('.stat-value');
    await expect(intelValues.nth(0)).toHaveText('38');
    await expect(intelValues.nth(1)).toHaveText('88');
    
    // Verify strength row
    const strengthRow = page.locator('.stat-row', { has: page.locator('.stat-name', { hasText: 'Strength' }) });
    const strengthValues = strengthRow.locator('.stat-value');
    await expect(strengthValues.nth(0)).toHaveText('100');
    await expect(strengthValues.nth(1)).toHaveText('38');
  });

  test('should highlight all winning stats correctly', async ({ page }) => {
    // Select Ant-Man and Bane
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /Compare Heroes/i }).click();
    
    // Wait for comparison result
    await page.waitForSelector('.stats-comparison', { timeout: 5000 });
    
    // Count winner highlights (should be 5: 4 for Bane, 1 for Ant-Man)
    const winnerStats = page.locator('.stat-value.winner');
    await expect(winnerStats).toHaveCount(5);
  });
});

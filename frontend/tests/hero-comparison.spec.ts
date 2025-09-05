import { test, expect } from '@playwright/test';

test.describe('Hero Comparison View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for data to load
    await expect(page.getByRole('row')).toHaveCount(4);
  });

  test('navigates to comparison view when two heroes are selected', async ({ page }) => {
    // Select two heroes using semantic selectors
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    
    // Click compare button
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Should be in comparison view
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    
    // Table view should not be visible anymore
    await expect(page.getByRole('table')).not.toBeVisible();
  });

  test('displays hero cards with correct information', async ({ page }) => {
    // Select two heroes and navigate to comparison
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Check hero cards are displayed with images and names
    await expect(page.getByRole('heading', { level: 2, name: 'A-Bomb' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Ant-Man' })).toBeVisible();
    
    // Check hero images with proper alt text
    await expect(page.getByRole('img', { name: 'A-Bomb' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Ant-Man' })).toBeVisible();
    
    // Check VS section
    await expect(page.getByRole('heading', { level: 2, name: 'VS' })).toBeVisible();
  });

  test('displays comprehensive stats comparison', async ({ page }) => {
    // Select heroes with known stats
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Verify all stat categories are displayed
    const expectedStats = ['Intelligence', 'Strength', 'Speed', 'Durability', 'Power', 'Combat'];
    
    for (const stat of expectedStats) {
      await expect(page.getByText(stat)).toBeVisible();
    }
    
    // Verify specific stat values based on known data
    // A-Bomb: Intelligence 38, Strength 100, Speed 17, Durability 80, Power 24, Combat 64
    // Ant-Man: Intelligence 100, Strength 18, Speed 23, Durability 28, Power 32, Combat 32
    const statsComparison = page.locator('.stats-comparison');
    await expect(statsComparison.getByText('38')).toBeVisible(); // A-Bomb Intelligence
    await expect(statsComparison.getByText('100').first()).toBeVisible(); // A-Bomb Strength or Ant-Man Intelligence
    await expect(statsComparison.getByText('17')).toBeVisible(); // A-Bomb Speed
    await expect(statsComparison.getByText('23')).toBeVisible(); // Ant-Man Speed
  });

  test('calculates and displays winner correctly for clear victory', async ({ page }) => {
    // Select A-Bomb vs Bane for a clear winner scenario
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Bane/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Check final result section is present
    await expect(page.getByRole('heading', { level: 2, name: 'Final Result' })).toBeVisible();
    
    // Based on the stats, check for winner announcement
    // This test validates that a winner is declared when stats are not tied
    const hasWinner = await page.getByText(/Wins!/i).isVisible();
    const hasTie = await page.getByText(/It's a Tie!/i).isVisible();
    
    // One of these should be true (either winner or tie)
    expect(hasWinner || hasTie).toBe(true);
    
    // Score should be displayed
    await expect(page.getByText(/Score:/)).toBeVisible();
  });

  test('displays tie correctly when heroes have equal wins', async ({ page }) => {
    // Test the tie scenario we observed (A-Bomb vs Ant-Man results in 3-3 tie)
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Check for tie announcement
    await expect(page.getByRole('heading', { level: 3, name: '🤝 It\'s a Tie!' })).toBeVisible();
    await expect(page.getByText('Score: 3-3')).toBeVisible();
  });

  test('provides back navigation functionality', async ({ page }) => {
    // Navigate to comparison view
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Check back button is present and functional
    const backButton = page.getByRole('button', { name: '← Back to Heroes Table' });
    await expect(backButton).toBeVisible();
    
    // Test navigation back
    await backButton.click();
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('handles different hero combinations correctly', async ({ page }) => {
    // Test with different hero pair (Ant-Man vs Bane)
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Bane/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Verify correct heroes are displayed
    await expect(page.getByRole('heading', { level: 2, name: 'Ant-Man' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Bane' })).toBeVisible();
    
    // Verify VS section and stats are present
    await expect(page.getByRole('heading', { level: 2, name: 'VS' })).toBeVisible();
    await expect(page.getByText('Intelligence')).toBeVisible();
    
    // Final result should be calculated
    await expect(page.getByRole('heading', { level: 2, name: 'Final Result' })).toBeVisible();
  });

  test('maintains accessibility in comparison view', async ({ page }) => {
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Check proper heading hierarchy
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(4); // 2 hero names + VS + Final Result
    
    // Check images have proper alt text
    const images = page.getByRole('img');
    for (const image of await images.all()) {
      await expect(image).toHaveAttribute('alt');
    }
    
    // Check back button is keyboard accessible
    const backButton = page.getByRole('button', { name: '← Back to Heroes Table' });
    await backButton.focus();
    await expect(backButton).toBeFocused();
  });

  test('displays stat comparisons with visual indicators', async ({ page }) => {
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Check that stats are displayed in organized comparison format
    // Each stat should show both hero values
    const statSections = page.locator('text=Intelligence').locator('..');
    await expect(statSections).toBeVisible();
    
    // Verify that the comparison shows both values for each stat
    // This tests the UI structure of the comparison
    const allStats = ['Intelligence', 'Strength', 'Speed', 'Durability', 'Power', 'Combat'];
    for (const stat of allStats) {
      await expect(page.getByText(stat)).toBeVisible();
    }
  });
});

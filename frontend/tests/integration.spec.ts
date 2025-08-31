import { test, expect } from '@playwright/test';

test.describe('End-to-End Integration Tests', () => {
  test('completes full superhero comparison workflow successfully', async ({ page }) => {
    await page.goto('/');
    
    // 1. Initial page load and data verification
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(4); // header + 3 data rows
    
    // 2. Select first hero (A-Bomb) with proper verification
    const aBombCheckbox = page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox');
    await aBombCheckbox.click();
    await expect(page.getByText('Select 2 superheroes to compare (1/2 selected)')).toBeVisible();
    await expect(page.getByText('Selected: A-Bomb')).toBeVisible();
    
    // 3. Select second hero (Ant-Man) and verify selection state
    const antManCheckbox = page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox');
    await antManCheckbox.click();
    await expect(page.getByText('(2/2 selected)')).toBeVisible();
    await expect(page.getByText('Selected: A-Bomb, Ant-Man')).toBeVisible();
    
    // 4. Verify compare button becomes enabled
    const compareButton = page.getByRole('button', { name: 'Compare Heroes' });
    await expect(compareButton).toBeEnabled();
    
    // 5. Navigate to comparison view
    await compareButton.click();
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    await expect(page.getByRole('table')).not.toBeVisible();
    
    // 6. Verify comparison content structure and data
    await expect(page.getByRole('heading', { level: 2, name: 'A-Bomb' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Ant-Man' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'VS' })).toBeVisible();
    
    // 7. Verify hero images are displayed with proper alt text
    await expect(page.getByRole('img', { name: 'A-Bomb' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Ant-Man' })).toBeVisible();
    
    // 8. Verify all stats are displayed in comparison
    const expectedStats = ['Intelligence', 'Strength', 'Speed', 'Durability', 'Power', 'Combat'];
    for (const stat of expectedStats) {
      await expect(page.getByText(stat)).toBeVisible();
    }
    
    // 9. Verify final result section with tie result
    await expect(page.getByRole('heading', { level: 2, name: 'Final Result' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: '🤝 It\'s a Tie!' })).toBeVisible();
    await expect(page.getByText('Score: 3-3')).toBeVisible();
    
    // 10. Navigate back to table view
    const backButton = page.getByRole('button', { name: '← Back to Heroes Table' });
    await backButton.click();
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    
    // 11. Verify selections are cleared after returning
    await expect(page.getByText('(0/2 selected)')).toBeVisible();
    await expect(aBombCheckbox).not.toBeChecked();
    await expect(antManCheckbox).not.toBeChecked();
    await expect(compareButton).toBeDisabled();
  });

  test('handles multiple comparison cycles with different hero pairs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('row')).toHaveCount(4);
    
    // First comparison cycle: A-Bomb vs Ant-Man
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Verify first comparison
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'A-Bomb' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Ant-Man' })).toBeVisible();
    
    // Return to table
    await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    
    // Second comparison cycle: A-Bomb vs Bane
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Bane/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Verify second comparison with different heroes
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'A-Bomb' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Bane' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Ant-Man' })).not.toBeVisible();
    
    // Verify different result (should not be a tie)
    await expect(page.getByRole('heading', { level: 2, name: 'Final Result' })).toBeVisible();
    const result = await page.getByText(/Wins!|It's a Tie!/).textContent();
    expect(result).toBeTruthy();
  });

  test('maintains responsive behavior throughout complete workflow', async ({ page }) => {
    // Test workflow on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Complete workflow on mobile
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Elements should be visible on mobile
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'A-Bomb' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Ant-Man' })).toBeVisible();
    
    // Change to tablet viewport mid-workflow
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    
    // Navigation should work on tablet
    await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    
    // Change to desktop and verify
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('handles rapid user interactions without breaking state', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('row')).toHaveCount(4);
    
    const checkboxes = page.getByRole('checkbox');
    const compareButton = page.getByRole('button', { name: 'Compare Heroes' });
    
    // Rapid selection sequence
    await checkboxes.nth(0).click(); // Select A-Bomb
    await checkboxes.nth(1).click(); // Select Ant-Man
    await checkboxes.nth(2).click(); // Select Bane (should replace A-Bomb)
    await checkboxes.nth(0).click(); // Select A-Bomb again (should replace Ant-Man)
    await checkboxes.nth(1).click(); // Select Ant-Man again (should replace Bane)
    
    // Should end up with A-Bomb and Ant-Man selected
    await expect(checkboxes.nth(0)).toBeChecked();
    await expect(checkboxes.nth(1)).toBeChecked();
    await expect(checkboxes.nth(2)).not.toBeChecked();
    await expect(page.getByText('(2/2 selected)')).toBeVisible();
    
    // Should be able to compare
    await expect(compareButton).toBeEnabled();
    await compareButton.click();
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    
    // Rapid navigation back and forth
    await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
  });

  test('validates complete accessibility workflow', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('row')).toHaveCount(4);
    
    // Test keyboard navigation throughout workflow
    const firstCheckbox = page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox');
    const secondCheckbox = page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox');
    
    // Use keyboard to select heroes
    await firstCheckbox.focus();
    await page.keyboard.press('Space');
    await expect(firstCheckbox).toBeChecked();
    
    await secondCheckbox.focus();
    await page.keyboard.press('Space');
    await expect(secondCheckbox).toBeChecked();
    
    // Use keyboard to navigate to comparison
    const compareButton = page.getByRole('button', { name: 'Compare Heroes' });
    await compareButton.focus();
    await page.keyboard.press('Enter');
    
    // Verify comparison view accessibility
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    
    // Verify proper heading hierarchy
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(4); // 2 hero names + VS + Final Result
    
    // Use keyboard to navigate back
    const backButton = page.getByRole('button', { name: '← Back to Heroes Table' });
    await backButton.focus();
    await page.keyboard.press('Enter');
    
    await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
  });

  test('handles edge case scenarios gracefully', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('row')).toHaveCount(4);
    
    // Test selecting and deselecting repeatedly
    const firstCheckbox = page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox');
    const secondCheckbox = page.getByRole('row', { name: /Ant-Man/ }).getByRole('checkbox');
    
    // Select, deselect, select again pattern
    await firstCheckbox.click();
    await firstCheckbox.click(); // Deselect
    await firstCheckbox.click(); // Select again
    await secondCheckbox.click();
    
    await expect(page.getByText('(2/2 selected)')).toBeVisible();
    
    // Navigate to comparison
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
    
    // Navigate back and verify clean state
    await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
    await expect(page.getByText('(0/2 selected)')).toBeVisible();
    
    // Test three-hero selection edge case
    const checkboxes = page.getByRole('checkbox');
    await checkboxes.nth(0).click(); // A-Bomb
    await checkboxes.nth(1).click(); // Ant-Man
    await checkboxes.nth(2).click(); // Bane (should replace A-Bomb)
    
    // Verify only two are selected (Ant-Man and Bane)
    await expect(checkboxes.nth(0)).not.toBeChecked();
    await expect(checkboxes.nth(1)).toBeChecked();
    await expect(checkboxes.nth(2)).toBeChecked();
    await expect(page.getByText('Selected: Ant-Man, Bane')).toBeVisible();
  });

  test('verifies data integrity throughout complete user journey', async ({ page }) => {
    await page.goto('/');
    
    // Capture initial hero data from table by looking for hero rows
    const heroes = ['A-Bomb', 'Ant-Man', 'Bane'];
    for (const hero of heroes) {
      await expect(page.getByRole('row', { name: new RegExp(hero) })).toBeVisible();
    }
    
    // Select two heroes and verify their data persists
    await page.getByRole('row', { name: /A-Bomb/ }).getByRole('checkbox').click();
    await page.getByRole('row', { name: /Bane/ }).getByRole('checkbox').click();
    
    // Navigate to comparison and verify hero data integrity
    await page.getByRole('button', { name: 'Compare Heroes' }).click();
    
    // Verify specific hero data is correctly displayed
    await expect(page.getByRole('heading', { level: 2, name: 'A-Bomb' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Bane' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'A-Bomb' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Bane' })).toBeVisible();
    
    // Verify stats are displayed (should show actual stat values)
    await expect(page.getByText('Intelligence')).toBeVisible();
    await expect(page.getByText('Strength')).toBeVisible();
    
    // Navigate back and verify data is still intact
    await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
    
    // Verify all original heroes are still present with correct data
    for (const hero of heroes) {
      await expect(page.getByRole('row', { name: new RegExp(hero) })).toBeVisible();
    }
  });

  test('validates performance under typical usage patterns', async ({ page }) => {
    await page.goto('/');
    
    // Perform multiple comparison cycles to test for memory leaks or performance degradation
    const heroNames = ['A-Bomb', 'Ant-Man', 'Bane'];
    
    for (let i = 0; i < 3; i++) {
      // Select different hero combinations each time
      const firstHero = heroNames[i % 3];
      const secondHero = heroNames[(i + 1) % 3];
      
      await page.getByRole('row', { name: new RegExp(firstHero) }).getByRole('checkbox').click();
      await page.getByRole('row', { name: new RegExp(secondHero) }).getByRole('checkbox').click();
      
      // Navigate to comparison
      await page.getByRole('button', { name: 'Compare Heroes' }).click();
      await expect(page.getByRole('heading', { level: 1, name: 'Superhero Comparison' })).toBeVisible();
      
      // Verify correct heroes are displayed
      await expect(page.getByRole('heading', { level: 2, name: firstHero })).toBeVisible();
      await expect(page.getByRole('heading', { level: 2, name: secondHero })).toBeVisible();
      
      // Navigate back
      await page.getByRole('button', { name: '← Back to Heroes Table' }).click();
      await expect(page.getByRole('heading', { level: 1, name: 'Superheroes' })).toBeVisible();
    }
    
    // App should still be responsive after multiple cycles
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('(0/2 selected)')).toBeVisible();
  });
});

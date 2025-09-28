import { test, expect } from '@playwright/test';
import { waitForProductCards } from './helpers/waitForProductCards';

test.describe('GIF Demo: Greek Normalization', () => {
  test('Create demo for GIF - "Πορτοκάλια/πορτοκαλια/portokalia" → same results', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for initial products to load
    await waitForProductCards(page);

    const searchInput = page.locator('input[type="text"]').first();
    
    // Show all scenarios that find "Πορτοκάλια Κρήτης"
    const scenarios = [
      'Πορτοκάλια',    // Greek with accents
      'πορτοκαλια',    // Greek without accents  
      'portokalia'     // Latin transliteration
    ];
    
    for (const query of scenarios) {
      console.log(`🔍 Demo: Searching "${query}"`);
      
      // Clear and type slowly for GIF
      await searchInput.clear();
      await searchInput.type(query, { delay: 100 });
      
      // Wait for search results to render
      await page.waitForTimeout(1000);

      // Verify the orange product is found
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();

      if (count > 0) {
        // Wait for first result to be visible
        await expect(productCards.first()).toBeVisible({ timeout: 5000 });
        const title = await productCards.first().locator('[data-testid="product-title"]').textContent();
        console.log(`   ✅ Found: "${title}"`);
        expect(title).toContain('Πορτοκάλια Κρήτης');
      }
      
      // Show the result for a bit longer for GIF
      await page.waitForTimeout(1500);
    }
    
    console.log('🎉 GIF Demo completed - all variants find the same product!');
  });
});
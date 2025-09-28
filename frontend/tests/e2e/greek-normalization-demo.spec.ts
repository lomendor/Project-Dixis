import { test, expect } from '@playwright/test';
import { waitForProductCards } from './helpers/waitForProductCards';

test.describe('Greek Normalization Demo - PP03-B', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Wait for initial products to load
    await waitForProductCards(page);
  });

  test('Demo: Greek search normalization scenarios', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    
    // Test scenarios for "Πορτοκάλια Κρήτης"
    const scenarios = [
      { query: 'Πορτοκάλια', description: 'Greek with accents' },
      { query: 'πορτοκαλια', description: 'Greek without accents (lowercase)' },
      { query: 'ΠΟΡΤΟΚΑΛΙΑ', description: 'Greek uppercase without accents' }, 
      { query: 'portokalia', description: 'Latin transliteration' }
    ];

    console.log('🎯 PP03-B Greek Normalization Demo');
    console.log('==================================');
    
    for (const scenario of scenarios) {
      console.log(`\n🔍 Testing: "${scenario.query}" (${scenario.description})`);
      
      // Clear and enter search query
      await searchInput.clear();
      await searchInput.fill(scenario.query);
      await page.waitForTimeout(800);
      
      // Check results (wait for any results to appear)
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();

      if (count > 0) {
        // Wait for first result to be visible
        await expect(productCards.first()).toBeVisible({ timeout: 5000 });
        const productTitle = await productCards.first().locator('[data-testid="product-title"]').textContent();
        console.log(`   ✅ Found: "${productTitle}" (${count} results)`);

        // Verify it's the orange product
        expect(productTitle).toContain('Πορτοκάλια');
      } else {
        console.log(`   ❌ No results found`);
      }
      
      // Check for search indicators
      const indicators = page.locator('span[title*="detected"]');
      const indicatorCount = await indicators.count();
      if (indicatorCount > 0) {
        console.log(`   🏷️  Search indicator shown`);
      }
    }

    // Test other Greek products
    console.log(`\n🔍 Testing other Greek products:`);
    
    const otherTests = [
      { query: 'ελαιολαδο', expected: 'Ελαιόλαδο' },
      { query: 'μήλα', expected: 'Μήλα' },
      { query: 'μελι', expected: 'Μέλι' }
    ];

    for (const test of otherTests) {
      await searchInput.clear();
      await searchInput.fill(test.query);
      await page.waitForTimeout(800);
      
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();

      if (count > 0) {
        // Wait for first result to be visible
        await expect(productCards.first()).toBeVisible({ timeout: 5000 });
        const productTitle = await productCards.first().locator('[data-testid="product-title"]').textContent();
        console.log(`   ✅ "${test.query}" → "${productTitle}"`);
      }
    }

    console.log('\n🎉 Greek normalization demo completed!');
    
    // Final verification - ensure we can find Greek products
    await searchInput.clear();
    await searchInput.fill('Πορτοκάλια');
    await page.waitForTimeout(500);

    const finalCards = page.locator('[data-testid="product-card"]');
    // Wait for at least one result to be visible
    await expect(finalCards.first()).toBeVisible({ timeout: 5000 });
    expect(await finalCards.count()).toBeGreaterThan(0);
  });
});
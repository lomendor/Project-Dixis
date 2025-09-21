import { test, expect } from '@playwright/test';

test.describe('Greek Normalization Demo - PP03-B', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
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
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
      
      // Check results
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();
      
      if (count > 0) {
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
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
      
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();
      
      if (count > 0) {
        const productTitle = await productCards.first().locator('[data-testid="product-title"]').textContent();
        console.log(`   ✅ "${test.query}" → "${productTitle}"`);
      }
    }

    console.log('\n🎉 Greek normalization demo completed!');
    
    // Final verification - ensure we can find Greek products
    await searchInput.clear();
    await searchInput.fill('Πορτοκάλια');
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    const finalCards = page.locator('[data-testid="product-card"]');
    expect(await finalCards.count()).toBeGreaterThan(0);
  });
});
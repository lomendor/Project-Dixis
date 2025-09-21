import { test, expect } from '@playwright/test';

test.describe('Latin Transliteration Test', () => {
  test('should find Greek products using Latin transliteration', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Wait for products to load
    const initialCards = page.locator('[data-testid="product-card"]');
    const initialCount = await initialCards.count();
    console.log(`Initial products: ${initialCount}`);
    
    // Search for "portokalia" (Latin transliteration)
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('portokalia');
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
    
    // Check results
    const searchCards = page.locator('[data-testid="product-card"]');
    const searchCount = await searchCards.count();
    console.log(`Products after "portokalia" search: ${searchCount}`);
    
    // List products found
    for (let i = 0; i < Math.min(searchCount, 3); i++) {
      const productTitle = await searchCards.nth(i).locator('[data-testid="product-title"]').textContent();
      console.log(`Result ${i + 1}: ${productTitle}`);
    }
    
    // Should find at least one product
    expect(searchCount).toBeGreaterThan(0);
    
    // Should show Latin indicator
    await expect(page.locator('span[title*="Latin text detected"]')).toBeVisible();
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'latin-transliteration-debug.png', fullPage: true });
    
    console.log('✅ Latin transliteration test completed');
  });
});
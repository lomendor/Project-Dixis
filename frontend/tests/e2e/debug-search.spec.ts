import { test, expect } from '@playwright/test';
import { waitForProductCards } from './helpers/waitForProductCards';

test.describe('Debug Search Functionality', () => {
  test('debug search behavior', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for product cards to be visible before counting
    await waitForProductCards(page);

    // Take initial screenshot
    await page.screenshot({ path: 'debug-1-initial.png', fullPage: true });

    // Count initial products
    const initialCards = page.locator('[data-testid="product-card"]');
    const initialCount = await initialCards.count();
    console.log(`Initial products: ${initialCount}`);

    // List all product names
    for (let i = 0; i < initialCount; i++) {
      const productTitle = await initialCards.nth(i).locator('[data-testid="product-title"]').textContent();
      console.log(`Product ${i + 1}: ${productTitle}`);
    }
    
    // Find and fill search input
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('Πορτοκάλια');

    // Wait for search results to render (may be 0 or more cards)
    await page.waitForTimeout(1000);

    // Take screenshot after search
    await page.screenshot({ path: 'debug-2-after-search.png', fullPage: true });

    // Count products after search
    const searchCards = page.locator('[data-testid="product-card"]');
    const searchCount = await searchCards.count();
    console.log(`Products after search: ${searchCount}`);

    // List all product names after search
    for (let i = 0; i < searchCount; i++) {
      const productTitle = await searchCards.nth(i).locator('[data-testid="product-title"]').textContent();
      console.log(`After search ${i + 1}: ${productTitle}`);
    }
    
    // Check if search indicators are showing
    const searchIndicators = await page.locator('span[title*="detected"]').count();
    console.log(`Search indicators: ${searchIndicators}`);
    
    // Check for search variants
    const variantsText = await page.locator('text=Searching for:').count();
    console.log(`Search variants shown: ${variantsText > 0}`);
  });
});
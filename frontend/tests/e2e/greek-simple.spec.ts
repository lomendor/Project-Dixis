import { test, expect } from '@playwright/test';

test.describe('Basic Greek Search Test', () => {
  test('should load homepage and show Greek products', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'homepage-debug.png', fullPage: true });
    
    // Check if products are loaded
    const productCards = page.locator('[data-testid="product-card"]');
    console.log('Product cards count:', await productCards.count());
    
    // Should have products
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Look for Greek text in products
    await expect(page.locator('text=Πορτοκάλια')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Greek products are visible on homepage');
  });

  test('should perform basic search', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find search input
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();
    
    // Search for oranges in Greek
    await searchInput.fill('Πορτοκάλια');
    await page.waitForTimeout(1000);
    
    // Take screenshot after search
    await page.screenshot({ path: 'search-debug.png', fullPage: true });
    
    console.log('✅ Search completed');
  });
});
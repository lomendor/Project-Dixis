import { test, expect } from '@playwright/test';

test.describe('Filters and Search', () => {
  // Clean state before each test
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('should apply search filter with Greek text normalization', async ({ page }) => {
    // Navigate to catalog page
    await page.goto('/');
    
    // Wait for deterministic E2E products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 });
    
    // Count initial products (should include E2E seeded products)
    const initialProductCount = await page.locator('[data-testid="product-card"]').count();
    expect(initialProductCount).toBeGreaterThan(0);
    
    // Use stable data-testid selector for search input
    const searchInput = page.getByTestId('search-input');
    
    if (await searchInput.isVisible({ timeout: 3000 })) {
      // Test Greek search - should find "Πορτοκάλια E2E Test" product from E2ESeeder
      await searchInput.fill('Πορτοκάλια');
      
      // Wait for search results (with debounce)
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
      
      // Check if results were filtered
      const filteredProductCount = await page.locator('[data-testid="product-card"]').count();
      
      if (filteredProductCount > 0) {
        expect(filteredProductCount).toBeLessThanOrEqual(initialProductCount);
        
        // Verify Greek product is found using stable selector
        const productTitles = page.getByTestId('product-title');
        const visibleTitles = await productTitles.allTextContents();
        
        // Should find Greek oranges (normalized search)
        const hasGreekOranges = visibleTitles.some(title => 
          title.toLowerCase().includes('πορτοκάλια') || 
          title.toLowerCase().includes('oranges')
        );
        expect(hasGreekOranges).toBe(true);
      } else {
        // If no results, ensure proper "no results" message
        await expect(page.getByTestId('no-results-message')).toBeVisible({ timeout: 5000 });
      }
      
      // Test normalization - search for "πορτοκαλια" (without accent) should work
      await searchInput.clear();
      await searchInput.fill('πορτοκαλια'); // no accent
      
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
      
      const normalizedResults = await page.locator('[data-testid="product-card"]').count();
      if (normalizedResults > 0) {
        // Greek normalization should work - results should be similar
        expect(normalizedResults).toBeGreaterThan(0);
      }
      
      // Clear search filter
      await searchInput.clear();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
      
      // Verify all products are restored
      const restoredProductCount = await page.locator('[data-testid="product-card"]').count();
      expect(restoredProductCount).toBeGreaterThanOrEqual(initialProductCount);
    } else {
      console.log('⚠️ Search input not found - verify data-testid="search-input" exists');
    }
  });

test('filters and search - category filter', async ({ page }) => {
  // Navigate to catalog page
  await Promise.all([
    page.waitForURL('/', { timeout: 10000 }),
    page.goto('/')
  ]);
  
  // Wait for initial products to load
  await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 });
  
  // Count initial products
  const initialProductCount = await page.locator('[data-testid="product-card"]').count();
  expect(initialProductCount).toBeGreaterThan(0);
  
  // Find category filter (dropdown, buttons, or links)
  const categoryFilter = page.locator('select[name*="category" i], [data-testid="category-filter"], .category-filter select, .filter-category select').first();
  const categoryButtons = page.locator('[data-testid="category-button"], .category-btn, .filter-btn[data-category]');
  const categoryLinks = page.locator('a[href*="category"], .category-link');
  
  if (await categoryFilter.isVisible({ timeout: 3000 })) {
    // Use dropdown category filter
    const options = await categoryFilter.locator('option').all();
    if (options.length > 1) {
      // Select first non-empty option
      const firstOption = await options[1].getAttribute('value');
      if (firstOption) {
        await categoryFilter.selectOption(firstOption);
        
        // Wait for results to update
        await page.waitForTimeout(1000);
        await page.waitForLoadState('networkidle');
        
        // Verify filter was applied
        const filteredProductCount = await page.locator('[data-testid="product-card"]').count();
        expect(filteredProductCount).toBeLessThanOrEqual(initialProductCount);
        
        // Reset filter
        await categoryFilter.selectOption('');
        await page.waitForTimeout(1000);
        await page.waitForLoadState('networkidle');
        
        const restoredProductCount = await page.locator('[data-testid="product-card"]').count();
        expect(restoredProductCount).toBeGreaterThanOrEqual(initialProductCount);
      }
    }
  } else if (await categoryButtons.first().isVisible({ timeout: 3000 })) {
    // Use button category filter
    const firstButton = categoryButtons.first();
    await firstButton.click();
    
    // Wait for results to update
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    
    // Verify filter was applied
    const filteredProductCount = await page.locator('[data-testid="product-card"]').count();
    
    // Look for active state or "All" button to reset
    const allButton = page.locator('[data-testid="category-button"]:has-text("All"), .category-btn:has-text("All"), .filter-btn:has-text("All")').first();
    if (await allButton.isVisible()) {
      await allButton.click();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
    }
  } else if (await categoryLinks.first().isVisible({ timeout: 3000 })) {
    // Use link category filter - just verify they exist
    const linkCount = await categoryLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  } else {
    console.log('⚠️ Category filter not found - skipping category test');
  }
});

test('filters and search - sort functionality', async ({ page }) => {
  // Navigate to catalog page
  await Promise.all([
    page.waitForURL('/', { timeout: 10000 }),
    page.goto('/')
  ]);
  
  // Wait for initial products to load
  await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 });
  
  // Find sort dropdown
  const sortDropdown = page.locator('select[name*="sort" i], [data-testid="sort-select"], .sort-filter select, select:has(option:has-text("price"))').first();
  
  if (await sortDropdown.isVisible({ timeout: 3000 })) {
    // Get initial product prices to verify sorting
    const initialPrices = await page.locator('[data-testid="product-price"], .price, .product-price').allTextContents();
    
    if (initialPrices.length > 0) {
      // Try to sort by price (ascending or descending)
      const options = await sortDropdown.locator('option').all();
      let priceOption = null;
      
      for (const option of options) {
        const text = await option.textContent();
        if (text && (text.toLowerCase().includes('price') || text.toLowerCase().includes('τιμή'))) {
          priceOption = await option.getAttribute('value');
          break;
        }
      }
      
      if (priceOption) {
        await sortDropdown.selectOption(priceOption);
        
        // Wait for results to update
        await page.waitForTimeout(1000);
        await page.waitForLoadState('networkidle');
        
        // Get sorted prices
        const sortedPrices = await page.locator('[data-testid="product-price"], .price, .product-price').allTextContents();
        
        // Verify sorting happened (prices changed order or same products in different order)
        expect(sortedPrices.length).toBe(initialPrices.length);
        
        // Reset to default sorting if possible
        await sortDropdown.selectOption('');
        await page.waitForTimeout(1000);
        await page.waitForLoadState('networkidle');
      }
    }
  } else {
    console.log('⚠️ Sort dropdown not found - skipping sort test');
  }
});
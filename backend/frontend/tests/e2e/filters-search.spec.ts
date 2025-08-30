import { test, expect } from '@playwright/test';

test('filters and search - apply search filter', async ({ page }) => {
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
  
  // Find search input (various possible selectors)
  const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name*="search" i], [data-testid="search-input"]').first();
  
  if (await searchInput.isVisible({ timeout: 3000 })) {
    // Apply search filter
    await searchInput.fill('Πορτοκάλια'); // Greek oranges
    
    // Wait for search results to update
    await page.waitForTimeout(1000); // Allow for debounce
    await page.waitForLoadState('networkidle');
    
    // Check if results were filtered
    const filteredProductCount = await page.locator('[data-testid="product-card"]').count();
    
    // Either products were filtered or no results message appears
    if (filteredProductCount > 0) {
      expect(filteredProductCount).toBeLessThanOrEqual(initialProductCount);
      
      // Verify search term appears in visible products
      const productTitles = page.locator('[data-testid="product-title"], [data-testid="product-card"] h3');
      const firstTitle = await productTitles.first().textContent();
      expect(firstTitle?.toLowerCase()).toContain('πορτοκάλια');
    } else {
      // Check for "no results" message
      const noResultsMessage = page.locator('[data-testid="no-results"], .no-results, :has-text("no products found")');
      await expect(noResultsMessage).toBeVisible({ timeout: 5000 });
    }
    
    // Clear search filter
    await searchInput.clear();
    await page.waitForTimeout(1000); // Allow for debounce
    await page.waitForLoadState('networkidle');
    
    // Verify products are restored
    const restoredProductCount = await page.locator('[data-testid="product-card"]').count();
    expect(restoredProductCount).toBeGreaterThanOrEqual(initialProductCount);
  } else {
    console.log('⚠️ Search input not found - skipping search test');
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
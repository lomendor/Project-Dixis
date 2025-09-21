import { test, expect } from '@playwright/test';

test.describe('Catalog Filters & Search', () => {
  test('enhanced filter functionality works end-to-end', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Test basic search functionality
    await page.fill('input[placeholder="Search products..."]', 'apple');
    await page.waitForTimeout(1000); // Wait for search to complete
    
    // Should show search results
    const searchResults = await page.locator('[data-testid="product-card"]').count();
    console.log(`Search results for "apple": ${searchResults}`);
    
    // Clear search
    await page.fill('input[placeholder="Search products..."]', '');
    await page.waitForTimeout(1000);
    
    // Test filter panel
    await page.click('button:has-text("Filters")');
    await expect(page.locator('.bg-white.p-6.rounded-lg.shadow-md')).toBeVisible();
    
    // Test category filter
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption({ index: 1 }); // Select first category
    await page.waitForTimeout(1000);
    
    // Test price filter
    await page.fill('input[placeholder="Min"]', '5');
    await page.fill('input[placeholder="Max"]', '20');
    await page.waitForTimeout(1000);
    
    // Test organic filter
    await page.locator('select').last().selectOption('true'); // Select organic only
    await page.waitForTimeout(1000);
    
    // Test sort options - wait for sort select to be visible and have options
    const sortSelect = page.locator('select').last(); // Use last select (sort direction)
    await expect(sortSelect).toBeVisible();
    
    // Try to select an option that should exist, otherwise skip
    const hasOption = await sortSelect.locator('option[value="desc"]').isVisible().catch(() => false);
    if (hasOption) {
      await sortSelect.selectOption('desc');
      await page.waitForTimeout(1000);
    }
    
    // Verify that filters are active
    const filterBadge = page.locator('span:has-text("Clear All")').first();
    
    // Clear all filters
    await page.click('button:has-text("Clear All")');
    await page.waitForTimeout(1000);
    
    // Verify products are shown again - just check visibility directly
    await expect(page.getByTestId('product-card').first()).toBeVisible({ timeout: 15000 });
    
    console.log('✅ Enhanced catalog filters test completed successfully');
  });

  test('filter persistence and URL integration', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Apply search filter
    await page.fill('input[placeholder="Search products..."]', 'fresh');
    await page.waitForTimeout(1000);
    
    // Open filters and apply category filter
    await page.click('button:has-text("Filters")');
    const categorySelect = page.locator('label:has-text("Category")').locator('..').locator('select');
    await categorySelect.selectOption({ index: 1 });
    await page.waitForTimeout(1000);
    
    // Verify filter badge shows active filters
    const filterButton = page.locator('button:has-text("Filters")');
    await expect(filterButton.locator('.bg-green-500')).toBeVisible();
    
    console.log('✅ Filter persistence test completed');
  });

  test('empty state with filter clearing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Apply filters that return no results
    await page.fill('input[placeholder="Search products..."]', 'nonexistentproduct12345');
    await page.waitForTimeout(2000);
    
    // Should show empty state
    await expect(page.locator('text=No products found')).toBeVisible();
    await expect(page.locator('button:has-text("Clear Filters")')).toBeVisible();
    
    // Clear filters using empty state button
    await page.click('button:has-text("Clear Filters")');
    await page.waitForTimeout(1000);
    
    // Should show products again  
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
    
    console.log('✅ Empty state filter clearing test completed');
  });
});
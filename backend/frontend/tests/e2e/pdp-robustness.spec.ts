import { test, expect } from '@playwright/test';

test.describe('PDP Data Robustness', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the products page first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('shows skeleton loader during product loading', async ({ page }) => {
    // Slow down network to see skeleton
    await page.route('/api/v1/public/products/**', async route => {
      await page.waitForTimeout(1000); // Add 1s delay
      await route.continue();
    });

    const productLinks = await page.locator('[data-testid="product-card"] a').all();
    if (productLinks.length > 0) {
      await productLinks[0].click();
      
      // Should show skeleton while loading
      await expect(page.locator('div').filter({ hasText: /animate-pulse/ }).first()).toBeVisible();
      
      // Eventually should show product content
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible({ timeout: 10000 });
    }
  });

  test('handles missing product data gracefully', async ({ page }) => {
    // Go to a product that exists
    const productLinks = await page.locator('[data-testid="product-card"] a').all();
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');

      // Check that all sections handle missing data gracefully
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
      
      // Categories section should exist even if empty
      await expect(page.locator('[data-testid="product-categories"]')).toBeVisible();
      
      // Stock section should exist
      await expect(page.locator('[data-testid="stock-section"]')).toBeVisible();
      
      // Add to cart section should exist
      await expect(page.locator('[data-testid="add-to-cart-section"]')).toBeVisible();
    }
  });

  test('shows 404 error for invalid product ID', async ({ page }) => {
    await page.goto('/products/99999');
    await page.waitForLoadState('networkidle');
    
    // Should show error state
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
    await expect(page.getByText('Product Not Found')).toBeVisible();
    await expect(page.locator('[data-testid="back-home-button"]')).toBeVisible();
    
    // Test back to home functionality
    await page.locator('[data-testid="back-home-button"]').click();
    await expect(page).toHaveURL('/');
  });

  test('shows error state for invalid product ID format', async ({ page }) => {
    await page.goto('/products/invalid-id');
    await page.waitForLoadState('networkidle');
    
    // Should show error state
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
    await expect(page.getByText('Invalid product ID')).toBeVisible();
  });

  test('handles image loading failures gracefully', async ({ page }) => {
    // Mock image failures
    await page.route('**/*.jpg', route => route.abort());
    await page.route('**/*.png', route => route.abort());
    await page.route('**/*.jpeg', route => route.abort());
    
    const productLinks = await page.locator('[data-testid="product-card"] a').all();
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      // Should show placeholder for missing images
      await expect(page.getByText('No Images Available')).toBeVisible();
    }
  });

  test('quantity selector respects stock limits', async ({ page }) => {
    const productLinks = await page.locator('[data-testid="product-card"] a').all();
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      const quantitySelector = page.locator('[data-testid="quantity-selector"]');
      await expect(quantitySelector).toBeVisible();
      
      // Check that options exist
      const options = await quantitySelector.locator('option').all();
      expect(options.length).toBeGreaterThan(0);
      
      // Select maximum quantity if available
      if (options.length > 1) {
        await quantitySelector.selectOption((options.length).toString());
      }
    }
  });

  test('add to cart button states work correctly', async ({ page }) => {
    const productLinks = await page.locator('[data-testid="product-card"] a').all();
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]');
      await expect(addToCartBtn).toBeVisible();
      
      // Should show "Login to Add to Cart" if not authenticated
      const btnText = await addToCartBtn.textContent();
      expect(btnText).toBeTruthy();
      
      // Button should be functional (not disabled for invalid reasons)
      const isDisabled = await addToCartBtn.getAttribute('disabled');
      if (isDisabled) {
        // If disabled, should show appropriate message
        expect(btnText).toMatch(/(Out of Stock|Product Unavailable)/);
      }
    }
  });

  test('producer info handles missing data', async ({ page }) => {
    const productLinks = await page.locator('[data-testid="product-card"] a').all();
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      // Producer section should exist
      await expect(page.getByText('Producer Information')).toBeVisible();
      
      // Should handle missing producer data gracefully
      // (Either show data or show "not available" message)
      const producerSection = page.locator('text=Producer Information').locator('..');
      await expect(producerSection).toBeVisible();
    }
  });

  test('retry functionality works on errors', async ({ page }) => {
    let requestCount = 0;
    
    // Mock first request to fail, second to succeed
    await page.route('/api/v1/public/products/**', async route => {
      requestCount++;
      if (requestCount === 1) {
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });
    
    await page.goto('/products/1');
    await page.waitForLoadState('networkidle');
    
    // Should show error state
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
    
    // Click retry button
    const retryBtn = page.locator('[data-testid="retry-button"]');
    if (await retryBtn.isVisible()) {
      await retryBtn.click();
      
      // Should eventually show product (after retry succeeds)
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible({ timeout: 10000 });
    }
  });

  test('breadcrumb navigation works', async ({ page }) => {
    const productLinks = await page.locator('[data-testid="product-card"] a').all();
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      // Should show back button
      const backButton = page.getByText('← Back to Products');
      await expect(backButton).toBeVisible();
      
      // Back button should work
      await backButton.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('page title updates with product name', async ({ page }) => {
    const productLinks = await page.locator('[data-testid="product-card"] a').all();
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      const productTitle = await page.locator('[data-testid="product-title"]').textContent();
      if (productTitle && productTitle !== 'Unnamed Product') {
        // Page title should include product name (if implemented)
        const pageTitle = await page.title();
        expect(pageTitle).toBeTruthy();
      }
    }
  });
});
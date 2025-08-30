import { test, expect } from '@playwright/test';

test.describe('PDP Robustness - Core Functionality', () => {
  const PRODUCT_ID = '1';

  test('should load product page successfully with enhanced components', async ({ page }) => {
    await page.goto(`/products/${PRODUCT_ID}`);

    // Wait for page to load - either skeleton or content
    await page.waitForSelector('main', { timeout: 10000 });
    
    // Should eventually show product content
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    
    // Check that Euro symbol is properly displayed
    await expect(page.locator('text=/€/')).toBeVisible();
    
    // Check navigation elements are present
    await expect(page.locator('a[href="/"]')).toBeVisible();
    
    // Check that add to cart button exists
    await expect(page.getByTestId('add-to-cart-button')).toBeVisible();
    
    // Take a screenshot for documentation
    await page.screenshot({ path: 'test-results/pdp-working-state.png', fullPage: true });
  });

  test('should handle 404 errors gracefully', async ({ page }) => {
    await page.goto('/products/99999');
    
    // Should show error fallback
    await expect(page.getByTestId('error-fallback')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Προϊόν Δε Βρέθηκε')).toBeVisible();
    
    // Take screenshot of error state
    await page.screenshot({ path: 'test-results/pdp-404-error.png', fullPage: true });
  });

  test('should display proper image fallbacks', async ({ page }) => {
    // Mock API to return product with invalid images
    await page.route(`**/api/v1/public/products/${PRODUCT_ID}`, async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      
      // Replace images with invalid URLs
      json.images = [{
        id: 1,
        url: 'https://invalid.com/image.jpg',
        is_primary: true
      }];
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(json)
      });
    });

    await page.goto(`/products/${PRODUCT_ID}`);
    
    // Wait for product to load
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    
    // Should show image fallback
    await expect(page.getByTestId('image-fallback')).toBeVisible();
    
    // Take screenshot of image fallback
    await page.screenshot({ path: 'test-results/pdp-image-fallback.png', fullPage: true });
  });
});
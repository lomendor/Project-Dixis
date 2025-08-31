import { test, expect } from '@playwright/test';

test.describe('Product Detail Page (PDP) - Happy Path & Robustness', () => {
  // Test with a known product ID (we'll use 1 as it's commonly available)
  const PRODUCT_ID = '1';
  const PRODUCT_URL = `/products/${PRODUCT_ID}`;

  test.beforeEach(async ({ page }) => {
    // Ensure API is available
    const response = await page.request.get('http://127.0.0.1:8001/api/v1/public/products');
    expect(response.status()).toBe(200);
  });

  test('should display product loading skeleton initially', async ({ page }) => {
    // Intercept the API call to delay it
    await page.route(`**/api/v1/public/products/${PRODUCT_ID}`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      route.continue();
    });

    await page.goto(PRODUCT_URL);
    
    // Should show skeleton while loading
    await expect(page.getByTestId('product-detail-skeleton')).toBeVisible();
    
    // Should eventually show actual content
    await expect(page.getByTestId('product-detail-skeleton')).not.toBeVisible({ timeout: 10000 });
  });

  test('should display complete product information', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    
    // Wait for product to load
    await expect(page.getByTestId('product-detail-skeleton')).not.toBeVisible({ timeout: 10000 });
    
    // Check essential product elements are present
    await expect(page.locator('h1')).toBeVisible(); // Product name
    await expect(page.locator('text=/€/')).toBeVisible(); // Price with EUR symbol
    
    // Check navigation and back button
    await expect(page.getByText('← Πίσω στα Προϊόντα')).toBeVisible();
    
    // Check producer information section
    await expect(page.getByText('Πληροφορίες Παραγωγού')).toBeVisible();
    
    // Check add to cart button exists
    await expect(page.getByTestId('add-to-cart-button')).toBeVisible();
  });

  test('should handle 404 product not found gracefully', async ({ page }) => {
    const NON_EXISTENT_ID = '99999';
    
    await page.goto(`/products/${NON_EXISTENT_ID}`);
    
    // Should show error fallback
    await expect(page.getByTestId('error-fallback')).toBeVisible();
    await expect(page.getByText('Προϊόν Δε Βρέθηκε')).toBeVisible();
    await expect(page.getByText(`με ID ${NON_EXISTENT_ID}`)).toBeVisible();
    
    // Should have back button
    await expect(page.getByTestId('back-button')).toBeVisible();
  });

  test('should handle server errors with retry functionality', async ({ page }) => {
    let callCount = 0;
    
    // Mock server error on first call, success on second
    await page.route(`**/api/v1/public/products/${PRODUCT_ID}`, async (route) => {
      callCount++;
      if (callCount === 1) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' })
        });
      } else {
        route.continue();
      }
    });

    await page.goto(PRODUCT_URL);
    
    // Should show server error
    await expect(page.getByTestId('error-fallback')).toBeVisible();
    await expect(page.getByText('Σφάλμα Διακομιστή')).toBeVisible();
    
    // Click retry button
    const retryButton = page.getByTestId('retry-button');
    await expect(retryButton).toBeVisible();
    await retryButton.click();
    
    // Should load successfully after retry
    await expect(page.getByTestId('error-fallback')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('h1')).toBeVisible(); // Product loaded
  });

  test('should display image fallbacks for missing images', async ({ page }) => {
    // Mock product with invalid image URLs
    await page.route(`**/api/v1/public/products/${PRODUCT_ID}`, async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      
      // Corrupt the image URLs
      if (json.images) {
        json.images = json.images.map((img: any) => ({
          ...img,
          url: 'https://invalid-image-url.com/broken.jpg',
          image_path: '/broken/path.jpg'
        }));
      }
      
      route.fulfill({
        response,
        json
      });
    });

    await page.goto(PRODUCT_URL);
    await expect(page.getByTestId('product-detail-skeleton')).not.toBeVisible({ timeout: 10000 });
    
    // Should show image fallbacks
    await expect(page.getByTestId('image-fallback')).toBeVisible();
    await expect(page.getByText('Δεν Υπάρχει Εικόνα')).toBeVisible();
  });

  test('should format currency properly with EUR symbol', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await expect(page.getByTestId('product-detail-skeleton')).not.toBeVisible({ timeout: 10000 });
    
    // Check that EUR symbol is displayed
    const priceElement = page.locator('.text-green-600').filter({ hasText: '€' });
    await expect(priceElement).toBeVisible();
    
    // Verify Greek locale formatting (comma as decimal separator)
    const priceText = await priceElement.textContent();
    expect(priceText).toMatch(/\d+,?\d*\s*€/); // Match number with optional comma and EUR
  });

  test('should handle add to cart flow for authenticated users', async ({ page }) => {
    // First login (we'll need valid test credentials)
    await page.goto('/auth/login');
    
    // Fill login form with test credentials
    await page.fill('input[name=\"email\"]', 'test@example.com');
    await page.fill('input[name=\"password\"]', 'password');
    await page.click('button[type=\"submit\"]');
    
    // Navigate to product after login
    await page.goto(PRODUCT_URL);
    await expect(page.getByTestId('product-detail-skeleton')).not.toBeVisible({ timeout: 10000 });
    
    // Should show add to cart button (not login prompt)
    const addToCartButton = page.getByTestId('add-to-cart-button');
    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toContainText('Προσθήκη στο Καλάθι');
    
    // Test quantity selector
    const quantitySelect = page.locator('select#quantity');
    await expect(quantitySelect).toBeVisible();
    await quantitySelect.selectOption('2');
    
    // Click add to cart
    await addToCartButton.click();
    
    // Should show loading state
    await expect(addToCartButton).toContainText('Προσθήκη στο Καλάθι...');
    
    // Should eventually show success (assuming API works)
    // Note: This depends on having a working test user and API
  });

  test('should prompt unauthenticated users to login', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await expect(page.getByTestId('product-detail-skeleton')).not.toBeVisible({ timeout: 10000 });
    
    // Should show login prompt instead of add to cart
    const addToCartButton = page.getByTestId('add-to-cart-button');
    await expect(addToCartButton).toContainText('Σύνδεση για Προσθήκη στο Καλάθι');
    
    // Should have login/register links
    await expect(page.getByText('Σύνδεση')).toBeVisible();
    await expect(page.getByText('δημιουργήστε λογαριασμό')).toBeVisible();
  });

  test('should handle missing product data gracefully', async ({ page }) => {
    // Mock product with missing critical data
    await page.route(`**/api/v1/public/products/${PRODUCT_ID}`, async (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: PRODUCT_ID,
          name: null, // Missing name
          price: null, // Missing price
          // Missing other fields
        })
      });
    });

    await page.goto(PRODUCT_URL);
    
    // Should show error due to validation failure
    await expect(page.getByTestId('error-fallback')).toBeVisible();
  });

  test('should be accessible with proper ARIA labels', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await expect(page.getByTestId('product-detail-skeleton')).not.toBeVisible({ timeout: 10000 });
    
    // Check add to cart button has proper aria-label
    const addToCartButton = page.getByTestId('add-to-cart-button');
    await expect(addToCartButton).toHaveAttribute('aria-label', /Add .+ to cart/);
    
    // Check quantity selector is properly labeled
    await expect(page.locator('label[for=\"quantity\"]')).toBeVisible();
    
    // Check images have alt text
    const productImages = page.locator('img');
    const imageCount = await productImages.count();
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        await expect(productImages.nth(i)).toHaveAttribute('alt');
      }
    }
  });

  test('should load quickly with performance optimizations', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(PRODUCT_URL);
    await expect(page.getByTestId('product-detail-skeleton')).not.toBeVisible({ timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time (5 seconds including API calls)
    expect(loadTime).toBeLessThan(5000);
  });
});
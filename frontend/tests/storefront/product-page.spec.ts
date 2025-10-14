import { test, expect } from '@playwright/test';

test.describe('Product Detail Page - Storefront polish', () => {
  test('Product page renders with all info and Greek labels', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // First, navigate to products page to get a product ID
    await page.goto('/products');

    const grid = page.locator('[data-testid="products-grid"]');
    await expect(grid).toBeVisible({ timeout: 10000 });

    const cards = page.locator('[data-testid="product-card"]');
    const cardCount = await cards.count();

    if (cardCount > 0) {
      // Click on first product
      await cards.first().click();

      // Wait for navigation to product page
      await page.waitForURL(/\/products\/.+/);

      // Verify product title
      const title = page.locator('[data-testid="product-title"]');
      await expect(title).toBeVisible({ timeout: 5000 });

      // Verify price is displayed
      const price = page.locator('[data-testid="product-price"]');
      await expect(price).toBeVisible();
      const priceText = await price.textContent();
      expect(priceText).toMatch(/€/); // EUR symbol

      // Verify stock status
      const stock = page.locator('[data-testid="product-stock"]');
      await expect(stock).toBeVisible();

      // Check for Greek labels
      await expect(page.getByText('Τιμή')).toBeVisible();
      await expect(page.getByText('Απόθεμα')).toBeVisible();

      // Verify breadcrumb navigation
      await expect(page.getByText('Αρχική')).toBeVisible();
      await expect(page.getByText('Προϊόντα')).toBeVisible();

      // Verify back to products link
      const backLink = page.getByText('Επιστροφή στα προϊόντα');
      await expect(backLink).toBeVisible();

      // Assert no console errors
      expect(consoleErrors, `Expected no console errors, but found: ${consoleErrors.join('\n')}`).toHaveLength(0);
    } else {
      // Skip test if no products available
      test.skip();
    }
  });

  test('Product page breadcrumb navigation works', async ({ page }) => {
    // Navigate to products
    await page.goto('/products');

    const grid = page.locator('[data-testid="products-grid"]');
    await expect(grid).toBeVisible({ timeout: 10000 });

    const cards = page.locator('[data-testid="product-card"]');
    const cardCount = await cards.count();

    if (cardCount > 0) {
      // Click on first product
      await cards.first().click();
      await page.waitForURL(/\/products\/.+/);

      // Click back to products link
      const backLink = page.getByText('Επιστροφή στα προϊόντα');
      await backLink.click();

      // Should be back on products page
      await expect(page.locator('[data-testid="products-grid"]')).toBeVisible();
      expect(page.url()).toContain('/products');
    } else {
      test.skip();
    }
  });
});

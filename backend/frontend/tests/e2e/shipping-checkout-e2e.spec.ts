import { test, expect } from '@playwright/test';

test.describe('Shipping Integration E2E', () => {
  // Auth edge-case fixes: Clear cookies before each test
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
  });

  test('complete shipping checkout flow', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'consumer@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to home page
    await expect(page).toHaveURL('/');

    // Navigate to products and add to cart
    await page.click('text=Products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();

    // Add to cart from product page
    await page.waitForSelector('[data-testid="add-to-cart-btn"]');
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Navigate to cart
    await page.goto('/cart');
    await page.waitForSelector('[data-testid="cart-item"]');

    // Verify cart has items
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems).toHaveCount(1);

    // Fill shipping information
    await page.fill('[data-testid="postal-code-input"]', '11527');
    await page.fill('[data-testid="city-input"]', 'Athens');

    // Wait for shipping calculation
    await page.waitForTimeout(1000); // Allow debounced API call
    
    // Verify shipping info appears
    await expect(page.locator('text=Athens Express')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=1 day(s)')).toBeVisible();

    // Verify checkout button is enabled and has correct text
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    await expect(checkoutBtn).toBeEnabled();
    await expect(checkoutBtn).toHaveText('Proceed to Checkout');

    // Complete checkout
    await checkoutBtn.click();

    // Wait for order creation and redirect
    await page.waitForURL(/\/orders\/\d+/, { timeout: 15000 });
    
    // Verify we're on order confirmation page
    expect(page.url()).toMatch(/\/orders\/\d+$/);

    // Verify order details include shipping information
    await expect(page.locator('text=Athens Express')).toBeVisible();
    await expect(page.locator('text=1 day(s)')).toBeVisible();
    await expect(page.locator('text=Athens, 11527')).toBeVisible();

    // Verify order success message
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
  });

  test('shipping validation prevents checkout without postal code', async ({ page }) => {
    // Login and add item to cart (reuse login logic)
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'consumer@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // Add a product to cart quickly
    await page.goto('/');
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.goto('/cart');

    // Try checkout without postal code
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    await expect(checkoutBtn).toBeDisabled();
    await expect(checkoutBtn).toHaveText('Enter shipping info to continue');

    // Fill only city (partial info)
    await page.fill('[data-testid="city-input"]', 'Athens');
    await expect(checkoutBtn).toBeDisabled();

    // Fill invalid postal code (too short)
    await page.fill('[data-testid="postal-code-input"]', '123');
    await expect(checkoutBtn).toBeDisabled();
    await expect(checkoutBtn).toHaveText('Enter valid ΤΚ and city');
  });

  test('shipping cost calculation for different zones', async ({ page }) => {
    // Login and add item to cart
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'consumer@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    
    await page.goto('/');
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.goto('/cart');

    // Test Athens Metro (should show Athens Express)
    await page.fill('[data-testid="postal-code-input"]', '11527');
    await page.fill('[data-testid="city-input"]', 'Athens');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Athens Express')).toBeVisible();

    // Test Islands (should show Island Logistics)
    await page.fill('[data-testid="postal-code-input"]', '84600');
    await page.fill('[data-testid="city-input"]', 'Mykonos');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Island Logistics')).toBeVisible();
    await expect(page.locator('text=4 day(s)')).toBeVisible();

    // Test Thessaloniki (should show Northern Courier)
    await page.fill('[data-testid="postal-code-input"]', '54623');
    await page.fill('[data-testid="city-input"]', 'Thessaloniki');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Northern Courier')).toBeVisible();
    await expect(page.locator('text=2 day(s)')).toBeVisible();
  });

  test('auth edge case: retry after session timeout', async ({ page, context }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'consumer@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // Simulate session timeout by clearing cookies
    await context.clearCookies();
    
    // Try to access cart - should redirect to login
    await page.goto('/cart');
    await expect(page).toHaveURL('/auth/login');

    // Login again
    await page.fill('input[type="email"]', 'consumer@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Should be able to access cart now
    await expect(page).toHaveURL('/');
    await page.goto('/cart');
    await expect(page.locator('[data-testid="checkout-btn"]')).toBeVisible();
  });
});
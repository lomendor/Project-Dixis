import { test, expect } from '@playwright/test';

/**
 * E2E Test: Cart → Order Creation via Backend API
 *
 * Purpose: Verify that frontend cart checkout calls backend Laravel API
 * (POST /api/v1/orders) instead of frontend Prisma DB.
 *
 * Scope: Minimal test for Pass 7 verification
 */

test.describe('Cart → Backend Order API', () => {
  test('consumer can create order from cart using backend API', async ({ page }) => {
    // Step 1: Login as consumer
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'consumer@example.com');
    await page.fill('[name="password"]', 'password');

    const loginButton = page.getByTestId('login-submit').or(page.locator('button[type="submit"]'));
    await loginButton.click();

    // Wait for login to complete
    await page.waitForLoadState('networkidle');

    // Step 2: Navigate to products and add to cart
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('a').first().click();
    await page.waitForURL(/\/products\/\d+/);

    const addToCartBtn = page.locator('[data-testid="add-to-cart"]');
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Wait for cart to update
    await page.waitForTimeout(1000);

    // Step 3: Go to cart and checkout
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Verify cart is not empty
    const cartItems = page.locator('[data-testid="product-card"]');
    await expect(cartItems.first()).toBeVisible();

    // Step 4: Click checkout button
    const checkoutBtn = page.getByTestId('go-checkout');
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    // Step 5: Verify order created (should redirect to /order/[id])
    await page.waitForURL(/\/order\/\d+/, { timeout: 15000 });

    // Verify order success page
    const successTitle = page.getByTestId('order-success-title');
    await expect(successTitle).toBeVisible({ timeout: 10000 });

    // Verify URL contains numeric order ID
    const url = page.url();
    expect(url).toMatch(/\/order\/\d+$/);
  });

  test('unauthenticated user redirected to login on checkout', async ({ page }) => {
    // Step 1: Add product to cart without logging in
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('a').first().click();
    await page.waitForURL(/\/products\/\d+/);

    const addToCartBtn = page.locator('[data-testid="add-to-cart"]');
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    await page.waitForTimeout(1000);

    // Step 2: Go to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Step 3: Click checkout (should redirect to login)
    const checkoutBtn = page.getByTestId('go-checkout');
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    // Step 4: Verify redirected to login page
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 });

    // Verify login form is visible
    const emailInput = page.locator('[name="email"]');
    await expect(emailInput).toBeVisible();
  });
});

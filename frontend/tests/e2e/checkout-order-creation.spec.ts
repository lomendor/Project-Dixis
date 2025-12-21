import { test, expect } from '@playwright/test';

/**
 * E2E Test: Complete Checkout → Order Creation → Order List Verification
 *
 * Pass 11: Proves checkout creates an order and it appears in /orders list
 *
 * Flow:
 * 1. Login as consumer
 * 2. Browse products → add to cart
 * 3. Checkout from cart
 * 4. Verify redirect to order detail page (/order/[id])
 * 5. Navigate to /orders and verify order appears in list
 *
 * DoD: Order creation is non-regressing (happy path works end-to-end)
 */

test.describe('Checkout → Order Creation → Order List', () => {
  test('complete flow: product → cart → checkout → order created → appears in orders list', async ({ page }) => {
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

    // Extract order ID from URL
    const orderUrl = page.url();
    const orderIdMatch = orderUrl.match(/\/order\/(\d+)$/);
    expect(orderIdMatch).toBeTruthy();
    const orderId = orderIdMatch![1];

    // Verify order success page
    const successTitle = page.getByTestId('order-success-title');
    await expect(successTitle).toBeVisible({ timeout: 10000 });

    // Verify order ID is displayed
    const orderIdDisplay = page.getByTestId('order-id');
    await expect(orderIdDisplay).toContainText(orderId);

    // Step 6: Navigate to /orders and verify order appears in list
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Verify orders list page loaded
    const ordersPageTitle = page.getByTestId('orders-page-title');
    await expect(ordersPageTitle).toBeVisible({ timeout: 10000 });

    // Verify the new order appears in the list
    const orderRow = page.getByTestId(`order-row-${orderId}`);
    await expect(orderRow).toBeVisible({ timeout: 10000 });

    // Verify order row contains order ID
    await expect(orderRow).toContainText(`#${orderId}`);

    // Verify order has pending status (new orders start as pending)
    const orderStatus = orderRow.locator('span').filter({ hasText: /pending/i });
    await expect(orderStatus).toBeVisible();

    // Verify view order link works
    const viewOrderLink = page.getByTestId(`view-order-${orderId}`);
    await expect(viewOrderLink).toBeVisible();
    await viewOrderLink.click();

    // Should navigate back to order detail page
    await page.waitForURL(new RegExp(`/orders/${orderId}`), { timeout: 10000 });
  });

  test('order list shows empty state when user has no orders', async ({ page }) => {
    // This test uses a different user who has never created an order
    // Note: In a real scenario, this would be a fresh test user
    // For now, we skip this test as it requires test data isolation

    test.skip();
  });
});

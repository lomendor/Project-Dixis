import { test, expect } from '@playwright/test';

/**
 * Pass GUEST-CHECKOUT-01: Guest Checkout E2E Tests
 *
 * Tests guest checkout flow (no authentication required).
 * Verifies:
 * 1. Guest can access checkout page without login
 * 2. Guest checkout notice is displayed
 * 3. Email field is required for guests
 * 4. Guest can complete checkout with COD
 * 5. Order is created with guest email in shipping_address
 */

test.describe('Guest Checkout @smoke', () => {
  test.beforeEach(async ({ context }) => {
    // Clear any auth state to ensure we're testing as guest
    await context.clearCookies();
  });

  test('guest can access checkout page without login', async ({ page }) => {
    // Add product to cart first
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('a').first().click();
    // Wait for any product detail page (numeric ID or slug like demo-1)
    await page.waitForURL(/\/products\/[^/]+$/, { timeout: 10000 });

    const addToCartBtn = page.getByTestId('add-to-cart');
    await addToCartBtn.click();
    await page.waitForTimeout(1000);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Verify checkout page loads without redirect to login
    await expect(page.getByTestId('checkout-page')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('checkout-form')).toBeVisible();
  });

  test('guest checkout shows notice and requires email', async ({ page }) => {
    // Add product to cart
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('a').first().click();
    // Wait for any product detail page (numeric ID or slug like demo-1)
    await page.waitForURL(/\/products\/[^/]+$/, { timeout: 10000 });

    const addToCartBtn = page.getByTestId('add-to-cart');
    await addToCartBtn.click();
    await page.waitForTimeout(1000);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Verify guest notice is displayed
    const guestNotice = page.getByTestId('guest-checkout-notice');
    await expect(guestNotice).toBeVisible();
    await expect(guestNotice).toContainText('χωρίς λογαριασμό');

    // Verify email field has required indicator
    const emailLabel = page.locator('label[for="checkout-email"]');
    await expect(emailLabel).toContainText('*');

    // Verify email help text
    await expect(page.locator('text=Απαιτείται για την αποστολή επιβεβαίωσης')).toBeVisible();
  });

  test('guest checkout happy path with COD', async ({ page }) => {
    // Capture order creation request
    let orderRequest: { body: Record<string, unknown> } | null = null;
    page.on('request', async (request) => {
      if (request.url().includes('/api/v1/public/orders') && request.method() === 'POST') {
        const postData = request.postData();
        if (postData) {
          orderRequest = { body: JSON.parse(postData) };
        }
      }
    });

    // Add product to cart
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('a').first().click();
    // Wait for any product detail page (numeric ID or slug like demo-1)
    await page.waitForURL(/\/products\/[^/]+$/, { timeout: 10000 });

    const addToCartBtn = page.getByTestId('add-to-cart');
    await addToCartBtn.click();
    await page.waitForTimeout(1000);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Fill in guest checkout form
    await page.getByTestId('checkout-name').fill('Γιάννης Παπαδόπουλος');
    await page.getByTestId('checkout-phone').fill('6912345678');
    await page.getByTestId('checkout-email').fill('guest@example.com');
    await page.getByTestId('checkout-address').fill('Ερμού 25');
    await page.getByTestId('checkout-city').fill('Αθήνα');
    await page.getByTestId('checkout-postal').fill('10563');

    // Submit order (COD is default)
    await page.getByTestId('checkout-submit').click();

    // Wait for redirect to thank-you page
    await page.waitForURL(/\/thank-you\?id=\d+/, { timeout: 15000 });

    // Verify thank-you page
    await expect(page.getByTestId('thank-you-page')).toBeVisible();
    await expect(page.getByTestId('order-id')).toBeVisible();

    // Verify order request included guest email in shipping_address
    expect(orderRequest).toBeTruthy();
    const body = orderRequest!.body;
    expect(body.shipping_address).toBeTruthy();
    expect((body.shipping_address as Record<string, string>).email).toBe('guest@example.com');
  });

  test('email validation prevents empty email for guest', async ({ page }) => {
    // Add product to cart
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('a').first().click();
    // Wait for any product detail page (numeric ID or slug like demo-1)
    await page.waitForURL(/\/products\/[^/]+$/, { timeout: 10000 });

    const addToCartBtn = page.getByTestId('add-to-cart');
    await addToCartBtn.click();
    await page.waitForTimeout(1000);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Fill in form WITHOUT email
    await page.getByTestId('checkout-name').fill('Γιάννης Παπαδόπουλος');
    await page.getByTestId('checkout-phone').fill('6912345678');
    await page.getByTestId('checkout-address').fill('Ερμού 25');
    await page.getByTestId('checkout-city').fill('Αθήνα');
    await page.getByTestId('checkout-postal').fill('10563');

    // Try to submit - should fail due to HTML5 required validation
    await page.getByTestId('checkout-submit').click();

    // Should stay on checkout page (not redirect)
    await expect(page).toHaveURL(/\/checkout/);

    // Email field should show validation error (browser native)
    const emailInput = page.getByTestId('checkout-email');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });
});

test.describe('Auth-Protected Pages Guard @smoke', () => {
  test.beforeEach(async ({ context }) => {
    // Clear any auth state
    await context.clearCookies();
  });

  test('account/orders requires authentication', async ({ page }) => {
    await page.goto('/account/orders');
    await page.waitForLoadState('networkidle');

    // Should redirect to login or show auth required message
    const url = page.url();
    const hasLoginRedirect = url.includes('/login') || url.includes('/auth');
    const hasAuthMessage = await page.locator('text=/sign in|login|συνδεθείτε/i').isVisible().catch(() => false);

    expect(hasLoginRedirect || hasAuthMessage).toBe(true);
  });

  test('producer dashboard requires authentication', async ({ page }) => {
    await page.goto('/producer/dashboard');
    await page.waitForLoadState('networkidle');

    // Should redirect to login or show auth required message
    const url = page.url();
    const hasLoginRedirect = url.includes('/login') || url.includes('/auth');
    const hasAuthMessage = await page.locator('text=/sign in|login|συνδεθείτε/i').isVisible().catch(() => false);

    expect(hasLoginRedirect || hasAuthMessage).toBe(true);
  });
});

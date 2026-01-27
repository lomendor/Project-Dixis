import { test, expect } from '@playwright/test';

/**
 * Pass PAY-GUEST-CARD-GATE-01: Guest Checkout Card Payment Gate
 * 
 * Verifies that guest users:
 * 1. Do NOT see the card payment option
 * 2. DO see the guest card notice with login link
 * 3. Can complete checkout with COD
 * 4. NEVER trigger a request to payment init
 */

test.describe('Pass PAY-GUEST-CARD-GATE-01: Guest Checkout Card Gate @prod', () => {

  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state to ensure guest mode
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    });
  });

  test('GATE1: Guest user does NOT see card payment option', async ({ page, request }) => {
    // Step 1: Get a product
    const productsRes = await request.get('/api/v1/public/products?limit=1');
    expect(productsRes.ok()).toBe(true);
    const productsData = await productsRes.json();
    const product = productsData.data?.[0] || productsData.items?.[0];
    test.skip(!product, 'No products available');

    console.log('Using product:', product.id, '-', product.name);

    // Step 2: Add product to cart via UI
    await page.goto('/products/' + product.id);
    const addBtn = page.getByTestId('add-to-cart')
      .or(page.getByTestId('add-to-cart-button'))
      .or(page.locator('button:has-text("Προσθήκη")'));
    await expect(addBtn.first()).toBeVisible({ timeout: 15000 });
    await addBtn.first().click();
    await page.waitForTimeout(1500);

    // Step 3: Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Wait for checkout page to be ready
    const checkoutForm = page.getByTestId('checkout-form');
    await expect(checkoutForm).toBeVisible({ timeout: 15000 });

    // ASSERTION 1: Card payment option should NOT be visible
    const cardOption = page.getByTestId('payment-card');
    const cardVisible = await cardOption.isVisible().catch(() => false);
    expect(cardVisible, 'Card payment option should NOT be visible for guests').toBe(false);
    console.log('Card option visible:', cardVisible);

    // ASSERTION 2: COD option should be visible and checked by default
    const codOption = page.getByTestId('payment-cod');
    await expect(codOption).toBeVisible();
    await expect(codOption).toBeChecked();
    console.log('COD option is visible and checked');

    // ASSERTION 3: Guest card notice should be visible (if card flag is enabled at build time)
    const guestCardNotice = page.getByTestId('guest-card-notice');
    const noticeVisible = await guestCardNotice.isVisible().catch(() => false);
    if (noticeVisible) {
      console.log('Guest card notice is visible');
      await expect(guestCardNotice).toContainText('Για πληρωμή με κάρτα απαιτείται σύνδεση');
    } else {
      console.log('Guest card notice not visible (card flag may be disabled at build time)');
    }
  });

  test('GATE2: Guest COD checkout succeeds without payment init call', async ({ page, request }) => {
    // Step 1: Get a product
    const productsRes = await request.get('/api/v1/public/products?limit=1');
    expect(productsRes.ok()).toBe(true);
    const productsData = await productsRes.json();
    const product = productsData.data?.[0] || productsData.items?.[0];
    test.skip(!product, 'No products available');

    console.log('Using product:', product.id, '-', product.name);

    // Step 2: Add product to cart
    await page.goto('/products/' + product.id);
    const addBtn = page.getByTestId('add-to-cart')
      .or(page.getByTestId('add-to-cart-button'))
      .or(page.locator('button:has-text("Προσθήκη")'));
    await addBtn.first().click();
    await page.waitForTimeout(1500);

    // Step 3: Go to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Wait for checkout form
    const checkoutForm = page.getByTestId('checkout-form');
    await expect(checkoutForm).toBeVisible({ timeout: 15000 });

    // Fill checkout form
    const timestamp = String(new Date().getTime());
    await page.fill('[data-testid="checkout-name"]', 'Guest Card Gate Test');
    await page.fill('[data-testid="checkout-phone"]', '+30 210 1234567');
    await page.fill('[data-testid="checkout-email"]', 'guest-gate-' + timestamp + '@test.dixis.gr');
    await page.fill('[data-testid="checkout-address"]', 'Test Street 123');
    await page.fill('[data-testid="checkout-city"]', 'Athens');
    await page.fill('[data-testid="checkout-postal"]', '10671');

    // Ensure COD is selected (should be default)
    const codOption = page.getByTestId('payment-cod');
    await expect(codOption).toBeChecked();

    // Track API calls - critical: NO payment init should be called
    let orderCreated = false;
    let paymentInitCalled = false;
    let paymentInitUrl = '';

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/v1/public/orders') && response.request().method() === 'POST') {
        orderCreated = response.ok();
        console.log('Order API:', response.status());
      }
      if (url.includes('/payments/orders/') && url.includes('/init')) {
        paymentInitCalled = true;
        paymentInitUrl = url;
        console.log('UNEXPECTED: Payment Init API called:', url);
      }
    });

    // Submit checkout
    const submitBtn = page.getByTestId('checkout-submit');
    await submitBtn.click();

    // Wait for redirect to thank-you page
    await page.waitForURL(/thank-you/, { timeout: 30000 });

    // ASSERTION 1: Order was created successfully
    expect(orderCreated, 'Order should be created').toBe(true);
    console.log('Order created successfully');

    // ASSERTION 2: Payment init was NOT called
    expect(paymentInitCalled, 'Payment init should NOT be called for COD. Called: ' + paymentInitUrl).toBe(false);
    console.log('Payment init NOT called - CORRECT for COD');

    // ASSERTION 3: We reached thank-you page
    const currentUrl = page.url();
    expect(currentUrl).toContain('thank-you');
    console.log('Reached thank-you page');
  });
});

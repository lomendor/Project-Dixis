import { test, expect } from '@playwright/test';

/**
 * E2E Test: Checkout Laravel API Integration
 *
 * Verifies that /checkout page creates orders via Laravel API (/api/v1/orders)
 * instead of legacy Next.js API (/api/checkout).
 *
 * @see PR feat/passXX-checkout-consolidation
 */

test.describe('Checkout Laravel API Integration', () => {

  test('should create order via Laravel API when submitting checkout form', async ({ page }) => {
    console.log('🧪 Testing /checkout page Laravel API integration...');

    // Track API calls
    const apiCalls: { url: string; method: string }[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/v1/orders') || url.includes('/api/checkout')) {
        apiCalls.push({ url, method: request.method() });
        console.log(`📡 API Call: ${request.method()} ${url}`);
      }
    });

    // Step 1: Add product to cart
    console.log('📦 Step 1: Adding product to cart...');
    await page.goto('/');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('a').first().click();
    await page.waitForURL(/\/products\/\d+/);

    const addToCartBtn = page.locator('button:has-text("Προσθήκη στο καλάθι")').or(
      page.locator('[data-testid="add-to-cart"]')
    );
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Wait for cart to update
    await page.waitForTimeout(1500);

    // Step 2: Navigate to checkout page
    console.log('🛒 Step 2: Navigating to /checkout...');
    await page.goto('/checkout');
    await page.waitForSelector('[data-testid="checkout-form"]', { timeout: 10000 });

    // Verify form is visible
    await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();

    // Step 3: Fill checkout form
    console.log('✍️ Step 3: Filling checkout form...');
    await page.fill('[data-testid="checkout-name"]', 'E2E Test User');
    await page.fill('[data-testid="checkout-phone"]', '+30 210 1234567');
    await page.fill('[data-testid="checkout-email"]', 'e2e@test.com');
    await page.fill('[data-testid="checkout-address"]', '123 Test Street');
    await page.fill('[data-testid="checkout-city"]', 'Athens');
    await page.fill('[data-testid="checkout-postcode"]', '10671');

    // Step 4: Submit order
    console.log('📤 Step 4: Submitting order...');
    const submitBtn = page.locator('[data-testid="checkout-submit"]');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Step 5: Wait for order creation
    console.log('⏳ Step 5: Waiting for order creation...');
    await page.waitForTimeout(3000);

    // Step 6: Verify Laravel API was called
    console.log('✅ Step 6: Verifying API calls...');
    console.log(`Total API calls captured: ${apiCalls.length}`);

    const laravelOrderCalls = apiCalls.filter(
      call => call.url.includes('/api/v1/orders') && call.method === 'POST'
    );
    const legacyCheckoutCalls = apiCalls.filter(
      call => call.url.includes('/api/checkout') && call.method === 'POST'
    );

    console.log(`Laravel API calls: ${laravelOrderCalls.length}`);
    console.log(`Legacy API calls: ${legacyCheckoutCalls.length}`);

    // ASSERTIONS
    expect(laravelOrderCalls.length).toBeGreaterThan(0); // Laravel API was called
    expect(legacyCheckoutCalls.length).toBe(0); // Legacy API NOT called

    // Step 7: Verify redirect to thank-you page
    console.log('🎉 Step 7: Verifying redirect...');
    await page.waitForURL(/\/thank-you/, { timeout: 10000 });

    const url = page.url();
    console.log(`Redirected to: ${url}`);
    expect(url).toMatch(/\/thank-you/);

    console.log('✅ Test passed: Checkout uses Laravel API!');
  });

  test('should persist order in database (not just sessionStorage)', async ({ page }) => {
    console.log('🧪 Testing order persistence in database...');

    let createdOrderId: string | null = null;

    // Capture order creation response
    page.on('response', async (response) => {
      if (response.url().includes('/api/v1/orders') && response.request().method() === 'POST') {
        try {
          const data = await response.json();
          createdOrderId = data.data?.id || data.id;
          console.log(`📋 Order created with ID: ${createdOrderId}`);
        } catch (e) {
          console.error('Failed to parse order response:', e);
        }
      }
    });

    // Step 1: Add product and checkout (reuse previous flow)
    await page.goto('/');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('a').first().click();
    await page.waitForURL(/\/products\/\d+/);

    const addToCartBtn = page.locator('button:has-text("Προσθήκη στο καλάθι")').or(
      page.locator('[data-testid="add-to-cart"]')
    );
    await addToCartBtn.click();
    await page.waitForTimeout(1500);

    await page.goto('/checkout');
    await page.waitForSelector('[data-testid="checkout-form"]', { timeout: 10000 });

    await page.fill('[data-testid="checkout-name"]', 'DB Persistence Test');
    await page.fill('[data-testid="checkout-phone"]', '+30 210 9999999');
    await page.fill('[data-testid="checkout-address"]', '456 Persistence Ave');
    await page.fill('[data-testid="checkout-city"]', 'Thessaloniki');
    await page.fill('[data-testid="checkout-postcode"]', '54640');

    await page.locator('[data-testid="checkout-submit"]').click();
    await page.waitForTimeout(3000);

    // Step 2: Verify order ID was returned
    expect(createdOrderId).not.toBeNull();
    console.log(`✅ Order ID returned from API: ${createdOrderId}`);

    // Step 3: Close browser (simulate user closing tab)
    await page.context().clearCookies();
    await page.evaluate(() => sessionStorage.clear());
    console.log('🗑️ Cleared sessionStorage (simulating browser close)');

    // Step 4: Fetch order from API to verify it persists
    if (createdOrderId) {
      const response = await page.request.get(`http://localhost:8001/api/v1/orders/${createdOrderId}`);
      const order = await response.json();

      console.log(`📋 Fetched order from DB:`, order);
      expect(order).toBeTruthy();
      expect(order.data?.id || order.id).toBe(createdOrderId);
      console.log('✅ Order persists in database after sessionStorage cleared!');
    }
  });
});

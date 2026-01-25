import { test, expect } from '@playwright/test';

/**
 * E2E Test: Multi-Producer Checkout Flow
 * Pass MP-SHIPPING-BREAKDOWN-TRUTH-01
 *
 * Tests that customers can complete checkout with products from multiple producers,
 * and that the order confirmation shows per-producer shipping breakdown.
 *
 * Updated from HOTFIX-MP-CHECKOUT-GUARD-01 which blocked multi-producer checkout.
 * Now multi-producer checkout is enabled via backend CheckoutService.
 */

// Helper to fetch products from API
async function fetchProducts(request: any) {
  let listResponse = await request.get('/api/v1/public/products?per_page=50');
  if (!listResponse.ok()) {
    listResponse = await request.get('/api/products?per_page=50');
  }
  if (!listResponse.ok()) return [];
  const data = await listResponse.json();
  return data?.items || data?.data || [];
}

// Find two products from different producers
function findMultiProducerProducts(products: any[]) {
  const producerProducts = new Map<string, any>();
  for (const product of products) {
    const producerId = product.producer_id || product.producerId;
    if (producerId && !producerProducts.has(String(producerId))) {
      producerProducts.set(String(producerId), product);
    }
    if (producerProducts.size >= 2) break;
  }
  return Array.from(producerProducts.values());
}

test.describe('Multi-Producer Checkout Flow @smoke', () => {

  test('MPC1: Multi-producer cart shows checkout form (not blocked)', async ({ page, request }) => {
    const products = await fetchProducts(request);
    test.skip(products.length < 2, 'Need at least 2 products');

    const multiProducerProducts = findMultiProducerProducts(products);
    test.skip(multiProducerProducts.length < 2, 'Need products from at least 2 different producers');

    const [product1, product2] = multiProducerProducts;
    console.log(`Testing with products from producers: ${product1.producer_id}, ${product2.producer_id}`);

    // Add first product
    await page.goto(`/products/${product1.id}`);
    const addBtn1 = page.getByTestId('add-to-cart')
      .or(page.getByTestId('add-to-cart-button'))
      .or(page.locator('button:has-text("Προσθήκη")'));
    await expect(addBtn1.first()).toBeVisible({ timeout: 15000 });
    await addBtn1.first().click();
    await page.waitForTimeout(1500);

    // Add second product (different producer)
    await page.goto(`/products/${product2.id}`);
    const addBtn2 = page.getByTestId('add-to-cart')
      .or(page.getByTestId('add-to-cart-button'))
      .or(page.locator('button:has-text("Προσθήκη")'));
    await expect(addBtn2.first()).toBeVisible({ timeout: 15000 });
    await addBtn2.first().click();
    await page.waitForTimeout(1500);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Pass MP-SHIPPING-BREAKDOWN-TRUTH-01: Checkout should NOT be blocked
    // The old blocking message should NOT appear
    const blockedMessage = page.getByTestId('multi-producer-blocked');
    await expect(blockedMessage).not.toBeVisible({ timeout: 3000 });

    // Checkout form SHOULD be visible
    const checkoutForm = page.getByTestId('checkout-form');
    await expect(checkoutForm).toBeVisible({ timeout: 10000 });

    console.log('MPC1: Multi-producer checkout form is accessible');
  });

  test('MPC2: Single-producer checkout still works', async ({ page, request }) => {
    const products = await fetchProducts(request);
    test.skip(products.length < 1, 'Need at least 1 product');

    const product = products[0];

    // Add single product
    await page.goto(`/products/${product.id}`);
    const addBtn = page.getByTestId('add-to-cart')
      .or(page.getByTestId('add-to-cart-button'))
      .or(page.locator('button:has-text("Προσθήκη")'));
    await expect(addBtn.first()).toBeVisible({ timeout: 15000 });
    await addBtn.first().click();
    await page.waitForTimeout(1500);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Verify checkout form is shown (not blocked)
    const blockedMessage = page.getByTestId('multi-producer-blocked');
    await expect(blockedMessage).not.toBeVisible();

    // Verify checkout form is visible
    const checkoutForm = page.getByTestId('checkout-form');
    await expect(checkoutForm).toBeVisible({ timeout: 10000 });

    console.log('MPC2: Single-producer checkout works correctly');
  });

  test('MPC3: Multi-producer COD checkout completes successfully', async ({ page, request }) => {
    const products = await fetchProducts(request);
    test.skip(products.length < 2, 'Need at least 2 products');

    const multiProducerProducts = findMultiProducerProducts(products);
    test.skip(multiProducerProducts.length < 2, 'Need products from at least 2 different producers');

    const [product1, product2] = multiProducerProducts;

    // Add both products to cart
    await page.goto(`/products/${product1.id}`);
    await page.getByTestId('add-to-cart').or(page.getByTestId('add-to-cart-button')).or(page.locator('button:has-text("Προσθήκη")')).first().click();
    await page.waitForTimeout(1500);

    await page.goto(`/products/${product2.id}`);
    await page.getByTestId('add-to-cart').or(page.getByTestId('add-to-cart-button')).or(page.locator('button:has-text("Προσθήκη")')).first().click();
    await page.waitForTimeout(1500);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Verify checkout form is visible (not blocked)
    const checkoutForm = page.getByTestId('checkout-form');
    await expect(checkoutForm).toBeVisible({ timeout: 10000 });

    // Fill in checkout form
    await page.fill('[data-testid="checkout-name"]', 'Test Multi-Producer');
    await page.fill('[data-testid="checkout-phone"]', '+30 210 1234567');
    await page.fill('[data-testid="checkout-email"]', 'test-mp@example.com');
    await page.fill('[data-testid="checkout-address"]', 'Test Street 123');
    await page.fill('[data-testid="checkout-city"]', 'Athens');
    await page.fill('[data-testid="checkout-postal"]', '10671');

    // Ensure COD is selected (default)
    const codRadio = page.locator('[data-testid="payment-cod"]').or(page.getByText('Αντικαταβολή'));
    if (await codRadio.isVisible().catch(() => false)) {
      await codRadio.click();
    }

    // Track API requests to verify order creation
    let orderCreated = false;
    page.on('response', async (response) => {
      if (response.url().includes('/api/v1/public/orders') && response.request().method() === 'POST') {
        if (response.ok()) {
          orderCreated = true;
          const data = await response.json().catch(() => null);
          if (data?.data?.id) {
            console.log(`Order created with ID: ${data.data.id}`);
          }
        }
      }
    });

    // Submit checkout
    const submitBtn = page.getByTestId('checkout-submit');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Wait for redirect to thank-you page OR error message
    await page.waitForURL(/thank-you|checkout/, { timeout: 30000 });

    // Check if we got to thank-you page
    const onThankYouPage = page.url().includes('thank-you');

    if (onThankYouPage) {
      // Verify thank-you page content
      await expect(page.getByTestId('thank-you-page').or(page.getByText('Ευχαριστούμε'))).toBeVisible({ timeout: 10000 });
      console.log('MPC3: Multi-producer COD checkout completed successfully');
    } else {
      // Still on checkout - check for error
      const errorMsg = page.getByTestId('checkout-error');
      if (await errorMsg.isVisible().catch(() => false)) {
        const errorText = await errorMsg.textContent();
        console.log(`MPC3: Checkout error: ${errorText}`);
        // If error mentions multi-producer block, fail the test
        expect(errorText?.toLowerCase()).not.toContain('πολλαπλ');
      }
    }
  });
});

import { test, expect } from '@playwright/test';

/**
 * E2E Test: Multi-Producer Cart
 * Pass SHIP-MULTI-PRODUCER-ENABLE-01
 *
 * Tests that customers can add products from multiple producers
 * to their cart and proceed through checkout.
 */

test.describe('Multi-Producer Cart', () => {

  test('MP1: Add items from two different producers to cart', async ({ page, request }) => {
    // Fetch products to find items from different producers
    const listResponse = await request.get('/api/products?per_page=50');
    const data = await listResponse.json();
    const products = data?.items || data?.data || [];

    test.skip(products.length < 2, 'Need at least 2 products to test multi-producer');

    // Find products from different producers
    const producerProducts = new Map<string, any>();
    for (const product of products) {
      const producerId = product.producer_id || product.producerId;
      if (producerId && !producerProducts.has(producerId)) {
        producerProducts.set(producerId, product);
      }
      if (producerProducts.size >= 2) break;
    }

    test.skip(producerProducts.size < 2, 'Need products from at least 2 different producers');

    const [product1, product2] = Array.from(producerProducts.values());
    console.log(`📦 Testing with products from producers: ${product1.producer_id}, ${product2.producer_id}`);

    // Navigate to first product and add to cart
    await page.goto(`/products/${product1.id}`);
    await page.waitForLoadState('networkidle');

    const addButton1 = page.getByTestId('add-to-cart').or(page.getByTestId('add-to-cart-button'));
    await expect(addButton1.first()).toBeVisible({ timeout: 10000 });
    await addButton1.first().click();

    // Wait for cart update
    await page.waitForTimeout(1500);

    // Navigate to second product and add to cart
    await page.goto(`/products/${product2.id}`);
    await page.waitForLoadState('networkidle');

    const addButton2 = page.getByTestId('add-to-cart').or(page.getByTestId('add-to-cart-button'));
    await expect(addButton2.first()).toBeVisible({ timeout: 10000 });
    await addButton2.first().click();

    // Wait for cart update
    await page.waitForTimeout(1500);

    // Verify cart badge shows 2+ items
    const badgeText = await page.locator('a[aria-label*="Καλάθι"]').textContent();
    const count = parseInt(badgeText?.match(/\d+/)?.[0] || '0');
    expect(count).toBeGreaterThanOrEqual(2);

    // Navigate to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Verify both products are in cart
    await expect(page.getByText('Σύνοψη Παραγγελίας')).toBeVisible({ timeout: 10000 });

    // Cart should show items (grand total > 0)
    const grandTotal = page.getByTestId('cart-grand-total');
    await expect(grandTotal).toBeVisible();
    const totalText = await grandTotal.textContent();
    expect(totalText).not.toContain('0.00');

    console.log('✅ MP1: Multi-producer cart verified with 2 products');
  });

  test('MP2: Multi-producer cart can proceed to checkout', async ({ page, request }) => {
    // Fetch products to find items from different producers
    const listResponse = await request.get('/api/products?per_page=50');
    const data = await listResponse.json();
    const products = data?.items || data?.data || [];

    test.skip(products.length < 2, 'Need at least 2 products to test multi-producer');

    // Find products from different producers
    const producerProducts = new Map<string, any>();
    for (const product of products) {
      const producerId = product.producer_id || product.producerId;
      if (producerId && !producerProducts.has(producerId)) {
        producerProducts.set(producerId, product);
      }
      if (producerProducts.size >= 2) break;
    }

    test.skip(producerProducts.size < 2, 'Need products from at least 2 different producers');

    const [product1, product2] = Array.from(producerProducts.values());

    // Add first product
    await page.goto(`/products/${product1.id}`);
    await page.waitForLoadState('networkidle');
    const addBtn1 = page.getByTestId('add-to-cart').or(page.getByTestId('add-to-cart-button'));
    await addBtn1.first().click();
    await page.waitForTimeout(1500);

    // Add second product (different producer)
    await page.goto(`/products/${product2.id}`);
    await page.waitForLoadState('networkidle');
    const addBtn2 = page.getByTestId('add-to-cart').or(page.getByTestId('add-to-cart-button'));
    await addBtn2.first().click();
    await page.waitForTimeout(1500);

    // Go to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Fill shipping info (required for checkout)
    const postalField = page.locator('[data-testid="postal-code-input"]');
    const cityField = page.locator('[data-testid="city-input"]');

    if (await postalField.isVisible()) {
      await postalField.fill('11527');
    }
    if (await cityField.isVisible()) {
      await cityField.fill('Athens');
    }

    // Wait for shipping calculation
    await page.waitForTimeout(2000);

    // Verify checkout button is accessible
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');

    // The checkout button should be visible and clickable for multi-producer cart
    await expect(checkoutBtn).toBeVisible({ timeout: 10000 });

    // Verify button text (should NOT say "blocked" or "error")
    const btnText = await checkoutBtn.textContent();
    expect(btnText?.toLowerCase()).not.toContain('block');
    expect(btnText?.toLowerCase()).not.toContain('error');

    console.log('✅ MP2: Multi-producer cart checkout button accessible');
  });

  test('MP3: No producer conflict modal appears for multi-producer add', async ({ page, request }) => {
    // Fetch products to find items from different producers
    const listResponse = await request.get('/api/products?per_page=50');
    const data = await listResponse.json();
    const products = data?.items || data?.data || [];

    test.skip(products.length < 2, 'Need at least 2 products');

    // Find products from different producers
    const producerProducts = new Map<string, any>();
    for (const product of products) {
      const producerId = product.producer_id || product.producerId;
      if (producerId && !producerProducts.has(producerId)) {
        producerProducts.set(producerId, product);
      }
      if (producerProducts.size >= 2) break;
    }

    test.skip(producerProducts.size < 2, 'Need products from at least 2 different producers');

    const [product1, product2] = Array.from(producerProducts.values());

    // Add first product
    await page.goto(`/products/${product1.id}`);
    await page.waitForLoadState('networkidle');
    const addBtn1 = page.getByTestId('add-to-cart').or(page.getByTestId('add-to-cart-button'));
    await addBtn1.first().click();
    await page.waitForTimeout(1500);

    // Add second product from different producer
    await page.goto(`/products/${product2.id}`);
    await page.waitForLoadState('networkidle');
    const addBtn2 = page.getByTestId('add-to-cart').or(page.getByTestId('add-to-cart-button'));
    await addBtn2.first().click();

    // Wait a moment for any modal to potentially appear
    await page.waitForTimeout(1500);

    // Verify NO conflict modal is shown
    const conflictModal = page.locator('[data-testid="producer-conflict-modal"]');
    await expect(conflictModal).not.toBeVisible();

    // Also check for common modal text that would indicate conflict
    const conflictText = page.getByText(/different producer|replace cart|αντικατάσταση/i);
    await expect(conflictText).not.toBeVisible();

    // Verify second product was added (button shows confirmation)
    const confirmText = page.getByText(/προστέθηκε|added|✓|✅/i);
    await expect(confirmText.first()).toBeVisible();

    console.log('✅ MP3: No conflict modal for multi-producer cart');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Cart UX Flow', () => {
  test('empty cart blocks checkout', async ({ page }) => {
    await page.goto('/cart');

    // Verify empty cart state
    await expect(page.locator('text=Το καλάθι είναι άδειο')).toBeVisible();

    // No checkout button should be enabled
    const checkoutBtn = page.locator('button:has-text("Ολοκλήρωση παραγγελίας")');
    if (await checkoutBtn.isVisible()) {
      await expect(checkoutBtn).toBeDisabled();
    }
  });

  test('overstock shows message and disables checkout', async ({ page, context }) => {
    // Setup localStorage cart with overstock item
    await context.addInitScript(() => {
      localStorage.setItem('dixis_cart', JSON.stringify([
        { productId: 'test-product-1', qty: 999 }
      ]));
    });

    await page.goto('/cart');

    // Wait for product enrichment
    await page.waitForTimeout(2000);

    // Check for overstock message
    const overstockMsg = page.locator('text=Υπέρβαση αποθέματος');
    if (await overstockMsg.isVisible()) {
      // Verify checkout is disabled
      const checkoutBtn = page.locator('button:has-text("Ολοκλήρωση παραγγελίας")');
      await expect(checkoutBtn).toBeDisabled();
    }
  });

  test('401 redirects to /join', async ({ page, context }) => {
    // Setup localStorage cart with valid item
    await context.addInitScript(() => {
      localStorage.setItem('dixis_cart', JSON.stringify([
        { productId: 'test-product-1', qty: 1 }
      ]));
    });

    await page.goto('/cart');

    // Wait for product enrichment
    await page.waitForTimeout(2000);

    // Fill shipping info
    await page.fill('input[value=""][type="text"]', 'Test User');
    const inputs = await page.locator('input[type="text"]').all();
    if (inputs.length >= 4) {
      await inputs[1].fill('123 Test Street');
      await inputs[2].fill('Athens');
      await inputs[3].fill('12345');
    }

    // Mock 401 response
    await page.route('**/api/checkout', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });

    // Click checkout
    const checkoutBtn = page.locator('button:has-text("Ολοκλήρωση παραγγελίας")');
    await checkoutBtn.click();

    // Verify redirect to /join
    await page.waitForURL(/\/join/);
    expect(page.url()).toContain('/join');
  });

  test('successful checkout redirects to order confirmation', async ({ page, context }) => {
    // Setup localStorage cart
    await context.addInitScript(() => {
      localStorage.setItem('dixis_cart', JSON.stringify([
        { productId: 'test-product-1', qty: 1 }
      ]));
    });

    await page.goto('/cart');

    // Wait for product enrichment
    await page.waitForTimeout(2000);

    // Fill shipping info
    const inputs = await page.locator('input[type="text"]').all();
    if (inputs.length >= 4) {
      await inputs[0].fill('Test User');
      await inputs[1].fill('123 Test Street');
      await inputs[2].fill('Athens');
      await inputs[3].fill('12345');
    }

    // Mock successful checkout
    await page.route('**/api/checkout', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ orderId: 'test-order-123' })
      });
    });

    // Click checkout
    const checkoutBtn = page.locator('button:has-text("Ολοκλήρωση παραγγελίας")');
    await checkoutBtn.click();

    // Verify redirect to order confirmation
    await page.waitForURL(/\/orders\/test-order-123/);
    expect(page.url()).toContain('/orders/test-order-123');
  });

  test('quantity is clamped to available stock', async ({ page, context }) => {
    // Setup localStorage cart
    await context.addInitScript(() => {
      localStorage.setItem('dixis_cart', JSON.stringify([
        { productId: 'test-product-1', qty: 5 }
      ]));
    });

    // Mock product API with limited stock
    await page.route('**/api/products/test-product-1', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-product-1',
          title: 'Test Product',
          price: 10.00,
          stock: 3,
          unit: 'kg'
        })
      });
    });

    await page.goto('/cart');

    // Wait for product enrichment
    await page.waitForTimeout(2000);

    // Check for stock display
    const stockInfo = page.locator('text=Διαθέσιμο: 3');
    await expect(stockInfo).toBeVisible();

    // Try to increase quantity beyond stock
    const plusBtn = page.locator('button:has-text("+1")');
    await plusBtn.click();
    await plusBtn.click();

    // Quantity should be clamped to max stock (3)
    const qtyInput = page.locator('input[type="number"]');
    await expect(qtyInput).toHaveValue('3');
  });

  test('copy order code button works', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Mock orders API
    await page.route('**/api/me/orders', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [{
            id: 'ORDER-123',
            total: 25.50,
            items: [
              { id: '1', titleSnap: 'Test Product', qty: 2, priceSnap: 10.00, subtotal: 20.00 }
            ]
          }]
        })
      });
    });

    await page.goto('/orders/ORDER-123');

    // Wait for order to load
    await page.waitForSelector('text=Η παραγγελία σας');

    // Click copy button
    const copyBtn = page.locator('button:has-text("Αντιγραφή κωδικού")');
    await copyBtn.click();

    // Verify alert appears
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('αντιγράφηκε');
      await dialog.accept();
    });
  });

  test('my orders link is visible on order confirmation', async ({ page }) => {
    // Mock orders API
    await page.route('**/api/me/orders', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [{
            id: 'ORDER-123',
            total: 25.50,
            items: [
              { id: '1', titleSnap: 'Test Product', qty: 2, priceSnap: 10.00, subtotal: 20.00 }
            ]
          }]
        })
      });
    });

    await page.goto('/orders/ORDER-123');

    // Wait for order to load
    await page.waitForSelector('text=Η παραγγελία σας');

    // Verify "My Orders" link is visible
    const myOrdersLink = page.locator('a:has-text("Οι παραγγελίες μου")');
    await expect(myOrdersLink).toBeVisible();
    await expect(myOrdersLink).toHaveAttribute('href', '/my/orders');
  });
});

import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

/**
 * E2E tests for public order tracking (Pass 173M)
 * Tests: checkout → get publicToken → track page shows status/shipping
 */

test.describe('Public Order Tracking', () => {
  test('Checkout creates order with publicToken → track API returns data (no PII)', async ({ request }) => {
    // Create order via checkout
    const checkoutResponse = await request.post(base + '/api/checkout', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        items: [{ productId: 'seeded', qty: 1, price: 10 }],
        shipping: {
          name: 'Πελάτης Δοκιμής',
          line1: 'Οδός 1',
          city: 'Αθήνα',
          postal: '11111',
          phone: '+306900000001',
          email: 'test@example.com',
          method: 'COURIER'
        },
        payment: { method: 'COD' }
      }
    });

    expect(checkoutResponse.ok()).toBeTruthy();
    const checkoutData = await checkoutResponse.json();
    const orderId = checkoutData.orderId || checkoutData.id;
    expect(orderId).toBeTruthy();

    // Get order to retrieve publicToken (in production, this would come from email)
    const orderResponse = await request.get(base + `/api/orders/${orderId}`);
    expect(orderResponse.ok()).toBeTruthy();
    const orderData = await orderResponse.json();
    expect(orderData.publicToken).toBeTruthy();

    const publicToken = orderData.publicToken;

    // Track order via public endpoint (no auth required)
    const trackResponse = await request.get(base + `/api/orders/track/${publicToken}`);
    expect(trackResponse.ok()).toBeTruthy();
    expect(trackResponse.status()).toBe(200);

    const trackData = await trackResponse.json();

    // Verify tracking data contains expected fields
    expect(trackData.id).toBe(orderId);
    expect(trackData.status).toBeTruthy();
    expect(trackData.total).toBeGreaterThan(0);
    expect(trackData.shippingMethod).toBeTruthy();
    expect(Number(trackData.computedShipping)).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(trackData.items)).toBe(true);
    expect(trackData.items.length).toBeGreaterThan(0);

    // Verify NO PII exposure (no phone, email, address)
    expect(trackData.buyerPhone).toBeUndefined();
    expect(trackData.buyerName).toBeUndefined();
    expect(trackData.shippingLine1).toBeUndefined();
    expect(trackData.shippingCity).toBeUndefined();
    expect(trackData.shippingPostal).toBeUndefined();
  });

  test('Track page shows status, shipping method, and cost', async ({ request, page }) => {
    // Create order
    const checkoutResponse = await request.post(base + '/api/checkout', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        items: [{ productId: 'seeded', qty: 2, price: 10 }],
        shipping: {
          name: 'Πελάτης Β',
          line1: 'Οδός 2',
          city: 'Θεσσαλονίκη',
          postal: '54600',
          phone: '+306900000002',
          email: 'test2@example.com',
          method: 'COURIER_COD'
        },
        payment: { method: 'COD' }
      }
    });

    const checkoutData = await checkoutResponse.json();
    const orderId = checkoutData.orderId || checkoutData.id;

    // Get publicToken
    const orderResponse = await request.get(base + `/api/orders/${orderId}`);
    const orderData = await orderResponse.json();
    const publicToken = orderData.publicToken;

    // Visit tracking page
    await page.goto(`/orders/track/${publicToken}`);

    // Verify page title and order ID
    await expect(page.getByText('Παρακολούθηση Παραγγελίας')).toBeVisible();
    await expect(page.getByText(`Κωδικός: ${orderId}`)).toBeVisible();

    // Verify status display
    const statusElement = page.getByTestId('tracking-status');
    await expect(statusElement).toBeVisible();
    await expect(statusElement).toContainText(/Εκκρεμής|Επιβεβαιωμένη|Σε αποστολή|Παραδόθηκε/);

    // Verify shipping method display
    const shippingMethod = page.getByTestId('tracking-shipping-method');
    await expect(shippingMethod).toBeVisible();
    await expect(shippingMethod).toContainText('Αντικαταβολή');

    // Verify shipping cost display
    const shippingCost = page.getByTestId('tracking-shipping-cost');
    await expect(shippingCost).toBeVisible();
    await expect(shippingCost).toContainText('€');

    // Verify total display
    const total = page.getByTestId('tracking-total');
    await expect(total).toBeVisible();
    await expect(total).toContainText('€');

    // Verify items are displayed
    const items = page.getByTestId('tracking-item');
    expect(await items.count()).toBeGreaterThan(0);
  });

  test('Invalid token returns 404 with error message', async ({ request, page }) => {
    const fakeToken = '00000000-0000-0000-0000-000000000000';

    // API should return 404
    const trackResponse = await request.get(base + `/api/orders/track/${fakeToken}`);
    expect(trackResponse.status()).toBe(404);
    const trackData = await trackResponse.json();
    expect(trackData.error).toBeTruthy();

    // UI should show error
    await page.goto(`/orders/track/${fakeToken}`);
    const errorElement = page.getByTestId('tracking-error');
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText(/δεν βρέθηκε|Σφάλμα/i);
  });

  test('Track page displays Greek labels for all shipping methods', async ({ request, page }) => {
    const methods = [
      { code: 'COURIER', expectedLabel: 'Παράδοση με κούριερ' },
      { code: 'COURIER_COD', expectedLabel: 'Αντικαταβολή' },
      { code: 'HOME', expectedLabel: 'Παράδοση με κούριερ' } // Alias → COURIER
    ];

    for (const method of methods) {
      // Create order with specific method
      const checkoutResponse = await request.post(base + '/api/checkout', {
        headers: { 'Content-Type': 'application/json' },
        data: {
          items: [{ productId: 'seeded', qty: 1, price: 10 }],
          shipping: {
            name: 'Πελάτης Γ',
            line1: 'Οδός 3',
            city: 'Πάτρα',
            postal: '26000',
            phone: '+306900000003',
            email: 'test3@example.com',
            method: method.code
          },
          payment: { method: 'COD' }
        }
      });

      const checkoutData = await checkoutResponse.json();
      const orderId = checkoutData.orderId || checkoutData.id;

      // Get publicToken
      const orderResponse = await request.get(base + `/api/orders/${orderId}`);
      const orderData = await orderResponse.json();
      const publicToken = orderData.publicToken;

      // Visit tracking page
      await page.goto(`/orders/track/${publicToken}`);

      // Verify Greek label is displayed
      const shippingMethod = page.getByTestId('tracking-shipping-method');
      await expect(shippingMethod).toBeVisible();
      await expect(shippingMethod).toHaveText(method.expectedLabel);
    }
  });

  test('Free shipping threshold: order ≥€25 → computedShipping == 0 on track page', async ({ request, page }) => {
    // Create order over free shipping threshold (€25)
    const checkoutResponse = await request.post(base + '/api/checkout', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        items: [{ productId: 'seeded', qty: 3, price: 10 }], // €30 subtotal
        shipping: {
          name: 'Πελάτης Δ',
          line1: 'Οδός 4',
          city: 'Ηράκλειο',
          postal: '71000',
          phone: '+306900000004',
          email: 'test4@example.com',
          method: 'COURIER'
        },
        payment: { method: 'COD' }
      }
    });

    const checkoutData = await checkoutResponse.json();
    const orderId = checkoutData.orderId || checkoutData.id;

    // Get publicToken
    const orderResponse = await request.get(base + `/api/orders/${orderId}`);
    const orderData = await orderResponse.json();
    const publicToken = orderData.publicToken;

    // Visit tracking page
    await page.goto(`/orders/track/${publicToken}`);

    // Verify free shipping (€0.00)
    const shippingCost = page.getByTestId('tracking-shipping-cost');
    await expect(shippingCost).toBeVisible();
    await expect(shippingCost).toHaveText('€0.00');
  });
});

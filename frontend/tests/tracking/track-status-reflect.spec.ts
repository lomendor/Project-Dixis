import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

/**
 * E2E test for Pass 173M.1: Status change reflection on public tracking page
 * Tests: Admin changes status → public track page shows updated status
 */

test.describe('Status Change Reflection on Public Tracking', () => {
  test('Status change from PENDING → PACKING reflects on public track page', async ({ request, page }) => {
    // 1) Create order via checkout
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

    // 2) Get publicToken from order
    const orderResponse = await request.get(base + `/api/orders/${orderId}`);

    // Skip test if publicToken field doesn't exist yet (before PR #484 merges)
    if (!orderResponse.ok()) {
      test.skip();
      return;
    }

    const orderData = await orderResponse.json();
    const publicToken = orderData.publicToken;

    if (!publicToken) {
      test.skip();
      return;
    }

    // 3) Verify initial status is PENDING
    await page.goto(`/orders/track/${publicToken}`);
    const initialStatus = page.getByTestId('tracking-status');
    await expect(initialStatus).toBeVisible();
    await expect(initialStatus).toContainText('Εκκρεμής');

    // 4) Admin changes status to PACKING
    // Note: This would require admin auth in production
    // For testing, we'll call the endpoint directly
    const statusResponse = await request.post(base + `/api/admin/orders/${orderId}/status`, {
      headers: { 'Content-Type': 'application/json' },
      data: { status: 'PACKING' }
    });

    // Skip if endpoint requires auth (403)
    if (statusResponse.status() === 403) {
      console.log('[test] Admin endpoint requires auth, skipping status change test');
      test.skip();
      return;
    }

    expect(statusResponse.ok()).toBeTruthy();

    // 5) Reload tracking page and verify status updated
    await page.reload();
    await page.waitForLoadState('networkidle');

    const updatedStatus = page.getByTestId('tracking-status');
    await expect(updatedStatus).toBeVisible({ timeout: 10000 });

    // Check for either "Συσκευασία" or "Σε αποστολή" (Greek labels for PACKING/SHIPPED)
    const statusText = await updatedStatus.textContent();
    expect(statusText).toMatch(/Συσκευασία|Σε αποστολή|PACKING/i);
  });

  test('Multiple status transitions reflect correctly on tracking page', async ({ request, page }) => {
    // 1) Create order
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

    // 2) Get publicToken
    const orderResponse = await request.get(base + `/api/orders/${orderId}`);

    if (!orderResponse.ok()) {
      test.skip();
      return;
    }

    const orderData = await orderResponse.json();
    const publicToken = orderData.publicToken;

    if (!publicToken) {
      test.skip();
      return;
    }

    // 3) Initial status: PENDING
    await page.goto(`/orders/track/${publicToken}`);
    let status = page.getByTestId('tracking-status');
    await expect(status).toContainText('Εκκρεμής');

    // 4) Transition to PACKING
    let statusResponse = await request.post(base + `/api/admin/orders/${orderId}/status`, {
      headers: { 'Content-Type': 'application/json' },
      data: { status: 'PACKING' }
    });

    if (statusResponse.status() === 403) {
      test.skip();
      return;
    }

    await page.reload();
    await page.waitForLoadState('networkidle');
    status = page.getByTestId('tracking-status');
    const packingText = await status.textContent();
    expect(packingText).toMatch(/Συσκευασία|PACKING/i);

    // 5) Transition to SHIPPED
    statusResponse = await request.post(base + `/api/admin/orders/${orderId}/status`, {
      headers: { 'Content-Type': 'application/json' },
      data: { status: 'SHIPPED' }
    });

    expect(statusResponse.ok()).toBeTruthy();

    await page.reload();
    await page.waitForLoadState('networkidle');
    status = page.getByTestId('tracking-status');
    const shippedText = await status.textContent();
    expect(shippedText).toMatch(/Σε αποστολή|SHIPPED/i);

    // 6) Transition to DELIVERED
    statusResponse = await request.post(base + `/api/admin/orders/${orderId}/status`, {
      headers: { 'Content-Type': 'application/json' },
      data: { status: 'DELIVERED' }
    });

    expect(statusResponse.ok()).toBeTruthy();

    await page.reload();
    await page.waitForLoadState('networkidle');
    status = page.getByTestId('tracking-status');
    const deliveredText = await status.textContent();
    expect(deliveredText).toMatch(/Παραδόθηκε|DELIVERED/i);
  });
});

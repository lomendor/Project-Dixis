import { test, expect } from '@playwright/test';

/**
 * Order Totals Regression Tests
 *
 * Pass: ORDERS-TOTALS-FIX-01, ORDERS-TOTALS-01
 * Purpose: Ensure order totals display correctly (not €0.00 or "—")
 *
 * These tests verify that:
 * 1. Order list shows non-zero totals
 * 2. Order detail shows correct breakdown (subtotal + tax + shipping = total)
 * 3. Totals are from real order data (not hardcoded/placeholder)
 */

test.describe('Order Totals Regression @regression', () => {

  test('API returns non-zero totals for orders', async ({ request }) => {
    // Fetch orders from public API
    const response = await request.get('https://dixis.gr/api/v1/public/orders');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    const orders = data.data || [];

    // Skip if no orders exist
    if (orders.length === 0) {
      test.skip();
      return;
    }

    // Check first 5 orders have non-zero totals
    const ordersToCheck = orders.slice(0, 5);
    for (const order of ordersToCheck) {
      const total = parseFloat(order.total_amount || order.total || '0');
      const subtotal = parseFloat(order.subtotal || '0');

      // If subtotal > 0, total must also be > 0
      if (subtotal > 0) {
        expect(total, `Order #${order.id} total should be > 0`).toBeGreaterThan(0);
      }

      // Total should equal or exceed subtotal (can have shipping/tax)
      expect(total, `Order #${order.id} total should be >= subtotal`).toBeGreaterThanOrEqual(subtotal);
    }
  });

  test('API returns correct total breakdown for order detail', async ({ request }) => {
    // Fetch orders list first
    const listResponse = await request.get('https://dixis.gr/api/v1/public/orders');
    expect(listResponse.ok()).toBeTruthy();

    const listData = await listResponse.json();
    const orders = listData.data || [];

    // Skip if no orders exist
    if (orders.length === 0) {
      test.skip();
      return;
    }

    // Get first order with a total
    const orderWithTotal = orders.find((o: any) => parseFloat(o.total_amount || o.total || '0') > 0);
    if (!orderWithTotal) {
      test.skip();
      return;
    }

    // Fetch order detail
    const detailResponse = await request.get(`https://dixis.gr/api/v1/public/orders/${orderWithTotal.id}`);
    expect(detailResponse.ok()).toBeTruthy();

    const detailData = await detailResponse.json();
    const order = detailData.data || detailData;

    // Parse financial values
    const subtotal = parseFloat(order.subtotal || '0');
    const taxAmount = parseFloat(order.tax_amount || '0');
    const shippingAmount = parseFloat(order.shipping_amount || order.shipping_cost || '0');
    const total = parseFloat(order.total_amount || order.total || '0');

    // Verify invariant: total == subtotal + tax + shipping (within rounding tolerance)
    const calculatedTotal = subtotal + taxAmount + shippingAmount;
    const tolerance = 0.02; // 2 cents tolerance for rounding

    expect(
      Math.abs(total - calculatedTotal),
      `Order #${order.id}: total (${total}) should equal subtotal (${subtotal}) + tax (${taxAmount}) + shipping (${shippingAmount}) = ${calculatedTotal}`
    ).toBeLessThanOrEqual(tolerance);
  });

  test('Order items have non-zero prices when quantity > 0', async ({ request }) => {
    // Fetch orders list
    const listResponse = await request.get('https://dixis.gr/api/v1/public/orders');
    expect(listResponse.ok()).toBeTruthy();

    const listData = await listResponse.json();
    const orders = listData.data || [];

    // Skip if no orders exist
    if (orders.length === 0) {
      test.skip();
      return;
    }

    // Get first order with items
    const orderWithItems = orders.find((o: any) => {
      const items = o.items || o.order_items || [];
      return items.length > 0;
    });

    if (!orderWithItems) {
      test.skip();
      return;
    }

    // Check items
    const items = orderWithItems.items || orderWithItems.order_items || [];
    for (const item of items) {
      const quantity = parseInt(item.quantity || '0');
      const unitPrice = parseFloat(item.unit_price || item.price || '0');
      const totalPrice = parseFloat(item.total_price || '0');

      if (quantity > 0) {
        expect(unitPrice, `Item ${item.id} unit_price should be > 0`).toBeGreaterThan(0);
        expect(totalPrice, `Item ${item.id} total_price should be > 0`).toBeGreaterThan(0);

        // total_price should equal quantity * unit_price (within tolerance)
        const calculatedItemTotal = quantity * unitPrice;
        const tolerance = 0.02;
        expect(
          Math.abs(totalPrice - calculatedItemTotal),
          `Item ${item.id}: total_price (${totalPrice}) should equal qty (${quantity}) * unit (${unitPrice}) = ${calculatedItemTotal}`
        ).toBeLessThanOrEqual(tolerance);
      }
    }
  });

  test('Orders have diverse totals (not all identical - proves real data)', async ({ request }) => {
    // Pass ORDERS-TOTALS-01: Verify totals come from real orders, not hardcoded values
    const response = await request.get('https://dixis.gr/api/v1/public/orders');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    const orders = data.data || [];

    // Need at least 5 orders to check diversity
    if (orders.length < 5) {
      test.skip();
      return;
    }

    // Collect unique totals from first 10 orders
    const totals = orders.slice(0, 10).map((o: any) => parseFloat(o.total_amount || o.total || '0'));
    const uniqueTotals = new Set(totals);

    // Expect at least 3 different total values (proves not hardcoded)
    expect(
      uniqueTotals.size,
      `Expected at least 3 unique totals among ${totals.length} orders, got ${uniqueTotals.size}: ${[...uniqueTotals].join(', ')}`
    ).toBeGreaterThanOrEqual(3);
  });

  test('Order list total matches order detail total', async ({ request }) => {
    // Pass ORDERS-TOTALS-01: Verify list view total matches detail view total
    const listResponse = await request.get('https://dixis.gr/api/v1/public/orders');
    expect(listResponse.ok()).toBeTruthy();

    const listData = await listResponse.json();
    const orders = listData.data || [];

    if (orders.length === 0) {
      test.skip();
      return;
    }

    // Pick first order with a total
    const orderFromList = orders.find((o: any) => parseFloat(o.total_amount || o.total || '0') > 0);
    if (!orderFromList) {
      test.skip();
      return;
    }

    // Fetch same order detail
    const detailResponse = await request.get(`https://dixis.gr/api/v1/public/orders/${orderFromList.id}`);
    expect(detailResponse.ok()).toBeTruthy();

    const detailData = await detailResponse.json();
    const orderFromDetail = detailData.data || detailData;

    // Compare totals
    const listTotal = parseFloat(orderFromList.total_amount || orderFromList.total || '0');
    const detailTotal = parseFloat(orderFromDetail.total_amount || orderFromDetail.total || '0');

    expect(
      listTotal,
      `Order #${orderFromList.id}: list total (${listTotal}) should match detail total (${detailTotal})`
    ).toEqual(detailTotal);
  });
});

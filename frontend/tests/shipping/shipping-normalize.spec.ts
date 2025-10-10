import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

async function placeOrder(method: string) {
  const response = await fetch(base + '/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ productId: 'seeded', qty: 1, price: 10 }],
      shipping: {
        name: 'Πελάτης Δοκιμής',
        line1: 'Οδός 1',
        city: 'Αθήνα',
        postal: '11111',
        phone: '+306900000001',
        email: 'test@example.com',
        method
      },
      payment: { method: 'COD' }
    })
  });
  return response.json();
}

test.describe('Shipping method normalization', () => {
  test('alias HOME → COURIER (canonical) & computedShipping > 0', async () => {
    const data = await placeOrder('HOME');
    const orderId = data.orderId || data.id;
    expect(orderId).toBeTruthy();

    // Verify API returns canonical method
    const apiResponse = await fetch(base + `/api/orders/${orderId}`);
    expect(apiResponse.status()).toBe(200);

    const order = await apiResponse.json();
    expect(String(order.shippingMethod)).toBe('COURIER');
    expect(Number(order.computedShipping)).toBeGreaterThan(0);
  });

  test('alias STORE_PICKUP → PICKUP (canonical) & computedShipping == 0', async () => {
    const data = await placeOrder('STORE_PICKUP');
    const orderId = data.orderId || data.id;
    expect(orderId).toBeTruthy();

    // Verify API returns canonical method
    const apiResponse = await fetch(base + `/api/orders/${orderId}`);
    expect(apiResponse.status()).toBe(200);

    const order = await apiResponse.json();
    expect(String(order.shippingMethod)).toBe('PICKUP');
    expect(Number(order.computedShipping)).toBe(0);
  });

  test('alias LOCKER → COURIER (canonical) & computedShipping > 0', async () => {
    const data = await placeOrder('LOCKER');
    const orderId = data.orderId || data.id;
    expect(orderId).toBeTruthy();

    // Verify API returns canonical method
    const apiResponse = await fetch(base + `/api/orders/${orderId}`);
    expect(apiResponse.status()).toBe(200);

    const order = await apiResponse.json();
    expect(String(order.shippingMethod)).toBe('COURIER');
    expect(Number(order.computedShipping)).toBeGreaterThan(0);
  });

  test('COURIER stays canonical & computedShipping calculated correctly', async () => {
    const data = await placeOrder('COURIER');
    const orderId = data.orderId || data.id;
    expect(orderId).toBeTruthy();

    // Verify API returns canonical method unchanged
    const apiResponse = await fetch(base + `/api/orders/${orderId}`);
    expect(apiResponse.status()).toBe(200);

    const order = await apiResponse.json();
    expect(String(order.shippingMethod)).toBe('COURIER');
    expect(Number(order.computedShipping)).toBe(3.5); // Base cost for low subtotal
  });

  test('COURIER_COD stays canonical & computedShipping includes base cost', async () => {
    const data = await placeOrder('COURIER_COD');
    const orderId = data.orderId || data.id;
    expect(orderId).toBeTruthy();

    // Verify API returns canonical method
    const apiResponse = await fetch(base + `/api/orders/${orderId}`);
    expect(apiResponse.status()).toBe(200);

    const order = await apiResponse.json();
    expect(String(order.shippingMethod)).toBe('COURIER_COD');
    expect(Number(order.computedShipping)).toBe(3.5); // Same base cost as COURIER
  });

  test('Free shipping threshold: order ≥€25 → computedShipping == 0', async () => {
    const response = await fetch(base + '/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'seeded', qty: 3, price: 10 }], // 30€ subtotal
        shipping: {
          name: 'Πελάτης',
          line1: 'Οδός 1',
          city: 'Αθήνα',
          postal: '11111',
          phone: '+306900000001',
          email: 'test@example.com',
          method: 'HOME' // Will normalize to COURIER
        },
        payment: { method: 'COD' }
      })
    });

    const data = await response.json();
    const orderId = data.orderId || data.id;

    const apiResponse = await fetch(base + `/api/orders/${orderId}`);
    const order = await apiResponse.json();

    expect(String(order.shippingMethod)).toBe('COURIER');
    expect(Number(order.computedShipping)).toBe(0); // Free shipping over €25
  });
});

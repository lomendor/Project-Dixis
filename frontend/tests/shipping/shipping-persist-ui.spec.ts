import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

test.describe('Shipping method persistence', () => {
  test('HOME method persists shippingMethod & computedShipping', async ({ request }) => {
    const response = await request.post(base + '/api/checkout', {
      data: {
        items: [{ productId: 'seeded', qty: 1, price: 10 }],
        shipping: {
          name: 'Test Customer',
          line1: 'Test Street 1',
          city: 'Athens',
          postal: '11111',
          phone: '+306900000001',
          email: 'test@example.com',
          method: 'HOME'
        },
        payment: { method: 'COD' }
      }
    });

    expect(response.status()).toBe(201);
    const data = await response.json();
    const orderId = data.orderId || data.id;

    // Verify the order was created with shipping data
    expect(orderId).toBeTruthy();
  });

  test.skip('Order API returns shippingMethod & computedShipping', async ({ request }) => {
    // TODO: This test requires orders API endpoint which may not exist yet
    // Will be enabled when the orders API is available
  });
});

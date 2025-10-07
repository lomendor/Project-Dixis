import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3001';

test.describe('Checkout Shipping', () => {
  test('Quote API returns shipping fee below threshold', async ({ request }) => {
    const response = await request.post(`${base}/api/checkout/quote`, {
      data: { subtotal: 20 }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('subtotal', 20);
    expect(data).toHaveProperty('shipping');
    expect(data).toHaveProperty('total');
    expect(data.shipping).toBeGreaterThan(0); // Should have shipping fee
    expect(data.total).toBe(data.subtotal + data.shipping);
  });

  test('Quote API returns free shipping above threshold', async ({ request }) => {
    const response = await request.post(`${base}/api/checkout/quote`, {
      data: { subtotal: 40 }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('subtotal', 40);
    expect(data).toHaveProperty('shipping', 0); // Free shipping
    expect(data).toHaveProperty('total', 40);
  });

  test('Quote API handles missing subtotal', async ({ request }) => {
    const response = await request.post(`${base}/api/checkout/quote`, {
      data: {}
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('subtotal', 0);
    expect(data).toHaveProperty('shipping');
    expect(data).toHaveProperty('total');
  });
});

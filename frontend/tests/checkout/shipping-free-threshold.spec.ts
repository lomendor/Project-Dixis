import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

// Helper to create a test product and checkout
async function createProductAndCheckout(
  request: any,
  productPrice: number
) {
  // Login as producer to create test product
  const otpBypass = process.env.OTP_BYPASS_SECRET || 'test-secret-123';
  const loginRes = await request.post(`${base}/api/auth/otp/verify`, {
    data: { phone: '+306900000001', code: otpBypass }
  });
  expect(loginRes.status()).toBe(200);
  const { token } = await loginRes.json();

  // Create test product with specified price
  const productRes = await request.post(`${base}/api/me/products`, {
    headers: { authorization: `Bearer ${token}` },
    data: {
      title: `Free Shipping Test Product ${Date.now()}`,
      price: productPrice,
      stock: 10,
      isActive: true
    }
  });
  expect(productRes.status()).toBe(201);
  const product = await productRes.json();

  // Checkout without auth (as customer)
  const checkoutRes = await request.post(`${base}/api/checkout`, {
    data: {
      items: [{ productId: product.id, qty: 1 }],
      shipping: {
        method: 'COURIER',
        name: 'Test Customer',
        line1: 'Test Address 1',
        city: 'Athens',
        postal: '12345',
        phone: '+306900000002',
        email: 'test@example.com'
      },
      payment: { method: 'COD' }
    }
  });

  return { status: checkoutRes.status(), json: await checkoutRes.json(), productPrice };
}

test('free shipping applies when subtotal >= SHIPPING_FREE_THRESHOLD_EUR (from .env.ci)', async ({ request }) => {
  // .env.ci sets SHIPPING_FREE_THRESHOLD_EUR=50
  // Create product with price > threshold
  const { status, json, productPrice } = await createProductAndCheckout(request, 60);

  expect([200, 201]).toContain(status);
  expect(json.success).toBeTruthy();
  expect(json.orderId).toBeTruthy();

  const computedShipping = Number(json.computedShipping ?? -1);
  const computedTotal = Number(json.computedTotal ?? -1);

  // Verify shipping is free (0)
  expect(computedShipping).toBe(0);

  // Verify total equals product price only (no shipping added)
  expect(Math.abs(computedTotal - productPrice)).toBeLessThan(0.01);
});

test('shipping applies normally when subtotal < SHIPPING_FREE_THRESHOLD_EUR', async ({ request }) => {
  // .env.ci sets SHIPPING_FREE_THRESHOLD_EUR=50
  // Create product with price < threshold
  const { status, json, productPrice } = await createProductAndCheckout(request, 30);

  expect([200, 201]).toContain(status);
  expect(json.success).toBeTruthy();

  const computedShipping = Number(json.computedShipping ?? 0);
  const computedTotal = Number(json.computedTotal ?? 0);
  const baseShipping = Number(process.env.SHIPPING_BASE_EUR || 3.5);

  // Verify shipping is charged (not free)
  expect(computedShipping).toBeGreaterThan(0);
  expect(Math.abs(computedShipping - baseShipping)).toBeLessThan(0.01);

  // Verify total includes shipping
  expect(Math.abs(computedTotal - (productPrice + baseShipping))).toBeLessThan(0.01);
});

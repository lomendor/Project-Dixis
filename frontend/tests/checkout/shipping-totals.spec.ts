import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

// Helper to create a test product and checkout
async function createProductAndCheckout(
  request: any,
  method: 'COURIER' | 'COURIER_COD',
  productPrice: number
) {
  // Login as producer to create test product
  const otpBypass = process.env.OTP_BYPASS_SECRET || 'test-secret-123';
  const loginRes = await request.post(`${base}/api/auth/otp/verify`, {
    data: { phone: '+306900000001', code: otpBypass }
  });
  expect(loginRes.status()).toBe(200);
  const { token } = await loginRes.json();

  // Create test product
  const productRes = await request.post(`${base}/api/me/products`, {
    headers: { authorization: `Bearer ${token}` },
    data: {
      title: `Test Product ${Date.now()}`,
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
        method,
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

test('COURIER includes BASE only in computedShipping', async ({ request }) => {
  const { status, json, productPrice } = await createProductAndCheckout(request, 'COURIER', 20);

  expect([200, 201]).toContain(status);
  expect(json.success).toBeTruthy();
  expect(json.orderId).toBeTruthy();

  const baseShipping = Number(process.env.SHIPPING_BASE_EUR || 3.5);
  const computedShipping = Number(json.computedShipping || 0);
  const computedTotal = Number(json.computedTotal || 0);

  // Verify shipping cost matches BASE
  expect(Math.abs(computedShipping - baseShipping)).toBeLessThan(0.01);

  // Verify total = product price + shipping
  expect(Math.abs(computedTotal - (productPrice + baseShipping))).toBeLessThan(0.01);
});

test('COURIER_COD includes BASE + COD in computedShipping', async ({ request }) => {
  const { status, json, productPrice } = await createProductAndCheckout(request, 'COURIER_COD', 20);

  expect([200, 201]).toContain(status);
  expect(json.success).toBeTruthy();

  const baseShipping = Number(process.env.SHIPPING_BASE_EUR || 3.5);
  const codFee = Number(process.env.SHIPPING_COD_FEE_EUR || 2.0);
  const expectedShipping = baseShipping + codFee;
  const computedShipping = Number(json.computedShipping || 0);
  const computedTotal = Number(json.computedTotal || 0);

  // Verify shipping cost matches BASE + COD
  expect(Math.abs(computedShipping - expectedShipping)).toBeLessThan(0.01);

  // Verify total = product price + shipping
  expect(Math.abs(computedTotal - (productPrice + expectedShipping))).toBeLessThan(0.01);
});

// TODO: Free threshold test moved — requires .env.ci configuration at server start.
// Cannot mutate process.env at runtime in Playwright (different process).
// Future pass will add dedicated test with SHIPPING_FREE_THRESHOLD_EUR set in CI env.

import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const phone = '+306912345699';
const bypass = process.env.OTP_BYPASS || '000000';

test.describe('Checkout Stock Management', () => {
  test('Oversell blocked (409) and stock decremented on success', async ({ request }) => {
    // 1. Login to get session
    await request.post(`${base}/api/auth/request-otp`, {
      data: { phone }
    });

    const verifyResponse = await request.post(`${base}/api/auth/verify-otp`, {
      data: { phone, code: bypass }
    });

    const cookies = verifyResponse.headers()['set-cookie'];
    const sessionMatch = cookies?.match(/dixis_session=([^;]+)/);
    const session = sessionMatch ? sessionMatch[1] : '';

    expect(session).toBeTruthy();

    // 2. Create producer
    const producerResponse = await request.post(`${base}/api/me/producers`, {
      headers: { cookie: `dixis_session=${session}` },
      data: {
        name: 'StockGuard Producer',
        region: 'Αττική',
        category: 'Μέλι'
      }
    });

    expect(producerResponse.ok()).toBeTruthy();

    // 3. Create product with stock=2
    const productResponse = await request.post(`${base}/api/me/products`, {
      headers: { cookie: `dixis_session=${session}` },
      data: {
        title: 'Μέλι Guard',
        category: 'Μέλι',
        price: 5.0,
        unit: 'τεμ',
        stock: 2
      }
    });

    expect(productResponse.ok()).toBeTruthy();
    const productData = await productResponse.json();
    const productId = productData.item?.id || productData.id;

    expect(productId).toBeTruthy();

    // 4. Try to buy 3 (should fail with 409)
    const oversellBody = {
      items: [{ productId, qty: 3 }],
      shipping: {
        name: 'Test Buyer',
        line1: 'Δοκιμαστική 1',
        city: 'Αθήνα',
        postal: '11111'
      }
    };

    const oversellResponse = await request.post(`${base}/api/checkout`, {
      headers: { cookie: `dixis_session=${session}` },
      data: oversellBody
    });

    expect(oversellResponse.status()).toBe(409);
    const oversellError = await oversellResponse.json();
    expect(oversellError.error).toContain('Ανεπαρκές απόθεμα');

    // 5. Buy 1 (should succeed)
    const validBody = {
      items: [{ productId, qty: 1 }],
      shipping: {
        name: 'Test Buyer',
        line1: 'Δοκιμαστική 1',
        city: 'Αθήνα',
        postal: '11111'
      }
    };

    const validResponse = await request.post(`${base}/api/checkout`, {
      headers: { cookie: `dixis_session=${session}` },
      data: validBody
    });

    expect(validResponse.ok()).toBeTruthy();
    const orderData = await validResponse.json();
    expect(orderData.success).toBeTruthy();
    expect(orderData.order.orderId).toBeTruthy();

    // 6. Verify stock decreased to 1
    const productCheck = await request.get(`${base}/api/products/${productId}`);
    expect(productCheck.ok()).toBeTruthy();

    const updatedProduct = await productCheck.json();
    expect(Number(updatedProduct.stock)).toBe(1);
  });

  test('Multiple concurrent orders cannot oversell', async ({ request }) => {
    // Login
    await request.post(`${base}/api/auth/request-otp`, { data: { phone } });
    const verifyResponse = await request.post(`${base}/api/auth/verify-otp`, {
      data: { phone, code: bypass }
    });

    const cookies = verifyResponse.headers()['set-cookie'];
    const session = cookies?.match(/dixis_session=([^;]+)/)?.[1] || '';

    // Create producer and product with stock=1
    await request.post(`${base}/api/me/producers`, {
      headers: { cookie: `dixis_session=${session}` },
      data: { name: 'Concurrent Test', region: 'Αττική', category: 'Μέλι' }
    });

    const productResponse = await request.post(`${base}/api/me/products`, {
      headers: { cookie: `dixis_session=${session}` },
      data: {
        title: 'Limited Stock Product',
        category: 'Μέλι',
        price: 10.0,
        unit: 'τεμ',
        stock: 1
      }
    });

    const productData = await productResponse.json();
    const productId = productData.item?.id || productData.id;

    const orderBody = {
      items: [{ productId, qty: 1 }],
      shipping: {
        name: 'Concurrent Buyer',
        line1: 'Test Street',
        city: 'Αθήνα',
        postal: '12345'
      }
    };

    // Try 2 concurrent orders
    const [response1, response2] = await Promise.all([
      request.post(`${base}/api/checkout`, {
        headers: { cookie: `dixis_session=${session}` },
        data: orderBody
      }),
      request.post(`${base}/api/checkout`, {
        headers: { cookie: `dixis_session=${session}` },
        data: orderBody
      })
    ]);

    // One should succeed, one should fail with 409
    const results = [
      { status: response1.status(), ok: response1.ok() },
      { status: response2.status(), ok: response2.ok() }
    ];

    const successCount = results.filter(r => r.ok).length;
    const oversellCount = results.filter(r => r.status === 409).length;

    expect(successCount).toBe(1);
    expect(oversellCount).toBe(1);
  });
});

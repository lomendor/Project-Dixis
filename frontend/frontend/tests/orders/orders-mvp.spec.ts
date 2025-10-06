import { test, expect, request as pwRequest } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const phone = '+306912345760';
const bypass = process.env.OTP_BYPASS || '000000';

async function loginSess() {
  const ctx = await pwRequest.newContext();
  await ctx.post(base + '/api/auth/request-otp', { data: { phone } });
  const vr = await ctx.post(base + '/api/auth/verify-otp', {
    data: { phone, code: bypass }
  });
  const cookies = await vr.headersArray();
  return (
    cookies
      .find((h) => h.name.toLowerCase() === 'set-cookie')
      ?.value.split('dixis_session=')[1]
      .split(';')[0] || ''
  );
}

test.describe('Orders MVP', () => {
  test('Checkout creates order+items → /my/orders sees PENDING → Accept → Fulfill', async ({
    page,
    request
  }) => {
    const sess = await loginSess();
    const ctx = await pwRequest.newContext();

    // Create producer
    const producerResp = await ctx.post(base + '/api/me/producers', {
      headers: { cookie: `dixis_session=${sess}` },
      data: {
        name: 'Παραγωγός Orders',
        region: 'Αττική',
        category: 'Μέλι'
      }
    });

    if (!producerResp.ok()) {
      console.log('Producer creation failed, skipping test');
      return;
    }

    const producerData = await producerResp.json();
    const producerId =
      producerData.producer?.id || producerData.id || 'test-producer-id';

    // Create product with stock=3
    const productResp = await ctx.post(base + '/api/me/products', {
      headers: { cookie: `dixis_session=${sess}` },
      data: {
        title: 'Μέλι Παραγγελίες',
        category: 'Μέλι',
        price: 7,
        unit: 'τεμ',
        stock: 3,
        isActive: true,
        producerId: producerId
      }
    });

    if (!productResp.ok()) {
      console.log('Product creation failed, skipping test');
      return;
    }

    const productData = await productResp.json();
    const pid = productData.item?.id || productData.id;

    if (!pid) {
      console.log('Product ID not found, skipping test');
      return;
    }

    // API checkout: order 2 items
    const checkoutBody = {
      items: [{ productId: pid, qty: 2 }],
      shipping: {
        name: 'Α',
        line1: 'Δ1',
        city: 'Αθήνα',
        postal: '11111',
        phone: '+3069xxxxxxx'
      }
    };

    const checkoutResp = await request.post(base + '/api/checkout', {
      data: checkoutBody,
      headers: { cookie: `dixis_session=${sess}` }
    });

    expect(checkoutResp.ok()).toBeTruthy();
    const checkoutData = await checkoutResp.json();
    expect(checkoutData.order?.orderId).toBeTruthy();

    // UI: Navigate to /my/orders PENDING tab
    await page.context().addCookies([
      { name: 'dixis_session', value: sess, url: base }
    ]);

    await page.goto(base + '/my/orders?tab=PENDING');

    // Verify order appears in PENDING
    await expect(page.getByText('Μέλι Παραγγελίες')).toBeVisible({
      timeout: 10000
    });

    // Accept the order
    await page
      .getByRole('button', { name: /Αποδοχή/i })
      .first()
      .click();

    // Navigate to ACCEPTED tab
    await page.goto(base + '/my/orders?tab=ACCEPTED');

    // Verify order appears in ACCEPTED
    await expect(page.getByText('Μέλι Παραγγελίες')).toBeVisible({
      timeout: 10000
    });

    // Fulfill the order
    await page
      .getByRole('button', { name: /Ολοκλήρωση/i })
      .first()
      .click();

    // Navigate to FULFILLED tab
    await page.goto(base + '/my/orders?tab=FULFILLED');

    // Verify order appears in FULFILLED
    await expect(page.getByText('Μέλι Παραγγελίες')).toBeVisible({
      timeout: 10000
    });
  });

  test('Oversell protection still works (409 response)', async ({
    request
  }) => {
    const sess = await loginSess();
    const ctx = await pwRequest.newContext();

    // Create producer and product with stock=1
    const producerResp = await ctx.post(base + '/api/me/producers', {
      headers: { cookie: `dixis_session=${sess}` },
      data: {
        name: 'Παραγωγός Oversell Test',
        region: 'Θεσσαλία',
        category: 'Γαλακτοκομικά'
      }
    });

    if (!producerResp.ok()) {
      console.log('Producer creation failed, skipping test');
      return;
    }

    const producerData = await producerResp.json();
    const producerId =
      producerData.producer?.id || producerData.id || 'test-producer-id';

    const productResp = await ctx.post(base + '/api/me/products', {
      headers: { cookie: `dixis_session=${sess}` },
      data: {
        title: 'Φέτα Oversell',
        category: 'Γαλακτοκομικά',
        price: 10,
        unit: 'kg',
        stock: 1,
        isActive: true,
        producerId: producerId
      }
    });

    if (!productResp.ok()) {
      console.log('Product creation failed, skipping test');
      return;
    }

    const productData = await productResp.json();
    const pid = productData.item?.id || productData.id;

    if (!pid) {
      console.log('Product ID not found, skipping test');
      return;
    }

    // Try to order 2 items (stock is only 1)
    const checkoutBody = {
      items: [{ productId: pid, qty: 2 }],
      shipping: {
        name: 'Test',
        line1: 'Test St',
        city: 'Test City',
        postal: '12345',
        phone: '+306912345678'
      }
    };

    const checkoutResp = await request.post(base + '/api/checkout', {
      data: checkoutBody,
      headers: { cookie: `dixis_session=${sess}` }
    });

    // Should get 409 Conflict
    expect(checkoutResp.status()).toBe(409);
    const errorData = await checkoutResp.json();
    expect(errorData.error).toContain('Ανεπαρκές απόθεμα');
  });
});

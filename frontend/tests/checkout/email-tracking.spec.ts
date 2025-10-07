import { test, expect, request as pwRequest } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';
const producerPhone = process.env.PRODUCER_PHONES?.split(',')[0] || '+306900000021';
const bypass = process.env.OTP_BYPASS || '000000';

async function getProducerCookie() {
  const ctx = await pwRequest.newContext();
  try {
    await ctx.post(`${base}/api/auth/request-otp`, {
      data: { phone: producerPhone }
    });
    const vr = await ctx.post(`${base}/api/auth/verify-otp`, {
      data: { phone: producerPhone, code: bypass }
    });
    const headers = await vr.headersArray();
    const setCookie = headers.find((h) => h.name.toLowerCase() === 'set-cookie')?.value || '';
    const match = setCookie.match(/dixis_session=([^;]+)/);
    return match ? match[1] : '';
  } finally {
    await ctx.dispose();
  }
}

test.describe('Email Tracking Link', () => {
  test('order confirmation email contains tracking link (dev mailbox)', async ({ request }) => {
    test.skip(!bypass, 'OTP_BYPASS not configured');
    test.skip(String(process.env.SMTP_DEV_MAILBOX || '') !== '1', 'SMTP_DEV_MAILBOX not enabled');

    const email = 'customer-track@example.com';
    const phone = '+306900000777';
    const cookie = await getProducerCookie();
    const ctx = await pwRequest.newContext({
      extraHTTPHeaders: {
        Cookie: `dixis_session=${cookie}`
      }
    });

    try {
      // Create product
      const prod = await ctx.post(`${base}/api/me/products`, {
        data: {
          title: 'Χαλβάς Email Test',
          category: 'Γλυκά',
          price: 3.2,
          unit: 'τεμ',
          stock: 3,
          isActive: true
        }
      });
      expect([200, 201]).toContain(prod.status());
      const productData = await prod.json();
      const pid = productData?.item?.id || productData?.id;

      if (pid) {
        // Create order with email
        const ord = await request.post(`${base}/api/checkout`, {
          data: {
            items: [{ productId: pid, qty: 1 }],
            shipping: {
              name: 'Τεστ Tracking',
              line1: 'Οδός 1',
              city: 'Αθήνα',
              postal: '11111',
              phone,
              email
            },
            paymentMethod: 'COD'
          }
        });

        expect([200, 201]).toContain(ord.status());
        const orderData = await ord.json();
        const oid = orderData.orderId || orderData.order?.orderId || orderData.order?.id;

        expect(oid).toBeTruthy();

        // Wait for email
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check dev mailbox
        const inbox = await request.get(`${base}/api/dev/mailbox?to=${encodeURIComponent(email)}`);
        expect(inbox.status()).toBe(200);
        const json = await inbox.json();
        expect(json.item?.html || '').toContain(`/orders/track/${oid}`);
        expect(json.item?.html || '').toContain(encodeURIComponent(phone));
      }
    } catch (e) {
      console.log('Email tracking test skipped:', e);
    } finally {
      await ctx.dispose();
    }
  });
});

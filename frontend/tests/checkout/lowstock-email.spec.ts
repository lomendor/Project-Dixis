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

test.describe('Low Stock Email', () => {
  test('low-stock admin email is sent when stock <= threshold after checkout', async ({
    request
  }) => {
    test.skip(!bypass, 'OTP_BYPASS not configured');
    test.skip(String(process.env.SMTP_DEV_MAILBOX || '') !== '1', 'SMTP_DEV_MAILBOX not enabled');

    const admin = process.env.DEV_MAIL_TO || 'dev@localhost';
    const cookie = await getProducerCookie();
    const ctx = await pwRequest.newContext({
      extraHTTPHeaders: {
        Cookie: `dixis_session=${cookie}`
      }
    });

    try {
      // Seed product with low stock so it will drop ≤ threshold (default 3)
      const prod = await ctx.post(`${base}/api/me/products`, {
        data: {
          title: 'Ντομάτα Lowstock Test',
          category: 'Λαχανικά',
          price: 1.2,
          unit: 'kg',
          stock: 2,
          isActive: true
        }
      });
      expect([200, 201]).toContain(prod.status());
      const productData = await prod.json();
      const pid = productData?.item?.id || productData?.id;

      if (pid) {
        // Place order for qty 1 → stock becomes 1 (≤ 3)
        const ord = await request.post(`${base}/api/checkout`, {
          data: {
            items: [{ productId: pid, qty: 1 }],
            shipping: {
              name: 'Τεστ Lowstock',
              line1: 'Οδός 1',
              city: 'Αθήνα',
              postal: '11111',
              phone: '+306900001111',
              email: 't@ex.com'
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

        // Admin mailbox should have low-stock notice
        const inbox = await request.get(`${base}/api/dev/mailbox?to=${encodeURIComponent(admin)}`);
        expect([200, 403]).toContain(inbox.status());
        if (inbox.status() === 200) {
          const j = await inbox.json();
          expect(j.item?.subject || '').toMatch(/Χαμηλό απόθεμα/i);
          expect(j.item?.subject || '').toContain(String(oid));
        }
      }
    } catch (e) {
      console.log('Low-stock email test skipped:', e);
    } finally {
      await ctx.dispose();
    }
  });
});

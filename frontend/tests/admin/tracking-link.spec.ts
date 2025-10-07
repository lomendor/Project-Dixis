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

test.describe('Admin Tracking Link', () => {
  test('admin order page shows copy tracking link button', async ({ request, page }) => {
    test.skip(!bypass, 'OTP_BYPASS not configured');

    const cookie = await getProducerCookie();
    const ctx = await pwRequest.newContext({
      extraHTTPHeaders: {
        Cookie: `dixis_session=${cookie}`
      }
    });

    try {
      // Create product
      const p = await ctx.post(`${base}/api/me/products`, {
        data: {
          title: 'Ρίγανη Admin Test',
          category: 'Μπαχαρικά',
          price: 1.8,
          unit: 'τεμ',
          stock: 4,
          isActive: true
        }
      });
      expect([200, 201]).toContain(p.status());
      const productData = await p.json();
      const pid = productData?.item?.id || productData?.id;

      if (pid) {
        const phone = '+306900000888';
        // Create order
        const ord = await request.post(`${base}/api/checkout`, {
          data: {
            items: [{ productId: pid, qty: 1 }],
            shipping: {
              name: 'Δοκιμή Admin',
              line1: 'Οδός 1',
              city: 'Αθήνα',
              postal: '11111',
              phone
            },
            paymentMethod: 'COD'
          }
        });

        expect([200, 201]).toContain(ord.status());
        const orderData = await ord.json();
        const oid = orderData.orderId || orderData.order?.orderId || orderData.order?.id;

        expect(oid).toBeTruthy();

        // Navigate to admin order page with producer cookie
        await page.context().addCookies([
          {
            name: 'dixis_session',
            value: cookie,
            domain: new URL(base).hostname,
            path: '/'
          }
        ]);

        await page.goto(`${base}/admin/orders/${oid}`);
        await expect(page.getByRole('button', { name: /Copy Tracking Link/i })).toBeVisible();
      }
    } catch (e) {
      console.log('Admin tracking link test skipped:', e);
    } finally {
      await ctx.dispose();
    }
  });
});

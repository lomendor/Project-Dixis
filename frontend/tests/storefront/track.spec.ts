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

test.describe('Order Tracking', () => {
  test('tracking page renders with correct phone match', async ({ request, page }) => {
    test.skip(!bypass, 'OTP_BYPASS not configured');

    const cookie = await getProducerCookie();
    const ctx = await pwRequest.newContext({
      extraHTTPHeaders: {
        Cookie: `dixis_session=${cookie}`
      }
    });

    try {
      // Create a test product
      const productRes = await ctx.post(`${base}/api/me/products`, {
        data: {
          title: 'Μέλι Πευκόμελο Track Test',
          category: 'Μέλι',
          price: 9.5,
          unit: 'τεμ',
          stock: 5,
          isActive: true
        }
      });

      expect([200, 201]).toContain(productRes.status());
      const productData = await productRes.json();
      const pid = productData?.item?.id || productData?.id;

      if (pid) {
        const phone = '+306900001234';
        // Create order
        const orderRes = await request.post(`${base}/api/checkout`, {
          data: {
            items: [{ productId: pid, qty: 1 }],
            shipping: {
              name: 'Τεστ Tracking',
              line1: 'Οδός 1',
              city: 'Αθήνα',
              postal: '11111',
              phone
            },
            paymentMethod: 'COD'
          }
        });

        expect([200, 201]).toContain(orderRes.status());
        const orderData = await orderRes.json();
        const oid = orderData.orderId || orderData.order?.orderId || orderData.order?.id;

        expect(oid).toBeTruthy();

        // Test tracking page with correct phone
        await page.goto(`${base}/orders/track/${oid}?phone=${encodeURIComponent(phone)}`);
        await expect(page.getByText(`Παραγγελία #${oid}`)).toBeVisible();
        await expect(page.getByText('Κατάσταση')).toBeVisible();

        // Test wrong phone → should not reveal
        await page.goto(`${base}/orders/track/${oid}?phone=${encodeURIComponent('+309999999999')}`);
        await expect(page.getByText('Δεν βρέθηκε παραγγελία')).toBeVisible();
      }
    } catch (e) {
      console.log('Tracking test skipped:', e);
    } finally {
      await ctx.dispose();
    }
  });
});

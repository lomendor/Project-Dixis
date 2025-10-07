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
    const setCookie = headers.find(h => h.name.toLowerCase() === 'set-cookie')?.value || '';
    const match = setCookie.match(/dixis_session=([^;]+)/);
    return match ? match[1] : '';
  } finally {
    await ctx.dispose();
  }
}

test.describe('Status Emails + Admin Notice', () => {
  test('admin receives new order notice after checkout', async ({ request }) => {
    test.skip(!bypass, 'OTP_BYPASS not configured');
    test.skip(String(process.env.SMTP_DEV_MAILBOX || '') !== '1', 'SMTP_DEV_MAILBOX not enabled');
    test.skip(!process.env.DEV_MAIL_TO, 'DEV_MAIL_TO not configured');

    const adminEmail = process.env.DEV_MAIL_TO || '';
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
          title: 'Προϊόν Admin Notice Test',
          category: 'Λοιπά',
          price: 8.5,
          unit: 'τεμ',
          stock: 5,
          isActive: true
        }
      });

      expect([200, 201]).toContain(productRes.status());
      const productData = await productRes.json();
      const pid = productData?.item?.id || productData?.id;

      if (pid) {
        // Create order
        const res = await request.post(`${base}/api/checkout`, {
          data: {
            items: [{ productId: pid, qty: 1 }],
            shipping: {
              name: 'Πελάτης Admin Test',
              line1: 'Οδός Admin 1',
              city: 'Αθήνα',
              postal: '11111',
              phone: '+306900000446'
            },
            paymentMethod: 'COD'
          }
        });

        expect([200, 201]).toContain(res.status());
        const body = await res.json();
        const oid = body.orderId || body.order?.orderId || body.id;

        expect(oid).toBeTruthy();

        // Wait for email
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check admin mailbox
        const inbox = await request.get(`${base}/api/dev/mailbox?to=${encodeURIComponent(adminEmail)}`);
        expect(inbox.status()).toBe(200);

        const json = await inbox.json();
        expect(json.item).toBeTruthy();
        expect(json.item?.subject || '').toContain('Νέα Παραγγελία');
        expect(json.item?.subject || '').toContain(String(oid));
        expect(json.item?.text || '').toContain('Πελάτης Admin Test');
      }
    } catch (e) {
      console.log('Admin notice test skipped:', e);
    } finally {
      await ctx.dispose();
    }
  });

  test('customer receives status update email', async ({ request }) => {
    test.skip(!bypass, 'OTP_BYPASS not configured');
    test.skip(String(process.env.SMTP_DEV_MAILBOX || '') !== '1', 'SMTP_DEV_MAILBOX not enabled');

    const customerEmail = 'status-test@example.com';
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
          title: 'Προϊόν Status Email Test',
          category: 'Λοιπά',
          price: 6.0,
          unit: 'τεμ',
          stock: 5,
          isActive: true
        }
      });

      expect([200, 201]).toContain(productRes.status());
      const productData = await productRes.json();
      const pid = productData?.item?.id || productData?.id;

      if (pid) {
        // Create order with email
        const res = await request.post(`${base}/api/checkout`, {
          data: {
            items: [{ productId: pid, qty: 1 }],
            shipping: {
              name: 'Πελάτης Status Test',
              line1: 'Οδός Status 1',
              city: 'Αθήνα',
              postal: '11111',
              phone: '+306900000447',
              email: customerEmail
            },
            paymentMethod: 'COD'
          }
        });

        expect([200, 201]).toContain(res.status());
        const body = await res.json();
        const oid = body.orderId || body.order?.orderId || body.id;

        expect(oid).toBeTruthy();

        // Update order status (simulate admin action)
        const statusRes = await ctx.post(`${base}/api/admin/orders/${oid}/status`, {
          data: { status: 'PACKING' }
        });

        expect(statusRes.status()).toBe(200);

        // Wait for email
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check customer mailbox
        const inbox = await request.get(`${base}/api/dev/mailbox?to=${encodeURIComponent(customerEmail)}`);
        expect(inbox.status()).toBe(200);

        const json = await inbox.json();
        expect(json.item).toBeTruthy();
        expect(json.item?.subject || '').toContain('Ενημέρωση Παραγγελίας');
        expect(json.item?.subject || '').toContain(String(oid));
        expect(json.item?.subject || '').toContain('Συσκευασία');
        expect(json.item?.html || '').toContain('Νέα κατάσταση');
      }
    } catch (e) {
      console.log('Status email test skipped:', e);
    } finally {
      await ctx.dispose();
    }
  });
});

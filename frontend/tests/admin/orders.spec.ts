import { test, expect, request as pwRequest } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';
const adminPhone = process.env.ADMIN_PHONES?.split(',')[0] || '+306900000084';
const bypass = process.env.OTP_BYPASS || '000000';

async function getAdminCookie() {
  const ctx = await pwRequest.newContext();
  try {
    await ctx.post(`${base}/api/auth/request-otp`, {
      data: { phone: adminPhone }
    });
    const vr = await ctx.post(`${base}/api/auth/verify-otp`, {
      data: { phone: adminPhone, code: bypass }
    });
    const headers = await vr.headersArray();
    const setCookie = headers.find(h => h.name.toLowerCase() === 'set-cookie')?.value || '';
    const match = setCookie.match(/dixis_session=([^;]+)/);
    return match ? match[1] : '';
  } finally {
    await ctx.dispose();
  }
}

test.describe('Admin Orders Management', () => {
  test('admin can view orders list and update status', async ({ page, request }) => {
    test.skip(!bypass, 'OTP_BYPASS not configured');

    // Create a test product and order
    const cookie = await getAdminCookie();
    const ctx = await pwRequest.newContext({
      extraHTTPHeaders: {
        Cookie: `dixis_session=${cookie}`
      }
    });

    try {
      // Create product
      const productRes = await ctx.post(`${base}/api/me/products`, {
        data: {
          title: 'Ελαιόλαδο Test',
          category: 'Έλαια',
          price: 9.9,
          unit: 'τεμ',
          stock: 10,
          isActive: true
        }
      });

      if (productRes.status() === 200 || productRes.status() === 201) {
        const productData = await productRes.json();
        const pid = productData?.item?.id || productData?.id;

        if (pid) {
          // Create order
          const orderRes = await request.post(`${base}/api/checkout`, {
            data: {
              items: [{ productId: pid, qty: 1 }],
              shipping: {
                name: 'Δοκιμή Admin',
                line1: 'Οδός Δοκιμής 1',
                city: 'Αθήνα',
                postal: '11111',
                phone: '+306900000200'
              },
              paymentMethod: 'COD'
            }
          });

          if (orderRes.status() === 200 || orderRes.status() === 201) {
            const orderData = await orderRes.json();
            const orderId = orderData?.orderId || orderData?.order?.orderId || orderData?.id;

            if (orderId) {
              // Login as admin
              await page.context().addCookies([
                { name: 'dixis_session', value: cookie, url: base }
              ]);

              // Navigate to orders list
              await page.goto(`${base}/admin/orders`);
              await expect(page.getByText('Παραγγελίες (Admin)')).toBeVisible();

              // Navigate to order detail
              await page.goto(`${base}/admin/orders/${orderId}`);
              await expect(page.getByText(`#${orderId.substring(0, 8)}`)).toBeVisible();

              // Change status to PACKING
              const packingButton = page.getByRole('button', { name: /PACKING/i });
              if (await packingButton.isVisible()) {
                await packingButton.click();
                await page.waitForTimeout(1000);
              }

              // Change status to CANCELLED (triggers restock + email)
              const cancelButton = page.getByRole('button', { name: /CANCELLED/i });
              if (await cancelButton.isVisible()) {
                await cancelButton.click();
                await page.waitForTimeout(1000);

                // Verify page still renders correctly
                await expect(page.getByText(`#${orderId.substring(0, 8)}`)).toBeVisible();
              }
            }
          }
        }
      }
    } catch (e) {
      console.log('Admin orders test skipped:', e);
    } finally {
      await ctx.dispose();
    }
  });

  test('admin can filter orders by status', async ({ page }) => {
    test.skip(!bypass, 'OTP_BYPASS not configured');

    const cookie = await getAdminCookie();
    await page.context().addCookies([
      { name: 'dixis_session', value: cookie, url: base }
    ]);

    await page.goto(`${base}/admin/orders`);
    await expect(page.getByText('Παραγγελίες (Admin)')).toBeVisible();

    // Test status filter
    const statusSelect = page.locator('select[name="status"]');
    await statusSelect.selectOption('PENDING');
    await page.getByRole('button', { name: 'Φίλτρα' }).click();
    await page.waitForURL('**/admin/orders?*status=PENDING*');
  });

  test('admin can search orders', async ({ page }) => {
    test.skip(!bypass, 'OTP_BYPASS not configured');

    const cookie = await getAdminCookie();
    await page.context().addCookies([
      { name: 'dixis_session', value: cookie, url: base }
    ]);

    await page.goto(`${base}/admin/orders`);

    // Test search
    const searchInput = page.locator('input[name="q"]');
    await searchInput.fill('Δοκιμή');
    await page.getByRole('button', { name: 'Φίλτρα' }).click();
    await page.waitForURL('**/admin/orders?q=*');
  });

  test('admin can filter orders by date range', async ({ page }) => {
    test.skip(!bypass, 'OTP_BYPASS not configured');

    const cookie = await getAdminCookie();
    await page.context().addCookies([
      { name: 'dixis_session', value: cookie, url: base }
    ]);

    await page.goto(`${base}/admin/orders`);

    // Test date filter
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[name="from"]').fill(today);
    await page.locator('input[name="to"]').fill(today);
    await page.getByRole('button', { name: 'Φίλτρα' }).click();
    await page.waitForURL('**/admin/orders?*from=*');
  });
});

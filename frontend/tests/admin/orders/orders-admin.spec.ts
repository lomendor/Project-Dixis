import { test, expect, request as pwRequest } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';
const bypass = process.env.OTP_BYPASS || '000000';
const adminPhone = (process.env.ADMIN_PHONES || '+306900000084').split(',')[0];

async function adminCookie() {
  const ctx = await pwRequest.newContext();
  await ctx.post(base + '/api/auth/request-otp', { data: { phone: adminPhone } });
  const vr = await ctx.post(base + '/api/auth/verify-otp', { data: { phone: adminPhone, code: bypass } });
  const cookie = (await vr.headersArray()).find(h => h.name.toLowerCase() === 'set-cookie')?.value || '';
  return (cookie.split('dixis_session=')[1] || '').split(';')[0];
}

test('Admin Orders: list + filter + export CSV', async ({ page, request }) => {
  // Seed 2 orders
  for (const method of ['COURIER', 'COURIER']) {
    await request.post(base + '/api/checkout', {
      data: {
        items: [{ productId: 'seeded', qty: 1, price: 10 }],
        shipping: {
          name: 'Πελάτης',
          line1: 'Οδός 1',
          city: 'Αθήνα',
          postal: '11111',
          phone: '+306900000001',
          email: 'x@example.com',
          method
        },
        payment: { method: 'COD' }
      } as any
    });
  }

  const cookie = await adminCookie();
  await page.context().addCookies([{ name: 'dixis_session', value: cookie, url: base }]);

  await page.goto(base + '/admin/orders');
  await expect(page.getByText('Admin — Παραγγελίες')).toBeVisible();

  // Filter by status (if available)
  await page.selectOption('select', { value: 'PENDING' }).catch(() => { });
  await page.getByRole('button', { name: 'Αναζήτηση' }).click();

  // Wait for results
  await page.waitForTimeout(500);

  // Export CSV
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('a:text("Export CSV")')
  ]);

  const filename = await download.suggestedFilename();
  expect(filename).toMatch(/orders\.csv/i);
});

test('Admin Orders: pagination works', async ({ page }) => {
  const cookie = await adminCookie();
  await page.context().addCookies([{ name: 'dixis_session', value: cookie, url: base }]);

  await page.goto(base + '/admin/orders');
  await expect(page.getByText('Admin — Παραγγελίες')).toBeVisible();

  // Check pagination controls exist
  await expect(page.getByText(/Σελίδα/i)).toBeVisible();
  await expect(page.getByText(/Σύνολο:/i)).toBeVisible();
});

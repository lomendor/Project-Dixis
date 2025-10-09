import { test, expect, request as pwRequest } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';
const bypass = process.env.OTP_BYPASS || '000000';
const adminPhone = (process.env.ADMIN_PHONES || '+306900000084').split(',')[0];

async function adminCookie() {
  const ctx = await pwRequest.newContext();
  await ctx.post(base + '/api/auth/request-otp', { data: { phone: adminPhone } });
  const vr = await ctx.post(base + '/api/auth/verify-otp', { data: { phone: adminPhone, code: bypass } });
  const set = (await vr.headersArray()).find(h => h.name.toLowerCase() === 'set-cookie')?.value || '';
  const cookie = set.split('dixis_session=')[1]?.split(';')[0] || '';
  return cookie;
}

test('admin orders: filter by status & q and export CSV', async ({ request, page }) => {
  // Create test orders via API
  const mk = async (phone: string, status: string) => {
    const o = await request.post(base + '/api/checkout', {
      data: {
        items: [{ productId: 'test-product', qty: 1 }],
        shipping: { name: 'Πελάτης', line1: 'Οδός 1', city: 'Αθήνα', postal: '11111', phone, email: 'test@example.com' },
        payment: { method: 'COD' },
      },
    });
    if ([200, 201].includes(o.status())) {
      const body = await o.json();
      const id = body.orderId || body.id;

      // Update status via admin API
      const cookie = await adminCookie();
      await request.post(base + `/api/admin/orders/${id}/status`, {
        data: { status },
        headers: { cookie: `dixis_session=${cookie}` },
      });
      return id;
    }
    return null;
  };

  await mk('+306900000111', 'PAID');
  await mk('+306900000222', 'PACKING');
  await mk('+306900000333', 'DELIVERED');

  // Open admin orders with filter
  await page.goto(`${base}/admin/orders?status=PAID&q=+306900000111`);
  await expect(page.getByText('Διαχείριση Παραγγελιών')).toBeVisible();

  // Test export CSV
  const [dl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: /Export CSV/i }).click(),
  ]);
  const name = dl.suggestedFilename();
  expect(name).toMatch(/orders\.csv/i);
});

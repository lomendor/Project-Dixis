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

test('admin orders pagination: next/prev buttons change results', async ({ request, page }) => {
  // Seed 35 orders with incrementing phones
  const cookie = await adminCookie();
  const orderIds: string[] = [];

  for (let i = 1; i <= 35; i++) {
    const phone = `+30690000${String(i).padStart(4, '0')}`;
    const ord = await request.post(base + '/api/checkout', {
      data: {
        items: [{ productId: 'test-product', qty: 1 }],
        shipping: {
          name: 'Πελάτης ' + i,
          line1: 'Οδός 1',
          city: 'Αθήνα',
          postal: '11111',
          phone,
          email: 'test@example.com'
        },
        payment: { method: 'COD' },
      },
    });

    if ([200, 201].includes(ord.status())) {
      const body = await ord.json();
      const id = body.orderId || body.id;
      if (id) orderIds.push(id);
    }
  }

  // Open page 1 with 20 per page
  await page.goto(`${base}/admin/orders?page=1&perPage=20`);
  await expect(page.getByText('Διαχείριση Παραγγελιών')).toBeVisible();

  // Count rows on page 1 (should be ~20)
  const page1Rows = await page.locator('tbody tr').count();
  expect(page1Rows).toBeGreaterThanOrEqual(15); // At least 15 of our test orders

  // Get first order ID from page 1
  const firstOrderPage1 = await page.locator('tbody tr').first().locator('td').first().textContent();

  // Click "Επόμενη" to go to page 2
  await page.getByRole('link', { name: 'Επόμενη' }).click();
  await page.waitForURL(/page=2/);
  await expect(page.getByText('Σελίδα 2')).toBeVisible();

  // Get first order ID from page 2
  const firstOrderPage2 = await page.locator('tbody tr').first().locator('td').first().textContent();

  // Verify different orders on page 2
  expect(firstOrderPage2).not.toBe(firstOrderPage1);

  // Click "Προηγούμενη" to return to page 1
  await page.getByRole('link', { name: 'Προηγούμενη' }).click();
  await page.waitForURL(/page=1/);
  await expect(page.getByText('Σελίδα 1')).toBeVisible();

  // Verify we're back to same first order
  const backToPage1Order = await page.locator('tbody tr').first().locator('td').first().textContent();
  expect(backToPage1Order).toBe(firstOrderPage1);
});

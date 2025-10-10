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

test('Admin Guard: Unauthorized - API returns 401', async ({ request }) => {
  // Without admin cookie, API should return 401
  const res = await request.get(base + '/api/admin/orders');

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.ok).toBe(false);
  expect(json.message).toContain('Unauthorized');
});

test('Admin Guard: Unauthorized - Page redirects to login', async ({ page }) => {
  // Without admin cookie, admin page should redirect to login
  await page.goto(base + '/admin/orders');

  // Should redirect to login with returnUrl
  await page.waitForURL(/\/login/, { timeout: 5000 });
  const url = new URL(page.url());
  expect(url.pathname).toBe('/login');
  expect(url.searchParams.get('returnUrl')).toBe('/admin/orders');
});

test('Admin Guard: Authorized - Admin can access list and export CSV', async ({ page, request }) => {
  // Seed an order
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
        method: 'COURIER'
      },
      payment: { method: 'COD' }
    } as any
  });

  // Get admin cookie
  const cookie = await adminCookie();
  await page.context().addCookies([{ name: 'dixis_session', value: cookie, url: base }]);

  // Navigate to admin orders page
  await page.goto(base + '/admin/orders');

  // Should see the admin orders page (not redirected)
  await expect(page.getByText('Admin — Παραγγελίες')).toBeVisible();

  // Should see the orders table
  await expect(page.locator('table')).toBeVisible();

  // Should be able to export CSV
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('a:text("Export CSV")')
  ]);

  const filename = await download.suggestedFilename();
  expect(filename).toMatch(/orders\.csv/i);
});

test('Admin Guard: API with admin cookie returns data', async ({ request }) => {
  // Get admin cookie
  const cookie = await adminCookie();

  // Make API request with cookie
  const res = await request.get(base + '/api/admin/orders', {
    headers: {
      Cookie: `dixis_session=${cookie}`
    }
  });

  expect(res.status()).toBe(200);

  const json = await res.json();
  expect(json).toHaveProperty('items');
  expect(json).toHaveProperty('total');
  expect(json).toHaveProperty('page');
  expect(json).toHaveProperty('limit');
});

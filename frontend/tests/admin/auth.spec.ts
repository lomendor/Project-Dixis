import { test, expect, request as pwRequest } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';
const bypass = process.env.OTP_BYPASS || '000000';
const adminPhone = (process.env.ADMIN_PHONES || '+306900000084').split(',')[0];

async function adminCookie() {
  const ctx = await pwRequest.newContext();
  try {
    await ctx.post(base + '/api/auth/request-otp', { data: { phone: adminPhone } });
    const vr = await ctx.post(base + '/api/auth/verify-otp', {
      data: { phone: adminPhone, code: bypass }
    });
    const headers = await vr.headersArray();
    const setCookie = headers.find((h) => h.name.toLowerCase() === 'set-cookie')?.value || '';
    const match = setCookie.match(/dixis_session=([^;]+)/);
    return match ? match[1] : '';
  } finally {
    await ctx.dispose();
  }
}

test.describe('Admin Authentication Guard', () => {
  test('unauthorized user sees guard message on /admin/products', async ({ page }) => {
    test.skip(!bypass, 'OTP_BYPASS not configured');

    await page.goto(base + '/admin/products');
    await expect(page.getByText('Δεν επιτρέπεται')).toBeVisible();
  });

  test('authorized admin can view /admin/products', async ({ page }) => {
    test.skip(!bypass, 'OTP_BYPASS not configured');

    const cookie = await adminCookie();
    await page.context().addCookies([{ name: 'dixis_session', value: cookie, url: base }]);
    await page.goto(base + '/admin/products');
    // Simple indication of successful render
    await expect(page.getByText('Προϊόντα')).toBeVisible();
  });
});

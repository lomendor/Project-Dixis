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

test('Admin βλέπει λεπτομέρεια παραγγελίας & αλλάζει κατάσταση', async ({ page, request }) => {
  // Seed order via checkout
  const ord = await request.post(base + '/api/checkout', {
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

  const j = await ord.json();
  const id = j.orderId || j.id;

  if (!id) {
    console.error('No order ID returned from checkout:', j);
    throw new Error('Failed to create order for test');
  }

  // Get admin cookie
  const cookie = await adminCookie();
  await page.context().addCookies([{ name: 'dixis_session', value: cookie, url: base }]);

  // Open admin order detail page
  await page.goto(base + `/admin/orders/${id}`);

  // Should see order header
  await expect(page.getByText(new RegExp(`Order #${id}`))).toBeVisible({ timeout: 10000 });

  // Should see customer section
  await expect(page.getByText('Πελάτης')).toBeVisible();

  // Should see status section
  await expect(page.getByText(/Κατάσταση/i)).toBeVisible();

  // Change status to PACKING
  await page.selectOption('select', { value: 'PACKING' });
  await page.getByRole('button', { name: 'Ενημέρωση' }).click();

  // Wait a moment for the update
  await page.waitForTimeout(500);

  // Status section should still be visible (page refreshes data)
  await expect(page.getByText(/Κατάσταση/i)).toBeVisible();

  // Print button should exist
  await expect(page.getByRole('button', { name: 'Εκτύπωση' })).toBeVisible();
});

test('Admin order detail - Print button exists', async ({ page, request }) => {
  // Seed order
  const ord = await request.post(base + '/api/checkout', {
    data: {
      items: [{ productId: 'seeded', qty: 1, price: 10 }],
      shipping: {
        name: 'Πελάτης Test',
        line1: 'Οδός 2',
        city: 'Θεσσαλονίκη',
        postal: '54321',
        phone: '+306900000002',
        email: 'test@example.com',
        method: 'PICKUP'
      },
      payment: { method: 'COD' }
    } as any
  });

  const j = await ord.json();
  const id = j.orderId || j.id;

  if (!id) {
    throw new Error('Failed to create order for test');
  }

  // Get admin cookie
  const cookie = await adminCookie();
  await page.context().addCookies([{ name: 'dixis_session', value: cookie, url: base }]);

  // Navigate to order detail
  await page.goto(base + `/admin/orders/${id}`);

  // Verify print button exists
  await expect(page.getByRole('button', { name: 'Εκτύπωση' })).toBeVisible();

  // Verify customer link exists
  await expect(page.getByRole('link', { name: 'Προβολή πελάτη' })).toBeVisible();
});

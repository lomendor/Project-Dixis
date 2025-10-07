import { test, expect, request as pwRequest } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const adminPhone = '+306900000082';
const bypass = process.env.OTP_BYPASS || '000000';

async function adminCookie() {
  const ctx = await pwRequest.newContext();
  await ctx.post(base + '/api/auth/request-otp', { data: { phone: adminPhone } });
  const vr = await ctx.post(base + '/api/auth/verify-otp', { data: { phone: adminPhone, code: bypass } });
  const setCookieHeader = (await vr.headersArray()).find(h => h.name.toLowerCase() === 'set-cookie');
  const cookieValue = setCookieHeader?.value?.split('dixis_session=')[1]?.split(';')[0] || '';
  return cookieValue;
}

test('CSV export returns header and lines', async ({ request }) => {
  const cookie = await adminCookie();
  const res = await request.get(base + '/api/admin/orders.csv?status=&q=', {
    headers: { cookie: `dixis_session=${cookie}` }
  });
  
  expect(res.status()).toBe(200);
  const txt = await res.text();
  
  // Check BOM + header row
  expect(txt.startsWith('\uFEFFid,createdAt,status')).toBeTruthy();
  
  // Check it's valid CSV structure
  const lines = txt.split('\n');
  expect(lines.length).toBeGreaterThan(0);
  expect(lines[0]).toContain('id,createdAt,status,buyerName,buyerPhone,totalEUR');
});

test('Print view loads and displays order info', async ({ page, request }) => {
  // Create a test order first
  const sess = await adminCookie();
  const ctx = await pwRequest.newContext();
  
  // Create a product
  const pr = await ctx.post(base + '/api/me/products', {
    headers: { cookie: `dixis_session=${sess}` },
    data: {
      title: 'Print Test Product',
      category: 'Μέλι',
      price: 9.99,
      unit: 'τεμ',
      stock: 5,
      isActive: true
    }
  });
  
  expect([200, 201]).toContain(pr.status());
  const productData = await pr.json();
  const pid = productData.item?.id || productData.id;
  
  // Create an order
  const ord = await request.post(base + '/api/checkout', {
    data: {
      items: [{ productId: pid, qty: 2 }],
      shipping: {
        name: 'Test Buyer',
        line1: 'Test Address 123',
        city: 'Αθήνα',
        postal: '12345',
        phone: '+306900000083'
      }
    },
    headers: { cookie: `dixis_session=${sess}` }
  });
  
  expect([200, 201]).toContain(ord.status());
  const orderData = await ord.json();
  const orderId = orderData.orderId || orderData.id || '';
  
  expect(orderId).toBeTruthy();
  
  // Navigate to print view
  await page.context().addCookies([{ name: 'dixis_session', value: sess, url: base }]);
  await page.goto(`${base}/admin/orders/${orderId}/print`);
  
  // Check page loaded
  await expect(page.locator('h1')).toContainText('Παραγγελία #');
  
  // Check order info is displayed
  await expect(page.locator('body')).toContainText('Print Test Product');
  await expect(page.locator('body')).toContainText('Test Buyer');
  
  // Check print button exists
  await expect(page.locator('button:has-text("Εκτύπωση")')).toBeVisible();
});

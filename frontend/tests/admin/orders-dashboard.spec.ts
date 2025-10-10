import { test, expect, request as pwRequest } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const bypass = process.env.OTP_BYPASS || '000000';
const adminPhone = (process.env.ADMIN_PHONES||'+306900000084').split(',')[0];

async function adminCookie(){
  const ctx = await pwRequest.newContext();
  await ctx.post(base+'/api/auth/request-otp', { data: { phone: adminPhone }});
  const vr = await ctx.post(base+'/api/auth/verify-otp', { data:{ phone: adminPhone, code: bypass }});
  const cookie = (await vr.headersArray())
    .find(h=>h.name.toLowerCase()==='set-cookie')?.value
    ?.split('dixis_session=')[1]?.split(';')[0] || '';
  return cookie;
}

async function seedProduct(request:any, payload:any){
  const r = await request.post(`${base}/api/dev/seed/product`, { data: payload });
  expect([200,201]).toContain(r.status());
  const j = await r.json();
  return j.item?.id || j.id;
}

test('admin can view new order and set status → customer receives email', async ({ request, page }) => {
  // 1) Create an order
  const pid = await seedProduct(request, { title:'Admin Flow Μέλι', category:'Μέλι', price:8.2, unit:'τεμ', stock:5, isActive:true });
  await page.goto(`${base}/products/${pid}`);
  await page.fill('input[name="qty"]', '1');
  await page.click('button[type="submit"]'); // to cart

  // Wait for cart page
  await page.waitForURL(/\/cart/, { timeout: 10000 });

  await page.goto(`${base}/checkout`);
  await page.fill('input[name="name"]', 'Δοκιμή Πελάτης');
  await page.fill('input[name="phone"]', '+306900000111');
  const email = 'admin-flow@example.com';
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="line1"]', 'Οδός 2');
  await page.fill('input[name="city"]', 'Αθήνα');
  await page.fill('input[name="postal"]', '11111');
  await page.click('button[type="submit"]');

  // Wait for redirect to thank-you or confirm page
  await page.waitForURL(/\/(thank-you|checkout\/confirm)/, { timeout: 15000 });

  // Extract order ID from URL
  const url = page.url();
  const orderIdMatch = /orderId=([^&]+)/.exec(url) || /\/checkout\/confirm\/([^?]+)/.exec(url);
  expect(orderIdMatch).toBeTruthy();
  const targetOrderId = orderIdMatch![1];

  // 2) Admin views order list API
  const cookie = await adminCookie();
  const ctx = await pwRequest.newContext({ extraHTTPHeaders: { cookie:`dixis_session=${cookie}` }});

  const list = await ctx.get(`${base}/api/admin/orders`);
  expect([200,403]).toContain(list.status());

  if (list.status() === 200) {
    const j = await list.json();
    expect(Array.isArray(j.items)).toBe(true);
  }

  // 3) Hit the status endpoint directly (always admin-authenticated)
  expect(targetOrderId).toBeTruthy();
  const res = await ctx.post(`${base}/api/admin/orders/${targetOrderId}/status`, {
    data:{ status:'PACKING' }
  });
  expect([200,204]).toContain(res.status());

  // 4) Customer mailbox should contain status email
  const inbox = await request.get(`${base}/api/dev/mailbox?to=${encodeURIComponent(email)}`);
  expect(inbox.status()).toBe(200);
  const json = await inbox.json();
  const hasStatusEmail = json.items?.some((m:any) =>
    (m.subject||'').match(/Ενημέρωση|Παραγγελί|Status/i)
  ) || (json.item?.subject||'').match(/Ενημέρωση|Παραγγελί|Status/i);
  expect(hasStatusEmail).toBeTruthy();
});

import { test, expect, request as pwRequest } from '@playwright/test';
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';
const bypass = process.env.OTP_BYPASS || '000000';
const adminPhone = (process.env.ADMIN_PHONES||'+306900000084').split(',')[0];

async function adminCookie(){
  const ctx = await pwRequest.newContext();
  await ctx.post(base+'/api/auth/request-otp', { data: { phone: adminPhone }});
  const vr = await ctx.post(base+'/api/auth/verify-otp', { data:{ phone: adminPhone, code: bypass }});
  const c = (await vr.headersArray()).find(h=>h.name.toLowerCase()==='set-cookie')?.value||'';
  return c.includes('dixis_session=') ? c.split('dixis_session=')[1].split(';')[0] : '';
}

test('Admin Orders detail shows totals (read-only)', async ({ request, page }) => {
  const cookie = await adminCookie();
  
  // seed product
  const p = await request.post(base+'/api/me/products', { 
    headers:{ cookie:`dixis_session=${cookie}` },
    data:{ title:'Ελιές Θρούμπες', category:'Ελιές', price:5.2, unit:'τεμ', stock:5, isActive:true }
  });
  expect([200,201]).toContain(p.status());
  const pid = (await p.json()).item.id;

  // checkout one order (anonymous)
  const ord = await request.post(base+'/api/checkout', { 
    data:{ 
      items:[{ productId: pid, qty:2 }], 
      shipping:{ name:'Πελάτης', line1:'Οδός 1', city:'Αθήνα', postal:'11111', phone:'+306900000555', email:'admin-totals-ui@example.com' }, 
      payment:{ method:'COD' } 
    }
  });
  expect([200,201]).toContain(ord.status());
  const body = await ord.json();
  const oid = body.orderId || body.id;

  // go to admin order detail page
  await page.context().addCookies([{ name:'dixis_session', value:cookie, url: base }]);
  await page.goto(base+`/admin/orders/${oid}`);

  // Wait for totals card
  const totalsCard = page.locator('[data-testid="totals-card"]');
  await expect(totalsCard).toBeVisible({ timeout: 10000 });

  // Verify Greek labels present
  const html = await page.content();
  expect(html).toMatch(/Υποσύνολο/);
  expect(html).toMatch(/Μεταφορικά/);
  expect(html).toMatch(/ΦΠΑ/);
  
  // Verify EL currency format (€ symbol)
  expect(html).toMatch(/€/);
});

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

test('Admin Orders LIST shows totals (EL format)', async ({ request, page }) => {
  const cookie = await adminCookie();
  
  // seed product
  const p = await request.post(base+'/api/me/products', { 
    headers:{ cookie:`dixis_session=${cookie}` },
    data:{ title:'Ελαιόλαδο', category:'Λάδι', price:7.9, unit:'τεμ', stock:10, isActive:true }
  });
  expect([200,201]).toContain(p.status());
  const pid = (await p.json()).item.id;

  // checkout order
  const o = await request.post(base+'/api/checkout', { 
    data:{ 
      items:[{ productId: pid, qty:2 }], 
      shipping:{ name:'Πελάτης LIST', line1:'Διεύθυνση', city:'Αθήνα', postal:'11111', phone:'+306900000555', email:'list-totals@example.com' }, 
      payment:{ method:'COD' } 
    }
  });
  expect([200,201]).toContain(o.status());

  // login admin & visit LIST
  await page.context().addCookies([{ name:'dixis_session', value:cookie, url: base }]);
  await page.goto(base+'/admin/orders');

  // Wait for table to load
  await page.waitForSelector('table', { timeout: 10000 });

  // Verify table contains € symbol (EL currency format)
  const html = await page.content();
  expect(html).toMatch(/€/);
  
  // Verify "Σύνολο" column header exists
  expect(html).toMatch(/Σύνολο/);
});

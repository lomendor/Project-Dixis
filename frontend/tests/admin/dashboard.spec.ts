import { test, expect, request as pwRequest } from '@playwright/test';
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3000';
const bypass = process.env.OTP_BYPASS || '000000';
const adminPhone = (process.env.ADMIN_PHONES||'+306900000084').split(',')[0];

async function adminCookie(){
  const ctx = await pwRequest.newContext();
  await ctx.post(base+'/api/auth/request-otp', { data: { phone: adminPhone }});
  const vr = await ctx.post(base+'/api/auth/verify-otp', { data:{ phone: adminPhone, code: bypass }});
  return (await vr.headersArray()).find(h=>h.name.toLowerCase()==='set-cookie')?.value?.split('dixis_session=')[1]?.split(';')[0] || '';
}

test('admin dashboard shows KPIs sections', async ({ request, page }) => {
  // seed a small order so revenue/status counters aren't zero
  const prod = await request.post(base+'/api/me/products', { data:{ title:'Τυρί', category:'Τυριά', price:4.2, unit:'τεμ', stock:5, isActive:true }});
  const pid = (await prod.json()).item.id;
  await request.post(base+'/api/checkout', { data:{ items:[{ productId: pid, qty:1 }], shipping:{ name:'Π', line1:'Οδός', city:'Αθήνα', postal:'11111', phone:'+3069', email:'kpi@test.com' }, payment:{ method:'COD' } }});

  // login as admin
  const cookie = await adminCookie();
  await page.context().addCookies([{ name:'dixis_session', value: cookie, url: base }]);

  await page.goto(`${base}/admin`);
  await expect(page.getByText('Πίνακας Ελέγχου')).toBeVisible();
  await expect(page.getByText('Έσοδα τελευταίων 7 ημερών')).toBeVisible();
  await expect(page.getByText('Παραγγελίες (ανά status)')).toBeVisible();
  await expect(page.getByText('Χαμηλά αποθέματα')).toBeVisible();
});

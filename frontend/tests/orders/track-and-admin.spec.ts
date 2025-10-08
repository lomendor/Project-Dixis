import { test, expect, request as pwRequest } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const bypass = process.env.OTP_BYPASS || '000000';
const adminPhone = (process.env.ADMIN_PHONES||'+306900000084').split(',')[0];

async function adminCookie(){
  const ctx = await pwRequest.newContext();
  await ctx.post(base+'/api/auth/request-otp', { data: { phone: adminPhone }});
  const vr = await ctx.post(base+'/api/auth/verify-otp', { data:{ phone: adminPhone, code: bypass }});
  return (await vr.headersArray()).find(h=>h.name.toLowerCase()==='set-cookie')?.value?.split('dixis_session=')[1]?.split(';')[0] || '';
}

test('public track page shows order and updates on status change', async ({ request, page }) => {
  // seed product & order
  const prod = await request.post(base+'/api/me/products', { data:{ title:'Μέλι', category:'Παντοπωλείο', price:5.5, unit:'τεμ', stock:3, isActive:true }});
  const pid = (await prod.json()).item.id;
  const ord = await request.post(base+'/api/checkout', { data:{ items:[{ productId: pid, qty:1 }], shipping:{ name:'Πελάτης', line1:'Οδός', city:'Αθήνα', postal:'10400', phone:'+3069', email:'track@test.com' }, payment:{ method:'COD' } }});
  expect([200,201]).toContain(ord.status());
  const oid = (await ord.json()).orderId;

  // public track
  await page.goto(`${base}/orders/track/${oid}`);
  await expect(page.getByText(/Παρακολούθηση Παραγγελίας/i)).toBeVisible();
  await expect(page.getByText(/Κατάσταση/i)).toBeVisible();

  // change status as admin
  const cookie = await adminCookie();
  const res = await request.post(base+`/api/admin/orders/${oid}/status`, { data:{ status:'PACKING' }, headers:{ cookie:`dixis_session=${cookie}` }});
  expect([200,204]).toContain(res.status());

  // refresh and verify change
  await page.reload();
  await expect(page.getByText('PACKING')).toBeVisible();
});

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

test('status email uses /orders/t/<code> and reflects new status', async ({ request, page }) => {
  const email='status-token@example.com';
  // seed product & order
  const prod = await request.post(base+'/api/me/products', { data:{ title:'Χαλβάς', category:'Ζαχαρώδη', price:2.2, unit:'τεμ', stock:3, isActive:true }});
  const pid = (await prod.json()).item.id;
  const ord = await request.post(base+'/api/checkout', { data:{ items:[{ productId: pid, qty:1 }], shipping:{ name:'Π', line1:'Οδός', city:'Αθήνα', postal:'11111', phone:'+3069', email }, payment:{ method:'COD' } }});
  expect([200,201]).toContain(ord.status());
  const oid = (await ord.json()).orderId;

  // change status as admin → triggers email
  const cookie = await adminCookie();
  const res = await request.post(base+`/api/admin/orders/${oid}/status`, { data:{ status:'PACKING' }, headers:{ cookie:`dixis_session=${cookie}` }});
  expect([200,204]).toContain(res.status());

  // dev mailbox: read status email and extract /orders/t/<code>
  const inbox = await request.get(base+`/api/dev/mailbox?to=${encodeURIComponent(email)}`);
  expect(inbox.status()).toBe(200);
  const msg = await inbox.json();
  const html = String(msg.item?.html||msg.item?.text||'');
  const m = html.match(/\/orders\/t\/([a-zA-Z0-9_-]+)/);
  expect(m).not.toBeNull();
  const trackUrl = m ? m[0] : '';

  // open tracking page and verify status
  await page.goto(`${base}${trackUrl}`);
  await expect(page.getByText('PACKING')).toBeVisible();
});

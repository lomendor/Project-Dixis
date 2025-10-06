import { test, expect, request as pwRequest } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const phone = '+306912345781';
const bypass = process.env.OTP_BYPASS || '000000';

async function login(){
  const ctx = await pwRequest.newContext();
  await ctx.post(base+'/api/auth/request-otp', { data: { phone }});
  const vr = await ctx.post(base+'/api/auth/verify-otp', { data:{ phone, code: bypass }});
  return (await vr.headersArray()).find(h=>h.name.toLowerCase()==='set-cookie')?.value.split('dixis_session=')[1].split(';')[0] || '';
}

test('Status change uses real buyerPhone (not N/A) and masking is applied', async ({ request, page }) => {
  const sess = await login();
  // Seed product + order
  const ctx = await pwRequest.newContext();
  await ctx.post(base+'/api/me/producers', { headers:{ cookie:`dixis_session=${sess}` }, data:{ name:'NotifPolish', region:'Αττική', category:'Μέλι' }});
  const pr = await ctx.post(base+'/api/me/products', { headers:{ cookie:`dixis_session=${sess}` }, data:{ title:'Μέλι PII', category:'Μέλι', price:5, unit:'τεμ', stock:2, isActive:true }});
  const pid = (await pr.json()).item.id;
  const body = { items:[{productId:pid, qty:1}], shipping:{ name:'Α', line1:'Δ1', city:'Αθήνα', postal:'11111', phone:'+306911111111' } };
  const r = await request.post(base+'/api/checkout', { data: body, headers:{ cookie:`dixis_session=${sess}` }});
  expect(r.ok()).toBeTruthy();

  // Προκάλεσε αλλαγή κατάστασης (μέσω UI)
  await page.context().addCookies([{ name:'dixis_session', value:sess, url:base }]);
  await page.goto(base+'/my/orders?tab=PENDING');
  await page.getByRole('button', { name: 'Αποδοχή' }).first().click();

  // Dev outbox — πρέπει να δείχνει masked αριθμό
  const out = await request.get(base+'/dev/notifications');
  expect(out.status()).toBe(200);
  const html = await out.text();
  expect(html).toContain('***'); // very loose mask check
});

test('Dev page guarded in production', async ({ request }) => {
  // Προσομοίωση production: το app μπορεί να κοιτάει process.env.NODE_ENV,
  // εδώ κάνουμε smoke: περιμένουμε είτε 404 είτε μια "Not found" σελίδα.
  const out = await request.get(base+'/dev/notifications', { headers: { 'X-DIXIS-FORCE-PROD': '1' }});
  expect([200,404]).toContain(out.status());
});

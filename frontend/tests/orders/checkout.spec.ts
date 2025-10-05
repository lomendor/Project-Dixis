import { test, expect, request as pwRequest } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const phone = '+306912345681';
const bypass = process.env.OTP_BYPASS || '000000';

test('Checkout creates order and decreases stock', async ({ request }) => {
  // Login
  await (await pwRequest.newContext()).post(base+'/api/auth/request-otp', { data: { phone }});
  const vr = await (await pwRequest.newContext()).post(base+'/api/auth/verify-otp', { data: { phone, code: bypass }});
  const cookie = (await vr.headersArray()).find(h=>h.name.toLowerCase()==='set-cookie')?.value || '';
  const sess = cookie.split('dixis_session=')[1]?.split(';')[0];

  // Create producer & product
  await (await pwRequest.newContext()).post(base+'/api/me/producers',{
    headers:{ cookie: `dixis_session=${sess}` },
    data:{ name:'Meli Demo', region:'Αττική', category:'Μέλι' }
  }).catch(():null=>null);

  const prod = await (await pwRequest.newContext()).post(base+'/api/me/products',{
    headers:{ cookie: `dixis_session=${sess}` },
    data:{ title:'Μέλι Θυμαρίσιο', category:'Μέλι', price:12.5, unit:'τεμ', stock:10 }
  });
  const j = await prod.json();
  const productId = j.item.id;

  // Checkout
  const body = {
    items:[{productId, qty:2}],
    shipping:{ name:'Δημήτρης', line1:'Οδός 1', city:'Αθήνα', postal:'11111' }
  };
  const ck = await request.post(base+'/api/checkout',{
    data: body,
    headers:{ cookie: `dixis_session=${sess}` }
  });
  expect(ck.ok()).toBeTruthy();
  const res = await ck.json();
  expect(res.orderId).toBeTruthy();

  // Stock decreased
  const after = await (await pwRequest.newContext()).get(base+'/api/products/'+productId);
  const pj = await after.json();
  expect(pj.stock).toBe(8);

  // Appears in my orders
  const mine = await (await pwRequest.newContext()).get(base+'/api/me/orders', {
    headers:{ cookie: `dixis_session=${sess}` }
  });
  expect(mine.ok()).toBeTruthy();
  const mo = await mine.json();
  expect(mo.items.find((o:any)=>o.id===res.orderId)).toBeTruthy();

  // Producer sales list includes the item
  const sales = await (await pwRequest.newContext()).get(base+'/api/me/sales', {
    headers:{ cookie: `dixis_session=${sess}` }
  });
  expect(sales.ok()).toBeTruthy();
  const sj = await sales.json();
  expect(sj.items.some((it:any)=>it.orderId===res.orderId)).toBeTruthy();
});

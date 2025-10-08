import { test, expect } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
test('oversell prevented with OUT_OF_STOCK', async ({ request }) => {
  const prod = await request.post(base+'/api/me/products', { data:{ title:'Φέτα', category:'Τυριά', price:6, unit:'τεμ', stock:1, isActive:true }});
  const pid = (await prod.json()).item.id;
  const res = await request.post(base+'/api/checkout', { data:{ items:[{ productId: pid, qty:2 }], shipping:{ name:'Π', line1:'Οδός', city:'Αθήνα', postal:'11111', phone:'+3069', email:'oos@test.com' }, payment:{ method:'COD' } }});
  expect(res.status()).toBe(400);
  const j = await res.json();
  expect(j.error).toBe('OUT_OF_STOCK');
});

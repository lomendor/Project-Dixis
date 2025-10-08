import { test, expect } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
test('successful checkout decrements stock', async ({ request }) => {
  const prod = await request.post(base+'/api/me/products', { data:{ title:'Λάδι', category:'Παντοπωλείο', price:8, unit:'lt', stock:2, isActive:true }});
  const pid = (await prod.json()).item.id;
  const ord = await request.post(base+'/api/checkout', { data:{ items:[{ productId: pid, qty:1 }], shipping:{ name:'Π', line1:'Οδός', city:'Αθήνα', postal:'11111', phone:'+3069', email:'dec@test.com' }, payment:{ method:'COD' } }});
  expect([200,201]).toContain(ord.status());
  const after = await request.get(base+`/api/me/products/${pid}`);
  const pj = await after.json();
  expect(Number(pj.item.stock||0)).toBe(1);
});

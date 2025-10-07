import { test, expect } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

test('browse → add to cart → checkout → 201', async ({ request, page }) => {
  // seed product
  const prod = await request.post(base+'/api/me/products', { data:{ title:'Λάδι Ελιάς', category:'Παντοπωλείο', price:7.5, unit:'lt', stock:5, isActive:true }});
  const pid = (await prod.json()).item.id;

  // open product page & add to cart
  await page.goto(`${base}/products/${pid}`);
  await page.getByRole('button', { name: 'Προσθήκη στο καλάθι' }).click();

  // go to cart
  await page.goto(`${base}/cart`);
  await expect(page.getByText('Λάδι Ελιάς')).toBeVisible();

  // call checkout API manually (UI CTA οδηγεί στο /checkout που ήδη υπάρχει)
  const res = await request.post(base+'/api/checkout', { data:{ items:[{ productId: pid, qty:1 }], shipping:{ name:'Πελάτης', line1:'Οδός 1', city:'Αθήνα', postal:'11111', phone:'+306900005555', email:'cart@test.com' }, payment:{ method:'COD' } }});
  expect([200,201]).toContain(res.status());
});

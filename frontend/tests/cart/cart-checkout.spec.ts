import { test, expect, request as pwRequest } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const phone = '+306912345783';
const bypass = process.env.OTP_BYPASS || '000000';

async function login(){
  const ctx = await pwRequest.newContext();
  await ctx.post(base+'/api/auth/request-otp', { data: { phone }});
  const vr = await ctx.post(base+'/api/auth/verify-otp', { data:{ phone, code: bypass }});
  return (await vr.headersArray()).find(h=>h.name.toLowerCase()==='set-cookie')?.value.split('dixis_session=')[1].split(';')[0] || '';
}

test('Customer can add to cart and checkout', async ({ page, request }) => {
  const sess = await login();

  // Seed a product
  const ctx = await pwRequest.newContext();
  await ctx.post(base+'/api/me/producers', { headers:{ cookie:`dixis_session=${sess}` }, data:{ name:'Cart', region:'Αττική', category:'Μέλι' }});
  const pr = await ctx.post(base+'/api/me/products', { headers:{ cookie:`dixis_session=${sess}` }, data:{ title:'Μέλι Καλάθι', category:'Μέλι', price:6, unit:'τεμ', stock:3, isActive:true }});
  const pid = (await pr.json()).item.id;

  // Go to product page and add to cart
  await page.goto(`${base}/product/${pid}`);
  await page.click('text=Προσθήκη στο καλάθι');

  // Cart page shows item and subtotal
  await page.waitForURL(/\/cart/);
  await expect(page.getByRole('heading', { name: 'Καλάθι' })).toBeVisible();
  await expect(page.getByText('Μέλι Καλάθι')).toBeVisible();

  // Proceed to checkout and complete
  await page.click('text=Συνέχεια στο ταμείο');
  await page.waitForURL(/\/checkout/);
  await page.fill('input[name="name"]', 'Α');
  await page.fill('input[name="line1"]', 'Δ1');
  await page.fill('input[name="city"]', 'Αθήνα');
  await page.fill('input[name="postal"]', '11111');
  await page.fill('input[name="phone"]', '+306900000003');
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/order\/success\/.+/);
  await expect(page.getByText('Ευχαριστούμε!')).toBeVisible();
});

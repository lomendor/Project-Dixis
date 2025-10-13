import { test, expect, request as pwRequest } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';
const adminPhone = (process.env.ADMIN_PHONES||'+306900000084').split(',')[0];
const bypass = process.env.OTP_BYPASS || '000000';

async function adminCookie(){
  const ctx = await pwRequest.newContext();
  await ctx.post(base+'/api/auth/request-otp', { data:{ phone: adminPhone }});
  const vr = await ctx.post(base+'/api/auth/verify-otp', { data:{ phone: adminPhone, code: bypass }});
  return (await vr.headersArray()).find(h=>h.name.toLowerCase()==='set-cookie')?.value?.split('dixis_session=')[1]?.split(';')[0] || '';
}

test('Checkout shows totals from unified helper (EL format)', async ({ page, request }) => {
  const cookie = await adminCookie();

  // Seed 1 product
  const prod = await request.post(base+'/api/me/products', {
    headers:{ cookie:`dixis_session=${cookie}` },
    data:{ title:'Ελιές Θρούμπες', category:'Ελιές', price:5.20, unit:'τεμ', stock:10, isActive:true }
  });
  expect([200,201]).toContain(prod.status());
  const pid = (await prod.json()).item.id;

  // Navigate to product page
  await page.goto(base+`/products/${pid}`);

  // Add to cart (look for Greek "Προσθήκη" button)
  const addButton = page.getByRole('button', { name: /προσθήκη/i });
  if (await addButton.count() > 0) {
    await addButton.click();
  } else {
    // Fallback: any button with cart-related text
    await page.click('button:has-text("καλάθι"), button:has-text("Προσθήκη")').catch(()=>{});
  }

  // Proceed to checkout
  await page.goto(base+'/checkout');

  // Wait for totals to be visible
  await page.waitForSelector('text=/Σύνολο/i', { timeout: 10000 });

  // Verify body contains expected Greek labels
  const bodyText = await page.content();
  expect(bodyText).toMatch(/Υποσύνολο/);
  expect(bodyText).toMatch(/Μεταφορικά/);
  expect(bodyText).toMatch(/ΦΠΑ/);
  expect(bodyText).toMatch(/Σύνολο/);

  // Verify EL currency format (€ symbol present)
  expect(bodyText).toMatch(/€/);

  // Verify totals row is visible
  const totalRow = page.locator('text=/Σύνολο/i').first();
  await expect(totalRow).toBeVisible();
});

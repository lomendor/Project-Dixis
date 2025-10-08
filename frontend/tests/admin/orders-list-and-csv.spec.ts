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

test('admin orders list filters & csv', async ({ request, page }) => {
  // seed three orders
  const seed = async (price:number)=> {
    const prod = await request.post(base+'/api/me/products', { data:{ title:'Προϊόν', category:'Γενικά', price, unit:'τεμ', stock:10, isActive:true }});
    const pid = (await prod.json()).item.id;
    const ord = await request.post(base+'/api/checkout', { data:{ items:[{ productId: pid, qty:1 }], shipping:{ name:'Π', line1:'Οδός', city:'Αθήνα', postal:'11111', phone:'+3069', email:`admin-list-${price}@ex.com` }, payment:{ method:'COD' } }});
    return (await ord.json()).orderId;
  };
  const id1 = await seed(5.0);
  const id2 = await seed(7.0);
  const id3 = await seed(9.0);

  // admin view
  const cookie = await adminCookie();
  await page.goto(`${base}/admin/orders`, { waitUntil:'domcontentloaded' });
  await page.context().addCookies([{ name:'dixis_session', value: cookie, url: base }]);
  await page.reload();

  await expect(page.getByText('Παραγγελίες')).toBeVisible();
  await expect(page.getByText(`#${id1}`)).toBeVisible();
  await expect(page.getByText(`#${id2}`)).toBeVisible();
  await expect(page.getByText(`#${id3}`)).toBeVisible();

  // filter by status
  await page.selectOption('select[name="status"]', 'PENDING');
  await page.click('button[type="submit"]');

  // CSV endpoint (HEAD)
  const res = await request.get(`${base}/api/admin/orders/export`, { headers:{ cookie:`dixis_session=${cookie}` }});
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('text/csv');
});

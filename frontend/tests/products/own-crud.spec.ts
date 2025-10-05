import { test, expect, request as pwRequest } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const phone = '+306912345680';
const bypass = process.env.OTP_BYPASS || '000000';

async function loginAndGetCookie(){
  await (await pwRequest.newContext()).post(base+'/api/auth/request-otp', { data: { phone }});
  const vr = await (await pwRequest.newContext()).post(base+'/api/auth/verify-otp', { data: { phone, code: bypass }});
  const cookies = (await vr.headersArray()).filter(h=>h.name.toLowerCase()==='set-cookie').map(h=>h.value);
  return cookies[0] || '';
}

test('Producer can create/update/delete own product; appears on public list', async ({ page }) => {
  // Login and ensure producer profile exists
  const cookie = await loginAndGetCookie();
  await page.context().addCookies([{ name:'dixis_session', value: cookie.split('dixis_session=')[1].split(';')[0], url: base }]);

  // Create producer profile if not exists
  const ctx = await pwRequest.newContext();
  await ctx.post(base+'/api/me/producers',{
    data:{ name:'Demo Prod', region:'Αττική', category:'Μέλι' },
    headers:{ Cookie: cookie }
  }).catch(():null=>null);

  // Create product
  const createResp = await ctx.post(base+'/api/me/products',{
    data:{ title:'Μέλι Ανθέων', category:'Μέλι', price:9.9, unit:'τεμ', stock:5 },
    headers:{ Cookie: cookie }
  });
  expect(createResp.ok()).toBeTruthy();
  const created = await createResp.json();
  expect(created.item.title).toBe('Μέλι Ανθέων');

  // Update stock
  const updateResp = await ctx.patch(base+'/api/me/products/'+created.item.id,{
    data:{ stock:6 },
    headers:{ Cookie: cookie }
  });
  expect(updateResp.ok()).toBeTruthy();
  const updated = await updateResp.json();
  expect(updated.item.stock).toBe(6);

  // Public list by producer id
  const listResp = await ctx.get(base+'/api/products?producerId='+created.item.producerId);
  expect(listResp.ok()).toBeTruthy();
  const listJson = await listResp.json();
  expect(listJson.total).toBeGreaterThan(0);
  const found = listJson.items.find((i:any)=>i.id===created.item.id);
  expect(found).toBeTruthy();

  // Delete (soft)
  const deleteResp = await ctx.delete(base+'/api/me/products/'+created.item.id,{
    headers:{ Cookie: cookie }
  });
  expect(deleteResp.ok()).toBeTruthy();

  // Verify it's no longer in public list (isActive=false)
  const listAfter = await ctx.get(base+'/api/products?producerId='+created.item.producerId);
  const afterJson = await listAfter.json();
  const foundAfter = afterJson.items.find((i:any)=>i.id===created.item.id);
  expect(foundAfter).toBeFalsy();
});

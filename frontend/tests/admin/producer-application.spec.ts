import { test, expect, request as pwRequest } from '@playwright/test';
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3000';
const bypass = process.env.OTP_BYPASS || '000000';
const adminPhone = (process.env.ADMIN_PHONES||'+306900000084').split(',')[0];

async function adminCookie(){
  const ctx = await pwRequest.newContext();
  await ctx.post(base+'/api/auth/request-otp', { data: { phone: adminPhone }});
  const vr = await ctx.post(base+'/api/auth/verify-otp', { data:{ phone: adminPhone, code: bypass }});
  return (await vr.headersArray()).find(h=>h.name.toLowerCase()==='set-cookie')?.value?.split('dixis_session=')[1]?.split(';')[0] || '';
}

test('producer application submit & admin listing', async ({ request, page }) => {
  // Submit application via API
  const res = await request.post(base+'/api/producers/apply', {
    data:{
      producerName:'Παράδειγμα Παραγωγός',
      email:'prod@test.com',
      companyName:'Dixis Coop',
      afm:'123456789',
      phone:'+3069',
      categories:'Ελιές, Μέλι',
      note:'Hello'
    }
  });
  expect([200,201]).toContain(res.status());
  const { id } = await res.json();
  expect(id).toBeTruthy();

  // Login as admin and view listing
  const cookie = await adminCookie();
  await page.context().addCookies([{ name:'dixis_session', value: cookie, url: base }]);

  await page.goto(`${base}/admin/producers/applications`);
  await expect(page.getByText('Αιτήσεις Παραγωγών')).toBeVisible();
  await expect(page.getByText('Παράδειγμα Παραγωγός')).toBeVisible();

  // Click to view detail
  await page.getByText('Άνοιγμα').first().click();
  await expect(page.getByText('prod@test.com')).toBeVisible();
  await expect(page.getByText('Dixis Coop')).toBeVisible();

  // Change status to APPROVED
  await page.selectOption('select[name="status"]', 'APPROVED');
  await page.getByRole('button', { name: /Αποθήκευση/i }).click();
  await expect(page.getByText('APPROVED')).toBeVisible();
});

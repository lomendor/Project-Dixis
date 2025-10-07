import { test, expect, request as pwRequest } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const adminPhone = '+306900000084';
const bypass = process.env.OTP_BYPASS || '000000';

async function adminCookie(){
  const ctx = await pwRequest.newContext();
  await ctx.post(base+'/api/auth/request-otp', { data: { phone: adminPhone }});
  const vr = await ctx.post(base+'/api/auth/verify-otp', { data:{ phone: adminPhone, code: bypass }});
  const setCookieHeader = (await vr.headersArray()).find(h=>h.name.toLowerCase()==='set-cookie');
  const cookieValue = setCookieHeader?.value?.split('dixis_session=')[1]?.split(';')[0] || '';
  return cookieValue;
}

test('stats API returns KPIs and arrays', async ({ request }) => {
  const cookie = await adminCookie();
  const res = await request.get(base+'/api/admin/stats', { 
    headers:{ cookie:`dixis_session=${cookie}` }
  });
  
  expect(res.status()).toBe(200);
  const json = await res.json();
  
  // Verify KPIs structure
  expect(json.kpis).toBeTruthy();
  expect(typeof json.kpis.totalOrders).toBe('number');
  expect(typeof json.kpis.revenueTotal).toBe('number');
  expect(typeof json.kpis.avgOrder).toBe('number');
  expect(typeof json.kpis.ordersToday).toBe('number');
  
  // Verify status breakdown
  expect(json.status).toBeTruthy();
  expect(typeof json.status.PENDING).toBe('number');
  
  // Verify arrays
  expect(Array.isArray(json.last14d)).toBeTruthy();
  expect(json.last14d.length).toBe(14);
  
  expect(Array.isArray(json.topProducts)).toBeTruthy();
  expect(json.topProducts.length).toBeLessThanOrEqual(10);
});

test('dashboard page loads and displays KPIs', async ({ page }) => {
  const cookie = await adminCookie();
  await page.context().addCookies([{ name:'dixis_session', value:cookie, url: base }]);
  
  await page.goto(base+'/admin/dashboard');
  
  // Check heading
  await expect(page.getByRole('heading', { name: 'Πίνακας Ελέγχου' })).toBeVisible();
  
  // Check KPI cards are visible
  await expect(page.getByText('Σύνολο Παραγγελιών')).toBeVisible();
  await expect(page.getByText('Συνολικά Έσοδα')).toBeVisible();
  await expect(page.getByText('Μ.Ο. Παραγγελίας')).toBeVisible();
  await expect(page.getByText('Παραγγελίες Σήμερα')).toBeVisible();
  
  // Check sections are present
  await expect(page.getByText('Καταστάσεις Παραγγελιών')).toBeVisible();
  await expect(page.getByText('Τελευταίες 14 Ημέρες')).toBeVisible();
  await expect(page.getByText('Top Προϊόντα')).toBeVisible();
});

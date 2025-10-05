import { test, expect, request as pwRequest } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const phone = '+306912345678';
const bypass = process.env.OTP_BYPASS || '000000';

test('OTP flow → me → logout', async ({ page }) => {
  // request OTP
  const r1 = await (await pwRequest.newContext()).post(base+'/api/auth/request-otp', { data: { phone }});
  expect(r1.ok()).toBeTruthy();
  // verify OTP (use bypass)
  const r2 = await (await pwRequest.newContext()).post(base+'/api/auth/verify-otp', { data: { phone, code: bypass }});
  expect(r2.ok()).toBeTruthy();
  // set cookie into page context
  const cookies = (await r2.headersArray()).filter(h=>h.name.toLowerCase()==='set-cookie').map(h=>h.value);
  for (const c of cookies) await page.context().addCookies([{ name:'dixis_session', value: c.split('dixis_session=')[1].split(';')[0], url: base }]);
  // go to /my and see phone
  await page.goto(base+'/my');
  await expect(page.getByText(phone)).toBeVisible();
  // logout
  await page.click('text=Αποσύνδεση');
  await page.waitForURL('**/join');
});

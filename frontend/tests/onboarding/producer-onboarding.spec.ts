import { test, expect, request as pwRequest } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const phone = '+306912345679';
const bypass = process.env.OTP_BYPASS || '000000';

test('Onboarding: login → create producer → visible in public list', async ({ page }) => {
  // OTP: request + verify (bypass)
  const rc = await (await pwRequest.newContext()).post(base+'/api/auth/request-otp', { data: { phone }});
  expect(rc.ok()).toBeTruthy();
  const vr = await (await pwRequest.newContext()).post(base+'/api/auth/verify-otp', { data: { phone, code: bypass }});
  expect(vr.ok()).toBeTruthy();
  const cookies = (await vr.headersArray()).filter(h=>h.name.toLowerCase()==='set-cookie').map(h=>h.value);
  for (const c of cookies) await page.context().addCookies([{ name:'dixis_session', value: c.split('dixis_session=')[1].split(';')[0], url: base }]);

  // Go to onboarding
  await page.goto(base+'/onboarding');
  await page.fill('label:has-text("Όνομα") input', 'Μελισσοκομία Δοκιμή');
  await page.fill('label:has-text("Περιοχή") input', 'Αττική');
  await page.fill('label:has-text("Κατηγορία") input', 'Μέλι');
  await page.getByRole('button', { name: 'Συνέχεια' }).click();
  await page.getByRole('button', { name: 'Συνέχεια' }).click(); // skip optional image
  await page.getByRole('button', { name: 'Δημιουργία' }).click();

  // Public list should include our producer name
  await page.goto(base+'/producers');
  await expect(page.getByText('Μελισσοκομία Δοκιμή')).toBeVisible();
});

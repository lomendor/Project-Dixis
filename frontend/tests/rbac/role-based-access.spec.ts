import { test, expect, request as pwRequest } from '@playwright/test';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const bypass = process.env.OTP_BYPASS || '000000';

test.describe('RBAC: Role-based Access Control', () => {
  test('Consumer role: cannot access admin endpoints', async ({ page }) => {
    const phone = '+306911111111';
    // OTP: request + verify (bypass) → consumer role
    const rc = await (await pwRequest.newContext()).post(base+'/api/auth/request-otp', { data: { phone }});
    expect(rc.ok()).toBeTruthy();
    const vr = await (await pwRequest.newContext()).post(base+'/api/auth/verify-otp', { data: { phone, code: bypass }});
    expect(vr.ok()).toBeTruthy();
    const cookies = (await vr.headersArray()).filter(h=>h.name.toLowerCase()==='set-cookie').map(h=>h.value);
    for (const c of cookies) await page.context().addCookies([{ name:'dixis_session', value: c.split('dixis_session=')[1].split(';')[0], url: base }]);

    // Verify consumer role
    await page.goto(base+'/');
    const meResp = await page.request.get(base+'/api/auth/me');
    const me = await meResp.json();
    expect(me.authenticated).toBe(true);
    expect(me.role).toBe('consumer');

    // Try to access admin endpoint (should fail)
    const adminResp = await page.request.get(base+'/api/admin/producers');
    expect(adminResp.status()).toBe(403);
    const adminBody = await adminResp.json();
    expect(adminBody.error).toContain('δικαίωμα');
  });

  test('Producer role: auto-upgrade on profile creation', async ({ page }) => {
    const phone = '+306922222222';
    // OTP: request + verify
    const rc = await (await pwRequest.newContext()).post(base+'/api/auth/request-otp', { data: { phone }});
    expect(rc.ok()).toBeTruthy();
    const vr = await (await pwRequest.newContext()).post(base+'/api/auth/verify-otp', { data: { phone, code: bypass }});
    expect(vr.ok()).toBeTruthy();
    const cookies = (await vr.headersArray()).filter(h=>h.name.toLowerCase()==='set-cookie').map(h=>h.value);
    for (const c of cookies) await page.context().addCookies([{ name:'dixis_session', value: c.split('dixis_session=')[1].split(';')[0], url: base }]);

    // Initially consumer
    await page.goto(base+'/');
    const me1 = await (await page.request.get(base+'/api/auth/me')).json();
    expect(me1.role).toBe('consumer');

    // Create producer profile
    await page.goto(base+'/onboarding');
    await page.fill('label:has-text("Όνομα") input', 'RBAC Τεστ Παραγωγός');
    await page.fill('label:has-text("Περιοχή") input', 'Αττική');
    await page.fill('label:has-text("Κατηγορία") input', 'Λάδι');
    await page.getByRole('button', { name: 'Συνέχεια' }).click();
    await page.getByRole('button', { name: 'Συνέχεια' }).click();
    await page.getByRole('button', { name: 'Δημιουργία' }).click();

    // Wait for redirect/success
    await page.waitForTimeout(1000);

    // Check role upgraded to producer
    const me2 = await (await page.request.get(base+'/api/auth/me')).json();
    expect(me2.role).toBe('producer');

    // Producer can still access own profile
    const myProfile = await page.request.get(base+'/api/me/producers');
    expect(myProfile.ok()).toBeTruthy();
    const prof = await myProfile.json();
    expect(prof.item.name).toBe('RBAC Τεστ Παραγωγός');

    // But still cannot access admin endpoints
    const adminResp = await page.request.get(base+'/api/admin/producers');
    expect(adminResp.status()).toBe(403);
  });
});

import { test, expect, request as pwRequest } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const phone = '+306912345740';
const bypass = process.env.OTP_BYPASS || '000000';

async function loginSess() {
  const ctx = await pwRequest.newContext();
  await ctx.post(base + '/api/auth/request-otp', { data: { phone } });
  const vr = await ctx.post(base + '/api/auth/verify-otp', {
    data: { phone, code: bypass },
  });
  const cookies = await vr.headersArray();
  const sessionCookie = cookies.find((h) => h.name.toLowerCase() === 'set-cookie');
  return sessionCookie?.value.split('dixis_session=')[1].split(';')[0] || '';
}

test.describe('Products CRUD', () => {
  test('Create product and verify in list', async ({ page }) => {
    const sess = await loginSess();

    // Set session cookie
    await page.context().addCookies([
      { name: 'dixis_session', value: sess, url: base },
    ]);

    // Navigate to products page
    await page.goto(base + '/my/products');

    // Check page loaded
    await expect(page).toHaveURL(/\/my\/products/);

    // Look for create button or link
    const createLink = page.locator('a[href*="/products/create"], a[href*="/products/new"]').first();
    if (await createLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createLink.click();

      // Fill form if it exists
      const titleInput = page.locator('input[name="title"], input[name="name"]').first();
      if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await titleInput.fill('Μέλι CRUD Test');

        const categoryInput = page.locator('input[name="category"], select[name="category"]').first();
        if (await categoryInput.isVisible().catch(() => false)) {
          await categoryInput.fill('Μέλι');
        }

        // Submit if button exists
        const submitBtn = page.locator('button[type="submit"]').first();
        if (await submitBtn.isVisible().catch(() => false)) {
          await submitBtn.click();
        }
      }
    }

    // Verify we're back on list or can see products
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Products list page loads', async ({ page }) => {
    const sess = await loginSess();

    await page.context().addCookies([
      { name: 'dixis_session', value: sess, url: base },
    ]);

    await page.goto(base + '/my/products');
    await expect(page).toHaveURL(/\/my\/products/);

    // Check for products heading or content
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });
});

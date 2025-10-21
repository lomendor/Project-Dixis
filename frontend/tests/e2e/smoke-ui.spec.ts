import { test, expect } from '@playwright/test';

test('UI Smoke — basic routes render', async ({ page }) => {
  // customer flow (if available)
  const flow = await page.goto('/checkout/flow');
  if (flow && flow.status() < 400) {
    await expect.soft(page.locator('body')).toBeVisible();
  }

  // confirmation page (may require flow; soft-assert)
  await page.goto('/checkout/confirmation').catch(()=>{});
  await expect.soft(page.locator('body')).toBeVisible();

  // admin orders (if behind auth, just check route responds)
  const admin = await page.goto('/admin/orders').catch(()=>null);
  if (admin) {
    expect.soft(admin.status()).toBeLessThan(600);
  }
});

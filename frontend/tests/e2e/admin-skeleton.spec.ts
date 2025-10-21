import { test, expect } from '@playwright/test';

test('Admin orders shows skeleton while loading', async ({ page }) => {
  // Intercept admin orders API to simulate delay so the skeleton is visible.
  await page.route('**/api/**/orders**', async (route) => {
    await new Promise(r => setTimeout(r, 600));
    await route.continue();
  }).catch(()=>{});

  await page.goto('/admin/orders');
  // Skeleton should appear quickly
  await expect(page.getByTestId('skeleton').first()).toBeVisible();

  // After data resolves, skeleton should disappear (give generous timeout)
  await expect(page.getByTestId('skeleton')).toHaveCount(0, { timeout: 7000 });
});

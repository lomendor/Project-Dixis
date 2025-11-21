import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'https://dixis.io';

test('clicking Προσθήκη increases cart count', async ({ page }) => {
  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' });
  const addBtn = page.getByRole('button', { name: 'Προσθήκη' }).first();
  await expect(addBtn).toBeVisible();
  await addBtn.click();
  const count = page.locator('#cart-count');
  await expect(count).toHaveText(/1/);
});

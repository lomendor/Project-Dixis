import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';

test('cart page loads', async ({ page }) => {
  await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Καλάθι' })).toBeVisible();
});

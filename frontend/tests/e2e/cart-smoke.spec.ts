import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'https://dixis.gr';

test('cart page loads', async ({ page }) => {
  await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/Καλάθι/i)).toBeVisible();
});

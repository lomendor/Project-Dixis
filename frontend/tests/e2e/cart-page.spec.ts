import { test, expect } from '@playwright/test';

test('Cart page renders', async ({ page }) => {
  await page.goto('/cart');
  await expect(page.locator('h1')).toContainText('Το Καλάθι μου');
});

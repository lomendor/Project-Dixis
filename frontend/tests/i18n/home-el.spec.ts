import { test, expect } from '@playwright/test';

test.describe('[i18n] Αρχική σε ελληνικά', () => {
  test('should display Greek home page content', async ({ page }) => {
    const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Check Greek title
    await expect(page.locator('h1')).toContainText(/Dixis — Φρέσκα τοπικά προϊόντα/);

    // Check page loaded successfully
    await expect(page).toHaveTitle(/Dixis/);
  });

  test('should have Greek language attribute', async ({ page }) => {
    const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'el-GR');
  });
});

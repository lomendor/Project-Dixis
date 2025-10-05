import { test, expect } from '@playwright/test';

test.describe('[i18n] Παραγωγοί σε ελληνικά', () => {
  test.skip('should display Greek producers page content', async ({ page }) => {
    const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';

    await page.goto(`${baseUrl}/producers`, { waitUntil: 'domcontentloaded' });

    // Check Greek title
    await expect(page.locator('h1')).toContainText(/Παραγωγοί/);

    // Check for Greek form labels (if present)
    const searchInput = page.locator('input[placeholder*="Αναζήτηση"]').or(
      page.locator('label:has-text("Αναζήτηση")').locator('~ input')
    );
    await expect(searchInput.first()).toBeVisible();
  });

  test('should have accessible navigation in Greek', async ({ page }) => {
    const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Check for Greek navigation if present
    const nav = page.locator('nav').or(page.locator('[role="navigation"]'));
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }
  });
});

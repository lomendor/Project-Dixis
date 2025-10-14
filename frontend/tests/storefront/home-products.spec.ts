import { test, expect } from '@playwright/test';

test.describe('Home & Products - Greek i18n smoke test', () => {
  test('Home page: Greek hero title visible, no hydration errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Capture console errors (including hydration warnings)
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('Hydration') || msg.text().includes('hydration')) {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to home page
    await page.goto('/');

    // Wait for h1 to be visible
    const h1 = page.locator('h1.lcp-hero-title');
    await expect(h1).toBeVisible({ timeout: 10000 });

    // Verify Greek title text from home.title
    await expect(h1).toContainText('Dixis');
    await expect(h1).toContainText('Φρέσκα τοπικά προϊόντα');

    // Assert no console errors or hydration warnings
    expect(consoleErrors, `Expected no console errors, but found: ${consoleErrors.join('\n')}`).toHaveLength(0);
  });

  test('Products page: Filter labels visible, console clean', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to products page
    await page.goto('/products');

    // Wait for page title
    const pageTitle = page.locator('h1', { hasText: 'Προϊόντα' });
    await expect(pageTitle).toBeVisible({ timeout: 10000 });

    // Verify filter labels are present (products.filters.*)
    await expect(page.getByText('Φίλτρα')).toBeVisible(); // products.filters.title

    // Verify search and category inputs have Greek placeholders
    const searchInput = page.locator('input[name="q"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /Αναζήτηση/);

    // Verify apply button has Greek text
    const applyButton = page.locator('button[type="submit"]', { hasText: 'Εφαρμογή' });
    await expect(applyButton).toBeVisible();

    // Assert no console errors
    expect(consoleErrors, `Expected no console errors, but found: ${consoleErrors.join('\n')}`).toHaveLength(0);
  });
});

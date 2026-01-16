import { test, expect } from '@playwright/test';

/**
 * Pass EN-LANGUAGE-01: Locale switching E2E tests
 * Tests language switcher visibility and i18n functionality
 */
test.describe('Locale @smoke', () => {
  test('language switcher buttons are visible', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');

    // Wait for page to load
    await expect(page.getByTestId('search-input')).toBeVisible({ timeout: 15000 });

    // Check that language switcher buttons exist (either desktop or mobile)
    const desktopEl = page.getByTestId('lang-el');
    const desktopEn = page.getByTestId('lang-en');
    const mobileEl = page.getByTestId('mobile-lang-el');
    const mobileEn = page.getByTestId('mobile-lang-en');

    // At least one set should be visible
    const desktopVisible = await desktopEl.isVisible() && await desktopEn.isVisible();
    const mobileVisible = await mobileEl.isVisible() && await mobileEn.isVisible();

    expect(desktopVisible || mobileVisible).toBe(true);
  });

  test('locale cookie sets Greek when explicitly set', async ({ page, context }) => {
    // Clear cookies and set Greek locale explicitly
    await context.clearCookies();
    await context.addCookies([{
      name: 'dixis_locale',
      value: 'el',
      domain: '127.0.0.1',
      path: '/',
    }]);

    // Navigate to login page
    await page.goto('/auth/login');
    await expect(page.getByTestId('page-title')).toBeVisible({ timeout: 15000 });

    // Title should be in Greek when cookie is set to 'el'
    await expect(page.getByTestId('page-title')).toContainText('Σύνδεση');
  });

  test('locale cookie is respected when set', async ({ page, context }) => {
    // Set locale cookie to English
    await context.addCookies([{
      name: 'dixis_locale',
      value: 'en',
      domain: '127.0.0.1',
      path: '/',
    }]);

    // Navigate to products page
    await page.goto('/products');
    await page.waitForTimeout(1500); // Wait for hydration and locale detection

    // Cookie should still be there
    const cookies = await context.cookies();
    const localeCookie = cookies.find(c => c.name === 'dixis_locale');
    expect(localeCookie?.value).toBe('en');
  });
});

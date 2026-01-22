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

    // Check that language switcher buttons exist in footer
    const footerEl = page.getByTestId('footer-lang-el');
    const footerEn = page.getByTestId('footer-lang-en');

    // Footer language switcher should be visible (scroll down if needed)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(footerEl).toBeVisible({ timeout: 5000 });
    await expect(footerEn).toBeVisible({ timeout: 5000 });
  });

  test('locale cookie sets Greek when explicitly set', async ({ page, context }) => {
    // Clear all storage state to ensure clean slate (no auth tokens)
    await context.clearCookies();

    // Clear localStorage to remove any auth tokens
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Set Greek locale cookie
    await context.addCookies([{
      name: 'dixis_locale',
      value: 'el',
      domain: '127.0.0.1',
      path: '/',
    }]);

    // Navigate to login page
    await page.goto('/auth/login');

    // Wait for page to stabilize - use multiple possible indicators
    // The login form should be visible, or we should at least see Greek text somewhere
    await expect.poll(
      async () => {
        // Check for login form OR any Greek text on page
        const formVisible = await page.getByTestId('login-form').isVisible().catch(() => false);
        const pageTitle = await page.getByTestId('page-title').isVisible().catch(() => false);
        const pageContent = await page.content();
        const hasGreekText = pageContent.includes('Σύνδεση') || pageContent.includes('Είσοδος');
        return formVisible || pageTitle || hasGreekText;
      },
      { timeout: 20000, message: 'Waiting for login page to render with Greek locale' }
    ).toBe(true);

    // Verify Greek text is present on the page
    const pageContent = await page.content();
    expect(pageContent).toContain('Σύνδεση');
  });

  test('locale cookie is respected when set', async ({ page, context }) => {
    // Set locale cookie to English
    await context.addCookies([{
      name: 'dixis_locale',
      value: 'en',
      domain: '127.0.0.1',
      path: '/',
    }]);

    // Navigate to products page and wait for stable state
    await page.goto('/products', { waitUntil: 'networkidle' });

    // Wait for page content to be visible (indicates hydration complete)
    await expect(page.getByTestId('search-input')).toBeVisible({ timeout: 15000 });

    // Cookie should still be there
    const cookies = await context.cookies();
    const localeCookie = cookies.find(c => c.name === 'dixis_locale');
    expect(localeCookie?.value).toBe('en');
  });
});

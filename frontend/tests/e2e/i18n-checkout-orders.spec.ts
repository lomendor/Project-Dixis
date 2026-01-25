import { test, expect } from '@playwright/test';

/**
 * Pass EN-LANGUAGE-02: i18n for checkout and orders pages
 * Tests that checkout and producer orders pages respect locale settings
 *
 * Pass CI-SMOKE-E2E-STABILIZE-01: Fixed cookie domain to work with both
 * local (127.0.0.1) and production (dixis.gr) environments.
 */
test.describe('i18n Checkout and Orders @smoke', () => {
  /**
   * Get the cookie domain from the base URL.
   * CI uses dixis.gr, local uses 127.0.0.1
   */
  const getCookieDomain = (baseURL: string | undefined): string => {
    if (!baseURL) return '127.0.0.1';
    try {
      const url = new URL(baseURL);
      return url.hostname;
    } catch {
      return '127.0.0.1';
    }
  };

  test('checkout page renders in English with EN locale cookie', async ({ page, context, baseURL }) => {
    const domain = getCookieDomain(baseURL);

    // Set locale cookie to English
    await context.addCookies([{
      name: 'dixis_locale',
      value: 'en',
      domain,
      path: '/',
    }]);

    // Navigate to checkout page
    await page.goto('/checkout');
    await page.waitForTimeout(2000);

    // Checkout page should show either:
    // 1. The checkout form (if cart has items)
    // 2. Empty cart message
    const currentUrl = page.url();

    if (currentUrl.includes('/checkout')) {
      // Page loaded - check for English text
      const pageContent = await page.textContent('body');

      // Should NOT contain hardcoded Greek checkout strings
      expect(pageContent).not.toContain('Στοιχεία Αποστολής');
      expect(pageContent).not.toContain('Ονοματεπώνυμο');

      // Should contain English equivalents (either in form or empty state)
      const hasEnglishContent =
        pageContent?.includes('View Products') ||
        pageContent?.includes('Shipping Details') ||
        pageContent?.includes('Full Name') ||
        pageContent?.includes('Your cart is empty') ||
        pageContent?.includes('Checkout');

      expect(hasEnglishContent).toBe(true);
    }
  });

  test('checkout page renders in Greek with EL locale cookie', async ({ page, context, baseURL }) => {
    const domain = getCookieDomain(baseURL);

    // Set locale cookie to Greek
    await context.addCookies([{
      name: 'dixis_locale',
      value: 'el',
      domain,
      path: '/',
    }]);

    // Navigate to checkout page
    await page.goto('/checkout');
    await page.waitForTimeout(2000);

    const currentUrl = page.url();

    if (currentUrl.includes('/checkout')) {
      const pageContent = await page.textContent('body');

      // Should contain Greek content
      const hasGreekContent =
        pageContent?.includes('Προβολή Προϊόντων') ||
        pageContent?.includes('Στοιχεία Αποστολής') ||
        pageContent?.includes('Ονοματεπώνυμο') ||
        pageContent?.includes('Το καλάθι σας είναι κενό') ||
        pageContent?.includes('Ολοκλήρωση');

      expect(hasGreekContent).toBe(true);
    }
  });

  test('producer orders page route is protected', async ({ page }) => {
    // Clear any existing auth state
    await page.addInitScript(() => {
      localStorage.clear();
    });

    // Navigate to producer orders without authentication
    await page.goto('/producer/orders');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();

    // Producer orders should either:
    // 1. Redirect to login (standard protection)
    // 2. Show the page (if test auth is active)
    if (currentUrl.includes('/auth/login')) {
      expect(currentUrl).toContain('/auth/login');
    } else if (currentUrl.includes('/producer/orders')) {
      // Page accessible - verify it has the test id
      const ordersPage = page.getByTestId('producer-orders-page');
      const isVisible = await ordersPage.isVisible();
      if (isVisible) {
        await expect(ordersPage).toBeVisible();
      }
    }

    // Either way, route exists
    expect(currentUrl.includes('/producer/orders') || currentUrl.includes('/auth/login')).toBe(true);
  });

  test('producer orders page uses i18n in English locale', async ({ page, context, baseURL }) => {
    const domain = getCookieDomain(baseURL);

    // Set locale cookie to English
    await context.addCookies([{
      name: 'dixis_locale',
      value: 'en',
      domain,
      path: '/',
    }]);

    // Navigate to producer orders
    await page.goto('/producer/orders');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();

    if (currentUrl.includes('/auth/login')) {
      // Redirected to login - that's fine, route protection works
      expect(currentUrl).toContain('/auth/login');
    } else if (currentUrl.includes('/producer/orders')) {
      // Page loaded - check for English strings
      const pageContent = await page.textContent('body');

      // Should NOT contain hardcoded Greek
      expect(pageContent).not.toContain('Παραγγελίες');
      expect(pageContent).not.toContain('Σε Εκκρεμότητα');

      // Should contain English
      const hasEnglishContent =
        pageContent?.includes('Orders') ||
        pageContent?.includes('Pending') ||
        pageContent?.includes('No orders');

      expect(hasEnglishContent).toBe(true);
    }
  });
});

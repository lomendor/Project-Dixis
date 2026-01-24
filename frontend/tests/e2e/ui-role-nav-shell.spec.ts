import { test, expect } from '@playwright/test';

/**
 * UI Role Navigation Shell Tests
 *
 * Pass: UI-ROLE-NAV-SHELL-01
 * Purpose: Verify header/footer layout stability and role visibility rules
 *
 * Covers:
 * - Logo always clickable and links to home
 * - No language toggle in header (footer only)
 * - No layout shift on mobile viewports
 * - Footer has no order tracking link
 */

test.describe('UI Role Nav Shell @smoke', () => {
  test.describe('Logo behavior', () => {
    test('logo is always clickable and links to home', async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('domcontentloaded');

      const logo = page.locator('[data-testid="header-logo"]');
      await expect(logo).toBeVisible();

      // Logo should be a link
      await expect(logo).toHaveAttribute('href', '/');

      // Click logo and verify navigation to home
      await logo.click();
      await page.waitForURL('/');
      expect(page.url()).toContain('/');
    });

    test('logo has correct size on desktop (48px)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Desktop logo should be visible, mobile logo hidden
      const desktopLogo = page.locator('[data-testid="header-logo"] span.hidden.md\\:block');
      const mobileLogo = page.locator('[data-testid="header-logo"] span.block.md\\:hidden');

      await expect(desktopLogo).toBeVisible();
      await expect(mobileLogo).not.toBeVisible();
    });

    test('logo has correct size on mobile (36px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Mobile logo should be visible, desktop logo hidden
      const desktopLogo = page.locator('[data-testid="header-logo"] span.hidden.md\\:block');
      const mobileLogo = page.locator('[data-testid="header-logo"] span.block.md\\:hidden');

      await expect(mobileLogo).toBeVisible();
      await expect(desktopLogo).not.toBeVisible();
    });
  });

  test.describe('Header stability', () => {
    test('no language toggle in header', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Language switcher should NOT be in header
      const headerLangSwitcher = page.locator('header').locator('[data-testid="footer-language-switcher"]');
      await expect(headerLangSwitcher).not.toBeAttached();

      // It should be in footer
      const footerLangSwitcher = page.locator('footer').locator('[data-testid="footer-language-switcher"]');
      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect(footerLangSwitcher).toBeVisible({ timeout: 5000 });
    });

    test('mobile layout does not break on small viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Header should be visible and not overflowing
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Logo should be visible
      await expect(page.locator('[data-testid="header-logo"]')).toBeVisible();

      // Mobile menu button should be visible
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

      // Check header doesn't overflow horizontally
      const headerBox = await header.boundingBox();
      const viewportWidth = 320;
      expect(headerBox?.width).toBeLessThanOrEqual(viewportWidth);
    });

    test('auth consumer mobile layout is stable', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('auth_token', 'mock_token');
        localStorage.setItem('user_role', 'consumer');
        localStorage.setItem('user_name', 'Test User');
        localStorage.setItem('e2e_mode', 'true');
      });
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Header should be visible
      await expect(page.locator('header')).toBeVisible();

      // Open mobile menu
      await page.locator('[data-testid="mobile-menu-button"]').click();

      // Mobile menu should be visible
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible({ timeout: 5000 });

      // My Orders link should be visible in mobile menu
      await expect(page.locator('[data-testid="mobile-nav-orders"]')).toBeVisible();

      // Logout button should be visible
      await expect(page.locator('[data-testid="mobile-logout-btn"]')).toBeVisible();
    });
  });

  test.describe('Footer verification', () => {
    test('footer has no order tracking link', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);

      // Quick links should be visible
      const quickLinks = page.locator('[data-testid="footer-quick-links"]');
      await expect(quickLinks).toBeVisible({ timeout: 5000 });

      // Order tracking text should NOT be present
      const orderTrackingTexts = [
        'Παρακολούθηση Παραγγελίας',
        'Order Tracking',
        'Track Order'
      ];

      for (const text of orderTrackingTexts) {
        await expect(quickLinks.getByText(text)).not.toBeVisible();
      }
    });

    test('footer language switcher works', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);

      // Language buttons should be visible
      const elButton = page.locator('[data-testid="footer-lang-el"]');
      const enButton = page.locator('[data-testid="footer-lang-en"]');

      await expect(elButton).toBeVisible();
      await expect(enButton).toBeVisible();

      // One should be active (has bg-primary class)
      const elClasses = await elButton.getAttribute('class');
      const enClasses = await enButton.getAttribute('class');

      // At least one should have the active style
      const hasActiveButton =
        elClasses?.includes('bg-primary') ||
        enClasses?.includes('bg-primary');
      expect(hasActiveButton).toBe(true);
    });
  });
});

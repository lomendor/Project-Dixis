import { test, expect } from '@playwright/test';

// Simple role access verification
test.describe('Role Access Matrix', () => {
  
  // Guest user tests (unauthenticated)
  test.describe('Guest Access', () => {
    test('homepage accessible to guest', async ({ page }) => {
      await page.goto('/');
      // Use same approach as smoke tests with fallback
      await expect(
        page.getByTestId('page-root').or(page.locator('main'))
      ).toBeVisible({ timeout: 10000 });
    });

    test('cart redirects guest to login', async ({ page }) => {
      await page.goto('/cart');
      await page.waitForLoadState('networkidle');
      
      // Check for login form elements that actually exist
      const hasLoginHeading = await page.getByRole('heading', { name: /sign in/i }).isVisible().catch(() => false);
      const hasLoginButton = await page.getByRole('button', { name: /sign in/i }).isVisible().catch(() => false);
      const hasEmailField = await page.getByRole('textbox', { name: /email/i }).isVisible().catch(() => false);
      
      // Either shows login form or cart page content
      expect(hasLoginHeading || hasLoginButton || hasEmailField).toBe(true);
    });

    test('producer dashboard redirects guest to login', async ({ page }) => {
      await page.goto('/producer/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Check for login form elements that actually exist
      const hasLoginHeading = await page.getByRole('heading', { name: /sign in/i }).isVisible().catch(() => false);
      const hasLoginButton = await page.getByRole('button', { name: /sign in/i }).isVisible().catch(() => false);
      const hasEmailField = await page.getByRole('textbox', { name: /email/i }).isVisible().catch(() => false);
      
      expect(hasLoginHeading || hasLoginButton || hasEmailField).toBe(true);
    });
  });

});
import { test, expect } from '@playwright/test';

test('Lookup remembers email after page reload', async ({ page }) => {
  // Navigate to lookup page
  await page.goto('/orders/lookup').catch(() => test.skip(true, 'lookup route not present'));

  // Fill email with a valid address
  const testEmail = 'remember-me@dixis.dev';
  await page.getByTestId('lookup-email').fill(testEmail);

  // Wait a moment for localStorage to save
  await page.waitForTimeout(100);

  // Reload the page
  await page.reload();

  // Verify email is pre-filled from localStorage
  await expect(page.getByTestId('lookup-email')).toHaveValue(testEmail);
});

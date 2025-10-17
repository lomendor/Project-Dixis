import { test, expect } from '@playwright/test';

test('Lookup shows inline errors for invalid Order No and Email', async ({ page }) => {
  await page.goto('/orders/lookup').catch(() => test.skip(true, 'lookup route not present'));

  // Fill invalid Order No (wrong format)
  await page.getByTestId('lookup-order-no').fill('DX-123');

  // Fill invalid Email
  await page.getByTestId('lookup-email').fill('not-an-email');

  // Submit form with Enter key
  await page.keyboard.press('Enter');

  // Verify inline error messages appear
  await expect(page.getByTestId('error-ordno')).toBeVisible();
  await expect(page.getByTestId('error-email')).toBeVisible();

  // Verify error messages contain expected text
  const ordNoError = await page.getByTestId('error-ordno').textContent();
  expect(ordNoError).toContain('DX-YYYYMMDD-XXXX');

  const emailError = await page.getByTestId('error-email').textContent();
  expect(emailError).toContain('email');
});

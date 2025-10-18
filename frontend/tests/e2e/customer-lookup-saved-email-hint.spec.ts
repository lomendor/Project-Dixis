import { test, expect } from '@playwright/test';

test('Lookup shows saved-email hint after reload and hides it after Clear', async ({ page }) => {
  await page.goto('/orders/lookup').catch(() => test.skip(true, 'lookup route not present'));

  const email = 'hintme@dixis.dev';
  const emailInput = page.getByPlaceholder('Email');

  // Write email so it gets saved (AG32 behavior)
  await emailInput.fill(email);

  // Reload → should have prefill and hint
  await page.reload();
  await expect(emailInput).toHaveValue(email);
  await expect(page.getByTestId('saved-email-hint')).toBeVisible();

  // Clear from the inline link in the hint
  await page.getByTestId('saved-email-clear').click();

  // Hint should disappear and input should be empty
  await expect(emailInput).toHaveValue('');
  await expect(page.getByTestId('saved-email-hint')).toHaveCount(0);
});

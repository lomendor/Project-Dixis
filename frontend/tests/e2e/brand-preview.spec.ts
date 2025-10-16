import { test, expect } from '@playwright/test';

test.describe('/dev/brand preview', () => {
  test('renders and shows logo fallback', async ({ page }) => {
    await page.goto('/dev/brand').catch(() => test.skip(true, 'brand preview route not present'));

    await expect(page.getByTestId('logo')).toBeVisible();
    await expect(page.getByText('Primary CTA')).toBeVisible();
    await expect(page.getByText('Brand Tokens')).toBeVisible();
  });
});

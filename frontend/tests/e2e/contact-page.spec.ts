import { test, expect } from '@playwright/test';

test('Contact page renders and form exists', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.getByRole('heading', { name: 'Επικοινωνία' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Αποστολή' })).toBeVisible();
});

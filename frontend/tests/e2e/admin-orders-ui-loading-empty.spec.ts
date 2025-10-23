import { test, expect } from '@playwright/test';

test('Orders UI: shows loading skeleton and empty state', async ({ page }) => {
  // useApi=1 + demo = API fetch → εμφανίζεται loading
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5');
  await expect(page.getByTestId('results-count')).toBeVisible();

  // loading skeleton (aria-busy rows)
  // επιτρέπουμε να περάσει ο μίνι χρόνος (>=150ms)
  await page.waitForTimeout(50);
  const sk = page.locator('[role="row"][aria-busy]');
  await expect(sk).toHaveCountGreaterThan(0);

  // μετά το φόρτωμα, να υπάρχουν κανονικές γραμμές
  await page.waitForTimeout(300);
  await expect(sk).toHaveCount(0);

  // Empty state: βάλε φίλτρο που δεν ταιριάζει
  await page.fill('input[placeholder="Αναζήτηση (Order ID ή Πελάτης)"]', 'ZZZ-NOT-FOUND');
  await page.getByRole('button', { name: 'Εφαρμογή' }).click();
  await expect(page.getByTestId('no-results')).toBeVisible();
});

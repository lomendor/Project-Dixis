import { test, expect } from '@playwright/test';

const ids = ['1', '2', '3'];

for (const id of ids) {
  test(`product detail renders for id=${id}`, async ({ page }) => {
    await page.goto(`https://www.dixis.gr/products/${id}`, { waitUntil: 'domcontentloaded' });

    // Must NOT show the error boundary text
    await expect(page.getByText('Σφάλμα φόρτωσης προϊόντος.')).toHaveCount(0);
    await expect(page.getByText('Η σελίδα δεν βρέθηκε.')).toHaveCount(0);

    // Must show core UI evidence
    await expect(page.getByTestId('add-to-cart')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });
}

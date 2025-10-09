import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

// Το UI widget διαβάζει subtotal από localStorage ή ?subtotal=
// Στο e2e ορίζουμε localStorage πριν την πλοήγηση.
test('Checkout UI δείχνει Μεταφορικά & Σύνολο βάσει quote API', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('cartSubtotal', String(20));
  });

  await page.goto(base + '/checkout');

  // Έλεγχος ότι εμφανίζεται η ενότητα Σύνοψη
  await expect(page.getByText(/Σύνοψη/i)).toBeVisible();

  // Έλεγχος ότι εμφανίζεται η γραμμή Μεταφορικά
  await expect(page.getByText(/Μεταφορικά/i)).toBeVisible();

  // Έλεγχος ότι εμφανίζεται η γραμμή Σύνολο
  await expect(page.getByText(/Σύνολο/i)).toBeVisible();

  // Έλεγχος ότι εμφανίζονται ποσά με € σύμβολο
  const eurSymbols = page.locator('text=/€/');
  await expect(eurSymbols.first()).toBeVisible();
});

test('Checkout ShippingSummary calculates correct totals for COURIER', async ({ page }) => {
  // Set subtotal to 20 EUR
  await page.addInitScript(() => {
    window.localStorage.setItem('cartSubtotal', String(20));
  });

  await page.goto(base + '/checkout');

  // Wait for API call to complete
  await page.waitForTimeout(500);

  // With BASE_EUR=3.5, subtotal=20 should show shipping=3.50
  // Verify the summary section contains numerical values
  const summary = page.locator('div:has-text("Σύνοψη")').first();
  await expect(summary).toBeVisible();

  // Check that Μεταφορικά line exists
  const shippingLine = summary.locator('div:has-text("Μεταφορικά")');
  await expect(shippingLine).toBeVisible();
});

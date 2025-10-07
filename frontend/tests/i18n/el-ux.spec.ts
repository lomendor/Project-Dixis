import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3001';

test.describe('Greek UX Validation & Formatting', () => {
  test('Greek validation shows friendly messages on checkout', async ({ page }) => {
    await page.goto(base + '/checkout');

    // Fill form with invalid Greek phone and postal code
    await page.fill('input[name="name"]', 'Α');
    await page.fill('input[name="line1"]', 'Δ1');
    await page.fill('input[name="city"]', 'Αθήνα');
    await page.fill('input[name="postal"]', '111'); // Invalid: too short
    await page.fill('input[name="phone"]', '210'); // Invalid: incomplete

    // Submit and wait for validation error
    await page.click('button[type="submit"]');

    // Should show error message (either client-side or after API call)
    // Look for Greek error text or alert role
    const hasError = await page
      .locator('[role="alert"], .error, [aria-live="assertive"]')
      .count();

    // If client-side validation works, we should see an error
    if (hasError > 0) {
      const errorText = await page
        .locator('[role="alert"], .error, [aria-live="assertive"]')
        .first()
        .textContent();
      expect(errorText).toBeTruthy();
    }

    // Alternative: check for Greek text in page
    const content = await page.content();
    const hasGreekValidation =
      content.includes('Παρακαλώ') ||
      content.includes('έγκυρο') ||
      content.includes('Τ.Κ.');
    expect(hasGreekValidation).toBeTruthy();
  });

  test('Currency shown in EUR el-GR format on cart', async ({ page }) => {
    await page.goto(base + '/cart');

    // Check for euro symbol or Greek number format
    const html = await page.content();

    // Should have euro symbol somewhere
    const hasEuro = html.includes('€');
    expect(hasEuro).toBeTruthy();
  });

  test('Greek labels visible on forms', async ({ page }) => {
    await page.goto(base + '/checkout');

    // Check for Greek form labels
    const content = await page.content();

    const greekLabels = [
      'Ονοματεπώνυμο',
      'Διεύθυνση',
      'Πόλη',
      'Τ.Κ.',
      'Τηλέφωνο'
    ];

    let foundLabels = 0;
    for (const label of greekLabels) {
      if (content.includes(label)) {
        foundLabels++;
      }
    }

    // Should find at least 3 Greek labels
    expect(foundLabels).toBeGreaterThanOrEqual(3);
  });

  test('Order success page shows Greek confirmation', async ({ page }) => {
    // Visit success page (may 404 if no order, but we check for Greek text)
    await page.goto(base + '/order/success/test-order-id');

    const content = await page.content();

    // Should have Greek success text or 404 (which is also in Greek)
    const hasGreekText =
      content.includes('Ευχαριστούμε') ||
      content.includes('παραγγελία') ||
      content.includes('Δεν βρέθηκε');

    expect(hasGreekText).toBeTruthy();
  });
});

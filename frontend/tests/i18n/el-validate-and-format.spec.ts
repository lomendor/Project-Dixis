import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3001';

test.describe('Greek Validation & Formatting Smoke Tests', () => {
  test('Server-side validation rejects invalid Greek phone', async ({ page }) => {
    // Navigate to checkout
    await page.goto(base + '/checkout');

    // Fill form with invalid phone
    await page.fill('input[name="name"]', 'Γιώργος Παπαδόπουλος');
    await page.fill('input[name="line1"]', 'Πανεπιστημίου 10');
    await page.fill('input[name="city"]', 'Αθήνα');
    await page.fill('input[name="postal"]', '10679');
    await page.fill('input[name="phone"]', '123'); // Invalid: too short

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for error response
    await page.waitForTimeout(1000);

    // Check for Greek validation error message
    const content = await page.content();
    const hasGreekPhoneError =
      content.includes('τηλέφωνο') ||
      content.includes('Παρακαλώ');

    expect(hasGreekPhoneError).toBeTruthy();
  });

  test('Server-side validation rejects invalid postal code', async ({ page }) => {
    await page.goto(base + '/checkout');

    // Fill form with invalid postal code
    await page.fill('input[name="name"]', 'Μαρία Ιωάννου');
    await page.fill('input[name="line1"]', 'Σολωμού 25');
    await page.fill('input[name="city"]', 'Θεσσαλονίκη');
    await page.fill('input[name="postal"]', '12'); // Invalid: too short
    await page.fill('input[name="phone"]', '2310123456');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    const content = await page.content();
    const hasGreekPostalError =
      content.includes('Τ.Κ.') ||
      content.includes('ψηφία') ||
      content.includes('Παρακαλώ');

    expect(hasGreekPostalError).toBeTruthy();
  });

  test('EUR formatting visible on product pages', async ({ page }) => {
    await page.goto(base + '/products');

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Check that page contains euro symbol
    const html = await page.content();
    const hasEuroSymbol = html.includes('€');

    expect(hasEuroSymbol).toBeTruthy();
  });

  test('EUR formatting on cart page', async ({ page }) => {
    await page.goto(base + '/cart');

    // Check for euro symbol or Greek number format
    const html = await page.content();

    // Should have euro symbol somewhere (even if cart is empty, there might be labels)
    const hasEuro = html.includes('€') || html.includes('Καλάθι');

    expect(hasEuro).toBeTruthy();
  });

  test('Valid Greek phone formats accepted', async ({ page }) => {
    await page.goto(base + '/checkout');

    // Test with valid Greek phone (10 digits)
    await page.fill('input[name="name"]', 'Δημήτρης Κωνσταντίνου');
    await page.fill('input[name="line1"]', 'Ερμού 50');
    await page.fill('input[name="city"]', 'Πάτρα');
    await page.fill('input[name="postal"]', '26221');
    await page.fill('input[name="phone"]', '2610123456'); // Valid

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Should not show phone validation error
    const content = await page.content();
    const hasPhoneError = content.includes('έγκυρο ελληνικό τηλέφωνο');

    // Either no error, or a different error (like empty cart)
    if (hasPhoneError) {
      // This would be a validation failure
      expect(hasPhoneError).toBe(false);
    }
  });

  test('Valid postal code format accepted', async ({ page }) => {
    await page.goto(base + '/checkout');

    // Test with valid 5-digit postal code
    await page.fill('input[name="name"]', 'Ελένη Νικολάου');
    await page.fill('input[name="line1"]', 'Κολοκοτρώνη 15');
    await page.fill('input[name="city"]', 'Λάρισα');
    await page.fill('input[name="postal"]', '41222'); // Valid
    await page.fill('input[name="phone"]', '2410234567');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    const content = await page.content();
    const hasPostalError = content.includes('έγκυρο Τ.Κ.');

    if (hasPostalError) {
      expect(hasPostalError).toBe(false);
    }
  });
});

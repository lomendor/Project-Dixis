import { test, expect } from '@playwright/test';

test.describe('ShippingBreakdown totals behaviour', () => {
  test('totals update correctly when inputs change (debounced)', async ({ page }) => {
    await page.goto('/dev/quote-demo');

    // Initial state: wait for postal code input
    const postalInput = page.getByTestId('postal-input');
    const methodSelect = page.getByTestId('method-select');
    const shippingCostEl = page.getByTestId('shippingCost');
    const codFeeEl = page.getByTestId('codFee');

    // Fill postal code to trigger quote
    await postalInput.fill('10431');

    // Wait for quote results to appear (debounced, so give it 500ms)
    await page.waitForTimeout(500);
    await expect(shippingCostEl).toBeVisible({ timeout: 5000 });

    // Verify initial shipping cost is displayed
    const initialCost = await shippingCostEl.textContent();
    expect(initialCost).toBeTruthy();
    expect(initialCost).toMatch(/\d+,\d{2} €/); // EUR format: "3,50 €"

    // Initially COURIER - no COD fee
    await expect(codFeeEl).not.toBeVisible();

    // Change method to COURIER_COD
    await methodSelect.selectOption('COURIER_COD');

    // Wait for debounced update
    await page.waitForTimeout(500);

    // COD fee should now be visible
    await expect(codFeeEl).toBeVisible({ timeout: 5000 });
    const codFeeText = await codFeeEl.textContent();
    expect(codFeeText).toBeTruthy();
    expect(codFeeText).toMatch(/\d+,\d{2} €/); // EUR format

    // Verify shipping cost may have changed (or stayed same)
    const updatedCost = await shippingCostEl.textContent();
    expect(updatedCost).toBeTruthy();
    expect(updatedCost).toMatch(/\d+,\d{2} €/);
  });

  test('empty hint shows when postal code is too short', async ({ page }) => {
    await page.goto('/dev/quote-demo');

    const postalInput = page.getByTestId('postal-input');
    const emptyHint = page.getByTestId('empty-hint');

    // Initially empty - hint should show
    await expect(emptyHint).toBeVisible();
    await expect(emptyHint).toHaveText(/Εισάγετε Τ\.Κ\./);

    // Type 3 characters - still too short
    await postalInput.fill('104');
    await expect(emptyHint).toBeVisible();

    // Type 4 characters - hint should disappear (loading state appears)
    await postalInput.fill('1043');
    await page.waitForTimeout(500); // Wait for debounce

    // Hint should be gone (either loading or results shown)
    await expect(emptyHint).not.toBeVisible();
  });

  test('debouncing prevents rapid API calls', async ({ page }) => {
    let apiCallCount = 0;

    // Monitor API calls to /api/checkout/quote
    page.on('request', (request) => {
      if (request.url().includes('/api/checkout/quote')) {
        apiCallCount++;
      }
    });

    await page.goto('/dev/quote-demo');

    const postalInput = page.getByTestId('postal-input');

    // Rapidly type postal code (simulating user typing)
    await postalInput.fill('1');
    await postalInput.fill('10');
    await postalInput.fill('104');
    await postalInput.fill('1043');
    await postalInput.fill('10431');

    // Wait for debounce to settle (300ms + some buffer)
    await page.waitForTimeout(500);

    // Wait for potential quote results
    await page.waitForSelector('[data-testid="shippingCost"]', { timeout: 5000 }).catch(() => null);

    // Should only trigger 1-2 API calls despite 5 rapid changes
    // (Only the last value "10431" >= 4 chars triggers the call)
    expect(apiCallCount).toBeLessThanOrEqual(2);
  });
});

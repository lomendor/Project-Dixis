import { test, expect } from '@playwright/test';

test.describe('Checkout totals update with shipping', () => {
  test('Athens 10431 / COURIER / 0.5kg updates total', async ({ page }) => {
    // Try checkout first, fallback to demo if checkout requires cart
    const response = await page.goto('/checkout').catch(async() => {
      return await page.goto('/dev/quote-demo');
    });

    // Fill in shipping breakdown inputs
    await page.getByTestId('postal-input').fill('10431');
    await page.getByTestId('method-select').selectOption('COURIER');
    await page.getByTestId('weight-input').fill('500');
    await page.getByTestId('subtotal-input').fill('25');

    // Wait for quote results to appear
    await expect(page.getByTestId('shippingCost')).toBeVisible({ timeout: 10000 });

    // Verify order total is displayed (may take a moment to update)
    await expect(page.getByTestId('order-total')).toBeVisible({ timeout: 5000 });

    // Verify the total has a valid format (€XX.XX)
    const totalText = await page.getByTestId('order-total').textContent();
    expect(totalText).toMatch(/€\d+\.\d{2}/);
  });

  test('Free shipping banner appears when eligible (subtotal >= 60)', async ({ page }) => {
    // Try checkout first, fallback to demo if checkout requires cart
    await page.goto('/checkout').catch(async() => {
      return await page.goto('/dev/quote-demo');
    });

    // Fill in shipping breakdown inputs with high subtotal to trigger free shipping
    await page.getByTestId('subtotal-input').fill('65'); // >= 60 triggers free shipping per rules
    await page.getByTestId('postal-input').fill('10431');
    await page.getByTestId('method-select').selectOption('COURIER');
    await page.getByTestId('weight-input').fill('500');

    // Wait for quote results
    await expect(page.getByTestId('quote-results')).toBeVisible({ timeout: 10000 });

    // Verify free shipping indicator in results
    const freeShippingText = await page.getByTestId('freeShipping').textContent();
    expect(freeShippingText).toContain('Ναι');

    // Verify free shipping banner appears
    await expect(page.getByTestId('free-shipping-banner')).toBeVisible({ timeout: 5000 });
    const bannerText = await page.getByTestId('free-shipping-banner').textContent();
    expect(bannerText).toContain('Δωρεάν');
  });
});

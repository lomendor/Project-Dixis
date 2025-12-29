import { test, expect } from '@playwright/test';

/**
 * E2E: Payment Method Selector Tests
 *
 * Verifies PaymentMethodSelector behavior:
 * - COD option always visible
 * - Card option gated by NEXT_PUBLIC_PAYMENTS_CARD_FLAG
 */

test.describe('Payment Method Selector', () => {
  test.beforeEach(async ({ page }) => {
    // Seed cart via localStorage to get to checkout faster
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'dixis-cart',
        JSON.stringify({
          state: {
            items: {
              '1': { id: '1', title: 'Test Product', priceCents: 500, qty: 1 }
            }
          },
          version: 0
        })
      );
    });
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
  });

  test('COD payment option is always visible', async ({ page }) => {
    // COD should always be present
    const codOption = page.getByTestId('payment-cod');
    await expect(codOption).toBeVisible();

    // Verify it's checked by default
    await expect(codOption).toBeChecked();
  });

  test('Payment method can be selected', async ({ page }) => {
    const codOption = page.getByTestId('payment-cod');
    await expect(codOption).toBeVisible();

    // Click on COD (should already be selected but verify it's interactive)
    await codOption.click();
    await expect(codOption).toBeChecked();
  });

  test('Card option visible only when flag enabled', async ({ page }) => {
    // This test checks behavior based on build-time flag
    // If NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true at build time, card shows
    // Otherwise it's hidden

    const cardOption = page.getByTestId('payment-card');

    // Check if card payments are enabled in this build
    const cardEnabled = await page.evaluate(() => {
      // This returns the build-time value
      return (globalThis as any).__NEXT_DATA__?.props?.pageProps?.cardEnabled
        ?? process.env.NEXT_PUBLIC_PAYMENTS_CARD_FLAG === 'true';
    });

    if (cardEnabled) {
      await expect(cardOption).toBeVisible();
      // Verify card can be selected
      await cardOption.click();
      await expect(cardOption).toBeChecked();
    } else {
      // Card should not be visible
      await expect(cardOption).not.toBeVisible();
    }
  });

  test('Checkout form shows correct button text based on payment method', async ({ page }) => {
    const submitButton = page.getByTestId('checkout-submit');
    const codOption = page.getByTestId('payment-cod');

    // With COD selected, button should say complete order
    await codOption.click();
    await expect(submitButton).toContainText(/Ολοκλήρωση|Complete/i);

    // If card is available and selected, button text changes
    const cardOption = page.getByTestId('payment-card');
    const cardVisible = await cardOption.isVisible().catch(() => false);

    if (cardVisible) {
      await cardOption.click();
      await expect(submitButton).toContainText(/Πληρωμή|Payment/i);
    }
  });
});

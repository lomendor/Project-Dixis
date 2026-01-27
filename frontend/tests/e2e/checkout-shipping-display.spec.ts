import { test, expect, type Page } from '@playwright/test';

/**
 * Pass CHECKOUT-SHIPPING-DISPLAY-01: E2E test for shipping cost display in checkout
 *
 * Tests that when user enters a valid postal code on the checkout page,
 * the shipping quote API is called and shipping cost is displayed.
 */

// Mock shipping quote response
const MOCK_SHIPPING_QUOTE = {
  price_eur: 3.5,
  zone_name: 'Αττική',
  free_shipping: false,
  source: 'zone_based',
};

const MOCK_FREE_SHIPPING_QUOTE = {
  price_eur: 0,
  zone_name: 'Αττική',
  free_shipping: true,
  source: 'free_threshold',
};

// Helper to add items to cart via localStorage (avoids flaky product page navigation)
async function addItemsToCart(page: Page, items: Array<{ id: string; title: string; priceCents: number; qty: number }>) {
  await page.evaluate((cartItems) => {
    const cartState = {
      state: {
        items: {} as Record<string, any>,
      },
      version: 0,
    };
    for (const item of cartItems) {
      cartState.state.items[item.id] = item;
    }
    localStorage.setItem('dixis-cart', JSON.stringify(cartState));
  }, items);
}

test.describe('Checkout Shipping Display (Pass CHECKOUT-SHIPPING-DISPLAY-01)', () => {
  test.beforeEach(async ({ page }) => {
    // Add test items to cart
    await page.goto('/');
    await addItemsToCart(page, [
      { id: '1', title: 'Test Product 1', priceCents: 1500, qty: 2 },
      { id: '2', title: 'Test Product 2', priceCents: 2000, qty: 1 },
    ]);
  });

  test('shows "Εισάγετε Τ.Κ." before postal code entry', async ({ page }) => {
    await page.goto('/checkout');

    // Verify checkout page loaded
    await expect(page.getByTestId('checkout-page')).toBeVisible();

    // Shipping line should show "Εισάγετε Τ.Κ." initially
    await expect(page.getByTestId('shipping-pending')).toBeVisible();
    await expect(page.getByTestId('shipping-pending')).toHaveText('Εισάγετε Τ.Κ.');
  });

  test('fetches and displays shipping cost on valid postal code entry', async ({ page }) => {
    // Intercept shipping quote API and return mock response
    await page.route('**/api/v1/public/shipping/quote', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      // Verify request has postal_code
      expect(postData.postal_code).toBe('10671');
      expect(postData.method).toBe('HOME');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SHIPPING_QUOTE),
      });
    });

    await page.goto('/checkout');
    await expect(page.getByTestId('checkout-page')).toBeVisible();

    // Fill postal code (5 digits triggers fetch)
    const postalInput = page.getByTestId('checkout-postal');
    await postalInput.fill('10671');

    // Wait for shipping cost to appear
    await expect(page.getByTestId('shipping-cost')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('shipping-cost')).toHaveText('3,50 €');

    // Zone info should be displayed
    await expect(page.getByTestId('shipping-zone')).toBeVisible();
    await expect(page.getByTestId('shipping-zone')).toContainText('Αττική');

    // Total should include shipping (50€ subtotal + 3.50€ shipping = 53.50€)
    // Subtotal: 15€ * 2 + 20€ * 1 = 50€
    await expect(page.getByTestId('checkout-total')).toContainText('53,50');
  });

  test('shows loading state while fetching shipping quote', async ({ page }) => {
    // Intercept API with delay
    await page.route('**/api/v1/public/shipping/quote', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SHIPPING_QUOTE),
      });
    });

    await page.goto('/checkout');
    await expect(page.getByTestId('checkout-page')).toBeVisible();

    // Fill postal code
    const postalInput = page.getByTestId('checkout-postal');
    await postalInput.fill('10671');

    // Loading state should appear
    await expect(page.getByTestId('shipping-loading')).toBeVisible();
    await expect(page.getByTestId('shipping-loading')).toHaveText('Υπολογισμός...');

    // After loading, shipping cost should appear
    await expect(page.getByTestId('shipping-cost')).toBeVisible({ timeout: 5000 });
  });

  test('shows free shipping when applicable', async ({ page }) => {
    await page.route('**/api/v1/public/shipping/quote', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_FREE_SHIPPING_QUOTE),
      });
    });

    await page.goto('/checkout');
    await expect(page.getByTestId('checkout-page')).toBeVisible();

    // Fill postal code
    const postalInput = page.getByTestId('checkout-postal');
    await postalInput.fill('10671');

    // Should show "Δωρεάν" for free shipping
    await expect(page.getByTestId('shipping-cost')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('shipping-cost')).toHaveText('Δωρεάν');

    // Free shipping text should have emerald styling (checked by class)
    await expect(page.getByTestId('shipping-cost')).toHaveClass(/text-emerald-600/);
  });

  test('clears shipping quote when postal code is incomplete', async ({ page }) => {
    await page.route('**/api/v1/public/shipping/quote', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SHIPPING_QUOTE),
      });
    });

    await page.goto('/checkout');
    await expect(page.getByTestId('checkout-page')).toBeVisible();

    // Fill complete postal code first
    const postalInput = page.getByTestId('checkout-postal');
    await postalInput.fill('10671');
    await expect(page.getByTestId('shipping-cost')).toBeVisible({ timeout: 10000 });

    // Clear and enter incomplete postal code
    await postalInput.clear();
    await postalInput.fill('106');

    // Should revert to "Εισάγετε Τ.Κ."
    await expect(page.getByTestId('shipping-pending')).toBeVisible();
    await expect(page.getByTestId('shipping-cost')).not.toBeVisible();
  });

  test('handles shipping quote API error gracefully', async ({ page }) => {
    await page.route('**/api/v1/public/shipping/quote', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.goto('/checkout');
    await expect(page.getByTestId('checkout-page')).toBeVisible();

    // Fill postal code
    const postalInput = page.getByTestId('checkout-postal');
    await postalInput.fill('10671');

    // Should show "Εισάγετε Τ.Κ." (no error shown, just hides shipping until order)
    await expect(page.getByTestId('shipping-pending')).toBeVisible({ timeout: 5000 });

    // Total should still show subtotal only
    await expect(page.getByTestId('checkout-total')).toContainText('50,00');
  });

  test('total updates correctly with shipping included', async ({ page }) => {
    await page.route('**/api/v1/public/shipping/quote', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SHIPPING_QUOTE),
      });
    });

    await page.goto('/checkout');
    await expect(page.getByTestId('checkout-page')).toBeVisible();

    // Before postal code: total = subtotal
    await expect(page.getByTestId('checkout-total')).toContainText('50,00');

    // Fill postal code
    const postalInput = page.getByTestId('checkout-postal');
    await postalInput.fill('10671');

    // After shipping quote: total = subtotal + shipping
    await expect(page.getByTestId('shipping-cost')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('checkout-total')).toContainText('53,50');
  });
});

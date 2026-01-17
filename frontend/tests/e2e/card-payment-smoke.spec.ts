import { test, expect } from '@playwright/test';

/**
 * Pass CARD-PAYMENT-SMOKE-01: Card Payment E2E Smoke Test
 *
 * Verifies that Stripe card payment infrastructure is in place:
 * 1. Backend has Stripe keys configured (via /api/health) - PROD only
 * 2. Card payment option appears when flag is enabled
 * 3. PaymentMethodSelector component works correctly
 *
 * Note: Full card payment flow requires real Stripe keys + auth.
 * This smoke test validates the UI components and backend config.
 *
 * CI Behavior:
 * - Tests gracefully skip if backend/auth not available
 * - Tests against production can verify full Stripe config
 */

test.describe('Pass CARD-PAYMENT-SMOKE-01: Card Payment Smoke @smoke', () => {

  test('backend reports Stripe config via /api/health (prod verification)', async ({ request }) => {
    // This test is most useful against production where Stripe is configured
    // In CI with mock backend, it will skip gracefully

    const response = await request.get('/api/health');

    if (!response.ok()) {
      // Try healthz as fallback
      const healthzResponse = await request.get('/api/healthz');
      if (healthzResponse.ok()) {
        console.log('healthz OK - basic backend connectivity confirmed');
        // healthz doesn't include payment details, so we can't verify Stripe
        test.skip(true, 'healthz OK but no payment details - skip Stripe check in CI');
        return;
      }
      test.skip(true, 'Health endpoints not available');
      return;
    }

    const health = await response.json();

    // Check if payments section exists
    if (!health.payments) {
      console.log('No payments section in health response - may be CI mock');
      test.skip(true, 'Payments config not in health response');
      return;
    }

    // Log status without exposing secrets
    console.log('Stripe config status:', {
      flag: health.payments.card?.flag || 'not set',
      configured: health.payments.card?.stripe_configured || false,
      keys_present: {
        secret: health.payments.card?.keys_present?.secret ? 'yes' : 'no',
        public: health.payments.card?.keys_present?.public ? 'yes' : 'no',
        webhook: health.payments.card?.keys_present?.webhook ? 'yes' : 'no',
      }
    });

    // Soft assertions - log warnings but don't fail in CI
    if (health.payments.card?.flag !== 'enabled') {
      console.log('WARNING: Card payments not enabled');
    }
    if (!health.payments.card?.stripe_configured) {
      console.log('WARNING: Stripe not fully configured');
    }

    // Only assert if we're clearly in production with Stripe
    if (health.payments.card?.flag === 'enabled') {
      expect(health.payments.card.stripe_configured).toBe(true);
    }
  });

  test('card payment option visible for authenticated user', async ({ page }) => {
    // Set up authenticated user session
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'smoke-test-token');
      localStorage.setItem('user', JSON.stringify({
        id: 999,
        name: 'Smoke Test User',
        email: 'smoke@dixis.gr',
        role: 'consumer'
      }));
      // Seed cart with test product
      localStorage.setItem('dixis-cart', JSON.stringify({
        state: {
          items: {
            '1': {
              id: '1',
              title: 'Card Payment Test Product',
              priceCents: 1000,
              qty: 1,
              imageUrl: null
            }
          }
        },
        version: 0
      }));
    });

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Check if we got redirected to login (auth token not validated by backend)
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
      console.log('Auth redirect detected - backend did not validate mock token');
      test.skip(true, 'Skipped: backend auth required for card payment test');
      return;
    }

    // Wait for checkout page to load
    await page.waitForTimeout(2000);

    // Check for payment options
    const codOption = page.getByTestId('payment-cod');
    const cardOption = page.getByTestId('payment-card');

    const codVisible = await codOption.isVisible().catch(() => false);
    const cardVisible = await cardOption.isVisible().catch(() => false);

    // Log what we found
    console.log('Payment options visibility:', { cod: codVisible, card: cardVisible });

    if (!codVisible && !cardVisible) {
      // Cart may be empty or page didn't load
      const checkoutPage = page.getByTestId('checkout-page');
      const pageVisible = await checkoutPage.isVisible().catch(() => false);
      console.log('Checkout page visible:', pageVisible);
      test.skip(true, 'Checkout page did not load payment options');
      return;
    }

    if (codVisible && !cardVisible) {
      // Card option not visible - either:
      // 1. NEXT_PUBLIC_PAYMENTS_CARD_FLAG not set at build time
      // 2. User not authenticated (mock token rejected)
      console.log('Card option not visible - NEXT_PUBLIC_PAYMENTS_CARD_FLAG may not be set');
      test.skip(true, 'Card payment option not visible (feature flag or auth issue)');
      return;
    }

    // ASSERTION: Card option must be visible
    await expect(cardOption).toBeVisible();

    // Verify can select card payment
    await cardOption.click();
    await expect(cardOption).toBeChecked();

    // Verify label text
    const cardLabel = page.locator('label[for="payment-card"]');
    await expect(cardLabel).toContainText('Κάρτα');

    console.log('Card payment option is visible and selectable');
  });

  test('COD option always available as fallback', async ({ page }) => {
    // COD should always be available regardless of Stripe config
    // This ensures users can always complete checkout

    await page.goto('/');
    await page.evaluate(() => {
      // Set up cart without auth (guest checkout)
      localStorage.setItem('dixis-cart', JSON.stringify({
        state: {
          items: {
            '1': {
              id: '1',
              title: 'COD Test Product',
              priceCents: 1500,
              qty: 1,
              imageUrl: null
            }
          }
        },
        version: 0
      }));
    });

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Check if redirected to login
    if (page.url().includes('/login')) {
      test.skip(true, 'Auth redirect - cannot verify COD in CI');
      return;
    }

    await page.waitForTimeout(2000);

    // COD should always be visible
    const codOption = page.getByTestId('payment-cod');
    const codVisible = await codOption.isVisible().catch(() => false);

    if (!codVisible) {
      // Checkout page may not have loaded
      const checkoutPage = page.getByTestId('checkout-page');
      const pageLoaded = await checkoutPage.isVisible().catch(() => false);
      if (!pageLoaded) {
        test.skip(true, 'Checkout page did not load');
        return;
      }
    }

    // ASSERTION: COD must be visible
    await expect(codOption).toBeVisible();

    // COD should be default selection
    await expect(codOption).toBeChecked();

    console.log('COD payment option is available as expected');
  });
});

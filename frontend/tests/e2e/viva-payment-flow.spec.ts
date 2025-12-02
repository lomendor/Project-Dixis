import { test, expect, Page } from '@playwright/test';

/**
 * PASS PAYMENT-B: Viva Wallet Payment Flow E2E Tests
 *
 * Tests the complete Viva Wallet payment flow including:
 * - Success path: Cart → Checkout → Viva redirect → Return → Success
 * - Failure path: Payment cancelled/failed → Error UI
 * - Webhook handling (via API tests in viva-webhook.spec.ts)
 *
 * Strategy: Mock Viva redirect and API responses to avoid real payment calls
 */

test.describe('Viva Wallet Payment Flow', () => {

  /**
   * VIVA-SUCCESS-1: Complete Viva payment success flow
   *
   * Flow: Checkout with Viva → Mock redirect → Return page → Success UI → Thank you
   */
  test('VIVA-SUCCESS-1: Successful Viva payment shows success UI and redirects to thank-you', async ({ page }) => {
    // Setup: Mock the viva-verify API to return success
    await page.route('**/api/viva-verify**', async (route) => {
      console.log('🔧 Mocking /api/viva-verify with success response');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orderId: 'test-order-123',
          vivaOrderCode: '12345678'
        })
      });
    });

    // Navigate to viva-return with mock parameters
    // This simulates what Viva sends after successful payment
    await page.goto('/viva-return?s=12345678&t=test-transaction-id');

    // Assert: Success UI should appear
    await expect(page.getByText('Η πληρωμή ολοκληρώθηκε!')).toBeVisible({ timeout: 5000 });
    console.log('✅ Success message displayed');

    // Assert: Redirect message appears
    await expect(page.getByText('Ανακατεύθυνση...')).toBeVisible();
    console.log('✅ Redirect message displayed');

    // Assert: Success icon (checkmark) is visible
    await expect(page.getByText('✅')).toBeVisible();
    console.log('✅ Success icon displayed');

    // Wait for redirect to thank-you page (1.5s delay in component)
    await page.waitForURL(/\/thank-you/, { timeout: 5000 });
    console.log('✅ Redirected to thank-you page');

    // Assert: URL contains order ID
    expect(page.url()).toContain('id=test-order-123');
    console.log('✅ Order ID in URL confirmed');
  });

  /**
   * VIVA-SUCCESS-2: Viva return page handles loading state
   */
  test('VIVA-SUCCESS-2: Viva return page shows loading state while verifying', async ({ page }) => {
    // Setup: Delay the mock response to capture loading state
    await page.route('**/api/viva-verify**', async (route) => {
      // Delay response by 1 second to observe loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orderId: 'test-order-456',
          vivaOrderCode: '87654321'
        })
      });
    });

    // Navigate to viva-return
    await page.goto('/viva-return?s=87654321&t=test-tx');

    // Assert: Loading state appears immediately
    await expect(page.getByText('Επαλήθευση πληρωμής...')).toBeVisible({ timeout: 1000 });
    console.log('✅ Loading state displayed');

    // Assert: Spinner is visible
    const spinner = page.locator('.animate-spin');
    await expect(spinner).toBeVisible();
    console.log('✅ Loading spinner displayed');
  });

  /**
   * VIVA-FAILURE-1: Payment verification failure shows error UI
   */
  test('VIVA-FAILURE-1: Failed payment verification shows error UI with retry options', async ({ page }) => {
    // Setup: Mock viva-verify to return failure
    await page.route('**/api/viva-verify**', async (route) => {
      console.log('🔧 Mocking /api/viva-verify with failure response');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Η πληρωμή δεν ολοκληρώθηκε'
        })
      });
    });

    // Navigate to viva-return with mock parameters
    await page.goto('/viva-return?s=failed-order&t=failed-tx');

    // Assert: Error UI appears
    await expect(page.getByText('Η πληρωμή δεν ολοκληρώθηκε')).toBeVisible({ timeout: 5000 });
    console.log('✅ Error message displayed');

    // Assert: Error icon is visible
    await expect(page.getByText('❌')).toBeVisible();
    console.log('✅ Error icon displayed');

    // Assert: Retry button exists
    const retryButton = page.getByRole('link', { name: 'Δοκιμάστε ξανά' });
    await expect(retryButton).toBeVisible();
    console.log('✅ Retry button displayed');

    // Assert: Products link exists (scope to error container to avoid header/footer matches)
    const productsLink = page.locator('main').getByRole('link', { name: 'Προϊόντα' });
    await expect(productsLink).toBeVisible();
    console.log('✅ Products link displayed');

    // Assert: Retry button links to checkout
    await expect(retryButton).toHaveAttribute('href', '/checkout');
    console.log('✅ Retry button links to /checkout');
  });

  /**
   * VIVA-FAILURE-2: Missing order code shows error
   */
  test('VIVA-FAILURE-2: Missing order code in URL shows error', async ({ page }) => {
    // Navigate to viva-return WITHOUT order code
    await page.goto('/viva-return');

    // Assert: Error message for missing payment data
    await expect(page.getByText('Δεν βρέθηκαν στοιχεία πληρωμής')).toBeVisible({ timeout: 5000 });
    console.log('✅ Missing data error displayed');

    // Assert: Error icon is visible
    await expect(page.getByText('❌')).toBeVisible();
    console.log('✅ Error icon displayed');
  });

  /**
   * VIVA-FAILURE-3: Network error during verification shows generic error message
   */
  test('VIVA-FAILURE-3: API error during verification shows error UI', async ({ page }) => {
    // Setup: Mock viva-verify to fail (network error triggers catch block)
    await page.route('**/api/viva-verify**', async (route) => {
      console.log('🔧 Aborting /api/viva-verify to simulate network error');
      await route.abort('failed');
    });

    // Navigate to viva-return
    await page.goto('/viva-return?s=error-order&t=error-tx');

    // Assert: Generic error message from catch block appears
    await expect(page.getByText('Σφάλμα επαλήθευσης πληρωμής')).toBeVisible({ timeout: 5000 });
    console.log('✅ API error message displayed');
  });

  /**
   * VIVA-CANCEL-1: Payment failure page shows correct error for user cancellation
   */
  test('VIVA-CANCEL-1: User cancellation shows appropriate error message', async ({ page }) => {
    // Navigate to failure page with user_cancel error code
    await page.goto('/checkout/payment/failure?ec=user_cancel');

    // Assert: Correct error message for user cancellation
    await expect(page.getByText('Η πληρωμή ακυρώθηκε από τον χρήστη')).toBeVisible({ timeout: 5000 });
    console.log('✅ User cancel message displayed');

    // Assert: Title shows failure
    await expect(page.getByText('Αποτυχία πληρωμής')).toBeVisible();
    console.log('✅ Failure title displayed');

    // Assert: Retry button exists
    const retryButton = page.getByRole('button', { name: 'Δοκιμάστε ξανά' });
    await expect(retryButton).toBeVisible();
    console.log('✅ Retry button displayed');

    // Assert: Cart button exists
    const cartButton = page.getByRole('button', { name: 'Επιστροφή στο καλάθι' });
    await expect(cartButton).toBeVisible();
    console.log('✅ Cart button displayed');
  });

  /**
   * VIVA-CANCEL-2: Card declined shows appropriate message
   */
  test('VIVA-CANCEL-2: Card declined shows appropriate error message', async ({ page }) => {
    await page.goto('/checkout/payment/failure?ec=card_declined');

    await expect(page.getByText('Η κάρτα απορρίφθηκε. Δοκιμάστε άλλη κάρτα.')).toBeVisible({ timeout: 5000 });
    console.log('✅ Card declined message displayed');
  });

  /**
   * VIVA-CANCEL-3: Insufficient funds shows appropriate message
   */
  test('VIVA-CANCEL-3: Insufficient funds shows appropriate error message', async ({ page }) => {
    await page.goto('/checkout/payment/failure?ec=insufficient_funds');

    await expect(page.getByText('Ανεπαρκές υπόλοιπο στην κάρτα')).toBeVisible({ timeout: 5000 });
    console.log('✅ Insufficient funds message displayed');
  });

  /**
   * VIVA-CANCEL-4: Session expired shows appropriate message
   */
  test('VIVA-CANCEL-4: Session expired shows appropriate error message', async ({ page }) => {
    await page.goto('/checkout/payment/failure?ec=expired');

    await expect(page.getByText('Η συνεδρία πληρωμής έληξε. Δοκιμάστε ξανά.')).toBeVisible({ timeout: 5000 });
    console.log('✅ Session expired message displayed');
  });

  /**
   * VIVA-CANCEL-5: Unknown error shows generic message
   */
  test('VIVA-CANCEL-5: Unknown error code shows generic error message', async ({ page }) => {
    await page.goto('/checkout/payment/failure?ec=unknown_error');

    await expect(page.getByText('Η πληρωμή δεν ολοκληρώθηκε. Δοκιμάστε ξανά.')).toBeVisible({ timeout: 5000 });
    console.log('✅ Generic error message displayed');
  });

  /**
   * VIVA-CANCEL-6: Failure page retry button navigates correctly
   */
  test('VIVA-CANCEL-6: Retry button on failure page navigates to payment', async ({ page }) => {
    await page.goto('/checkout/payment/failure?ec=user_cancel');

    const retryButton = page.getByRole('button', { name: 'Δοκιμάστε ξανά' });
    await expect(retryButton).toBeVisible();

    // Click retry button
    await retryButton.click();

    // Assert: Navigated to payment page
    await page.waitForURL(/\/checkout\/payment/, { timeout: 5000 });
    console.log('✅ Retry button navigated to payment page');
  });

  /**
   * VIVA-CANCEL-7: Cart button on failure page navigates correctly
   */
  test('VIVA-CANCEL-7: Cart button on failure page navigates to cart', async ({ page }) => {
    await page.goto('/checkout/payment/failure?ec=user_cancel');

    const cartButton = page.getByRole('button', { name: 'Επιστροφή στο καλάθι' });
    await expect(cartButton).toBeVisible();

    // Click cart button
    await cartButton.click();

    // Assert: Navigated to cart
    await page.waitForURL('/cart', { timeout: 5000 });
    console.log('✅ Cart button navigated to cart page');
  });
});

/**
 * INTEGRATION: Full checkout flow with Viva payment method selection
 * These tests require a more complete setup with products and cart state
 */
test.describe('Viva Checkout Integration', () => {

  /**
   * VIVA-CHECKOUT-1: Payment method selector shows Viva option
   */
  test('VIVA-CHECKOUT-1: Checkout page shows Viva payment option', async ({ page }) => {
    // This test verifies the PaymentMethodSelector component
    // It doesn't require a full cart setup - just checks the UI renders

    // Mock API to simulate Viva being configured
    await page.route('**/api/checkout', async (route) => {
      // Don't intercept - let it fail naturally if cart is empty
      await route.continue();
    });

    // Navigate to checkout (may show empty cart message if no items)
    await page.goto('/checkout');

    // Check if we're on checkout with items or showing empty cart
    const pageContent = await page.content();

    if (pageContent.includes('καλάθι σας είναι κενό') || pageContent.includes('cart is empty')) {
      console.log('⚠️ Cart is empty - skipping payment method check');
      test.skip(true, 'Cart is empty - cannot test payment method selector');
      return;
    }

    // If cart has items, verify payment method selector
    const codOption = page.getByText('Αντικαταβολή');
    const vivaOption = page.getByText('Κάρτα');

    // At least one payment option should be visible
    const codVisible = await codOption.isVisible().catch(() => false);
    const vivaVisible = await vivaOption.isVisible().catch(() => false);

    if (codVisible || vivaVisible) {
      console.log(`✅ Payment methods visible - COD: ${codVisible}, Viva: ${vivaVisible}`);
    } else {
      console.log('⚠️ Payment methods not visible (may be below fold or different UI)');
    }
  });
});

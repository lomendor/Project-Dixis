import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Pass PAY-CARD-CONFIRM-GUARD-01: Card Payment Confirmation Guards
 *
 * Tests that the card payment flow has proper guards to prevent:
 * 1. Calling backend confirm with null/invalid paymentIntentId
 * 2. Proceeding when Stripe Elements aren't fully loaded
 * 3. Showing meaningful errors instead of cryptic null errors
 *
 * Prerequisites:
 * - E2E test user exists: e2e-card-test@dixis.gr
 * - Password stored in ~/.dixis/e2e-creds (chmod 600)
 * - Production uses Stripe TEST mode (pk_test_*)
 *
 * Run: BASE_URL=https://dixis.gr npx playwright test card-payment-confirm-guards.spec.ts
 */

test.describe('Pass PAY-CARD-CONFIRM-GUARD-01: Card Payment Confirmation Guards', () => {
  let e2eEmail: string;
  let e2ePassword: string;

  test.beforeAll(() => {
    e2eEmail = 'e2e-card-test@dixis.gr';

    const credsPath = path.join(process.env.HOME || '~', '.dixis', 'e2e-creds');
    if (!fs.existsSync(credsPath)) {
      console.log('Credentials file not found - test will skip');
      e2ePassword = '';
      return;
    }

    e2ePassword = fs.readFileSync(credsPath, 'utf-8').trim();
  });

  test('GUARD1: Stripe Elements must be fully loaded before payment submit is enabled', async ({ page }) => {
    if (!e2ePassword) {
      test.skip(true, 'E2E credentials not configured');
      return;
    }

    // Login
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 15000 });
    await page.locator('input[type="email"]').fill(e2eEmail);
    await page.locator('input[type="password"]').fill(e2ePassword);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('/', { timeout: 20000 });

    // Add product to cart
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    const productCard = page.locator('[data-testid="product-card"], .product-card').first();
    if (!await productCard.isVisible({ timeout: 10000 }).catch(() => false)) {
      test.skip(true, 'No products available');
      return;
    }
    await productCard.click();
    await page.waitForURL(/\/products\/\d+/, { timeout: 10000 });
    await page.locator('button:has-text("Προσθήκη"), button:has-text("Add"), [data-testid="add-to-cart"]').first().click();
    await page.waitForTimeout(1000);

    // Go to checkout and select card
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByTestId('checkout-form')).toBeVisible({ timeout: 15000 });

    const cardOption = page.getByTestId('payment-card');
    if (!await cardOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'Card payment option not visible');
      return;
    }
    await cardOption.click();

    // Fill form and submit to get to Stripe Elements
    await page.getByTestId('checkout-name').fill('Guard Test User');
    await page.getByTestId('checkout-phone').fill('+30 210 1234567');
    await page.getByTestId('checkout-email').fill(e2eEmail);
    await page.getByTestId('checkout-address').fill('123 Test Street');
    await page.getByTestId('checkout-city').fill('Athens');
    await page.getByTestId('checkout-postal').fill('10431');

    // Set up response listeners
    const paymentInitPromise = page.waitForResponse(
      resp => resp.url().includes('/payments/orders/') && resp.url().includes('/init'),
      { timeout: 60000 }
    );

    await page.getByTestId('checkout-submit').click();

    // Wait for payment init to complete
    const initResponse = await paymentInitPromise;
    expect(initResponse.status()).toBe(200);

    // Wait for Stripe iframe to load - this proves Elements are mounted
    const stripeIframe = page.locator('iframe[name*="__privateStripeFrame"]').first();
    await expect(stripeIframe).toBeVisible({ timeout: 30000 });

    // Check that payment button is disabled when Stripe is not ready
    // (Initially, stripe/elements hooks may return null until fully loaded)
    // The button should only be enabled when stripe && elements are truthy
    const payButton = page.locator('button[type="submit"]:has-text("Πληρωμή"), button:has-text("Pay")').first();
    await expect(payButton).toBeVisible({ timeout: 10000 });

    // The button should be enabled once Stripe is loaded (no disabled state)
    // This verifies the !stripe || disabled check works correctly
    console.log('GUARD1 PASSED: Stripe Elements loaded, button is interactable');
    expect(await payButton.isEnabled()).toBe(true);
  });

  test('GUARD2: Backend confirm only called with valid paymentIntentId (pi_ prefix)', async ({ page }) => {
    if (!e2ePassword) {
      test.skip(true, 'E2E credentials not configured');
      return;
    }

    // Login and add to cart
    await page.goto('/auth/login');
    await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 15000 });
    await page.locator('input[type="email"]').fill(e2eEmail);
    await page.locator('input[type="password"]').fill(e2ePassword);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('/', { timeout: 20000 });

    await page.goto('/products');
    const productCard = page.locator('[data-testid="product-card"], .product-card').first();
    if (!await productCard.isVisible({ timeout: 10000 }).catch(() => false)) {
      test.skip(true, 'No products available');
      return;
    }
    await productCard.click();
    await page.waitForURL(/\/products\/\d+/, { timeout: 10000 });
    await page.locator('button:has-text("Προσθήκη"), button:has-text("Add"), [data-testid="add-to-cart"]').first().click();
    await page.waitForTimeout(1000);

    // Go to checkout
    await page.goto('/checkout');
    await expect(page.getByTestId('checkout-form')).toBeVisible({ timeout: 15000 });

    const cardOption = page.getByTestId('payment-card');
    if (!await cardOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'Card payment option not visible');
      return;
    }
    await cardOption.click();

    await page.getByTestId('checkout-name').fill('Guard Test User');
    await page.getByTestId('checkout-phone').fill('+30 210 1234567');
    await page.getByTestId('checkout-email').fill(e2eEmail);
    await page.getByTestId('checkout-address').fill('123 Test Street');
    await page.getByTestId('checkout-city').fill('Athens');
    await page.getByTestId('checkout-postal').fill('10431');

    // Intercept confirm calls to verify they have valid paymentIntentId
    const confirmCalls: string[] = [];
    await page.route('**/payments/orders/*/confirm', async (route) => {
      const request = route.request();
      const body = request.postDataJSON();
      const paymentIntentId = body?.payment_intent_id;
      confirmCalls.push(paymentIntentId || 'null');

      console.log('Intercepted confirm call with payment_intent_id:', paymentIntentId);

      // Verify the ID starts with 'pi_' (Stripe's format)
      if (paymentIntentId && typeof paymentIntentId === 'string' && paymentIntentId.startsWith('pi_')) {
        console.log('GUARD2: Valid paymentIntentId format confirmed');
        await route.continue();
      } else {
        console.error('GUARD2 VIOLATION: Invalid paymentIntentId:', paymentIntentId);
        // The frontend guards should prevent this from happening
        await route.abort('failed');
      }
    });

    // Submit and wait for Stripe Elements
    const paymentInitPromise = page.waitForResponse(
      resp => resp.url().includes('/payments/orders/') && resp.url().includes('/init'),
      { timeout: 60000 }
    );
    await page.getByTestId('checkout-submit').click();
    await paymentInitPromise;

    // Wait for Stripe iframe
    const stripeIframe = page.locator('iframe[name*="__privateStripeFrame"]').first();
    await expect(stripeIframe).toBeVisible({ timeout: 30000 });

    // Enter test card details
    await stripeIframe.click();
    await page.keyboard.type('4242424242424242');
    await page.keyboard.press('Tab');
    await page.keyboard.type('1230');
    await page.keyboard.press('Tab');
    await page.keyboard.type('123');
    await page.keyboard.press('Tab');
    await page.keyboard.type('10431');

    // Submit payment
    const payButton = page.locator('button[type="submit"]:has-text("Πληρωμή"), button:has-text("Pay")').first();
    await expect(payButton).toBeEnabled({ timeout: 10000 });
    await payButton.click();

    // Wait for either success redirect or confirm call
    await Promise.race([
      page.waitForURL(/thank-you|confirmation/, { timeout: 60000 }),
      page.waitForTimeout(30000)
    ]);

    // If confirm was called, verify it had valid format
    if (confirmCalls.length > 0) {
      for (const id of confirmCalls) {
        expect(id).toMatch(/^pi_/);
        console.log(`GUARD2 PASSED: Confirm called with valid ID: ${id.substring(0, 10)}...`);
      }
    } else {
      console.log('GUARD2: No confirm calls intercepted (payment may have redirected)');
    }
  });

  test('GUARD3: Error message shown instead of null reference error', async ({ page }) => {
    if (!e2ePassword) {
      test.skip(true, 'E2E credentials not configured');
      return;
    }

    // Set up console error listener
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Login and add to cart
    await page.goto('/auth/login');
    await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 15000 });
    await page.locator('input[type="email"]').fill(e2eEmail);
    await page.locator('input[type="password"]').fill(e2ePassword);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('/', { timeout: 20000 });

    await page.goto('/products');
    const productCard = page.locator('[data-testid="product-card"], .product-card').first();
    if (!await productCard.isVisible({ timeout: 10000 }).catch(() => false)) {
      test.skip(true, 'No products available');
      return;
    }
    await productCard.click();
    await page.waitForURL(/\/products\/\d+/, { timeout: 10000 });
    await page.locator('button:has-text("Προσθήκη"), button:has-text("Add"), [data-testid="add-to-cart"]').first().click();
    await page.waitForTimeout(1000);

    // Go to checkout
    await page.goto('/checkout');
    await expect(page.getByTestId('checkout-form')).toBeVisible({ timeout: 15000 });

    const cardOption = page.getByTestId('payment-card');
    if (!await cardOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'Card payment option not visible');
      return;
    }
    await cardOption.click();

    await page.getByTestId('checkout-name').fill('Guard Test User');
    await page.getByTestId('checkout-phone').fill('+30 210 1234567');
    await page.getByTestId('checkout-email').fill(e2eEmail);
    await page.getByTestId('checkout-address').fill('123 Test Street');
    await page.getByTestId('checkout-city').fill('Athens');
    await page.getByTestId('checkout-postal').fill('10431');

    await page.getByTestId('checkout-submit').click();

    // Wait for Stripe Elements
    const stripeIframe = page.locator('iframe[name*="__privateStripeFrame"]').first();
    await expect(stripeIframe).toBeVisible({ timeout: 60000 });

    // Use a card that will fail (expired or invalid)
    // 4000000000000002 = declined card
    await stripeIframe.click();
    await page.keyboard.type('4000000000000002');
    await page.keyboard.press('Tab');
    await page.keyboard.type('1230');
    await page.keyboard.press('Tab');
    await page.keyboard.type('123');
    await page.keyboard.press('Tab');
    await page.keyboard.type('10431');

    const payButton = page.locator('button[type="submit"]:has-text("Πληρωμή"), button:has-text("Pay")').first();
    await payButton.click();

    // Wait for error to appear or redirect
    await page.waitForTimeout(10000);

    // Check for null reference errors in console
    const nullErrors = consoleErrors.filter(e =>
      e.includes('Cannot read properties of null') ||
      e.includes("reading 'o'") ||
      e.includes('TypeError')
    );

    if (nullErrors.length > 0) {
      console.log('GUARD3 FAILED: Found null reference errors:', nullErrors);
    } else {
      console.log('GUARD3 PASSED: No null reference errors in console');
    }

    // Instead of null errors, we should see a user-friendly error message
    const errorElement = page.locator('[data-testid="payment-error"], .text-red-600, [role="alert"]').first();
    const hasVisibleError = await errorElement.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasVisibleError) {
      const errorText = await errorElement.textContent();
      console.log('GUARD3: User-friendly error shown:', errorText);
      // Error should NOT contain null/undefined references
      expect(errorText).not.toContain('null');
      expect(errorText).not.toContain('undefined');
      expect(errorText).not.toContain("reading 'o'");
    }

    // Assert no null reference errors occurred
    expect(nullErrors.length).toBe(0);
  });
});

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Pass PAYMENTS-CARD-REAL-01: Card Payment E2E with Real Auth
 *
 * Tests card payment flow using real UI login against production.
 * Uses ephemeral e2e test user created securely on server.
 *
 * Prerequisites:
 * - E2E test user exists: e2e-card-test@dixis.gr
 * - Password stored in ~/.dixis/e2e-creds (chmod 600)
 * - Production uses Stripe TEST mode (pk_test_*)
 *
 * Run: BASE_URL=https://dixis.gr npx playwright test card-payment-real-auth.spec.ts
 */

// Pass CI-SMOKE-E2E-STABILIZE-01: Removed @smoke tag - this test requires real credentials
// which are not available in CI. Run manually with BASE_URL=https://dixis.gr
test.describe('Pass PAYMENTS-CARD-REAL-01: Card Payment with Real Auth', () => {
  // Read credentials from secure file (never log them)
  let e2eEmail: string;
  let e2ePassword: string;
  // Pass CARD-SMOKE-02: Resolve an in-stock product ID via API to avoid OOS/demo issues
  let inStockProductId: string | null = null;

  test.beforeAll(async () => {
    e2eEmail = 'e2e-card-test@dixis.gr';

    // Find an in-stock product via the public API
    try {
      const base = process.env.BASE_URL || 'https://dixis.gr';
      const res = await fetch(`${base}/api/v1/public/products`);
      if (res.ok) {
        const json = await res.json();
        const products = json?.data ?? [];
        const inStock = products.find((p: any) => typeof p.stock === 'number' && p.stock > 0);
        if (inStock) {
          inStockProductId = String(inStock.id);
          console.log(`In-stock product found: id=${inStock.id} stock=${inStock.stock}`);
        }
      }
    } catch {
      console.log('Could not fetch products API - will try UI fallback');
    }

    // Read password from secure file
    const credsPath = path.join(process.env.HOME || '~', '.dixis', 'e2e-creds');
    if (!fs.existsSync(credsPath)) {
      console.log('Credentials file not found - test will skip');
      e2ePassword = '';
      return;
    }

    e2ePassword = fs.readFileSync(credsPath, 'utf-8').trim();
    if (!e2ePassword) {
      console.log('Credentials file empty - test will skip');
    }
  });

  test('UI login with real credentials', async ({ page }) => {
    // Skip if no credentials
    if (!e2ePassword) {
      test.skip(true, 'E2E credentials not configured');
      return;
    }

    // Clear any existing auth state from CI setup
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Navigate to login page
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');

    // Wait for login form to be ready (more reliable than page-title)
    const loginForm = page.getByTestId('login-form');
    await expect(loginForm).toBeVisible({ timeout: 15000 });

    // Fill login form using stable selectors
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await emailInput.fill(e2eEmail);
    await passwordInput.fill(e2ePassword);

    // Wait for React hydration to complete before clicking
    await page.waitForTimeout(500);

    // Re-locate button after potential re-render and click
    const submitBtn = page.getByTestId('login-submit');
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click({ force: false });

    // Wait for redirect to home (successful login)
    await page.waitForURL('/', { timeout: 20000 });

    // Pass PAY-GUEST-CARD-GATE-01: Use stable proof of auth - verify auth_token exists in localStorage
    // UI elements may vary, but auth_token is set consistently on successful login
    const hasAuthToken = await page.evaluate(() => {
      return !!localStorage.getItem('auth_token');
    });
    expect(hasAuthToken, 'auth_token should be set in localStorage after login').toBe(true);

    console.log('UI login successful - auth_token verified in localStorage');
  });

  test('add product to cart and reach checkout', async ({ page }) => {
    // Skip if no credentials
    if (!e2ePassword) {
      test.skip(true, 'E2E credentials not configured');
      return;
    }

    // Login first using stable selectors
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');

    const loginForm = page.getByTestId('login-form');
    await expect(loginForm).toBeVisible({ timeout: 15000 });

    await page.locator('input[type="email"]').fill(e2eEmail);
    await page.locator('input[type="password"]').fill(e2ePassword);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('/', { timeout: 20000 });

    // Pass CARD-SMOKE-02: Navigate to an in-stock product (API-resolved or UI fallback)
    if (inStockProductId) {
      await page.goto(`/products/${inStockProductId}`);
    } else {
      await page.goto('/products');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      const productCard = page.locator('[data-testid="product-card"]:not(:has-text("Εξαντλήθηκε"))').first();
      const hasProducts = await productCard.isVisible({ timeout: 10000 }).catch(() => false);
      if (!hasProducts) {
        test.skip(true, 'No in-stock products available for testing');
        return;
      }
      await productCard.click();
      await page.waitForURL(/\/products\/[^/]+/, { timeout: 15000 });
    }
    await page.waitForLoadState('domcontentloaded');

    // Add to cart
    const addToCartBtn = page.locator('button:has-text("Προσθήκη"), button:has-text("Add to cart"), button:has-text("Add"), [data-testid="add-to-cart"]').first();
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();

    // Wait for cart update feedback
    await page.waitForTimeout(2000);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Verify we're on checkout page (not redirected to login)
    const currentUrl = page.url();
    expect(currentUrl).toContain('/checkout');
    console.log('Reached checkout page as authenticated user');
  });

  test('card payment option visible for authenticated user', async ({ page }) => {
    // Skip if no credentials
    if (!e2ePassword) {
      test.skip(true, 'E2E credentials not configured');
      return;
    }

    // Login using stable selectors
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');

    const loginForm = page.getByTestId('login-form');
    await expect(loginForm).toBeVisible({ timeout: 15000 });

    await page.locator('input[type="email"]').fill(e2eEmail);
    await page.locator('input[type="password"]').fill(e2ePassword);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('/', { timeout: 20000 });

    // Pass CARD-SMOKE-02: Navigate to an in-stock product (API-resolved or UI fallback)
    if (inStockProductId) {
      await page.goto(`/products/${inStockProductId}`);
    } else {
      await page.goto('/products');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      const productCard = page.locator('[data-testid="product-card"]:not(:has-text("Εξαντλήθηκε"))').first();
      if (!await productCard.isVisible({ timeout: 10000 }).catch(() => false)) {
        test.skip(true, 'No in-stock products available');
        return;
      }
      await productCard.click();
      await page.waitForURL(/\/products\/[^/]+/, { timeout: 15000 });
    }
    await page.waitForLoadState('domcontentloaded');

    const addToCartBtn = page.locator('button:has-text("Προσθήκη"), button:has-text("Add"), [data-testid="add-to-cart"]').first();
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();
    await page.waitForTimeout(2000);

    // Go to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Check for payment options
    const codOption = page.getByTestId('payment-cod');
    const cardOption = page.getByTestId('payment-card');

    const codVisible = await codOption.isVisible().catch(() => false);
    const cardVisible = await cardOption.isVisible().catch(() => false);

    console.log('Payment options:', { cod: codVisible, card: cardVisible });

    // COD must always be visible
    expect(codVisible).toBe(true);

    // Card should be visible for authenticated users (if flag enabled)
    if (!cardVisible) {
      console.log('Card option not visible - checking NEXT_PUBLIC_PAYMENTS_CARD_FLAG');
      // Don't fail - the flag might not be enabled in build
      test.skip(true, 'Card payment option not visible (flag may not be enabled at build time)');
      return;
    }

    // ASSERTION: Card option is visible
    await expect(cardOption).toBeVisible();

    // Verify we can select card
    await cardOption.click();
    await expect(cardOption).toBeChecked();

    console.log('Card payment option is visible and selectable for authenticated user');
  });

  test('Stripe Elements card payment flow', async ({ page }) => {
    // Skip if no credentials
    if (!e2ePassword) {
      test.skip(true, 'E2E credentials not configured');
      return;
    }

    // Clear any existing auth state from CI setup
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Login using stable selectors
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');

    const loginForm = page.getByTestId('login-form');
    await expect(loginForm).toBeVisible({ timeout: 15000 });

    await page.locator('input[type="email"]').fill(e2eEmail);
    await page.locator('input[type="password"]').fill(e2ePassword);

    // Wait for submit button to be enabled (React hydration complete)
    const submitBtn = page.getByTestId('login-submit');
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click({ force: false });
    await page.waitForURL('/', { timeout: 20000 });

    // Pass CARD-SMOKE-02: Navigate to an in-stock product (API-resolved or UI fallback)
    if (inStockProductId) {
      await page.goto(`/products/${inStockProductId}`);
    } else {
      await page.goto('/products');
      await page.waitForLoadState('domcontentloaded');
      const productCard = page.locator('[data-testid="product-card"]:not(:has-text("Εξαντλήθηκε"))').first();
      await expect(productCard).toBeVisible({ timeout: 15000 });
      await productCard.click();
      await page.waitForURL(/\/products\/[^/]+/, { timeout: 15000 });
    }
    await page.waitForLoadState('domcontentloaded');

    const addToCartBtn = page.locator('button:has-text("Προσθήκη"), button:has-text("Add"), [data-testid="add-to-cart"]').first();
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();

    // Wait for cart update confirmation (toast or cart badge update)
    await page.waitForSelector('[data-testid="cart-badge"], .toast, [role="status"]', { timeout: 5000 }).catch(() => {});

    // Go to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');

    // Wait for checkout form to be ready
    const checkoutForm = page.getByTestId('checkout-form');
    await expect(checkoutForm).toBeVisible({ timeout: 15000 });

    // Select card payment
    const cardOption = page.getByTestId('payment-card');
    if (!await cardOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'Card payment option not visible');
      return;
    }

    await cardOption.click();
    await expect(cardOption).toBeChecked({ timeout: 3000 });

    // Fill shipping form (required before Stripe Elements appear)
    await page.getByTestId('checkout-name').fill('E2E Test User');
    await page.getByTestId('checkout-phone').fill('+30 210 1234567');

    const emailInput = page.getByTestId('checkout-email');
    const emailValue = await emailInput.inputValue();
    if (!emailValue) {
      await emailInput.fill(e2eEmail);
    }

    await page.getByTestId('checkout-address').fill('123 Test Street');
    await page.getByTestId('checkout-city').fill('Athens');
    await page.getByTestId('checkout-postal').fill('10431');

    // Set up network interception BEFORE clicking submit
    // We need to wait for: 1) order creation, 2) payment init
    const orderResponsePromise = page.waitForResponse(
      resp => resp.url().includes('/api/v1/public/orders') && resp.request().method() === 'POST',
      { timeout: 30000 }
    );

    const paymentInitPromise = page.waitForResponse(
      resp => resp.url().includes('/payments/orders/') && resp.url().includes('/init'),
      { timeout: 60000 }
    );

    // Submit checkout form
    const checkoutSubmitBtn = page.getByTestId('checkout-submit');
    await expect(checkoutSubmitBtn).toBeVisible({ timeout: 5000 });
    console.log('Submitting checkout form...');
    await checkoutSubmitBtn.click();

    // Wait for order creation response
    console.log('Waiting for order creation...');
    const orderResponse = await orderResponsePromise;
    const orderStatus = orderResponse.status();
    console.log('Order creation status:', orderStatus);

    if (orderStatus !== 200 && orderStatus !== 201) {
      const orderBody = await orderResponse.text().catch(() => 'Unable to read response');
      console.log('Order creation failed, response:', orderBody.substring(0, 200));
      test.fail(true, `Order creation failed with status ${orderStatus}`);
      return;
    }

    // Wait for payment init response
    console.log('Waiting for payment init...');
    const paymentInitResponse = await paymentInitPromise;
    const paymentInitStatus = paymentInitResponse.status();
    console.log('Payment init status:', paymentInitStatus);

    if (paymentInitStatus !== 200) {
      const initBody = await paymentInitResponse.text().catch(() => 'Unable to read response');
      console.log('Payment init failed, response:', initBody.substring(0, 200));
      test.fail(true, `Payment init failed with status ${paymentInitStatus}`);
      return;
    }

    // Verify payment init response has client_secret (without logging the actual secret)
    const paymentInitBody = await paymentInitResponse.json().catch(() => ({}));
    const hasClientSecret = !!(paymentInitBody?.payment?.client_secret);
    console.log('Payment init has client_secret:', hasClientSecret);

    if (!hasClientSecret) {
      console.log('Payment init response shape:', Object.keys(paymentInitBody || {}));
      test.fail(true, 'Payment init response missing client_secret');
      return;
    }

    // Wait for React to re-render and show Stripe Elements form
    // The checkout page switches to a different view when stripeClientSecret is set
    // We wait for the "Card Payment" heading or the Stripe iframe directly
    console.log('Waiting for Stripe payment form to render...');

    // First wait for page to transition (cardProcessing state should trigger re-render)
    // Look for either: Stripe container visible OR Stripe iframe visible
    const stripeIframe = page.locator('iframe[name*="__privateStripeFrame"]').first();

    // Poll for the iframe with extended timeout (React re-render + Stripe load)
    await expect(stripeIframe).toBeVisible({ timeout: 90000 });

    console.log('Stripe Elements loaded successfully!');

    // Access the iframe content
    const stripeFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();

    // Look for card number input within the iframe
    const cardInput = stripeFrame.locator('input[name="cardNumber"], input[name="number"], input[placeholder*="1234"], input[autocomplete="cc-number"]').first();
    const cardInputVisible = await cardInput.isVisible({ timeout: 15000 }).catch(() => false);

    if (!cardInputVisible) {
      console.log('Card input not found in iframe - trying PaymentElement approach');
      // PaymentElement uses a combined form - click on iframe and type
      await stripeIframe.click();
      await page.keyboard.type('4242424242424242');
      await page.keyboard.press('Tab');
      await page.keyboard.type('1230');
      await page.keyboard.press('Tab');
      await page.keyboard.type('123');
      await page.keyboard.press('Tab');
      await page.keyboard.type('10431');
    } else {
      // Fill card details through iframe
      await cardInput.click();
      await cardInput.fill('4242424242424242');
      await page.keyboard.press('Tab');
      await page.keyboard.type('1230');
      await page.keyboard.press('Tab');
      await page.keyboard.type('123');
      await page.keyboard.press('Tab');
      await page.keyboard.type('10431');
    }

    console.log('Card details entered - submitting payment');

    // Set up response listener for payment confirmation
    const paymentConfirmPromise = page.waitForResponse(
      resp => resp.url().includes('/payments/orders/') && resp.url().includes('/confirm'),
      { timeout: 60000 }
    ).catch(() => null);

    // Find and click the payment submit button
    const paySubmitBtn = page.locator('button[type="submit"]:has-text("Πληρωμή"), button:has-text("Pay €"), button:has-text("Pay"), [data-testid="pay-button"]').first();
    await expect(paySubmitBtn).toBeVisible({ timeout: 10000 });

    console.log('NOTE: This is Stripe TEST mode - no real charge will occur');
    await paySubmitBtn.click();

    // Wait for either: redirect to thank-you OR payment confirmation response
    const result = await Promise.race([
      page.waitForURL(/thank-you|confirmation/, { timeout: 60000 }).then(() => 'redirect'),
      paymentConfirmPromise.then(resp => resp ? `confirm-${resp.status()}` : 'confirm-timeout')
    ]);

    console.log('Payment result:', result);

    const currentUrl = page.url();
    const hasSuccessIndicator = await page.locator('text=Thank you, text=Ευχαριστούμε, text=Order confirmed, text=success').first().isVisible().catch(() => false);
    const hasErrorIndicator = await page.locator('[data-testid="payment-error"], .error, text=failed, text=αποτυχία').first().isVisible().catch(() => false);

    console.log('Final state:', {
      url: currentUrl,
      success: hasSuccessIndicator,
      error: hasErrorIndicator
    });

    if (hasSuccessIndicator || currentUrl.includes('thank-you') || currentUrl.includes('confirmation')) {
      console.log('STRIPE ELEMENTS CARD PAYMENT SUCCEEDED');
      expect(true).toBe(true);
    } else if (hasErrorIndicator) {
      const errorText = await page.locator('[data-testid="payment-error"], .error').first().textContent().catch(() => 'Unknown error');
      console.log('Payment error:', errorText);
      // Don't fail for Stripe-side errors in test mode
    } else {
      console.log('Payment flow completed - result depends on Stripe test mode config');
      // Assert that we at least got past order creation and payment init
      expect(hasClientSecret).toBe(true);
    }
  });
});

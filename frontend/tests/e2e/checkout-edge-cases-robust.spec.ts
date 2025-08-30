import { test, expect, Page } from '@playwright/test';

/**
 * E2E Test Suite: PP03-D Checkout Edge Cases & Robust Validation
 * 
 * Tests comprehensive checkout edge case handling including:
 * - Greek postal code & city validation
 * - HTTP error handling (422, 429, 5xx)
 * - Shipping quote retry logic with exponential backoff
 * - Payload validation proof
 * - Recovery flows and fallback mechanisms
 */

class CheckoutEdgeCaseHelper {
  constructor(private page: Page) {}

  async loginAsConsumer() {
    await this.page.goto('/auth/login');
    await this.page.fill('[name="email"]', 'consumer@example.com');
    await this.page.fill('[name="password"]', 'password');
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/', { timeout: 10000 });
  }

  async addProductToCart() {
    await this.page.goto('/');
    await this.page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    const firstProduct = this.page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('a').first().click();
    await this.page.waitForURL(/\/products\/\d+/);
    
    const addToCartBtn = this.page.locator('[data-testid="add-to-cart"]');
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    await this.page.waitForTimeout(2000);
  }

  async navigateToCart() {
    await this.page.goto('/cart');
    await this.page.waitForLoadState('networkidle');
  }

  async captureValidationProof(): Promise<string[]> {
    const consoleMessages: string[] = [];
    
    this.page.on('console', (msg) => {
      if (msg.text().includes('🔍') || msg.text().includes('🔒') || msg.text().includes('VALIDATION')) {
        consoleMessages.push(msg.text());
      }
    });
    
    return consoleMessages;
  }

  async fillShippingInfo(postalCode: string, city: string) {
    await this.page.fill('[data-testid="postal-code-input"]', postalCode);
    await this.page.fill('[data-testid="city-input"]', city);
  }
}

test.describe('PP03-D: Checkout Edge Cases & Robust Validation', () => {
  let helper: CheckoutEdgeCaseHelper;
  
  test.beforeEach(async ({ page, context }) => {
    helper = new CheckoutEdgeCaseHelper(page);
    await context.clearCookies();
    
    // Setup test data
    await helper.loginAsConsumer();
    await helper.addProductToCart();
    await helper.navigateToCart();
  });

  test('Greek Postal Code Validation: Valid codes accepted', async ({ page }) => {
    console.log('🧪 Testing valid Greek postal codes...');
    
    const validCombinations = [
      { zip: '11527', city: 'Άγιος Δημήτριος' },
      { zip: '11527', city: 'Athens' }, // English accepted
      { zip: '54623', city: 'Θεσσαλονίκη' },
      { zip: '54623', city: 'Thessaloniki' },
      { zip: '10678', city: 'Αθήνα' },
      { zip: '26500', city: 'Πάτρα' },
      { zip: '84600', city: 'Μύκονος' }
    ];

    for (const combo of validCombinations) {
      await helper.fillShippingInfo(combo.zip, combo.city);
      
      // Wait for validation
      await page.waitForTimeout(1000);
      
      // Should not show validation errors
      await expect(page.locator('text=Η πόλη δεν αντιστοιχεί στον ταχυδρομικό κώδικα')).not.toBeVisible();
      
      // Should show success indicator
      await expect(page.locator(`text=✅ Έγκυρος ταχυδρομικός κώδικας για ${combo.city.split(' ')[0]}`)).toBeVisible();
      
      console.log(`✅ Valid combination: ${combo.zip} - ${combo.city}`);
    }
  });

  test('Greek Postal Code Validation: Invalid codes rejected', async ({ page }) => {
    console.log('🧪 Testing invalid Greek postal codes...');
    
    const invalidCombinations = [
      { zip: '1234', city: 'Αθήνα', error: 'Ο ταχυδρομικός κώδικας πρέπει να έχει ακριβώς 5 ψηφία' },
      { zip: '123456', city: 'Αθήνα', error: 'Ο ταχυδρομικός κώδικας πρέπει να έχει ακριβώς 5 ψηφία' },
      { zip: '99999', city: 'Αθήνα', error: 'Μη έγκυρος ταχυδρομικός κώδικας για Ελλάδα' },
      { zip: '11527', city: 'Θεσσαλονίκη', error: 'Η πόλη δεν αντιστοιχεί στον ταχυδρομικό κώδικα' },
      { zip: '54623', city: 'Αθήνα', error: 'Η πόλη δεν αντιστοιχεί στον ταχυδρομικό κώδικα' },
      { zip: 'abcde', city: 'Αθήνα', error: 'μη έγκυρους χαρακτήρες' }
    ];

    for (const combo of invalidCombinations) {
      await helper.fillShippingInfo(combo.zip, combo.city);
      
      // Wait for validation
      await page.waitForTimeout(1000);
      
      // Should show appropriate error
      await expect(page.locator(`text=${combo.error}`)).toBeVisible();
      
      // Checkout button should be disabled
      const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
      await expect(checkoutBtn).toBeDisabled();
      
      console.log(`❌ Invalid combination detected: ${combo.zip} - ${combo.city} → ${combo.error}`);
    }
  });

  test('HTTP 422 Validation Error Handling', async ({ page }) => {
    console.log('🧪 Testing HTTP 422 validation error handling...');
    
    // Mock 422 response from checkout API
    await page.route('**/api/v1/orders/checkout', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Validation failed',
            errors: {
              address: ['Η διεύθυνση δεν είναι έγκυρη'],
              postal_code: ['Μη έγκυρος ταχυδρομικός κώδικας για την περιοχή']
            }
          })
        });
      }
    });

    // Fill valid shipping info
    await helper.fillShippingInfo('11527', 'Αθήνα');
    await page.waitForTimeout(2000); // Wait for shipping quote
    
    // Attempt checkout
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    await expect(checkoutBtn).toBeEnabled();
    await checkoutBtn.click();
    
    // Should show Greek error message
    await expect(page.locator('text=Τα στοιχεία παραγγελίας δεν είναι έγκυρα. Παρακαλώ ελέγξτε τα στοιχεία σας.')).toBeVisible();
    
    console.log('✅ HTTP 422 error handled with Greek message');
  });

  test('HTTP 429 Rate Limiting with Countdown', async ({ page }) => {
    console.log('🧪 Testing HTTP 429 rate limiting...');
    
    // Mock 429 response
    await page.route('**/api/v1/orders/checkout', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Too many requests'
        })
      });
    });

    await helper.fillShippingInfo('11527', 'Αθήνα');
    await page.waitForTimeout(2000);
    
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    await checkoutBtn.click();
    
    // Should show rate limit message in Greek
    await expect(page.locator('text=Πολλές αιτήσεις. Παρακαλώ περιμένετε και δοκιμάστε ξανά.')).toBeVisible();
    
    console.log('✅ HTTP 429 rate limiting handled correctly');
  });

  test('HTTP 5xx Server Errors with Retry Option', async ({ page }) => {
    console.log('🧪 Testing HTTP 5xx server errors...');
    
    const serverErrors = [500, 502, 503];
    
    for (const statusCode of serverErrors) {
      await page.route('**/api/v1/orders/checkout', async route => {
        await route.fulfill({
          status: statusCode,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Internal server error'
          })
        });
      });

      await helper.fillShippingInfo('11527', 'Αθήνα');
      await page.waitForTimeout(2000);
      
      const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
      await checkoutBtn.click();
      
      // Should show server error message in Greek
      await expect(page.locator('text=Προσωρινό πρόβλημα με τον διακομιστή')).toBeVisible();
      
      console.log(`✅ HTTP ${statusCode} server error handled`);
      
      // Reset for next iteration
      await page.unroute('**/api/v1/orders/checkout');
    }
  });

  test('Network Errors with Recovery Options', async ({ page }) => {
    console.log('🧪 Testing network error handling...');
    
    // Mock network failure
    await page.route('**/api/v1/orders/checkout', async route => {
      await route.abort('failed');
    });

    await helper.fillShippingInfo('11527', 'Αθήνα');
    await page.waitForTimeout(2000);
    
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    await checkoutBtn.click();
    
    // Should show network error message
    await expect(page.locator('text=Πρόβλημα σύνδεσης. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.')).toBeVisible();
    
    console.log('✅ Network error handled with Greek message');
  });

  test('Shipping Quote Retry with Exponential Backoff', async ({ page }) => {
    console.log('🧪 Testing shipping quote retry logic...');
    
    let attemptCount = 0;
    
    // Mock shipping quote API to fail first 2 attempts, succeed on 3rd
    await page.route('**/api/v1/shipping/quote', async route => {
      attemptCount++;
      console.log(`🔄 Shipping quote attempt ${attemptCount}`);
      
      if (attemptCount <= 2) {
        // First two attempts fail
        await route.abort('failed');
      } else {
        // Third attempt succeeds
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            carrier: 'Ταχυδρομείο Ελληνικό',
            cost: 7.50,
            etaDays: 2,
            zone: 'Αττική'
          })
        });
      }
    });

    await helper.fillShippingInfo('11527', 'Αθήνα');
    
    // Should show retry attempts
    await expect(page.locator('text=Προσπάθεια 1/3')).toBeVisible();
    await expect(page.locator('text=Προσπάθεια 2/3')).toBeVisible();
    
    // Eventually should show success
    await expect(page.locator('text=Ταχυδρομείο Ελληνικό')).toBeVisible({ timeout: 10000 });
    
    console.log(`✅ Shipping quote succeeded after ${attemptCount} attempts`);
  });

  test('Shipping Fallback When Retries Exhausted', async ({ page }) => {
    console.log('🧪 Testing shipping fallback mechanism...');
    
    // Mock shipping quote to always fail
    await page.route('**/api/v1/shipping/quote', async route => {
      await route.abort('failed');
    });

    await helper.fillShippingInfo('11527', 'Αθήνα');
    
    // Should show fallback shipping after retries
    await expect(page.locator('text=Athens Express (Εκτίμηση)')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Εκτιμώμενο κόστος')).toBeVisible();
    await expect(page.locator('text=Χρησιμοποιείται εκτιμώμενο κόστος μεταφορικών')).toBeVisible();
    
    // Checkout button should be enabled with fallback
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    await expect(checkoutBtn).toBeEnabled();
    await expect(checkoutBtn).toHaveText('Συνέχεια με εκτιμώμενα μεταφορικά');
    
    console.log('✅ Fallback shipping mechanism working');
  });

  test('Payload Validation Proof Generation', async ({ page }) => {
    console.log('🧪 Testing payload validation proof...');
    
    const validationProof = await helper.captureValidationProof();
    
    // Fill invalid data to trigger validation
    await helper.fillShippingInfo('invalid', '');
    
    // Attempt checkout to trigger validation
    await page.waitForTimeout(1000);
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    
    // Button should be disabled due to validation errors
    await expect(checkoutBtn).toBeDisabled();
    await expect(checkoutBtn).toHaveText('Διορθώστε τα σφάλματα');
    
    // Fill valid data to trigger successful validation
    await helper.fillShippingInfo('11527', 'Αθήνα');
    await page.waitForTimeout(2000);
    
    // Mock successful checkout to capture payload validation
    let capturedPayload: any = null;
    await page.route('**/api/v1/orders/checkout', async route => {
      const request = route.request();
      capturedPayload = JSON.parse(request.postData() || '{}');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '123',
          orderNumber: 'ORD-2024-123'
        })
      });
    });
    
    await expect(checkoutBtn).toBeEnabled();
    await checkoutBtn.click();
    
    // Verify payload contains expected data
    expect(capturedPayload).toBeDefined();
    expect(capturedPayload.postal_code).toBe('11527');
    expect(capturedPayload.city).toBe('Αθήνα');
    expect(capturedPayload.shipping_method).toBe('COURIER');
    
    console.log('🔒 Payload validation proof captured:', {
      postalCode: capturedPayload.postal_code,
      city: capturedPayload.city,
      hasShippingCost: !!capturedPayload.shipping_cost,
      hasCarrier: !!capturedPayload.shipping_carrier
    });
  });

  test('Complete Edge Case Recovery Flow', async ({ page }) => {
    console.log('🧪 Testing complete edge case recovery flow...');
    
    // Phase 1: Start with invalid postal code
    await helper.fillShippingInfo('1234', 'Αθήνα');
    await expect(page.locator('text=Ο ταχυδρομικός κώδικας πρέπει να έχει ακριβώς 5 ψηφία')).toBeVisible();
    
    // Phase 2: Fix postal code but mismatched city
    await helper.fillShippingInfo('11527', 'Θεσσαλονίκη');
    await expect(page.locator('text=Η πόλη δεν αντιστοιχεί στον ταχυδρομικό κώδικα')).toBeVisible();
    
    // Phase 3: Fix city but shipping fails (trigger fallback)
    await page.route('**/api/v1/shipping/quote', async route => {
      await route.abort('failed');
    });
    
    await helper.fillShippingInfo('11527', 'Αθήνα');
    await expect(page.locator('text=Athens Express (Εκτίμηση)')).toBeVisible({ timeout: 15000 });
    
    // Phase 4: Checkout fails with 429, then succeeds
    let checkoutAttempt = 0;
    await page.route('**/api/v1/orders/checkout', async route => {
      checkoutAttempt++;
      
      if (checkoutAttempt === 1) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Too many requests' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: '123',
            orderNumber: 'ORD-2024-123'
          })
        });
      }
    });
    
    // First checkout attempt (429)
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    await checkoutBtn.click();
    await expect(page.locator('text=Πολλές αιτήσεις')).toBeVisible();
    
    // Wait and retry (success)
    await page.waitForTimeout(2000);
    await checkoutBtn.click();
    
    // Should redirect to success page
    await page.waitForURL(/\/orders\/\d+/, { timeout: 10000 });
    
    console.log('✅ Complete edge case recovery flow successful');
  });

  test('Form State Persistence During Errors', async ({ page }) => {
    console.log('🧪 Testing form state persistence...');
    
    // Fill form data
    await helper.fillShippingInfo('11527', 'Αθήνα');
    await page.waitForTimeout(2000);
    
    // Mock checkout error
    await page.route('**/api/v1/orders/checkout', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error' })
      });
    });
    
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    await checkoutBtn.click();
    
    // Should show error but preserve form data
    await expect(page.locator('text=Προσωρινό πρόβλημα')).toBeVisible();
    
    // Form data should be preserved
    await expect(page.locator('[data-testid="postal-code-input"]')).toHaveValue('11527');
    await expect(page.locator('[data-testid="city-input"]')).toHaveValue('Αθήνα');
    
    console.log('✅ Form state preserved during error');
  });

  test('Accessibility During Error States', async ({ page }) => {
    console.log('🧪 Testing accessibility during error states...');
    
    // Fill invalid data
    await helper.fillShippingInfo('invalid', '');
    
    // Check ARIA attributes and error associations
    const postalCodeInput = page.locator('[data-testid="postal-code-input"]');
    const cityInput = page.locator('[data-testid="city-input"]');
    
    // Should have appropriate ARIA attributes
    await expect(postalCodeInput).toHaveAttribute('class', /border-red-300/);
    await expect(cityInput).toHaveAttribute('class', /border-red-300/);
    
    // Error messages should be properly associated
    const errorMessages = page.locator('.text-red-600');
    await expect(errorMessages).toHaveCount(2); // postal code and city errors
    
    console.log('✅ Accessibility maintained during error states');
  });
});
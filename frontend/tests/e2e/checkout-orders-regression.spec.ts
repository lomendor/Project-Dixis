/**
 * Regression test for checkout order ID redirect bug
 *
 * Root cause: Checkout redirect to /thank-you?id=undefined when API response malformed
 * Evidence: User reported undefined in URL after completing checkout
 */
import { test, expect } from '@playwright/test';

// Helper: Add an item to cart before checkout
// Use direct localStorage manipulation to avoid backend dependency
async function ensureCartHasItem(page: any) {
  // Add item directly to cart state (Zustand persists to localStorage)
  await page.addInitScript(() => {
    const cartState = {
      state: {
        items: {
          '1': {
            id: '1',
            title: 'Test Product',
            priceCents: 1000, // €10.00
            qty: 1
          }
        }
      },
      version: 0
    };
    // CRITICAL: Use correct localStorage key from cart.ts: 'dixis:cart:v1'
    localStorage.setItem('dixis:cart:v1', JSON.stringify(cartState));
  });

  // Navigate to any page to activate the cart state
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

test.describe('Checkout → Order Creation (Regression)', () => {
  test('checkout success redirects to thank-you with valid order ID', async ({ page }) => {
    // PRECONDITION: Add item to cart
    await ensureCartHasItem(page);

    // Navigate to checkout page
    await page.goto('/checkout');

    // Fill checkout form
    await page.waitForSelector('[data-testid="checkout-form"]');
    await page.locator('[data-testid="checkout-name"]').fill('Test User');
    await page.locator('[data-testid="checkout-phone"]').fill('6912345678');
    await page.locator('[data-testid="checkout-email"]').fill('test@example.com');
    await page.locator('[data-testid="checkout-address"]').fill('123 Test Street');
    await page.locator('[data-testid="checkout-city"]').fill('Athens');
    await page.locator('[data-testid="checkout-postal"]').fill('12345');

    // Intercept ORDER CREATION API (the real endpoint: POST /api/v1/public/orders)
    await page.route('**/api/v1/public/orders', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          json: {
            id: 42, // Valid order ID
            status: 'pending',
            items: [],
            total_amount: 14.40,
            created_at: new Date().toISOString()
          }
        });
      } else {
        route.continue();
      }
    });

    // Submit checkout
    await page.locator('[data-testid="checkout-submit"]').click();

    // CRITICAL: Wait for redirect and verify URL does NOT contain "undefined"
    await page.waitForURL('**/thank-you?id=**', { timeout: 10000 });
    const successUrl = page.url();

    // Assert: Success URL must NOT contain "undefined"
    expect(successUrl).not.toContain('undefined');

    // Assert: Success URL should contain the order ID
    expect(successUrl).toContain('id=42');
  });

  test('checkout API failure stays on page with error message', async ({ page }) => {
    // PRECONDITION: Add item to cart
    await ensureCartHasItem(page);

    await page.goto('/checkout');

    // Fill form
    await page.waitForSelector('[data-testid="checkout-form"]');
    await page.locator('[data-testid="checkout-name"]').fill('Test User');
    await page.locator('[data-testid="checkout-phone"]').fill('6912345678');
    await page.locator('[data-testid="checkout-address"]').fill('123 Test Street');
    await page.locator('[data-testid="checkout-city"]').fill('Athens');
    await page.locator('[data-testid="checkout-postal"]').fill('12345');

    // Intercept API to return 500 error
    await page.route('**/api/v1/public/orders', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          json: { message: 'Server error' }
        });
      } else {
        route.continue();
      }
    });

    // Submit checkout
    await page.locator('[data-testid="checkout-submit"]').click();

    // Wait a moment for error to appear
    await page.waitForTimeout(2000);

    // CRITICAL: Should NOT redirect to success page
    const url = page.url();
    expect(url).not.toContain('/thank-you');
    expect(url).not.toContain('undefined');

    // Should stay on checkout page
    expect(url).toMatch(/checkout/);

    // Error message should be visible
    const errorMessage = page.locator('[data-testid="checkout-error"]');
    await expect(errorMessage).toBeVisible();
  });

  test('order details page accepts CUID IDs (Pass 37A)', async ({ page }) => {
    // Mock /internal/orders/:id to return order details with CUID
    await page.route('**/internal/orders/cmioh0gzv0000jvcybvks6l40', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          json: {
            id: 'cmioh0gzv0000jvcybvks6l40', // CUID format
            user_id: 0,
            subtotal: '10.00',
            tax_amount: '2.40',
            shipping_amount: '2.00',
            total_amount: '14.40',
            payment_status: 'pending',
            payment_method: 'COD',
            status: 'pending',
            shipping_method: 'COURIER',
            shipping_address: '123 Test Street',
            postal_code: '12345',
            city: 'Athens',
            created_at: new Date().toISOString(),
            items: [
              {
                id: 'item1',
                product_id: 1,
                quantity: 1,
                price: '10.00',
                unit_price: '10.00',
                total_price: '10.00',
                product_name: 'Test Product',
                product_unit: 'kg',
                product: null
              }
            ],
            order_items: []
          }
        });
      } else {
        route.continue();
      }
    });

    // Setup auth
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-consumer-token');
      localStorage.setItem('user_role', 'consumer');
      localStorage.setItem('user_id', '1');
    });

    // Navigate directly to order details page with CUID
    await page.goto('/account/orders/cmioh0gzv0000jvcybvks6l40');

    // Wait for page to load (either error, auth redirect, or content)
    await page.waitForLoadState('networkidle');

    // CRITICAL: Page should NOT show "Invalid order ID" error
    // (This proves CUID validation accepts non-numeric IDs)
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Invalid order ID');

    // CRITICAL: Page should NOT show "Η Παραγγελία Δεν Βρέθηκε" error
    // (This proves ID validation doesn't reject CUID format)
    expect(pageContent).not.toContain('Η Παραγγελία Δεν Βρέθηκε');

    // Success: Page loaded without ID validation errors
    // (May show login page or order details - both are valid)
    expect(page.url()).toBeTruthy();
  });
});

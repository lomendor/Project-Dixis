/**
 * Pass 48 - E2E Tests for Shipping Display
 *
 * Tests the shipping method selection in checkout and
 * shipping details display in order details page.
 *
 * Uses route mocking for deterministic API responses.
 */
import { test, expect } from '@playwright/test';

// Helper: Add item to cart via localStorage
async function addItemToCart(page: any) {
  await page.addInitScript(() => {
    const cartState = {
      state: {
        items: {
          '1': {
            id: '1',
            title: 'Ελληνικό Μέλι',
            priceCents: 1500, // €15.00
            qty: 2
          }
        }
      },
      version: 0
    };
    localStorage.setItem('dixis:cart:v1', JSON.stringify(cartState));
  });
}

// Helper: Setup mock consumer auth
async function setupAuth(page: any) {
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'mock-consumer-token-e2e');
    localStorage.setItem('user_role', 'consumer');
    localStorage.setItem('user_id', '1');
  });
}

test.describe('Pass 48: Shipping Display', () => {

  test('checkout shows shipping method selector with 3 options', async ({ page }) => {
    await addItemToCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Verify shipping method selector exists
    const selector = page.getByTestId('shipping-method-selector');
    await expect(selector).toBeVisible();

    // Verify all 3 options are present
    await expect(page.getByTestId('shipping-option-HOME')).toBeVisible();
    await expect(page.getByTestId('shipping-option-PICKUP')).toBeVisible();
    await expect(page.getByTestId('shipping-option-COURIER')).toBeVisible();
  });

  test('checkout shows shipping cost in summary', async ({ page }) => {
    await addItemToCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Default is HOME, should show shipping cost
    const shippingCostDisplay = page.getByTestId('shipping-cost-display');
    await expect(shippingCostDisplay).toBeVisible();

    // Shipping method label should be visible
    const methodDisplay = page.getByTestId('shipping-method-display');
    await expect(methodDisplay).toBeVisible();
    await expect(methodDisplay).toContainText('Παράδοση στο σπίτι');
  });

  test('PICKUP shows free shipping', async ({ page }) => {
    await addItemToCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Select PICKUP
    await page.getByTestId('shipping-option-PICKUP').click();

    // Shipping should show "Δωρεάν"
    const shippingCostDisplay = page.getByTestId('shipping-cost-display');
    await expect(shippingCostDisplay).toContainText('Δωρεάν');

    // Method label should update
    const methodDisplay = page.getByTestId('shipping-method-display');
    await expect(methodDisplay).toContainText('Παραλαβή από κατάστημα');
  });

  test('order details shows shipping address and method', async ({ page }) => {
    await setupAuth(page);

    const mockOrderId = 12345;

    // Mock auth/me endpoint
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 1,
          name: 'Test Consumer',
          email: 'consumer@test.com',
          role: 'consumer',
          profile: { role: 'consumer' }
        }
      });
    });

    // Mock order details API
    await page.route(`**/api/v1/public/orders/${mockOrderId}`, async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          data: {
            id: mockOrderId,
            status: 'pending',
            user_id: 1,
            subtotal: '30.00',
            tax_amount: '7.20',
            shipping_amount: '3.50',
            shipping_cost: '3.50',
            total_amount: '40.70',
            payment_status: 'pending',
            payment_method: 'COD',
            shipping_method: 'HOME',
            shipping_method_label: 'Παράδοση στο σπίτι',
            shipping_address: {
              name: 'Γιώργος Παπαδόπουλος',
              phone: '6912345678',
              line1: 'Πανεπιστημίου 123',
              city: 'Αθήνα',
              postal_code: '10564',
              country: 'GR'
            },
            created_at: new Date().toISOString(),
            items: [{
              id: 1,
              product_id: 1,
              quantity: 2,
              price: '15.00',
              unit_price: '15.00',
              total_price: '30.00',
              product_name: 'Ελληνικό Μέλι',
              product_unit: 'kg',
              product: null
            }],
            order_items: []
          }
        }
      });
    });

    // Navigate to order details
    await page.goto(`/account/orders/${mockOrderId}`);
    await page.waitForLoadState('networkidle');

    // ASSERT: Shipping method is displayed
    const shippingMethod = page.getByTestId('shipping-method');
    await expect(shippingMethod).toBeVisible();
    await expect(shippingMethod).toContainText('Παράδοση στο σπίτι');

    // ASSERT: Shipping address is displayed
    const shippingAddress = page.getByTestId('shipping-address');
    await expect(shippingAddress).toBeVisible();
    await expect(shippingAddress).toContainText('Γιώργος Παπαδόπουλος');
    await expect(shippingAddress).toContainText('Πανεπιστημίου 123');
    await expect(shippingAddress).toContainText('Αθήνα');
    await expect(shippingAddress).toContainText('10564');

    // ASSERT: Shipping cost is displayed
    const shippingAmountDisplay = page.getByTestId('shipping-amount');
    await expect(shippingAmountDisplay).toBeVisible();
    await expect(shippingAmountDisplay).toContainText('3.50');

    // ASSERT: Total includes shipping
    const totalDisplay = page.getByTestId('total-amount');
    await expect(totalDisplay).toBeVisible();
    await expect(totalDisplay).toContainText('40.70');
  });

  test('order details handles missing shipping address gracefully', async ({ page }) => {
    await setupAuth(page);

    const mockOrderId = 99999;

    // Mock auth/me
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 1,
          name: 'Test Consumer',
          email: 'consumer@test.com',
          role: 'consumer'
        }
      });
    });

    // Mock order with NO shipping address
    await page.route(`**/api/v1/public/orders/${mockOrderId}`, async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          data: {
            id: mockOrderId,
            status: 'pending',
            user_id: 1,
            subtotal: '20.00',
            tax_amount: '4.80',
            shipping_amount: '0.00',
            total_amount: '24.80',
            payment_status: 'pending',
            payment_method: 'COD',
            shipping_method: 'PICKUP',
            shipping_method_label: 'Παραλαβή από κατάστημα',
            shipping_address: null,
            created_at: new Date().toISOString(),
            items: [{
              id: 1,
              product_id: 1,
              quantity: 2,
              price: '10.00',
              unit_price: '10.00',
              total_price: '20.00',
              product_name: 'Test Product',
              product_unit: 'τεμ',
              product: null
            }],
            order_items: []
          }
        }
      });
    });

    // Navigate to order details
    await page.goto(`/account/orders/${mockOrderId}`);
    await page.waitForLoadState('networkidle');

    // ASSERT: Page loads without error
    await expect(page.getByTestId('error-message')).not.toBeVisible();

    // ASSERT: Shipping method is displayed (PICKUP)
    const shippingMethod = page.getByTestId('shipping-method');
    await expect(shippingMethod).toBeVisible();
    await expect(shippingMethod).toContainText('Παραλαβή από κατάστημα');

    // ASSERT: Shipping address section is NOT displayed (no address for PICKUP)
    // The hasShippingAddress function should return false for null
    await expect(page.getByTestId('shipping-address')).not.toBeVisible();
  });
});

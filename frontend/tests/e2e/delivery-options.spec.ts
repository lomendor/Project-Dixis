import { test, expect } from '@playwright/test';

test.describe('Delivery Options v0', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocks for consistent testing
    await page.route('**/api/v1/shipping/quote', async (route) => {
      const url = route.request().url();
      const body = JSON.parse(route.request().postData() || '{}');

      // Mock response based on delivery method
      const deliveryMethod = body.delivery_method || 'HOME';
      const response = {
        success: true,
        data: {
          cost_cents: deliveryMethod === 'LOCKER' ? 350 : 550, // 20% discount for locker
          cost_eur: deliveryMethod === 'LOCKER' ? 3.50 : 5.50,
          carrier_code: 'ELTA',
          zone_code: 'GR_ATTICA',
          zone_name: 'Αττική',
          estimated_delivery_days: 2,
          delivery_method: deliveryMethod,
          breakdown: {
            base_cost_cents: 550,
            weight_adjustment_cents: 0,
            volume_adjustment_cents: 0,
            zone_multiplier: 1.0,
            actual_weight_kg: 1.0,
            volumetric_weight_kg: 1.0,
            postal_code: '11525',
            profile_applied: null,
            locker_discount_cents: deliveryMethod === 'LOCKER' ? 200 : 0
          }
        }
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });

    await page.route('**/api/v1/shipping/lockers/search**', async (route) => {
      const response = {
        success: true,
        data: [
          {
            id: 'BN_ATH_001',
            name: 'BoxNow Κολωνάκι',
            address: 'Σκουφά 12, Κολωνάκι, Αθήνα',
            provider: 'BoxNow',
            lat: 37.9777,
            lng: 23.7442,
            postal_code: '10673',
            distance: 0.5,
            operating_hours: '24/7',
            notes: 'Κοντά στο μετρό Ευαγγελισμός'
          }
        ]
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  });

  test('should display delivery method options when postal code is entered', async ({ page }) => {
    // Navigate to cart page (assuming cart has items)
    await page.goto('/cart');

    // Fill in postal code
    await page.fill('input[placeholder="12345"]', '11525');

    // Wait for the delivery method selector to appear
    await expect(page.getByTestId('delivery-method-selector')).toBeVisible({ timeout: 10000 });

    // Check that both delivery options are present
    await expect(page.getByTestId('delivery-method-home')).toBeVisible();
    await expect(page.getByTestId('delivery-method-locker')).toBeVisible();

    // Verify home delivery option is selected by default
    await expect(page.getByTestId('delivery-method-home')).toBeChecked();
  });

  test('should show locker search when locker option is selected', async ({ page }) => {
    await page.goto('/cart');

    // Fill in postal code
    await page.fill('input[placeholder="12345"]', '11525');

    // Wait for delivery method selector
    await expect(page.getByTestId('delivery-method-selector')).toBeVisible({ timeout: 10000 });

    // Select locker delivery option
    await page.getByTestId('delivery-method-locker').click();

    // Verify locker search appears
    await expect(page.getByTestId('locker-search-results')).toBeVisible({ timeout: 5000 });

    // Check that locker options are displayed
    await expect(page.getByTestId('locker-option-BN_ATH_001')).toBeVisible();
  });

  test('should show discount when locker is selected', async ({ page }) => {
    await page.goto('/cart');

    // Fill in postal code
    await page.fill('input[placeholder="12345"]', '11525');

    // Wait for delivery method selector
    await expect(page.getByTestId('delivery-method-selector')).toBeVisible({ timeout: 10000 });

    // Select locker delivery option
    await page.getByTestId('delivery-method-locker').click();

    // Look for discount indication
    await expect(page.getByText('Έκπτωση!')).toBeVisible({ timeout: 5000 });

    // Verify the discounted price is shown
    await expect(page.getByText('€3.50')).toBeVisible();
  });

  test('should allow selecting a specific locker', async ({ page }) => {
    await page.goto('/cart');

    // Fill in postal code
    await page.fill('input[placeholder="12345"]', '11525');

    // Wait for delivery method selector
    await expect(page.getByTestId('delivery-method-selector')).toBeVisible({ timeout: 10000 });

    // Select locker delivery option
    await page.getByTestId('delivery-method-locker').click();

    // Wait for locker results
    await expect(page.getByTestId('locker-search-results')).toBeVisible({ timeout: 5000 });

    // Select a specific locker
    await page.getByTestId('locker-option-BN_ATH_001').click();

    // Verify the locker is selected (should have a checkmark or selected state)
    await expect(page.getByTestId('locker-option-BN_ATH_001')).toHaveClass(/border-blue-500/);
  });

  test('should gracefully handle when no lockers are available', async ({ page }) => {
    // Mock empty locker response
    await page.route('**/api/v1/shipping/lockers/search**', async (route) => {
      const response = {
        success: true,
        data: []
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });

    await page.goto('/cart');

    // Fill in postal code that has no lockers
    await page.fill('input[placeholder="12345"]', '99999');

    // Wait for delivery method selector
    await expect(page.getByTestId('delivery-method-selector')).toBeVisible({ timeout: 10000 });

    // Select locker delivery option
    await page.getByTestId('delivery-method-locker').click();

    // Should show no results message
    await expect(page.getByTestId('locker-search-no-results')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Δεν βρέθηκαν lockers')).toBeVisible();
  });

  test('should handle loading states properly', async ({ page }) => {
    // Slow down the API response to test loading states
    await page.route('**/api/v1/shipping/quote', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      await route.continue();
    });

    await page.goto('/cart');

    // Fill in postal code
    await page.fill('input[placeholder="12345"]', '11525');

    // Should show loading state
    await expect(page.getByTestId('delivery-method-loading')).toBeVisible();
    await expect(page.getByText('Υπολογισμός επιλογών παράδοσης')).toBeVisible();

    // Eventually should show the delivery options
    await expect(page.getByTestId('delivery-method-selector')).toBeVisible({ timeout: 15000 });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/shipping/quote', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Server error' })
      });
    });

    await page.goto('/cart');

    // Fill in postal code
    await page.fill('input[placeholder="12345"]', '11525');

    // Should show error state
    await expect(page.getByTestId('delivery-method-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Προσπάθεια ξανά')).toBeVisible();
  });
});
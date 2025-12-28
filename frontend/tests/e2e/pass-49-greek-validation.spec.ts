/**
 * Pass 49 - E2E Tests for Greek Market Validation
 *
 * Tests Greek phone and postal code validation in checkout.
 * Ensures EL-first UX with proper error messages.
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

test.describe('Pass 49: Greek Market Validation', () => {

  test('rejects invalid Greek phone number format', async ({ page }) => {
    await addItemToCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Fill form with invalid phone (too short)
    await page.getByTestId('checkout-name').fill('Γιώργος Παπαδόπουλος');
    await page.getByTestId('checkout-phone').fill('123456'); // Invalid
    await page.getByTestId('checkout-address').fill('Πανεπιστημίου 123');
    await page.getByTestId('checkout-city').fill('Αθήνα');
    await page.getByTestId('checkout-postal').fill('10564');

    // Submit form
    await page.getByTestId('checkout-submit').click();

    // Expect phone error to be displayed
    const phoneError = page.getByTestId('phone-error');
    await expect(phoneError).toBeVisible();
    await expect(phoneError).toContainText('ελληνικό τηλέφωνο');
  });

  test('accepts valid Greek mobile phone (10 digits)', async ({ page }) => {
    await addItemToCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Fill form with valid phone (Greek mobile)
    await page.getByTestId('checkout-name').fill('Μαρία Κωνσταντίνου');
    await page.getByTestId('checkout-phone').fill('6912345678'); // Valid
    await page.getByTestId('checkout-address').fill('Σταδίου 50');
    await page.getByTestId('checkout-city').fill('Αθήνα');
    await page.getByTestId('checkout-postal').fill('10564');

    // Submit form - should not show phone error
    await page.getByTestId('checkout-submit').click();

    // Phone error should NOT be visible
    await expect(page.getByTestId('phone-error')).not.toBeVisible();
  });

  test('accepts valid Greek phone with +30 prefix', async ({ page }) => {
    await addItemToCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Fill form with valid phone (+30 prefix)
    await page.getByTestId('checkout-name').fill('Νίκος Αλεξίου');
    await page.getByTestId('checkout-phone').fill('+306912345678'); // Valid with prefix
    await page.getByTestId('checkout-address').fill('Ερμού 100');
    await page.getByTestId('checkout-city').fill('Θεσσαλονίκη');
    await page.getByTestId('checkout-postal').fill('54624');

    // Submit form
    await page.getByTestId('checkout-submit').click();

    // Phone error should NOT be visible
    await expect(page.getByTestId('phone-error')).not.toBeVisible();
  });

  test('rejects invalid postal code (not 5 digits)', async ({ page }) => {
    await addItemToCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Fill form with invalid postal code (4 digits)
    await page.getByTestId('checkout-name').fill('Ελένη Δημητρίου');
    await page.getByTestId('checkout-phone').fill('6987654321');
    await page.getByTestId('checkout-address').fill('Αμαλίας 20');
    await page.getByTestId('checkout-city').fill('Πάτρα');
    await page.getByTestId('checkout-postal').fill('1234'); // Invalid - only 4 digits

    // Submit form
    await page.getByTestId('checkout-submit').click();

    // Expect postal error to be displayed
    const postalError = page.getByTestId('postal-error');
    await expect(postalError).toBeVisible();
    await expect(postalError).toContainText('5 ψηφία');
  });

  test('accepts valid Greek postal code (5 digits)', async ({ page }) => {
    await addItemToCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Fill form with valid 5-digit postal code
    await page.getByTestId('checkout-name').fill('Κώστας Ιωάννου');
    await page.getByTestId('checkout-phone').fill('2101234567'); // Athens landline
    await page.getByTestId('checkout-address').fill('Βασιλίσσης Σοφίας 10');
    await page.getByTestId('checkout-city').fill('Αθήνα');
    await page.getByTestId('checkout-postal').fill('10674'); // Valid 5 digits

    // Submit form
    await page.getByTestId('checkout-submit').click();

    // Postal error should NOT be visible
    await expect(page.getByTestId('postal-error')).not.toBeVisible();
  });

  test('shows multiple validation errors simultaneously', async ({ page }) => {
    await addItemToCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Fill form with both invalid phone AND postal
    await page.getByTestId('checkout-name').fill('Αντώνης Γεωργίου');
    await page.getByTestId('checkout-phone').fill('abc'); // Invalid phone
    await page.getByTestId('checkout-address').fill('Ακαδημίας 5');
    await page.getByTestId('checkout-city').fill('Αθήνα');
    await page.getByTestId('checkout-postal').fill('ABC'); // Invalid postal

    // Submit form
    await page.getByTestId('checkout-submit').click();

    // Both errors should be visible
    await expect(page.getByTestId('phone-error')).toBeVisible();
    await expect(page.getByTestId('postal-error')).toBeVisible();
  });

  test('clears validation errors on successful resubmit', async ({ page }) => {
    await addItemToCart(page);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // First: Submit with invalid data
    await page.getByTestId('checkout-name').fill('Δημήτρης Νικολάου');
    await page.getByTestId('checkout-phone').fill('123'); // Invalid
    await page.getByTestId('checkout-address').fill('Πατησίων 76');
    await page.getByTestId('checkout-city').fill('Αθήνα');
    await page.getByTestId('checkout-postal').fill('10434');

    await page.getByTestId('checkout-submit').click();

    // Error should appear
    await expect(page.getByTestId('phone-error')).toBeVisible();

    // Fix the phone number
    await page.getByTestId('checkout-phone').clear();
    await page.getByTestId('checkout-phone').fill('6945678901');

    // Submit again - mock the API to avoid actual order creation
    await page.route('**/api/v1/orders', async (route) => {
      await route.fulfill({
        status: 201,
        json: { id: 12345, status: 'pending' }
      });
    });

    await page.getByTestId('checkout-submit').click();

    // Error should be cleared
    await expect(page.getByTestId('phone-error')).not.toBeVisible();
  });
});

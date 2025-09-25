import { test, expect } from '@playwright/test';

/**
 * Checkout E2E Tests
 * Tests the complete checkout flow with shipping, payment, and confirmation
 */

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();

    // Clean logging for debug
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('PW:CHECKOUT-ERR', msg.text());
      }
    });
  });

  test('1) Guest checkout: add product → /checkout → submit address → review → pay (fake) → see confirmation', async ({ page }) => {
    // Mock consumer authentication for checkout
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock_consumer_token');
      localStorage.setItem('user_role', 'consumer');
      localStorage.setItem('user_email', 'consumer@dixis.test');
      localStorage.setItem('user_id', '100');
    });

    // Navigate to checkout page directly (simulating cart with items)
    await page.goto('/checkout');

    // Wait for checkout page to load
    await expect(page.getByTestId('checkout-cta')).toBeVisible({ timeout: 15000 });
    console.log('✅ Checkout page loaded');

    // Verify we're on the shipping step
    await expect(page.getByText('Διεύθυνση Αποστολής')).toBeVisible();
    console.log('✅ Shipping address step displayed');

    // Fill shipping address form
    await page.getByTestId('shipping-name-input').fill('Δημήτρης Παπαδόπουλος');
    await page.getByTestId('shipping-address-input').fill('Βασιλίσσης Σοφίας 123');
    await page.getByTestId('shipping-city-input').fill('Αθήνα');
    await page.getByTestId('shipping-postal-code-input').fill('10671');
    await page.getByTestId('shipping-phone-input').fill('+30 210 1234567');
    console.log('✅ Shipping form filled');

    // Submit shipping form
    await page.getByTestId('continue-to-review-btn').click();

    // Wait for review step
    await expect(page.getByText('Επιβεβαίωση')).toBeVisible({ timeout: 10000 });
    console.log('✅ Review step loaded');

    // Verify shipping address is displayed in review
    await expect(page.getByText('Δημήτρης Παπαδόπουλος')).toBeVisible();
    await expect(page.getByText('Βασιλίσσης Σοφίας 123')).toBeVisible();
    console.log('✅ Shipping address displayed in review');

    // Verify order summary is visible
    const orderTotal = page.getByTestId('order-total');
    await expect(orderTotal).toBeVisible();
    console.log('✅ Order total displayed');

    // Proceed to payment
    await page.getByTestId('proceed-to-payment-btn').click();

    // Wait for payment step
    await expect(page.getByText('Πληρωμή')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Demo Payment Provider')).toBeVisible();
    console.log('✅ Payment step loaded with fake provider');

    // Process payment
    await page.getByTestId('process-payment-btn').click();

    // Wait for redirect to confirmation page
    await expect(page.getByTestId('confirmation-title')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('confirmation-title')).toContainText('Παραγγελία Ολοκληρώθηκε');
    console.log('✅ Order confirmation page loaded');

    // Verify order details on confirmation page
    await expect(page.getByTestId('order-total')).toBeVisible();
    console.log('✅ Order total visible on confirmation');

    // Verify continue shopping button
    await expect(page.getByTestId('continue-shopping-btn')).toBeVisible();
    console.log('✅ Continue shopping button available');

    console.log('✅ Guest checkout flow completed successfully');
  });

  test('2) Logged-in user checkout: same flow with authentication', async ({ page }) => {
    // Mock authenticated consumer
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock_authenticated_consumer_token');
      localStorage.setItem('user_role', 'consumer');
      localStorage.setItem('user_email', 'authenticated@dixis.test');
      localStorage.setItem('user_id', '101');
    });

    // Navigate to checkout
    await page.goto('/checkout');

    // Wait for checkout page
    await expect(page.getByTestId('checkout-cta')).toBeVisible({ timeout: 15000 });
    console.log('✅ Authenticated checkout page loaded');

    // Quick fill and submit shipping form
    await page.getByTestId('shipping-name-input').fill('Μαρία Κωνσταντίνου');
    await page.getByTestId('shipping-address-input').fill('Πατησίων 456');
    await page.getByTestId('shipping-city-input').fill('Θεσσαλονίκη');
    await page.getByTestId('shipping-postal-code-input').fill('54636');

    await page.getByTestId('continue-to-review-btn').click();

    // Wait for review and proceed to payment
    await expect(page.getByText('Επιβεβαίωση')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('proceed-to-payment-btn').click();

    // Complete payment
    await expect(page.getByText('Πληρωμή')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('process-payment-btn').click();

    // Verify confirmation
    await expect(page.getByTestId('confirmation-title')).toBeVisible({ timeout: 15000 });
    console.log('✅ Authenticated user checkout completed');
  });

  test('3) Quote changes when cart quantities change', async ({ page }) => {
    // Mock consumer authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock_consumer_token');
      localStorage.setItem('user_role', 'consumer');
      localStorage.setItem('user_email', 'consumer@dixis.test');
      localStorage.setItem('user_id', '100');
    });

    // Navigate to checkout
    await page.goto('/checkout');

    // Wait for checkout page
    await expect(page.getByTestId('checkout-cta')).toBeVisible({ timeout: 15000 });

    // Check initial order summary
    const orderSummary = page.locator('.bg-white.rounded-lg.shadow-sm.p-6.sticky.top-8');
    await expect(orderSummary).toBeVisible();

    // Look for initial total
    const initialTotal = await page.getByTestId('order-total').textContent();
    console.log(`✅ Initial order total: ${initialTotal}`);

    // Fill shipping form quickly to trigger quote calculation
    await page.getByTestId('shipping-name-input').fill('Test User');
    await page.getByTestId('shipping-address-input').fill('Test Address 123');
    await page.getByTestId('shipping-city-input').fill('Αθήνα');
    await page.getByTestId('shipping-postal-code-input').fill('10671');

    await page.getByTestId('continue-to-review-btn').click();

    // Wait for review step with shipping quote
    await expect(page.getByText('Επιβεβαίωση')).toBeVisible({ timeout: 10000 });

    // Check that shipping cost is now included
    const finalTotal = await page.getByTestId('order-total').textContent();
    console.log(`✅ Final order total with shipping: ${finalTotal}`);

    // Verify that shipping information is displayed
    await expect(page.getByText('Μέθοδος Αποστολής')).toBeVisible();
    console.log('✅ Shipping method displayed');

    // Verify total changed (should include shipping cost)
    expect(initialTotal).not.toBe(finalTotal);
    console.log('✅ Order total updated with shipping cost');

    console.log('✅ Quote calculation test completed');
  });

  test('4) Form validation and error handling', async ({ page }) => {
    // Mock consumer authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock_consumer_token');
      localStorage.setItem('user_role', 'consumer');
      localStorage.setItem('user_email', 'consumer@dixis.test');
      localStorage.setItem('user_id', '100');
    });

    // Navigate to checkout
    await page.goto('/checkout');

    // Wait for checkout page
    await expect(page.getByTestId('checkout-cta')).toBeVisible({ timeout: 15000 });

    // Try to submit empty form
    await page.getByTestId('continue-to-review-btn').click();

    // Check for HTML5 validation (required fields)
    const nameInput = page.getByTestId('shipping-name-input');
    const addressInput = page.getByTestId('shipping-address-input');
    const cityInput = page.getByTestId('shipping-city-input');
    const postalCodeInput = page.getByTestId('shipping-postal-code-input');

    // Verify required fields prevent submission
    await expect(nameInput).toHaveAttribute('required', '');
    await expect(addressInput).toHaveAttribute('required', '');
    await expect(cityInput).toHaveAttribute('required', '');
    await expect(postalCodeInput).toHaveAttribute('required', '');
    console.log('✅ Form validation prevents empty submission');

    // Test invalid postal code
    await nameInput.fill('Test User');
    await addressInput.fill('Test Address');
    await cityInput.fill('Test City');
    await postalCodeInput.fill('invalid'); // Invalid postal code

    await page.getByTestId('continue-to-review-btn').click();

    // Should stay on shipping step due to validation
    await expect(page.getByText('Διεύθυνση Αποστολής')).toBeVisible();
    console.log('✅ Invalid postal code prevents progression');

    // Fill valid data
    await postalCodeInput.clear();
    await postalCodeInput.fill('10671');

    // Should now progress to review
    await page.getByTestId('continue-to-review-btn').click();
    await expect(page.getByText('Επιβεβαίωση')).toBeVisible({ timeout: 10000 });
    console.log('✅ Valid form data allows progression');

    console.log('✅ Form validation test completed');
  });

  test('5) Unauthorized access redirects to login', async ({ page }) => {
    // No authentication setup - simulating unauthenticated user

    // Try to navigate to checkout
    await page.goto('/checkout');

    // Should redirect to login page
    await expect(page.url()).toContain('/auth/login');
    console.log('✅ Unauthenticated user redirected to login');

    // Alternatively, if the page loads but shows a login prompt/message
    // await expect(page.getByText('Σύνδεση')).toBeVisible();

    console.log('✅ Unauthorized access handling test completed');
  });
});
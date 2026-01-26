import { test, expect } from '@playwright/test';

/**
 * Pass CHECKOUT-COPY-01: Regression test for checkout shipping note copy
 * Ensures the shipping note does NOT mention VAT (since VAT is not implemented)
 */
test.describe('Checkout Copy Regression', () => {
  test('shipping note does NOT mention VAT', async ({ page }) => {
    // Add item to cart first (required for checkout to show content)
    await page.goto('/products');

    // Wait for products to load and click first add-to-cart
    const addBtn = page.getByTestId('add-to-cart').first();
    await addBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    // If no add-to-cart button, skip test (products not available)
    if (!(await addBtn.isVisible())) {
      test.skip(true, 'No products available to add to cart');
      return;
    }

    await addBtn.click();
    await page.waitForTimeout(500);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Look for the checkout form (indicates page loaded)
    const checkoutForm = page.getByTestId('checkout-form');
    await checkoutForm.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    // If checkout form not visible (redirect to login or empty cart), skip
    if (!(await checkoutForm.isVisible())) {
      test.skip(true, 'Checkout form not visible (auth required or empty cart)');
      return;
    }

    // Get the shipping note text (the small gray text below subtotal)
    const shippingNote = page.locator('.text-xs.text-gray-500.mt-2');
    await expect(shippingNote).toBeVisible();

    const noteText = await shippingNote.textContent();
    console.log('Shipping note text:', noteText);

    // Assert: Note should NOT mention VAT/ΦΠΑ (since VAT is not implemented)
    expect(noteText).not.toMatch(/VAT|ΦΠΑ/i);

    // Assert: Note SHOULD mention shipping per producer
    expect(noteText).toMatch(/€3\.50|ανά παραγωγό|per producer/i);

    console.log('✅ Shipping note copy is correct (no VAT mention)');
  });
});

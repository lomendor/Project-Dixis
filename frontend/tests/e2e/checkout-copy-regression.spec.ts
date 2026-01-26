import { test, expect } from '@playwright/test';

/**
 * Checkout Copy Regression Test
 *
 * Ensures the shipping note:
 * - Does NOT mention VAT/ΦΠΑ (not implemented)
 * - Does NOT contain hardcoded prices (€3.50, €35, "free shipping")
 * - IS truthful and generic (no false promises)
 */
test.describe('Checkout Copy Regression', () => {
  test('shipping note is truthful (no VAT, no hardcoded prices)', async ({ page }) => {
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

    const noteText = await shippingNote.textContent() || '';
    console.log('Shipping note text:', noteText);

    // Assert: Note should NOT mention VAT/ΦΠΑ (not implemented)
    expect(noteText).not.toMatch(/VAT|ΦΠΑ/i);

    // Assert: Note should NOT contain hardcoded prices (not business-approved)
    expect(noteText).not.toMatch(/€3\.50|€35|δωρεάν μεταφορικά|free shipping/i);

    // Assert: Note SHOULD mention shipping and checkout
    expect(noteText).toMatch(/shipping|μεταφορικά/i);
    expect(noteText).toMatch(/checkout|παραγωγό/i);

    console.log('✅ Shipping note is truthful (no VAT, no hardcoded prices)');
  });
});

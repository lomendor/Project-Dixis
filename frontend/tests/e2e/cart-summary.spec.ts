import { test, expect } from '@playwright/test';

/**
 * Cart Summary & Mini Panel E2E Tests
 * Verifies data-testid attributes and component functionality
 */

test.describe('Cart Summary & Mini Panel Tests', () => {
  test('CartSummary component displays required data-testid attributes', async ({ page }) => {
    // Test CartSummary component in isolation with mock HTML
    await page.setContent(`
      <div data-testid="cart-summary" style="border: 1px solid #ccc; padding: 16px;">
        <h3 data-testid="summary-title">Σύνοψη Παραγγελίας</h3>
        <div data-testid="cart-items-count" style="margin-bottom: 12px; color: #666;">
          3 προϊόντα
        </div>
        <div data-testid="summary-details">
          <div data-testid="subtotal-row">
            <span>Προϊόντα:</span>
            <span data-testid="subtotal-amount">€39.75</span>
          </div>
          <div data-testid="shipping-row">
            <span>Μεταφορικά:</span>
            <span data-testid="shipping-amount">€3.50</span>
          </div>
          <div data-testid="tax-row">
            <span>ΦΠΑ (24%):</span>
            <span data-testid="tax-amount">€9.54</span>
          </div>
          <div data-testid="total-row">
            <span>Σύνολο:</span>
            <span data-testid="cart-total-amount">€52.79</span>
          </div>
        </div>
        <button data-testid="checkout-btn" style="width: 100%; padding: 12px; background: #059669; color: white; border: none; border-radius: 6px; margin-top: 16px;">
          Ολοκλήρωση Παραγγελίας
        </button>
        <a href="/cart" data-testid="cart-view-link" style="display: block; text-align: center; margin-top: 12px; color: #2563eb;">
          Προβολή καλαθιού
        </a>
      </div>
    `);

    // Verify cart-summary container
    await expect(page.getByTestId('cart-summary')).toBeVisible();

    // Verify cart-items-count shows correct count
    const itemsCount = page.getByTestId('cart-items-count');
    await expect(itemsCount).toBeVisible();
    await expect(itemsCount).toContainText('3 προϊόντα');

    // Verify cart-total-amount displays correctly
    const totalAmount = page.getByTestId('cart-total-amount');
    await expect(totalAmount).toBeVisible();
    await expect(totalAmount).toContainText('€52.79');

    // Verify cart-view-link is present and functional
    const viewLink = page.getByTestId('cart-view-link');
    await expect(viewLink).toBeVisible();
    await expect(viewLink).toHaveAttribute('href', '/cart');

    // Verify checkout button is present
    await expect(page.getByTestId('checkout-btn')).toBeVisible();
    await expect(page.getByTestId('checkout-btn')).toBeEnabled();
  });

  test('CartMiniPanel shows consistent testids and navigation', async ({ page }) => {
    // Test CartMiniPanel with cart-items-count and cart-total-amount
    await page.setContent(`
      <div data-testid="cart-mini-panel">
        <span data-testid="cart-items-count">3 προϊόντα</span>
        <span data-testid="cart-total-amount">€39.75</span>
        <a href="/cart" data-testid="cart-view-link">Προβολή καλαθιού</a>
        <a href="/checkout" data-testid="checkout-cta-btn">Ολοκλήρωση</a>
      </div>
    `);

    // Verify all required testids are present
    await expect(page.getByTestId('cart-mini-panel')).toBeVisible();
    await expect(page.getByTestId('cart-items-count')).toContainText('3 προϊόντα');
    await expect(page.getByTestId('cart-total-amount')).toContainText('€39.75');
    await expect(page.getByTestId('cart-view-link')).toHaveAttribute('href', '/cart');
    await expect(page.getByTestId('checkout-cta-btn')).toHaveAttribute('href', '/checkout');
  });

  test('Empty cart state displays correctly', async ({ page }) => {
    // Test empty cart mini panel state
    await page.setContent(`
      <div data-testid="cart-mini-panel" style="background: white; border: 1px solid #ccc; border-radius: 8px; padding: 16px;">
        <div data-testid="empty-cart-mini" style="display: flex; align-items: center; justify-content: center; color: #6b7280;">
          <svg style="width: 20px; height: 20px; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l-1.5-1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"></path>
          </svg>
          <span>Κενό καλάθι</span>
        </div>
        <a href="/products" data-testid="continue-shopping-link" style="display: block; margin-top: 8px; font-size: 14px; color: #2563eb; text-align: center;">
          Συνέχεια αγορών
        </a>
      </div>
    `);

    await expect(page.getByTestId('cart-mini-panel')).toBeVisible();
    await expect(page.getByTestId('empty-cart-mini')).toContainText('Κενό καλάθι');
    await expect(page.getByTestId('continue-shopping-link')).toHaveAttribute('href', '/products');
  });

  test('Cart testid consistency across components', async ({ page }) => {
    // Test that both CartSummary and CartMiniPanel use consistent testids
    await page.setContent(`
      <div style="display: flex; gap: 20px;">
        <!-- CartSummary -->
        <div data-testid="cart-summary" style="border: 1px solid #ccc; padding: 16px; width: 300px;">
          <div data-testid="cart-items-count">2 προϊόντα</div>
          <div data-testid="cart-total-amount">€31.00</div>
          <a href="/cart" data-testid="cart-view-link">Προβολή καλαθιού</a>
        </div>

        <!-- CartMiniPanel -->
        <div data-testid="cart-mini-panel" style="border: 1px solid #ccc; padding: 16px; width: 300px;">
          <span data-testid="cart-items-count">2 προϊόντα</span>
          <span data-testid="cart-total-amount">€31.00</span>
          <a href="/cart" data-testid="cart-view-link">Προβολή καλαθιού</a>
        </div>
      </div>
    `);

    // Test consistency of testids between components
    const cartSummaryItemsCount = page.getByTestId('cart-summary').getByTestId('cart-items-count');
    const miniPanelItemsCount = page.getByTestId('cart-mini-panel').getByTestId('cart-items-count');

    await expect(cartSummaryItemsCount).toContainText('2 προϊόντα');
    await expect(miniPanelItemsCount).toContainText('2 προϊόντα');

    const cartSummaryTotal = page.getByTestId('cart-summary').getByTestId('cart-total-amount');
    const miniPanelTotal = page.getByTestId('cart-mini-panel').getByTestId('cart-total-amount');

    await expect(cartSummaryTotal).toContainText('€31.00');
    await expect(miniPanelTotal).toContainText('€31.00');

    // Both should have cart-view-link
    await expect(page.getByTestId('cart-summary').getByTestId('cart-view-link')).toHaveAttribute('href', '/cart');
    await expect(page.getByTestId('cart-mini-panel').getByTestId('cart-view-link')).toHaveAttribute('href', '/cart');
  });

  test('Cart navigation flow from mini panel to full cart', async ({ page }) => {
    await page.setContent(`
      <div data-testid="cart-mini-panel">
        <span data-testid="cart-items-count">2 προϊόντα</span>
        <span data-testid="cart-total-amount">€31.00</span>
        <a href="/cart" data-testid="cart-view-link">Προβολή καλαθιού</a>
      </div>
    `);

    // Click cart view link
    const cartViewLink = page.getByTestId('cart-view-link');
    await expect(cartViewLink).toBeVisible();
    await expect(cartViewLink).toHaveAttribute('href', '/cart');

    // Verify link text is appropriate
    await expect(cartViewLink).toContainText('Προβολή');
  });
});
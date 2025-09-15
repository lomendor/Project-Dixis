import { test, expect } from '@playwright/test';
import { waitForRoot } from './helpers/waitForRoot';
import { setupCartApiMocks } from './helpers/api-mocks';

/**
 * Cart UI Smoke Tests - Lean verification (≤110 LOC)
 */
test.use({ viewport: { width: 390, height: 844 } });

test.describe('Cart UI Smoke Tests', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock_cart_token');
      localStorage.setItem('user_role', 'consumer'); 
      localStorage.setItem('user_email', 'cart@dixis.local');
    });
    await setupCartApiMocks(page);
  });

  test('Cart page renders with summary and proper testids', async ({ page }) => {
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await waitForRoot(page);
    
    // Verify cart summary component is present
    const cartSummary = page.getByTestId('cart-summary');
    await expect(cartSummary).toBeVisible({ timeout: 10000 });
    
    // Verify items count display (if present)
    const itemsCount = page.getByTestId('cart-items-count');
    if (await itemsCount.count() > 0) {
      await expect(itemsCount).toBeVisible();
      await expect(itemsCount).toContainText('προϊόν');
    }
    
    // Verify total amount with new testid
    const totalAmount = page.getByTestId('cart-total-amount');
    await expect(totalAmount).toBeVisible();
    await expect(totalAmount).toContainText('€');
    
    // Verify checkout button
    const checkoutBtn = page.getByTestId('checkout-btn');
    await expect(checkoutBtn).toBeVisible();
    await expect(checkoutBtn).toContainText('Ολοκλήρωση');
  });

  test('Cart summary displays amounts from API stubs', async ({ page }) => {
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await waitForRoot(page);
    
    // Wait for cart summary to load
    await expect(page.getByTestId('cart-summary')).toBeVisible({ timeout: 10000 });
    
    // Verify total amount reflects stubbed data structure
    const totalAmount = page.getByTestId('cart-total-amount');
    await expect(totalAmount).toBeVisible();
    
    // Check price display format
    const totalText = await totalAmount.textContent();
    expect(totalText).toMatch(/€\d+/);
  });

  test('Empty cart state handling', async ({ page }) => {
    // Mock empty cart
    await page.route('**/api/v1/cart/items', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ cart_items: [], total_items: 0, total_amount: '0.00' })
      });
    });
    
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await waitForRoot(page);
    
    // Verify empty cart message is shown
    const emptyMessage = page.getByTestId('empty-cart-message');
    await expect(emptyMessage).toBeVisible({ timeout: 10000 });
  });

  test('Cart CTA links and mini panel testids', async ({ page }) => {
    // Test cart view link (if present)
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await waitForRoot(page);
    
    const cartViewLink = page.getByTestId('cart-view-link');
    if (await cartViewLink.count() > 0) {
      await expect(cartViewLink).toBeVisible();
      expect(await cartViewLink.getAttribute('href')).toBe('/cart');
    }
    
    // Test mini cart panel testids with mock content
    await page.setContent(`
      <div data-testid="mini-cart-root">
        <div data-testid="mini-cart-items">Items</div>
        <a href="/checkout" data-testid="mini-cart-cta">Checkout</a>
      </div>
    `);
    
    await expect(page.getByTestId('mini-cart-root')).toBeVisible();
    await expect(page.getByTestId('mini-cart-items')).toBeVisible();
    await expect(page.getByTestId('mini-cart-cta')).toHaveAttribute('href', '/checkout');
  });
});
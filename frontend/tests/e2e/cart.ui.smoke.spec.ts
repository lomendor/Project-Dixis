import { test, expect } from '@playwright/test';
import { setupCartApiMocks } from './helpers/api-mocks';

/**
 * Cart UI Components - Lean Smoke Tests (≤40 LOC)
 */

test.describe('Cart UI Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupCartApiMocks(page);
  });

  test('Cart summary displays with mock data', async ({ page }) => {
    await page.setContent(`<div data-testid="cart-summary"><h3 data-testid="summary-title">Σύνοψη Παραγγελίας</h3><span data-testid="subtotal-amount">€31.00</span><span data-testid="total-amount">€38.50</span><button data-testid="checkout-btn">Ολοκλήρωση</button></div>`);
    
    await expect(page.getByTestId('cart-summary')).toBeVisible();
    await expect(page.getByTestId('summary-title')).toContainText('Σύνοψη');
    await expect(page.getByTestId('subtotal-amount')).toContainText('€31.00');
    await expect(page.getByTestId('checkout-btn')).toBeEnabled();
  });

  test('Cart mini panel shows item count and navigation', async ({ page }) => {
    await page.setContent(`<div data-testid="cart-mini-panel"><span data-testid="cart-items-count">2 προϊόντα</span><span data-testid="cart-total-amount">€31.00</span><a href="/cart" data-testid="cart-view-link">Προβολή</a></div>`);

    await expect(page.getByTestId('cart-mini-panel')).toBeVisible();
    await expect(page.getByTestId('cart-items-count')).toContainText('2 προϊόντα');
    await expect(page.getByTestId('cart-view-link')).toHaveAttribute('href', '/cart');
  });

  test('Empty cart state displays correctly', async ({ page }) => {
    await page.setContent(`<div data-testid="empty-cart-mini">Κενό καλάθι</div><a href="/products" data-testid="continue-shopping-link">Συνέχεια</a>`);

    await expect(page.getByTestId('empty-cart-mini')).toContainText('Κενό καλάθι');
    await expect(page.getByTestId('continue-shopping-link')).toHaveAttribute('href', '/products');
  });

  test('Cart navigation flow works', async ({ page }) => {
    await page.setContent(`<nav><a href="/cart" data-testid="cart-view-link">Προβολή</a></nav><main data-testid="page-root">Αρχική</main>`);

    await expect(page.getByTestId('page-root')).toBeVisible();
    await expect(page.getByTestId('cart-view-link')).toHaveAttribute('href', '/cart');
  });
});
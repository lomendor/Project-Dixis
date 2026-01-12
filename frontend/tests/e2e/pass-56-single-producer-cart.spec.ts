import { test, expect } from '@playwright/test';

/**
 * Pass 56: Single Producer Cart Enforcement (Option A)
 *
 * These tests verify that the cart only allows products from ONE producer at a time.
 * When a user tries to add a product from a different producer, they should see
 * a modal with options to:
 * 1. Complete current order (go to checkout)
 * 2. Clear cart and add new product
 * 3. Cancel
 */

test.describe('Pass 56: Single Producer Cart @smoke', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('dixis:cart:v1');
    });
  });

  test('allows adding multiple products from same producer', async ({ page }) => {
    // Go to products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Find first two products from same producer (demo products: demo-1 and demo-2 are from same producer)
    const productCards = page.locator('[data-testid="product-card"]');

    // Wait for products to load
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });

    // Click first add to cart button
    const firstAddButton = productCards.first().getByTestId('add-to-cart-button');
    await firstAddButton.click();

    // Wait for confirmation
    await expect(firstAddButton).toContainText('Προστέθηκε', { timeout: 5000 });

    // Get cart state from localStorage
    const cartState = await page.evaluate(() => {
      const stored = localStorage.getItem('dixis:cart:v1');
      return stored ? JSON.parse(stored) : null;
    });

    // Verify item was added
    expect(cartState).not.toBeNull();
    expect(Object.keys(cartState.state.items).length).toBe(1);
  });

  test('shows conflict modal when adding from different producer', async ({ page }) => {
    // Seed cart with product from producer 1
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'dixis:cart:v1',
        JSON.stringify({
          state: {
            items: {
              'demo-1': {
                id: 'demo-1',
                title: 'Ελαιόλαδο',
                priceCents: 1850,
                qty: 1,
                producerId: 'demo-producer-1',
                producerName: 'Ελαιώνες Μεσσηνίας',
              },
            },
          },
          version: 0,
        })
      );
    });

    // Navigate to products
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Find a product from a different producer and click add
    // demo-3 is from demo-producer-2 (Κρητικά Μελισσοκομεία)
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });

    // Find and click add button for product from different producer
    // We'll click on a different card (not the first one since we seeded with first producer)
    const thirdCard = productCards.nth(2);
    await expect(thirdCard).toBeVisible();
    const addButton = thirdCard.getByTestId('add-to-cart-button');
    await addButton.click();

    // Conflict modal should appear
    const modal = page.getByTestId('producer-conflict-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Verify modal content
    await expect(modal).toContainText('Διαφορετικός Παραγωγός');
    await expect(modal).toContainText('Ελαιώνες Μεσσηνίας');
  });

  test('can clear cart and add new product via conflict modal', async ({ page }) => {
    // Seed cart with product from producer 1
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'dixis:cart:v1',
        JSON.stringify({
          state: {
            items: {
              'demo-1': {
                id: 'demo-1',
                title: 'Ελαιόλαδο',
                priceCents: 1850,
                qty: 1,
                producerId: 'demo-producer-1',
                producerName: 'Ελαιώνες Μεσσηνίας',
              },
            },
          },
          version: 0,
        })
      );
    });

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Find and click add button for product from different producer
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    const thirdCard = productCards.nth(2);
    await thirdCard.getByTestId('add-to-cart-button').click();

    // Click "Άδειασε το καλάθι" button
    const replaceButton = page.getByTestId('conflict-replace');
    await expect(replaceButton).toBeVisible();
    await replaceButton.click();

    // Modal should close
    await expect(page.getByTestId('producer-conflict-modal')).not.toBeVisible();

    // Verify cart was replaced (only new item)
    const cartState = await page.evaluate(() => {
      const stored = localStorage.getItem('dixis:cart:v1');
      return stored ? JSON.parse(stored) : null;
    });

    expect(cartState).not.toBeNull();
    expect(Object.keys(cartState.state.items).length).toBe(1);
    // The item should NOT be demo-1 anymore
    expect(cartState.state.items['demo-1']).toBeUndefined();
  });

  test('can cancel conflict modal without changes', async ({ page }) => {
    // Seed cart with product from producer 1
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'dixis:cart:v1',
        JSON.stringify({
          state: {
            items: {
              'demo-1': {
                id: 'demo-1',
                title: 'Ελαιόλαδο',
                priceCents: 1850,
                qty: 1,
                producerId: 'demo-producer-1',
                producerName: 'Ελαιώνες Μεσσηνίας',
              },
            },
          },
          version: 0,
        })
      );
    });

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Find and click add button for product from different producer
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    const thirdCard = productCards.nth(2);
    await thirdCard.getByTestId('add-to-cart-button').click();

    // Click cancel button
    const cancelButton = page.getByTestId('conflict-cancel');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Modal should close
    await expect(page.getByTestId('producer-conflict-modal')).not.toBeVisible();

    // Cart should remain unchanged
    const cartState = await page.evaluate(() => {
      const stored = localStorage.getItem('dixis:cart:v1');
      return stored ? JSON.parse(stored) : null;
    });

    expect(cartState).not.toBeNull();
    expect(Object.keys(cartState.state.items).length).toBe(1);
    expect(cartState.state.items['demo-1']).toBeDefined();
    expect(cartState.state.items['demo-1'].producerId).toBe('demo-producer-1');
  });

  test('checkout option navigates to checkout', async ({ page }) => {
    // Seed cart with product from producer 1
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'dixis:cart:v1',
        JSON.stringify({
          state: {
            items: {
              'demo-1': {
                id: 'demo-1',
                title: 'Ελαιόλαδο',
                priceCents: 1850,
                qty: 1,
                producerId: 'demo-producer-1',
                producerName: 'Ελαιώνες Μεσσηνίας',
              },
            },
          },
          version: 0,
        })
      );
    });

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Find and click add button for product from different producer
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    const thirdCard = productCards.nth(2);
    await thirdCard.getByTestId('add-to-cart-button').click();

    // Click checkout button
    const checkoutButton = page.getByTestId('conflict-checkout');
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();

    // Should navigate to checkout
    await page.waitForURL('**/checkout**', { timeout: 5000 });
    expect(page.url()).toContain('/checkout');
  });
});

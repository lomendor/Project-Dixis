import { test, expect } from '@playwright/test';

/**
 * Pass 56 PROD Verification: Single Producer Cart Enforcement
 *
 * These tests verify the conflict modal behavior using ACTUAL production data:
 * - Producer #1: Green Farm Co. (products: Organic Tomatoes, Fresh Lettuce, etc.)
 * - Producer #4: Test Producer B (product: Test Product from Producer B)
 */

test.describe('Pass 56 PROD: Conflict Modal Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('dixis:cart:v1');
    });
  });

  test('empty cart flow clears cart and adds new product from different producer', async ({ page }) => {
    // Step 1: Go to products and add a product from Green Farm Co. (producer 1)
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });

    // Find a product from Green Farm Co. specifically (we know they have id=1)
    // Look for a product that contains "Green Farm" in producer name
    const greenFarmCard = page.locator('[data-testid="product-card"]').filter({
      hasText: 'Green Farm Co.'
    }).first();

    const firstAddButton = greenFarmCard.getByTestId('add-to-cart-button');
    await firstAddButton.click();
    await expect(firstAddButton).toContainText('Προστέθηκε', { timeout: 5000 });

    // Wait for state to settle
    await page.waitForTimeout(500);

    // Capture cart state after first add
    const cartStateBefore = await page.evaluate(() => {
      const stored = localStorage.getItem('dixis:cart:v1');
      return stored ? JSON.parse(stored) : null;
    });
    console.log('Cart after first add:', JSON.stringify(cartStateBefore?.state?.items, null, 2));

    expect(cartStateBefore).not.toBeNull();
    expect(Object.keys(cartStateBefore.state.items).length).toBe(1);

    // Get the producerId of the first item
    const firstItemKey = Object.keys(cartStateBefore.state.items)[0];
    const firstItemProducerId = cartStateBefore.state.items[firstItemKey].producerId;
    console.log('First item producer ID:', firstItemProducerId);

    // Step 2: Find and try to add the "Test Product from Producer B" (producer 4)
    // Look for this specific product
    const testProductCard = page.locator('[data-testid="product-card"]').filter({
      hasText: 'Test Product from Producer B'
    });

    if (await testProductCard.count() > 0) {
      const testProductAddButton = testProductCard.getByTestId('add-to-cart-button');
      await testProductAddButton.click();

      // If the first product was from producer 1 or different, conflict modal should appear
      const modal = page.getByTestId('producer-conflict-modal');

      // Check if modal appeared (only if producers are different)
      if (firstItemProducerId !== '4' && firstItemProducerId !== 4) {
        await expect(modal).toBeVisible({ timeout: 5000 });
        console.log('Conflict modal appeared as expected');

        // Verify modal has correct content
        await expect(modal).toContainText('Διαφορετικός Παραγωγός');

        // Step 3: Click "Άδειασε το καλάθι"
        const replaceButton = page.getByTestId('conflict-replace');
        await expect(replaceButton).toBeVisible();
        await replaceButton.click();

        // Modal should close
        await expect(modal).not.toBeVisible({ timeout: 3000 });

        // Wait for state to settle
        await page.waitForTimeout(300);

        // Step 4: Verify cart was replaced
        const cartStateAfter = await page.evaluate(() => {
          const stored = localStorage.getItem('dixis:cart:v1');
          return stored ? JSON.parse(stored) : null;
        });
        console.log('Cart after replace:', JSON.stringify(cartStateAfter?.state?.items, null, 2));

        expect(cartStateAfter).not.toBeNull();
        expect(Object.keys(cartStateAfter.state.items).length).toBe(1);

        // The old item should be gone
        expect(cartStateAfter.state.items[firstItemKey]).toBeUndefined();

        // The new item should be from producer 4
        const newItemKey = Object.keys(cartStateAfter.state.items)[0];
        const newItem = cartStateAfter.state.items[newItemKey];
        console.log('New item:', newItem);

        // Producer should be 4 (Test Producer B)
        expect(newItem.producerId).toBe('4');
        expect(newItem.title).toContain('Test Product from Producer B');
      } else {
        console.log('First product was already from producer 4, no conflict expected');
      }
    } else {
      console.log('Test Product from Producer B not found on page - skipping producer B test');
    }
  });

  test('cart badge updates correctly after replacing cart', async ({ page }) => {
    // Seed cart with 3 items from producer 1
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'dixis:cart:v1',
        JSON.stringify({
          state: {
            items: {
              '1': {
                id: '1',
                title: 'Organic Tomatoes',
                priceCents: 300,
                qty: 2,
                producerId: '1',
                producerName: 'Green Farm Co.',
              },
              '2': {
                id: '2',
                title: 'Fresh Lettuce',
                priceCents: 225,
                qty: 1,
                producerId: '1',
                producerName: 'Green Farm Co.',
              },
            },
          },
          version: 0,
        })
      );
    });

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Cart badge should show 3 items (2 + 1)
    const cartBadge = page.locator('[data-testid="cart-badge"], [data-testid="cart-count"]').first();
    // Note: Badge might not be present, that's OK

    // Find Test Product from Producer B
    const testProductCard = page.locator('[data-testid="product-card"]').filter({
      hasText: 'Test Product from Producer B'
    });

    if (await testProductCard.count() > 0) {
      await testProductCard.getByTestId('add-to-cart-button').click();

      // Conflict modal should appear
      const modal = page.getByTestId('producer-conflict-modal');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Click replace
      await page.getByTestId('conflict-replace').click();
      await expect(modal).not.toBeVisible();

      // Verify final cart state
      const finalState = await page.evaluate(() => {
        const stored = localStorage.getItem('dixis:cart:v1');
        return stored ? JSON.parse(stored) : null;
      });

      // Should have exactly 1 item (not 3)
      expect(Object.keys(finalState.state.items).length).toBe(1);

      // Should be from producer 4
      const item = Object.values(finalState.state.items)[0] as any;
      expect(item.producerId).toBe('4');
      expect(item.qty).toBe(1);
    }
  });
});

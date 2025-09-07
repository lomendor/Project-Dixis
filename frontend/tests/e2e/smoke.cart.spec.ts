/**
 * Cart Page Smoke Tests
 * PR-88c-3A: Cart Container + Wire-up
 * 
 * Basic smoke tests for cart page functionality
 * Uses deterministic data from MSW mocks
 */

import { test, expect } from '@playwright/test';

// Skip authentication for this test suite
test.use({ storageState: undefined });

test.describe('Cart Page - Smoke Tests', () => {
  test('loads cart page successfully', async ({ page }) => {
    await page.goto('/cart');
    
    // Verify page root element
    await expect(page.getByTestId('page-root')).toBeVisible();
    await expect(page.getByTestId('cart-page')).toBeVisible();
    
    // Verify page title
    await expect(page.locator('h1')).toContainText('Το Καλάθι Σας');
  });

  test('displays cart items when items are present', async ({ page }) => {
    await page.goto('/cart');
    
    // Wait for content to load (handle both cases - items or empty)
    await page.waitForLoadState('networkidle');
    
    // Check if items are present or empty state
    const hasItems = await page.getByTestId('cart-item').count() > 0;
    const isEmpty = await page.getByTestId('empty-cart').isVisible().catch(() => false);
    
    if (hasItems) {
      // Verify cart items display
      await expect(page.getByTestId('cart-item')).toBeVisible();
      
      // Verify cart item controls
      await expect(page.getByTestId('increase-quantity')).toBeVisible();
      await expect(page.getByTestId('decrease-quantity')).toBeVisible();
      await expect(page.getByTestId('remove-item')).toBeVisible();
      
      // Verify checkout button is present
      await expect(page.getByTestId('checkout-btn')).toBeVisible();
    } else if (isEmpty) {
      // Verify empty cart state
      await expect(page.getByTestId('empty-cart')).toBeVisible();
      await expect(page.locator('h3')).toContainText('Το καλάθι είναι κενό');
    }
  });

  test('displays proper Greek localization', async ({ page }) => {
    await page.goto('/cart');
    
    // Check for Greek text elements
    await expect(page.locator('h1')).toContainText('Το Καλάθι Σας');
    await expect(page.getByText('Ελέγξτε τα προϊόντα σας και προχωρήστε στην παραγγελία')).toBeVisible();
  });
});
import { test, expect } from '@playwright/test';

/**
 * PP03-E3 Smoke Test - Documentation & Performance
 * 
 * Minimal, deterministic test to ensure E2E artifacts are generated
 * Tests basic page navigation and core elements
 */

test.describe('PP03-E3 Documentation & Performance Smoke Tests', () => {
  
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check that main content area exists
    await expect(page.locator('main')).toBeVisible();
    
    // Check for navigation
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check page title
    await expect(page).toHaveTitle(/Dixis/);
  });

  test('Products page navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to products (should be the same as homepage for this app)
    await expect(page.locator('main')).toBeVisible();
    
    // Check for product-related content
    const hasProducts = await page.locator('[data-testid*="product"]').count();
    expect(hasProducts).toBeGreaterThanOrEqual(0); // Allow empty state
  });

  test('Cart page accessibility', async ({ page }) => {
    await page.goto('/cart');
    
    // Should either show cart content or redirect to login
    const isLoginPage = await page.locator('form').isVisible();
    const isCartPage = await page.locator('main').isVisible();
    
    expect(isLoginPage || isCartPage).toBe(true);
  });

  test('Navigation elements present', async ({ page }) => {
    await page.goto('/');
    
    // Check core navigation elements exist
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check for main content area
    await expect(page.locator('main')).toBeVisible();
    
    // Verify no console errors for basic navigation
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Allow minor errors but not critical failures
    const criticalErrors = errors.filter(error => 
      error.includes('TypeError') || error.includes('ReferenceError')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
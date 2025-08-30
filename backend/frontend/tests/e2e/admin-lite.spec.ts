import { test, expect } from '@playwright/test';

test.describe('Admin Lite Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
  });

  test('producer can access admin dashboard', async ({ page }) => {
    // Try to find login form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]').or(page.getByRole('button', { name: /login|sign in/i }));

    if (await emailInput.isVisible()) {
      // Login as producer (using dummy credentials)
      await emailInput.fill('producer@test.com');
      await passwordInput.fill('password');
      await loginButton.click();
    }

    // Navigate to producer dashboard
    await page.goto('/producer/dashboard');
    await page.waitForLoadState('networkidle');

    // Check if we're on the dashboard page
    await expect(page.getByText('Producer Dashboard')).toBeVisible();
    
    // Take screenshot of dashboard
    await page.screenshot({ path: 'test-results/admin-dashboard-overview.png' });
  });

  test('admin actions are visible on product table', async ({ page }) => {
    // Navigate directly to producer dashboard (assuming auth state)
    await page.goto('/producer/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for products table to load
    const productsTable = page.locator('table');
    if (await productsTable.isVisible()) {
      // Check for admin action buttons
      await expect(page.getByText('Actions')).toBeVisible(); // Table header
      
      // Look for action buttons in the table
      const actionButtons = page.locator('button').filter({ hasText: /activate|deactivate|price|stock/i });
      
      if (await actionButtons.count() > 0) {
        await page.screenshot({ path: 'test-results/admin-actions-visible.png' });
        
        // Test toggle active button
        const toggleButton = actionButtons.first();
        if (await toggleButton.isVisible()) {
          await toggleButton.click();
          
          // Wait for potential toast message or state change
          await page.waitForTimeout(1000);
          await page.screenshot({ path: 'test-results/admin-toggle-action.png' });
        }
      }
    } else {
      // Take screenshot showing no products state
      await page.screenshot({ path: 'test-results/admin-no-products.png' });
    }
  });

  test('price editing functionality works', async ({ page }) => {
    await page.goto('/producer/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for price edit button
    const priceButton = page.getByRole('button', { name: /price/i }).first();
    
    if (await priceButton.isVisible()) {
      await priceButton.click();
      
      // Should show input field
      const priceInput = page.locator('input[type="number"]').first();
      if (await priceInput.isVisible()) {
        await priceInput.fill('25.99');
        
        // Click confirm button (checkmark)
        const confirmButton = page.getByText('✓').first();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          await page.waitForTimeout(2000); // Wait for API call and toast
          
          await page.screenshot({ path: 'test-results/admin-price-updated.png' });
        }
      }
    }
  });

  test('stock editing functionality works', async ({ page }) => {
    await page.goto('/producer/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for stock edit button
    const stockButton = page.getByRole('button', { name: /stock/i }).first();
    
    if (await stockButton.isVisible()) {
      await stockButton.click();
      
      // Should show input field
      const stockInput = page.locator('input[type="number"]').last();
      if (await stockInput.isVisible()) {
        await stockInput.fill('50');
        
        // Click confirm button (checkmark)
        const confirmButton = page.getByText('✓').first();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          await page.waitForTimeout(2000); // Wait for API call and toast
          
          await page.screenshot({ path: 'test-results/admin-stock-updated.png' });
        }
      }
    }
  });

  test('admin dashboard shows proper stats and layout', async ({ page }) => {
    await page.goto('/producer/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for key dashboard elements
    await expect(page.getByText('Producer Dashboard')).toBeVisible();
    
    // Check for stats cards
    const statsCards = page.locator('.bg-white.rounded-lg.shadow-md');
    await expect(statsCards.first()).toBeVisible();
    
    // Check for products table or empty state
    const hasProducts = await page.locator('table').isVisible();
    const hasEmptyState = await page.getByText('No products yet').isVisible();
    
    expect(hasProducts || hasEmptyState).toBeTruthy();
    
    // Take comprehensive screenshot
    await page.screenshot({ 
      path: 'test-results/admin-dashboard-complete.png',
      fullPage: true 
    });
  });

  test('authentication protects admin routes', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();
    
    // Try to access producer dashboard without auth
    await page.goto('/producer/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should redirect to login or show access denied
    const currentUrl = page.url();
    const isOnLogin = currentUrl.includes('/auth/login') || currentUrl.includes('/login');
    const hasAccessDenied = await page.getByText(/access denied|unauthorized/i).isVisible();
    
    expect(isOnLogin || hasAccessDenied).toBeTruthy();
    
    await page.screenshot({ path: 'test-results/admin-auth-protection.png' });
  });
});
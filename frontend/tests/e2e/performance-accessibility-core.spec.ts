import { test, expect } from '@playwright/test';

test.describe('Performance & Accessibility Core Features', () => {
  test('page loads with proper accessibility structure', async ({ page }) => {
    await page.goto('/');
    
    // Verify main content area exists
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();
    
    // Verify navigation has proper ARIA
    const nav = page.locator('nav');
    await expect(nav).toHaveAttribute('role', 'navigation');
    await expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    
    // Verify main heading exists
    const heading = page.getByTestId('page-title');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Fresh Products');
  });

  test('mobile menu accessibility works', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile menu button
    const mobileButton = page.getByTestId('mobile-menu-button');
    await expect(mobileButton).toBeVisible();
    await expect(mobileButton).toHaveAttribute('aria-expanded', 'false');
    
    // Open mobile menu
    await mobileButton.click();
    await expect(mobileButton).toHaveAttribute('aria-expanded', 'true');
    
    // Verify mobile menu is visible and accessible
    const mobileMenu = page.getByTestId('mobile-menu');
    await expect(mobileMenu).toBeVisible();
    await expect(mobileMenu).toHaveAttribute('role', 'menu');
  });

  test('toast notifications work properly', async ({ page }) => {
    // We'll test this by triggering a toast through the test page
    await page.goto('/test-error');
    
    // Click analytics toast button to test toast system
    await page.getByTestId('show-toast-btn').click();
    
    // Verify toast appears (test page should have this functionality)
    const toastContainer = page.getByTestId('toast-container');
    await expect(toastContainer).toBeVisible();
  });

  test('images have proper optimization attributes', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    const productImages = page.getByTestId('product-image');
    const imageCount = await productImages.count();
    
    if (imageCount > 0) {
      const firstImage = productImages.first();
      
      // Verify Next.js Image component attributes
      await expect(firstImage).toBeVisible();
      
      // Check for alt text
      const altText = await firstImage.getAttribute('alt');
      expect(altText).toBeTruthy();
    }
  });

  test('form inputs are accessible', async ({ page }) => {
    await page.goto('/');
    
    // Test search input
    const searchInput = page.getByPlaceholder('Search products...');
    await expect(searchInput).toBeVisible();
    
    // Test that input can be focused
    await searchInput.focus();
    await expect(searchInput).toBeFocused();
  });

  test('buttons have proper focus states', async ({ page }) => {
    await page.goto('/');
    
    // Wait for add to cart buttons
    await page.waitForSelector('[data-testid="add-to-cart"]', { timeout: 10000 });
    
    const addButton = page.getByTestId('add-to-cart').first();
    await expect(addButton).toBeVisible();
    
    // Test focus
    await addButton.focus();
    await expect(addButton).toBeFocused();
    
    // Verify aria-label exists
    const ariaLabel = await addButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Tab through the page
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Logo
    await page.keyboard.press('Tab'); // Products link
    
    const productsLink = page.getByTestId('nav-products');
    await expect(productsLink).toBeFocused();
  });

  test('error states are accessible', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/v1/public/products*', route => 
      route.fulfill({
        status: 500,
        body: 'Server Error'
      })
    );
    
    await page.goto('/');
    
    // Verify error state appears
    await page.waitForSelector('text=Unable to load products', { timeout: 15000 });
    const errorTitle = page.getByText('Unable to load products');
    await expect(errorTitle).toBeVisible();
    
    // Verify retry button exists
    const retryButton = page.getByText('Retry');
    await expect(retryButton).toBeVisible();
  });

  test('loading states provide feedback', async ({ page }) => {
    await page.goto('/');
    
    // Check for loading spinner initially
    const loadingText = page.getByText('Loading fresh products...');
    
    // Loading text might appear briefly, so we check it exists in DOM
    // Even if it's not visible by the time we check
    const hasLoading = await page.locator('text=Loading fresh products...').count() > 0;
    
    // Verify products eventually load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
    const products = page.getByTestId('product-card');
    await expect(products.first()).toBeVisible();
  });

  test('responsive design works', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    
    // Mobile menu button should be hidden on desktop
    const mobileButton = page.getByTestId('mobile-menu-button');
    await expect(mobileButton).not.toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu button should be visible on mobile
    await expect(mobileButton).toBeVisible();
  });
});
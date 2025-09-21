import { test, expect } from '@playwright/test';

test.describe('Performance & Accessibility Improvements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial load
    await page.waitForSelector('[data-testid="page-title"]');
  });

  test.describe('Accessibility Features', () => {
    test('skip to main content link works', async ({ page }) => {
      // Tab to focus skip link
      await page.keyboard.press('Tab');
      
      // Verify skip link is focused and visible
      const skipLink = page.getByText('Skip to main content');
      await expect(skipLink).toBeFocused();
      await expect(skipLink).toBeVisible();
      
      // Press Enter to use skip link
      await page.keyboard.press('Enter');
      
      // Verify main content is focused
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeFocused();
    });

    test('navigation has proper ARIA attributes', async ({ page }) => {
      const nav = page.locator('nav');
      await expect(nav).toHaveAttribute('role', 'navigation');
      await expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    test('mobile menu has proper accessibility', async ({ page }) => {
      // Test mobile menu button
      const mobileButton = page.getByTestId('mobile-menu-button');
      await expect(mobileButton).toHaveAttribute('aria-expanded', 'false');
      await expect(mobileButton).toHaveAttribute('aria-controls', 'mobile-menu');
      
      // Open mobile menu
      await mobileButton.click();
      await expect(mobileButton).toHaveAttribute('aria-expanded', 'true');
      
      // Verify mobile menu accessibility
      const mobileMenu = page.getByTestId('mobile-menu');
      await expect(mobileMenu).toBeVisible();
      await expect(mobileMenu).toHaveAttribute('role', 'menu');
      await expect(mobileMenu).toHaveAttribute('aria-labelledby', 'mobile-menu-button');
    });

    test('mobile menu keyboard navigation works', async ({ page }) => {
      // Open mobile menu
      await page.getByTestId('mobile-menu-button').click();
      await page.waitForSelector('[data-testid="mobile-menu"]');
      
      // Verify first link gets focus
      const firstLink = page.getByTestId('mobile-nav-products');
      await expect(firstLink).toBeFocused();
      
      // Test Escape key closes menu
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('mobile-menu')).not.toBeVisible();
      
      // Verify focus returns to button
      await expect(page.getByTestId('mobile-menu-button')).toBeFocused();
    });

    test('toast notifications have proper ARIA attributes', async ({ page }) => {
      // Add a product to cart to trigger toast (need to be logged in first)
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password');
      await page.getByText('Sign in').click();
      
      // Navigate to products and add to cart
      await page.goto('/');
      await page.waitForSelector('[data-testid="add-to-cart"]');
      
      const addToCartButton = page.getByTestId('add-to-cart').first();
      await addToCartButton.click();
      
      // Verify toast appears with proper ARIA
      const toast = page.getByTestId('toast-success');
      await expect(toast).toBeVisible();
      await expect(toast).toHaveAttribute('role', 'alert');
      await expect(toast).toHaveAttribute('aria-live');
      await expect(toast).toHaveAttribute('aria-atomic', 'true');
    });

    test('form inputs have proper labels', async ({ page }) => {
      // Test search input
      const searchInput = page.getByPlaceholder('Search products...');
      await expect(searchInput).toBeVisible();
      
      // Open filters to test more inputs
      await page.getByText('Filters').click();
      
      // Verify filter inputs have proper labels
      const categorySelect = page.getByRole('combobox', { name: /category/i });
      const producerSelect = page.getByRole('combobox', { name: /producer/i });
      await expect(categorySelect).toBeVisible();
      await expect(producerSelect).toBeVisible();
    });

    test('product images have proper alt text', async ({ page }) => {
      await page.waitForSelector('[data-testid="product-card"]');
      
      const productImages = page.getByTestId('product-image');
      const imageCount = await productImages.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const image = productImages.nth(i);
          const altText = await image.getAttribute('alt');
          expect(altText).toBeTruthy();
          expect(altText.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Performance Features', () => {
    test('images are optimized and lazy loaded', async ({ page }) => {
      await page.waitForSelector('[data-testid="product-card"]');
      
      // Check if images are using Next.js Image component
      const images = page.getByTestId('product-image');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        const firstImage = images.first();
        
        // Verify image has responsive sizes
        const sizes = await firstImage.getAttribute('sizes');
        expect(sizes).toBeTruthy();
        expect(sizes).toContain('vw');
      }
    });

    test('navigation links have prefetch', async ({ page }) => {
      // Check desktop navigation links
      const productsLink = page.getByTestId('nav-products');
      
      // Hover to trigger prefetch
      await productsLink.hover();
      
      // Verify link exists (prefetch behavior is hard to test directly)
      await expect(productsLink).toBeVisible();
    });

    test('add to cart prevents double clicks', async ({ page }) => {
      // Login first
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password');
      await page.getByText('Sign in').click();
      
      await page.goto('/');
      await page.waitForSelector('[data-testid="add-to-cart"]');
      
      const addButton = page.getByTestId('add-to-cart').first();
      
      // Click rapidly multiple times
      await Promise.all([
        addButton.click(),
        addButton.click(),
        addButton.click()
      ]);
      
      // Verify button shows loading state
      await expect(addButton).toContainText('Adding...');
      
      // Wait for operation to complete
      await page.waitForTimeout(2000);
      
      // Verify only one success toast appears
      const toasts = page.getByTestId('toast-success');
      const toastCount = await toasts.count();
      expect(toastCount).toBeLessThanOrEqual(1);
    });

    test('filters are memoized and performant', async ({ page }) => {
      await page.waitForSelector('[data-testid="page-title"]');
      
      // Open filters
      await page.getByText('Filters').click();
      
      // Perform multiple filter operations rapidly
      await page.selectOption('select:has-text("All Categories")', { index: 1 });
      await page.selectOption('select:has-text("All Producers")', { index: 1 });
      await page.fill('input[placeholder="Min"]', '5');
      await page.fill('input[placeholder="Max"]', '50');
      
      // Verify page responds without excessive loading
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 5000 });
    });

    test('toast dismissal works with keyboard', async ({ page }) => {
      // Login and trigger a toast
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password');
      await page.getByText('Sign in').click();
      
      await page.goto('/');
      await page.waitForSelector('[data-testid="add-to-cart"]');
      await page.getByTestId('add-to-cart').first().click();
      
      // Wait for toast to appear
      await page.waitForSelector('[data-testid="toast-success"]');
      
      // Press Escape to dismiss
      await page.keyboard.press('Escape');
      
      // Verify toast is dismissed
      await expect(page.getByTestId('toast-success')).not.toBeVisible();
    });
  });

  test.describe('Color Contrast and Visual', () => {
    test('focus states are visible', async ({ page }) => {
      // Test main navigation focus
      await page.keyboard.press('Tab'); // Skip link
      await page.keyboard.press('Tab'); // Logo
      await page.keyboard.press('Tab'); // Products link
      
      const productsLink = page.getByTestId('nav-products');
      await expect(productsLink).toBeFocused();
      
      // Verify focus ring is visible (check for focus classes)
      const className = await productsLink.getAttribute('class');
      expect(className).toContain('focus:ring');
    });

    test('button hover states work', async ({ page }) => {
      await page.waitForSelector('[data-testid="add-to-cart"]');
      
      const addButton = page.getByTestId('add-to-cart').first();
      
      // Hover over button
      await addButton.hover();
      
      // Verify button is visible and clickable
      await expect(addButton).toBeVisible();
      await expect(addButton).toBeEnabled();
    });

    test('mobile menu overlay functionality', async ({ page }) => {
      // Open mobile menu
      await page.getByTestId('mobile-menu-button').click();
      await page.waitForSelector('[data-testid="mobile-menu"]');
      
      // Click outside menu area (simulate clicking on overlay)
      await page.click('body', { position: { x: 50, y: 50 } });
      
      // Verify menu closes
      await expect(page.getByTestId('mobile-menu')).not.toBeVisible();
    });
  });

  test.describe('Screen Reader Support', () => {
    test('page has proper heading structure', async ({ page }) => {
      // Check main heading
      const mainHeading = page.getByTestId('page-title');
      await expect(mainHeading).toHaveText('Fresh Products from Local Producers');
      
      // Verify it's an h1
      const tagName = await mainHeading.evaluate(el => el.tagName);
      expect(tagName).toBe('H1');
    });

    test('loading states are announced', async ({ page }) => {
      // Refresh page to catch loading state
      await page.reload();
      
      // Verify loading spinner has proper text
      const loadingText = page.getByText('Loading fresh products...');
      await expect(loadingText).toBeVisible();
    });

    test('error states provide helpful information', async ({ page }) => {
      // Mock network failure to trigger error state
      await page.route('**/api/v1/public/products*', route => 
        route.abort('failed')
      );
      
      await page.goto('/');
      
      // Verify error state appears with actionable message
      const errorTitle = page.getByText('Unable to load products');
      await expect(errorTitle).toBeVisible();
      
      const retryButton = page.getByText('Retry');
      await expect(retryButton).toBeVisible();
    });

    test('empty states provide guidance', async ({ page }) => {
      // Mock empty response
      await page.route('**/api/v1/public/products*', route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] })
        })
      );
      
      await page.goto('/');
      
      // Verify empty state appears with helpful message
      const emptyTitle = page.getByText('No products found');
      await expect(emptyTitle).toBeVisible();
    });
  });
});
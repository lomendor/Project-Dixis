import { test, expect, Page } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

// Performance thresholds based on Core Web Vitals
const PERFORMANCE_THRESHOLDS = {
  LCP: 2500, // ms - Good: ≤2.5s
  FID: 100,  // ms - Good: ≤100ms
  CLS: 0.1,  // Good: ≤0.1
  FCP: 1800, // ms - Good: ≤1.8s
  TTFB: 800, // ms - Good: ≤0.8s
};

test.describe('PP03-F: Accessibility & Performance Excellence', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      // Collect Core Web Vitals
      window.webVitals = {};
      
      // LCP observer
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              window.webVitals.lcp = lastEntry.startTime;
            }
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {}
        
        // FID observer
        try {
          const fidObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              window.webVitals.fid = entry.processingStart - entry.startTime;
            });
          });
          fidObserver.observe({ type: 'first-input', buffered: true });
        } catch (e) {}
        
        // CLS observer
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (entry.value && entry.sources && entry.sources.length > 0) {
                clsValue += entry.value;
              }
            });
            window.webVitals.cls = clsValue;
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {}
        
        // FCP observer
        try {
          const fcpObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (entry.name === 'first-contentful-paint') {
                window.webVitals.fcp = entry.startTime;
              }
            });
          });
          fcpObserver.observe({ type: 'paint', buffered: true });
        } catch (e) {}
      }
      
      // TTFB from navigation timing
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          window.webVitals.ttfb = navigation.responseStart - navigation.requestStart;
        }
      });
    });

    // Inject axe for accessibility testing
    await injectAxe(page);
  });

  test('homepage meets accessibility and performance standards', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
    
    // === ACCESSIBILITY TESTS ===
    
    // Check for accessibility violations
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
    
    // Test skip links
    await test.step('Skip links work correctly', async () => {
      await page.keyboard.press('Tab');
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeFocused();
      await skipLink.press('Enter');
      
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeFocused();
    });
    
    // Test keyboard navigation
    await test.step('Keyboard navigation works', async () => {
      await page.keyboard.press('Tab'); // Skip link
      await page.keyboard.press('Tab'); // Logo
      await page.keyboard.press('Tab'); // Products link
      
      const productsLink = page.getByTestId('nav-products');
      await expect(productsLink).toBeFocused();
    });
    
    // Test ARIA labels and semantic markup
    await test.step('Proper ARIA implementation', async () => {
      // Navigation has proper ARIA
      const nav = page.locator('nav').first();
      await expect(nav).toHaveAttribute('role', 'navigation');
      await expect(nav).toHaveAttribute('aria-label', 'Main navigation');
      
      // Main content is properly identified
      const main = page.locator('#main-content');
      await expect(main).toBeVisible();
      
      // Product cards have proper structure
      const productCard = page.getByTestId('product-card').first();
      await expect(productCard).toHaveAttribute('role', 'article');
      
      // Images have alt text
      const productImage = page.getByTestId('product-image').first();
      const altText = await productImage.getAttribute('alt');
      expect(altText).toBeTruthy();
    });
    
    // Test color contrast and visual accessibility
    await test.step('Visual accessibility standards', async () => {
      // Check that focus indicators are visible
      const addToCartBtn = page.getByTestId('add-to-cart').first();
      await addToCartBtn.focus();
      
      // Verify the element has visible focus styling
      const focusStyles = await addToCartBtn.evaluate((el) => {
        const styles = window.getComputedStyle(el, ':focus-visible');
        return {
          outline: styles.outline,
          outlineColor: styles.outlineColor,
          outlineWidth: styles.outlineWidth,
        };
      });
      
      expect(focusStyles.outline).not.toBe('none');
    });
    
    // === PERFORMANCE TESTS ===
    
    await test.step('Core Web Vitals meet thresholds', async () => {
      // Wait for metrics to be collected
      await page.waitForTimeout(3000);
      
      const metrics = await page.evaluate(() => window.webVitals) as PerformanceMetrics;
      
      console.log('🚀 Performance Metrics:', metrics);
      
      // Test LCP (Largest Contentful Paint)
      if (metrics.lcp) {
        expect(metrics.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP);
        console.log(`✅ LCP: ${Math.round(metrics.lcp)}ms (threshold: ${PERFORMANCE_THRESHOLDS.LCP}ms)`);
      }
      
      // Test FID (First Input Delay)
      if (metrics.fid) {
        expect(metrics.fid).toBeLessThan(PERFORMANCE_THRESHOLDS.FID);
        console.log(`✅ FID: ${Math.round(metrics.fid)}ms (threshold: ${PERFORMANCE_THRESHOLDS.FID}ms)`);
      }
      
      // Test CLS (Cumulative Layout Shift)
      if (metrics.cls !== undefined) {
        expect(metrics.cls).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS);
        console.log(`✅ CLS: ${metrics.cls.toFixed(3)} (threshold: ${PERFORMANCE_THRESHOLDS.CLS})`);
      }
      
      // Test FCP (First Contentful Paint)
      if (metrics.fcp) {
        expect(metrics.fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP);
        console.log(`✅ FCP: ${Math.round(metrics.fcp)}ms (threshold: ${PERFORMANCE_THRESHOLDS.FCP}ms)`);
      }
      
      // Test TTFB (Time to First Byte)
      if (metrics.ttfb) {
        expect(metrics.ttfb).toBeLessThan(PERFORMANCE_THRESHOLDS.TTFB);
        console.log(`✅ TTFB: ${Math.round(metrics.ttfb)}ms (threshold: ${PERFORMANCE_THRESHOLDS.TTFB}ms)`);
      }
    });

    // Test image optimization
    await test.step('Images are optimized', async () => {
      const images = page.locator('img[data-testid="product-image"]');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        const firstImage = images.first();
        
        // Check for Next.js Image optimization attributes
        await expect(firstImage).toHaveAttribute('loading', 'lazy');
        await expect(firstImage).toHaveAttribute('sizes');
        
        // Verify image loads without layout shift
        const imageRect1 = await firstImage.boundingBox();
        await page.waitForTimeout(1000);
        const imageRect2 = await firstImage.boundingBox();
        
        if (imageRect1 && imageRect2) {
          expect(Math.abs(imageRect1.height - imageRect2.height)).toBeLessThan(5);
        }
      }
    });
  });

  test('mobile accessibility and performance', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
    
    // Test mobile-specific accessibility
    await test.step('Mobile navigation is accessible', async () => {
      const mobileMenuBtn = page.getByTestId('mobile-menu-button');
      await expect(mobileMenuBtn).toBeVisible();
      await expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'false');
      
      // Open mobile menu
      await mobileMenuBtn.click();
      await expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'true');
      
      // Check mobile menu accessibility
      const mobileMenu = page.getByTestId('mobile-menu');
      await expect(mobileMenu).toBeVisible();
      await expect(mobileMenu).toHaveAttribute('role', 'menu');
      
      // Test keyboard navigation in mobile menu
      await page.keyboard.press('Escape');
      await expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'false');
    });

    // Test touch targets
    await test.step('Touch targets meet minimum size', async () => {
      const buttons = page.locator('button, a[href]');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThan(44);
          expect(box.height).toBeGreaterThan(44);
        }
      }
    });

    // Check accessibility on mobile
    await checkA11y(page);
  });

  test('cart page accessibility and performance', async ({ page }) => {
    await page.goto('/cart');
    
    // Wait for cart content to load
    await page.waitForSelector('main', { timeout: 10000 });
    
    // Check accessibility
    await checkA11y(page, null, {
      detailedReport: true,
    });
    
    // Test empty cart state accessibility
    await test.step('Empty cart state is accessible', async () => {
      const emptyStateHeading = page.getByRole('heading', { name: /empty/i });
      if (await emptyStateHeading.count() > 0) {
        await expect(emptyStateHeading).toBeVisible();
        
        // Check that empty state has proper semantic structure
        const emptyState = page.locator('[role="status"], [aria-live="polite"]');
        expect(await emptyState.count()).toBeGreaterThan(0);
      }
    });

    // Performance on cart page
    await test.step('Cart page performance', async () => {
      await page.waitForTimeout(2000);
      const metrics = await page.evaluate(() => window.webVitals) as PerformanceMetrics;
      
      if (metrics.lcp) {
        expect(metrics.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP);
      }
    });
  });

  test('product detail page accessibility', async ({ page }) => {
    // Navigate to first product
    await page.goto('/');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
    
    const firstProductLink = page.getByRole('link', { name: /view details/i }).first();
    await firstProductLink.click();
    
    // Wait for product detail page to load
    await page.waitForSelector('main', { timeout: 10000 });
    
    // Check accessibility
    await checkA11y(page);
    
    await test.step('Product detail accessibility features', async () => {
      // Check for proper heading hierarchy
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      
      // Check for breadcrumb navigation
      const breadcrumbs = page.locator('[aria-label*="breadcrumb"], nav[aria-label*="Breadcrumb"]');
      if (await breadcrumbs.count() > 0) {
        await expect(breadcrumbs).toBeVisible();
      }
      
      // Test add to cart button accessibility
      const addToCartBtn = page.getByTestId('add-to-cart');
      if (await addToCartBtn.count() > 0) {
        const ariaLabel = await addToCartBtn.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    });
  });

  test('form accessibility and validation', async ({ page }) => {
    await page.goto('/');
    
    // Test search form
    await test.step('Search form is accessible', async () => {
      const searchInput = page.getByPlaceholder(/search products/i);
      await expect(searchInput).toBeVisible();
      
      // Test that input can be focused and used
      await searchInput.focus();
      await expect(searchInput).toBeFocused();
      
      await searchInput.fill('τομάτες');
      await page.keyboard.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Check that search results are announced
      const searchResults = page.locator('main');
      await expect(searchResults).toBeVisible();
    });
  });

  test('reduced motion preferences', async ({ page }) => {
    // Enable reduced motion preference
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query.includes('prefers-reduced-motion: reduce'),
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
      });
    });
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
    
    // Check that animations are disabled
    await test.step('Animations respect reduced motion', async () => {
      const animatedElements = page.locator('.animate-spin, .animate-bounce, .animate-pulse');
      const count = await animatedElements.count();
      
      // Should have fewer animated elements when reduced motion is preferred
      expect(count).toBeLessThan(5);
    });
  });

  test('screen reader compatibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
    
    await test.step('Screen reader landmarks', async () => {
      // Check for proper landmark roles
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();
      
      const nav = page.locator('nav, [role="navigation"]');
      await expect(nav).toBeVisible();
      
      // Check for skip links
      const skipLinks = page.locator('a[href^="#"]').first();
      await expect(skipLinks).toHaveText(/skip/i);
    });
    
    await test.step('Screen reader announcements', async () => {
      // Check for live regions
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
      expect(await liveRegions.count()).toBeGreaterThan(0);
      
      // Check for proper labeling
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const hasLabel = await button.evaluate((el) => {
          return !!(
            el.getAttribute('aria-label') ||
            el.getAttribute('aria-labelledby') ||
            el.textContent?.trim()
          );
        });
        expect(hasLabel).toBeTruthy();
      }
    });
  });
});

// Helper function to check Core Web Vitals
async function getWebVitals(page: Page): Promise<PerformanceMetrics> {
  return await page.evaluate(() => window.webVitals || {});
}

// Helper function to generate accessibility report
async function generateA11yReport(page: Page): Promise<void> {
  const violations = await getViolations(page);
  
  if (violations.length > 0) {
    console.log('❌ Accessibility Violations Found:');
    violations.forEach((violation, index) => {
      console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
      console.log(`   Impact: ${violation.impact}`);
      console.log(`   Elements: ${violation.nodes.length}`);
    });
  } else {
    console.log('✅ No accessibility violations found!');
  }
}
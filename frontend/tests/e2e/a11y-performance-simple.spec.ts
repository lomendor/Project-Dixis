import { test, expect, Page } from '@playwright/test';

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

test.describe('PP03-F: Accessibility & Performance Excellence (Simplified)', () => {
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
  });

  test('homepage basic accessibility and performance', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
    
    // === BASIC ACCESSIBILITY TESTS ===
    
    // Test skip links
    await test.step('Skip links work correctly', async () => {
      await page.keyboard.press('Tab');
      const skipLink = page.locator('a[href="#main-content"]').first();
      if (await skipLink.count() > 0) {
        await expect(skipLink).toBeVisible();
      }
    });
    
    // Test keyboard navigation
    await test.step('Keyboard navigation works', async () => {
      const focusableElements = page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const count = await focusableElements.count();
      expect(count).toBeGreaterThan(0);
    });
    
    // Test ARIA labels and semantic markup
    await test.step('Basic semantic structure', async () => {
      // Navigation has proper structure
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();
      
      // Main content exists
      const main = page.locator('main, #main-content');
      if (await main.count() > 0) {
        await expect(main.first()).toBeVisible();
      }
      
      // Images have alt text
      const images = page.locator('img[data-testid="product-image"]');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const img = images.nth(i);
        const altText = await img.getAttribute('alt');
        expect(altText).toBeTruthy();
      }
    });
    
    // === PERFORMANCE TESTS ===
    
    await test.step('Core Web Vitals meet thresholds', async () => {
      // Wait for metrics to be collected
      await page.waitForTimeout(3000);
      
      const metrics = await page.evaluate(() => window.webVitals || {}) as PerformanceMetrics;
      
      console.log('🚀 Performance Metrics:', metrics);
      
      // Test LCP (Largest Contentful Paint)
      if (metrics.lcp) {
        expect(metrics.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP);
        console.log(`✅ LCP: ${Math.round(metrics.lcp)}ms (threshold: ${PERFORMANCE_THRESHOLDS.LCP}ms)`);
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
        
        // Check for optimization attributes
        const loading = await firstImage.getAttribute('loading');
        const sizes = await firstImage.getAttribute('sizes');
        
        if (loading) {
          expect(['lazy', 'eager']).toContain(loading);
        }
        expect(sizes).toBeTruthy();
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
      if (await mobileMenuBtn.count() > 0) {
        await expect(mobileMenuBtn).toBeVisible();
        
        // Test mobile menu functionality
        await mobileMenuBtn.click();
        const mobileMenu = page.getByTestId('mobile-menu');
        if (await mobileMenu.count() > 0) {
          await expect(mobileMenu).toBeVisible();
        }
      }
    });

    // Test touch targets
    await test.step('Touch targets meet minimum size', async () => {
      const buttons = page.locator('button, a[href]');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        if (box && box.width > 0 && box.height > 0) {
          expect(box.width).toBeGreaterThan(40);
          expect(box.height).toBeGreaterThan(40);
        }
      }
    });
  });

  test('cart page accessibility and performance', async ({ page }) => {
    await page.goto('/cart');
    
    // Wait for cart content to load
    await page.waitForSelector('main', { timeout: 10000 });
    
    // Test form accessibility
    await test.step('Cart form is accessible', async () => {
      const labels = page.locator('label');
      const inputs = page.locator('input');
      
      const labelCount = await labels.count();
      const inputCount = await inputs.count();
      
      // Should have proper label-input relationships
      expect(labelCount).toBeGreaterThan(0);
      
      // Check for required field indicators
      const requiredFields = page.locator('input[required], input[aria-required="true"]');
      if (await requiredFields.count() > 0) {
        const firstRequired = requiredFields.first();
        const isMarked = await firstRequired.evaluate((el) => {
          const label = document.querySelector(`label[for="${el.id}"]`);
          return label?.textContent?.includes('*') || false;
        });
        expect(isMarked).toBeTruthy();
      }
    });
  });
});

// Helper function to check Core Web Vitals
async function getWebVitals(page: Page): Promise<PerformanceMetrics> {
  return await page.evaluate(() => window.webVitals || {});
}
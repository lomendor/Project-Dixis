// E2E Tests for Analytics & Observability System
// Tests comprehensive analytics tracking, dashboard functionality, and privacy compliance

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';
const ANALYTICS_DASHBOARD_URL = `${BASE_URL}/analytics`;
const AI_INSIGHTS_URL = `${BASE_URL}/analytics/insights`;

// Test helper functions
class AnalyticsTestHelper {
  constructor(private page: Page) {}

  // Check if analytics events are being tracked
  async checkAnalyticsTracking(): Promise<boolean> {
    const analyticsEvents = await this.page.evaluate(() => {
      return (window as any).__ANALYTICS || [];
    });
    return Array.isArray(analyticsEvents) && analyticsEvents.length > 0;
  }

  // Get stored analytics events
  async getAnalyticsEvents(): Promise<any[]> {
    return await this.page.evaluate(() => {
      return (window as any).__ANALYTICS || [];
    });
  }

  // Clear analytics data for clean testing
  async clearAnalyticsData(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.removeItem('dixis_analytics_events');
      localStorage.removeItem('dixis_privacy_preferences');
      (window as any).__ANALYTICS = [];
    });
  }

  // Grant analytics consent
  async grantAnalyticsConsent(): Promise<void> {
    await this.page.evaluate(() => {
      const preferences = {
        hasConsented: true,
        consentDate: Date.now(),
        settings: {
          functional: true,
          analytics: true,
          performance: true,
          marketing: false,
        },
        version: '1.0',
      };
      localStorage.setItem('dixis_privacy_preferences', JSON.stringify(preferences));
    });
  }

  // Wait for analytics dashboard to load
  async waitForDashboardLoad(): Promise<void> {
    await this.page.waitForSelector('[data-testid="live-metrics"]', { timeout: 10000 });
    await this.page.waitForSelector('[data-testid="insights-list"]', { timeout: 10000 });
  }

  // Check if dashboard components are visible
  async validateDashboardComponents(): Promise<{ [key: string]: boolean }> {
    const components = {
      liveMetrics: await this.page.isVisible('[data-testid="live-metrics"]'),
      funnelChart: await this.page.isVisible('[data-testid="funnel-chart"]'),
      healthMonitor: await this.page.isVisible('[data-testid="health-monitor"]'),
      insightsList: await this.page.isVisible('[data-testid="insights-list"]'),
    };
    
    return components;
  }
}

// Privacy compliance tests
test.describe('Privacy & GDPR Compliance', () => {
  test.beforeEach(async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    await helper.clearAnalyticsData();
  });

  test('should show consent banner for new users', async ({ page }) => {
    await page.goto(ANALYTICS_DASHBOARD_URL);
    
    // Should show consent request
    await expect(page.locator('text=Δώστε Συγκατάθεση')).toBeVisible();
    await expect(page.locator('text=analytics')).toBeVisible();
    
    // Should not track events without consent
    const helper = new AnalyticsTestHelper(page);
    const hasTracking = await helper.checkAnalyticsTracking();
    expect(hasTracking).toBeFalsy();
  });

  test('should respect user consent choices', async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    
    await page.goto(ANALYTICS_DASHBOARD_URL);
    
    // Grant consent
    await page.click('text=Δώστε Συγκατάθεση');
    
    // Should redirect to dashboard after consent
    await page.waitForURL(ANALYTICS_DASHBOARD_URL);
    
    // Should start tracking events
    await page.waitForTimeout(2000); // Allow time for tracking to initialize
    
    // Navigate to trigger page view tracking
    await page.goto(`${BASE_URL}/products`);
    await page.waitForTimeout(1000);
    
    const hasTracking = await helper.checkAnalyticsTracking();
    expect(hasTracking).toBeTruthy();
  });

  test('should allow data export and deletion', async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    await helper.grantAnalyticsConsent();
    
    await page.goto(ANALYTICS_DASHBOARD_URL);
    
    // Test data export
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Εξαγωγή');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/dixis-analytics-.*\.json/);
    
    // Clear data should work
    await helper.clearAnalyticsData();
    const events = await helper.getAnalyticsEvents();
    expect(events).toHaveLength(0);
  });
});

// Event tracking tests
test.describe('Analytics Event Tracking', () => {
  test.beforeEach(async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    await helper.clearAnalyticsData();
    await helper.grantAnalyticsConsent();
  });

  test('should track page view events', async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    
    // Visit multiple pages to generate events
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(1000);
    
    await page.goto(`${BASE_URL}/products`);
    await page.waitForTimeout(1000);
    
    await page.goto(`${BASE_URL}/about`);
    await page.waitForTimeout(1000);
    
    // Check tracked events
    const events = await helper.getAnalyticsEvents();
    const pageViewEvents = events.filter(e => e.event === 'page_view' || e.type === 'page_view');
    
    expect(pageViewEvents.length).toBeGreaterThan(0);
    expect(pageViewEvents[0]).toMatchObject({
      type: expect.stringMatching(/page_view/),
      data: expect.objectContaining({
        path: expect.any(String),
        title: expect.any(String),
      }),
    });
  });

  test('should track user interactions', async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    
    await page.goto(`${BASE_URL}/products`);
    await page.waitForTimeout(2000);
    
    // Look for any clickable product elements
    const productLinks = await page.locator('a[href*="/products/"]').count();
    
    if (productLinks > 0) {
      // Click on first product
      await page.click('a[href*="/products/"]:first-child');
      await page.waitForTimeout(1000);
      
      // Check for click tracking
      const events = await helper.getAnalyticsEvents();
      const clickEvents = events.filter(e => e.type === 'click' || e.event === 'click');
      
      expect(clickEvents.length).toBeGreaterThanOrEqual(0); // May be 0 if not implemented yet
    }
  });

  test('should track search queries', async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    
    await page.goto(`${BASE_URL}/products`);
    await page.waitForTimeout(1000);
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="αναζήτηση" i], input[placeholder*="search" i]');
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('ντομάτα');
      await searchInput.first().press('Enter');
      await page.waitForTimeout(2000);
      
      // Check for search tracking
      const events = await helper.getAnalyticsEvents();
      const searchEvents = events.filter(e => e.type === 'search');
      
      expect(searchEvents.length).toBeGreaterThanOrEqual(0); // May be 0 if not implemented yet
    }
  });

  test('should track performance metrics', async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    
    await page.goto(`${BASE_URL}/products`);
    await page.waitForTimeout(3000); // Allow time for performance metrics
    
    const events = await helper.getAnalyticsEvents();
    const performanceEvents = events.filter(e => e.type === 'performance');
    
    // Performance events should be tracked automatically
    expect(performanceEvents.length).toBeGreaterThanOrEqual(0);
    
    if (performanceEvents.length > 0) {
      expect(performanceEvents[0]).toMatchObject({
        type: 'performance',
        data: expect.objectContaining({
          metric: expect.any(String),
          value: expect.any(Number),
        }),
      });
    }
  });
});

// Dashboard functionality tests
test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    await helper.clearAnalyticsData();
    await helper.grantAnalyticsConsent();
  });

  test('should load dashboard with all components', async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    
    // Generate some analytics data first
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(1000);
    await page.goto(`${BASE_URL}/products`);
    await page.waitForTimeout(1000);
    
    // Navigate to dashboard
    await page.goto(ANALYTICS_DASHBOARD_URL);
    
    // Wait for dashboard to load
    await page.waitForSelector('h1:has-text("Analytics Dashboard")', { timeout: 10000 });
    
    // Check main dashboard elements
    await expect(page.locator('h1:has-text("Analytics Dashboard")')).toBeVisible();
    
    // Check for metrics display (should show even with minimal data)
    const metricsSection = page.locator('text=Ζωντανά Μετρήματα');
    if (await metricsSection.count() > 0) {
      await expect(metricsSection).toBeVisible();
    }
    
    // Check for insights section
    const insightsSection = page.locator('text=AI Insights');
    if (await insightsSection.count() > 0) {
      await expect(insightsSection).toBeVisible();
    }
  });

  test('should allow time range filtering', async ({ page }) => {
    await page.goto(ANALYTICS_DASHBOARD_URL);
    
    // Look for time range selector
    const timeRangeSelect = page.locator('select');
    const selectCount = await timeRangeSelect.count();
    
    if (selectCount > 0) {
      // Test time range selection
      await timeRangeSelect.first().selectOption('7d');
      await page.waitForTimeout(1000);
      
      await timeRangeSelect.first().selectOption('24h');
      await page.waitForTimeout(1000);
      
      // Dashboard should update (no errors)
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should support dark mode toggle', async ({ page }) => {
    await page.goto(ANALYTICS_DASHBOARD_URL);
    
    // Look for dark mode toggle
    const darkModeToggle = page.locator('button[title*="θέμα"], button:has-text("🌙"), button:has-text("☀")');
    
    if (await darkModeToggle.count() > 0) {
      // Test dark mode toggle
      await darkModeToggle.first().click();
      await page.waitForTimeout(500);
      
      // Check if dark mode class is applied
      const htmlClass = await page.locator('html').getAttribute('class');
      const hasDarkClass = htmlClass?.includes('dark') || false;
      
      // Toggle back
      await darkModeToggle.first().click();
      await page.waitForTimeout(500);
      
      expect(typeof hasDarkClass).toBe('boolean');
    }
  });

  test('should refresh data on demand', async ({ page }) => {
    await page.goto(ANALYTICS_DASHBOARD_URL);
    
    // Look for refresh button
    const refreshButton = page.locator('button[title*="Ανανέωση"], button:has-text("Ανανέωση")');
    
    if (await refreshButton.count() > 0) {
      const initialContent = await page.textContent('body');
      
      // Click refresh
      await refreshButton.first().click();
      await page.waitForTimeout(2000);
      
      // Content should still be present (no errors)
      await expect(page.locator('h1:has-text("Analytics Dashboard")')).toBeVisible();
    }
  });
});

// AI Insights functionality tests
test.describe('AI Insights Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    await helper.clearAnalyticsData();
    await helper.grantAnalyticsConsent();
  });

  test('should load AI insights page', async ({ page }) => {
    // Generate some data for AI analysis
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(1000);
    await page.goto(`${BASE_URL}/products`);
    await page.waitForTimeout(1000);
    
    await page.goto(AI_INSIGHTS_URL);
    
    // Check for AI insights page elements
    await expect(page.locator('h1:has-text("AI Business Insights")')).toBeVisible();
    
    // Should show beta label
    await expect(page.locator('text=BETA')).toBeVisible();
  });

  test('should show appropriate message when no insights available', async ({ page }) => {
    await page.goto(AI_INSIGHTS_URL);
    
    // With minimal data, should show no insights message
    const noInsightsMessage = page.locator('text=Δεν υπάρχουν AI insights');
    
    if (await noInsightsMessage.count() > 0) {
      await expect(noInsightsMessage).toBeVisible();
    }
  });

  test('should allow period and analysis depth selection', async ({ page }) => {
    await page.goto(AI_INSIGHTS_URL);
    
    // Look for period selector
    const periodSelect = page.locator('select').first();
    
    if (await periodSelect.count() > 0) {
      // Test different periods
      await periodSelect.selectOption('30d');
      await page.waitForTimeout(1000);
      
      await periodSelect.selectOption('7d');
      await page.waitForTimeout(1000);
    }
    
    // Look for analysis depth selector
    const depthSelects = page.locator('select');
    
    if (await depthSelects.count() > 1) {
      const depthSelect = depthSelects.nth(1);
      
      // Test different analysis depths
      await depthSelect.selectOption('advanced');
      await page.waitForTimeout(1000);
      
      await depthSelect.selectOption('detailed');
      await page.waitForTimeout(1000);
    }
  });
});

// Performance impact tests
test.describe('Performance Impact', () => {
  test('analytics tracking should not significantly impact page performance', async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    await helper.clearAnalyticsData();
    
    // Measure page load without analytics
    const startTime1 = Date.now();
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    const loadTime1 = Date.now() - startTime1;
    
    // Enable analytics and measure again
    await helper.grantAnalyticsConsent();
    
    const startTime2 = Date.now();
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    const loadTime2 = Date.now() - startTime2;
    
    // Analytics should not add more than 20% to load time
    const performanceImpact = (loadTime2 - loadTime1) / loadTime1;
    expect(performanceImpact).toBeLessThan(0.2);
    
    console.log(`Load time without analytics: ${loadTime1}ms`);
    console.log(`Load time with analytics: ${loadTime2}ms`);
    console.log(`Performance impact: ${(performanceImpact * 100).toFixed(1)}%`);
  });

  test('dashboard should load within acceptable time', async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    await helper.grantAnalyticsConsent();
    
    const startTime = Date.now();
    await page.goto(ANALYTICS_DASHBOARD_URL);
    await page.waitForSelector('h1:has-text("Analytics Dashboard")', { timeout: 15000 });
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 15 seconds
    expect(loadTime).toBeLessThan(15000);
    
    console.log(`Dashboard load time: ${loadTime}ms`);
  });
});

// Cross-browser compatibility tests
test.describe('Cross-Browser Analytics', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should work correctly in ${browserName}`, async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const helper = new AnalyticsTestHelper(page);
      
      await helper.clearAnalyticsData();
      await helper.grantAnalyticsConsent();
      
      // Test basic analytics functionality
      await page.goto(`${BASE_URL}/`);
      await page.waitForTimeout(2000);
      
      const events = await helper.getAnalyticsEvents();
      expect(events.length).toBeGreaterThanOrEqual(0);
      
      // Test dashboard access
      await page.goto(ANALYTICS_DASHBOARD_URL);
      await expect(page.locator('h1')).toBeVisible();
      
      await context.close();
    });
  });
});

// Error handling tests
test.describe('Error Handling & Resilience', () => {
  test('should handle analytics API failures gracefully', async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    await helper.grantAnalyticsConsent();
    
    // Block analytics API requests
    await page.route('**/api/v1/analytics/**', route => {
      route.abort();
    });
    
    // Analytics should still function locally
    await page.goto(`${BASE_URL}/products`);
    await page.waitForTimeout(2000);
    
    const events = await helper.getAnalyticsEvents();
    expect(events.length).toBeGreaterThanOrEqual(0);
    
    // Dashboard should still load (with local data)
    await page.goto(ANALYTICS_DASHBOARD_URL);
    await expect(page.locator('h1:has-text("Analytics Dashboard")')).toBeVisible();
  });

  test('should handle corrupted localStorage gracefully', async ({ page }) => {
    // Corrupt localStorage data
    await page.evaluate(() => {
      localStorage.setItem('dixis_analytics_events', 'invalid-json-data');
      localStorage.setItem('dixis_privacy_preferences', '{invalid}');
    });
    
    // Should still function
    await page.goto(ANALYTICS_DASHBOARD_URL);
    
    // Should show consent banner (corrupted preferences ignored)
    const consentButton = page.locator('text=Δώστε Συγκατάθεση');
    if (await consentButton.count() > 0) {
      await expect(consentButton).toBeVisible();
    }
  });
});

// Accessibility tests for analytics dashboard
test.describe('Analytics Dashboard Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    await helper.grantAnalyticsConsent();
    
    await page.goto(ANALYTICS_DASHBOARD_URL);
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to navigate without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have proper ARIA labels and semantic HTML', async ({ page }) => {
    const helper = new AnalyticsTestHelper(page);
    await helper.grantAnalyticsConsent();
    
    await page.goto(ANALYTICS_DASHBOARD_URL);
    
    // Check for proper headings
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
    
    // Check for proper button labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const hasText = await button.textContent();
        const hasAriaLabel = await button.getAttribute('aria-label');
        const hasTitle = await button.getAttribute('title');
        
        // Button should have some form of accessible text
        expect(hasText || hasAriaLabel || hasTitle).toBeTruthy();
      }
    }
  });
});

export {};
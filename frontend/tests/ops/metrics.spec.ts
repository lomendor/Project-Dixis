import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

test.describe('Ops Metrics Dashboard', () => {
  test('Metrics page requires dev mode or DIXIS_DEV flag', async ({ page }) => {
    await page.goto(base + '/ops/metrics');

    // Should either show 404 (production guard) or metrics dashboard (dev mode)
    const h1 = await page.locator('h1').textContent();
    expect(['404', 'OPS · Metrics']).toContain(h1);
  });

  test('Metrics page shows key aggregates in dev mode', async ({ page }) => {
    // Skip if production guard is active
    await page.goto(base + '/ops/metrics');
    const h1 = await page.locator('h1').textContent();

    if (h1 === '404') {
      test.skip();
      return;
    }

    // Verify key metrics sections are present
    await expect(page.locator('text=Backlog (QUEUED)')).toBeVisible();
    await expect(page.locator('text=Success rate (24h)')).toBeVisible();
    await expect(page.locator('text=Throughput (1h)')).toBeVisible();
    await expect(page.locator('text=RateLimit buckets (24h)')).toBeVisible();

    // Verify tables/lists for detailed data
    await expect(page.locator('h2:has-text("Notifications")')).toBeVisible();
    await expect(page.locator('h2:has-text("Events")')).toBeVisible();
  });
});

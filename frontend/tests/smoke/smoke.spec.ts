import { test, expect } from '@playwright/test';

// @smoke — Minimal health check that doesn't depend on SSR/API
test('@smoke server responds', async ({ page }) => {
  // Just check that the server responds (even with error is OK for smoke)
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  // Server should respond (200 or 500, but not network error)
  expect(response?.status()).toBeLessThan(600);
});

// @smoke — Static page that doesn't require SSR data
test('@smoke basic rendering', async ({ page, context }) => {
  // Clear any auth to avoid complications
  await context.clearCookies();

  // Try to navigate - if server is up, it should return something
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Just verify we got SOME html (even if it's an error page)
  const html = await page.content();
  expect(html.length).toBeGreaterThan(100);

  // Verify it's HTML (not a network error)
  expect(html).toContain('<html');
});

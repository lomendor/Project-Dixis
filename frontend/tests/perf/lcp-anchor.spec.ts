import { test, expect } from '@playwright/test';

test('[perf] LCP anchor present (H1 or hero image)', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  const hasH1 = await page.locator('h1').first().isVisible().catch(() => false);
  const hasHeroImg = await page.locator('img[fetchpriority="high"], img[loading="eager"]').first().isVisible().catch(() => false);
  expect(hasH1 || hasHeroImg).toBeTruthy();
});

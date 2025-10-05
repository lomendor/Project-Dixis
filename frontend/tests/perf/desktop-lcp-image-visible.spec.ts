import { test, expect } from '@playwright/test';

test('[perf] Desktop LCP hero image visible & sizeable', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

  // Set desktop viewport (Lighthouse desktop dimensions)
  await page.setViewportSize({ width: 1350, height: 900 });

  // Navigate to homepage
  await page.goto(base, { waitUntil: 'domcontentloaded' });

  // Find LCP anchor element
  const hero = page.locator('[data-lcp-anchor="hero"]').first();
  await expect(hero).toBeVisible({ timeout: 10000 });

  // Verify hero image is present
  const heroImage = page.locator('[data-lcp-anchor="hero"] img').first();
  await expect(heroImage).toBeVisible({ timeout: 10000 });

  // Get bounding box to verify it's above the fold and large enough
  const box = await hero.boundingBox();
  expect(box).not.toBeNull();

  if (box) {
    // Verify hero is visible in viewport
    expect(box.y).toBeLessThan(900);

    // Verify hero has sufficient size for LCP candidate
    expect(box.height).toBeGreaterThan(200);

    console.log(`✅ LCP hero: y=${Math.round(box.y)}px, height=${Math.round(box.height)}px`);
  }
});

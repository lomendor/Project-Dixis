import { test, expect } from '@playwright/test';

test('[perf] Desktop LCP raster anchor visible & sizeable', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

  // Desktop viewport (Lighthouse dimensions)
  await page.setViewportSize({ width: 1365, height: 940 });

  // Navigate to homepage
  await page.goto(base, { waitUntil: 'domcontentloaded' });

  // Find raster LCP anchor
  const hero = page.locator('[data-lcp-anchor="hero-raster"]').first();
  await expect(hero).toBeVisible();

  // Verify IMG element is present and visible
  const heroImg = hero.locator('img[src="/hero-lcp.png"]').first();
  await expect(heroImg).toBeVisible();

  // Check positioning and size
  const box = await hero.boundingBox();
  expect(box).not.toBeNull();

  if (box) {
    // Above the fold
    expect(box.y).toBeLessThan(900);
    // Sufficient height
    expect(box.height).toBeGreaterThan(200);
    console.log(`✅ LCP raster hero: y=${Math.round(box.y)}px, height=${Math.round(box.height)}px`);
  }
});

import { test, expect } from '@playwright/test';

test('[perf] Desktop LCP anchor visible above the fold', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

  // Set desktop viewport (Lighthouse desktop dimensions)
  await page.setViewportSize({ width: 1350, height: 940 });

  // Navigate to homepage
  await page.goto(base, { waitUntil: 'domcontentloaded' });

  // Find LCP anchor element
  const lcpAnchor = page.locator('[data-lcp-anchor="hero"]').first();

  // Verify element is visible
  await expect(lcpAnchor).toBeVisible({ timeout: 10000 });

  // Get bounding box to verify it's above the fold and large enough
  const box = await lcpAnchor.boundingBox();

  expect(box).not.toBeNull();

  if (box) {
    // Verify anchor is within first screen (y < viewport height)
    expect(box.y).toBeLessThan(900);

    // Verify anchor has sufficient size (width * height > 12000px²)
    const area = box.width * box.height;
    expect(area).toBeGreaterThan(12000);

    console.log(`✅ LCP anchor: y=${Math.round(box.y)}px, size=${Math.round(area)}px²`);
  }

  // Verify H1 title is visible
  const h1 = page.locator('.lcp-hero-title').first();
  await expect(h1).toBeVisible();
  await expect(h1).toContainText('Fresh Products');
});

import { test, expect } from '@playwright/test';

// @smoke — Home should load and render some content without depending on auth/i18n menu entries
test('@smoke home loads', async ({ page }) => {
  await page.goto('/');
  // Page should not crash and should have any meaningful content
  const html = await page.content();
  expect(html.length).toBeGreaterThan(500);
});

// Optional ping to a lightweight public route if exists; tolerate 404 to avoid flakiness
test('@smoke head title or H1 present', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  const h1 = await page.locator('h1').first();
  const hasH1 = await h1.count().then(c=>c>0);
  expect(Boolean(title) || hasH1).toBeTruthy();
});

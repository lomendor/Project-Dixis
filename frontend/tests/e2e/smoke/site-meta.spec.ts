import { test, expect } from '@playwright/test';
const SITE = process.env.E2E_SITE_URL ?? 'https://dixis.gr';

test('robots.txt responds 200', async ({ page }) => {
  const resp = await page.goto(`${SITE}/robots.txt`, { waitUntil: 'domcontentloaded' });
  expect(resp?.ok()).toBeTruthy();
});

test('sitemap.xml responds 200', async ({ page }) => {
  const resp = await page.goto(`${SITE}/sitemap.xml`, { waitUntil: 'domcontentloaded' });
  expect(resp?.ok()).toBeTruthy();
});

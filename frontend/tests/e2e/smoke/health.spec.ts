import { test, expect, request } from '@playwright/test';

const API = process.env.E2E_BASE_URL ?? 'https://dixis.gr/api/healthz';
const SITE = process.env.E2E_SITE_URL ?? 'https://dixis.gr';

test('api /healthz returns healthy', async () => {
  const ctx = await request.newContext();
  const res = await ctx.get(API);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(['ok', 'healthy']).toContain(body.status);
});

test('homepage responds', async ({ page }) => {
  const resp = await page.goto(SITE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  expect(resp?.ok()).toBeTruthy();
});

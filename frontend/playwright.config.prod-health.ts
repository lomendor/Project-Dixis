import { defineConfig, devices } from '@playwright/test';

/**
 * Production health smoke config — runs tests/smoke/prod-health.spec.ts
 * against the live site (or a preview via BASE_URL). Read-only, no local
 * server. Chromium only (matches CI's installed browser; fast).
 */
export default defineConfig({
  testDir: './tests/smoke',
  testMatch: 'prod-health.spec.ts',
  timeout: 30_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: 2,
  retries: 2, // tolerate transient network blips against prod (per test)
  reporter: 'line',
  webServer: undefined,
  use: {
    baseURL: process.env.BASE_URL || 'https://dixis.gr',
    headless: true,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});

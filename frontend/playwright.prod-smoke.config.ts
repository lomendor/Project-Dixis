import { defineConfig, devices } from '@playwright/test';

/**
 * Minimal Playwright configuration for production smoke tests
 * No globalSetup, no webServer, no complex project setup
 * Runs directly against live production (https://dixis.io)
 */
export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 0,
  testDir: './tests/e2e',
  fullyParallel: true,

  reporter: [['list']],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'production-smoke',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/reload-and-css.smoke.spec.ts']
    }
  ],

  // No webServer - testing live production
  // No globalSetup - no authentication needed for these tests
});

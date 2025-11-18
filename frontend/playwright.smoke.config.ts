import { defineConfig, devices } from '@playwright/test';

/**
 * Production smoke test configuration
 * Tests against live production (dixis.io) without local servers or auth setup
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
      testMatch: ['**/reload-and-css.smoke.spec.ts', '**/diag-*.spec.ts']
    }
  ],

  // No webServer - testing live production
  // No globalSetup - no authentication needed for these tests
});

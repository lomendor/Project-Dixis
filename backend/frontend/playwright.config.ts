import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: isCI ? 2 : 0,              // Enhanced: more retries for stability
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  workers: isCI ? 2 : undefined,     // fewer workers reduces flake
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3001',
    trace: 'on',                     // Enhanced: trace on ALL runs for debugging
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,           // Enhanced: explicit action timeout
    navigationTimeout: 30_000,       // Enhanced: longer navigation timeout
  },

  projects: isCI
    ? [{ name: 'chromium', use: devices['Desktop Chrome'] }]   // CI: run only chromium
    : [
        { name: 'chromium', use: devices['Desktop Chrome'] },
        { name: 'firefox',  use: devices['Desktop Firefox'] },
        { name: 'webkit',   use: devices['Desktop Safari'] },
      ],

  webServer: isCI ? undefined : {
    command: 'npm run start',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.BASE_URL || 'https://dixis.io',
    trace: 'off',
  },
  webServer: undefined, // ΚΑΝΕΝΑΣ τοπικός server — τρέχουμε απέναντι στο production
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'iphone',   use: { ...devices['iPhone 13'] } },
  ],
});

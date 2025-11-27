import { defineConfig, devices } from '@playwright/test';
const baseURL = process.env.E2E_SITE_URL || 'https://dixis.gr';
export default defineConfig({
  testDir: './tests/e2e/smoke',
  timeout: 30_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
});

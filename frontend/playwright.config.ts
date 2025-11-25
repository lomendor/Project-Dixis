import { defineConfig } from '@playwright/test';

const useExternal =
  !!process.env.BASE_URL || !!process.env.E2E_EXTERNAL || !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: useExternal
    ? undefined
    : {
        command: 'pnpm dev',
        port: 3000,
        reuseExistingServer: true,
        timeout: 60_000,
      },
});

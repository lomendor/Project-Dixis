import { defineConfig } from '@playwright/test';

const useExternal =
  !!process.env.BASE_URL || !!process.env.E2E_EXTERNAL || !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:3001',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: useExternal
    ? undefined
    : [
        // Frontend webServer (Next.js)
        {
          command: 'PORT=3001 pnpm dev -p 3001',
          port: 3001,
          reuseExistingServer: true,
          timeout: 60_000,
        },
        // Backend webServer (Laravel API on port 8001)
        {
          command: 'bash ../scripts/dev-backend-8001.sh',
          url: 'http://127.0.0.1:8001',
          reuseExistingServer: true,
          timeout: 120_000,
        },
      ],
});

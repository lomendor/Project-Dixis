import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/e2e/**/*.spec.ts'],
  timeout: 30_000,
  fullyParallel: true,
  reporter: [
    ['line'],
    ['junit', { outputFile: 'junit-e2e.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  // Only start webServer if not in CI with manual server management
  webServer: process.env.SKIP_WEBSERVER
    ? undefined
    : {
        command: 'pnpm run build && pnpm run start',
        port: 3000,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      },
});

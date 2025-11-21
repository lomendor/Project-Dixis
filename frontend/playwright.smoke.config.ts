import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  webServer: undefined, // δεν σηκώνουμε local server σε prod smoke
  use: {
    baseURL: process.env.BASE_URL || 'https://dixis.io',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
});

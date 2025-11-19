import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  fullyParallel: false,
  webServer: undefined, // ΔΕΝ σηκώνουμε local server
  workers: 1,
  use: {
    baseURL: 'https://dixis.io',
    headless: true,
  },
  projects: [
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 13'], browserName: 'webkit' },
    },
  ],
});

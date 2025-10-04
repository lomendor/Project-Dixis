import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/a11y',
  timeout: 60000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  reporter: 'line',
});

import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter - slim artifacts, HTML only on failure */
  reporter: process.env.CI ? 
    [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]] :
    [["list"], ["html", { open: "never" }]],
  /* Timeout settings */
  timeout: 30000,
  expect: { timeout: 10000 },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
    
    /* Slim artifacts - only capture on failure */
    video: process.env.CI ? "retain-on-failure" : "off",
    screenshot: "only-on-failure",
    
    /* Improved stability settings */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* Configure projects - Chromium only for CI stability */
  projects: process.env.CI ? [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        /* Headless for CI stability */
        headless: true,
        /* Viewport for consistent screenshots */
        viewport: { width: 1280, height: 720 },
      },
    },
  ] : [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Auto-start servers for testing - only for local development */
  webServer: process.env.CI ? undefined : [
    {
      command: 'php artisan serve --host 127.0.0.1 --port 8001 --env=testing',
      port: 8001,
      reuseExistingServer: true,
      timeout: 60000,
      cwd: '../',
      url: 'http://127.0.0.1:8001/api/health',
      ignoreHTTPSErrors: true,
    },
    {
      command: 'npm run dev -- -p 3001',
      port: 3001,
      reuseExistingServer: true,
      timeout: 180000,
      url: 'http://localhost:3001',
      ignoreHTTPSErrors: true,
    }
  ],
});
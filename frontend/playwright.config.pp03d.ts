import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for PR-PP03-D: Checkout Edge Cases Evidence Generation
 * Optimized for comprehensive screenshot capture, API logging, and GIF frame generation
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/pr-pp03-d-checkout-edge-cases.spec.ts',
  
  /* Run tests in files in parallel */
  fullyParallel: false, // Sequential for consistent evidence generation
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: 1, // Single worker for consistent evidence capture
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report-pp03d',
      open: 'never' // Don't auto-open in CI/evidence generation
    }],
    ['json', { outputFile: 'test-results-pp03d/results.json' }],
    ['junit', { outputFile: 'test-results-pp03d/junit.xml' }]
  ],
  
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://127.0.0.1:3001',
    
    /* Collect trace when retrying the failed test. */
    trace: 'retain-on-failure',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Extended timeout for evidence generation */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'PR-PP03-D Evidence Generation',
      use: { 
        ...devices['Desktop Chrome'],
        // Optimized viewport for evidence capture
        viewport: { width: 1440, height: 900 },
        // Slower actions for better visual capture
        launchOptions: {
          slowMo: 500, // 500ms delay between actions
        }
      },
    },
  ],

  /* Configure test output directories */
  outputDir: 'test-results-pp03d/',
  
  /* Global setup for authentication and data preparation */
  globalSetup: require.resolve('./global-setup-pp03d.ts'),
  
  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'npm run build && npm start',
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'http://127.0.0.1:8001/api/v1',
        DISABLE_AUTH_REDIRECT: 'false' // Enable auth for checkout testing
      }
    }
  ],
  
  /* Test timeout */
  timeout: 120000, // 2 minutes per test for comprehensive evidence generation
  
  /* Expect timeout */
  expect: {
    timeout: 15000
  }
});
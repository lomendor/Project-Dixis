import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for PR-PP03-B Evidence Generation
 * Optimized for Greek normalization search functionality testing
 * Generates videos, traces, and screenshots for comprehensive evidence
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/pr-pp03-b-search-evidence.spec.ts',
  
  /* Run tests in files in parallel */
  fullyParallel: false,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report-pp03b', open: 'never' }],
    ['json', { outputFile: 'test-results/pp03b-results.json' }],
    ['line']
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://127.0.0.1:3001',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Record video for all tests */
    video: 'on',
    
    /* Take screenshot on failure and on success for evidence */
    screenshot: 'only-on-failure',
    
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 10000,
    
    /* Maximum time each assertion such as `expect(locator).toBeVisible()` can take. */
    expect: { timeout: 15000 },
    /* Configure browser context */
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept-Language': 'el-GR,el;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'pp03b-chrome-evidence',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable video recording with higher quality
        video: {
          mode: 'on',
          size: { width: 1280, height: 720 }
        },
        // Always collect traces for evidence
        trace: 'on',
        // Always take screenshots
        screenshot: 'on',
        // Slow down for better demo recordings
        launchOptions: {
          slowMo: 500 // 500ms delay between actions for demo clarity
        }
      },
    },

    {
      name: 'pp03b-firefox-evidence', 
      use: { 
        ...devices['Desktop Firefox'],
        video: {
          mode: 'on',
          size: { width: 1280, height: 720 }
        },
        trace: 'on',
        screenshot: 'on',
        launchOptions: {
          slowMo: 500
        }
      },
    },

    {
      name: 'pp03b-mobile-evidence',
      use: { 
        ...devices['iPhone 13'],
        video: {
          mode: 'on',
          size: { width: 390, height: 844 }
        },
        trace: 'on',
        screenshot: 'on',
        launchOptions: {
          slowMo: 300 // Slightly faster on mobile
        }
      },
    }
  ],

  /* Configure the development server */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://127.0.0.1:3001',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },

  /* Global setup for evidence collection */
  // globalSetup: require.resolve('./global-setup-pp03b.ts'),

  /* Output directory for test artifacts */
  outputDir: 'test-results-pp03b/',
  
  /* Test timeout */
  timeout: 60 * 1000,
  
  /* Expect timeout */
  expect: {
    timeout: 15 * 1000
  }
});
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for PR Evidence Collection
 * Ensures comprehensive artifact generation with `if: always()` behavior
 */
export default defineConfig({
  timeout: 120_000, // Longer timeout for evidence collection
  expect: { timeout: 15_000 },
  retries: 0, // No retries for evidence collection
  testDir: './tests/e2e',
  fullyParallel: false, // Sequential execution for consistent evidence
  forbidOnly: false,
  workers: 1, // Single worker for deterministic output
  
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3001',
    
    // COMPREHENSIVE ARTIFACT GENERATION
    trace: 'on', // Always generate traces (equivalent to if: always())
    video: 'on', // Always record videos (equivalent to if: always())
    screenshot: 'on', // Always take screenshots (equivalent to if: always())
    
    // Enhanced artifact options
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    
    // Browser context options for better evidence
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Additional debugging info
    bypassCSP: true,
    launchOptions: {
      slowMo: 500, // Slow down actions for better video evidence
    },
  },

  // Single browser for consistent evidence
  projects: [
    {
      name: 'chromium-evidence',
      use: {
        ...devices['Desktop Chrome'],
        // Enhanced options for evidence generation
        contextOptions: {
          recordVideo: {
            dir: 'test-results/videos/',
            size: { width: 1280, height: 720 }
          }
        }
      }
    }
  ],

  // Enhanced reporting for evidence
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report-evidence',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'test-results/evidence-results.json' 
    }],
    ['junit', { 
      outputFile: 'test-results/evidence-junit.xml' 
    }],
    ['list'] // Console output
  ],

  // Output directories
  outputDir: 'test-results',
  
  // Global setup for evidence collection
  globalSetup: require.resolve('./global-setup-evidence.ts'),

  // Web server configuration (since apps are already running)
  webServer: undefined, // Apps already running on specified ports
});
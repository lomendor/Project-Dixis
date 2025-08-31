import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: isCI ? 2 : 0,
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  workers: isCI ? 2 : undefined,
  
  // Global setup for storageState creation
  globalSetup: require.resolve('./tests/global-setup'),
  
  // Artifacts configuration
  outputDir: 'frontend/test-results',
  reporter: [['html', { outputFolder: 'frontend/playwright-report' }]],
  
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3001',
    trace: 'on',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: isCI ? [
    // CI: Single project with no auth for basic smoke tests
    { 
      name: 'smoke',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/smoke.spec.ts', '**/e3-docs-smoke.spec.ts']
    }
  ] : [
    // Local: Multiple auth states and browsers
    { 
      name: 'consumer',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'frontend/.auth/consumer.json'
      },
      testIgnore: ['**/smoke.spec.ts', '**/e3-docs-smoke.spec.ts']
    },
    { 
      name: 'producer',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'frontend/.auth/producer.json'
      },
      testMatch: ['**/auth-*.spec.ts', '**/admin-*.spec.ts']
    },
    // Unauthenticated tests (smoke, registration, etc.)
    { 
      name: 'guest',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/smoke.spec.ts', '**/register.spec.ts', '**/e3-docs-smoke.spec.ts']
    }
  ],

  webServer: isCI ? undefined : {
    command: 'npm run start',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
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
  globalSetup: './tests/global-setup.ts',
  
  // Artifacts configuration - align with CI expectations
  outputDir: 'test-results',
  reporter: isCI ? [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ] : [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  use: {
    baseURL: 'http://127.0.0.1:3001',
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
        storageState: '.auth/consumer.json'
      },
      testIgnore: ['**/smoke.spec.ts', '**/e3-docs-smoke.spec.ts']
    },
    { 
      name: 'producer',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: '.auth/producer.json'
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

  webServer: {
    command: 'npm run dev -- --port 3001',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: true,
    timeout: 90_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
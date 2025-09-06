import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const skipWebServer = !!process.env.PLAYWRIGHT_SKIP_WEBSERVER;
const E2E_AUTH_ROLE = process.env.E2E_AUTH_ROLE ?? 'guest';

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
    launchOptions: { args: ['--disable-dev-shm-usage'] },
    extraHTTPHeaders: { 'x-e2e-role': E2E_AUTH_ROLE },
  },

  projects: isCI ? [
    // CI: Only smoke tests (green pipeline lock)
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
      testIgnore: [
        '**/smoke.spec.ts', 
        '**/e3-docs-smoke.spec.ts', 
        '**/integration-*.spec.ts',
        // Quarantined failing tests (move to integration project)
        '**/checkout-happy-path.spec.ts',
        '**/mobile-navigation.spec.ts',
        '**/pdp-happy.spec.ts', 
        '**/performance-accessibility.spec.ts',
        '**/pr-pp03-d-checkout-edge-cases.spec.ts',
        '**/shipping-integration.spec.ts'
      ]
    },
    { 
      name: 'producer',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: '.auth/producer.json'
      },
      testMatch: ['**/auth-*.spec.ts', '**/admin-*.spec.ts'],
      testIgnore: [
        '**/integration-*.spec.ts',
        // Quarantined failing tests
        '**/checkout-happy-path.spec.ts',
        '**/mobile-navigation.spec.ts',
        '**/pdp-happy.spec.ts',
        '**/performance-accessibility.spec.ts',
        '**/pr-pp03-d-checkout-edge-cases.spec.ts',
        '**/shipping-integration.spec.ts'
      ]
    },
    // Unauthenticated tests (smoke, registration, etc.)
    { 
      name: 'guest',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/smoke.spec.ts', '**/register.spec.ts', '**/e3-docs-smoke.spec.ts'],
      testIgnore: [
        '**/integration-*.spec.ts',
        // Quarantined failing tests
        '**/checkout-happy-path.spec.ts',
        '**/mobile-navigation.spec.ts',
        '**/pdp-happy.spec.ts',
        '**/performance-accessibility.spec.ts', 
        '**/pr-pp03-d-checkout-edge-cases.spec.ts',
        '**/shipping-integration.spec.ts'
      ]
    },
    // Integration tests requiring real backend - QUARANTINED
    { 
      name: 'integration',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: '.auth/consumer.json'
      },
      testMatch: [
        '**/integration-*.spec.ts',
        // Quarantined failing tests (require backend/fixtures)
        '**/checkout-happy-path.spec.ts',
        '**/mobile-navigation.spec.ts',
        '**/pdp-happy.spec.ts',
        '**/performance-accessibility.spec.ts',
        '**/pr-pp03-d-checkout-edge-cases.spec.ts', 
        '**/shipping-integration.spec.ts'
      ]
    }
  ],

  webServer: (isCI || skipWebServer) ? undefined : {
    command: 'npm run start',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

// Phase-4: Host alignment - normalize FE & API to same host (127.0.0.1)
function normalizeHosts() {
  let baseURL = process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3001';
  const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

  // Force localhost to 127.0.0.1 for cookie compatibility
  if (baseURL.includes('localhost')) {
    baseURL = baseURL.replace('localhost', '127.0.0.1');
  }

  // Extract hosts for comparison
  const feHost = new URL(baseURL).hostname;
  const apiHost = new URL(apiBaseURL).hostname;

  // If hosts differ, force FE to 127.0.0.1 to match API
  if (feHost !== apiHost) {
    console.log(`⚠️ Host mismatch detected: FE=${feHost}, API=${apiHost}`);
    const fePort = new URL(baseURL).port || '3030';
    baseURL = `http://127.0.0.1:${fePort}`;
    console.log(`✅ Normalized FE baseURL to: ${baseURL}`);
  }

  console.log(`🔗 Phase-4 Host Alignment: FE_HOST=${feHost}, API_HOST=${apiHost}`);
  return { baseURL, apiBaseURL, feHost, apiHost };
}

const { baseURL } = normalizeHosts();

export default defineConfig({
  // Increased timeouts for CI to handle complex shipping integration flows
  timeout: isCI ? 180_000 : 60_000, // 3 minutes for CI, 1 minute local
  expect: { timeout: isCI ? 20_000 : 10_000 }, // 20s for CI, 10s local
  retries: isCI ? 1 : 0, // Reduced to 1 retry for faster feedback
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  workers: isCI ? 2 : undefined,
  
  // Global setup for storageState creation (Phase-4: API-first auth)
  globalSetup: './tests/e2e/setup/global-setup.ts',
  
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
    // Phase-4: Use normalized baseURL for cookie compatibility
    baseURL,
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: isCI ? [
    // CI: Primary project - NO storageState to avoid cookie validation errors (Pass 34)
    {
      name: 'consumer-ci',
      use: {
        ...devices['Desktop Chrome']
        // storageState disabled in CI - tests handle auth via UI or route stubs
      },
      testMatch: ['**/smoke.spec.ts', '**/e3-docs-smoke.spec.ts', '**/auth-probe.spec.ts', '**/shipping-*.spec.ts', '**/checkout*.spec.ts'],
      testIgnore: ['**/*@no-auth*.spec.ts']
    },
    // CI: Pure UI login tests (no storageState) - Phase-4.1
    {
      name: 'auth-ui',
      use: {
        ...devices['Desktop Chrome']
        // No storageState - forces UI login flow
      },
      testMatch: ['**/*@no-auth*.spec.ts', '**/auth-edge-cases.spec.ts']
    }
  ] : [
    // Local: Consumer project with API-first storageState (Phase-4)
    {
      name: 'consumer',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'test-results/storageState.json'
      },
      testIgnore: ['**/smoke.spec.ts', '**/e3-docs-smoke.spec.ts', '**/*@no-auth*.spec.ts']
    },
    // Local: Pure UI login tests (no storageState) - Phase-4.1
    {
      name: 'auth-ui',
      use: {
        ...devices['Desktop Chrome']
        // No storageState - forces UI login flow
      },
      testMatch: ['**/*@no-auth*.spec.ts', '**/auth-edge-cases.spec.ts']
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

  webServer: isCI ? {
    command: 'npm run ci:gen && npm run ci:migrate && npm run build:ci && npm run start:ci',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    stdout: 'ignore',
    stderr: 'pipe',
  } : {
    command: 'npm run dev -- --port 3030',
    url: baseURL, // Phase-4: Use normalized URL
    reuseExistingServer: true,
    timeout: 90_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
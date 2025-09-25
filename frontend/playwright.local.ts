import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * Local Playwright configuration for E2E hardening
 *
 * Features:
 * - Uses existing dev server (no webServer startup)
 * - Loads auth storageState to avoid SecurityError
 * - Integrates with localStorage helpers for stable auth
 * - Supports both authenticated and guest scenarios
 */
export default defineConfig({
  ...baseConfig,

  // Override baseURL for local development
  use: {
    ...(baseConfig as any).use,
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    // Use storageState for authenticated tests
    storageState: 'tests/e2e/.artifacts/storage-state.json'
  },

  // Disable webServer - assumes dev server is already running
  webServer: undefined,

  // Enhanced projects with storageState integration
  projects: [
    // Authenticated consumer tests with stable auth state
    {
      name: 'authenticated-consumer',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.artifacts/storage-state.json'
      },
      testIgnore: ['**/smoke.spec.ts', '**/guest-*.spec.ts']
    },

    // Guest/unauthenticated tests (smoke, registration)
    {
      name: 'guest',
      use: {
        ...devices['Desktop Chrome']
        // No storageState for guest scenarios
      },
      testMatch: ['**/smoke.spec.ts', '**/guest-*.spec.ts', '**/register.spec.ts']
    },

    // Checkout flow tests with fallback auth
    {
      name: 'checkout-flow',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.artifacts/storage-state.json'
      },
      testMatch: ['**/checkout*.spec.ts', '**/cart-*.spec.ts', '**/shipping-*.spec.ts']
    }
  ],

  // Local-specific timeouts (shorter than CI)
  timeout: 45_000, // 45 seconds
  expect: { timeout: 8_000 }, // 8 seconds
  retries: 0, // No retries for faster local feedback

  // Enhanced reporter for local development
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  // Global teardown to clean artifacts
  globalTeardown: './tests/e2e/setup/teardown.ts'
});
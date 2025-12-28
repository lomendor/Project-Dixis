import { defineConfig } from '@playwright/test';
import * as path from 'path';

const useExternal =
  !!process.env.BASE_URL || !!process.env.E2E_EXTERNAL || !!process.env.CI;
const isCI = !!process.env.CI;

// Pass 46: StorageState path for authenticated tests
const storageStatePath = path.join(__dirname, 'test-results/storageState.json');

// Pass 46: Use CI globalSetup when external server OR CI mode
// Local dev with webServer uses the Laravel-based global-setup
const useCIAuth = useExternal || isCI;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },

  // Pass 46: GlobalSetup creates authenticated storageState
  // Use CI setup for external servers (mocked auth), local setup for Laravel-based auth
  globalSetup: useCIAuth
    ? './tests/e2e/setup/ci-global-setup.ts'
    : './tests/e2e/setup/global-setup.ts',

  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:3001',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    // Pass 46: Use storageState for pre-authenticated tests
    storageState: storageStatePath,
  },
  webServer: useExternal
    ? undefined
    : [
        // Frontend webServer (Next.js)
        {
          command: 'PORT=3001 pnpm dev -p 3001',
          port: 3001,
          reuseExistingServer: true,
          timeout: 60_000,
        },
        // Backend webServer (Laravel API on port 8001)
        {
          command: 'bash ../scripts/dev-backend-8001.sh',
          url: 'http://127.0.0.1:8001',
          reuseExistingServer: true,
          timeout: 120_000,
        },
      ],
});

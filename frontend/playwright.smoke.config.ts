import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  globalSetup: undefined, // No global setup needed for read-only smoke tests
  testMatch: ['**/*.smoke.spec.ts'],
  reporter: [['list']],
  projects: undefined, // Override projects to use top-level testMatch
});

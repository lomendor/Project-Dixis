import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  ...baseConfig,
  use: {
    ...(baseConfig as any).use,
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
  },
  webServer: undefined,
});
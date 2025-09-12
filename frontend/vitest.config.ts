import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: [
      'tests/unit/**/*.spec.{ts,tsx}',
      'src/**/__tests__/**/*.{spec,test}.{ts,tsx}'
    ],
    exclude: [
      'tests/e2e/**',
      '**/e2e/**',
      'playwright.config.*',
      'tests/**/e2e-*.spec.{ts,tsx}'
    ],
    environment: 'jsdom',
    setupFiles: ['tests/setup/vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
/**
 * Vitest Configuration for Unit Tests
 * Separate config for unit tests to avoid PostCSS conflicts
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.{js,ts}'],
    exclude: [
      'node_modules/**',
      'tests/**', // E2E tests
      '**/*.e2e.*',
      '**/e2e/**',
    ],
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Override PostCSS config to prevent loading
  define: {
    'process.env.NODE_ENV': '"test"',
  },
  // Disable all CSS-related plugins
  plugins: [],
});
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup/polyfills.ts', 'tests/setup/mock-hooks.ts', 'tests/setup/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/.next/**'
      ]
    },
    // Increased timeout for MSW integration tests
    testTimeout: 10000,
    // Include patterns for execution issue tests
    include: ['tests/unit/**/*.{test,spec}.{js,ts,tsx}','tests/component/**/*.{test,spec}.{js,ts,tsx}','tests/integration/**/*.{test,spec}.{js,ts,tsx}'],
    // Mock configuration for browser APIs
    deps: {
      inline: ['@testing-library/user-event']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './')
    },
  },
});
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.spec.ts'],
    exclude: ['node_modules', 'tests/e2e'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@components': path.resolve(__dirname, './src/components'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
  // css: false is deprecated, omitting css config uses default behavior
  define: {
    'process.env.NODE_ENV': '"test"',
  },
});
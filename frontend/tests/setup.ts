/**
 * Vitest Setup File
 * Configures jsdom environment for React component testing
 */

import '@testing-library/jest-dom';

// Global test setup
beforeEach(() => {
  // Clear any previous test artifacts
  document.body.innerHTML = '';
});
/**
 * MSW Browser Setup
 * PR-88c-3A: Cart Container + Wire-up
 * 
 * Sets up Mock Service Worker for browser environments
 * Enables deterministic API mocking for development and testing
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Create MSW service worker with our handlers
export const worker = setupWorker(...handlers);

// Start MSW in development mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'bypass',
    quiet: false,
  }).catch(console.error);
}
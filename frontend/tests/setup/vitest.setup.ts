/**
 * Vitest Test Environment Setup
 * Configuration for React Testing Library + jsdom
 */

import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock matchMedia for components that use responsive design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver for components that use it
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};// MSW server setup imported in handlers

// Pass 7: Contract-accurate MSW handlers
import { handlersPass7 } from '../mocks/handlers.pass7';
import { server } from '../mocks/server';
server.use(...handlersPass7);

// Pass 8.1: Exact MSW routes for /api and /api/v1
import { handlersPass81 } from '../mocks/handlers.pass81';
import { server } from '../mocks/server';
server.use(...handlersPass81);

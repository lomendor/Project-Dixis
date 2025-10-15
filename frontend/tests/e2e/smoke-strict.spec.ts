/**
 * Strict smoke test: P0 gate
 * Ensures server is responsive and health endpoint is available
 * STOP-on-failure: If this test fails, block all other tests
 */

import { test, expect, request } from '@playwright/test';

test('smoke: server responds & health endpoint available', async ({ baseURL }) => {
  // Root should render 200
  const ctx = await request.newContext();
  const root = await ctx.get(`${baseURL ?? ''}/`);
  expect(root.status(), 'Root should be reachable').toBeLessThan(400);

  // Prefer /api/healthz; fallback to /api/dev/health if not present
  const healthz = await ctx.get(`${baseURL ?? ''}/api/healthz`);
  if (healthz.status() === 404) {
    const dev = await ctx.get(`${baseURL ?? ''}/api/dev/health`);
    expect(dev.status(), 'dev health should exist when /api/healthz is absent').toBeLessThan(400);
  } else {
    expect(healthz.status(), '/api/healthz should be healthy').toBeLessThan(400);
  }
});

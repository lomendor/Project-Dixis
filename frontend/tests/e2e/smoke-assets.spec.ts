/**
 * Smoke test for static assets (logo.svg, logo.png)
 * Ensures critical assets are served correctly in standalone mode
 */
import { test, expect } from '@playwright/test';

test.describe('Static Assets Smoke', () => {
  test('logo.svg returns 200', async ({ request }) => {
    const response = await request.get('/logo.svg');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/svg');
  });

  test('logo.png returns 200', async ({ request }) => {
    const response = await request.get('/logo.png');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
  });
});

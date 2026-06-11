import { test, expect } from '@playwright/test';

/**
 * Production health smoke — READ-ONLY checks against the live full stack
 * (Next.js + Laravel + Postgres). No auth, no mutations: safe to run on a
 * schedule against https://dixis.gr.
 *
 * Answers one question every morning: "Is the live site serving real data
 * end-to-end?" Unlike the (frontend-only, mock-auth) CI e2e suite, this hits
 * the real backend, so a green run means the whole chain is up.
 *
 * BASE_URL defaults to production; override to point at a preview deploy.
 */
const BASE = process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'https://dixis.gr';

test.describe('production health (read-only)', () => {
  test('health endpoint returns 200', async ({ request }) => {
    const res = await request.get(`${BASE}/api/healthz`);
    expect(res.status()).toBe(200);
  });

  test('products API returns real data from the backend', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v1/public/products?per_page=3`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const items = body.data ?? body.products ?? body;
    expect(Array.isArray(items)).toBeTruthy();
    expect(items.length).toBeGreaterThan(0);
    // Each product has the fields the storefront renders.
    expect(items[0]).toHaveProperty('id');
    expect(items[0]).toHaveProperty('name');
  });

  test('homepage renders products from the real backend', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-root')).toBeVisible();
    await expect(page.getByTestId('header-logo')).toBeVisible();
    await expect(page.getByTestId('featured-products')).toBeVisible();
    // Products actually rendered (data flowed Laravel → Next → DOM).
    await expect(page.getByTestId('add-to-cart-button').first()).toBeVisible({ timeout: 15_000 });
  });

  test('product detail page loads for a real product', async ({ page, request }) => {
    const res = await request.get(`${BASE}/api/v1/public/products?per_page=1`);
    const body = await res.json();
    const first = (body.data ?? body.products ?? body)[0];
    const slugOrId = first.slug ?? first.id;

    await page.goto(`${BASE}/products/${slugOrId}`, { waitUntil: 'domcontentloaded' });
    // The product name from the API appears on its page.
    await expect(page.getByText(first.name, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
  });

  test('global navigation chrome is present', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('header-primary-nav')).toBeVisible();
    await expect(page.getByTestId('footer-quick-links')).toBeVisible();
  });
});

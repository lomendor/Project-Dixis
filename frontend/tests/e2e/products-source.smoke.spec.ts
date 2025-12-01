import { test, expect } from '@playwright/test'
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'
test('products page shows source and renders grid', async ({ page }) => {
  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByText(/Πηγή:\s+(demo|db)/)).toBeVisible()
})

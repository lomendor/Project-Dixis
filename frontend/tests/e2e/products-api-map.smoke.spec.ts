import { test, expect } from '@playwright/test'
const BASE = process.env.BASE_URL || 'https://dixis.io'

test('products page renders and API responds', async ({ page, request }) => {
  const res = await request.get(`${BASE}/api/products`)
  expect(res.status()).toBe(200)
  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Προϊόντα' })).toBeVisible()
})

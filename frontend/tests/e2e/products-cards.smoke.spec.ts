import { test, expect } from '@playwright/test'
const BASE = process.env.BASE_URL || 'https://dixis.io'

test('products page renders multiple product cards', async ({ page }) => {
  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Προϊόντα' })).toBeVisible()
  const cards = page.locator('main .grid > div')
  await expect(cards.first()).toBeVisible()
  await expect(cards).toHaveCountGreaterThan(3)
})

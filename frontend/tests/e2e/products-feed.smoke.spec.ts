import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'

test('products renders cards from demo feed', async ({ page }) => {
  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1200)

  const cards = page.locator('main .grid > div')
  await expect(cards.first()).toBeVisible()

  const count = await cards.count()
  expect(count).toBeGreaterThan(3)
})

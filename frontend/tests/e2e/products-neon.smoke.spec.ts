import { test, expect } from '@playwright/test'
const BASE = process.env.BASE_URL || 'https://dixis.gr'

test('products: grid renders and no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })

  await page.goto(BASE + '/products', { waitUntil: 'domcontentloaded' })
  const cards = page.locator('.grid > div')
  await expect(cards.first()).toBeVisible()
  const count = await cards.count()
  expect(count).toBeGreaterThan(3)

  expect(errors).toEqual([])
})

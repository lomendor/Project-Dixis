import { test, expect } from '@playwright/test'
const BASE = process.env.BASE_URL || 'https://dixis.io'

test('/products renders without reload loop', async ({ page }) => {
  let navigations = 0
  page.on('framenavigated', () => { navigations++ })
  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(6000)
  expect(navigations).toBeLessThan(3)
  await expect(page.locator('main')).toBeVisible()
})

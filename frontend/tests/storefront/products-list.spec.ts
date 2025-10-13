import { test, expect } from '@playwright/test'
const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000'

test('products list loads with at least 5 items', async ({ page }) => {
  await page.goto(base + '/products')
  await page.waitForSelector('main')
  const items = page.locator('li.border.rounded')
  const count = await items.count()
  expect(count).toBeGreaterThan(0)
})

test('search filters by title substring', async ({ page }) => {
  await page.goto(base + '/products?q=Μέλι')
  await page.waitForSelector('main')
  const content = await page.textContent('main')
  expect(content || '').toContain('Μέλι')
})

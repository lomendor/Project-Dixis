import { test, expect } from '@playwright/test'

/**
 * AG119.1b: Comprehensive Neon/Prisma products test
 * - Verifies ≥8 product cards render
 * - Captures console errors
 */
test('products from Neon/Prisma render ≥8 cards without errors', async ({ page }) => {
  const errors: string[] = []

  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })

  // Navigate to products page
  await page.goto('/products', { waitUntil: 'domcontentloaded' })

  // Verify heading
  await expect(page.getByRole('heading', { name: /Προϊόντα/i })).toBeVisible()

  // Verify grid and cards
  const grid = page.locator('main .grid > div')
  await expect(grid.first()).toBeVisible({ timeout: 10000 })

  // Count should be ≥8 (we seeded 12)
  const count = await grid.count()
  expect(count, `Expected ≥8 product cards, got ${count}`).toBeGreaterThanOrEqual(8)

  // Verify no console errors
  expect(errors, `Console errors detected: ${errors.join(', ')}`).toEqual([])
})

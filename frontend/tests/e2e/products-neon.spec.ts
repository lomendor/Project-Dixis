import { test, expect } from '@playwright/test'

/**
 * AG119.1b: Comprehensive Neon/Prisma products test
 * - Verifies ≥8 product cards render
 * - Captures console errors
 */
test.describe('Products from Neon/Prisma', () => {
  test('renders ≥8 product cards without errors', async ({ page }) => {
    const errors: string[] = []

    // Capture console errors (excluding 404s for static assets like images)
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // Ignore 404 errors for images/static assets
        if (!text.includes('404') && !text.includes('placeholder')) {
          errors.push(text)
        }
      }
    })

    // Navigate to products page
    await page.goto('/products', { waitUntil: 'domcontentloaded' })

    // Verify heading
    await expect(page.getByRole('heading', { name: /Προϊόντα/i })).toBeVisible()

    // Verify grid and cards
    const grid = page.locator('main .grid > div')
    await expect(grid.first()).toBeVisible({ timeout: 10000 })

    // Count should be ≥8 (we seeded 10)
    const count = await grid.count()
    expect(count, `Expected ≥8 product cards, got ${count}`).toBeGreaterThanOrEqual(8)

    // Verify no console errors
    expect(errors, `Console errors detected: ${errors.join(', ')}`).toEqual([])
  })

  test('product cards display correct structure', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'domcontentloaded' })

    // Wait for product cards
    const firstCard = page.locator('[data-testid="product-card"]').first()
    await expect(firstCard).toBeVisible({ timeout: 10000 })

    // Verify card has title
    const title = firstCard.locator('[data-testid="product-card-title"]')
    await expect(title).toBeVisible()

    // Verify card has price with € symbol
    const price = firstCard.locator('[data-testid="product-card-price"]')
    await expect(price).toBeVisible()
    await expect(price).toContainText('€')

    // Verify card has add to cart button
    const addBtn = firstCard.locator('[data-testid="product-card-add"]')
    await expect(addBtn).toBeVisible()
  })

  test('products page shows total count', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'domcontentloaded' })

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })

    // Check for "συνολικά" (total) text in Greek
    const totalText = page.locator('text=συνολικά')
    await expect(totalText).toBeVisible()
  })
})

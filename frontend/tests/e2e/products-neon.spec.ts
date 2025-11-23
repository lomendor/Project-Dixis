import { test, expect } from '@playwright/test'

test.describe('Products from Neon DB (AG119.1)', () => {
  test('should display at least 8 product cards', async ({ page }) => {
    const consoleErrors: string[] = []

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Navigate to products page
    await page.goto('/products')

    // Wait for products to load
    await page.waitForSelector('h1:has-text("Προϊόντα")', { timeout: 10000 })

    // Count product cards
    const productCards = page.locator('[class*="group"][class*="bg-white"][class*="border"]')
    const count = await productCards.count()

    // Verify we have at least 8 product cards
    expect(count).toBeGreaterThanOrEqual(8)

    // Verify no console errors
    expect(consoleErrors).toEqual([])
  })

  test('should display product details correctly', async ({ page }) => {
    await page.goto('/products')
    await page.waitForSelector('h1:has-text("Προϊόντα")', { timeout: 10000 })

    // Verify first product has required fields
    const firstProduct = page.locator('[class*="group"][class*="bg-white"]').first()

    // Should have producer name
    await expect(firstProduct.locator('text=/Τοπική Φάρμα Demo|Παραγωγός/i')).toBeVisible()

    // Should have price formatted
    await expect(firstProduct.locator('text=/€|—/')).toBeVisible()

    // Should have "Προσθήκη" button
    await expect(firstProduct.locator('button:has-text("Προσθήκη")')).toBeVisible()
  })

  test('should show total count of products', async ({ page }) => {
    await page.goto('/products')
    await page.waitForSelector('h1:has-text("Προϊόντα")', { timeout: 10000 })

    // Should display total count
    const totalText = page.locator('text=/\\d+ διαθέσιμα/')
    await expect(totalText).toBeVisible()
  })
})

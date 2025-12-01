import { test, expect } from '@playwright/test'

test.describe('Single CartBadge Smoke Test', () => {
  test('ensures exactly ONE cart badge exists in header', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')

    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })

    // Count all cart badges with data-testid="cart-item-count"
    const cartBadges = page.locator('[data-testid="cart-item-count"]')
    await expect(cartBadges).toHaveCount(1)

    // Verify the single badge is visible
    await expect(cartBadges).toBeVisible()
    await expect(cartBadges).toContainText('Καλάθι')
  })

  test('single cart badge updates correctly when adding products', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')

    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })

    // Get the single cart badge
    const cartBadge = page.locator('[data-testid="cart-item-count"]')

    // Verify exactly one badge exists
    await expect(cartBadge).toHaveCount(1)

    // Initially should show "Καλάθι" text without count
    await expect(cartBadge).toContainText('Καλάθι')

    // Add first product to cart
    const firstAddButton = page.locator('button:has-text("Προσθήκη")').first()
    await firstAddButton.click()

    // Wait for cart badge to update and show count "1"
    await expect(cartBadge.locator('span:has-text("1")')).toBeVisible({ timeout: 5000 })

    // Still exactly one badge
    await expect(cartBadge).toHaveCount(1)

    // Add second product to cart
    const secondAddButton = page.locator('button:has-text("Προσθήκη")').nth(1)
    await secondAddButton.click()

    // Wait for cart badge to update and show count "2"
    await expect(cartBadge.locator('span:has-text("2")')).toBeVisible({ timeout: 5000 })

    // Still exactly one badge
    await expect(cartBadge).toHaveCount(1)
  })

  test('no duplicate cart badges on /cart page', async ({ page }) => {
    // Navigate to products page and add item
    await page.goto('/products')
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })
    await page.locator('button:has-text("Προσθήκη")').first().click()

    // Wait for cart to update
    const cartBadge = page.locator('[data-testid="cart-item-count"]')
    await expect(cartBadge.locator('span:has-text("1")')).toBeVisible({ timeout: 5000 })

    // Navigate to cart page
    await page.goto('/cart')

    // Verify page loaded
    await expect(page.locator('h1:has-text("Καλάθι")')).toBeVisible()

    // Verify still exactly ONE cart badge exists (in header)
    await expect(page.locator('[data-testid="cart-item-count"]')).toHaveCount(1)
  })

  test('cart badge persists across navigation', async ({ page }) => {
    // Navigate to products and add items
    await page.goto('/products')
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })

    await page.locator('button:has-text("Προσθήκη")').first().click()
    await page.locator('button:has-text("Προσθήκη")').nth(1).click()

    // Wait for badge to show "2"
    const cartBadge = page.locator('[data-testid="cart-item-count"]')
    await expect(cartBadge.locator('span:has-text("2")')).toBeVisible({ timeout: 5000 })

    // Navigate to home
    await page.goto('/')

    // Badge should still show "2" and be exactly one
    await expect(page.locator('[data-testid="cart-item-count"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="cart-item-count"]').locator('span:has-text("2")')).toBeVisible()

    // Navigate to cart page
    await page.goto('/cart')

    // Badge should still show "2" and be exactly one
    await expect(page.locator('[data-testid="cart-item-count"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="cart-item-count"]').locator('span:has-text("2")')).toBeVisible()
  })
})

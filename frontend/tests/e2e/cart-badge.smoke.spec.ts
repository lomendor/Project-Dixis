import { test, expect } from '@playwright/test'

test.describe('CartBadge Smoke Test', () => {
  test('displays cart badge and increments count when adding products', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')

    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })

    // Verify CartBadge is visible in header
    const cartBadge = page.locator('[data-testid="cart-item-count"]')
    await expect(cartBadge).toBeVisible()

    // Initially should show "Καλάθι" text without count
    await expect(cartBadge).toContainText('Καλάθι')

    // Add first product to cart
    const firstAddButton = page.locator('button:has-text("Προσθήκη")').first()
    await firstAddButton.click()

    // Wait for cart badge to update and show count "1"
    await expect(cartBadge.locator('span:has-text("1")')).toBeVisible({ timeout: 5000 })

    // Add second product to cart
    const secondAddButton = page.locator('button:has-text("Προσθήκη")').nth(1)
    await secondAddButton.click()

    // Wait for cart badge to update and show count "2"
    await expect(cartBadge.locator('span:has-text("2")')).toBeVisible({ timeout: 5000 })

    // Verify badge is clickable and links to cart
    const badgeHref = await cartBadge.getAttribute('href')
    expect(badgeHref).toBe('/cart')

    // Click badge and verify navigation to cart page
    await cartBadge.click()
    await expect(page).toHaveURL(/\/cart/)
  })

  test('cart badge persists count across page reloads', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })

    // Add product to cart
    await page.locator('button:has-text("Προσθήκη")').first().click()

    // Verify count shows "1"
    const cartBadge = page.locator('[data-testid="cart-item-count"]')
    await expect(cartBadge.locator('span:has-text("1")')).toBeVisible({ timeout: 5000 })

    // Reload page
    await page.reload()
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })

    // Verify count still shows "1" (localStorage persistence)
    await expect(cartBadge.locator('span:has-text("1")')).toBeVisible({ timeout: 5000 })
  })
})

import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'

test.describe('Cart v0 Smoke Test', () => {
  test('should add product to cart and view cart page', async ({ page }) => {
    // 1. Navigate to products page
    await page.goto(`${BASE}/products`)
    await expect(page.getByRole('heading', { name: 'Προϊόντα' })).toBeVisible()

    // 2. Wait for products to load
    await page.waitForSelector('.grid', { timeout: 10000 })

    // 3. Find and click first "Προσθήκη" button
    const addButton = page.locator('button:has-text("Προσθήκη")').first()
    await expect(addButton).toBeVisible()
    await addButton.click()

    // 4. Wait for success indicator
    await expect(page.locator('text=✓')).toBeVisible({ timeout: 5000 })

    // 5. Navigate to cart page
    await page.goto(`${BASE}/cart`)
    await expect(page.getByRole('heading', { name: 'Καλάθι' })).toBeVisible()

    // 6. Verify cart has items
    await expect(page.locator('.cart-row')).toHaveCount(1, { timeout: 5000 })

    // 7. Verify cart badge shows count
    const badge = page.locator('a:has-text("Καλάθι")')
    await expect(badge).toContainText('(1)')

    // 8. Verify total is displayed
    await expect(page.locator('text=Σύνολο:')).toBeVisible()
  })

  test('should display empty cart message when no items', async ({ page }) => {
    // 1. Clear cart by calling DELETE /api/cart?id=all
    await page.goto(`${BASE}/cart`)
    await page.context().request.delete(`${BASE}/api/cart?id=all`)

    // 2. Reload cart page
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Καλάθι' })).toBeVisible()

    // 3. Verify empty message
    await expect(page.locator('text=Το καλάθι είναι άδειο.')).toBeVisible()

    // 4. Verify cart badge shows no count
    const badge = page.locator('a:has-text("Καλάθι")')
    await expect(badge).not.toContainText('(')
  })

  test('should increment quantity when adding same product twice', async ({ page }) => {
    // 1. Clear cart first
    await page.goto(`${BASE}/cart`)
    await page.context().request.delete(`${BASE}/api/cart?id=all`)

    // 2. Navigate to products
    await page.goto(`${BASE}/products`)
    await page.waitForSelector('.grid', { timeout: 10000 })

    // 3. Add same product twice
    const firstButton = page.locator('button:has-text("Προσθήκη")').first()
    await firstButton.click()
    await expect(page.locator('text=✓').first()).toBeVisible({ timeout: 5000 })

    await page.waitForTimeout(500) // Small delay between clicks
    await firstButton.click()
    await expect(page.locator('text=✓').first()).toBeVisible({ timeout: 5000 })

    // 4. Go to cart
    await page.goto(`${BASE}/cart`)
    await expect(page.getByRole('heading', { name: 'Καλάθι' })).toBeVisible()

    // 5. Verify only 1 cart row but with qty=2
    await expect(page.locator('.cart-row')).toHaveCount(1, { timeout: 5000 })
    await expect(page.locator('text=Ποσότητα: 2')).toBeVisible()

    // 6. Verify cart badge shows (1) item
    const badge = page.locator('a:has-text("Καλάθι")')
    await expect(badge).toContainText('(1)')
  })
})

import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3001'

test.describe('Cart Count Consistency', () => {
  test('header badge and cart page title show same count', async ({ page }) => {
    // 1. Clear cart first
    await page.goto(`${BASE}/cart`)
    await page.context().request.delete(`${BASE}/api/cart?id=all`)

    // 2. Navigate to products and add items
    await page.goto(`${BASE}/products`)
    await page.waitForSelector('.grid', { timeout: 10000 })

    // 3. Add 2 products to cart
    const addButtons = page.locator('button:has-text("Προσθήκη")')
    await addButtons.nth(0).click()
    await expect(page.locator('text=✓').first()).toBeVisible({ timeout: 5000 })

    await page.waitForTimeout(500)
    await addButtons.nth(1).click()
    await expect(page.locator('text=✓').nth(1)).toBeVisible({ timeout: 5000 })

    // 4. Navigate to cart page
    await page.goto(`${BASE}/cart`)
    await expect(page.getByTestId('cart-title')).toBeVisible()

    // 5. Extract count from cart title
    const titleText = await page.getByTestId('cart-title').textContent()
    const titleMatch = titleText?.match(/\((\d+)\)/)
    const titleCount = titleMatch ? parseInt(titleMatch[1]) : 0

    // 6. Extract count from header badge (if visible)
    const badge = page.locator('[aria-label="cart-count"]')
    let badgeCount = 0

    if (await badge.isVisible({ timeout: 2000 }).catch(() => false)) {
      const badgeText = await badge.textContent()
      badgeCount = badgeText ? parseInt(badgeText) : 0
    }

    // 7. Assert both show same count
    expect(titleCount).toBe(2)
    expect(badgeCount).toBe(2)
    expect(titleCount).toBe(badgeCount)

    // 8. Verify with API
    const apiResponse = await page.context().request.get(`${BASE}/api/cart`)
    const apiData = await apiResponse.json()
    expect(apiData.items.length).toBe(2)
  })

  test('empty cart shows consistent count', async ({ page }) => {
    // 1. Clear cart
    await page.goto(`${BASE}/cart`)
    await page.context().request.delete(`${BASE}/api/cart?id=all`)

    // 2. Reload cart page
    await page.reload()
    await expect(page.getByTestId('cart-title')).toBeVisible()

    // 3. Title should show "Καλάθι" without count
    const titleText = await page.getByTestId('cart-title').textContent()
    expect(titleText).toBe('Καλάθι ')

    // 4. Badge should not be visible (count is 0)
    const badge = page.locator('[aria-label="cart-count"]')
    await expect(badge).not.toBeVisible({ timeout: 2000 })

    // 5. Verify with API
    const apiResponse = await page.context().request.get(`${BASE}/api/cart`)
    const apiData = await apiResponse.json()
    expect(apiData.items.length).toBe(0)
  })

  test('cart badge in navigation matches API count', async ({ page }) => {
    // 1. Clear cart
    await page.goto(`${BASE}/cart`)
    await page.context().request.delete(`${BASE}/api/cart?id=all`)

    // 2. Add 1 item via API
    await page.context().request.post(`${BASE}/api/cart`, {
      data: {
        id: 'test-product-1',
        title: 'Test Product',
        priceCents: 1000
      }
    })

    // 3. Navigate to home/products
    await page.goto(`${BASE}/products`)

    // 4. Wait for badge to update
    await page.waitForTimeout(1000)

    // 5. Check badge shows 1
    const badge = page.locator('[aria-label="cart-count"]')
    if (await badge.isVisible({ timeout: 2000 }).catch(() => false)) {
      const badgeText = await badge.textContent()
      expect(parseInt(badgeText || '0')).toBe(1)
    }

    // 6. Navigate to cart and verify title
    await page.goto(`${BASE}/cart`)
    const titleText = await page.getByTestId('cart-title').textContent()
    expect(titleText).toContain('(1)')
  })
})

import { test, expect } from '@playwright/test'

test.describe('AddToCart Button Visual Feedback', () => {
  test('shows "✓ Προστέθηκε" feedback after clicking add button', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')

    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })

    // Get the first add-to-cart button
    const firstButton = page.locator('[data-testid="add-to-cart-button"]').first()

    // Verify initial state shows "Προσθήκη"
    await expect(firstButton).toContainText('Προσθήκη')
    await expect(firstButton).not.toContainText('Προστέθηκε')

    // Click the button
    await firstButton.click()

    // Verify the button shows "✓ Προστέθηκε" feedback
    await expect(firstButton).toContainText('✓ Προστέθηκε', { timeout: 1000 })

    // Verify button is disabled during feedback state
    await expect(firstButton).toBeDisabled()

    // Wait for feedback to clear (900ms timeout + buffer)
    await expect(firstButton).toContainText('Προσθήκη', { timeout: 2000 })

    // Verify button is re-enabled
    await expect(firstButton).toBeEnabled()
  })

  test('cart badge updates while button shows feedback', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })

    const cartBadge = page.locator('[data-testid="cart-badge"]')
    const firstButton = page.locator('[data-testid="add-to-cart-button"]').first()

    // Add product to cart
    await firstButton.click()

    // While button shows feedback, cart badge should update
    await expect(firstButton).toContainText('✓ Προστέθηκε')
    await expect(cartBadge.locator('span:has-text("1")')).toBeVisible({ timeout: 1000 })

    // Wait for button to return to normal state
    await expect(firstButton).toContainText('Προσθήκη', { timeout: 2000 })

    // Cart badge should still show "1"
    await expect(cartBadge.locator('span:has-text("1")')).toBeVisible()
  })

  test('multiple rapid clicks are prevented by disabled state', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })

    const cartBadge = page.locator('[data-testid="cart-badge"]')
    const firstButton = page.locator('[data-testid="add-to-cart-button"]').first()

    // Click button
    await firstButton.click()

    // Verify feedback state
    await expect(firstButton).toContainText('✓ Προστέθηκε')
    await expect(firstButton).toBeDisabled()

    // Try to click again while disabled (should not add another item)
    await firstButton.click({ force: true }).catch(() => {}) // Ignore click on disabled element

    // Wait for state to clear
    await expect(firstButton).toContainText('Προσθήκη', { timeout: 2000 })

    // Cart should only have 1 item (not 2)
    await expect(cartBadge.locator('span:has-text("1")')).toBeVisible()
  })

  test('feedback state persists correctly across multiple products', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })

    const cartBadge = page.locator('[data-testid="cart-badge"]')
    const buttons = page.locator('[data-testid="add-to-cart-button"]')

    // Click first button
    await buttons.nth(0).click()
    await expect(buttons.nth(0)).toContainText('✓ Προστέθηκε')

    // Immediately click second button
    await buttons.nth(1).click()
    await expect(buttons.nth(1)).toContainText('✓ Προστέθηκε')

    // Both buttons should show feedback independently
    await expect(buttons.nth(0)).toContainText('✓ Προστέθηκε')
    await expect(buttons.nth(1)).toContainText('✓ Προστέθηκε')

    // Wait for both to return to normal
    await expect(buttons.nth(0)).toContainText('Προσθήκη', { timeout: 2000 })
    await expect(buttons.nth(1)).toContainText('Προσθήκη', { timeout: 2000 })

    // Cart should show 2 items
    await expect(cartBadge.locator('span:has-text("2")')).toBeVisible({ timeout: 1000 })
  })

  test('button accessibility attributes are present', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })

    const firstButton = page.locator('[data-testid="add-to-cart-button"]').first()

    // Verify aria-label exists
    const ariaLabel = await firstButton.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
    expect(ariaLabel).toContain('Προσθήκη')

    // Verify aria-live for dynamic updates
    const ariaLive = await firstButton.getAttribute('aria-live')
    expect(ariaLive).toBe('polite')

    // Click and verify disabled state has proper attribute
    await firstButton.click()
    const isDisabled = await firstButton.isDisabled()
    expect(isDisabled).toBe(true)
  })
})

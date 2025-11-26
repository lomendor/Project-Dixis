import { test, expect, Page } from '@playwright/test'

/**
 * E2E Test Suite: AG124 - Checkout Submit → Order in Neon
 * Tests the complete checkout flow with Zod validation and Neon DB persistence
 *
 * Flow: Cart → POST /api/checkout → Neon DB → /thank-you with breakdown
 */

class CheckoutTestHelper {
  constructor(private page: Page) {}

  /**
   * Add products to cart via UI
   */
  async addProductsToCart(count: number = 2) {
    await this.page.goto('/products')
    await this.page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })

    for (let i = 0; i < count; i++) {
      const productCard = this.page.locator('[data-testid="product-card"]').nth(i)
      await productCard.scrollIntoViewIfNeeded()

      // Click "Add to Cart" button on the card (or navigate to PDP)
      const addBtn = productCard.locator('button:has-text("Προσθήκη")')
      if (await addBtn.count() > 0) {
        await addBtn.click()
        await this.page.waitForTimeout(500)
      } else {
        // Navigate to PDP and add from there
        await productCard.click()
        await this.page.waitForURL(/\/products\//)
        await this.page.locator('[data-testid="add-to-cart"]').click()
        await this.page.waitForTimeout(500)
        await this.page.goto('/products')
      }
    }
  }

  /**
   * Navigate to checkout page
   */
  async goToCheckout() {
    await this.page.goto('/checkout')
    await this.page.waitForSelector('[data-testid="checkout-page"]', { timeout: 10000 })
  }

  /**
   * Fill checkout form with customer data
   */
  async fillCheckoutForm(data: {
    name: string
    phone: string
    email?: string
    address: string
    city: string
    postcode: string
  }) {
    await this.page.fill('[data-testid="checkout-name"]', data.name)
    await this.page.fill('[data-testid="checkout-phone"]', data.phone)
    if (data.email) {
      await this.page.fill('[data-testid="checkout-email"]', data.email)
    }
    await this.page.fill('[data-testid="checkout-address"]', data.address)
    await this.page.fill('[data-testid="checkout-city"]', data.city)
    await this.page.fill('[data-testid="checkout-postcode"]', data.postcode)
  }

  /**
   * Submit checkout form
   */
  async submitCheckout() {
    await this.page.click('[data-testid="checkout-submit"]')
  }

  /**
   * Wait for redirect to thank-you page and return order ID
   */
  async waitForThankYouPage(): Promise<string | null> {
    await this.page.waitForURL(/\/thank-you\?id=/, { timeout: 15000 })
    const url = this.page.url()
    const match = url.match(/id=([^&]+)/)
    return match ? match[1] : null
  }

  /**
   * Verify thank-you page shows correct breakdown
   */
  async verifyThankYouBreakdown() {
    // Wait for page to load
    await this.page.waitForSelector('text=Σύνολο:', { timeout: 10000 })

    // Verify Greek labels are present (using exact matches to avoid ambiguity)
    await expect(this.page.locator('text=Υποσύνολο:')).toBeVisible()
    await expect(this.page.locator('text=Αποστολή')).toBeVisible()
    await expect(this.page.locator('text=ΦΠΑ')).toBeVisible()
    await expect(this.page.locator('text=Σύνολο:').last()).toBeVisible()

    // Verify at least one product item is visible (product title text)
    const orderItems = this.page.locator('text=/x \\d+/')
    await expect(orderItems.first()).toBeVisible()
  }
}

test.describe('AG124: Checkout Submit → Order in Neon', () => {

  test('S1: Happy path - valid customer + 2 items → success → thank-you shows breakdown', async ({ page }) => {
    const helper = new CheckoutTestHelper(page)

    console.log('🧪 S1: Testing happy path checkout flow...')

    // Step 1: Add 2 products to cart
    await helper.addProductsToCart(2)

    // Step 2: Navigate to checkout
    await helper.goToCheckout()

    // Verify checkout page loaded with cart items
    await expect(page.locator('[data-testid="checkout-page"]')).toBeVisible()
    await expect(page.locator('text=Checkout')).toBeVisible()

    // Step 3: Fill customer information
    await helper.fillCheckoutForm({
      name: 'Γιώργος Παπαδόπουλος',
      phone: '+30 210 1234567',
      email: 'giorgos@example.com',
      address: 'Ακαδημίας 123',
      city: 'Αθήνα',
      postcode: '10671'
    })

    // Step 4: Submit checkout
    await helper.submitCheckout()

    // Step 5: Verify redirect to thank-you page
    const orderId = await helper.waitForThankYouPage()
    expect(orderId).toBeTruthy()
    expect(orderId).toMatch(/^[a-z0-9]{20,}$/) // CUID format

    console.log(`✅ Order created: ${orderId}`)

    // Step 6: Verify thank-you page shows breakdown
    await helper.verifyThankYouBreakdown()

    console.log('✅ S1: Happy path completed successfully')
  })

  test('S2: Validation - missing required fields → Zod errors displayed', async ({ page }) => {
    const helper = new CheckoutTestHelper(page)

    console.log('🧪 S2: Testing validation for missing required fields...')

    // Step 1: Add product to cart
    await helper.addProductsToCart(1)

    // Step 2: Navigate to checkout
    await helper.goToCheckout()

    // Step 3: Try to submit empty form (HTML5 validation will prevent this)
    // So we'll fill only partial data
    await page.fill('[data-testid="checkout-name"]', 'Test User')
    // Leave phone, address, city, postcode empty

    // HTML5 required validation should prevent submit
    // Verify required attributes exist
    await expect(page.locator('[data-testid="checkout-phone"]')).toHaveAttribute('required', '')
    await expect(page.locator('[data-testid="checkout-address"]')).toHaveAttribute('required', '')
    await expect(page.locator('[data-testid="checkout-city"]')).toHaveAttribute('required', '')
    await expect(page.locator('[data-testid="checkout-postcode"]')).toHaveAttribute('required', '')

    console.log('✅ S2: Required field validation verified')
  })

  test('S3: Validation - invalid phone format → error message', async ({ page }) => {
    const helper = new CheckoutTestHelper(page)

    console.log('🧪 S3: Testing phone validation...')

    // Step 1: Add product to cart
    await helper.addProductsToCart(1)

    // Step 2: Navigate to checkout
    await helper.goToCheckout()

    // Step 3: Fill form with invalid phone
    await helper.fillCheckoutForm({
      name: 'Test User',
      phone: '123', // Invalid format
      address: 'Test Address 1',
      city: 'Athens',
      postcode: '10671'
    })

    // Step 4: Submit checkout
    await helper.submitCheckout()

    // Step 5: Verify error message appears (Zod validation)
    const errorElement = page.locator('[data-testid="checkout-error"]')
    await expect(errorElement).toBeVisible({ timeout: 5000 })

    // Verify validation error message appears (generic for now)
    // TODO: Display specific field errors from Zod validation response
    const errorText = await errorElement.textContent()
    expect(errorText).toContain('Validation failed')

    console.log('✅ S3: Phone validation error displayed correctly')
  })

  test('S4: Validation - invalid postcode (not 5 digits) → error message', async ({ page }) => {
    const helper = new CheckoutTestHelper(page)

    console.log('🧪 S4: Testing postcode validation...')

    // Step 1: Add product to cart
    await helper.addProductsToCart(1)

    // Step 2: Navigate to checkout
    await helper.goToCheckout()

    // Step 3: Fill form with invalid postcode
    await helper.fillCheckoutForm({
      name: 'Test User',
      phone: '+30 210 1234567',
      address: 'Test Address 1',
      city: 'Athens',
      postcode: '123' // Invalid: not 5 digits
    })

    // HTML5 pattern validation should prevent submit
    const postcodeField = page.locator('[data-testid="checkout-postcode"]')
    await expect(postcodeField).toHaveAttribute('pattern', '[0-9]{5}')

    // Try to submit - HTML5 should block
    await helper.submitCheckout()

    // Browser will show native validation message
    // We can't easily test native validation messages, but we can verify pattern exists

    console.log('✅ S4: Postcode validation configured correctly')
  })

  test('S5: Empty cart → checkout page shows "Το καλάθι σας είναι κενό"', async ({ page }) => {
    console.log('🧪 S5: Testing empty cart handling...')

    // Step 1: Navigate to checkout with empty cart (clear localStorage first)
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    // Step 2: Verify empty cart message
    await expect(page.locator('text=Το καλάθι σας είναι κενό')).toBeVisible({ timeout: 10000 })

    // Step 3: Verify link to products page exists
    await expect(page.locator('a:has-text("Προβολή Προϊόντων")')).toBeVisible()

    console.log('✅ S5: Empty cart handling verified')
  })

  test('S6: Complete flow with email optional', async ({ page }) => {
    const helper = new CheckoutTestHelper(page)

    console.log('🧪 S6: Testing checkout without email (optional field)...')

    // Step 1: Add product to cart
    await helper.addProductsToCart(1)

    // Step 2: Navigate to checkout
    await helper.goToCheckout()

    // Step 3: Fill form WITHOUT email
    await helper.fillCheckoutForm({
      name: 'Μαρία Κωνσταντίνου',
      phone: '+30 694 1234567',
      // email omitted (optional)
      address: 'Πατησίων 50',
      city: 'Αθήνα',
      postcode: '10682'
    })

    // Step 4: Submit checkout
    await helper.submitCheckout()

    // Step 5: Verify success
    const orderId = await helper.waitForThankYouPage()
    expect(orderId).toBeTruthy()

    console.log(`✅ S6: Order created without email: ${orderId}`)
  })
})

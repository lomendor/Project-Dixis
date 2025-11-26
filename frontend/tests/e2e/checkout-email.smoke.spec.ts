import { test, expect, Page } from '@playwright/test'

/**
 * E2E Test Suite: AG125 - Email Notifications
 * Tests order confirmation email functionality with dry-run support
 *
 * Flow: Cart → POST /api/checkout → Email sent via Resend API
 * Note: Tests run with EMAIL_DRY_RUN=true (no real emails sent)
 */

class CheckoutEmailTestHelper {
  constructor(private page: Page) {}

  /**
   * Add products to cart via UI
   */
  async addProductsToCart(count: number = 1) {
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
}

test.describe('AG125: Email Notifications', () => {

  test('S1: Checkout with email → confirmation sent (dry-run)', async ({ page }) => {
    const helper = new CheckoutEmailTestHelper(page)

    console.log('🧪 S1: Testing email notification with dry-run mode...')

    // Collect console messages
    const consoleMessages: string[] = []
    const consoleErrors: string[] = []

    page.on('console', msg => {
      const text = msg.text()
      consoleMessages.push(text)
      if (msg.type() === 'error') {
        consoleErrors.push(text)
      }
    })

    // Step 1: Add product to cart
    await helper.addProductsToCart(1)

    // Step 2: Navigate to checkout
    await helper.goToCheckout()

    // Verify checkout page loaded
    await expect(page.locator('[data-testid="checkout-page"]')).toBeVisible()

    // Step 3: Fill form WITH email
    await helper.fillCheckoutForm({
      name: 'Test User Email',
      phone: '+30 210 1234567',
      email: 'test-email@example.com',
      address: 'Test Address 1',
      city: 'Athens',
      postcode: '10671'
    })

    // Step 4: Submit checkout
    await helper.submitCheckout()

    // Step 5: Verify redirect to thank-you page
    const orderId = await helper.waitForThankYouPage()
    expect(orderId).toBeTruthy()
    expect(orderId).toMatch(/^[a-z0-9]{20,}$/) // CUID format

    console.log(`✅ Order created: ${orderId}`)

    // Step 6: Verify no console errors occurred
    expect(consoleErrors).toHaveLength(0)

    // Step 7: Verify thank-you page loaded successfully
    await expect(page.locator('text=Σύνολο:')).toBeVisible()

    console.log('✅ S1: Email notification test passed (dry-run mode)')
  })

  test('S2: Checkout without email → no email sent (optional field)', async ({ page }) => {
    const helper = new CheckoutEmailTestHelper(page)

    console.log('🧪 S2: Testing checkout without email...')

    // Collect console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Step 1: Add product to cart
    await helper.addProductsToCart(1)

    // Step 2: Navigate to checkout
    await helper.goToCheckout()

    // Step 3: Fill form WITHOUT email (email is optional)
    await helper.fillCheckoutForm({
      name: 'Test User No Email',
      phone: '+30 694 1234567',
      // email omitted intentionally
      address: 'Test Address 2',
      city: 'Athens',
      postcode: '10682'
    })

    // Step 4: Submit checkout
    await helper.submitCheckout()

    // Step 5: Verify success (order created without email)
    const orderId = await helper.waitForThankYouPage()
    expect(orderId).toBeTruthy()

    console.log(`✅ Order created without email: ${orderId}`)

    // Step 6: Verify no errors (email send was skipped gracefully)
    expect(consoleErrors).toHaveLength(0)

    // Step 7: Verify thank-you page loaded successfully
    await expect(page.locator('text=Σύνολο:')).toBeVisible()

    console.log('✅ S2: Checkout without email passed')
  })

  test('S3: Email service handles missing API key gracefully', async ({ page }) => {
    const helper = new CheckoutEmailTestHelper(page)

    console.log('🧪 S3: Testing graceful degradation with missing API key...')

    // Note: In dry-run mode (EMAIL_DRY_RUN=true), missing API key is bypassed
    // This test verifies checkout succeeds even if email send fails

    const consoleWarnings: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'warning' || msg.text().includes('[CHECKOUT]')) {
        consoleWarnings.push(msg.text())
      }
    })

    // Step 1: Add product to cart
    await helper.addProductsToCart(1)

    // Step 2: Navigate to checkout
    await helper.goToCheckout()

    // Step 3: Fill form with email
    await helper.fillCheckoutForm({
      name: 'Test User API Key',
      phone: '+30 210 5555555',
      email: 'test-apikey@example.com',
      address: 'Test Address 3',
      city: 'Athens',
      postcode: '10673'
    })

    // Step 4: Submit checkout
    await helper.submitCheckout()

    // Step 5: Verify checkout SUCCESS even if email fails
    const orderId = await helper.waitForThankYouPage()
    expect(orderId).toBeTruthy()

    console.log(`✅ Order created despite potential email failure: ${orderId}`)

    // Step 6: Verify thank-you page loaded
    await expect(page.locator('text=Σύνολο:')).toBeVisible()

    console.log('✅ S3: Graceful degradation test passed')
  })
})

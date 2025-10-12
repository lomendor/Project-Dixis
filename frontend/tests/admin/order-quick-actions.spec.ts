import { test, expect } from '@playwright/test'

test('admin can use quick actions to change order status (PACKING→SHIPPED)', async ({ page }) => {
  // 1) Seed a product
  await page.goto('http://localhost:3001/api/seed/product')
  const seedText = await page.locator('body').textContent()
  const prodMatch = seedText?.match(/Product ID:\s*(\S+)/)
  const productId = prodMatch?.[1]
  if (!productId) throw new Error('No product ID found')

  // 2) Create an order
  const createRes = await page.request.post('http://localhost:3001/api/test/create-order', {
    data: {
      items: [{ productId, quantity: 1 }],
      buyerName: 'E2E Buyer',
      buyerPhone: '6900000000',
      shippingLine1: 'Test St 123',
      shippingCity: 'Athens',
      shippingPostal: '12345'
    }
  })
  const { orderId } = await createRes.json()

  // 3) Admin OTP bypass
  await page.goto('http://localhost:3001/admin/auth?otp=000000')
  await page.waitForURL(/\/admin(\/|$)/, { timeout: 10000 })

  // 4) Navigate to order detail
  await page.goto(`http://localhost:3001/admin/orders/${orderId}`)
  await page.waitForSelector('h1:has-text("Παραγγελία")', { timeout: 10000 })

  // 5) Click PACKING quick action
  const packingBtn = page.getByTestId('qa-packing')
  await expect(packingBtn).toBeVisible()
  await packingBtn.click()

  // Wait for status update (page reload)
  await page.waitForTimeout(2000)

  // Verify PACKING status (either badge or quick actions text)
  const bodyText = await page.locator('body').textContent()
  const hasPacking = bodyText?.includes('PACKING') || bodyText?.includes('Συσκευασία')
  expect(hasPacking).toBeTruthy()

  // 6) Click SHIPPED quick action (should appear after PACKING)
  const shippedBtn = page.getByTestId('qa-shipped')
  await expect(shippedBtn).toBeVisible()
  await shippedBtn.click()

  // Wait for status update
  await page.waitForTimeout(2000)

  // Verify SHIPPED status
  const finalText = await page.locator('body').textContent()
  const hasShipped = finalText?.includes('SHIPPED') || finalText?.includes('Απεστάλη')
  expect(hasShipped).toBeTruthy()
})

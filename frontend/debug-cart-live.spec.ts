import { test, expect } from '@playwright/test'

test('Debug cart + button on production', async ({ page }) => {
  const consoleErrors: string[] = []

  // Monitor console
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
      console.log('❌ Console Error:', msg.text())
    }
  })

  console.log('1️⃣ Going to products page...')
  await page.goto('https://dixis.io/products', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="add-to-cart-button"]', { timeout: 10000 })

  console.log('2️⃣ Clicking first "Προσθήκη" button...')
  await page.click('[data-testid="add-to-cart-button"]')
  await page.waitForTimeout(2000)

  console.log('3️⃣ Going to cart page...')
  await page.goto('https://dixis.io/cart', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="qty"]', { timeout: 10000 })

  console.log('4️⃣ Getting initial state...')
  const initialQty = await page.textContent('[data-testid="qty"]')
  console.log('   Initial qty:', initialQty)

  // Check localStorage
  const cartData = await page.evaluate(() => localStorage.getItem('dixis:cart:v1'))
  console.log('   Cart localStorage:', cartData)

  console.log('5️⃣ Inspecting + button...')
  const plusButton = await page.locator('[data-testid="qty-plus"]')
  const buttonExists = await plusButton.count()
  console.log('   Plus button count:', buttonExists)

  if (buttonExists > 0) {
    const buttonHTML = await plusButton.first().evaluate(el => el.outerHTML)
    console.log('   Button HTML:', buttonHTML)

    // Check if button has onClick handler
    const hasOnClick = await plusButton.first().evaluate(el => {
      const btn = el as HTMLButtonElement
      return {
        type: btn.type,
        disabled: btn.disabled,
        hasOnClick: btn.onclick !== null,
        className: btn.className
      }
    })
    console.log('   Button properties:', hasOnClick)

    console.log('6️⃣ Clicking + button...')
    await plusButton.first().click()
    await page.waitForTimeout(1500)

    const newQty = await page.textContent('[data-testid="qty"]')
    console.log('   New qty:', newQty)

    const newCartData = await page.evaluate(() => localStorage.getItem('dixis:cart:v1'))
    console.log('   New cart localStorage:', newCartData)

    if (newQty === initialQty) {
      console.log('   ❌ Quantity did NOT change!')
      console.log('   💡 Checking React state...')

      // Try to access the zustand store
      const storeState = await page.evaluate(() => {
        try {
          // @ts-ignore
          return window.__NEXT_DATA__
        } catch (e) {
          return null
        }
      })
      console.log('   Next Data:', storeState)
    } else {
      console.log('   ✅ Quantity changed successfully!')
    }
  }

  console.log('\n📋 Console Errors:', consoleErrors.length ? consoleErrors : 'None')

  // Pause for manual inspection
  await page.pause()
})

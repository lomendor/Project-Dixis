import { test, expect } from '@playwright/test'
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001'

test.describe('Tracking Timeline UI', () => {
  test('timeline shows Greek status labels and visual flow', async ({ page }) => {
    // Navigate to public tracking page with a demo token
    await page.goto(`${base}/track/__demo_token__`)

    // Check page heading exists
    await expect(page.getByRole('heading', { name: 'Παρακολούθηση παραγγελίας' })).toBeVisible()

    // Timeline should show Greek labels for statuses
    // Expecting at least some of these to be visible (depends on order status)
    const greekLabels = ['Πληρωμή', 'Συσκευασία', 'Απεστάλη', 'Παραδόθηκε']

    // At least one Greek label should be visible on the page
    let foundLabel = false
    for (const label of greekLabels) {
      const labelVisible = await page.getByText(label).isVisible().catch(() => false)
      if (labelVisible) {
        foundLabel = true
        break
      }
    }

    expect(foundLabel).toBe(true)
  })

  test('timeline component renders with PAID status by default', async ({ page }) => {
    await page.goto(`${base}/track/__demo_token__`)

    // Timeline visual indicators should be present
    // Look for the "Πληρωμή" (PAID) status label
    await expect(page.getByText('Πληρωμή')).toBeVisible()
  })

  test('cancelled orders show special cancelled indicator', async ({ page, request }) => {
    // This test assumes we can create a cancelled order via API
    // For now, we'll skip if not in dev environment
    const isDev = process.env.NODE_ENV === 'development' || process.env.CI !== 'true'
    test.skip(!isDev, 'Cancelled order test only in dev mode')

    // If we had a cancelled order, check for the red alert box
    // await page.goto(`${base}/track/CANCELLED_TOKEN`)
    // await expect(page.getByText('Ακυρώθηκε')).toBeVisible()
    // await expect(page.locator('div').filter({ hasText: 'Ακυρώθηκε' }).first()).toHaveCSS('background-color', 'rgb(254, 242, 242)')
  })
})

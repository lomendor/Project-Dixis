import { test, expect } from '@playwright/test'
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001'

test('invalid token shows friendly Greek message', async ({ page }) => {
  await page.goto(`${base}/track/__definitely_invalid__`)
  await expect(page.getByRole('heading', { name: 'Παρακολούθηση παραγγελίας' })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText(/Μη έγκυρο token|Δεν βρέθηκε παραγγελία/)
})

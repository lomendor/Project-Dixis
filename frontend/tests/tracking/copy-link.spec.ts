import { test, expect } from '@playwright/test'
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001'

test('copy link button toggles to Αντιγράφηκε!', async ({ page }) => {
  await page.goto(`${base}/track/__demo_token__`)
  const btn = page.getByRole('button', { name: /Αντιγραφή συνδέσμου|Αντιγράφηκε!/ })
  await expect(btn).toBeVisible()
  await btn.click()
  await expect(page.getByRole('button', { name: 'Αντιγράφηκε!' })).toBeVisible()
})

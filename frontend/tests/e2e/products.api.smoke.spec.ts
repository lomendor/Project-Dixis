import { test, expect } from '@playwright/test'
const BASE = process.env.BASE_URL || 'https://dixis.io'

test('/api/products responds 200 & JSON shape', async ({ request }) => {
  const res = await request.get(`${BASE}/api/products`)
  expect(res.status()).toBe(200)
  const j = await res.json()
  expect(j).toHaveProperty('items')
  expect(Array.isArray(j.items)).toBeTruthy()
})

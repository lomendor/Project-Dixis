import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'https://dixis.gr'

test('/api/products returns 200 with items array', async ({ request }) => {
  const res = await request.get(`${BASE}/api/products`)
  expect(res.status()).toBe(200)

  const json = await res.json()
  expect(json).toHaveProperty('source')
  expect(json).toHaveProperty('count')
  expect(json).toHaveProperty('items')
  expect(Array.isArray(json.items)).toBeTruthy()
})

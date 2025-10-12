import { test, expect } from '@playwright/test'
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001'

test('GET /api/dev/health (dev-only smoke test)', async ({ request }) => {
  const res = await request.get(base + '/api/dev/health')

  // Should return 200 in dev/local/CI environments
  expect(res.status()).toBe(200)

  const json = await res.json()

  // Validate response structure
  expect(json).toHaveProperty('ok')
  expect(json).toHaveProperty('env')
  expect(json).toHaveProperty('requestId')
  expect(json).toHaveProperty('db')

  // Validate types
  expect(typeof json.ok).toBe('boolean')
  expect(typeof json.env).toBe('string')
  expect(typeof json.requestId).toBe('string')
  expect(['ok', 'fail', 'na']).toContain(json.db)

  // Validate x-request-id header
  const headers = await res.headersArray()
  const ridHeader = headers.find(h => h.name.toLowerCase() === 'x-request-id')
  expect(ridHeader).toBeTruthy()
  expect(ridHeader?.value).toBe(json.requestId)

  // Database should be 'ok' (works with both SQLite in CI and Postgres in prod)
  expect(json.db).toBe('ok')
})

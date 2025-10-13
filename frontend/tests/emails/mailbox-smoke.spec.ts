import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

test('@smoke dev mailbox endpoint responds (non-prod)', async ({ request }) => {
  const r = await request.get(base + '/api/dev/mailbox');
  // 200 in dev/ci, 404 only if DIXIS_ENV=production
  expect([200, 404]).toContain(r.status());
  console.log(`✅ Dev mailbox status: ${r.status()}`);
});

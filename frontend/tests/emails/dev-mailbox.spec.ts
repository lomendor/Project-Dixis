import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

test('@smoke dev mailbox API responds', async ({ request }) => {
  // Check mailbox API is available in non-production
  const res = await request.get(base + '/api/dev/mailbox');
  
  // Should be 200 in dev/ci, 404 in production
  expect([200, 404]).toContain(res.status());
  
  if (res.status() === 200) {
    const json = await res.json();
    // Mailbox should return items array or item object
    expect(json).toHaveProperty('items');
    console.log(`✅ Dev mailbox available: ${json.items?.length || 0} emails`);
  } else {
    console.log('⚠️  Dev mailbox not available (production mode)');
  }
});

test('@smoke dev mailbox filters by recipient', async ({ request }) => {
  const testEmail = 'test-mailbox@example.com';
  
  // Query specific recipient
  const res = await request.get(base + `/api/dev/mailbox?to=${encodeURIComponent(testEmail)}`);
  
  if (res.status() === 200) {
    const json = await request.json();
    // Should return item object (first match) or null
    expect(json).toHaveProperty('item');
    console.log(`✅ Mailbox query for ${testEmail}: ${json.item ? 'found' : 'empty'}`);
  }
});

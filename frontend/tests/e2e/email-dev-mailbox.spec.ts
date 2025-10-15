import { test, expect, request } from '@playwright/test';

test('dev mailbox receives a test email (if endpoint exists)', async () => {
  const ctx = await request.newContext();

  // Προσπάθησε να στείλεις ένα δοκιμαστικό email μέσω CI-only route (αν υπάρχει)
  const payload = { to: 'e2e+devmail@dixis.local', subject: 'E2E Test', body: 'hello from tests' };
  const send = await ctx.post('/api/ci/devmail/send', { data: payload }).catch(() => null);

  // Αν δεν υπάρχει route, απλά δοκίμασε να διαβάσεις mailbox· αν ούτε αυτό υπάρχει, skip
  const list = await ctx.get('/api/dev/mailbox?to=' + encodeURIComponent(payload.to)).catch(() => null);
  if (!list || list.status() === 404) test.skip(true, 'dev mailbox endpoint not present');

  expect(list.status()).toBeLessThan(400);
  let j: any[] = [];
  try { j = await list.json(); } catch {}
  // Αν στείλαμε email και το endpoint υποστηρίζεται, περιμένουμε να εμφανιστεί
  if (send && send.ok()) {
    expect(Array.isArray(j)).toBeTruthy();
    expect(j.some(m => (m.subject || '').includes('E2E Test'))).toBeTruthy();
  } else {
    // Διαφορετικά, αρκεί να υπάρχει mailbox λίστα (smoke)
    expect(Array.isArray(j)).toBeTruthy();
  }
});

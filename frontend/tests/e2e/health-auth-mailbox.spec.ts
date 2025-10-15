import { test, expect, request } from '@playwright/test';

test('health shows auth/mailbox (when available)', async () => {
  const ctx = await request.newContext();
  const res = await ctx.get('/api/healthz').catch(() => null);
  expect(res, 'healthz should respond').toBeTruthy();
  if (!res) return;
  expect(res.status(), 'healthz status').toBeLessThan(400);
  let j: any = {};
  try { j = await res.json(); } catch {}
  // Αν τα keys υπάρχουν, ελέγξτε ότι είναι enabled. Διαφορετικά, απλώς περάστε το smoke.
  if ('basicAuth' in j) expect(j.basicAuth).toBeTruthy();
  if ('devMailbox' in j) expect(j.devMailbox).toBeTruthy();
});

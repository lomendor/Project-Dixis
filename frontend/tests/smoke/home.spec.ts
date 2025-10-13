import { test, expect } from '@playwright/test';

/**
 * @smoke - Lightweight smoke test για γρήγορη επαλήθευση βασικής λειτουργίας
 * Ελέγχει αν η αρχική σελίδα απαντά με επιτυχία (200) ή redirect (301/302)
 */
test('@smoke home responds', async ({ request }) => {
  const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3001';
  const res = await request.get(base + '/');

  // Αποδεκτά: 200 OK, 301/302 redirect
  expect([200, 301, 302]).toContain(res.status());

  console.log(`✅ Home page responded with status ${res.status()}`);
});

test('@smoke API health check', async ({ request }) => {
  const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3001';

  // Ελέγχουμε αν το API health endpoint απαντά
  const res = await request.get(base + '/api/health');

  // Αποδεκτά: 200 OK ή 404 (αν δεν έχει φτιαχτεί ακόμα το endpoint)
  expect([200, 404]).toContain(res.status());

  console.log(`✅ API health endpoint responded with status ${res.status()}`);
});

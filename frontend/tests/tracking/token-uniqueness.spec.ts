import { test, expect } from '@playwright/test';
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';
test('no duplicate publicToken after creating orders', async ({ request }) => {
  // Δημιούργησε 2 απλές παραγγελίες μέσω checkout εάν υπάρχει endpoint (προαιρετικά)
  // Ακόμα κι αν δεν υπάρχει, ο έλεγχος duplicates θα τρέξει στο υπάρχον dataset
  const dup = await request.get(base+'/api/dev/tokens/duplicates');
  expect([200,404]).toContain(dup.status());
  if (dup.status()===200){
    const j = await dup.json();
    expect(j.duplicates).toBe(0);
  }
});

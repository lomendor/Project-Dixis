import { test, expect } from '@playwright/test';

test('orders/lookup hits 429 after many rapid requests', async ({ request }) => {
  // στείλε γρήγορα αρκετά αιτήματα μέχρι να πάρεις 429 (χωρίς email/orderId valid δεν μας νοιάζει)
  let got429 = false;
  for (let i = 0; i < 90; i++) {
    const r = await request.post('/api/orders/lookup', {
      data: { email: 'bot@example.com', orderId: 'non-existent' }
    });
    if (r.status() === 429) { got429 = true; break; }
  }
  expect(got429).toBeTruthy();
});

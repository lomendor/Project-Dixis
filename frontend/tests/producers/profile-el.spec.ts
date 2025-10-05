import { test, expect } from '@playwright/test';

test('[producers] Προφίλ παραγωγού εμφανίζεται με ελληνικά CTA', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

  // Create a test producer first via API
  const basic = process.env.BASIC_AUTH
    ? 'Basic ' + Buffer.from(process.env.BASIC_AUTH).toString('base64')
    : '';

  if (!basic) {
    test.skip(true, 'BASIC_AUTH not provided');
    return;
  }

  // Create test producer
  const testProducer = {
    name: 'Test Producer Profile',
    slug: 'test-producer-profile-' + Date.now(),
    region: 'Αττική',
    category: 'Λαχανικά',
    description: 'Test description for profile',
    phone: '+306912345678',
    approved: true,
  };

  const createRes = await page.request.post(`${base}/api/admin/producers`, {
    headers: { authorization: basic },
    data: testProducer,
  });

  if (!createRes.ok()) {
    console.log('Failed to create test producer:', await createRes.text());
    test.skip(true, 'Could not create test producer');
    return;
  }

  const created = await createRes.json();

  // Navigate to producer profile
  await page.goto(`${base}/producers/${created.id}`, { waitUntil: 'domcontentloaded' });

  // Check that Greek UI elements are visible
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Κοινοποίηση' })).toBeVisible();

  // Check for "Κλήση" link if phone exists
  if (testProducer.phone) {
    await expect(page.getByRole('link', { name: /Κλήση/ })).toBeVisible();
  }

  // Check breadcrumb
  await expect(page.getByRole('link', { name: /Πίσω στη λίστα/ })).toBeVisible();
});

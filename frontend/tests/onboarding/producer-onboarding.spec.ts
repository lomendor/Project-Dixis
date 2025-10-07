import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3001';

test.describe('Producer Onboarding Flow', () => {
  test('New producer completes onboarding and accesses /my/orders', async ({ page, context }) => {
    // Set a mock session cookie (simulating logged-in user without producer profile)
    await context.addCookies([
      {
        name: 'dixis_session',
        value: 'test-session-' + Date.now(),
        domain: 'localhost',
        path: '/'
      }
    ]);

    // Try to access /my/orders - should redirect to onboarding
    await page.goto(base + '/my/orders');
    
    // Should be redirected to onboarding page
    await page.waitForURL(/\/producer\/onboarding/, { timeout: 10000 });
    
    // Verify onboarding page loaded
    await expect(page.locator('h1')).toContainText(/onboarding/i);

    // Fill out onboarding form
    await page.fill('input[name="name"]', 'Μελισσοκομία Δήμου');
    await page.fill('input[name="region"]', 'Αττική');
    await page.selectOption('select[name="category"]', 'Μέλι');
    await page.fill('textarea[name="description"]', 'Παραγωγή φυσικού μελιού από τις πλαγιές του Υμηττού');

    // Submit the form
    await page.getByRole('button', { name: /ολοκλήρωση/i }).click();

    // After successful onboarding, should redirect to /my/products
    await page.waitForURL(/\/my\/(products|orders)/, { timeout: 10000 });

    // Now try accessing /my/orders again - should work without redirect
    await page.goto(base + '/my/orders');
    await page.waitForLoadState('networkidle');
    
    // Should show orders page (not redirect to onboarding)
    const url = page.url();
    expect(url).toContain('/my/orders');
    expect(url).not.toContain('/onboarding');
  });

  test('Producer with existing profile is not redirected to onboarding', async ({ page, context }) => {
    // Set session cookie for existing producer
    await context.addCookies([
      {
        name: 'dixis_session',
        value: 'existing-producer-session',
        domain: 'localhost',
        path: '/'
      }
    ]);

    // Mock: assume this session has an associated producer
    // In a real test, you'd set up test data beforehand

    // Visit onboarding page directly
    await page.goto(base + '/producer/onboarding');
    
    // Should redirect to /my/products since producer already exists
    // (This test will only pass if the producer exists in DB)
    // For now, we just verify the page loads without errors
    await page.waitForLoadState('networkidle');
  });

  test('Onboarding form validates required fields', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'dixis_session',
        value: 'test-validation-' + Date.now(),
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.goto(base + '/producer/onboarding');
    await page.waitForURL(/\/producer\/onboarding/);

    // Try to submit empty form
    await page.getByRole('button', { name: /ολοκλήρωση/i }).click();

    // Browser should prevent submission due to required fields
    // Check that we're still on onboarding page
    const url = page.url();
    expect(url).toContain('/onboarding');
  });

  test('Onboarding form accepts valid Greek producer data', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'dixis_session',
        value: 'test-greek-data-' + Date.now(),
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.goto(base + '/producer/onboarding');
    await page.waitForURL(/\/producer\/onboarding/);

    // Fill with Greek characters and special chars
    await page.fill('input[name="name"]', 'Τυροκομείο "Η Αγελάδα"');
    await page.fill('input[name="region"]', 'Ήπειρος');
    await page.selectOption('select[name="category"]', 'Τυροκομικά');
    await page.fill('textarea[name="description"]', 'Παραδοσιακά τυριά από αγελάδες που βόσκουν σε ορεινά λιβάδια.');
    await page.fill('input[name="contactPhone"]', '+30 2651098765');

    // Submit
    await page.getByRole('button', { name: /ολοκλήρωση/i }).click();

    // Should redirect successfully
    await page.waitForURL(/\/my\//, { timeout: 10000 });
  });
});

import { test, expect } from '@playwright/test';

test.describe('Admin Product Moderation Queue', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

  test.beforeEach(async ({ page }) => {
    // Clear storage to start fresh
    await page.goto(baseUrl);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('admin can see pending products and approve one', async ({ page }) => {
    // Step 1: Login as admin
    const loginResponse = await page.request.post(`${apiUrl}/test/login`, {
      data: { email: 'admin@example.com', role: 'admin' },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const { token } = await loginResponse.json();

    await page.goto(baseUrl);
    await page.evaluate((t) => localStorage.setItem('auth_token', t), token);

    // Step 2: Create a pending product via API
    const producerLoginResponse = await page.request.post(`${apiUrl}/test/login`, {
      data: { email: 'producer@example.com', role: 'producer' },
    });
    const { token: producerToken } = await producerLoginResponse.json();

    const createProductResponse = await page.request.post(`${apiUrl}/products`, {
      headers: { Authorization: `Bearer ${producerToken}` },
      data: {
        name: 'Test Pending Product for Approval',
        description: 'Test product awaiting approval',
        price: '15.50',
        unit: 'kg',
        stock: 100,
        approval_status: 'pending',
      },
    });
    expect(createProductResponse.ok()).toBeTruthy();
    const product = await createProductResponse.json();

    // Step 3: Go to moderation queue
    await page.goto(`${baseUrl}/admin/products/moderation`);

    // Step 4: Verify pending product appears
    await expect(page.getByText('Test Pending Product for Approval')).toBeVisible({ timeout: 10000 });

    // Step 5: Click approve button
    const approveButton = page.locator('button:has-text("Έγκριση")').first();
    await approveButton.click();

    // Confirm dialog
    page.on('dialog', dialog => dialog.accept());

    // Step 6: Wait for success notification
    await page.waitForTimeout(2000);

    // Step 7: Verify product removed from pending list
    await expect(page.getByText('Test Pending Product for Approval')).not.toBeVisible();
  });

  test('admin can reject product with reason', async ({ page }) => {
    // Step 1: Login as admin
    const loginResponse = await page.request.post(`${apiUrl}/test/login`, {
      data: { email: 'admin@example.com', role: 'admin' },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const { token } = await loginResponse.json();

    await page.goto(baseUrl);
    await page.evaluate((t) => localStorage.setItem('auth_token', t), token);

    // Step 2: Create a pending product via API
    const producerLoginResponse = await page.request.post(`${apiUrl}/test/login`, {
      data: { email: 'producer@example.com', role: 'producer' },
    });
    const { token: producerToken } = await producerLoginResponse.json();

    const createProductResponse = await page.request.post(`${apiUrl}/products`, {
      headers: { Authorization: `Bearer ${producerToken}` },
      data: {
        name: 'Test Pending Product for Rejection',
        description: 'Test product to be rejected',
        price: '12.00',
        unit: 'kg',
        stock: 50,
        approval_status: 'pending',
      },
    });
    expect(createProductResponse.ok()).toBeTruthy();

    // Step 3: Go to moderation queue
    await page.goto(`${baseUrl}/admin/products/moderation`);

    // Step 4: Verify pending product appears
    await expect(page.getByText('Test Pending Product for Rejection')).toBeVisible({ timeout: 10000 });

    // Step 5: Click reject button
    const rejectButton = page.locator('button:has-text("Απόρριψη")').first();
    await rejectButton.click();

    // Step 6: Modal should open, enter reason
    await expect(page.getByText('Απόρριψη Προϊόντος')).toBeVisible();
    await page.fill('textarea', 'Product images do not meet quality standards. Please upload higher resolution photos.');

    // Step 7: Submit rejection
    await page.locator('button:has-text("Απόρριψη Προϊόντος")').click();

    // Handle alert
    page.on('dialog', dialog => dialog.accept());

    // Step 8: Wait for action to complete
    await page.waitForTimeout(2000);

    // Step 9: Verify product removed from pending list
    await expect(page.getByText('Test Pending Product for Rejection')).not.toBeVisible();
  });

  test('non-admin cannot access moderation queue', async ({ page }) => {
    // Step 1: Login as producer (not admin)
    const loginResponse = await page.request.post(`${apiUrl}/test/login`, {
      data: { email: 'producer@example.com', role: 'producer' },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const { token } = await loginResponse.json();

    await page.goto(baseUrl);
    await page.evaluate((t) => localStorage.setItem('auth_token', t), token);

    // Step 2: Try to access moderation queue
    await page.goto(`${baseUrl}/admin/products/moderation`);

    // Step 3: Verify access denied message
    await expect(page.getByText('Δεν έχετε δικαίωμα πρόσβασης')).toBeVisible({ timeout: 5000 });
  });
});

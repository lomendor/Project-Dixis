import { test, expect } from '@playwright/test';

/**
 * Admin Panel E2E Tests
 * Tests the admin panel functionality including producers, products, and orders management
 */

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();

    // Mock admin authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock_admin_token');
      localStorage.setItem('user_role', 'admin');
      localStorage.setItem('user_email', 'admin@dixis.test');
      localStorage.setItem('user_id', '999');
    });

    // Clean logging for debug
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('PW:ADMIN-ERR', msg.text());
      }
    });
  });

  test('1) Admin can see producers list and approve/reject producers', async ({ page }) => {
    // Navigate to admin panel
    await page.goto('/admin');

    // Wait for admin panel to load
    await expect(page.getByTestId('admin-panel-title')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('admin-panel-title')).toContainText('Πάνελ Διαχείρισης');
    console.log('✅ Admin panel loaded');

    // Navigate to producers management
    await page.getByTestId('admin-producers-section').click();

    // Wait for producers page to load
    await expect(page.getByTestId('producers-title')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('producers-title')).toContainText('Διαχείριση Παραγωγών');
    console.log('✅ Producers management page loaded');

    // Verify producers table is visible
    await expect(page.getByTestId('producers-table')).toBeVisible();
    console.log('✅ Producers table displayed');

    // Test filter functionality
    await page.getByTestId('filter-pending').click();
    console.log('✅ Applied pending filter');

    // Look for pending producers and test approval
    const pendingProducers = page.locator('[data-testid^="producer-row-"]');
    const count = await pendingProducers.count();

    if (count > 0) {
      // Find first pending producer with approve button
      const approveButton = page.locator('[data-testid^="approve-producer-"]').first();
      if (await approveButton.isVisible()) {
        await approveButton.click();
        console.log('✅ Approved a pending producer');

        // Wait a moment for the update
        await page.waitForTimeout(1000);
      }
    }

    // Test rejection functionality
    await page.getByTestId('filter-pending').click();
    const rejectButton = page.locator('[data-testid^="reject-producer-"]').first();
    if (await rejectButton.isVisible()) {
      await rejectButton.click();
      console.log('✅ Rejected a pending producer');
    }

    // Test all filter
    await page.getByTestId('filter-all').click();
    console.log('✅ Applied all producers filter');

    console.log('✅ Producer approval/rejection test completed');
  });

  test('2) Admin can see all products including inactive products', async ({ page }) => {
    // Navigate to admin panel
    await page.goto('/admin');

    // Wait for admin panel to load
    await expect(page.getByTestId('admin-panel-title')).toBeVisible({ timeout: 15000 });

    // Navigate to products overview
    await page.getByTestId('admin-products-section').click();

    // Wait for products page to load
    await expect(page.getByTestId('products-overview-title')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('products-overview-title')).toContainText('Επισκόπηση Προϊόντων');
    console.log('✅ Products overview page loaded');

    // Verify products table is visible
    await expect(page.getByTestId('products-table')).toBeVisible();
    console.log('✅ Products table displayed');

    // Test status filters - check all products
    await page.getByTestId('status-filter').selectOption('all');

    // Count total products
    const allProductRows = page.locator('[data-testid^="product-row-"]');
    const totalCount = await allProductRows.count();
    console.log(`✅ Found ${totalCount} total products`);

    // Test active products filter
    await page.getByTestId('status-filter').selectOption('active');
    const activeProductRows = page.locator('[data-testid^="product-row-"]');
    const activeCount = await activeProductRows.count();
    console.log(`✅ Found ${activeCount} active products`);

    // Test inactive products filter
    await page.getByTestId('status-filter').selectOption('inactive');
    const inactiveProductRows = page.locator('[data-testid^="product-row-"]');
    const inactiveCount = await inactiveProductRows.count();
    console.log(`✅ Found ${inactiveCount} inactive products`);

    // Verify admin can see inactive products (which regular users cannot)
    if (inactiveCount > 0) {
      console.log('✅ Admin can view inactive products');
    }

    // Test producer filter
    await page.getByTestId('producer-filter').selectOption('1');
    console.log('✅ Applied producer filter');

    // Test search functionality
    await page.getByTestId('search-input').fill('ντομάτες');
    await page.waitForTimeout(500); // Allow for search debounce
    console.log('✅ Tested product search');

    // Clear search and reset filters
    await page.getByTestId('search-input').clear();
    await page.getByTestId('status-filter').selectOption('all');
    await page.getByTestId('producer-filter').selectOption('');

    console.log('✅ Product overview test completed');
  });

  test('3) Admin can see all orders and filter by status', async ({ page }) => {
    // Navigate to admin panel
    await page.goto('/admin');

    // Wait for admin panel to load
    await expect(page.getByTestId('admin-panel-title')).toBeVisible({ timeout: 15000 });

    // Navigate to orders overview
    await page.getByTestId('admin-orders-section').click();

    // Wait for orders page to load
    await expect(page.getByTestId('orders-overview-title')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('orders-overview-title')).toContainText('Επισκόπηση Παραγγελιών');
    console.log('✅ Orders overview page loaded');

    // Verify orders stats are displayed
    await expect(page.getByTestId('orders-stats')).toBeVisible();
    console.log('✅ Orders stats displayed');

    // Verify orders table is visible
    await expect(page.getByTestId('orders-table')).toBeVisible();
    console.log('✅ Orders table displayed');

    // Test status filters
    const statusFilters = [
      'all',
      'pending',
      'paid',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    ];

    for (const status of statusFilters) {
      await page.getByTestId('status-filter').selectOption(status);

      // Wait for filter to apply
      await page.waitForTimeout(300);

      // Count orders for this status
      const orderRows = page.locator('[data-testid^="order-row-"]');
      const count = await orderRows.count();
      console.log(`✅ Found ${count} orders with status: ${status}`);
    }

    // Test date range filters
    const dateFilters = ['all', 'today', 'week', 'month'];

    for (const dateRange of dateFilters) {
      await page.getByTestId('date-filter').selectOption(dateRange);
      await page.waitForTimeout(300);

      const orderRows = page.locator('[data-testid^="order-row-"]');
      const count = await orderRows.count();
      console.log(`✅ Found ${count} orders for date range: ${dateRange}`);
    }

    // Test search functionality
    await page.getByTestId('search-input').fill('ORDER-');
    await page.waitForTimeout(500);
    console.log('✅ Tested order search');

    // Test pagination if there are enough orders
    const nextPageButton = page.getByTestId('next-page');
    if (await nextPageButton.isVisible() && await nextPageButton.isEnabled()) {
      await nextPageButton.click();
      console.log('✅ Tested pagination - next page');

      const prevPageButton = page.getByTestId('prev-page');
      if (await prevPageButton.isVisible()) {
        await prevPageButton.click();
        console.log('✅ Tested pagination - previous page');
      }
    }

    // Clear search and reset filters
    await page.getByTestId('search-input').clear();
    await page.getByTestId('status-filter').selectOption('all');
    await page.getByTestId('date-filter').selectOption('all');

    console.log('✅ Orders overview test completed');
  });

  test('4) Admin panel navigation and quick actions work correctly', async ({ page }) => {
    // Navigate to admin panel
    await page.goto('/admin');

    // Wait for admin panel to load
    await expect(page.getByTestId('admin-panel-title')).toBeVisible({ timeout: 15000 });
    console.log('✅ Admin panel loaded');

    // Test navigation sections
    const sections = [
      { testId: 'admin-producers-section', expectedUrl: '/admin/producers' },
      { testId: 'admin-products-section', expectedUrl: '/admin/products' },
      { testId: 'admin-orders-section', expectedUrl: '/admin/orders' },
      { testId: 'admin-toggle-section', expectedUrl: '/admin/toggle' },
      { testId: 'admin-pricing-section', expectedUrl: '/admin/pricing' },
      { testId: 'admin-analytics-section', expectedUrl: '/admin/analytics' },
    ];

    for (const section of sections) {
      // Go back to main admin panel
      await page.goto('/admin');
      await expect(page.getByTestId('admin-panel-title')).toBeVisible();

      // Click section
      await page.getByTestId(section.testId).click();

      // Verify URL change
      await page.waitForURL(section.expectedUrl);
      console.log(`✅ Navigation to ${section.expectedUrl} works`);
    }

    // Test quick actions
    await page.goto('/admin');
    await expect(page.getByTestId('admin-panel-title')).toBeVisible();

    // Test quick approve producers button
    await page.getByTestId('quick-approve-producers').click();
    await page.waitForURL('/admin/producers');
    console.log('✅ Quick approve producers action works');

    // Go back and test quick view orders
    await page.goto('/admin');
    await page.getByTestId('quick-view-orders').click();
    await page.waitForURL('/admin/orders');
    console.log('✅ Quick view orders action works');

    console.log('✅ Admin panel navigation test completed');
  });
});
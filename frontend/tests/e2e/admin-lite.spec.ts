import { test, expect } from '@playwright/test';

// Test configuration
const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';
const BACKEND_URL = process.env.PLAYWRIGHT_API_URL || 'http://127.0.0.1:8001';

// Admin credentials from database seeder
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password'
};

test.describe('Admin Lite Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto(`${FRONTEND_URL}/auth/login`);
    
    // Login as admin user
    await page.fill('[data-testid="email-input"]', ADMIN_CREDENTIALS.email);
    await page.fill('[data-testid="password-input"]', ADMIN_CREDENTIALS.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login and dashboard navigation
    await page.waitForURL(`${FRONTEND_URL}/admin`);
    await expect(page.locator('[data-testid="nav-admin"]')).toBeVisible();
  });

  test('should display admin dashboard with stats cards', async ({ page }) => {
    // Check main dashboard title
    await expect(page.locator('h1')).toContainText('Διαχείριση Πλατφόρμας');
    
    // Check stats cards are present (4 cards expected)
    const statsCards = page.locator('[class*="grid"] > [class*="bg-white shadow rounded-lg"]').first();
    await expect(statsCards).toBeVisible();
    
    // Check for key metrics
    await expect(page.locator('text=Παραγωγοί')).toBeVisible();
    await expect(page.locator('text=Προϊόντα')).toBeVisible();
    await expect(page.locator('text=Παραγγελίες')).toBeVisible();
    await expect(page.locator('text=Έσοδα')).toBeVisible();
  });

  test('should display quick actions section', async ({ page }) => {
    // Check quick actions section
    await expect(page.locator('h3:has-text("Γρήγορες Ενέργειες")')).toBeVisible();
    
    // Check action links
    await expect(page.locator('text=Διαχείριση Παραγωγών')).toBeVisible();
    await expect(page.locator('text=Διαχείριση Προϊόντων')).toBeVisible();
    await expect(page.locator('text=Αναφορές & Αναλυτικά')).toBeVisible();
  });

  test('should navigate to producers management page', async ({ page }) => {
    // Click on producer management link
    await page.click('text=Διαχείριση Παραγωγών');
    
    // Wait for navigation and check URL
    await page.waitForURL(`${FRONTEND_URL}/admin/producers`);
    
    // Check producer management page elements
    await expect(page.locator('h1')).toContainText('Διαχείριση Παραγωγών');
    
    // Check filter tabs
    await expect(page.locator('text=Όλοι')).toBeVisible();
    await expect(page.locator('text=Εκκρεμείς')).toBeVisible();
    await expect(page.locator('text=Εγκεκριμένοι')).toBeVisible();
    await expect(page.locator('text=Απορριφθέντες')).toBeVisible();
  });

  test('should navigate to products management page', async ({ page }) => {
    // Click on product management link
    await page.click('text=Διαχείριση Προϊόντων');
    
    // Wait for navigation and check URL
    await page.waitForURL(`${FRONTEND_URL}/admin/products`);
    
    // Check product management page elements
    await expect(page.locator('h1')).toContainText('Διαχείριση Προϊόντων');
    
    // Check stats summary cards
    await expect(page.locator('text=Σύνολο Προϊόντων')).toBeVisible();
    await expect(page.locator('text=Ενεργά Προϊόντα')).toBeVisible();
    await expect(page.locator('text=Ανενεργά Προϊόντα')).toBeVisible();
    
    // Check filter tabs
    await expect(page.locator('text=Όλα')).toBeVisible();
    await expect(page.locator('text=Ενεργά')).toBeVisible();
    await expect(page.locator('text=Ανενεργά')).toBeVisible();
  });

  test('should handle producer status updates', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/producers`);
    
    // Switch to pending producers tab
    await page.click('text=Εκκρεμείς');
    
    // Look for pending producers (if any exist)
    const pendingProducers = page.locator('button:has-text("Έγκριση")');
    const count = await pendingProducers.count();
    
    if (count > 0) {
      // Get the first pending producer's approve button
      const firstApproveButton = pendingProducers.first();
      
      // Click approve button
      await firstApproveButton.click();
      
      // Wait for success toast or status update
      await expect(page.locator('[class*="toast"], text=εγκεκριμένος')).toBeVisible({ timeout: 5000 });
      
      // Switch to approved tab to verify the producer moved there
      await page.click('text=Εγκεκριμένοι');
      
      // The count should have changed
      await page.waitForTimeout(1000); // Allow for state update
    } else {
      console.log('No pending producers found for testing approval');
    }
  });

  test('should handle product status toggle', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/products`);
    
    // Wait for products to load
    await page.waitForSelector('[class*="grid"] > [class*="bg-white border"]', { timeout: 10000 });
    
    // Look for product cards
    const productCards = page.locator('[class*="grid"] > [class*="bg-white border"]');
    const count = await productCards.count();
    
    if (count > 0) {
      const firstProduct = productCards.first();
      
      // Get the current status badge
      const statusBadge = firstProduct.locator('[class*="inline-flex items-center px-2 py-1 rounded-full"]');
      const initialStatus = await statusBadge.textContent();
      
      // Find and click the toggle button
      const toggleButton = firstProduct.locator('button').last();
      await toggleButton.click();
      
      // Wait for success toast
      await expect(page.locator('[class*="toast"], text=επιτυχώς')).toBeVisible({ timeout: 5000 });
      
      // Verify status changed
      await page.waitForTimeout(1000);
      const newStatus = await statusBadge.textContent();
      expect(newStatus).not.toBe(initialStatus);
    } else {
      console.log('No products found for testing status toggle');
    }
  });

  test('should search and filter products', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/products`);
    
    // Wait for products to load
    await page.waitForSelector('input[placeholder*="Αναζήτηση"]', { timeout: 10000 });
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Αναζήτηση"]');
    await searchInput.fill('test');
    
    // Wait for search results to update
    await page.waitForTimeout(1000);
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(1000);
    
    // Test producer filter dropdown
    const producerDropdown = page.locator('select').last();
    await producerDropdown.selectOption({ index: 1 }); // Select first producer
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Reset to show all
    await producerDropdown.selectOption('all');
    await page.waitForTimeout(1000);
  });

  test('should display recent activity timeline', async ({ page }) => {
    // Check if recent activity section exists
    await expect(page.locator('h3:has-text("Πρόσφατη Δραστηριότητα")')).toBeVisible();
    
    // Check for activity items or empty state
    const activitySection = page.locator('h3:has-text("Πρόσφατη Δραστηριότητα")').locator('..').locator('..');
    
    // Either activities exist or empty state message is shown
    const hasActivities = await page.locator('[role="list"] li').count() > 0;
    const hasEmptyState = await page.locator('text=Δεν υπάρχει πρόσφατη δραστηριότητα').isVisible();
    
    expect(hasActivities || hasEmptyState).toBeTruthy();
  });

  test('should handle responsive navigation', async ({ page }) => {
    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile size
    
    // Check if mobile menu button is visible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Check admin link in mobile menu
    await expect(page.locator('[data-testid="mobile-nav-admin"]')).toBeVisible();
    
    // Test desktop navigation
    await page.setViewportSize({ width: 1200, height: 800 }); // Desktop size
    
    // Check desktop admin link
    await expect(page.locator('[data-testid="nav-admin"]')).toBeVisible();
  });

  test('should handle breadcrumb navigation', async ({ page }) => {
    // Navigate to producers page
    await page.goto(`${FRONTEND_URL}/admin/producers`);
    
    // Check breadcrumb navigation
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    
    // Click home breadcrumb
    await page.click('nav[aria-label="Breadcrumb"] a');
    
    // Should navigate back to admin dashboard
    await page.waitForURL(`${FRONTEND_URL}/admin`);
    await expect(page.locator('h1')).toContainText('Διαχείριση Πλατφόρμας');
  });

  test('should handle authentication guard', async ({ page }) => {
    // Logout
    await page.click('[data-testid="logout-btn"]');
    await page.waitForURL(`${FRONTEND_URL}/auth/login`);
    
    // Try to access admin page without authentication
    await page.goto(`${FRONTEND_URL}/admin`);
    
    // Should redirect to login
    await page.waitForURL(`${FRONTEND_URL}/auth/login`);
    await expect(page.locator('h2')).toContainText('Login');
  });

  test('should display Greek localization correctly', async ({ page }) => {
    // Check for Greek text throughout the admin interface
    const greekTexts = [
      'Διαχείριση Πλατφόρμας',
      'Παραγωγοί',
      'Προϊόντα',
      'Παραγγελίες',
      'Έσοδα',
      'Γρήγορες Ενέργειες',
      'Πρόσφατη Δραστηριότητα'
    ];

    for (const text of greekTexts) {
      await expect(page.locator(`text=${text}`)).toBeVisible();
    }
  });
});

test.describe('Admin Access Control', () => {
  test('should deny access to non-admin users', async ({ page }) => {
    // Login as consumer
    await page.goto(`${FRONTEND_URL}/auth/login`);
    await page.fill('[data-testid="email-input"]', 'consumer@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for login redirect
    await page.waitForURL(`${FRONTEND_URL}/`);
    
    // Try to access admin page
    await page.goto(`${FRONTEND_URL}/admin`);
    
    // Should redirect away from admin (not to admin page)
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin');
  });

  test('should deny access to producer users', async ({ page }) => {
    // Login as producer
    await page.goto(`${FRONTEND_URL}/auth/login`);
    await page.fill('[data-testid="email-input"]', 'producer@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for login redirect
    await page.waitForURL(`${FRONTEND_URL}/producer/dashboard`);
    
    // Try to access admin page
    await page.goto(`${FRONTEND_URL}/admin`);
    
    // Should redirect to producer dashboard
    await page.waitForURL(`${FRONTEND_URL}/producer/dashboard`);
    expect(page.url()).toContain('/producer/dashboard');
  });
});
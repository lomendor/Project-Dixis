import { test, expect } from '@playwright/test';

test.describe('[i18n] Παραγωγοί σε ελληνικά', () => {
  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';

  test('should display Greek producers list page', async ({ page }) => {
    await page.goto(`${baseUrl}/producers`, { waitUntil: 'domcontentloaded' });

    // Check Greek title
    await expect(page.locator('h1')).toContainText(/Παραγωγοί/);

    // Check filters in Greek
    await expect(page.locator('label[for="search-input"]')).toContainText(/Αναζήτηση/);
    await expect(page.locator('label[for="region-select"]')).toContainText(/Περιοχή/);
    await expect(page.locator('label[for="category-select"]')).toContainText(/Κατηγορία/);
    await expect(page.locator('label[for="sort-select"]')).toContainText(/Ταξινόμηση/);

    // Check search input placeholder
    const searchInput = page.locator('input#search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /Αναζήτηση/);
  });

  test('should have accessible filters with ARIA labels', async ({ page }) => {
    await page.goto(`${baseUrl}/producers`, { waitUntil: 'domcontentloaded' });

    // Check ARIA roles
    const filtersPanel = page.locator('[role="search"]');
    await expect(filtersPanel).toBeVisible();

    const producersList = page.locator('[role="region"]');
    await expect(producersList).toBeVisible();

    // Check minimum touch targets (44px)
    const searchInput = page.locator('input#search-input');
    const box = await searchInput.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should filter producers by search query', async ({ page }) => {
    await page.goto(`${baseUrl}/producers`, { waitUntil: 'domcontentloaded' });

    // Wait for producers to load
    await page.waitForSelector('.producers-grid, .empty-state', { timeout: 5000 });

    const searchInput = page.locator('input#search-input');
    await searchInput.fill('Test');

    // Check live region updates
    const countElement = page.locator('.producers-count');
    await expect(countElement).toBeVisible();
  });

  test('should display empty state with Greek message', async ({ page }) => {
    await page.goto(`${baseUrl}/producers`, { waitUntil: 'domcontentloaded' });

    const searchInput = page.locator('input#search-input');
    await searchInput.fill('NonexistentProducerXYZ123');

    // Check empty state
    const emptyState = page.locator('.empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText(/Δεν βρέθηκαν/);
  });

  test('should navigate to producer detail page', async ({ page }) => {
    await page.goto(`${baseUrl}/producers`, { waitUntil: 'domcontentloaded' });

    // Wait for producers grid or empty state
    await page.waitForSelector('.producers-grid, .empty-state', { timeout: 5000 });

    // Check if there are any producer cards
    const producerCards = page.locator('.producer-card');
    const count = await producerCards.count();

    if (count > 0) {
      // Click first producer's view profile button
      const firstCard = producerCards.first();
      const viewButton = firstCard.locator('.btn-primary');
      await viewButton.click();

      // Should navigate to detail page
      await page.waitForURL(/\/producers\/\d+/, { timeout: 5000 });

      // Check breadcrumb in Greek
      const breadcrumb = page.locator('.breadcrumb a');
      await expect(breadcrumb).toContainText(/Παραγωγοί/);
    }
  });
});

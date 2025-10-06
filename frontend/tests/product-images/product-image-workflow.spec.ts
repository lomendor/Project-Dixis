import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

const base = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3001';

// Create a simple test PNG image (1x1 pixel red)
const testImageBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
  'base64'
);

test.describe('Product Image Upload Workflow', () => {
  test('Upload image → create product → thumbnail appears in list', async ({ page }) => {
    // Navigate to login page
    await page.goto(base + '/auth/login');

    // Mock login as producer
    await page.evaluate(() => {
      document.cookie = 'dixis_session=mock-producer-session; path=/';
    });

    // Navigate to create product page
    await page.goto(base + '/producer/products/create');

    // Wait for the page to load
    await expect(page.getByTestId('page-title')).toContainText('Νέο Προϊόν');

    // Fill in product details
    await page.getByTestId('title-input').fill('Μέλι Θυμαρίσιο με Εικόνα');
    await page.getByTestId('name-input').fill('meli-thymario-image');
    await page.getByTestId('price-input').fill('8.50');
    await page.getByTestId('stock-input').fill('15');

    // Upload image using the file input (hidden)
    // The UploadImage component has a hidden file input
    const fileInput = page.locator('input[type="file"]');

    // Create a temporary file
    const tempFile = join(process.cwd(), 'temp-test-image.png');
    require('fs').writeFileSync(tempFile, testImageBuffer);

    await fileInput.setInputFiles(tempFile);

    // Wait for upload to complete (image preview should appear)
    await expect(page.locator('img[alt="Εικόνα προϊόντος"]')).toBeVisible({ timeout: 10000 });

    // Submit the form
    await page.getByTestId('submit-btn').click();

    // Should redirect to products list
    await expect(page).toHaveURL(base + '/producer/products');

    // Wait for the products table to load
    await expect(page.getByTestId('products-table')).toBeVisible();

    // Find the newly created product row
    const productRow = page.locator('[data-testid^="product-row-"]').filter({
      hasText: 'Μέλι Θυμαρίσιο με Εικόνα'
    });

    await expect(productRow).toBeVisible();

    // Check that the thumbnail is visible (not placeholder)
    const thumbnail = productRow.locator('[data-testid^="product-thumbnail-"]');
    await expect(thumbnail).toBeVisible();

    // Verify it's an actual image, not the placeholder
    const thumbnailSrc = await thumbnail.getAttribute('src');
    expect(thumbnailSrc).toBeTruthy();
    expect(thumbnailSrc).toContain('/uploads/');

    // Clean up temp file
    require('fs').unlinkSync(tempFile);
  });

  test('Create product without image → placeholder appears', async ({ page }) => {
    await page.goto(base + '/auth/login');

    await page.evaluate(() => {
      document.cookie = 'dixis_session=mock-producer-session; path=/';
    });

    await page.goto(base + '/producer/products/create');

    await expect(page.getByTestId('page-title')).toContainText('Νέο Προϊόν');

    // Fill in product details WITHOUT uploading an image
    await page.getByTestId('title-input').fill('Προϊόν χωρίς Εικόνα');
    await page.getByTestId('name-input').fill('product-no-image');
    await page.getByTestId('price-input').fill('5.00');
    await page.getByTestId('stock-input').fill('10');

    await page.getByTestId('submit-btn').click();

    await expect(page).toHaveURL(base + '/producer/products');

    const productRow = page.locator('[data-testid^="product-row-"]').filter({
      hasText: 'Προϊόν χωρίς Εικόνα'
    });

    await expect(productRow).toBeVisible();

    // Check that the placeholder is visible
    const placeholder = productRow.locator('[data-testid^="product-placeholder-"]');
    await expect(placeholder).toBeVisible();
    await expect(placeholder).toContainText('📦');
  });

  test('Edit product → upload image → thumbnail updates', async ({ page }) => {
    await page.goto(base + '/auth/login');

    await page.evaluate(() => {
      document.cookie = 'dixis_session=mock-producer-session; path=/';
    });

    // Go to products list
    await page.goto(base + '/producer/products');
    await expect(page.getByTestId('products-table')).toBeVisible();

    // Click edit on the first product
    const editBtn = page.getByTestId('edit-product-1');
    await editBtn.click();

    await expect(page).toHaveURL(/\/producer\/products\/\d+\/edit/);
    await expect(page.getByTestId('page-title')).toContainText('Επεξεργασία Προϊόντος');

    // Upload an image
    const fileInput = page.locator('input[type="file"]');
    const tempFile = join(process.cwd(), 'temp-edit-test-image.png');
    require('fs').writeFileSync(tempFile, testImageBuffer);

    await fileInput.setInputFiles(tempFile);
    await expect(page.locator('img[alt="Εικόνα προϊόντος"]')).toBeVisible({ timeout: 10000 });

    // Submit the form
    await page.getByTestId('submit-btn').click();

    await expect(page).toHaveURL(base + '/producer/products');

    // Check that the thumbnail is now visible for product 1
    const productRow = page.locator('[data-testid="product-row-1"]');
    const thumbnail = productRow.locator('[data-testid="product-thumbnail-1"]');
    await expect(thumbnail).toBeVisible();

    const thumbnailSrc = await thumbnail.getAttribute('src');
    expect(thumbnailSrc).toContain('/uploads/');

    require('fs').unlinkSync(tempFile);
  });

  test('Remove image from product → placeholder appears', async ({ page }) => {
    await page.goto(base + '/auth/login');

    await page.evaluate(() => {
      document.cookie = 'dixis_session=mock-producer-session; path=/';
    });

    // First create a product with an image
    await page.goto(base + '/producer/products/create');
    await page.getByTestId('title-input').fill('Προϊόν για Αφαίρεση Εικόνας');
    await page.getByTestId('name-input').fill('product-remove-image');
    await page.getByTestId('price-input').fill('7.00');
    await page.getByTestId('stock-input').fill('20');

    const fileInput = page.locator('input[type="file"]');
    const tempFile = join(process.cwd(), 'temp-remove-test-image.png');
    require('fs').writeFileSync(tempFile, testImageBuffer);
    await fileInput.setInputFiles(tempFile);
    await expect(page.locator('img[alt="Εικόνα προϊόντος"]')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(base + '/producer/products');

    // Find the product and click edit
    const productRow = page.locator('[data-testid^="product-row-"]').filter({
      hasText: 'Προϊόν για Αφαίρεση Εικόνας'
    });
    await expect(productRow).toBeVisible();

    const editBtn = productRow.locator('button:has-text("Επεξεργασία")');
    await editBtn.click();

    await expect(page.getByTestId('page-title')).toContainText('Επεξεργασία Προϊόντος');

    // Click "Remove Image" button
    const removeBtn = page.locator('button:has-text("Αφαίρεση εικόνας")');
    await removeBtn.click();

    // Image preview should disappear, drag-drop area should appear
    await expect(page.locator('img[alt="Εικόνα προϊόντος"]')).not.toBeVisible();
    await expect(page.locator('text=Σύρε εδώ μια εικόνα ή')).toBeVisible();

    // Submit
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(base + '/producer/products');

    // Check that placeholder appears
    const updatedRow = page.locator('[data-testid^="product-row-"]').filter({
      hasText: 'Προϊόν για Αφαίρεση Εικόνας'
    });
    const placeholder = updatedRow.locator('[data-testid^="product-placeholder-"]');
    await expect(placeholder).toBeVisible();

    require('fs').unlinkSync(tempFile);
  });

  test('Upload validation: file too large (>5MB)', async ({ page }) => {
    await page.goto(base + '/auth/login');

    await page.evaluate(() => {
      document.cookie = 'dixis_session=mock-producer-session; path=/';
    });

    await page.goto(base + '/producer/products/create');

    // Create a 6MB file
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
    const tempFile = join(process.cwd(), 'temp-large-test-image.png');
    require('fs').writeFileSync(tempFile, largeBuffer);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(tempFile);

    // Should show error message
    await expect(page.locator('text=Το αρχείο υπερβαίνει τα 5MB')).toBeVisible({ timeout: 5000 });

    require('fs').unlinkSync(tempFile);
  });
});

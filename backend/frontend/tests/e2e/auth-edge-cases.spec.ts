import { test, expect } from '@playwright/test';

test('auth edge-cases - wrong password then correct password', async ({ page }) => {
  // Navigate to login page
  await Promise.all([
    page.waitForURL('**/auth/login', { timeout: 10000 }),
    page.goto('/auth/login')
  ]);
  
  // Fill login form with wrong password (using correct test user email)
  await page.fill('[name="email"]', 'test@dixis.local');
  await page.fill('[name="password"]', 'wrong-password');
  
  // Submit login form with wrong password
  await page.click('button[type="submit"]');
  
  // Wait for error message to appear (use specific selector to avoid Next.js route announcer)
  const errorMessage = page.getByTestId('error-toast');
  await expect(errorMessage).toBeVisible({ timeout: 10000 });
  
  // Verify error message content
  await expect(errorMessage).toContainText(/invalid|incorrect|wrong|failed/i);
  
  // Clear the password field and enter correct password
  await page.fill('[name="password"]', '');
  await page.fill('[name="password"]', 'Passw0rd!');
  
  // Submit login form with correct password
  await Promise.all([
    page.waitForURL('/', { timeout: 10000 }),
    page.click('button[type="submit"]')
  ]);
  
  // Should be redirected to home page after successful login
  await expect(page).toHaveURL('/');
  
  // Verify login worked - should see user menu
  await expect(page.locator('[data-testid="user-menu"]').first()).toBeVisible({ timeout: 10000 });
});

test('auth edge-cases - empty fields validation', async ({ page }) => {
  // Navigate to login page
  await Promise.all([
    page.waitForURL('**/auth/login', { timeout: 10000 }),
    page.goto('/auth/login')
  ]);
  
  // Try to submit with empty fields
  await page.click('button[type="submit"]');
  
  // Wait for validation errors
  const emailError = page.locator('input[name="email"] + .error, [data-testid="email-error"]');
  const passwordError = page.locator('input[name="password"] + .error, [data-testid="password-error"]');
  
  // Check for HTML5 validation or custom error messages
  const emailField = page.locator('input[name="email"]');
  const passwordField = page.locator('input[name="password"]');
  
  // Verify fields are marked as invalid (HTML5 validation or custom)
  await expect(emailField).toHaveAttribute('required');
  await expect(passwordField).toHaveAttribute('required');
  
  // Ensure we're still on login page (not redirected)
  await expect(page).toHaveURL(/.*auth\/login/);
});

test('auth edge-cases - invalid email format', async ({ page }) => {
  // Navigate to login page
  await Promise.all([
    page.waitForURL('**/auth/login', { timeout: 10000 }),
    page.goto('/auth/login')
  ]);
  
  // Fill login form with invalid email format
  await page.fill('[name="email"]', 'invalid-email-format');
  await page.fill('[name="password"]', 'Passw0rd!');
  
  // Submit login form
  await page.click('button[type="submit"]');
  
  // Check for validation error or server error (more specific selector)
  const errorIndicator = page.locator('[data-testid="error-toast"], input[name="email"]:invalid');
  
  try {
    await expect(errorIndicator).toBeVisible({ timeout: 5000 });
  } catch {
    // If no visible error, check if HTML5 validation prevented submission
    await expect(page).toHaveURL(/.*auth\/login/);
  }
});
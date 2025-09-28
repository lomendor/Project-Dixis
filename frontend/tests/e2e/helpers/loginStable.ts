import { Page, expect } from '@playwright/test';

/**
 * Stable login helper that waits for proper session establishment
 * Fixes auth redirect timing and localStorage persistence issues
 */
export async function loginStable(page: Page, email?: string, password?: string): Promise<void> {
  const testEmail = email || process.env.TEST_USER_EMAIL || 'consumer@example.com';
  const testPassword = password || process.env.TEST_USER_PASSWORD || 'secret123';
  
  // Navigate to base page first (ensure same-origin)
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Navigate to login
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  await page.getByTestId('email-input').fill(testEmail);
  await page.getByTestId('password-input').fill(testPassword);
  
  // Submit and wait for session establishment
  await page.getByTestId('login-submit').click();
  
  // Wait for session/auth API response before checking URL
  await page.waitForResponse(r => 
    (/\/(session|me|auth\/check)\b/.test(r.url()) && r.ok()), 
    { timeout: 30000 }
  );
  
  // Now wait for redirect to home
  await expect(page).toHaveURL('/', { timeout: 30000 });
  
  // Verify user menu is visible (confirms successful auth)
  await expect(page.getByTestId('user-menu')).toBeVisible({ timeout: 10000 });
}

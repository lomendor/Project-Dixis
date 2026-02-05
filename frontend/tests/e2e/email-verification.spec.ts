import { test, expect } from '@playwright/test';

/**
 * Pass EMAIL-VERIFY-01: Email verification E2E tests.
 *
 * These tests verify the frontend behavior for the verify-email page.
 * Note: Full flow testing (register → receive email → verify) requires
 * email interception which is not available in this E2E setup.
 */
test.describe('Email Verification Page', () => {
  test('shows missing params state when no token/email provided', async ({ page }) => {
    // Navigate to verify-email without query params
    await page.goto('/auth/verify-email');

    // Should show missing params state
    await expect(page.getByTestId('verify-missing')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('page-title')).toBeVisible();

    // Should have link back to login
    await expect(page.getByText(/Πίσω στη Σύνδεση|Back to Login/i)).toBeVisible();
  });

  test('shows expired state for invalid token', async ({ page }) => {
    // Navigate with invalid token
    await page.goto('/auth/verify-email?token=invalid-token&email=test@example.com');

    // Wait for verification attempt to complete
    // Pass EMAIL-VERIFY-ACTIVATE-01: Backend returns "Invalid or expired" which
    // contains "expired" → frontend shows expired state (has resend button)
    await expect(page.getByTestId('verify-expired')).toBeVisible({ timeout: 15000 });

    // Should have resend button for expired tokens
    await expect(page.getByTestId('resend-button')).toBeVisible();
  });
});

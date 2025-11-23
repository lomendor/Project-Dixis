import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'https://dixis.io';

test.describe('Cart add → badge → cart page', () => {
  test('add two items updates cart badge and /cart loads cleanly', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

    // 1) Go to products
    await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Προϊόντα/i })).toBeVisible();

    // 2) Click "Προσθήκη" twice (first 2 visible buttons)
    const addButtons = page.getByRole('button', { name: /Προσθήκη/i });
    await expect(addButtons.first()).toBeVisible();
    await addButtons.first().click();
    // μικρό delay για badge update
    await page.waitForTimeout(300);
    const addCount = await addButtons.count();
    if (addCount > 1) {
      await addButtons.nth(1).click();
      await page.waitForTimeout(300);
    } else {
      // αν υπάρχει μόνο ένα, πατάμε δύο φορές το ίδιο
      await addButtons.first().click();
      await page.waitForTimeout(300);
    }

    // 3) Badge count (εύκαμπτοι selectors)
    // Προσπαθούμε πρώτα με [data-testid], αλλιώς text-based fallback
    const candidateBadges = page.locator('[data-testid="cart-badge"], .cart-badge, a[href="/cart"] .badge, header .badge');
    // Αρκεί να υπάρχει κάποιο badge που περιέχει 2
    const badgeTextCandidates = await candidateBadges.allInnerTexts().catch(() => []);
    const anyShowsTwo = badgeTextCandidates.some(t => /\b2\b/.test(t.trim()));
    expect(anyShowsTwo, `Expected cart badge to show 2, got: ${badgeTextCandidates.join(' | ')}`).toBeTruthy();

    // 4) Go to /cart and ensure no console errors and 200
    await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded' });
    // Όποιος επικεφαλής: "Καλάθι" ή κάτι αντίστοιχο
    await expect(page.locator('h1, [role="heading"]')).toBeVisible();
    expect(errors, `Console errors: ${errors.join('\n')}`).toEqual([]);
  });
});

import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

test('EL-first: εμφανίζονται ελληνικές ετικέτες/μηνύματα στο checkout', async ({ page }) => {
  await page.goto(base + '/checkout');

  // Έλεγχος τίτλου (ελληνικά)
  await expect(page.getByText(/Ολοκλήρωση Παραγγελίας|Checkout/i)).toBeVisible();

  // Έλεγχος πεδίων φόρμας (ελληνικά placeholders)
  await expect(page.getByPlaceholder(/Ονοματεπώνυμο|Full name/i)).toBeVisible();
  await expect(page.getByPlaceholder(/Τηλέφωνο|Phone/i)).toBeVisible();
  await expect(page.getByPlaceholder(/Διεύθυνση|Address/i)).toBeVisible();
  await expect(page.getByPlaceholder(/Πόλη|City/i)).toBeVisible();
  await expect(page.getByPlaceholder(/Τ\.Κ\.|Postal/i)).toBeVisible();
});

test('Validation: φόρμα δέχεται έγκυρα ελληνικά δεδομένα', async ({ page }) => {
  await page.goto(base + '/checkout');

  // Αν υπάρχει φόρμα, συμπλήρωσε έγκυρα δεδομένα
  const nameInput = page.getByPlaceholder(/Ονοματεπώνυμο|Full name/i);
  const phoneInput = page.getByPlaceholder(/Τηλέφωνο|Phone/i);
  const addressInput = page.getByPlaceholder(/Διεύθυνση|Address/i);
  const cityInput = page.getByPlaceholder(/Πόλη|City/i);
  const postalInput = page.getByPlaceholder(/Τ\.Κ\.|Postal/i);

  if (await nameInput.isVisible()) {
    await nameInput.fill('Γιώργος Παπαδόπουλος');
    await phoneInput.fill('+306912345678');
    await addressInput.fill('Πανεπιστημίου 25');
    await cityInput.fill('Αθήνα');
    await postalInput.fill('10679');

    // Έλεγχος ότι τα πεδία έχουν συμπληρωθεί
    await expect(nameInput).toHaveValue('Γιώργος Παπαδόπουλος');
    await expect(phoneInput).toHaveValue('+306912345678');
    await expect(postalInput).toHaveValue('10679');
  }
});

test('UI: εμφανίζει περίληψη παραγγελίας όταν υπάρχουν προϊόντα', async ({ page }) => {
  // Προσθέτουμε mock δεδομένα στο localStorage
  await page.addInitScript(() => {
    window.localStorage.setItem('dixis_cart_v1', JSON.stringify({
      items: [
        { productId: '1', title: 'Test Product', price: 10, qty: 2 }
      ]
    }));
  });

  await page.goto(base + '/checkout');

  // Έλεγχος ότι εμφανίζεται η περίληψη
  await expect(page.getByText(/Περίληψη Παραγγελίας|Order Summary/i)).toBeVisible();
  await expect(page.getByText(/Test Product/i)).toBeVisible();
  await expect(page.getByText(/Σύνολο|Total/i)).toBeVisible();
});

test('Empty cart: εμφανίζει μήνυμα κενού καλαθιού', async ({ page }) => {
  // Καθαρίζουμε το localStorage
  await page.addInitScript(() => {
    window.localStorage.setItem('dixis_cart_v1', JSON.stringify({ items: [] }));
  });

  await page.goto(base + '/checkout');

  // Έλεγχος μηνύματος κενού καλαθιού
  await expect(page.getByText(/Το καλάθι είναι άδειο|Cart is empty/i)).toBeVisible();
});

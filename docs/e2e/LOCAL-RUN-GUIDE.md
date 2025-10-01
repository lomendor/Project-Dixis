---
title: E2E — Οδηγός Τοπικής Εκτέλεσης
last_updated: 2025-09-30
---

# Οδηγός Τοπικής Εκτέλεσης E2E

Στόχος: αναπαραγώγιμη τοπική εκτέλεση E2E (χωρίς αλλαγές σε κώδικα/CI). Κανόνας θυρών: Frontend 3030 (CI), 3001 τοπικά αν χρειάζεται· API 8001.

## Προαπαιτούμενα
- Node.js 18+, npm ή pnpm
- PHP 8+, Composer
- Playwright Browsers: `npx playwright install --with-deps`
- Περιβάλλον: δείτε `frontend/.env.e2e.example`

## Βήματα Εκκίνησης (αναφορά)
1. Backend (API 8001)
   - `cd backend && php artisan serve --host=127.0.0.1 --port=8001`
2. Frontend (FE 3030 ή 3001 τοπικά)
   - `cd frontend && PORT=3030 NEXT_PUBLIC_E2E=true npm run dev`
   - Εναλλακτικά τοπικά: `PORT=3001`
3. Έλεγχος θυρών
   - `./scripts/check-ports.sh 3030 8001`
4. E2E (Consumer project)
   - `cd frontend && npx playwright test --project=consumer`

Σημείωση: Μην εκκινήσετε servers μέσα από αυτό το έγγραφο· οι εντολές είναι οδηγός.

## Συνήθη Σφάλματα & Λύσεις
- SecurityError (localStorage): εκτελέστε σε σωστή προέλευση `PLAYWRIGHT_BASE_URL` και αποφύγετε cross-origin.
- Κόλλημα στο `/auth/login`: βεβαιωθείτε ότι API 8001 αποκρίνεται, και ότι fixtures/credentials είναι έγκυρα.
- Port already in use: αλλάξτε `PORT=3001` για τοπικό dev ή τερματίστε την διεργασία.
- Μη διαθέσιμοι πόροι: ελέγξτε `NEXT_PUBLIC_API_BASE_URL` να δείχνει `http://127.0.0.1:8001/api/v1`.

## Συνδέσεις
- [PRD v2 — CI/CD & Ποιότητα](../prd/v2/07-ci-cd-and-quality.md)
- [Χάρτης Θυρών](./PORTS-MAP.md)


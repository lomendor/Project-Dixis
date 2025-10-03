---
title: E2E — Smoke Checklist (Phase-4)
last_updated: 2025-09-30
---

# Smoke Checklist (Phase-4)

Κριτήρια PASS για Phase-4 (host alignment + storageState via API):
- storageState δημιουργείται επιτυχώς (περιέχει `XSRF-TOKEN` και/ή `laravel_session`).
- Δεν υπάρχει redirect προς `/auth/login` στα smoke specs.
- ≥ 2/3 smoke specs PASS.

## Πίνακας Αποτελεσμάτων

| spec | pass/fail | duration | notes |
|---|---|---|---|
| auth-bootstrap.spec.ts | | | |
| cart-checkout-smoke.spec.ts | | | |
| producer-dashboard-smoke.spec.ts | | | |

## Σχετικά
- [API-first Auth](./AUTH-API-BOOTSTRAP.md)
- [Οδηγός Τοπικής Εκτέλεσης](./LOCAL-RUN-GUIDE.md)


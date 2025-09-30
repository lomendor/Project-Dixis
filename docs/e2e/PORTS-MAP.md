---
title: E2E — Χάρτης Θυρών & Μεταβλητών
last_updated: 2025-09-30
source: "rg scan across repo (docs-only)"
---

# Χάρτης Θυρών & Μεταβλητών (Repo)

Κανόνας (SSOT):
- Frontend: 3030 (CI canonical), 3001 επιτρέπεται τοπικά όπου χρειάζεται.
- API: 8001.

Στόχος: ορατότητα σε πραγματικές χρήσεις θυρών/μεταβλητών και σταδιακή εναρμόνιση.

## Πίνακας Ευρημάτων

| Τοποθεσία | Port/Var | Σχόλιο |
|---|---|---|
| `frontend/playwright.config.ts` | 3030, `PLAYWRIGHT_BASE_URL` | Default baseURL `http://127.0.0.1:3030` (CI canonical) |
| `frontend/nightly.lighthouserc.json` | 3001 | Lighthouse seed URLs σε 3001 (local historical) |
| `frontend/playwright.local.ts` | 3000 | Τοπικό config default σε 3000 (ιστορικό) |
| `frontend/package.json` | 3000 | `npm start -- --port 3000` για e2e:ci:setup (ιστορικό) |
| `frontend/tests/*` | `NEXT_PUBLIC_API_BASE_URL` | Πολλαπλές αναφορές σε 8001 API base |
| `frontend/src/env.ts` | 8001 | Default API base `http://127.0.0.1:8001/api/v1` |
| `frontend/src/app/api/*` | 8001 | Χρήση API base σε route handlers |
| `backend/README.md` | 8001 | Παραδείγματα health/api κλήσεων |
| `Makefile` | 8001 | Καθαρισμός διεργασιών στη θύρα 8001 |
| `docs/reports/*` | 3030 | CI E2E baseURL: `http://localhost:3030` |
| `TESTING.md`, `frontend/TESTING.md` | 3001/3030 | Τοπικά παραδείγματα σε 3001 και σημειώσεις για 3030 |

Πρόσθετα ευρήματα (ενδεικτικά): `CLAUDE.md` (3001), `API.md` (8001), `SESSION_CONTEXT.md`/`backend/README.md` (8001), demo READMEs.

## Κανονικοποίηση
- Ενιαίο default για E2E: Frontend 3030 (CI), API 8001.
- Τοπικά: Frontend 3001 επιτρεπτό — ευθυγράμμιση PLAYWRIGHT_BASE_URL αναλόγως.
- Αποφεύγουμε 3000 σε νέα παραδείγματα, εκτός αν legacy αρχείο το απαιτεί ρητά.

## Σχετικά
- [PRD v2 — CI/CD & Ποιότητα](../prd/v2/07-ci-cd-and-quality.md)


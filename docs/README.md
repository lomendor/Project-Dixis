---
title: Project Dixis — Docs Quick Nav
last_updated: 2025-09-30
---

# Docs Quick Navigation

Μικρή σελίδα προσανατολισμού για συνεισφέροντες. Όλα τα links είναι relative και αφορούν docs-only ροές.

## Quick Start
- Τοπικό E2E: [docs/e2e/LOCAL-RUN-GUIDE.md](./e2e/LOCAL-RUN-GUIDE.md)
- API-first Auth (Sanctum): [docs/e2e/AUTH-API-BOOTSTRAP.md](./e2e/AUTH-API-BOOTSTRAP.md)
- PRD v2 (index): [docs/prd/v2/index.md](./prd/v2/index.md)

## Ports & Hosts
- Frontend: 3030 (CI canonical), 3001 τοπικά αν απαιτείται
- API: 8001
- Βασικός host: 127.0.0.1 (ευθυγράμμιση FE/API για cookies/SameSite)

## Current Focus
- E2E Phase-4: Host alignment + storageState via API (βλ. PR #281)
- Σχετικά PRs: [#280](https://github.com/lomendor/Project-Dixis/pull/280), [#268](https://github.com/lomendor/Project-Dixis/pull/268)

## Artifacts
- Τα artifacts ανεβαίνουν πάντα (Playwright): `playwright-report/`, `test-results/` (traces, videos, screenshots όπου ισχύει)


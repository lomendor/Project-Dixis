# Summary: Pass-CI-NEON-COMPUTE-01

**Status**: VERIFIED (No changes needed)
**Date**: 2026-01-23
**PR**: N/A (docs-only verification)

---

## TL;DR

Audit shows **Neon is NOT used for CI E2E tests**. The "E2E (PostgreSQL)" job name is misleading - it uses SQLite via `.env.ci`. No Neon compute burn from tests.

---

## Result

| Question | Answer |
|----------|--------|
| Does CI use Neon for E2E? | ❌ No |
| What DB does E2E use? | SQLite (`file:./test.db`) |
| Any Neon CU burn from CI? | ❌ No |
| Changes needed? | ❌ None |

---

## Evidence

### e2e-postgres.yml Analysis
```yaml
# Despite the name "E2E (PostgreSQL)", it loads .env.ci which has:
DATABASE_URL=file:./test.db
DIXIS_DATA_SRC=sqlite
```

### Neon Only Used For Deploys
```bash
grep -r "DATABASE_URL.*secrets" .github/workflows/
# Results: Only prod-migration, staging-migration, prod-seed
# These are deployment workflows, NOT test workflows
```

### pg-e2e.yml (Label-Gated PG Tests)
Already uses GitHub Actions postgres service:
```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: dixis_e2e
```

---

## Architecture (Verified)

```
CI E2E Tests:
├── e2e-postgres.yml (PR checks)
│   └── SQLite (.env.ci) - fast, zero Neon cost
├── pg-e2e.yml (label-gated)
│   └── GitHub Actions postgres service - zero Neon cost
└── e2e-full.yml (nightly)
    └── SQLite (.env.ci) - zero Neon cost

Neon Usage (Deploy Only):
├── prod-migration.yml → DATABASE_URL_PROD (Neon)
├── staging-migration.yml → DATABASE_URL_STAGING (Neon)
└── prod-seed.yml → DATABASE_URL_PROD (Neon)
```

---

## Risks / Next

| Risk | Status |
|------|--------|
| None | Architecture already optimized |

### Potential Improvement (Low Priority)
- Rename "E2E (PostgreSQL)" to "E2E (SQLite)" for clarity
- Currently harmless but misleading

---

_Pass-CI-NEON-COMPUTE-01 | 2026-01-23_

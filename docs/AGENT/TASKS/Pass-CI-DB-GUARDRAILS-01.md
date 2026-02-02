# Pass CI-DB-GUARDRAILS-01: Default SQLite, gate Postgres E2E (Neon protection)

**Created**: 2026-02-02
**Status**: PREP (no push while Actions outage)
**Issue**: [#2596](https://github.com/lomendor/Project-Dixis/issues/2596)
**Goal**: Prevent CI from consuming Neon/remote Postgres by default.

## Inventory (workflows using DB)

### ✅ Already gated (label/manual only)
| Workflow | Trigger | Notes |
|----------|---------|-------|
| `pg-e2e.yml` | Label `pg-e2e` | Uses local Postgres service container, NOT Neon |
| `migration-clinic.yml` | PR (but uses local PG) | Local Postgres service container |

### ⚠️ Uses remote Neon/Postgres
| Workflow | Trigger | Secret | Notes |
|----------|---------|--------|-------|
| `prod-migration.yml` | Manual | `DATABASE_URL_PROD` | Production only - OK |
| `resolve-failed-migration.yml` | Manual | `DATABASE_URL_PROD` | Production only - OK |
| `staging-migration.yml` | Manual | `DATABASE_URL_STAGING` | Staging only - OK |
| `db-validate.yml` | Manual? | `DATABASE_URL_PROD` | Needs check |
| `seed-catalog.yml` | Manual | `DATABASE_URL_PROD` | Production only - OK |
| `prod-seed.yml` | Manual | `DATABASE_URL_PROD` | Production only - OK |

### ✅ Default PR checks (no remote DB)
| Workflow | DB | Notes |
|----------|-----|-------|
| `ci-build-and-test.yml` | SQLite (ci:gen) | ✅ Uses schema.ci.prisma |
| `quality-gates.yml` | None | ✅ Just lint/type checks |
| `codeql.yml` | None | ✅ Static analysis |

### ⚠️ Potential issue: `e2e-postgres.yml`
- Runs on **every PR** (`on: pull_request`)
- Uses `ci:gen`, `ci:migrate`, `ci:seed` (SQLite CI schema)
- **Name is misleading** - it says "PostgreSQL" but uses SQLite CI schema
- **Action needed**: Rename or clarify, but no Neon impact

## Current State Analysis

**Good news:** The default PR checks (`build-and-test`, `quality-gates`) do NOT touch Neon.

**The `e2e-postgres.yml` workflow**:
- Despite its name, uses `pnpm run ci:gen` which uses `schema.ci.prisma` (SQLite)
- Does NOT use real PostgreSQL
- Name is confusing but not burning Neon resources

**Remote DB workflows**:
- All are manual trigger or production-only
- None run on regular PR checks
- This is correct behavior

## DoD
- [x] Inventory workflows using DB/Neon ✅
- [x] Verify default PR checks don't touch Neon ✅
- [ ] Rename `e2e-postgres.yml` to clarify it uses SQLite (cosmetic)
- [ ] Add guardrail comment in workflows that DO use remote DB
- [ ] Create SOP: `SOP-CI-DB-COST-GUARDRAILS.md`
- [ ] Update docs/OPS/STATE.md

## Constraints
- No business logic changes.
- Allowed: .github/workflows/*, docs/*
- **NO PUSH** while GitHub Actions is in major_outage

## Notes
- Prepare locally during Actions outage.
- Push once when Actions returns to operational.
- The `pg-e2e.yml` is correctly gated behind label - uses local PG container, not Neon.

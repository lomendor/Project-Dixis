# Quality Gates (No-human-review mode)

## Required Checks (Pass 166b)

All PRs targeting `main` must pass these automated gates:

### 1. Policy Gate
- **Workflow**: `policy-gate`
- **Purpose**: Blocks PRs touching sensitive paths without explicit `risk-ok` label
- **Sensitive Paths**:
  - `frontend/prisma/` (schema changes)
  - `frontend/src/app/api/checkout/` (payment critical)
  - `frontend/src/app/api/admin/orders/` (admin operations)
  - `frontend/src/lib/mail/` (email templates)
  - `frontend/src/lib/auth/` (authentication logic)
  - `.github/workflows/` (CI/CD changes)

### 2. Type Check
- **Workflow**: `frontend-ci / type-check`
- **Purpose**: Ensures TypeScript strict mode compliance
- **Command**: `npm run type-check` (tsc --noEmit)

### 3. Build Gate
- **Workflow**: `CI / build-and-test`
- **Purpose**: Validates production build succeeds
- **Includes**: Backend tests + Frontend build + Unit tests

### 4. E2E Tests (PostgreSQL)
- **Workflow**: `e2e-postgres / e2e`
- **Purpose**: Production parity testing with real PostgreSQL
- **Coverage**: Full checkout flow, admin operations, auth

### 5. CodeQL Security Scan
- **Workflow**: `CodeQL / Analyze (javascript)`
- **Purpose**: Automated security vulnerability detection
- **Languages**: JavaScript/TypeScript
- **Queries**: security-and-quality

## Auto-Labeling

PRs are automatically labeled based on file changes:
- `frontend` — Frontend code changes
- `backend` — Backend code changes
- `ci` — CI/CD workflow changes
- `docs` — Documentation changes
- `tests` — Test file changes
- `risk-paths` — Touches sensitive paths (requires review)

## Branch Protection

- **Strict status checks**: Enabled (PRs must be up-to-date)
- **Enforce admins**: Yes (no bypass)
- **Required approvals**: 0 (automation-first)
- **Auto-merge**: Enabled for `ai-pass` labeled PRs

## CI Optimization (Pass 166b)

**Removed duplicate workflows**:
- `frontend-e2e.yml` (archived - redundant with ci.yml)
- `e2e-full.yml` (archived - redundant with ci.yml)
- `fe-api-integration.yml` (archived - redundant with ci.yml)

**Result**: ~25% CI time reduction, single source of truth for e2e

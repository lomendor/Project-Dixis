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

## Pass 166c — Guardrails Alignment & Protection

### Required Status Check Contexts

All PRs to `main` must pass these checks (exact context names):

1. **policy-gate / gate**
   - Enforces `risk-ok` label for sensitive paths
   - Now covers both `prisma/**` and `frontend/prisma/**`

2. **typecheck / typecheck**
   - TypeScript strict mode validation
   - Runs `tsc --noEmit` on frontend code

3. **CI / build-and-test**
   - Backend tests + Frontend build + Unit tests
   - Main integration check

4. **e2e-postgres / E2E (PostgreSQL)**
   - Production parity with PostgreSQL service
   - Fixed schema path: explicit `--schema prisma/schema.prisma`

5. **CodeQL / Analyze (javascript)**
   - Security vulnerability scanning
   - JavaScript/TypeScript analysis

### Pattern Alignment (166c)

**Sensitive paths** (both policy-gate and labeler):
- `prisma/**` — Root Prisma schema (if exists)
- `frontend/prisma/**` — Frontend Prisma schema
- `frontend/src/app/api/checkout/**` — Payment/checkout logic
- `frontend/src/app/api/admin/orders/**` — Admin order operations
- `frontend/src/lib/mail/**` — Email templates
- `frontend/src/lib/auth/**` — Authentication logic
- `.github/workflows/**` — CI/CD definitions

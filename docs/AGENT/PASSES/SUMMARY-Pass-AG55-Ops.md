# AG55-Ops — PASS SUMMARY

**Date**: 2025-10-21
**Pass**: AG55-Ops
**Feature**: UI-only Turbo (label fast path + smoke)

---

## 🎯 OBJECTIVE

Introduce **ui-only** fast path via PR label that skips heavy CI jobs (E2E PostgreSQL, CodeQL, quality-gates) and runs only lightweight checks (build, typecheck, smoke tests) for UI-only changes.

**Success Criteria**:
- ✅ `ui-only` label created
- ✅ Heavy jobs skip when label present
- ✅ Smoke job runs ONLY when label present
- ✅ Lightweight smoke spec added
- ✅ No product/runtime code changes

---

## 📊 IMPLEMENTATION

### Label Created
- **Name**: `ui-only`
- **Color**: `0E8A16` (green)
- **Description**: "UI-only fast path (light CI)"

### Workflow Changes

**Heavy Jobs (Skip on ui-only)**:
1. **`e2e-postgres.yml`** - E2E (PostgreSQL)
   - Added: `if: ${{ !contains(join(github.event.pull_request.labels.*.name, ','), 'ui-only') }}`

2. **`codeql.yml`** - Analyze (javascript)
   - Added: `if: ${{ !contains(join(github.event.pull_request.labels.*.name, ','), 'ui-only') }}`

3. **`pr.yml` quality-gates** job
   - Updated: `if: always() && !contains(join(github.event.pull_request.labels.*.name, ','), 'ui-only')`

**Lightweight Jobs (Run ONLY on ui-only)**:
1. **`pr.yml` test-smoke** job
   - Updated: `if: github.event_name == 'pull_request' && contains(github.event.pull_request.labels.*.name, 'ui-only')`

### Smoke Test Added
- **File**: `frontend/tests/e2e/smoke-ui.spec.ts`
- **Purpose**: Fast, deterministic smoke test for basic route rendering
- **Routes Tested**:
  - `/checkout/flow` - Customer flow
  - `/checkout/confirmation` - Confirmation page
  - `/admin/orders` - Admin orders (auth-gated)

---

## 🔄 INTEGRATION

**Complements**:
- Build/typecheck jobs (still run on both paths)
- AG54-Ops: Bot skip patterns (independent)

**Fast Path Behavior**:
- **With `ui-only` label**: Skip E2E/CodeQL/quality-gates, run smoke tests
- **Without `ui-only` label**: Run all jobs as normal

---

## 📂 FILES

### Modified
- `.github/workflows/e2e-postgres.yml` (+1 line if-guard)
- `.github/workflows/codeql.yml` (+1 line if-guard)
- `.github/workflows/pr.yml` (+2 modified if-guards)

### Created
- `frontend/tests/e2e/smoke-ui.spec.ts` (20 lines)
- `docs/AGENT/PASSES/SUMMARY-Pass-AG55-Ops.md`
- `docs/reports/2025-10-21/AG55-CODEMAP.md`
- `docs/reports/2025-10-21/AG55-TEST-REPORT.md`
- `docs/reports/2025-10-21/AG55-RISKS-NEXT.md`

---

## 🎯 USER IMPACT

**DevOps UX**:
- ⚡ Faster CI for UI-only PRs (~2-3 min vs ~5-8 min)
- 🏷️ Manual label control (maintainers decide fast path)
- 🧪 Lightweight smoke coverage (basic route validation)
- 📊 Reduced GitHub Actions minutes usage

**CI Performance**:
- ✅ Skip heavy E2E (PostgreSQL setup + full test suite)
- ✅ Skip CodeQL security scanning (for UI tweaks)
- ✅ Skip quality-gates (depends on heavy jobs)
- ✅ Run smoke tests only (fast validation)

---

## ✅ ACCEPTANCE

**PR**: #626 (pending)
**Branch**: `ops/AG55-ui-only-turbo`
**Status**: Ready for review
**Labels**: `ai-pass`, `ops`, `risk-ok`

**Checklist**:
- ✅ Label created (`ui-only`)
- ✅ Workflow guards added
- ✅ Smoke test created
- ✅ Documentation generated (4 files)
- ✅ No product code changes
- ✅ Manual control via label

---

**Generated-by**: Claude Code (AG55-Ops Protocol)
**Timestamp**: 2025-10-21


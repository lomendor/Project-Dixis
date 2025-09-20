# GitHub Actions Workflow Inventory Report

**Generated on:** 2025-09-20
**Repository:** Project-Dixis
**Analysis Scope:** All workflow files in `.github/workflows/` and `frontend/.github/workflows/`

---

## 📁 Workflow File Locations

### Main Repository Workflows (`.github/workflows/`)
1. `backend-ci.yml`
2. `ci.yml`
3. `danger.yml`
4. `dangerjs.yml`
5. `fe-api-integration.yml`
6. `frontend-ci.yml`
7. `frontend-e2e.yml`
8. `lighthouse.yml`
9. `nightly.yml`
10. `pr.yml`

### Frontend-Specific Workflows (`frontend/.github/workflows/`)
1. `nightly.yml`
2. `pr.yml`

**Total Workflows:** 12

---

## 🔍 Detailed Workflow Analysis

### 1. Backend CI (`backend-ci.yml`)
- **Name:** `backend-ci`
- **Triggers:**
  - Push: `backend/**`, `.github/workflows/backend-ci.yml`
  - Pull request: `backend/**`
  - Schedule: Daily at 3:00 UTC
  - Manual dispatch
- **Jobs:** `php-tests`
- **Concurrency:** `backend-ci-${{ github.ref }}` (cancel-in-progress: true)
- **Uses pnpm:** ❌

### 2. Full Pipeline (`ci.yml`)
- **Name:** `CI Pipeline`
- **Triggers:**
  - Push: `main`, `develop` branches
  - Pull request: `main`, `develop` branches
- **Jobs:** `backend`, `frontend`, `e2e`
- **Concurrency:** ❌
- **Uses pnpm:** ❌

### 3. Danger PR Gatekeeper (`danger.yml`)
- **Name:** `Danger PR Gatekeeper`
- **Triggers:** Pull request (opened, synchronize, reopened)
- **Jobs:** `danger`
- **Concurrency:** ❌
- **Uses pnpm:** ❌
- **Note:** Currently disabled due to permissions issue

### 4. DangerJS Gatekeeper (`dangerjs.yml`)
- **Name:** `DangerJS Gatekeeper`
- **Triggers:**
  - Pull request (opened, synchronize, reopened)
  - Manual dispatch
- **Jobs:** `danger`
- **Concurrency:** `dangerjs-${{ github.ref }}` (cancel-in-progress: true)
- **Uses pnpm:** ❌

### 5. Frontend-API Integration (`fe-api-integration.yml`)
- **Name:** `FE-API Integration`
- **Triggers:**
  - Push: `backend/frontend/**`, `backend/app/**`, `backend/routes/**`, workflow file
  - Pull request: Same paths
  - Manual dispatch
- **Jobs:** `integration`
- **Concurrency:** `fe-api-integration-${{ github.ref }}` (cancel-in-progress: true)
- **Uses pnpm:** ❌

### 6. Frontend CI (`frontend-ci.yml`)
- **Name:** `frontend-ci`
- **Triggers:**
  - Push: `frontend/**`, `.github/workflows/frontend-ci.yml`
  - Pull request: `frontend/**`
  - Manual dispatch
- **Jobs:** `type-check`, `frontend-tests`, `e2e-tests`
- **Concurrency:** `frontend-ci-${{ github.ref }}` (cancel-in-progress: true)
- **Uses pnpm:** ✅ (version 9)

### 7. Frontend E2E (`frontend-e2e.yml`)
- **Name:** `Frontend E2E Tests`
- **Triggers:**
  - Push: `backend/frontend/**`, `backend/app/**`, `backend/database/**`, `backend/routes/**`, workflow file
  - Pull request: Same paths
  - Schedule: Daily at 3:00 UTC
  - Manual dispatch
- **Jobs:** `e2e-tests`
- **Concurrency:** `frontend-e2e-${{ github.ref }}` (cancel-in-progress: true)
- **Uses pnpm:** ❌

### 8. Lighthouse CI (`lighthouse.yml`)
- **Name:** `Lighthouse CI`
- **Triggers:** Pull request to `main`, `develop` branches
- **Jobs:** `lighthouse`
- **Concurrency:** ❌
- **Uses pnpm:** ✅ (version 9)
- **Note:** Continue-on-error enabled

### 9. Nightly Quality Checks (`nightly.yml`)
- **Name:** `Nightly Quality Checks`
- **Triggers:**
  - Schedule: Daily at 2:00 UTC
  - Manual dispatch
- **Jobs:** `nightly-lighthouse`
- **Concurrency:** ❌
- **Uses pnpm:** ❌

### 10. Pull Request Quality Gates (`pr.yml`)
- **Name:** `Pull Request Quality Gates`
- **Triggers:** Pull request to `main` branch with specific paths
- **Jobs:** `qa`, `test-smoke`, `danger`
- **Concurrency:** `pr-${{ github.event.number }}` (cancel-in-progress: true)
- **Uses pnpm:** ❌
- **Note:** Lighthouse CI commented out

### 11. Frontend Nightly (`frontend/.github/workflows/nightly.yml`)
- **Name:** `Nightly E2E Tests & Reports`
- **Triggers:**
  - Schedule: Daily at 2:00 UTC
  - Manual dispatch
- **Jobs:** `nightly-e2e`
- **Concurrency:** ❌
- **Uses pnpm:** ✅ (version 9)

### 12. Frontend PR (`frontend/.github/workflows/pr.yml`)
- **Name:** `PR Quality Gates`
- **Triggers:** Pull request to `main` branch
- **Jobs:** `qa-checks`, `smoke-tests`, `danger-pr-check`
- **Concurrency:** ❌
- **Uses pnpm:** ✅ (version 9)

---

## ⚠️ OVERLAP ANALYSIS & CONSOLIDATION OPPORTUNITIES

### 🔴 Critical Duplications

#### 1. **Danger/DangerJS Workflows** - SEVERE OVERLAP
- **Files:** `danger.yml`, `dangerjs.yml`, `pr.yml` (danger job), `frontend/pr.yml` (danger-pr-check job)
- **Issue:** 4 different implementations of Danger.js with different configurations
- **Impact:** Redundant PR checks, confusion about which one is active
- **Recommendation:** Consolidate into single DangerJS workflow

#### 2. **Nightly Workflows** - MODERATE OVERLAP
- **Files:** `nightly.yml`, `frontend/nightly.yml`
- **Issue:** Both run at 2:00 UTC daily, different scopes but overlapping concerns
- **Impact:** Resource waste, potential conflicts
- **Recommendation:** Merge into unified nightly workflow

#### 3. **PR Quality Gates** - MODERATE OVERLAP
- **Files:** `pr.yml`, `frontend/pr.yml`
- **Issue:** Both handle PR quality checks for main branch
- **Impact:** Duplicate QA processes, inconsistent gates
- **Recommendation:** Consolidate PR quality workflow

#### 4. **Frontend E2E Testing** - MODERATE OVERLAP
- **Files:** `frontend-ci.yml` (e2e-tests job), `frontend-e2e.yml`, `fe-api-integration.yml`
- **Issue:** Multiple E2E test implementations with different triggers
- **Impact:** Resource waste, inconsistent test execution
- **Recommendation:** Unified E2E testing strategy

### 🟡 Trigger Conflicts

#### Schedule Conflicts
- **2:00 UTC Daily:** `nightly.yml`, `frontend/nightly.yml`
- **3:00 UTC Daily:** `backend-ci.yml`, `frontend-e2e.yml`

#### Pull Request Conflicts
Multiple workflows trigger on PR events with overlapping paths:
- `ci.yml` (main/develop branches)
- `frontend-ci.yml` (frontend paths)
- `pr.yml` (main branch + frontend paths)
- `frontend/pr.yml` (main branch)
- `lighthouse.yml` (main/develop branches)
- `dangerjs.yml` (all PRs)

### 🟡 Concurrency Group Conflicts

#### Missing Concurrency Control
- `ci.yml` - No concurrency control for expensive full pipeline
- `lighthouse.yml` - No concurrency control
- `nightly.yml` - No concurrency control
- Both `frontend/` workflows - No concurrency control

#### Inconsistent Concurrency Patterns
- Some use `${{ github.ref }}`, others use `${{ github.event.number }}`
- Mix of cancel-in-progress settings

### 🟡 Package Manager Inconsistencies

#### pnpm vs npm Usage
- **pnpm workflows:** `frontend-ci.yml`, `lighthouse.yml`, `frontend/nightly.yml`, `frontend/pr.yml`
- **npm workflows:** All others
- **Issue:** Inconsistent dependency management across workflows

---

## 📊 Job Type Analysis

### Build Jobs
- `ci.yml`: frontend build
- `frontend-ci.yml`: frontend-tests → build
- `lighthouse.yml`: build for bundle analysis
- `pr.yml`: build for bundle analysis
- `frontend/pr.yml`: build verification

### Type Check Jobs
- `ci.yml`: frontend → type-check
- `frontend-ci.yml`: type-check
- `frontend/pr.yml`: qa-checks → TypeScript type checking

### E2E Test Jobs
- `ci.yml`: e2e
- `frontend-ci.yml`: e2e-tests
- `frontend-e2e.yml`: e2e-tests
- `fe-api-integration.yml`: integration
- `frontend/nightly.yml`: nightly-e2e
- `frontend/pr.yml`: smoke-tests

### Lighthouse Jobs
- `lighthouse.yml`: lighthouse
- `nightly.yml`: nightly-lighthouse
- `pr.yml`: lhci (commented out)

### Quality Assurance Jobs
- `pr.yml`: qa
- `frontend/pr.yml`: qa-checks

---

## 🎯 CONSOLIDATION RECOMMENDATIONS

### Phase 1: Critical Duplications (High Priority)

#### 1. **Merge Danger Workflows**
```yaml
# Target: Single `.github/workflows/danger.yml`
# Consolidate: danger.yml + dangerjs.yml + PR danger jobs
# Action: Remove duplicates, keep most feature-complete version
```

#### 2. **Unify PR Quality Gates**
```yaml
# Target: Single `.github/workflows/pr-quality.yml`
# Consolidate: pr.yml + frontend/pr.yml
# Action: Merge QA checks, smoke tests, and danger into unified workflow
```

#### 3. **Consolidate Nightly Workflows**
```yaml
# Target: Single `.github/workflows/nightly.yml`
# Consolidate: nightly.yml + frontend/nightly.yml
# Action: Unified nightly testing with both backend and frontend scope
```

### Phase 2: E2E Testing Strategy (Medium Priority)

#### 4. **Unified E2E Workflow**
```yaml
# Target: Single E2E workflow with multiple triggers
# Consolidate: frontend-ci.yml e2e + frontend-e2e.yml + fe-api-integration.yml
# Action: Path-based job execution for different E2E scenarios
```

### Phase 3: Standardization (Low Priority)

#### 5. **Package Manager Standardization**
- Decide on pnpm vs npm across all workflows
- Update all workflows to use consistent package manager

#### 6. **Concurrency Control Standardization**
- Add missing concurrency groups
- Standardize concurrency patterns across workflows

---

## 📈 Expected Benefits

### Resource Optimization
- **Reduced CI Minutes:** ~40-50% reduction in duplicate job execution
- **Faster PR Feedback:** Unified workflows reduce queue time
- **Lower GitHub Actions Costs:** Fewer concurrent runners needed

### Maintenance Benefits
- **Single Source of Truth:** One workflow per concern area
- **Easier Updates:** Changes apply consistently across pipeline
- **Reduced Configuration Drift:** Eliminates version/config mismatches

### Developer Experience
- **Clearer PR Status:** Single status check instead of multiple overlapping ones
- **Faster Feedback:** Optimized workflow execution order
- **Consistent Behavior:** Same checks run regardless of path

---

## 🚨 Immediate Action Items

1. **URGENT:** Disable redundant Danger workflows - keeping only `dangerjs.yml`
2. **HIGH:** Remove duplicate PR workflows - consolidate into single PR quality gate
3. **MEDIUM:** Standardize package manager usage (recommend pnpm based on frontend adoption)
4. **MEDIUM:** Add missing concurrency controls to expensive workflows
5. **LOW:** Consolidate nightly workflows for efficiency

---

## 📋 Migration Checklist

- [ ] Audit current workflow performance and success rates
- [ ] Create consolidated workflow templates
- [ ] Test consolidated workflows in feature branch
- [ ] Update branch protection rules to reflect new workflow names
- [ ] Remove deprecated workflow files
- [ ] Update documentation and developer guides
- [ ] Monitor consolidated workflow performance for 1 week
- [ ] Fine-tune trigger paths and job conditions

---

**Summary:** 12 workflows identified with significant overlap in Danger/PR quality checking, nightly testing, and E2E execution. Consolidation could reduce workflow count to ~7-8 files while maintaining full functionality and improving maintainability.
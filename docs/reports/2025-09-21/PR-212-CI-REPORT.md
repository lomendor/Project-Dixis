# PR #212 — CI Fix (Node20, zod, Danger) Diagnostic Report

**Date**: 2025-09-21
**Time**: 01:45:00+03:00
**PR**: #212 (ci/fix-pr172-node20-zod-danger → main)
**Goal**: Stabilize CI with Node20, zod, Danger fixes

---

## Executive Summary

**Status**: ❌ **6 FAILING CHECKS** - Package manager mismatch (pnpm vs npm)
**Root Cause**: Workflows configured for pnpm but project uses npm
**Impact**: All type-check, frontend, lighthouse, and quality checks failing

---

## Failing Checks Analysis

### 🚨 Critical Infrastructure Failures

1. **type-check (2 instances)** - ❌ FAILURE
   - **Error**: `ERR_PNPM_NO_LOCKFILE Cannot install with "frozen-lockfile" because pnpm-lock.yaml is absent`
   - **Cause**: Using `pnpm install --frozen-lockfile` but project has `package-lock.json` (npm)

2. **lighthouse** - ❌ FAILURE
   - **Error**: `ERROR --workspace-root may only be used inside a workspace`
   - **Cause**: Using `pnpm -w install --frozen-lockfile` but no workspace configuration

3. **frontend** - ❌ FAILURE
   - **Error**: `Timed out waiting for: http://127.0.0.1:3001`
   - **Cause**: Frontend starts on port 3000 but wait-on expects port 3001

4. **Quality Assurance** - ❌ FAILURE
   - **Root Cause**: Downstream dependency on type-check success

5. **Smoke Tests** - ❌ FAILURE
   - **Root Cause**: Downstream dependency on frontend success

6. **PR Hygiene Check** - ❌ FAILURE
   - **Root Cause**: Downstream dependency on QA checks

### ✅ Working Components

- **backend** - ✅ SUCCESS (PHP/Laravel CI working correctly)
- **danger** - ✅ SUCCESS (both instances passing)

---

## Root Cause Analysis

### 1. Package Manager Mismatch
**Project Structure**:
```
backend/frontend/package.json          ← npm project
backend/frontend/package-lock.json     ← npm lockfile
NO pnpm-lock.yaml ANYWHERE            ← confirms npm usage
```

**Incorrect Workflow Commands**:
```yaml
# ❌ Wrong - causes pnpm lockfile error
- run: pnpm install --frozen-lockfile

# ✅ Correct - matches project structure
- run: npm ci
```

### 2. Port Configuration Issues
**Frontend CI Mismatch**:
```yaml
# Frontend starts on default port 3000
- run: npm start                        # → http://localhost:3000

# Wait-on expects different port
- run: npx wait-on http://127.0.0.1:3001  # ❌ Wrong port
```

### 3. Working Directory Context
**Inconsistent Paths**:
- Some workflows use `frontend/` directory
- Others use `backend/frontend/` directory
- Cache paths reference different locations

---

## Failed Workflow Files Analysis

### 📁 `.github/workflows/frontend-ci.yml`
**Issues**:
- Lines 31-37: `pnpm install --frozen-lockfile` → should be `npm ci`
- Lines 62-68: `pnpm install --frozen-lockfile` → should be `npm ci`
- Working directory: `frontend` → should be `backend/frontend`
- Cache path: `frontend/package-lock.json` → should be `backend/frontend/package-lock.json`

### 📁 `.github/workflows/lighthouse.yml`
**Issues**:
- Lines 19-26: `pnpm -w install --frozen-lockfile` → should be `npm ci`
- Workspace commands but no workspace configuration
- Port isolation (3010/4010) but incorrect dependency setup

### 📁 `.github/workflows/ci.yml`
**Issues**:
- Frontend section uses correct npm but wrong working directory
- Some cache paths inconsistent

### 📁 `frontend/.github/workflows/` (2 files)
**Issues**:
- Both use pnpm instead of npm
- Incorrect for current project structure

---

## Log Snippets (Evidence)

### A. Type-check Failure
```
type-check: pnpm install --frozen-lockfile
ERR_PNPM_NO_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is absent

Note that in CI environments this setting is true by default.
If you still need to run install in such cases, use "pnpm install --no-frozen-lockfile"
##[error]Process completed with exit code 1.
```

### B. Lighthouse Failure
```
lighthouse: pnpm -w install --frozen-lockfile
ERROR  --workspace-root may only be used inside a workspace
##[error]Process completed with exit code 1.
```

### C. Frontend Port Mismatch
```
frontend: npm run start
▲ Next.js 15.5.0
- Local:        http://localhost:3000    ← Started on 3000
- Network:      http://10.1.0.229:3000

frontend: npx wait-on http://127.0.0.1:3001 --timeout 60000
Error: Timed out waiting for: http://127.0.0.1:3001  ← Waiting for 3001
```

---

## Fix Strategy

### 🎯 Phase 1: Package Manager Corrections
1. **Replace all pnpm commands with npm equivalents**:
   - `pnpm install --frozen-lockfile` → `npm ci`
   - `pnpm run <script>` → `npm run <script>`
   - Remove pnpm setup actions

2. **Fix working directories**:
   - Ensure consistent `backend/frontend` paths
   - Update cache paths to match

3. **Fix port configurations**:
   - Align frontend start port with wait-on expectations
   - Use explicit port arguments where needed

### 🎯 Phase 2: Workflow Standardization
1. **Update Node.js setup**:
   - Standardize on Node 20
   - Fix cache dependency paths
   - Remove pnpm actions

2. **Working directory consistency**:
   - Use `backend/frontend` consistently
   - Update relative paths

### 🎯 Phase 3: Verification
1. **Test critical paths**:
   - Type-check workflow
   - Frontend build
   - Lighthouse CI

2. **Port validation**:
   - Confirm frontend port consistency
   - Verify wait-on targets

---

## Files Requiring Changes

1. ✏️ `.github/workflows/frontend-ci.yml` - pnpm → npm, working directories
2. ✏️ `.github/workflows/lighthouse.yml` - pnpm → npm, workspace removal
3. ✏️ `.github/workflows/ci.yml` - working directory consistency
4. ✏️ `frontend/.github/workflows/nightly.yml` - pnpm → npm
5. ✏️ `frontend/.github/workflows/pr.yml` - pnpm → npm

---

## Risk Assessment

**Level**: 🟡 **MEDIUM** - Workflow changes only
**Scope**: CI/CD pipeline configuration
**Impact**: No functional code changes, pure infrastructure fixes
**Rollback**: Simple git revert if issues arise

---

**Next Action**: Apply systematic package manager corrections across all workflow files

**Expected Outcome**: All 6 failing checks become GREEN with npm/working directory fixes
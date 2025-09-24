# CI Hotfix Revert Plan

**Date**: 2025-09-24
**Branch**: ci/revert-hotfix-nonblocking-on-main
**Purpose**: Ensure continue-on-error is ONLY active for ci/* branches, not main

---

## 🎯 Objective

Normalize CI workflows after PR #222 merge to ensure:
1. **E2E/Lighthouse failures BLOCK merges on main branch**
2. **E2E/Lighthouse failures DON'T BLOCK merges on ci/* hotfix branches**
3. **Quarantine remains branch-scoped to ci/* branches only**

---

## 📋 Current State Analysis

### Workflows with continue-on-error

1. **ci.yml** (line 161):
   ```yaml
   continue-on-error: ${{ startsWith(github.head_ref, 'ci/') }}
   ```
   ✅ **Correctly scoped** - Only non-blocking for ci/* PRs

2. **frontend-ci.yml** (line 130):
   ```yaml
   continue-on-error: ${{ startsWith(github.head_ref, 'ci/') }}
   ```
   ✅ **Correctly scoped** - Only non-blocking for ci/* PRs

3. **frontend-e2e.yml** (line 184):
   ```yaml
   if: contains(github.ref, 'ci/auth-e2e-hotfix')
   ```
   ⚠️ **Too specific** - Should be generalized to all ci/* branches

4. **lighthouse.yml** (line 37):
   ```yaml
   continue-on-error: ${{ startsWith(github.head_ref, 'ci/') }}
   ```
   ✅ **Correctly scoped** - Only non-blocking for ci/* PRs

5. **pr.yml** (lines 18, 108):
   ```yaml
   continue-on-error: ${{ startsWith(github.head_ref, 'ci/') }}
   ```
   ✅ **Correctly scoped** - QA/Hygiene non-blocking for ci/* PRs

6. **fe-api-integration.yml** (line 182):
   ```yaml
   if: contains(github.ref, 'ci/auth-e2e-hotfix')
   ```
   ⚠️ **Too specific** - Should be generalized to all ci/* branches

---

## 🔧 Required Changes

### 1. Generalize Quarantine Conditions

**frontend-e2e.yml** and **fe-api-integration.yml**:
- Change: `if: contains(github.ref, 'ci/auth-e2e-hotfix')`
- To: `if: startsWith(github.head_ref, 'ci/')`

This ensures quarantine applies to ALL ci/* hotfix branches, not just the specific one.

### 2. Verify Existing Guards

All continue-on-error settings are already properly guarded with:
```yaml
continue-on-error: ${{ startsWith(github.head_ref, 'ci/') }}
```

This means:
- **On main branch**: continue-on-error = false (tests BLOCK merge)
- **On ci/* branches**: continue-on-error = true (tests DON'T BLOCK merge)

---

## ✅ No Changes Needed For

1. **ci.yml**: Already correctly scoped ✅
2. **frontend-ci.yml**: Already correctly scoped ✅
3. **lighthouse.yml**: Already correctly scoped ✅
4. **pr.yml**: Already correctly scoped ✅

---

## 📝 Implementation Plan

1. **Update quarantine conditions** in:
   - frontend-e2e.yml (line 184)
   - fe-api-integration.yml (line 182)

2. **Remove obsolete branch references**:
   - Replace `ci/auth-e2e-hotfix` with generic `ci/*` pattern

3. **Test the changes**:
   - Verify workflows parse correctly
   - Confirm behavior on main vs ci/* branches

---

## 🎯 Expected Outcome

After these changes:

| Branch Type | E2E Failures | Lighthouse Failures | QA Failures | Merge Blocked? |
|-------------|--------------|---------------------|-------------|----------------|
| main | Block ❌ | Block ❌ | Block ❌ | YES |
| ci/* | Don't Block ✅ | Don't Block ✅ | Don't Block ✅ | NO |
| feature/* | Block ❌ | Block ❌ | Block ❌ | YES |
| fix/* | Block ❌ | Block ❌ | Block ❌ | YES |

---

## 📊 Risk Assessment

**Risk Level**: **LOW** ✅

- Changes are minimal and surgical
- Existing guards are already correct
- Only generalizing overly-specific conditions
- No impact on main branch protection

---

## 🚀 Next Steps

1. Apply the changes to quarantine conditions
2. Create PR with clear description
3. Verify CI runs correctly
4. Merge after review

---

**Note**: The majority of the work was already done correctly in PR #222. This is just a minor cleanup to generalize the quarantine conditions.
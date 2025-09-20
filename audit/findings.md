# Repository Findings & Micro-PR Strategy
**Generated**: 2025-09-05  
**Repository**: Project-Dixis  
**Analysis Scope**: CI/CD Health, Test Stability, Code Quality

---

## 🎯 **CATEGORY A: E2E Test Flakes**

### **Issues Identified**
- **PR #78**: Dependabot E2E failures (likely selector changes)
- **Historical Pattern**: Intermittent authentication flow failures
- **Root Cause**: StorageState persistence + selector brittleness

### **Affected Files & Impact**
```
tests/e2e/auth-flow.spec.ts
tests/setup/global-setup.ts  
tests/setup/test-helpers.ts
```

### **Proposed Micro-PR: E2E-STAB-LOGIN**
- **Estimated LOC**: ~180 LOC
- **Files to Touch**: 4-6 test files
- **AC**: Stabilize login flow, improve selector strategy
- **Evidence Required**: Green E2E run on dependabot PR

---

## 🎯 **CATEGORY B: Backend/PHP Test Failures**

### **Issues Identified**  
- **PR #66, #65, #64**: Systematic backend test failures
- **Pattern**: Database schema conflicts in PP03 feature series
- **Root Cause**: Migration ordering + model relationship issues

### **Affected Files & Impact**
```
backend/database/migrations/2025_*.php (multiple)
backend/app/Models/Producer.php
backend/tests/Feature/AdminLiteProductTest.php
backend/app/Http/Controllers/Api/*.php
```

### **Proposed Micro-PR: BACKEND-SCHEMA-FIX**
- **Estimated LOC**: ~200 LOC  
- **Files to Touch**: 8-12 backend files
- **AC**: All backend tests green, schema consistency
- **Evidence Required**: PHPUnit success on PP03 PRs

---

## 🎯 **CATEGORY C: TypeScript Compilation Issues**

### **Issues Identified**
- **PR #66**: Type-check failures in accessibility components
- **Pattern**: Missing type definitions for analytics/a11y imports
- **Root Cause**: Incomplete type coverage for new features

### **Affected Files & Impact**
```
frontend/src/components/analytics/*.tsx  
frontend/src/lib/a11y/*.ts
frontend/src/types/analytics.d.ts (missing)
frontend/tsconfig.json (path updates)
```

### **Proposed Micro-PR: TYPE-DEFINITIONS**
- **Estimated LOC**: ~120 LOC
- **Files to Touch**: 6-8 frontend files  
- **AC**: Clean TypeScript compilation, complete type coverage
- **Evidence Required**: type-check job success

---

## 🎯 **CATEGORY D: Danger Rule Violations**

### **Issues Identified**
- **PR #66, #65, #64**: Danger checks failing on size/description rules
- **Pattern**: Large feature PRs exceeding LOC thresholds
- **Root Cause**: Insufficient PR breakdown discipline

### **Affected Files & Impact**
```
.github/danger.js (rule configuration)
PR descriptions (templates)
Documentation for PR discipline
```

### **Proposed Micro-PR: PR-DISCIPLINE**  
- **Estimated LOC**: ~80 LOC
- **Files to Touch**: 2-3 config files
- **AC**: Danger rules pass, clear PR guidelines
- **Evidence Required**: Danger success on target PRs

---

## 🎯 **CATEGORY E: Lighthouse Performance Issues**

### **Issues Identified**
- **Multiple PRs**: Performance warnings, accessibility scores
- **Pattern**: Bundle size growth, missing optimizations
- **Root Cause**: Feature additions without performance consideration

### **Affected Files & Impact**
```
frontend/lighthouse.config.js (thresholds)
frontend/next.config.js (bundle optimization)
frontend/src/components/**/performance.tsx
```

### **Proposed Micro-PR: LH-THRESHOLDS**
- **Estimated LOC**: ~80 LOC  
- **Files to Touch**: 3-4 config + component files
- **AC**: Lighthouse scores within thresholds
- **Evidence Required**: Lighthouse comment success

---

## 🎯 **CATEGORY F: Documentation Gaps**

### **Issues Identified**
- **Multiple Repos**: Legacy CLAUDE files causing confusion
- **Pattern**: Agents referencing wrong workspace contexts
- **Root Cause**: Missing non-destructive legacy pointers

### **Affected Files & Impact**
```
../GitHub-Dixis-Project-1/CLAUDE.md (legacy)
../GitHub-Dixis-Project-1/frontend-aug10/CLAUDE.md (legacy)
docs/README.md updates
```

### **Proposed Micro-PR Series: DOCS-POINTERS**
- **Estimated LOC**: ~5 LOC per legacy file (3-4 files)
- **Files to Touch**: Legacy CLAUDE files only
- **AC**: Non-destructive banners pointing to Project-Dixis
- **Evidence Required**: Clear workspace reference

---

## 📊 **MICRO-PR EXECUTION MATRIX**

| Priority | Micro-PR | Est. LOC | Files | Blocking PRs | Dependencies |
|----------|----------|----------|-------|-------------|--------------|
| **P0** | **Canonical Merges** | 0 | 0 | None | PR #97, #96, #95 ready |
| **P1** | **E2E-STAB-LOGIN** | 180 | 6 | PR #78 | Selector audit |
| **P1** | **BACKEND-SCHEMA-FIX** | 200 | 12 | PR #66, #65, #64 | Migration review |
| **P2** | **TYPE-DEFINITIONS** | 120 | 8 | PR #66 | Analytics types |
| **P3** | **PR-DISCIPLINE** | 80 | 3 | Multiple | Danger config |
| **P3** | **LH-THRESHOLDS** | 80 | 4 | Multiple | Performance audit |
| **P4** | **DOCS-POINTERS** | 15 | 4 | None | Legacy access |

**Total Estimated**: ~675 LOC across 6 micro-PRs

---

## 🚀 **SUBAGENT ACTIVATION STRATEGY**

### **Phase 1: Foundation** (Immediate)
1. **Merge canonical PRs** (#97, #96, #95)
2. **Activate test-writer-fixer** → E2E-STAB-LOGIN
3. **Activate backend-architect** → BACKEND-SCHEMA-FIX  

### **Phase 2: Quality** (Next Sprint)
4. **Activate frontend-developer** → TYPE-DEFINITIONS
5. **Activate workflow-optimizer** → PR-DISCIPLINE  
6. **Activate performance-benchmarker** → LH-THRESHOLDS

### **Phase 3: Documentation** (Continuous)
7. **Activate studio-producer** → DOCS-POINTERS

**Stop Conditions**:
- Any micro-PR exceeds 300 LOC → break down further
- CI conflicts between concurrent PRs → sequential execution  
- Subagent reports technical blockers → escalate to Coordinator

**Success Metrics**:
- All PP03 series PRs achieve ALL GREEN status
- E2E test stability improves to >95%  
- New PRs consistently pass Danger rules
- Legacy workspace confusion eliminated
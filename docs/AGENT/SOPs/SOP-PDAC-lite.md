# SOP — PDAC-lite (Plan → Delegate → Assess → Codify)

## Overview
Lightweight workflow για structured planning + parallel research + quality gates πριν την κωδικοποίηση.

---

## Phase 1: Plan (Plan Mode, No Writes)

### Objectives
- Συγκέντρωση context από `docs/AGENT/SYSTEM/*` και τελευταίο `SUMMARY/Pass-*`
- Διάσπαση σύνθετου στόχου σε actionable steps
- Αναγνώριση dependencies, risks, test strategy

### Deliverables
- `docs/AGENT/TASKS/Pass-<ID>.md` με sections:
  - Στόχος
  - Αποφάσεις (τεχνικές επιλογές)
  - Βήματα που υλοποιήθηκαν (placeholder)
  - Tests (σχέδιο)
  - Ρίσκα/Εκκρεμότητες

### Tools
- Read, Grep, Glob (read-only)
- NO Write, Edit, Bash with side effects

### Exit Criteria
- Plan document complete
- User approves with ExitPlanMode

---

## Phase 2: Delegate (Sub-Agents, Parallel)

### Objectives
- Παράλληλη έρευνα σε 3 εξειδικευμένα domains
- Append findings ως "Appendices" στο `TASKS/Pass-<ID>.md`

### Sub-Agents

#### 1. plan-agent (Architecture)
**Model**: Opus
**Tools**: Read, Grep, Search_files
**Responsibilities**:
- High-level decomposition
- Identify architectural patterns (reuse existing components)
- Flag anti-patterns or refactoring needs

**Deliverable**: Append "## Plan Appendix" to TASKS

#### 2. scan-agent (Inventory)
**Model**: Sonnet
**Tools**: Read, Grep, Glob
**Responsibilities**:
- List Next.js routes (`app/` structure)
- List API endpoints (`app/api/**`)
- List Prisma models (`prisma/schema.prisma`)
- List existing E2E tests (`tests/**/*.spec.ts`)

**Deliverable**: Append "## Inventory Appendix" to TASKS (≤300 lines)

#### 3. test-agent (Test Strategy)
**Model**: Sonnet
**Tools**: Read, Grep, Search_files
**Responsibilities**:
- Propose minimal E2E test set (2-3 scenarios max)
- Define fixtures/seeding needs
- Identify test data requirements

**Deliverable**: Append "## Test Plan Appendix" to TASKS

### Fallback
Αν sub-agents δεν υπάρχουν: Parent agent εκτελεί όλα τα βήματα σε Plan Mode

---

## Phase 3: Assess (Synthesis + Quality Gates)

### Objectives
- Σύνθεση findings από όλες τις πηγές
- Validation πριν από code changes

### Tasks
1. **TL;DR Synthesis** (≤200 tokens):
   - Summarize goal, approach, risks
   - Write to `SUMMARY/Pass-<ID>.md`

2. **PR Body Preparation**:
   - Summary section
   - Acceptance Criteria (from TASKS)
   - Test Plan (from test-agent appendix)
   - Reports links (CODEMAP, TEST-REPORT, RISKS-NEXT)

3. **Quality Gates** (STOP if missing):
   - [ ] Acceptance Criteria defined
   - [ ] Test plan exists (≥1 E2E scenario)
   - [ ] Risks documented
   - [ ] No schema changes OR migration plan ready

### Exit Criteria
- All quality gates pass
- User approves to proceed to Codify

---

## Phase 4: Codify (Implementation + Tests)

### Objectives
- Μικρά, atomic commits με συνεπή tests
- Συνεχής επαλήθωση (build + E2E locally)

### Best Practices
1. **Small commits**:
   - 1 commit ανά logical unit (helper, API route, UI component)
   - Test με κάθε commit όπου είναι δυνατόν

2. **Test-first όπου εφικτό**:
   - Γράψε E2E test (failing)
   - Implement feature
   - Verify E2E green

3. **PR hygiene**:
   - Title: `feat/fix(...): Description (Pass <ID>)`
   - Labels: `ai-pass`, `risk-ok` (if applicable)
   - Body: Pre-filled από Assess phase
   - Auto-merge: `--auto --squash` on green

4. **Compact at end**:
   - Update `TASKS/Pass-<ID>.md` με actual steps
   - Finalize `SUMMARY/Pass-<ID>.md` (keep ≤2000 tokens)
   - Update `docs/OPS/STATE.md`

### Exit Criteria
- PR merged
- Documentation complete
- No regressions (all CI green)

---

## Integration με Existing SOPs

### Συμβατότητα
- **SOP-Feature-Pass**: PDAC-lite είναι pre-step για το Branch→PR→Docs
  - Plan/Delegate/Assess → Branch (Phase 4 Codify)
  - Codify → PR + Tests + Docs (existing SOP)

- **SOP-Context-Hygiene**: Plan phase διαβάζει `SYSTEM/*` και `SUMMARY/*`

### When to Use PDAC-lite
- ✅ Σύνθετα features (>3 files affected)
- ✅ Architectural decisions needed
- ✅ Unclear test strategy
- ❌ Trivial fixes (<10 LOC)
- ❌ Documentation-only changes

---

## Example Workflow

```bash
# User Request: "Add shipping method selection to checkout"

## 1. Plan (Plan Mode)
- Read SYSTEM/routes.md (find checkout routes)
- Read SYSTEM/db-schema.md (check Order fields)
- Create TASKS/Pass-202S.md (goal + template)
- ExitPlanMode → User approves

## 2. Delegate (Sub-Agents)
- plan-agent: Suggests reuse lib/cart/totals.ts, add shippingMethod enum
- scan-agent: Lists /api/checkout, Order model, totals.spec.ts
- test-agent: Proposes 2 E2E tests (COD, Pickup)
→ All append to TASKS/Pass-202S.md

## 3. Assess
- Write SUMMARY/Pass-202S.md (TL;DR)
- Prepare PR body (AC: 3 shipping options, tests: 2 scenarios)
- Quality gates: ✅ AC defined, ✅ Tests planned, ✅ No schema change
→ User approves

## 4. Codify
- Branch: feat/shipping-method-202S
- Commit 1: Add shippingMethod to TotalsInput interface
- Commit 2: Update checkout API to accept shippingMethod
- Commit 3: Add 2 E2E tests (both green)
- PR: auto-merge on green
- Docs: Update TASKS (actual steps), finalize SUMMARY
```

---

## Metrics & Success Criteria

### Process Metrics
- **Plan phase duration**: ≤10 min (parent) or ≤20 min (with sub-agents)
- **Delegate completion**: All 3 agents report back OR timeout (30 min max)
- **Assess quality gates**: 100% pass rate (STOP if any fail)
- **Codify cycle time**: Branch → Merged ≤60 min for simple features

### Quality Metrics
- **PR hygiene**: 100% (all PRs have Reports/AC/Tests)
- **Test coverage**: ≥1 E2E per feature
- **Rework rate**: <10% (PRs needing hotfixes after merge)
- **Context portability**: New chat can resume from TASKS/SUMMARY

---

## Troubleshooting

### Issue: Sub-agents timeout
**Solution**: Continue with parent agent research, document in TASKS that sub-agents weren't used

### Issue: Quality gate fails (missing AC)
**Solution**: Return to Plan phase, refine TASKS document, re-Assess

### Issue: Codify phase introduces regression
**Solution**: Revert commit, add regression test, re-implement

### Issue: TASKS too long (>5000 tokens)
**Solution**: Move appendices to separate files (`TASKS/Pass-<ID>-inventory.md`), link from main TASKS

---

## Change Log
- 2025-10-13: Initial PDAC-lite SOP (no app code changes)

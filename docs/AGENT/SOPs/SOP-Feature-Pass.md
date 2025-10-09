# SOP — Feature Pass (Branch→PR→Docs→Tests)

## Workflow Steps
1. **Branch**: Create from main using `feat/<slug>` (or `ops/`, `chore/`)
2. **Commits**: Small, consistent commits with clear messages
3. **Tests**: Ensure build + smoke/e2e tests pass
4. **PR**: Create with clear title, add `ai-pass` label, enable auto-merge on green
5. **Docs**: Update TASKS & SUMMARY and add **append-only** entry to end of `frontend/docs/OPS/STATE.md`

## STATE.md Policy — APPEND-ONLY ✅
- `frontend/docs/OPS/STATE.md` is **append-only**: Add new section at the **END** (don't edit old sections)
- `.gitattributes` defines `merge=union` to auto-merge parallel PRs without conflicts
- Never modify existing Pass sections — only append new ones
- This prevents merge conflicts when multiple PRs update STATE.md simultaneously

## PR Requirements
- Title: Clear, descriptive (e.g., "feat(cart): Add cookie-based cart persistence")
- Labels: `ai-pass` (skips advisory checks), plus domain labels (frontend/backend/tests/docs)
- Body: Include Summary, Acceptance Criteria, Test Plan, Reports sections
- Size: ≤300 LOC per PR (split larger changes)

## Testing Standards
- All feature PRs require E2E test coverage
- Smoke tests must pass before merge
- Build + typecheck must be green
- Required checks: gate, typecheck, build-and-test, e2e-postgres, CodeQL

## Documentation Updates
- Update `frontend/docs/OPS/STATE.md` with Pass summary (append-only)
- Create `docs/AGENT/SUMMARY/Pass-<NAME>.md` for complex features
- Update architecture docs if introducing new patterns

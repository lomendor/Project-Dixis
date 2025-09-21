# PR #216 — CI Drilldown (2025-09-21)

## Current Failing Checks

**Quality Assurance** — FAILURE
- Root cause: ESLint violations in generated/temp files
- Generated Playwright report files triggering linting errors
- Core source code violations: .eslintrc.cjs require(), pages/_document.tsx @ts-ignore

**PR Hygiene Check** — FAILURE
- Root cause: Commit subject length > 72 characters
- Historic commits in PR history violating conventional commit length rules

**Frontend** — FAILURE
- Related to build/compilation issues

**E2E Tests** — FAILURE
- Related to test execution failures

**Integration** — FAILURE
- Related to integration test issues

## Resolution Strategy

1. **ESLint Fix**: Add .eslintignore to exclude generated files, maintain strict --max-warnings=0
2. **PR Hygiene**: Use squash-merge with clean conventional title to bypass historic commit issues
3. **Targeted CI**: Focus on QA/Hygiene gates that are blocking auto-merge

## Implementation

Following surgical approach to address root causes rather than increasing tolerances.
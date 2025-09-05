# 🛠️ PROJECT-DIXIS MAINTENANCE PLAN
**Effective Date**: 2025-09-03  
**Version**: 1.0  
**Status**: DRAFT

---

## 🎯 MAINTENANCE OBJECTIVES

1. **PR Health**: Maintain <15 open PRs at any time
2. **CI Green Rate**: Achieve >80% passing CI on all PRs  
3. **Size Compliance**: 100% of new PRs ≤300 LOC
4. **Response Time**: Review/triage within 24 hours
5. **Merge Velocity**: Green PRs merged within 48 hours

---

## 📋 PR RULES & GUIDELINES

### 1. Size Limits (MANDATORY)
```
✅ ALLOWED: ≤300 LOC total changes
⚠️ WARNING: 301-500 LOC (requires justification)
❌ BLOCKED: >500 LOC (must split)
```

**Enforcement**: Issue #86 - DangerJS rule implementation pending

### 2. Required Artifacts
Every PR must include:
- [ ] **E2E Test Results**: `playwright-report/**`
- [ ] **Trace/Video**: For any UI changes
- [ ] **Type Check**: Clean `npm run type-check`
- [ ] **Lint Pass**: Clean `npm run lint`

### 3. Selector & i18n Standards
- **Selectors**: Always use `data-testid` attributes
- **Greek Support**: Use `greekNormalize()` for searches
- **Accessibility**: ARIA labels on all interactive elements

### 4. Documentation Requirements
- [ ] Update relevant `.md` files for feature changes
- [ ] Add JSDoc comments for new functions
- [ ] Update API documentation for backend changes

---

## 🏷️ PR LABEL SYSTEM

### Status Labels
- 🟢 `green`: All CI checks passing, ready for merge
- 🔴 `red`: CI failures, needs fixes
- ⏰ `stale`: No activity >7 days
- 🗂️ `legacy`: Old/deprecated, candidate for closure

### Type Labels  
- 🤖 `dependencies`: Dependabot updates
- ✨ `feature`: New functionality
- 🐛 `bug`: Bug fixes
- 📝 `docs`: Documentation only
- ♻️ `refactor`: Code refactoring
- 🧪 `test`: Test additions/changes

### Priority Labels
- 🚨 `critical`: Security/breaking issues
- ⚡ `high`: Blocking other work
- 🔵 `medium`: Standard priority
- ⬜ `low`: Nice to have

---

## 🔄 MERGE SEQUENCE PROTOCOL

### Standard Merge (No Admin Override)
1. **CI Status**: All checks must be GREEN
2. **Review**: At least 1 approval required
3. **Conflicts**: Must be resolved
4. **Size**: Must comply with ≤300 LOC
5. **Command**: `gh pr merge [PR] --merge --delete-branch`

### Auto-Merge Rules
When all conditions met:
```bash
# For dependabot with all green checks
gh pr merge [PR] --auto --merge

# For features after approval  
gh pr merge [PR] --merge --delete-branch
```

### Admin Override (EMERGENCY ONLY)
Use only when:
- Critical security fix needed
- Production hotfix required
- Approved by team lead

```bash
gh pr merge [PR] --admin --merge --delete-branch
```

---

## 📅 WEEKLY MAINTENANCE SCHEDULE

### Monday - Dependabot Day
- [ ] Review all dependabot PRs
- [ ] Fix E2E issues on dependency updates
- [ ] Merge or close stale dependabot PRs

### Wednesday - Feature Review
- [ ] Review all feature PRs
- [ ] Request changes or approve
- [ ] Check for oversized PRs needing split

### Friday - Cleanup Day  
- [ ] Label stale PRs (>7 days)
- [ ] Close legacy/abandoned PRs
- [ ] Run PR audit report
- [ ] Update this maintenance plan

---

## 🚨 ESCALATION PROCEDURES

### PR Stuck in RED (>3 days)
1. Add comment with specific fix steps
2. Offer to pair program/assist
3. Consider splitting into smaller PRs
4. If no response in 7 days → label `stale`

### Massive PR (>1000 LOC)
1. Immediate comment requesting split
2. Provide split strategy (3-5 smaller PRs)
3. Block merge until compliant
4. Help author with git cherry-pick if needed

### Conflict Resolution
1. Author resolves conflicts first
2. If stuck >2 days, offer assistance
3. Use `git rebase main` preferred over merge

---

## 📊 METRICS & REPORTING

### Weekly Metrics (Every Friday)
```markdown
## Week of [DATE]
- PRs Opened: X
- PRs Merged: Y  
- PRs Closed: Z
- Average PR Age: N days
- CI Green Rate: X%
- Size Compliance: Y%
```

### Monthly Health Check
- Run full PR audit
- Review maintenance plan effectiveness
- Update procedures based on pain points
- Archive branches from closed PRs >30 days

---

## 🛡️ GUARDRAILS (DO NOT VIOLATE)

1. **NO CI YAML changes** without team consensus
2. **NO port changes** (8001 backend, 3001 frontend)
3. **NO Next.js version changes** without migration plan
4. **NO admin merges** except critical security
5. **NO force push** to main or active PR branches
6. **NO PR >300 LOC** without splitting

---

## 🔧 TOOLING & AUTOMATION

### Current Tools
- **GitHub CLI**: `gh` for PR management
- **DangerJS**: PR size enforcement (pending)
- **Playwright**: E2E test artifacts
- **Dependabot**: Automated dependency updates

### Planned Improvements
- [ ] Auto-label PRs based on files changed
- [ ] Auto-close stale PRs after 14 days
- [ ] Slack notifications for critical PRs
- [ ] Dashboard for PR metrics

---

## 📝 MAINTENANCE COMMANDS

```bash
# Daily PR check
gh pr list --limit 20 --json number,title,state,createdAt

# Check CI status
gh pr checks [PR_NUMBER]

# Bulk label stale PRs
gh pr list --json number,createdAt | jq -r '.[] | select(.createdAt < "7 days ago") | .number'

# Generate audit report  
gh pr list --json number,title,state,checks > pr-audit.json
```

---

## 🔄 REVISION HISTORY

| Date | Version | Changes |
|------|---------|---------|
| 2025-09-03 | 1.0 | Initial maintenance plan created |

---

*Maintained by: Project-Dixis Development Team*  
*Review Cycle: Weekly (Fridays)*  
*Next Review: 2025-09-10*
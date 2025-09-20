# 🤖 Sub-Agents Workflow

**Purpose**: Standardized AI assistant roles for consistent, high-quality development operations.

## 🎭 Agent Roles

### 1. 🔍 **Auditor** → Static Analysis & Route Mapping
- **Command**: `npm run sub:auditor` | `./scripts/subagents.sh audit`
- **Focus**: Code quality, architecture compliance, security patterns
- **Output**: `docs/reports/<date>/AUDIT.md`
- **Scope**:
  - Route analysis and API surface mapping
  - Type safety validation
  - Configuration drift detection
  - Security vulnerability scanning
  - Performance bottleneck identification

### 2. 🛡️ **Test Guardian** → Test Coverage & Isolation
- **Command**: `npm run sub:test-guardian` | `./scripts/subagents.sh tests`
- **Focus**: Test completeness, isolation, reliability
- **Output**: `docs/reports/<date>/TEST-DELTA.md`
- **Scope**:
  - Http::fake() + preventStrayRequests validation
  - Test coverage gap analysis
  - Flaky test identification
  - Mock integrity verification
  - E2E stability assessment

### 3. 📝 **Docs Scribe** → Documentation & PR Summaries
- **Command**: `npm run sub:scribe` | `./scripts/subagents.sh docs`
- **Focus**: Documentation completeness, PR context
- **Output**: `docs/reports/<date>/PR-SUMMARY.md`
- **Scope**:
  - PR description enhancement
  - Runbook cross-references
  - API documentation updates
  - Change impact assessment
  - Stakeholder communication

### 4. 🚀 **Release Captain** → Deployment Readiness
- **Command**: `npm run sub:release` | `./scripts/subagents.sh release`
- **Focus**: Release safety, rollback planning, feature flags
- **Output**: `docs/reports/<date>/RELEASE-NOTES-DRAFT.md`
- **Scope**:
  - Feature flag audit
  - Migration safety verification
  - Rollback strategy validation
  - Breaking change detection
  - Deployment checklist generation

## 🔄 Usage Workflow

### Development Phase
```bash
# 1. Static analysis before changes
npm run sub:auditor

# 2. Test coverage after implementation
npm run sub:test-guardian

# 3. Documentation update
npm run sub:scribe
```

### Pre-Release Phase
```bash
# 4. Release readiness check
npm run sub:release

# 5. Comprehensive report
make report  # Runs auditor + scribe
```

## 📁 Output Structure

```
docs/reports/YYYY-MM-DD/
├── AUDIT.md                 # Code quality & architecture
├── TEST-DELTA.md           # Test coverage & reliability
├── PR-SUMMARY.md           # Documentation & context
└── RELEASE-NOTES-DRAFT.md  # Deployment readiness
```

## 🎯 Integration Points

### Quality Gates
- **Danger**: Enforces report links in PR descriptions
- **CI**: Validates test isolation and coverage
- **Review**: Uses reports for context and risk assessment

### Claude Code Agents
- **Parent Mode**: Maintains context, code implementation
- **Subagent Mode**: Specialized analysis, documentation
- **Handoff**: Structured reports enable seamless context transfer

## ⚡ Quick Commands

| Task | Command | Output |
|------|---------|--------|
| Full audit | `make report` | AUDIT.md + PR-SUMMARY.md |
| Test check | `npm run sub:test-guardian` | TEST-DELTA.md |
| Release prep | `npm run sub:release` | RELEASE-NOTES-DRAFT.md |
| All reports | `npm run sub:all` | All four reports |

## 🛡️ Safety Features

- **Isolation**: Each agent has clear, non-overlapping scope
- **Validation**: Reports include confidence scores and limitations
- **Traceability**: All outputs link back to specific code changes
- **Rollback**: Release Captain ensures safe deployment strategies

---

**Generated with**: 🤖 [Claude Code](https://claude.ai/code)
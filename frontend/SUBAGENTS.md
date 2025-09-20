# 🤖 SUBAGENTS - Light Analysis Workflow

**Purpose**: Minimal subagent routines for code analysis before significant PRs (≤300 LOC)

## 🎯 Core Principle

**Research-Only Subagents**: Subagents perform analysis and generate reports in `docs/research/` but **NEVER** modify code directly. The parent agent maintains all code implementation control.

## 📋 Available Subagents

### 1. CodeMap Subagent

**Purpose**: Analyze git diff changes to identify structural risks and complexity impact

**Usage**:
```bash
npm run subagent:codemap
```

**Outputs**:
- `docs/reports/YYYY-MM-DD/CODEMAP.md` - Git diff-based change analysis
- `docs/reports/YYYY-MM-DD/RISKS-NEXT.md` - Risk assessment for changes
- Console summary with change impact and risk areas

**Analysis Scope**:
- Git diff scan for current branch vs main
- Changed files complexity assessment
- Impact on existing integrations
- LOC analysis for PR size validation
- Risk categorization of modifications

**Risk Detection**:
- Files approaching >300 LOC (PR limit enforcement)
- High-complexity function modifications
- API endpoint changes impact
- Critical path modifications
- Missing test coverage for changes

## 🚀 Workflow Integration

### Pre-PR Analysis
```bash
# Analyze changes before creating PR
npm run subagent:codemap

# Review generated analysis
cat docs/reports/$(date +%Y-%m-%d)/CODEMAP.md
cat docs/reports/$(date +%Y-%m-%d)/RISKS-NEXT.md

# Address high-risk issues before PR submission
```

### Quality Gates Integration
- **Manual Trigger**: Run before PR creation
- **PR References**: Include CODEMAP and RISKS-NEXT links in PR body
- **Danger Validation**: Ensures PR references required reports

## 📊 CodeMap Output Format

### CODEMAP.md
```markdown
# 🗺️ Git Diff CodeMap Analysis - [date]

## Changed Files Overview
- Modified Files: X
- Added Files: X
- Deleted Files: X
- Total LOC Delta: +X/-X

## File Change Analysis
[List of changed files with LOC impact]
- src/components/Feature.tsx (+45 LOC)
- src/lib/api.ts (+12 LOC)
- src/types/index.ts (+8 LOC)

## Complexity Impact
- New Functions: [complexity analysis]
- Modified Functions: [complexity changes]
- Risk Assessment: [High/Medium/Low for each file]

## Integration Points Affected
- API endpoints modified: [list]
- Type definitions changed: [list]
- Component interfaces updated: [list]
```

### RISKS-NEXT.md
```markdown
# ⚠️ Risk Assessment - Next Steps

## High Priority Risks
- 🔴 [Specific risk with mitigation plan]

## Medium Priority Risks
- 🟡 [Specific risk with monitoring plan]

## Validation Required
- [ ] Test coverage for new functionality
- [ ] API integration validation
- [ ] Performance impact assessment

## Pre-Merge Checklist
- [ ] All high-risk items addressed
- [ ] PR stays within 300 LOC limit
- [ ] Quality gates pass
```

## 🛡️ Guardrails

### Subagent Constraints
- **No Code Edits**: Subagents generate analysis only
- **Limited Scope**: Focus on `frontend/src/` directory
- **Performance**: Complete analysis in <30 seconds
- **Output Size**: Analysis reports ≤50KB

### Parent Agent Control
- **Code Implementation**: Only parent agent modifies files
- **Commit Authority**: Only parent agent creates commits
- **PR Creation**: Only parent agent manages Git operations

## 🔧 Configuration

### Analysis Thresholds
```javascript
// subagent.config.js
module.exports = {
  codemap: {
    maxFileSize: 300,        // LOC warning threshold
    maxComplexity: 10,       // Cyclomatic complexity limit
    maxNesting: 4,           // Nesting depth limit
    maxParams: 5,            // Function parameter limit
    excludePaths: [
      'node_modules',
      '.next',
      'test-results'
    ]
  }
}
```

## 📈 Usage Patterns

### Recommended Workflow
1. **Planning Phase**: Run CodeMap before feature design
2. **Implementation**: Parent agent implements based on analysis
3. **Pre-Commit**: Quick CodeMap to verify complexity bounds
4. **PR Documentation**: Include CodeMap analysis in PR body

### Integration with Quality Gates
- **TypeScript**: CodeMap validates type coverage
- **ESLint**: CodeMap identifies rule violation patterns
- **Performance**: CodeMap flags bundle size risks
- **Testing**: CodeMap highlights untested code paths

## 🎖️ Best Practices

### Analysis Timing
- **Feature Start**: Map current state and risks
- **Mid-Development**: Re-analyze after significant changes
- **Pre-PR**: Final validation of complexity bounds

### Documentation Integration
- Reference CODEMAP analysis in PR descriptions
- Link to specific analysis sections for complex changes
- Use CodeMap risk assessment for code review prioritization

### Continuous Improvement
- Track CodeMap metrics over time
- Use analysis patterns to improve architecture decisions
- Evolve thresholds based on team performance data

---

**🎯 Goal**: Enable rapid, informed development decisions while maintaining code quality within ≤300 LOC PR constraints.
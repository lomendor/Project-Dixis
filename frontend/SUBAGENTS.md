# 🤖 SUBAGENTS - Light Analysis Workflow

**Purpose**: Minimal subagent routines for code analysis before significant PRs (≤300 LOC)

## 🎯 Core Principle

**Research-Only Subagents**: Subagents perform analysis and generate reports in `docs/research/` but **NEVER** modify code directly. The parent agent maintains all code implementation control.

## 📋 Available Subagents

### 1. CodeMap Subagent

**Purpose**: Map codebase structure, complexity, and integration risks

**Usage**:
```bash
npm run subagent:codemap
```

**Outputs**:
- `docs/research/CODEMAP-[timestamp].md` - Comprehensive code structure analysis
- Console summary with key metrics and risk areas

**Analysis Scope**:
- File structure and dependencies
- Component complexity (cyclomatic)
- API integration points
- Test coverage gaps
- Potential refactoring opportunities

**Risk Detection**:
- Files >300 LOC (breaking PR limits)
- Circular dependencies
- Missing TypeScript types
- Untested critical paths
- High-complexity functions

## 🚀 Workflow Integration

### Pre-PR Analysis
```bash
# Before starting feature work
npm run subagent:codemap

# Review generated analysis
cat docs/research/CODEMAP-*.md

# Plan feature implementation based on risks
```

### Quality Gates Integration
- **Automatic**: Runs in nightly CI workflow
- **Manual**: Available via `npm run subagent:codemap`
- **PR Triggered**: Danger.js checks for CODEMAP references in PR body

## 📊 CodeMap Output Format

```markdown
# 🗺️ CodeMap Analysis - [timestamp]

## Codebase Structure
- Total Files: X
- Total LOC: X
- Average File Size: X LOC
- Largest Files: [list with LOC counts]

## Complexity Analysis
- High Complexity Functions: [list with cyclomatic complexity]
- Deeply Nested Components: [list with nesting depth]
- Long Parameter Lists: [functions with >5 params]

## Integration Points
- API Endpoints: [list of discovered endpoints]
- External Dependencies: [non-dev dependencies]
- Internal Module Coupling: [high-coupling modules]

## Risk Assessment
- 🔴 High Risk: [files >250 LOC, missing tests]
- 🟡 Medium Risk: [files >150 LOC, moderate complexity]
- 🟢 Low Risk: [well-tested, simple modules]

## Recommendations
- Priority refactoring targets
- Test coverage improvements
- Architecture simplification opportunities
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
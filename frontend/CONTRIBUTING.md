# 🤝 Contributing to Project-Dixis Frontend

Welcome to the Project-Dixis frontend contribution guide! This document outlines our quality standards and PR workflow.

## 🎯 Quality Gates Overview

We maintain high code quality through automated quality gates that must pass before merging. All PRs are subject to comprehensive validation including TypeScript strictness, ESLint rules, static analysis, performance budgets, and E2E testing.

## 📋 Pre-PR Checklist

### 🔧 Code Quality Requirements

#### ✅ TypeScript & Linting
- [ ] **TypeScript strict mode**: All files compile without errors (`npm run qa:types`)
- [ ] **ESLint zero warnings**: Code passes all linting rules (`npm run qa:lint`)
- [ ] **No unused code**: Knip analysis shows no dead files/exports (`npm run qa:knip`)
- [ ] **Dependency hygiene**: No unused/missing dependencies (`npm run qa:deps`)

#### 🎯 Performance & Size
- [ ] **Bundle size limits**: Changes respect performance budgets (`npm run qa:size`)
- [ ] **Lighthouse CI**: Performance scores meet thresholds (`npm run lhci`)
- [ ] **Build success**: Production build completes without errors (`npm run build`)

#### 🧪 Testing Requirements
- [ ] **Smoke tests**: Core user journeys pass (`npm run e2e:smoke`)
- [ ] **E2E tests**: Full test suite passes (`npm run e2e`)
- [ ] **New features**: Include appropriate test coverage

### 📊 Pre-PR Analysis

#### 🗺️ CodeMap Analysis (Recommended)
- [ ] **Run CodeMap**: Execute `npm run subagent:codemap` before starting work
- [ ] **Risk assessment**: Review generated analysis for complexity warnings
- [ ] **Large files**: Ensure no files exceed 300 LOC (PR limit)
- [ ] **Include analysis**: Reference CodeMap report in PR description

### 🚀 PR Structure Requirements

#### 📝 PR Title & Description
- [ ] **Conventional commits**: Title follows format `type(scope): description`
  - Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`
  - Example: `feat(checkout): add payment validation with Zod schemas`
- [ ] **Required sections**: PR body includes all required sections:
  - [ ] **Summary**: Clear description of changes
  - [ ] **Acceptance Criteria**: Specific requirements met
  - [ ] **Test Plan**: How changes were tested
  - [ ] **Reports**: Links to analysis reports

#### 📊 Documentation & Reports
- [ ] **Report links**: Include links to 3 reports in PR body:
  - [ ] CODEMAP analysis (if applicable)
  - [ ] TEST-REPORT (E2E results)
  - [ ] RISKS-NEXT (assessment of implementation risks)
- [ ] **Test summary**: Include test execution results or summary

### ⚖️ Size & Scope Limits
- [ ] **300 LOC limit**: Total changes ≤300 lines of code
- [ ] **Focused scope**: PR addresses single feature/fix, not multiple unrelated changes
- [ ] **Breaking changes**: Clearly documented if introducing breaking changes

## 🔄 PR Workflow

### 1. Preparation Phase
```bash
# Run full quality analysis
npm run qa:all

# Generate CodeMap analysis
npm run subagent:codemap

# Review analysis output
cat docs/research/CODEMAP-*.md
```

### 2. Development Phase
```bash
# Ensure tests pass throughout development
npm run e2e:smoke

# Check TypeScript compliance
npm run qa:types

# Validate bundle size impact
npm run qa:size
```

### 3. Pre-Submit Phase
```bash
# Final quality gate check
npm run qa:all

# Smoke test verification
npm run e2e:smoke

# Build verification
npm run build
```

### 4. PR Submission
- Create PR with conventional commit title
- Include all required sections in PR body
- Reference CodeMap analysis if complexity changes made
- Link to relevant test reports
- Ensure CI passes all quality gates

## 🛡️ Automated Quality Gates

### GitHub Actions Validation
Every PR automatically runs:
- **QA Suite**: TypeScript, ESLint, Knip, Depcheck, Size-limit
- **Smoke Tests**: Critical user journey validation
- **E2E Tests**: Comprehensive test suite
- **Danger Checks**: PR hygiene and structure validation
- **Lighthouse CI**: Performance and accessibility audits

### Quality Thresholds
- **Performance Budget**: Homepage ≤180KB, Products ≤160KB, Cart ≤140KB
- **Lighthouse Scores**: Performance ≥80%, Accessibility ≥90%, SEO ≥90%
- **Code Coverage**: Maintain existing coverage levels
- **Bundle Analysis**: No significant size increases without justification

## 🎯 Quality Standards

### TypeScript Configuration
- **Strict mode enabled**: `"strict": true`
- **Unchecked indexed access**: `"noUncheckedIndexedAccess": true`
- **Implicit override**: `"noImplicitOverride": true`
- **Fallthrough cases**: `"noFallthroughCasesInSwitch": true`

### ESLint Standards
- **Zero warnings policy**: No ESLint warnings allowed
- **Type-checked rules**: All TypeScript type-aware rules enabled
- **Switch exhaustiveness**: Exhaustive switch statements required
- **No unsafe operations**: Strict TypeScript safety rules

### Security & Validation
- **API validation**: All endpoints use Zod schemas for input/output validation
- **Rate limiting**: Sensitive endpoints include appropriate rate limiting
- **No secrets**: Never commit secrets, keys, or sensitive data

## 🚨 Common Issues & Solutions

### Build Failures
```bash
# TypeScript errors
npm run qa:types
# Fix type errors before proceeding

# ESLint warnings
npm run qa:lint
# Address all linting issues

# Bundle size exceeded
npm run qa:size
# Review size impact and optimize if needed
```

### Test Failures
```bash
# Smoke test failures
npm run e2e:smoke
# Critical issues - must be resolved before merge

# E2E test failures
npm run e2e
# Full test suite - investigate and fix failing tests
```

### Performance Issues
```bash
# Lighthouse CI failures
npm run lhci
# Review performance impact and optimize

# Bundle analysis
npm run qa:size
# Check for unexpected size increases
```

## 📚 Resources

### Documentation
- **SUBAGENTS.md**: Light subagent workflow and CodeMap analysis
- **API Documentation**: `../backend/docs/API.md`
- **E2E Test Guide**: `tests/e2e/README.md`

### Scripts Reference
- `npm run qa:all` - Complete quality analysis
- `npm run subagent:codemap` - Generate codebase analysis
- `npm run e2e:smoke` - Run critical smoke tests
- `npm run qa:types` - TypeScript type checking
- `npm run qa:lint` - ESLint validation
- `npm run qa:size` - Bundle size analysis

## 🎖️ Best Practices

### Code Organization
- Keep files under 300 LOC for maintainability
- Use TypeScript strict mode features
- Follow existing code patterns and conventions
- Extract reusable logic into utilities

### Testing Strategy
- Write tests for new features
- Maintain E2E test coverage for user journeys
- Use CodeMap analysis to identify untested code paths
- Prioritize smoke tests for critical functionality

### Performance Considerations
- Monitor bundle size impact of changes
- Use Lighthouse CI feedback to maintain performance
- Consider code splitting for large features
- Optimize images and assets

---

**🎯 Goal**: Maintain high code quality while enabling rapid, confident development within ≤300 LOC PR constraints.

**🚀 Remember**: Quality gates are designed to catch issues early, not to block progress. Use them as development aids to deliver robust, maintainable code.
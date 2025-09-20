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
  - [ ] **Summary**: Clear description of changes and scope
  - [ ] **Acceptance Criteria**: Specific requirements met with checkboxes
  - [ ] **Test Plan**: How changes were tested with commands used
  - [ ] **Reports**: Links to 3 required reports (see below)

#### 📊 Documentation & Reports (REQUIRED)
- [ ] **3 Required report links** in PR body:
  - [ ] **CODEMAP**: Link to `docs/reports/YYYY-MM-DD/CODEMAP.md`
  - [ ] **TEST-REPORT**: E2E test execution results summary
  - [ ] **RISKS-NEXT**: Link to `docs/reports/YYYY-MM-DD/RISKS-NEXT.md`
- [ ] **Test summary**: Include test execution results with pass/fail counts

#### 🎯 Testing & Quality Requirements
- [ ] **data-testid selectors**: All new interactive elements have `data-testid` attributes
- [ ] **E2E test coverage**: User-facing changes include appropriate E2E test updates
- [ ] **Test execution**: Run and document results of:
  ```bash
  npm run qa:all        # Quality gates
  npm run e2e:smoke     # Smoke tests
  npm run lhci          # Lighthouse CI
  ```

### ⚖️ Size & Scope Limits
- [ ] **300 LOC limit**: Total changes ≤300 lines of code (target: 200-300 LOC)
- [ ] **Focused scope**: PR addresses single feature/fix, not multiple unrelated changes
- [ ] **No drift**: No changes to CI/CD workflows, ports (3001/8001), or Next.js version (15.5.0)
- [ ] **Breaking changes**: Clearly documented if introducing breaking changes

## 🔄 PR Workflow

### 1. Preparation Phase
```bash
# Generate git diff-based analysis
npm run subagent:codemap

# Review analysis output
cat docs/reports/$(date +%Y-%m-%d)/CODEMAP.md
cat docs/reports/$(date +%Y-%m-%d)/RISKS-NEXT.md

# Run full quality analysis
npm run qa:all
```

### 2. Development Phase
```bash
# Ensure quality gates pass throughout development
npm run qa:all

# Run smoke tests for critical paths
npm run e2e:smoke

# Check performance impact
npm run lhci
```

### 3. Pre-Submit Phase
```bash
# Final quality gate validation
npm run qa:all

# Complete E2E test suite
npm run e2e

# Lighthouse CI validation
npm run lhci

# Build verification
npm run build
```

### 4. PR Submission Requirements
- Create PR with conventional commit title
- Include all 4 required sections: Summary, Acceptance Criteria, Test Plan, Reports
- Link to 3 required reports: CODEMAP, TEST-REPORT, RISKS-NEXT
- Document test execution results with pass/fail counts
- Ensure all data-testid selectors are present
- Verify no CI/ports/version drift
- Confirm ≤300 LOC limit compliance

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
- `npm run qa:all` - Complete quality analysis (types, lint, knip, deps, size)
- `npm run subagent:codemap` - Generate git diff-based CODEMAP and RISKS analysis
- `npm run e2e:smoke` - Run critical smoke tests
- `npm run e2e` - Run full E2E test suite
- `npm run lhci` - Run Lighthouse CI performance audit
- `npm run qa:types` - TypeScript type checking only
- `npm run qa:lint` - ESLint validation only
- `npm run qa:size` - Bundle size analysis only

### E2E Testing Commands
```bash
# Development testing
npm run e2e:smoke           # Quick smoke tests
npm run e2e:ui              # Interactive test runner
npm run e2e:debug           # Debug mode

# CI/Production testing
npm run e2e                 # Full test suite
npm run test:e2e:analytics  # Analytics tests
npm run test:e2e:performance-a11y  # Performance & accessibility
```

## 🎯 data-testid Requirements

All interactive elements **MUST** include `data-testid` attributes for E2E testing:

### Required Selectors
```tsx
// Buttons and actions
<button data-testid="add-to-cart-btn">Add to Cart</button>
<button data-testid="checkout-btn">Checkout</button>
<button data-testid="submit-order-btn">Submit Order</button>

// Form elements
<input data-testid="search-input" placeholder="Search products..." />
<select data-testid="category-filter">...</select>
<textarea data-testid="message-input">...</textarea>

// Navigation and links
<nav data-testid="main-navigation">...</nav>
<a data-testid="product-link" href="/product/123">...</a>

// Content containers
<div data-testid="product-card">...</div>
<div data-testid="cart-item">...</div>
<div data-testid="order-summary">...</div>

// Status indicators
<div data-testid="loading-spinner">...</div>
<div data-testid="error-message">...</div>
<div data-testid="success-toast">...</div>
```

### Naming Convention
- Use kebab-case: `data-testid="product-card"`
- Be specific: `data-testid="checkout-submit-btn"` not `data-testid="button"`
- Include context: `data-testid="cart-item-remove-btn"`
- Use consistent suffixes: `-btn`, `-input`, `-card`, `-container`

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
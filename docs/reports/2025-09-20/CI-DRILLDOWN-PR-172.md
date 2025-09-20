# PR #172 — CI Drilldown
Failing job: https://github.com/lomendor/Project-Dixis/actions/runs/17871212238/job/50825011005

## Key Failures Identified

### 1. Node Version Mismatch (CRITICAL)
- **Current**: Node v18.20.8 in CI
- **Required**: Node >=20 for multiple packages
- **Impact**: Breaking engine incompatibilities

### 2. TypeScript Module Resolution Error
```
../packages/contracts/src/shipping.ts(1,19): error TS2307:
Cannot find module 'zod' or its corresponding type declarations.
```

### 3. Engine Warnings (Multiple packages)
- `vite@7.1.4`: requires `^20.19.0 || >=22.12.0`
- `commander@14.0.0`: requires `>=20`
- `lint-staged@16.1.5`: requires `>=20.17`
- `nano-spawn@1.0.2`: requires `>=20.17`

## Quick suggestions
- **Node upgrade**: Update CI to Node 20+ to resolve engine incompatibilities
- **Missing dependency**: Add `zod` to packages/contracts dependencies or ensure proper workspace linking
- **TypeScript resolution**: Check tsconfig paths and package.json workspace configuration
- **Dependency audit**: Run `npm audit fix` to address 22 vulnerabilities (8 low, 6 moderate, 8 high)

## Root Cause Analysis
PR #172 appears to introduce dependencies requiring Node 20+ while CI still runs on Node 18. The missing 'zod' module suggests either:
1. New dependency not properly installed in monorepo workspace
2. TypeScript path mapping issues for shared packages
3. Package linking problems between frontend and packages/contracts

## Recommended Fix Priority
1. **Immediate**: Update CI Node version to 20+
2. **Critical**: Resolve zod dependency in packages/contracts
3. **Follow-up**: Address dependency vulnerabilities
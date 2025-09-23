# CI Failure Patterns — last 7 days (2025-09-23)

Analyzed runs: 200
Failures: 116

## Top failing jobs
- .github/workflows/backend-ci.yml: 30 fails
- .github/workflows/frontend-e2e.yml: 29 fails
- .github/workflows/fe-api-integration.yml: 15 fails
- frontend-ci: 14 fails
- CI Pipeline: 12 fails
- Pull Request Quality Gates: 9 fails
- FE-API Integration: 6 fails
- Nightly Quality Checks: 1 fails

## Top recurring error signatures

### Signature (x18)

```
Quality Assurance	Run full QA suite	<ts> ##[error]  <n>:<n>  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
```
Jobs: Pull Request Quality Gates

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531335

### Signature (x10)

```
integration	Setup PHP	<ts>
```
Jobs: FE-API Integration

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17927982773, https://github.com/lomendor/Project-Dixis/actions/runs/17925308384

### Signature (x9)

```
Failed to fetch log for <sha>: failed to get run log: log not found
```
Jobs: .github/workflows/frontend-e2e.yml, .github/workflows/fe-api-integration.yml, .github/workflows/backend-ci.yml

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942747203, https://github.com/lomendor/Project-Dixis/actions/runs/17942530774, https://github.com/lomendor/Project-Dixis/actions/runs/17942343308, https://github.com/lomendor/Project-Dixis/actions/runs/17942747076, https://github.com/lomendor/Project-Dixis/actions/runs/17942530902

### Signature (x8)

```
backend	Setup PHP	<ts>
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x8)

```
e2e-tests	Setup PHP	<ts>
```
Jobs: frontend-ci

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17941147499, https://github.com/lomendor/Project-Dixis/actions/runs/17937782355

### Signature (x7)

```
nightly-lighthouse	UNKNOWN STEP	<ts> ##[endgroup]
```
Jobs: Nightly Quality Checks

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17934424640

### Signature (x4)

```
Quality Assurance	Run full QA suite	<ts> ##[error]  <n>:<n>  error    Unexpected any. Specify a different type            @typescript-eslint/no-explicit-any
```
Jobs: Pull Request Quality Gates

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531335

### Signature (x4)

```
Quality Assurance	Run full QA suite	<ts> ##[error]  <n>:<n>  error    `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`  react/no-unescaped-entities
```
Jobs: Pull Request Quality Gates

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531335

### Signature (x4)

```
Quality Assurance	Run full QA suite	<ts> ##[error]  <n>:<n>  error    Unexpected any. Specify a different type          @typescript-eslint/no-explicit-any
```
Jobs: Pull Request Quality Gates

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531335

### Signature (x3)

```
Quality Assurance	Run full QA suite	<ts> ##[error]  <n>:<n>  error    An interface declaring no members is equivalent to its supertype  @typescript-eslint/no-empty-object-type
```
Jobs: Pull Request Quality Gates

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531335

### Signature (x3)

```
type-check	UNKNOWN STEP	<ts> (node:<n>) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
```
Jobs: frontend-ci

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17941147499, https://github.com/lomendor/Project-Dixis/actions/runs/17940095204, https://github.com/lomendor/Project-Dixis/actions/runs/17937782355

### Signature (x3)

```
frontend-tests	UNKNOWN STEP	<ts> (node:<n>) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
```
Jobs: frontend-ci

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17941147499, https://github.com/lomendor/Project-Dixis/actions/runs/17940095204, https://github.com/lomendor/Project-Dixis/actions/runs/17937782355

### Signature (x3)

```
frontend-tests	UNKNOWN STEP	<ts> └ ○ /test-error                           <n>.88 kB         <n> kB
```
Jobs: frontend-ci

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17941147499, https://github.com/lomendor/Project-Dixis/actions/runs/17940095204, https://github.com/lomendor/Project-Dixis/actions/runs/17937782355

### Signature (x3)

```
integration	UNKNOWN STEP	<ts>     [31mTest timeout of <n>ms exceeded.[39m
```
Jobs: FE-API Integration

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17924348729

### Signature (x2)

```
backend	Set up job	<ts> Download action repository 'shivammathur/setup-php@v2' (SHA:<sha>)
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	﻿<ts> ##[group]Run shivammathur/setup-php@v2
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	<ts> with:
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	<ts>   php-version:<n>.2
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	<ts>   extensions: pdo, pdo_pgsql, mbstring, xml, ctype, json, tokenizer
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	<ts>   ini-file: production
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	<ts>   github-token: ***
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	<ts> ##[endgroup]
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	<ts> [command]/usr/bin/bash /home/runner/work/_actions/shivammathur/setup-php/v2/src/scripts/run.sh
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	<ts> [90;1m==> [0m[37;1mSetup PHP[0m
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	<ts> [32;1m✓ [0m[34;1mPHP [0m[90;1mInstalled PHP <n>.2.29[0m
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	<ts> [90;1m==> [0m[37;1mSetup Extensions[0m
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	<ts> [32;1m✓ [0m[34;1mpdo [0m[90;1mEnabled[0m
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	<ts> [32;1m✓ [0m[34;1mpdo_pgsql [0m[90;1mEnabled[0m
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	<ts> [32;1m✓ [0m[34;1mmbstring [0m[90;1mEnabled[0m
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

### Signature (x2)

```
backend	Setup PHP	<ts> [32;1m✓ [0m[34;1mxml [0m[90;1mEnabled[0m
```
Jobs: CI Pipeline

Sample runs: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358, https://github.com/lomendor/Project-Dixis/actions/runs/17942344615

## PRs/branches most affected (best effort)
- PR #222: 89 failing runs
- PR #220: 13 failing runs
- PR #223: 4 failing runs
- PR #226: 4 failing runs
- PR #221: 3 failing runs
- PR #224: 1 failing runs
- PR #225: 1 failing runs

## Top failing branches
- ci/auth-e2e-hotfix: 89 failing runs
- ci/pr216-hotfix-contracts-e2e: 13 failing runs
- dependabot/npm_and_yarn/backend/frontend/types/node-24.5.2: 4 failing runs
- dependabot/github_actions/actions/setup-node-5: 4 failing runs
- ci/fix-e2e-shipping-timeouts: 3 failing runs
- main: 1 failing runs
- dependabot/composer/backend/laravel/framework-12.30.1: 1 failing runs
- dependabot/composer/backend/laravel/pint-1.25.1: 1 failing runs

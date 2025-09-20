# PR #215 — Type-check drilldown (2025-09-20T23:20:19+03:00)

Type-check job URL:


## Executive Summary
- **Total TS errors:** 148
- **Primary issue:** Merge conflict markers in src/app/page.tsx
- **Root cause:** Unresolved git merge conflicts causing TS1185 errors

## Top TS error codes frequency
  57 TS1185
  24 TS1128
  22 TS1382
  17 TS1109
  16 TS1005
   7 TS2657
   3 TS1434
   1 TS1161
   1 TS1127

## Key findings
- **TS1185 (57 errors):** Merge conflict marker encountered
- **TS1128 (24 errors):** Declaration or statement expected
- **TS1382 (22 errors):** Unexpected token
- **TS1109 (17 errors):** Expression expected
- **TS1005 (16 errors):** '</' expected

All errors are concentrated in src/app/page.tsx indicating unresolved merge conflicts.

## First ~20 TS errors (raw)
```
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1877730Z ##[error]src/app/page.tsx(139,1): error TS1185: Merge conflict marker encountered.
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1888600Z ##[error]src/app/page.tsx(173,1): error TS1185: Merge conflict marker encountered.
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1890505Z ##[error]src/app/page.tsx(175,1): error TS1185: Merge conflict marker encountered.
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1891952Z ##[error]src/app/page.tsx(184,31): error TS1005: '</' expected.
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1893007Z ##[error]src/app/page.tsx(185,1): error TS1185: Merge conflict marker encountered.
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1894176Z ##[error]src/app/page.tsx(189,1): error TS1185: Merge conflict marker encountered.
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1895592Z ##[error]src/app/page.tsx(200,1): error TS1185: Merge conflict marker encountered.
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1896611Z ##[error]src/app/page.tsx(205,75): error TS1005: '</' expected.
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1897663Z ##[error]src/app/page.tsx(206,1): error TS1185: Merge conflict marker encountered.
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1899086Z ##[error]src/app/page.tsx(235,1): error TS1382: Unexpected token. Did you mean `{'>'}` or `&gt;`?
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1900996Z ##[error]src/app/page.tsx(235,2): error TS1382: Unexpected token. Did you mean `{'>'}` or `&gt;`?
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1902294Z ##[error]src/app/page.tsx(235,3): error TS1382: Unexpected token. Did you mean `{'>'}` or `&gt;`?
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1903916Z ##[error]src/app/page.tsx(235,4): error TS1382: Unexpected token. Did you mean `{'>'}` or `&gt;`?
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1905373Z ##[error]src/app/page.tsx(235,5): error TS1382: Unexpected token. Did you mean `{'>'}` or `&gt;`?
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1907303Z ##[error]src/app/page.tsx(235,6): error TS1382: Unexpected token. Did you mean `{'>'}` or `&gt;`?
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1909287Z ##[error]src/app/page.tsx(235,7): error TS1382: Unexpected token. Did you mean `{'>'}` or `&gt;`?
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1911238Z ##[error]src/app/page.tsx(244,25): error TS1005: '</' expected.
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1912997Z ##[error]src/app/page.tsx(245,1): error TS1185: Merge conflict marker encountered.
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1914799Z ##[error]src/app/page.tsx(247,1): error TS1185: Merge conflict marker encountered.
type-check	Run TypeScript type check (strict)	2025-09-20T19:37:06.1916598Z ##[error]src/app/page.tsx(249,1): error TS1185: Merge conflict marker encountered.
```

## Log excerpts

### Logs head (first 50 lines)
```
type-check	Set up job	﻿2025-09-20T19:36:44.5321378Z Current runner version: '2.328.0'
type-check	Set up job	2025-09-20T19:36:44.5352880Z ##[group]Runner Image Provisioner
type-check	Set up job	2025-09-20T19:36:44.5354170Z Hosted Compute Agent
type-check	Set up job	2025-09-20T19:36:44.5355011Z Version: 20250829.383
type-check	Set up job	2025-09-20T19:36:44.5355924Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
type-check	Set up job	2025-09-20T19:36:44.5357163Z Build Date: 2025-08-29T13:48:48Z
type-check	Set up job	2025-09-20T19:36:44.5358038Z ##[endgroup]
type-check	Set up job	2025-09-20T19:36:44.5359025Z ##[group]Operating System
type-check	Set up job	2025-09-20T19:36:44.5359942Z Ubuntu
type-check	Set up job	2025-09-20T19:36:44.5360889Z 24.04.3
type-check	Set up job	2025-09-20T19:36:44.5361543Z LTS
type-check	Set up job	2025-09-20T19:36:44.5362453Z ##[endgroup]
type-check	Set up job	2025-09-20T19:36:44.5363266Z ##[group]Runner Image
type-check	Set up job	2025-09-20T19:36:44.5364105Z Image: ubuntu-24.04
type-check	Set up job	2025-09-20T19:36:44.5365000Z Version: 20250907.24.1
type-check	Set up job	2025-09-20T19:36:44.5366648Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
type-check	Set up job	2025-09-20T19:36:44.5369068Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
type-check	Set up job	2025-09-20T19:36:44.5371233Z ##[endgroup]
type-check	Set up job	2025-09-20T19:36:44.5373056Z ##[group]GITHUB_TOKEN Permissions
type-check	Set up job	2025-09-20T19:36:44.5375457Z Contents: read
type-check	Set up job	2025-09-20T19:36:44.5376358Z Metadata: read
type-check	Set up job	2025-09-20T19:36:44.5377192Z Packages: read
type-check	Set up job	2025-09-20T19:36:44.5377903Z ##[endgroup]
type-check	Set up job	2025-09-20T19:36:44.5381036Z Secret source: Actions
type-check	Set up job	2025-09-20T19:36:44.5382086Z Prepare workflow directory
type-check	Set up job	2025-09-20T19:36:44.5926073Z Prepare all required actions
type-check	Set up job	2025-09-20T19:36:44.5980326Z Getting action download info
type-check	Set up job	2025-09-20T19:36:44.8611168Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
type-check	Set up job	2025-09-20T19:36:45.0585205Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
type-check	Set up job	2025-09-20T19:36:45.2762426Z Complete job name: type-check
type-check	Run actions/checkout@v4	﻿2025-09-20T19:36:45.3420036Z ##[group]Run actions/checkout@v4
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3421065Z with:
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3421490Z   repository: lomendor/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3422142Z   token: ***
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3422529Z   ssh-strict: true
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3422915Z   ssh-user: git
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3423309Z   persist-credentials: true
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3423735Z   clean: true
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3424125Z   sparse-checkout-cone-mode: true
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3424583Z   fetch-depth: 1
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3424963Z   fetch-tags: false
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3425350Z   show-progress: true
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3425745Z   lfs: false
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3426101Z   submodules: false
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3426491Z   set-safe-directory: true
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.3427140Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.4521466Z Syncing repository: lomendor/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.4523252Z ##[group]Getting Git version info
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.4524023Z Working directory is '/home/runner/work/Project-Dixis/Project-Dixis'
type-check	Run actions/checkout@v4	2025-09-20T19:36:45.4525080Z [command]/usr/bin/git version
```

### Logs tail (last 50 lines)
```
```

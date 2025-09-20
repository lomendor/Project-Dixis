# PR #215 — CI Drilldown (final pass)

Failing checks: 8

## frontend-build
- **frontend** — https://github.com/lomendor/Project-Dixis/actions/runs/17885038282/job/50857622236
  - tail (last 160 lines, truncated to 2000 chars):
```
frontend	Install dependencies	2025-09-20T21:28:49.2290702Z 
frontend	Install dependencies	2025-09-20T21:28:49.2290892Z Run `npm audit` for details.
frontend	Install contracts dependencies	﻿2025-09-20T21:28:49.3248545Z ##[group]Run cd packages/contracts && npm ci
frontend	Install contracts dependencies	2025-09-20T21:28:49.3248909Z [36;1mcd packages/contracts && npm ci[0m
frontend	Install contracts dependencies	2025-09-20T21:28:49.3280525Z shell: /usr/bin/bash -e {0}
frontend	Install contracts dependencies	2025-09-20T21:28:49.3280762Z ##[endgroup]
frontend	Install contracts dependencies	2025-09-20T21:28:50.0477387Z 
frontend	Install contracts dependencies	2025-09-20T21:28:50.0478222Z added 2 packages, and audited 3 packages in 645ms
frontend	Install contracts dependencies	2025-09-20T21:28:50.0478666Z 
frontend	Install contracts dependencies	2025-09-20T21:28:50.0478856Z 1 package is looking for funding
frontend	Install contracts dependencies	2025-09-20T21:28:50.0479186Z   run `npm fund` for details
frontend	Install contracts dependencies	2025-09-20T21:28:50.0488559Z 
frontend	Install contracts dependencies	2025-09-20T21:28:50.0488938Z found 0 vulnerabilities
frontend	Type check	﻿2025-09-20T21:28:50.0614884Z ##[group]Run cd frontend && npm run type-check
frontend	Type check	2025-09-20T21:28:50.0615241Z [36;1mcd frontend && npm run type-check[0m
frontend	Type check	2025-09-20T21:28:50.0646901Z shell: /usr/bin/bash -e {0}
frontend	Type check	2025-09-20T21:28:50.0647141Z ##[endgroup]
frontend	Type check	2025-09-20T21:28:50.2015194Z 
frontend	Type check	2025-09-20T21:28:50.2015784Z > frontend@0.1.0 type-check
frontend	Type check	2025-09-20T21:28:50.2016351Z > tsc --noEmit --skipLibCheck
frontend	Type check	2025-09-20T21:28:50.2016650Z 
frontend	Build	﻿2025-09-20T21:28:57.0940162Z ##[group]Run cd frontend && npm run build
frontend	Build	2025-09-20T21:28:57.0940488Z [36;1mcd frontend && npm run build[0m
frontend	Build	2025-09-20T21:28:57.0971009Z shell: /usr/bin/bash -e
```

## frontend-tests
- **frontend-tests** — https://github.com/lomendor/Project-Dixis/actions/runs/17885038266/job/50857601623
  - tail (last 160 lines, truncated to 2000 chars):
```
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7092001Z ##[group]Initializing the repository
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7096581Z [command]/usr/bin/git init /home/runner/work/Project-Dixis/Project-Dixis
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7851346Z hint: Using 'master' as the name for the initial branch. This default branch name
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7853307Z hint: is subject to change. To configure the initial branch name to use in all
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7855086Z hint: of your new repositories, which will suppress this warning, call:
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7856657Z hint:
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7857549Z hint: 	git config --global init.defaultBranch <name>
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7858650Z hint:
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7859928Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7861661Z hint: 'development'. The just-created branch can be renamed via this command:
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7863013Z hint:
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7863716Z hint: 	git branch -m <name>
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7864557Z hint:
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7865674Z hint: Disable this message with "git config set advice.defaultBranchName false"
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7894497Z Initialized empty Git repository in /home/runner/work/Project-Dixis/Project-Dixis/.git/
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.7906782Z [command]/usr/bin/git remote add origin https://github.com/lomendor/Project-Dixis
frontend-tests	Run actions/checkout@v4	2025-09-20T21:27:02.80217
```

## other
- **lighthouse** — https://github.com/lomendor/Project-Dixis/actions/runs/17885038271/job/50857589859
  - tail (last 160 lines, truncated to 2000 chars):
```
lighthouse	Run actions/checkout@v4	2025-09-20T21:26:33.5550155Z 
lighthouse	Run actions/checkout@v4	2025-09-20T21:26:33.5558047Z Turn off this advice by setting config variable advice.detachedHead to false
lighthouse	Run actions/checkout@v4	2025-09-20T21:26:33.5558610Z 
lighthouse	Run actions/checkout@v4	2025-09-20T21:26:33.5560668Z HEAD is now at f6de64b Merge 13dda76427e0bd91efd0d98427e67303ee44f1ae into 6d207086d1c6acbb2f01de367ca58c322fc2cdac
lighthouse	Run actions/checkout@v4	2025-09-20T21:26:33.5563625Z ##[endgroup]
lighthouse	Run actions/checkout@v4	2025-09-20T21:26:33.5600475Z [command]/usr/bin/git log -1 --format=%H
lighthouse	Run actions/checkout@v4	2025-09-20T21:26:33.5623828Z f6de64bb4eee14e0a3011794c18e1701ea6339c2
lighthouse	Setup Node.js	﻿2025-09-20T21:26:33.5927408Z ##[group]Run actions/setup-node@v5
lighthouse	Setup Node.js	2025-09-20T21:26:33.5927768Z with:
lighthouse	Setup Node.js	2025-09-20T21:26:33.5927982Z   node-version: 20
lighthouse	Setup Node.js	2025-09-20T21:26:33.5928203Z   cache: npm
lighthouse	Setup Node.js	2025-09-20T21:26:33.5928512Z   cache-dependency-path: backend/frontend/package-lock.json
lighthouse	Setup Node.js	2025-09-20T21:26:33.5928879Z   always-auth: false
lighthouse	Setup Node.js	2025-09-20T21:26:33.5929121Z   check-latest: false
lighthouse	Setup Node.js	2025-09-20T21:26:33.5929537Z   token: ***
lighthouse	Setup Node.js	2025-09-20T21:26:33.5929776Z   package-manager-cache: true
lighthouse	Setup Node.js	2025-09-20T21:26:33.5930048Z ##[endgroup]
lighthouse	Setup Node.js	2025-09-20T21:26:33.7430561Z Found in cache @ /opt/hostedtoolcache/node/20.19.5/x64
lighthouse	Setup Node.js	2025-09-20T21:26:33.7433740Z (node:2052) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
lighthouse	Setup Node.js	2025-09-20T21:26:33.7435025Z (Use `node --trace-deprecation ...` to show where the warning was created)
lighthouse	Setup Node.js	2025-09-20T21:26:33.7436622Z ##[group]Environment 
```
- **PR Hygiene Check** — https://github.com/lomendor/Project-Dixis/actions/runs/17885038283/job/50857589872
  - tail (last 160 lines, truncated to 2000 chars):
```
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4462773Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4688832Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4734546Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4735384Z ##[group]Fetching the repository
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4743173Z [command]/usr/bin/git -c protocol.version=2 fetch --no-tags --prune --no-recurse-submodules --depth=1 origin +f6de64bb4eee14e0a3011794c18e1701ea6339c2:refs/remotes/pull/215/merge
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1281277Z From https://github.com/lomendor/Project-Dixis
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1282979Z  * [new ref]         f6de64bb4eee14e0a3011794c18e1701ea6339c2 -> pull/215/merge
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1312505Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1314331Z ##[group]Determining the checkout info
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1316312Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1320479Z [command]/usr/bin/git sparse-checkout disable
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1361286Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1389748Z ##[group]Checking out the ref
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1393430Z [command]/usr/bin/git checkout --progress --force refs/remotes/pull/215/merge
PR Hygiene Check	Checkout	2025-09-20T21:26:31.2024343Z Note: switching to 'refs/remotes/pull/215/merge'.
PR Hygiene Check	Checkout	2025-09-20T21:26:31.2025707Z 
PR Hygiene Check	Checkout	2025-09-20T21:26:31.2026494Z You are in 'detached HEAD' state. You can
```
- **integration** — https://github.com/lomendor/Project-Dixis/actions/runs/17885038272/job/50857589934
  - tail (last 160 lines, truncated to 2000 chars):
```
integration	Build frontend	2025-09-20T21:28:01.5449610Z ⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
integration	Build frontend	2025-09-20T21:28:01.5522003Z Attention: Next.js now collects completely anonymous telemetry regarding usage.
integration	Build frontend	2025-09-20T21:28:01.5522827Z This information is used to shape Next.js' roadmap and prioritize features.
integration	Build frontend	2025-09-20T21:28:01.5523950Z You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
integration	Build frontend	2025-09-20T21:28:01.5524516Z https://nextjs.org/telemetry
integration	Build frontend	2025-09-20T21:28:01.5524693Z 
integration	Build frontend	2025-09-20T21:28:01.6054130Z    ▲ Next.js 15.5.0
integration	Build frontend	2025-09-20T21:28:01.6054666Z    - Environments: .env.local
integration	Build frontend	2025-09-20T21:28:01.6054987Z 
integration	Build frontend	2025-09-20T21:28:01.6737072Z    Creating an optimized production build ...
integration	Build frontend	2025-09-20T21:28:10.3828187Z  ✓ Compiled successfully in 6.4s
integration	Build frontend	2025-09-20T21:28:10.3867316Z    Linting and checking validity of types ...
integration	Build frontend	2025-09-20T21:28:13.1532192Z 
integration	Build frontend	2025-09-20T21:28:13.1536652Z Failed to compile.
integration	Build frontend	2025-09-20T21:28:13.1537962Z 
integration	Build frontend	2025-09-20T21:28:13.1539121Z ./src/app/cart/page.tsx
integration	Build frontend	2025-09-20T21:28:13.1542559Z 193:29  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
integration	Build frontend	2025-09-20T21:28:13.15454
```

## quality
- **Quality Assurance** — https://github.com/lomendor/Project-Dixis/actions/runs/17885038283/job/50857589861
  - tail (last 160 lines, truncated to 2000 chars):
```
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4462773Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4688832Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4734546Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4735384Z ##[group]Fetching the repository
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4743173Z [command]/usr/bin/git -c protocol.version=2 fetch --no-tags --prune --no-recurse-submodules --depth=1 origin +f6de64bb4eee14e0a3011794c18e1701ea6339c2:refs/remotes/pull/215/merge
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1281277Z From https://github.com/lomendor/Project-Dixis
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1282979Z  * [new ref]         f6de64bb4eee14e0a3011794c18e1701ea6339c2 -> pull/215/merge
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1312505Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1314331Z ##[group]Determining the checkout info
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1316312Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1320479Z [command]/usr/bin/git sparse-checkout disable
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1361286Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1389748Z ##[group]Checking out the ref
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1393430Z [command]/usr/bin/git checkout --progress --force refs/remotes/pull/215/merge
PR Hygiene Check	Checkout	2025-09-20T21:26:31.2024343Z Note: switching to 'refs/remotes/pull/215/merge'.
PR Hygiene Check	Checkout	2025-09-20T21:26:31.2025707Z 
PR Hygiene Check	Checkout	2025-09-20T21:26:31.2026494Z You are in 'detached HEAD' state. You can
```

## e2e
- **Smoke Tests** — https://github.com/lomendor/Project-Dixis/actions/runs/17885038283/job/50857589865
  - tail (last 160 lines, truncated to 2000 chars):
```
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4462773Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4688832Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4734546Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4735384Z ##[group]Fetching the repository
PR Hygiene Check	Checkout	2025-09-20T21:26:30.4743173Z [command]/usr/bin/git -c protocol.version=2 fetch --no-tags --prune --no-recurse-submodules --depth=1 origin +f6de64bb4eee14e0a3011794c18e1701ea6339c2:refs/remotes/pull/215/merge
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1281277Z From https://github.com/lomendor/Project-Dixis
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1282979Z  * [new ref]         f6de64bb4eee14e0a3011794c18e1701ea6339c2 -> pull/215/merge
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1312505Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1314331Z ##[group]Determining the checkout info
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1316312Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1320479Z [command]/usr/bin/git sparse-checkout disable
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1361286Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1389748Z ##[group]Checking out the ref
PR Hygiene Check	Checkout	2025-09-20T21:26:31.1393430Z [command]/usr/bin/git checkout --progress --force refs/remotes/pull/215/merge
PR Hygiene Check	Checkout	2025-09-20T21:26:31.2024343Z Note: switching to 'refs/remotes/pull/215/merge'.
PR Hygiene Check	Checkout	2025-09-20T21:26:31.2025707Z 
PR Hygiene Check	Checkout	2025-09-20T21:26:31.2026494Z You are in 'detached HEAD' state. You can
```
- **e2e-tests** — https://github.com/lomendor/Project-Dixis/actions/runs/17885038280/job/50857589908
  - tail (last 160 lines, truncated to 2000 chars):
```
e2e-tests	Wait for frontend server	2025-09-20T21:29:19.2621851Z curl: (7) Failed to connect to localhost port 3001 after 0 ms: Couldn't connect to server
e2e-tests	Wait for frontend server	2025-09-20T21:29:21.2695112Z   % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
e2e-tests	Wait for frontend server	2025-09-20T21:29:21.2695976Z                                  Dload  Upload   Total   Spent    Left  Speed
e2e-tests	Wait for frontend server	2025-09-20T21:29:21.2696585Z 
e2e-tests	Wait for frontend server	2025-09-20T21:29:21.2697376Z   0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
e2e-tests	Wait for frontend server	2025-09-20T21:29:21.2698413Z   0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
e2e-tests	Wait for frontend server	2025-09-20T21:29:21.2699363Z curl: (7) Failed to connect to localhost port 3001 after 0 ms: Couldn't connect to server
e2e-tests	Wait for frontend server	2025-09-20T21:29:23.2772443Z   % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
e2e-tests	Wait for frontend server	2025-09-20T21:29:23.2773138Z                                  Dload  Upload   Total   Spent    Left  Speed
e2e-tests	Wait for frontend server	2025-09-20T21:29:23.2773570Z 
e2e-tests	Wait for frontend server	2025-09-20T21:29:23.2774075Z   0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
e2e-tests	Wait for frontend server	2025-09-20T21:29:23.2774853Z   0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
e2e-tests	Wait for frontend server	2025-09-20T21:29:23.2775781Z curl: (7) Failed to connect to localhost port 3001 after 0 ms: Couldn't connect to server
e2e-tests	Wait for frontend server	2025-09-20T21:29:25.2845696Z   % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
e2e-tests	Wait for frontend server	2025-09-20T21:29:25.2846639Z                                  Dload  Upload   Total  
```


### Frontend-tests micro-fix applied at 2025-09-21T00:58:56+03:00
Kind: eslint-any-fix


### Backend micro-fix applied at 2025-09-21T01:02:00+03:00
**Issue**: Tests\Feature\AuthorizationTest > admin has full access
**Error**: Expected response status code [201] but received 422
**Root Cause**: "Insufficient stock for product. Available: 0, requested: 1"
**Fix**: Added 'stock' => 100 to Product::factory()->create() calls in AuthorizationTest.php
**Result**: ✅ All 5 AuthorizationTest tests now passing locally


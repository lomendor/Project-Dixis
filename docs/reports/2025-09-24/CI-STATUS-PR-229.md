# CI Status — PR #229 (2025-09-24T06:05:53.239Z)

PR: https://github.com/lomendor/Project-Dixis/pull/229

## Quality Assurance
- detailsUrl: https://github.com/lomendor/Project-Dixis/actions/runs/17967296290/job/51102194823

### Head (first 80 non-noise lines)
```
Quality Assurance	Install dependencies	﻿2025-09-24T05:29:24.3942112Z ##[group]Run npm ci
Quality Assurance	Install dependencies	2025-09-24T05:29:24.3942408Z npm ci
Quality Assurance	Install dependencies	2025-09-24T05:29:24.4086337Z shell: /usr/bin/bash -e {0}
Quality Assurance	Install dependencies	2025-09-24T05:29:24.4086622Z ##[endgroup]
Quality Assurance	Install dependencies	2025-09-24T05:29:31.6616695Z npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
Quality Assurance	Install dependencies	2025-09-24T05:29:32.8708781Z npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
Quality Assurance	Install dependencies	2025-09-24T05:29:32.9506494Z npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
Quality Assurance	Install dependencies	2025-09-24T05:29:35.1984819Z npm warn deprecated @gitbeaker/node@35.8.1: Please use its successor @gitbeaker/rest
Quality Assurance	Install dependencies	2025-09-24T05:29:35.8166724Z npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
Quality Assurance	Install dependencies	2025-09-24T05:29:46.9519070Z 
Quality Assurance	Install dependencies	2025-09-24T05:29:46.9519741Z > frontend@0.1.0 prepare
Quality Assurance	Install dependencies	2025-09-24T05:29:46.9520215Z > husky
Quality Assurance	Install dependencies	2025-09-24T05:29:46.9520484Z 
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0084335Z .git can't be found
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0085167Z added 1138 packages, and audited 1139 packages in 23s
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0085571Z 
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0085827Z 252 packages are looking for funding
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0086259Z   run `npm fund` for details
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0655968Z 
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0657770Z 22 vulnerabilities (8 low, 6 moderate, 8 high)
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0658228Z 
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0658608Z To address issues that do not require attention, run:
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0659443Z   npm audit fix
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0659675Z 
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0660081Z To address all issues (including breaking changes), run:
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0734170Z   npm audit fix --force
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0734551Z 
Quality Assurance	Install dependencies	2025-09-24T05:29:47.0734821Z Run `npm audit` for details.
Quality Assurance	Install and build contracts dependencies	﻿2025-09-24T05:29:47.1119315Z ##[group]Run if [ -d "../packages/contracts" ]; then
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.1119775Z if [ -d "../packages/contracts" ]; then
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.1120109Z   cd ../packages/contracts
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.1120347Z   npm ci
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.1120539Z   npm run build
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.1120747Z   cd ../../frontend
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.1120956Z else
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.1121161Z   echo "No contracts directory found"
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.1121410Z fi
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.1151310Z shell: /usr/bin/bash -e {0}
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.1151567Z ##[endgroup]
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.8178577Z 
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.8179609Z added 2 packages, and audited 3 packages in 642ms
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.8181393Z 
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.8182034Z 1 package is looking for funding
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.8182476Z   run `npm fund` for details
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.8190435Z 
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.8190659Z found 0 vulnerabilities
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.9415585Z 
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.9416042Z > @dixis/contracts@0.1.0 build
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.9416565Z > tsc
Quality Assurance	Install and build contracts dependencies	2025-09-24T05:29:47.9416675Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	﻿2025-09-24T05:29:49.0856973Z ##[group]Run if [[ "ci/revert-hotfix-nonblocking-on-main" == ci/* ]]; then
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.0857506Z if [[ "ci/revert-hotfix-nonblocking-on-main" == ci/* ]]; then
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.0857963Z   echo "⚠️ Running QA on ci/* hotfix branch - failures won't block merge"
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.0858313Z fi
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.0858493Z npm run qa:all
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.0888505Z shell: /usr/bin/bash -e {0}
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.0888755Z ##[endgroup]
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.0939099Z ⚠️ Running QA on ci/* hotfix branch - failures won't block merge
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.1989691Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.1990101Z > frontend@0.1.0 qa:all
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.1990706Z > npm run qa:types && npm run qa:lint && npm run qa:knip && npm run qa:deps && npm run qa:size
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.1991061Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.3045254Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.3045847Z > frontend@0.1.0 qa:types
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.3046285Z > tsc --noEmit
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:49.3046488Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:55.3455621Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:55.3456315Z > frontend@0.1.0 qa:lint
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:55.3458649Z > eslint . --max-warnings=10000
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:55.3459222Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.8689981Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.8691622Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/src/app/HomeClient.tsx
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.8724651Z ##[warning]  66:6  warning  React Hook useEffect has a missing dependency: 'loadProducts'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.8734452Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.8735278Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/src/app/admin/components/PriceStockEditor.tsx
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.8737924Z ##[error]  49:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.8740331Z ##[error]  52:36  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.8741496Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.8742088Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/src/app/admin/pricing/page.tsx
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.8744318Z ##[warning]  16:6  warning  React Hook useEffect has a missing dependency: 'loadProducts'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
```

### Tail (last 80 non-noise lines)
```
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9078220Z ##[error]  102:19  error    Unexpected any. Specify a different type             @typescript-eslint/no-explicit-any
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9079666Z ##[warning]  128:18  warning  'e' is defined but never used                        @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9080459Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9080850Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/e2e/product-image-timeout.spec.ts
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9081695Z ##[error]  3:32  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9082478Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9082796Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/e2e/setup.mocks.ts
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9083578Z ##[warning]  12:11  warning  'method' is assigned a value but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9084375Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9084754Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/e2e/shipping-demo-simple.spec.ts
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9085628Z ##[warning]    1:16  warning  'expect' is defined but never used                      @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9086929Z ##[warning]    1:24  warning  'Page' is defined but never used                        @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9088177Z ##[error]   32:9   error    'foundFields' is never reassigned. Use 'const' instead  prefer-const
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9089539Z ##[warning]   44:16  warning  'e' is defined but never used                           @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9090793Z ##[warning]   91:20  warning  'e' is defined but never used                           @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9092036Z ##[warning]  159:16  warning  'e' is defined but never used                           @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9092847Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9093228Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/e2e/shipping-engine-v1.spec.ts
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9094127Z ##[warning]   11:11  warning  'ProductTestCase' is defined but never used           @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9095476Z ##[warning]  423:13  warning  'hasError' is assigned a value but never used         @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9134705Z ##[warning]  469:11  warning  'hasEmptyMessage' is assigned a value but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9135700Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9136161Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/e2e/shipping-integration-final.spec.ts
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9137046Z ##[warning]  115:16  warning  'e' is defined but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9138285Z ##[warning]  129:16  warning  'e' is defined but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9139774Z ##[warning]  194:16  warning  'e' is defined but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9141009Z ##[warning]  227:16  warning  'e' is defined but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9142199Z ##[warning]  262:18  warning  'e' is defined but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9143283Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9143719Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/e2e/shipping-integration-flow.spec.ts
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9144682Z ##[error]  62:29  error    Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9146068Z ##[warning]  92:11  warning  'networkRequests' is assigned a value but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9146900Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9147286Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/e2e/shipping-integration.spec.ts
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9148095Z ##[warning]  140:16  warning  'e' is defined but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9149487Z ##[warning]  168:16  warning  'e' is defined but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9150276Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9150625Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/e2e/smoke.consumer.spec.ts
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9151413Z ##[warning]   59:14  warning  'error' is defined but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9152625Z ##[warning]  111:14  warning  'error' is defined but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9153812Z ##[warning]  152:14  warning  'error' is defined but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9154575Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9154880Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/e2e/smoke.spec.ts
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9155613Z ##[warning]  99:14  warning  'error' is defined but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9156375Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9156679Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/e2e/utils/auth.ts
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9157486Z ##[warning]  104:44  warning  'e' is defined but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9158690Z ##[warning]  105:46  warning  'e' is defined but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9159664Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9159974Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/global-setup.ts
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9160790Z ##[warning]  9:7  warning  'TEST_USERS' is assigned a value but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9161587Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9161986Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/unit/checkout.api.resilience.spec.ts
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9162929Z ##[warning]   6:30  warning  'delay' is defined but never used               @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9164238Z ##[warning]  14:3   warning  'createErrorHandler' is defined but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9165061Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9165401Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/unit/helpers/api-mocks.ts
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9166293Z ##[error]  85:66  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9167116Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9167467Z /home/runner/work/Project-Dixis/Project-Dixis/frontend/tests/unit/useCheckout.spec.tsx
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9168310Z ##[warning]  21:7  warning  'mockCart' is assigned a value but never used   @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9169832Z ##[warning]  23:7  warning  'mockOrder' is assigned a value but never used  @typescript-eslint/no-unused-vars
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9170653Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9171057Z ✖ 203 problems (70 errors, 133 warnings)
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9171518Z   2 errors and 0 warnings potentially fixable with the `--fix` option.
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9171913Z 
Quality Assurance	Run full QA suite (non-blocking on ci/* branches)	2025-09-24T05:29:59.9363475Z ##[error]Process completed with exit code 1.
Quality Assurance	Post Checkout	﻿2025-09-24T05:29:59.9459836Z Post job cleanup.
Quality Assurance	Post Checkout	2025-09-24T05:30:00.0398348Z [command]/usr/bin/git version
Quality Assurance	Post Checkout	2025-09-24T05:30:00.0434261Z git version 2.51.0
Quality Assurance	Post Checkout	2025-09-24T05:30:00.0483558Z Temporarily overriding HOME='/home/runner/work/_temp/e185e2b9-369e-4c16-8c2d-77af54d0cf79' before making global git config changes
Quality Assurance	Post Checkout	2025-09-24T05:30:00.0484772Z Adding repository directory to the temporary git global config as a safe directory
Quality Assurance	Post Checkout	2025-09-24T05:30:00.0488566Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
Quality Assurance	Post Checkout	2025-09-24T05:30:00.0520766Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
Quality Assurance	Post Checkout	2025-09-24T05:30:00.0552303Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
Quality Assurance	Post Checkout	2025-09-24T05:30:00.0793943Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
Quality Assurance	Post Checkout	2025-09-24T05:30:00.0817753Z http.https://github.com/.extraheader
Quality Assurance	Post Checkout	2025-09-24T05:30:00.0831172Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
Quality Assurance	Post Checkout	2025-09-24T05:30:00.0863847Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
Quality Assurance	Complete job	﻿2025-09-24T05:30:00.1222736Z Cleaning up orphan processes
```

## PR Hygiene Check
- detailsUrl: https://github.com/lomendor/Project-Dixis/actions/runs/17967296290/job/51102194814

### Head (first 80 non-noise lines)
```
PR Hygiene Check	Install dependencies	﻿2025-09-24T05:29:20.7937232Z ##[group]Run npm ci
PR Hygiene Check	Install dependencies	2025-09-24T05:29:20.7937557Z npm ci
PR Hygiene Check	Install dependencies	2025-09-24T05:29:20.7997111Z shell: /usr/bin/bash -e {0}
PR Hygiene Check	Install dependencies	2025-09-24T05:29:20.7997429Z ##[endgroup]
PR Hygiene Check	Install dependencies	2025-09-24T05:29:25.5926759Z npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
PR Hygiene Check	Install dependencies	2025-09-24T05:29:26.7784563Z npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
PR Hygiene Check	Install dependencies	2025-09-24T05:29:26.8949343Z npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
PR Hygiene Check	Install dependencies	2025-09-24T05:29:28.8189061Z npm warn deprecated @gitbeaker/node@35.8.1: Please use its successor @gitbeaker/rest
PR Hygiene Check	Install dependencies	2025-09-24T05:29:29.2855833Z npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.6267964Z 
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.6268605Z > frontend@0.1.0 prepare
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.6269157Z > husky
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.6269434Z 
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.6834475Z .git can't be found
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.6835194Z added 1138 packages, and audited 1139 packages in 20s
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.6835747Z 
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.6835995Z 252 packages are looking for funding
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.6836468Z   run `npm fund` for details
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7358168Z 
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7359369Z 22 vulnerabilities (8 low, 6 moderate, 8 high)
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7360202Z 
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7361088Z To address issues that do not require attention, run:
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7361988Z   npm audit fix
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7362491Z 
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7363034Z To address all issues (including breaking changes), run:
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7364570Z   npm audit fix --force
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7366572Z 
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7366823Z Run `npm audit` for details.
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	﻿2025-09-24T05:29:40.7879955Z ##[group]Run if [[ "ci/revert-hotfix-nonblocking-on-main" == ci/* ]]; then
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:40.7880504Z if [[ "ci/revert-hotfix-nonblocking-on-main" == ci/* ]]; then
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:40.7881251Z   echo "⚠️ Running commitlint on ci/* hotfix branch - failures won't block merge"
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:40.7881619Z fi
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:40.7881846Z npx commitlint --from HEAD~1 --to HEAD --verbose
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:40.7913463Z shell: /usr/bin/bash -e {0}
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:40.7913699Z ##[endgroup]
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:40.7967500Z ⚠️ Running commitlint on ci/* hotfix branch - failures won't block merge
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6884880Z ⧗   input: Merge fbf4a693ef96956a7fb83c3e859eb8f8c68b9e0e into f4951c0ec6e36cfceba4a74b51a9a25327bfaeb0
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6885461Z 
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6885474Z 
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6885676Z ✔   found 0 problems, 0 warnings
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6886178Z ⧗   input: ci: generalize quarantine conditions for all ci/* branches
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6886439Z 
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6886783Z - Replace specific 'ci/auth-e2e-hotfix' references with generic ci/* pattern
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6887466Z - Update quarantine conditions in ci.yml, frontend-ci.yml, frontend-e2e.yml, fe-api-integration.yml
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6888080Z - Ensure continue-on-error remains strictly scoped to ci/* branches only
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6888578Z - Main branch runs will properly block on E2E/Lighthouse failures
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6888816Z 
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6889108Z This normalizes the workflows after PR #222 merge, ensuring hotfix-specific
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6889694Z configurations are properly generalized while maintaining strict blocking
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6890077Z on the main branch.
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6890190Z 
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6890472Z 🤖 Generated with [Claude Code](https://claude.ai/code)
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6890979Z 
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6891458Z Co-Authored-By: Claude <noreply@anthropic.com>
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6891912Z ✔   found 0 problems, 0 warnings
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	﻿2025-09-24T05:29:41.7097410Z ##[group]Run if [[ "ci/revert-hotfix-nonblocking-on-main" == ci/* ]]; then
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7097895Z if [[ "ci/revert-hotfix-nonblocking-on-main" == ci/* ]]; then
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7098333Z   echo "⚠️ Running Danger on ci/* hotfix branch - failures won't block merge"
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7098679Z fi
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7098846Z npx danger ci
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7129060Z shell: /usr/bin/bash -e {0}
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7129285Z env:
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7129747Z   GITHUB_TOKEN: ***
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7129943Z ##[endgroup]
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7182765Z ⚠️ Running Danger on ci/* hotfix branch - failures won't block merge
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2216275Z 
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2367636Z Failing the build, there is 1 fail.
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2983665Z Request failed [403]: https://api.github.com/user
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2987390Z Response: {
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2988015Z   "message": "Resource not accessible by integration",
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2988934Z   "documentation_url": "https://docs.github.com/rest/users/users#get-the-authenticated-user",
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2989740Z   "status": "403"
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2990049Z }
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.4703361Z Request failed [403]: https://api.github.com/user
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.4706338Z Response: {
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.4706756Z   "message": "Resource not accessible by integration",
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.4707386Z   "documentation_url": "https://docs.github.com/rest/users/users#get-the-authenticated-user",
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.4707865Z   "status": "403"
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.4708057Z }
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.8188860Z Request failed [403]: https://api.github.com/repos/lomendor/Project-Dixis/issues/229/comments
```

### Tail (last 80 non-noise lines)
```
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7361988Z   npm audit fix
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7362491Z 
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7363034Z To address all issues (including breaking changes), run:
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7364570Z   npm audit fix --force
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7366572Z 
PR Hygiene Check	Install dependencies	2025-09-24T05:29:40.7366823Z Run `npm audit` for details.
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	﻿2025-09-24T05:29:40.7879955Z ##[group]Run if [[ "ci/revert-hotfix-nonblocking-on-main" == ci/* ]]; then
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:40.7880504Z if [[ "ci/revert-hotfix-nonblocking-on-main" == ci/* ]]; then
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:40.7881251Z   echo "⚠️ Running commitlint on ci/* hotfix branch - failures won't block merge"
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:40.7881619Z fi
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:40.7881846Z npx commitlint --from HEAD~1 --to HEAD --verbose
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:40.7913463Z shell: /usr/bin/bash -e {0}
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:40.7913699Z ##[endgroup]
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:40.7967500Z ⚠️ Running commitlint on ci/* hotfix branch - failures won't block merge
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6884880Z ⧗   input: Merge fbf4a693ef96956a7fb83c3e859eb8f8c68b9e0e into f4951c0ec6e36cfceba4a74b51a9a25327bfaeb0
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6885461Z 
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6885474Z 
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6885676Z ✔   found 0 problems, 0 warnings
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6886178Z ⧗   input: ci: generalize quarantine conditions for all ci/* branches
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6886439Z 
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6886783Z - Replace specific 'ci/auth-e2e-hotfix' references with generic ci/* pattern
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6887466Z - Update quarantine conditions in ci.yml, frontend-ci.yml, frontend-e2e.yml, fe-api-integration.yml
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6888080Z - Ensure continue-on-error remains strictly scoped to ci/* branches only
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6888578Z - Main branch runs will properly block on E2E/Lighthouse failures
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6888816Z 
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6889108Z This normalizes the workflows after PR #222 merge, ensuring hotfix-specific
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6889694Z configurations are properly generalized while maintaining strict blocking
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6890077Z on the main branch.
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6890190Z 
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6890472Z 🤖 Generated with [Claude Code](https://claude.ai/code)
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6890979Z 
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6891458Z Co-Authored-By: Claude <noreply@anthropic.com>
PR Hygiene Check	Run commitlint (non-blocking on ci/* branches)	2025-09-24T05:29:41.6891912Z ✔   found 0 problems, 0 warnings
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	﻿2025-09-24T05:29:41.7097410Z ##[group]Run if [[ "ci/revert-hotfix-nonblocking-on-main" == ci/* ]]; then
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7097895Z if [[ "ci/revert-hotfix-nonblocking-on-main" == ci/* ]]; then
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7098333Z   echo "⚠️ Running Danger on ci/* hotfix branch - failures won't block merge"
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7098679Z fi
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7098846Z npx danger ci
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7129060Z shell: /usr/bin/bash -e {0}
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7129285Z env:
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7129747Z   GITHUB_TOKEN: ***
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7129943Z ##[endgroup]
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:41.7182765Z ⚠️ Running Danger on ci/* hotfix branch - failures won't block merge
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2216275Z 
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2367636Z Failing the build, there is 1 fail.
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2983665Z Request failed [403]: https://api.github.com/user
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2987390Z Response: {
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2988015Z   "message": "Resource not accessible by integration",
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2988934Z   "documentation_url": "https://docs.github.com/rest/users/users#get-the-authenticated-user",
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2989740Z   "status": "403"
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.2990049Z }
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.4703361Z Request failed [403]: https://api.github.com/user
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.4706338Z Response: {
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.4706756Z   "message": "Resource not accessible by integration",
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.4707386Z   "documentation_url": "https://docs.github.com/rest/users/users#get-the-authenticated-user",
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.4707865Z   "status": "403"
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.4708057Z }
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.8188860Z Request failed [403]: https://api.github.com/repos/lomendor/Project-Dixis/issues/229/comments
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.8191312Z Response: {
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.8191865Z   "message": "Resource not accessible by integration",
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.8192757Z   "documentation_url": "https://docs.github.com/rest/issues/comments#create-an-issue-comment",
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.8193473Z   "status": "403"
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.8193805Z }
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.8194191Z Feedback: undefined
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.8911867Z Could not add a commit status, the GitHub token for Danger does not have access rights.
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.8912819Z If the build fails, then danger will use a failing exit code.
PR Hygiene Check	Run Danger (non-blocking on ci/* branches)	2025-09-24T05:29:44.9099794Z ##[error]Process completed with exit code 1.
PR Hygiene Check	Post Checkout	﻿2025-09-24T05:29:44.9198122Z Post job cleanup.
PR Hygiene Check	Post Checkout	2025-09-24T05:29:45.0118888Z [command]/usr/bin/git version
PR Hygiene Check	Post Checkout	2025-09-24T05:29:45.0160508Z git version 2.51.0
PR Hygiene Check	Post Checkout	2025-09-24T05:29:45.0201648Z Temporarily overriding HOME='/home/runner/work/_temp/49644ca2-a0f2-4b62-8a2d-0208e8c47645' before making global git config changes
PR Hygiene Check	Post Checkout	2025-09-24T05:29:45.0202802Z Adding repository directory to the temporary git global config as a safe directory
PR Hygiene Check	Post Checkout	2025-09-24T05:29:45.0206692Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
PR Hygiene Check	Post Checkout	2025-09-24T05:29:45.0239305Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
PR Hygiene Check	Post Checkout	2025-09-24T05:29:45.0271338Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
PR Hygiene Check	Post Checkout	2025-09-24T05:29:45.0494604Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
PR Hygiene Check	Post Checkout	2025-09-24T05:29:45.0515448Z http.https://github.com/.extraheader
PR Hygiene Check	Post Checkout	2025-09-24T05:29:45.0527988Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
PR Hygiene Check	Post Checkout	2025-09-24T05:29:45.0557773Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
PR Hygiene Check	Complete job	﻿2025-09-24T05:29:45.0875772Z Cleaning up orphan processes
```

## e2e
- detailsUrl: https://github.com/lomendor/Project-Dixis/actions/runs/17967296264/job/51102345717

### Head (first 80 non-noise lines)
```
e2e	Initialize containers	﻿2025-09-24T05:32:30.3199725Z ##[group]Checking docker version
e2e	Initialize containers	2025-09-24T05:32:30.3213229Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
e2e	Initialize containers	2025-09-24T05:32:30.4293866Z '1.48'
e2e	Initialize containers	2025-09-24T05:32:30.4310387Z Docker daemon API version: '1.48'
e2e	Initialize containers	2025-09-24T05:32:30.4311808Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
e2e	Initialize containers	2025-09-24T05:32:30.4494644Z '1.48'
e2e	Initialize containers	2025-09-24T05:32:30.4509241Z Docker client API version: '1.48'
e2e	Initialize containers	2025-09-24T05:32:30.4515005Z ##[endgroup]
e2e	Initialize containers	2025-09-24T05:32:30.4518513Z ##[group]Clean up resources from previous jobs
e2e	Initialize containers	2025-09-24T05:32:30.4524313Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=17ba18"
e2e	Initialize containers	2025-09-24T05:32:30.4674103Z ##[command]/usr/bin/docker network prune --force --filter "label=17ba18"
e2e	Initialize containers	2025-09-24T05:32:30.4823351Z ##[endgroup]
e2e	Initialize containers	2025-09-24T05:32:30.4824228Z ##[group]Create local container network
e2e	Initialize containers	2025-09-24T05:32:30.4835372Z ##[command]/usr/bin/docker network create --label 17ba18 github_network_48bcfa9e2f9b433c8de02dc94706b90f
e2e	Initialize containers	2025-09-24T05:32:30.5419829Z efd3bd5423bb7ba3489747c5fdeea29752f9402ef1abcbcff5b19c0001ddbb44
e2e	Initialize containers	2025-09-24T05:32:30.5439253Z ##[endgroup]
e2e	Initialize containers	2025-09-24T05:32:30.5474232Z ##[group]Starting postgres service container
e2e	Initialize containers	2025-09-24T05:32:30.5495801Z ##[command]/usr/bin/docker pull postgres:15
e2e	Initialize containers	2025-09-24T05:32:31.1778827Z 15: Pulling from library/postgres
e2e	Initialize containers	2025-09-24T05:32:31.3176078Z ce1261c6d567: Pulling fs layer
e2e	Initialize containers	2025-09-24T05:32:31.3178061Z 951a19831fc8: Pulling fs layer
e2e	Initialize containers	2025-09-24T05:32:31.3179496Z 2f21900bfd71: Pulling fs layer
e2e	Initialize containers	2025-09-24T05:32:31.3181114Z cc42246e0a23: Pulling fs layer
e2e	Initialize containers	2025-09-24T05:32:31.3182309Z 7b0faefcf7ad: Pulling fs layer
e2e	Initialize containers	2025-09-24T05:32:31.3183484Z 7bf3457011a0: Pulling fs layer
e2e	Initialize containers	2025-09-24T05:32:31.3184648Z c874057d7395: Pulling fs layer
e2e	Initialize containers	2025-09-24T05:32:31.3185810Z 7f1bdd7d8f57: Pulling fs layer
e2e	Initialize containers	2025-09-24T05:32:31.3186957Z 2d81dc87a30f: Pulling fs layer
e2e	Initialize containers	2025-09-24T05:32:31.3188286Z 014185d6430c: Pulling fs layer
e2e	Initialize containers	2025-09-24T05:32:31.3189445Z fad42dbba518: Pulling fs layer
e2e	Initialize containers	2025-09-24T05:32:31.3190982Z e4a7a16463c4: Pulling fs layer
e2e	Initialize containers	2025-09-24T05:32:31.3192139Z dfc6865a7102: Pulling fs layer
e2e	Initialize containers	2025-09-24T05:32:31.3193326Z 74c334d7792a: Pulling fs layer
e2e	Initialize containers	2025-09-24T05:32:31.3194457Z cc42246e0a23: Waiting
e2e	Initialize containers	2025-09-24T05:32:31.3195459Z 7b0faefcf7ad: Waiting
e2e	Initialize containers	2025-09-24T05:32:31.3196474Z 7bf3457011a0: Waiting
e2e	Initialize containers	2025-09-24T05:32:31.3197458Z 2d81dc87a30f: Waiting
e2e	Initialize containers	2025-09-24T05:32:31.3198698Z 014185d6430c: Waiting
e2e	Initialize containers	2025-09-24T05:32:31.3199696Z c874057d7395: Waiting
e2e	Initialize containers	2025-09-24T05:32:31.3200699Z fad42dbba518: Waiting
e2e	Initialize containers	2025-09-24T05:32:31.3201705Z dfc6865a7102: Waiting
e2e	Initialize containers	2025-09-24T05:32:31.3202695Z 74c334d7792a: Waiting
e2e	Initialize containers	2025-09-24T05:32:31.3203698Z e4a7a16463c4: Waiting
e2e	Initialize containers	2025-09-24T05:32:31.5023757Z 951a19831fc8: Verifying Checksum
e2e	Initialize containers	2025-09-24T05:32:31.5025656Z 951a19831fc8: Download complete
e2e	Initialize containers	2025-09-24T05:32:31.6240934Z 2f21900bfd71: Verifying Checksum
e2e	Initialize containers	2025-09-24T05:32:31.6241705Z 2f21900bfd71: Download complete
e2e	Initialize containers	2025-09-24T05:32:31.7679381Z cc42246e0a23: Verifying Checksum
e2e	Initialize containers	2025-09-24T05:32:31.7680208Z cc42246e0a23: Download complete
e2e	Initialize containers	2025-09-24T05:32:31.9225437Z 7b0faefcf7ad: Download complete
e2e	Initialize containers	2025-09-24T05:32:31.9460221Z ce1261c6d567: Verifying Checksum
e2e	Initialize containers	2025-09-24T05:32:31.9462454Z ce1261c6d567: Download complete
e2e	Initialize containers	2025-09-24T05:32:32.0259225Z 7bf3457011a0: Verifying Checksum
e2e	Initialize containers	2025-09-24T05:32:32.0259932Z 7bf3457011a0: Download complete
e2e	Initialize containers	2025-09-24T05:32:32.1055530Z c874057d7395: Verifying Checksum
e2e	Initialize containers	2025-09-24T05:32:32.1056444Z c874057d7395: Download complete
e2e	Initialize containers	2025-09-24T05:32:32.1350910Z 7f1bdd7d8f57: Verifying Checksum
e2e	Initialize containers	2025-09-24T05:32:32.1352580Z 7f1bdd7d8f57: Download complete
e2e	Initialize containers	2025-09-24T05:32:32.3023721Z 014185d6430c: Verifying Checksum
e2e	Initialize containers	2025-09-24T05:32:32.3025178Z 014185d6430c: Download complete
e2e	Initialize containers	2025-09-24T05:32:32.3400530Z fad42dbba518: Download complete
e2e	Initialize containers	2025-09-24T05:32:32.5050260Z e4a7a16463c4: Verifying Checksum
e2e	Initialize containers	2025-09-24T05:32:32.5053868Z e4a7a16463c4: Download complete
e2e	Initialize containers	2025-09-24T05:32:32.5343550Z dfc6865a7102: Verifying Checksum
e2e	Initialize containers	2025-09-24T05:32:32.5344120Z dfc6865a7102: Download complete
e2e	Initialize containers	2025-09-24T05:32:32.7122430Z 74c334d7792a: Verifying Checksum
e2e	Initialize containers	2025-09-24T05:32:32.7123547Z 74c334d7792a: Download complete
e2e	Initialize containers	2025-09-24T05:32:32.9639859Z ce1261c6d567: Pull complete
e2e	Initialize containers	2025-09-24T05:32:33.4042438Z 2d81dc87a30f: Verifying Checksum
e2e	Initialize containers	2025-09-24T05:32:33.9502299Z 2d81dc87a30f: Download complete
e2e	Initialize containers	2025-09-24T05:32:33.9502855Z 951a19831fc8: Pull complete
e2e	Initialize containers	2025-09-24T05:32:34.1291443Z 2f21900bfd71: Pull complete
e2e	Initialize containers	2025-09-24T05:32:34.1708752Z cc42246e0a23: Pull complete
e2e	Initialize containers	2025-09-24T05:32:34.4903474Z 7b0faefcf7ad: Pull complete
e2e	Initialize containers	2025-09-24T05:32:34.5736267Z 7bf3457011a0: Pull complete
e2e	Initialize containers	2025-09-24T05:32:34.5825115Z c874057d7395: Pull complete
e2e	Initialize containers	2025-09-24T05:32:34.5922262Z 7f1bdd7d8f57: Pull complete
e2e	Initialize containers	2025-09-24T05:32:37.4950718Z 2d81dc87a30f: Pull complete
e2e	Initialize containers	2025-09-24T05:32:37.5097351Z 014185d6430c: Pull complete
e2e	Initialize containers	2025-09-24T05:32:37.5228130Z fad42dbba518: Pull complete
```

### Tail (last 80 non-noise lines)
```
e2e	Stop containers	2025-09-24T05:52:50.0551382Z  2025-09-24 05:41:41.888 UTC [525] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0552010Z  2025-09-24 05:41:51.953 UTC [534] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0552613Z  2025-09-24 05:42:02.021 UTC [542] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0553202Z  2025-09-24 05:42:12.088 UTC [551] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0553614Z  2025-09-24 05:42:22.152 UTC [559] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0553955Z  2025-09-24 05:42:32.217 UTC [568] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0554304Z  2025-09-24 05:42:42.283 UTC [576] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0554643Z  2025-09-24 05:42:52.348 UTC [585] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0554983Z  2025-09-24 05:43:02.414 UTC [593] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0555321Z  2025-09-24 05:43:12.478 UTC [602] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0555659Z  2025-09-24 05:43:22.541 UTC [610] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0556003Z  2025-09-24 05:43:32.604 UTC [619] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0556339Z  2025-09-24 05:43:42.669 UTC [627] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0556676Z  2025-09-24 05:43:52.735 UTC [636] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0557013Z  2025-09-24 05:44:02.798 UTC [644] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0557342Z  2025-09-24 05:44:12.863 UTC [653] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0558089Z  2025-09-24 05:44:22.930 UTC [661] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0558604Z  2025-09-24 05:44:32.995 UTC [670] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0558951Z  2025-09-24 05:44:43.060 UTC [678] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0559437Z  2025-09-24 05:44:53.124 UTC [687] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0559772Z  2025-09-24 05:45:03.188 UTC [695] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0560109Z  2025-09-24 05:45:13.254 UTC [704] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0560444Z  2025-09-24 05:45:23.319 UTC [712] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0560789Z  2025-09-24 05:45:33.385 UTC [721] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0561121Z  2025-09-24 05:45:43.450 UTC [729] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0561458Z  2025-09-24 05:45:53.517 UTC [738] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0561793Z  2025-09-24 05:46:03.583 UTC [746] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0562133Z  2025-09-24 05:46:13.670 UTC [755] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0562464Z  2025-09-24 05:46:23.750 UTC [763] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0562813Z  2025-09-24 05:46:33.814 UTC [772] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0563149Z  2025-09-24 05:46:43.880 UTC [780] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0563488Z  2025-09-24 05:46:53.946 UTC [789] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0563833Z  2025-09-24 05:47:04.010 UTC [797] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0564169Z  2025-09-24 05:47:14.074 UTC [806] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0564508Z  2025-09-24 05:47:24.138 UTC [814] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0564842Z  2025-09-24 05:47:34.203 UTC [823] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0565178Z  2025-09-24 05:47:44.271 UTC [831] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0565519Z  2025-09-24 05:47:54.337 UTC [840] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0565857Z  2025-09-24 05:48:04.403 UTC [848] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0566197Z  2025-09-24 05:48:14.467 UTC [857] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0566528Z  2025-09-24 05:48:24.532 UTC [865] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0566865Z  2025-09-24 05:48:34.604 UTC [874] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0567199Z  2025-09-24 05:48:44.670 UTC [882] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0567535Z  2025-09-24 05:48:54.733 UTC [891] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0568087Z  2025-09-24 05:49:04.797 UTC [899] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0568441Z  2025-09-24 05:49:14.859 UTC [908] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0568775Z  2025-09-24 05:49:24.926 UTC [916] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0569120Z  2025-09-24 05:49:34.990 UTC [925] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0569456Z  2025-09-24 05:49:45.055 UTC [933] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0569794Z  2025-09-24 05:49:55.120 UTC [942] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0570138Z  2025-09-24 05:50:05.186 UTC [950] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0570475Z  2025-09-24 05:50:15.251 UTC [959] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0570802Z  2025-09-24 05:50:25.315 UTC [967] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0571137Z  2025-09-24 05:50:35.379 UTC [976] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0571472Z  2025-09-24 05:50:45.443 UTC [984] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0571805Z  2025-09-24 05:50:55.509 UTC [993] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0572150Z  2025-09-24 05:51:05.574 UTC [1001] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0572500Z  2025-09-24 05:51:15.642 UTC [1010] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0573017Z  2025-09-24 05:51:25.706 UTC [1018] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0573360Z  2025-09-24 05:51:35.773 UTC [1027] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0573819Z  2025-09-24 05:51:45.839 UTC [1035] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0574158Z  2025-09-24 05:51:55.903 UTC [1044] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0574497Z  2025-09-24 05:52:05.968 UTC [1052] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0574832Z  2025-09-24 05:52:16.034 UTC [1061] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0575168Z  2025-09-24 05:52:26.102 UTC [1069] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0575514Z  2025-09-24 05:52:36.174 UTC [1078] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0575852Z  2025-09-24 05:52:46.242 UTC [1086] FATAL:  role "root" does not exist
e2e	Stop containers	2025-09-24T05:52:50.0582523Z Stop and remove container: dbf22cb7198b471ebfc11278f503649e_postgres15_c09a62
e2e	Stop containers	2025-09-24T05:52:50.0587285Z ##[command]/usr/bin/docker rm --force 3fa2c6809eb992a347b3973102632b2d72aad743b9a6f8c56afd0285ee7e8108
e2e	Stop containers	2025-09-24T05:52:50.1960680Z 3fa2c6809eb992a347b3973102632b2d72aad743b9a6f8c56afd0285ee7e8108
e2e	Stop containers	2025-09-24T05:52:50.1986784Z Remove container network: github_network_48bcfa9e2f9b433c8de02dc94706b90f
e2e	Stop containers	2025-09-24T05:52:50.1991272Z ##[command]/usr/bin/docker network rm github_network_48bcfa9e2f9b433c8de02dc94706b90f
e2e	Stop containers	2025-09-24T05:52:50.3142029Z github_network_48bcfa9e2f9b433c8de02dc94706b90f
e2e	Complete job	﻿2025-09-24T05:52:50.3203723Z Cleaning up orphan processes
e2e	Complete job	2025-09-24T05:52:50.3568703Z Terminate orphan process: pid (4395) (bash)
e2e	Complete job	2025-09-24T05:52:50.3586264Z Terminate orphan process: pid (4396) (php)
e2e	Complete job	2025-09-24T05:52:50.3602435Z Terminate orphan process: pid (4399) (php8.2)
e2e	Complete job	2025-09-24T05:52:50.3618525Z Terminate orphan process: pid (4571) (npm run start)
e2e	Complete job	2025-09-24T05:52:50.3671091Z Terminate orphan process: pid (4582) (sh)
e2e	Complete job	2025-09-24T05:52:50.3714062Z Terminate orphan process: pid (4583) (next-server (v15.5.0))
```

## e2e-tests
- detailsUrl: https://github.com/lomendor/Project-Dixis/actions/runs/17967296268/job/51102284004

### Head (first 80 non-noise lines)
```
e2e-tests	Initialize containers	﻿2025-09-24T05:31:12.1692355Z ##[group]Checking docker version
e2e-tests	Initialize containers	2025-09-24T05:31:12.1706096Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
e2e-tests	Initialize containers	2025-09-24T05:31:13.6644051Z '1.48'
e2e-tests	Initialize containers	2025-09-24T05:31:13.6657212Z Docker daemon API version: '1.48'
e2e-tests	Initialize containers	2025-09-24T05:31:13.6657701Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
e2e-tests	Initialize containers	2025-09-24T05:31:13.6944132Z '1.48'
e2e-tests	Initialize containers	2025-09-24T05:31:13.6957005Z Docker client API version: '1.48'
e2e-tests	Initialize containers	2025-09-24T05:31:13.6963006Z ##[endgroup]
e2e-tests	Initialize containers	2025-09-24T05:31:13.6965646Z ##[group]Clean up resources from previous jobs
e2e-tests	Initialize containers	2025-09-24T05:31:13.6970950Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=904880"
e2e-tests	Initialize containers	2025-09-24T05:31:13.7113231Z ##[command]/usr/bin/docker network prune --force --filter "label=904880"
e2e-tests	Initialize containers	2025-09-24T05:31:13.7301375Z ##[endgroup]
e2e-tests	Initialize containers	2025-09-24T05:31:13.7301769Z ##[group]Create local container network
e2e-tests	Initialize containers	2025-09-24T05:31:13.7311372Z ##[command]/usr/bin/docker network create --label 904880 github_network_abfcba7d254e4f17970699ea23d51ad7
e2e-tests	Initialize containers	2025-09-24T05:31:13.7788582Z e074c932e97441d9bf0808e2c492082927f4583697c1102c48d3a99989bbfcd6
e2e-tests	Initialize containers	2025-09-24T05:31:13.7806051Z ##[endgroup]
e2e-tests	Initialize containers	2025-09-24T05:31:13.7829417Z ##[group]Starting postgres service container
e2e-tests	Initialize containers	2025-09-24T05:31:13.7848464Z ##[command]/usr/bin/docker pull postgres:15
e2e-tests	Initialize containers	2025-09-24T05:31:14.2767215Z 15: Pulling from library/postgres
e2e-tests	Initialize containers	2025-09-24T05:31:14.4142267Z ce1261c6d567: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:31:14.4142993Z 951a19831fc8: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:31:14.4144855Z 2f21900bfd71: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:31:14.4145539Z cc42246e0a23: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:31:14.4146185Z 7b0faefcf7ad: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:31:14.4146638Z 7bf3457011a0: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:31:14.4147103Z c874057d7395: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:31:14.4147490Z 7f1bdd7d8f57: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:31:14.4148210Z 2d81dc87a30f: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:31:14.4148648Z 014185d6430c: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:31:14.4149039Z fad42dbba518: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:31:14.4149824Z e4a7a16463c4: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:31:14.4150203Z dfc6865a7102: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:31:14.4150844Z 74c334d7792a: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:31:14.4151122Z cc42246e0a23: Waiting
e2e-tests	Initialize containers	2025-09-24T05:31:14.4151344Z 7b0faefcf7ad: Waiting
e2e-tests	Initialize containers	2025-09-24T05:31:14.4151526Z 7bf3457011a0: Waiting
e2e-tests	Initialize containers	2025-09-24T05:31:14.4151699Z c874057d7395: Waiting
e2e-tests	Initialize containers	2025-09-24T05:31:14.4151859Z e4a7a16463c4: Waiting
e2e-tests	Initialize containers	2025-09-24T05:31:14.4152032Z 7f1bdd7d8f57: Waiting
e2e-tests	Initialize containers	2025-09-24T05:31:14.4152194Z dfc6865a7102: Waiting
e2e-tests	Initialize containers	2025-09-24T05:31:14.4152361Z 2d81dc87a30f: Waiting
e2e-tests	Initialize containers	2025-09-24T05:31:14.4152523Z 74c334d7792a: Waiting
e2e-tests	Initialize containers	2025-09-24T05:31:14.4152688Z 014185d6430c: Waiting
e2e-tests	Initialize containers	2025-09-24T05:31:14.4152853Z fad42dbba518: Waiting
e2e-tests	Initialize containers	2025-09-24T05:31:14.5494294Z 951a19831fc8: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:14.5496270Z 951a19831fc8: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:14.5674971Z 2f21900bfd71: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:14.5675550Z 2f21900bfd71: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:14.6930314Z cc42246e0a23: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:14.6933068Z cc42246e0a23: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:14.7001490Z ce1261c6d567: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:14.7335027Z 7b0faefcf7ad: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:14.8079180Z 7bf3457011a0: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:14.8081008Z 7bf3457011a0: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:14.8253561Z c874057d7395: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:14.8255115Z c874057d7395: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:14.8428437Z 7f1bdd7d8f57: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:14.8429009Z 7f1bdd7d8f57: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:14.9416450Z 014185d6430c: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:14.9706182Z fad42dbba518: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:14.9707165Z fad42dbba518: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:15.0582533Z e4a7a16463c4: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:15.0586299Z e4a7a16463c4: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:15.0867491Z dfc6865a7102: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:15.1762900Z 74c334d7792a: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:15.6322263Z 2d81dc87a30f: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:15.7693542Z 2d81dc87a30f: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:15.7694048Z ce1261c6d567: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:16.0203614Z 951a19831fc8: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:16.2173210Z 2f21900bfd71: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:16.2580968Z cc42246e0a23: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:16.5609013Z 7b0faefcf7ad: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:16.6339153Z 7bf3457011a0: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:16.6444271Z c874057d7395: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:16.6543477Z 7f1bdd7d8f57: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:19.6073814Z 2d81dc87a30f: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:19.6247196Z 014185d6430c: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:19.6363178Z fad42dbba518: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:19.6471454Z e4a7a16463c4: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:19.6576253Z dfc6865a7102: Pull complete
```

### Tail (last 80 non-noise lines)
```
e2e-tests	Stop containers	﻿2025-09-24T06:00:16.8409163Z Print service container logs: 9f801676cc3543b7b153fd17034cbfcc_postgres15_440471
e2e-tests	Stop containers	2025-09-24T06:00:16.8414156Z ##[command]/usr/bin/docker logs --details 07a555df297cf3a108ca0e06fd32ad14df2bb960f322d7f85454be18dc572aaf
e2e-tests	Stop containers	2025-09-24T06:00:16.8535352Z  initdb: warning: enabling "trust" authentication for local connections
e2e-tests	Stop containers	2025-09-24T06:00:16.8535960Z  The files belonging to this database system will be owned by user "postgres".
e2e-tests	Stop containers	2025-09-24T06:00:16.8538074Z  initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
e2e-tests	Stop containers	2025-09-24T06:00:16.8539473Z  2025-09-24 05:31:21.801 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e-tests	Stop containers	2025-09-24T06:00:16.8540675Z  2025-09-24 05:31:21.801 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
e2e-tests	Stop containers	2025-09-24T06:00:16.8541133Z  2025-09-24 05:31:21.801 UTC [1] LOG:  listening on IPv6 address "::", port 5432
e2e-tests	Stop containers	2025-09-24T06:00:16.8541621Z  2025-09-24 05:31:21.802 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e-tests	Stop containers	2025-09-24T06:00:16.8542109Z  2025-09-24 05:31:21.805 UTC [64] LOG:  database system was shut down at 2025-09-24 05:31:21 UTC
e2e-tests	Stop containers	2025-09-24T06:00:16.8542546Z  2025-09-24 05:31:21.809 UTC [1] LOG:  database system is ready to accept connections
e2e-tests	Stop containers	2025-09-24T06:00:16.8542932Z  2025-09-24 05:36:21.899 UTC [62] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-24T06:00:16.8543722Z  2025-09-24 05:36:54.176 UTC [62] LOG:  checkpoint complete: wrote 326 buffers (2.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=32.274 s, sync=0.002 s, total=32.278 s; sync files=220, longest=0.001 s, average=0.001 s; distance=1521 kB, estimate=1521 kB
e2e-tests	Stop containers	2025-09-24T06:00:16.8544506Z  2025-09-24 05:41:21.184 UTC [62] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-24T06:00:16.8545519Z  2025-09-24 05:41:21.989 UTC [62] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.803 s, sync=0.001 s, total=0.805 s; sync files=9, longest=0.001 s, average=0.001 s; distance=9 kB, estimate=1370 kB
e2e-tests	Stop containers	2025-09-24T06:00:16.8546271Z  2025-09-24 05:46:22.031 UTC [62] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-24T06:00:16.8548341Z  2025-09-24 05:46:22.837 UTC [62] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.803 s, sync=0.001 s, total=0.806 s; sync files=9, longest=0.001 s, average=0.001 s; distance=7 kB, estimate=1234 kB
e2e-tests	Stop containers	2025-09-24T06:00:16.8549884Z  2025-09-24 05:51:22.916 UTC [62] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-24T06:00:16.8551068Z  2025-09-24 05:51:23.720 UTC [62] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.803 s, sync=0.001 s, total=0.805 s; sync files=9, longest=0.001 s, average=0.001 s; distance=12 kB, estimate=1112 kB
e2e-tests	Stop containers	2025-09-24T06:00:16.8552068Z  2025-09-24 05:56:22.786 UTC [62] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-24T06:00:16.8553029Z  2025-09-24 05:56:23.591 UTC [62] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.803 s, sync=0.001 s, total=0.805 s; sync files=9, longest=0.001 s, average=0.001 s; distance=11 kB, estimate=1002 kB
e2e-tests	Stop containers	2025-09-24T06:00:16.8553966Z  This user must also own the server process.
e2e-tests	Stop containers	2025-09-24T06:00:16.8554252Z  
e2e-tests	Stop containers	2025-09-24T06:00:16.8554580Z  The database cluster will be initialized with locale "en_US.utf8".
e2e-tests	Stop containers	2025-09-24T06:00:16.8555078Z  The default database encoding has accordingly been set to "UTF8".
e2e-tests	Stop containers	2025-09-24T06:00:16.8555553Z  The default text search configuration will be set to "english".
e2e-tests	Stop containers	2025-09-24T06:00:16.8555908Z  
e2e-tests	Stop containers	2025-09-24T06:00:16.8556108Z  Data page checksums are disabled.
e2e-tests	Stop containers	2025-09-24T06:00:16.8556359Z  
e2e-tests	Stop containers	2025-09-24T06:00:16.8556670Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
e2e-tests	Stop containers	2025-09-24T06:00:16.8557086Z  creating subdirectories ... ok
e2e-tests	Stop containers	2025-09-24T06:00:16.8557431Z  selecting dynamic shared memory implementation ... posix
e2e-tests	Stop containers	2025-09-24T06:00:16.8557795Z  selecting default max_connections ... 100
e2e-tests	Stop containers	2025-09-24T06:00:16.8558343Z  selecting default shared_buffers ... 128MB
e2e-tests	Stop containers	2025-09-24T06:00:16.8558650Z  selecting default time zone ... Etc/UTC
e2e-tests	Stop containers	2025-09-24T06:00:16.8558947Z  creating configuration files ... ok
e2e-tests	Stop containers	2025-09-24T06:00:16.8559239Z  running bootstrap script ... ok
e2e-tests	Stop containers	2025-09-24T06:00:16.8559559Z  performing post-bootstrap initialization ... ok
e2e-tests	Stop containers	2025-09-24T06:00:16.8559882Z  syncing data to disk ... ok
e2e-tests	Stop containers	2025-09-24T06:00:16.8560116Z  
e2e-tests	Stop containers	2025-09-24T06:00:16.8560281Z  
e2e-tests	Stop containers	2025-09-24T06:00:16.8560696Z  Success. You can now start the database server using:
e2e-tests	Stop containers	2025-09-24T06:00:16.8561011Z  
e2e-tests	Stop containers	2025-09-24T06:00:16.8561254Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
e2e-tests	Stop containers	2025-09-24T06:00:16.8561550Z  
e2e-tests	Stop containers	2025-09-24T06:00:16.8562140Z  waiting for server to start....2025-09-24 05:31:21.494 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e-tests	Stop containers	2025-09-24T06:00:16.8562944Z  2025-09-24 05:31:21.494 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e-tests	Stop containers	2025-09-24T06:00:16.8563482Z  2025-09-24 05:31:21.498 UTC [51] LOG:  database system was shut down at 2025-09-24 05:31:21 UTC
e2e-tests	Stop containers	2025-09-24T06:00:16.8563975Z  2025-09-24 05:31:21.502 UTC [48] LOG:  database system is ready to accept connections
e2e-tests	Stop containers	2025-09-24T06:00:16.8564334Z   done
e2e-tests	Stop containers	2025-09-24T06:00:16.8564520Z  server started
e2e-tests	Stop containers	2025-09-24T06:00:16.8564722Z  CREATE DATABASE
e2e-tests	Stop containers	2025-09-24T06:00:16.8564912Z  
e2e-tests	Stop containers	2025-09-24T06:00:16.8565073Z  
e2e-tests	Stop containers	2025-09-24T06:00:16.8565405Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
e2e-tests	Stop containers	2025-09-24T06:00:16.8565798Z  
e2e-tests	Stop containers	2025-09-24T06:00:16.8566047Z  2025-09-24 05:31:21.682 UTC [48] LOG:  received fast shutdown request
e2e-tests	Stop containers	2025-09-24T06:00:16.8566550Z  waiting for server to shut down....2025-09-24 05:31:21.682 UTC [48] LOG:  aborting any active transactions
e2e-tests	Stop containers	2025-09-24T06:00:16.8567355Z  2025-09-24 05:31:21.684 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
e2e-tests	Stop containers	2025-09-24T06:00:16.8567870Z  2025-09-24 05:31:21.684 UTC [49] LOG:  shutting down
e2e-tests	Stop containers	2025-09-24T06:00:16.8568247Z  2025-09-24 05:31:21.685 UTC [49] LOG:  checkpoint starting: shutdown immediate
e2e-tests	Stop containers	2025-09-24T06:00:16.8569123Z  2025-09-24 05:31:21.701 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.013 s, sync=0.002 s, total=0.017 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
e2e-tests	Stop containers	2025-09-24T06:00:16.8569977Z  2025-09-24 05:31:21.707 UTC [48] LOG:  database system is shut down
e2e-tests	Stop containers	2025-09-24T06:00:16.8570286Z   done
e2e-tests	Stop containers	2025-09-24T06:00:16.8570465Z  server stopped
e2e-tests	Stop containers	2025-09-24T06:00:16.8570822Z  
e2e-tests	Stop containers	2025-09-24T06:00:16.8571068Z  PostgreSQL init process complete; ready for start up.
e2e-tests	Stop containers	2025-09-24T06:00:16.8571371Z  
e2e-tests	Stop containers	2025-09-24T06:00:16.8577271Z Stop and remove container: 9f801676cc3543b7b153fd17034cbfcc_postgres15_440471
e2e-tests	Stop containers	2025-09-24T06:00:16.8582520Z ##[command]/usr/bin/docker rm --force 07a555df297cf3a108ca0e06fd32ad14df2bb960f322d7f85454be18dc572aaf
e2e-tests	Stop containers	2025-09-24T06:00:16.9780144Z 07a555df297cf3a108ca0e06fd32ad14df2bb960f322d7f85454be18dc572aaf
e2e-tests	Stop containers	2025-09-24T06:00:16.9809832Z Remove container network: github_network_abfcba7d254e4f17970699ea23d51ad7
e2e-tests	Stop containers	2025-09-24T06:00:16.9814353Z ##[command]/usr/bin/docker network rm github_network_abfcba7d254e4f17970699ea23d51ad7
e2e-tests	Stop containers	2025-09-24T06:00:17.1136530Z github_network_abfcba7d254e4f17970699ea23d51ad7
e2e-tests	Complete job	﻿2025-09-24T06:00:17.1192445Z Cleaning up orphan processes
e2e-tests	Complete job	2025-09-24T06:00:17.1477066Z Terminate orphan process: pid (3298) (php)
e2e-tests	Complete job	2025-09-24T06:00:17.1493519Z Terminate orphan process: pid (3301) (php8.2)
e2e-tests	Complete job	2025-09-24T06:00:17.1610334Z Terminate orphan process: pid (4788) (npm start)
e2e-tests	Complete job	2025-09-24T06:00:17.1645821Z Terminate orphan process: pid (4800) (sh)
e2e-tests	Complete job	2025-09-24T06:00:17.1669867Z Terminate orphan process: pid (4801) (next-server (v15.5.0))
```

## e2e-tests
- detailsUrl: https://github.com/lomendor/Project-Dixis/actions/runs/17967292597/job/51102273490

### Head (first 80 non-noise lines)
```
e2e-tests	Initialize containers	﻿2025-09-24T05:30:57.7471590Z ##[group]Checking docker version
e2e-tests	Initialize containers	2025-09-24T05:30:57.7485056Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
e2e-tests	Initialize containers	2025-09-24T05:30:59.0852434Z '1.48'
e2e-tests	Initialize containers	2025-09-24T05:30:59.0863980Z Docker daemon API version: '1.48'
e2e-tests	Initialize containers	2025-09-24T05:30:59.0864469Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
e2e-tests	Initialize containers	2025-09-24T05:30:59.1017885Z '1.48'
e2e-tests	Initialize containers	2025-09-24T05:30:59.1031127Z Docker client API version: '1.48'
e2e-tests	Initialize containers	2025-09-24T05:30:59.1035911Z ##[endgroup]
e2e-tests	Initialize containers	2025-09-24T05:30:59.1038912Z ##[group]Clean up resources from previous jobs
e2e-tests	Initialize containers	2025-09-24T05:30:59.1044012Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=84ccd8"
e2e-tests	Initialize containers	2025-09-24T05:30:59.1323769Z ##[command]/usr/bin/docker network prune --force --filter "label=84ccd8"
e2e-tests	Initialize containers	2025-09-24T05:30:59.1443250Z ##[endgroup]
e2e-tests	Initialize containers	2025-09-24T05:30:59.1443535Z ##[group]Create local container network
e2e-tests	Initialize containers	2025-09-24T05:30:59.1452675Z ##[command]/usr/bin/docker network create --label 84ccd8 github_network_2988cceab7b64586b1539655ddca153a
e2e-tests	Initialize containers	2025-09-24T05:30:59.2037348Z a6976dd06d91f28878a59b63495c585ca3979824d0e728ada9cee6fed6a3819d
e2e-tests	Initialize containers	2025-09-24T05:30:59.2059518Z ##[endgroup]
e2e-tests	Initialize containers	2025-09-24T05:30:59.2095364Z ##[group]Starting postgres service container
e2e-tests	Initialize containers	2025-09-24T05:30:59.2123394Z ##[command]/usr/bin/docker pull postgres:15
e2e-tests	Initialize containers	2025-09-24T05:30:59.6988629Z 15: Pulling from library/postgres
e2e-tests	Initialize containers	2025-09-24T05:30:59.8220973Z ce1261c6d567: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:30:59.8221536Z 951a19831fc8: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:30:59.8221927Z 2f21900bfd71: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:30:59.8222273Z cc42246e0a23: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:30:59.8222626Z 7b0faefcf7ad: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:30:59.8223011Z 7bf3457011a0: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:30:59.8223271Z c874057d7395: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:30:59.8223625Z 7f1bdd7d8f57: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:30:59.8223865Z 2d81dc87a30f: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:30:59.8224088Z 014185d6430c: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:30:59.8224301Z fad42dbba518: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:30:59.8225104Z e4a7a16463c4: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:30:59.8225517Z dfc6865a7102: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:30:59.8225819Z 74c334d7792a: Pulling fs layer
e2e-tests	Initialize containers	2025-09-24T05:30:59.8226536Z cc42246e0a23: Waiting
e2e-tests	Initialize containers	2025-09-24T05:30:59.8227022Z 7b0faefcf7ad: Waiting
e2e-tests	Initialize containers	2025-09-24T05:30:59.8227240Z 014185d6430c: Waiting
e2e-tests	Initialize containers	2025-09-24T05:30:59.8227417Z fad42dbba518: Waiting
e2e-tests	Initialize containers	2025-09-24T05:30:59.8227582Z e4a7a16463c4: Waiting
e2e-tests	Initialize containers	2025-09-24T05:30:59.8227747Z 7bf3457011a0: Waiting
e2e-tests	Initialize containers	2025-09-24T05:30:59.8227964Z c874057d7395: Waiting
e2e-tests	Initialize containers	2025-09-24T05:30:59.8228174Z 7f1bdd7d8f57: Waiting
e2e-tests	Initialize containers	2025-09-24T05:30:59.8228350Z 2d81dc87a30f: Waiting
e2e-tests	Initialize containers	2025-09-24T05:30:59.8228511Z 74c334d7792a: Waiting
e2e-tests	Initialize containers	2025-09-24T05:30:59.8228679Z dfc6865a7102: Waiting
e2e-tests	Initialize containers	2025-09-24T05:30:59.9378466Z 951a19831fc8: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:30:59.9379001Z 951a19831fc8: Download complete
e2e-tests	Initialize containers	2025-09-24T05:30:59.9704065Z 2f21900bfd71: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:30:59.9704662Z 2f21900bfd71: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:00.0777263Z cc42246e0a23: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:00.0777891Z cc42246e0a23: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:00.1237277Z 7b0faefcf7ad: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:00.1237817Z 7b0faefcf7ad: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:00.1850629Z 7bf3457011a0: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:00.2244119Z c874057d7395: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:00.2661935Z ce1261c6d567: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:00.2662459Z ce1261c6d567: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:00.2895219Z 7f1bdd7d8f57: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:00.2895935Z 7f1bdd7d8f57: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:00.4017267Z 014185d6430c: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:00.4149514Z fad42dbba518: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:00.4150159Z fad42dbba518: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:00.5272923Z e4a7a16463c4: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:00.5273432Z e4a7a16463c4: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:00.5417388Z dfc6865a7102: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:00.5417875Z dfc6865a7102: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:00.6499500Z 74c334d7792a: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:00.6501426Z 74c334d7792a: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:01.0354458Z 2d81dc87a30f: Verifying Checksum
e2e-tests	Initialize containers	2025-09-24T05:31:01.0355027Z 2d81dc87a30f: Download complete
e2e-tests	Initialize containers	2025-09-24T05:31:01.3103497Z ce1261c6d567: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:02.1586181Z 951a19831fc8: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:02.3310979Z 2f21900bfd71: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:02.3774952Z cc42246e0a23: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:02.6795414Z 7b0faefcf7ad: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:02.7683202Z 7bf3457011a0: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:02.7786530Z c874057d7395: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:02.7896098Z 7f1bdd7d8f57: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:05.6547296Z 2d81dc87a30f: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:05.6701313Z 014185d6430c: Pull complete
e2e-tests	Initialize containers	2025-09-24T05:31:05.6833054Z fad42dbba518: Pull complete
```

### Tail (last 80 non-noise lines)
```
e2e-tests	Stop containers	﻿2025-09-24T05:59:44.7059605Z Print service container logs: 2c7c2e8794a54ab2a0c35573fdc9d24a_postgres15_c06e7d
e2e-tests	Stop containers	2025-09-24T05:59:44.7065377Z ##[command]/usr/bin/docker logs --details ca70625e3ca71c53dc75c91804296aff94f29fa43969daad8028ff96949f8ae9
e2e-tests	Stop containers	2025-09-24T05:59:44.7184466Z  The files belonging to this database system will be owned by user "postgres".
e2e-tests	Stop containers	2025-09-24T05:59:44.7185453Z  This user must also own the server process.
e2e-tests	Stop containers	2025-09-24T05:59:44.7186927Z  
e2e-tests	Stop containers	2025-09-24T05:59:44.7187436Z  The database cluster will be initialized with locale "en_US.utf8".
e2e-tests	Stop containers	2025-09-24T05:59:44.7188191Z  The default database encoding has accordingly been set to "UTF8".
e2e-tests	Stop containers	2025-09-24T05:59:44.7188786Z  The default text search configuration will be set to "english".
e2e-tests	Stop containers	2025-09-24T05:59:44.7189123Z  
e2e-tests	Stop containers	2025-09-24T05:59:44.7189320Z  Data page checksums are disabled.
e2e-tests	Stop containers	2025-09-24T05:59:44.7189571Z  
e2e-tests	Stop containers	2025-09-24T05:59:44.7189866Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
e2e-tests	Stop containers	2025-09-24T05:59:44.7190463Z  creating subdirectories ... ok
e2e-tests	Stop containers	2025-09-24T05:59:44.7190838Z  selecting dynamic shared memory implementation ... posix
e2e-tests	Stop containers	2025-09-24T05:59:44.7191196Z  selecting default max_connections ... 100
e2e-tests	Stop containers	2025-09-24T05:59:44.7191494Z  selecting default shared_buffers ... 128MB
e2e-tests	Stop containers	2025-09-24T05:59:44.7191777Z  selecting default time zone ... Etc/UTC
e2e-tests	Stop containers	2025-09-24T05:59:44.7192055Z  creating configuration files ... ok
e2e-tests	Stop containers	2025-09-24T05:59:44.7192327Z  running bootstrap script ... ok
e2e-tests	Stop containers	2025-09-24T05:59:44.7192629Z  performing post-bootstrap initialization ... ok
e2e-tests	Stop containers	2025-09-24T05:59:44.7192935Z  syncing data to disk ... ok
e2e-tests	Stop containers	2025-09-24T05:59:44.7193164Z  
e2e-tests	Stop containers	2025-09-24T05:59:44.7193328Z  
e2e-tests	Stop containers	2025-09-24T05:59:44.7193553Z  Success. You can now start the database server using:
e2e-tests	Stop containers	2025-09-24T05:59:44.7193847Z  
e2e-tests	Stop containers	2025-09-24T05:59:44.7194079Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
e2e-tests	Stop containers	2025-09-24T05:59:44.7194369Z  
e2e-tests	Stop containers	2025-09-24T05:59:44.7194953Z  waiting for server to start....2025-09-24 05:31:07.440 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e-tests	Stop containers	2025-09-24T05:59:44.7195767Z  2025-09-24 05:31:07.441 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e-tests	Stop containers	2025-09-24T05:59:44.7196531Z  2025-09-24 05:31:07.443 UTC [51] LOG:  database system was shut down at 2025-09-24 05:31:07 UTC
e2e-tests	Stop containers	2025-09-24T05:59:44.7197025Z  2025-09-24 05:31:07.447 UTC [48] LOG:  database system is ready to accept connections
e2e-tests	Stop containers	2025-09-24T05:59:44.7197384Z   done
e2e-tests	Stop containers	2025-09-24T05:59:44.7197561Z  server started
e2e-tests	Stop containers	2025-09-24T05:59:44.7197757Z  CREATE DATABASE
e2e-tests	Stop containers	2025-09-24T05:59:44.7197944Z  
e2e-tests	Stop containers	2025-09-24T05:59:44.7198105Z  
e2e-tests	Stop containers	2025-09-24T05:59:44.7198416Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
e2e-tests	Stop containers	2025-09-24T05:59:44.7199424Z  
e2e-tests	Stop containers	2025-09-24T05:59:44.7199830Z  2025-09-24 05:31:07.626 UTC [48] LOG:  received fast shutdown request
e2e-tests	Stop containers	2025-09-24T05:59:44.7200787Z  waiting for server to shut down....2025-09-24 05:31:07.626 UTC [48] LOG:  aborting any active transactions
e2e-tests	Stop containers	2025-09-24T05:59:44.7201779Z  2025-09-24 05:31:07.628 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
e2e-tests	Stop containers	2025-09-24T05:59:44.7202267Z  2025-09-24 05:31:07.628 UTC [49] LOG:  shutting down
e2e-tests	Stop containers	2025-09-24T05:59:44.7202611Z  2025-09-24 05:31:07.629 UTC [49] LOG:  checkpoint starting: shutdown immediate
e2e-tests	Stop containers	2025-09-24T05:59:44.7203425Z  2025-09-24 05:31:07.646 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.003 s, total=0.018 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
e2e-tests	Stop containers	2025-09-24T05:59:44.7204219Z  2025-09-24 05:31:07.653 UTC [48] LOG:  database system is shut down
e2e-tests	Stop containers	2025-09-24T05:59:44.7204506Z   done
e2e-tests	Stop containers	2025-09-24T05:59:44.7204680Z  server stopped
e2e-tests	Stop containers	2025-09-24T05:59:44.7204860Z  
e2e-tests	Stop containers	2025-09-24T05:59:44.7205079Z  PostgreSQL init process complete; ready for start up.
e2e-tests	Stop containers	2025-09-24T05:59:44.7205358Z  
e2e-tests	Stop containers	2025-09-24T05:59:44.7206257Z  initdb: warning: enabling "trust" authentication for local connections
e2e-tests	Stop containers	2025-09-24T05:59:44.7207131Z  initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
e2e-tests	Stop containers	2025-09-24T05:59:44.7207948Z  2025-09-24 05:31:07.745 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e-tests	Stop containers	2025-09-24T05:59:44.7208564Z  2025-09-24 05:31:07.745 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
e2e-tests	Stop containers	2025-09-24T05:59:44.7208979Z  2025-09-24 05:31:07.745 UTC [1] LOG:  listening on IPv6 address "::", port 5432
e2e-tests	Stop containers	2025-09-24T05:59:44.7209433Z  2025-09-24 05:31:07.746 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e-tests	Stop containers	2025-09-24T05:59:44.7209925Z  2025-09-24 05:31:07.750 UTC [64] LOG:  database system was shut down at 2025-09-24 05:31:07 UTC
e2e-tests	Stop containers	2025-09-24T05:59:44.7210583Z  2025-09-24 05:31:07.753 UTC [1] LOG:  database system is ready to accept connections
e2e-tests	Stop containers	2025-09-24T05:59:44.7210981Z  2025-09-24 05:36:07.775 UTC [62] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-24T05:59:44.7211763Z  2025-09-24 05:36:40.142 UTC [62] LOG:  checkpoint complete: wrote 326 buffers (2.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=32.363 s, sync=0.002 s, total=32.367 s; sync files=220, longest=0.001 s, average=0.001 s; distance=1521 kB, estimate=1521 kB
e2e-tests	Stop containers	2025-09-24T05:59:44.7212534Z  2025-09-24 05:41:07.144 UTC [62] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-24T05:59:44.7213279Z  2025-09-24 05:41:07.950 UTC [62] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.802 s, sync=0.001 s, total=0.806 s; sync files=9, longest=0.001 s, average=0.001 s; distance=6 kB, estimate=1369 kB
e2e-tests	Stop containers	2025-09-24T05:59:44.7214022Z  2025-09-24 05:46:08.050 UTC [62] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-24T05:59:44.7214754Z  2025-09-24 05:46:08.855 UTC [62] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.802 s, sync=0.002 s, total=0.806 s; sync files=9, longest=0.001 s, average=0.001 s; distance=5 kB, estimate=1233 kB
e2e-tests	Stop containers	2025-09-24T05:59:44.7215493Z  2025-09-24 05:51:08.956 UTC [62] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-24T05:59:44.7216375Z  2025-09-24 05:51:09.760 UTC [62] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.802 s, sync=0.001 s, total=0.805 s; sync files=9, longest=0.001 s, average=0.001 s; distance=10 kB, estimate=1111 kB
e2e-tests	Stop containers	2025-09-24T05:59:44.7217127Z  2025-09-24 05:56:08.860 UTC [62] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-24T05:59:44.7217860Z  2025-09-24 05:56:09.664 UTC [62] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.802 s, sync=0.001 s, total=0.805 s; sync files=9, longest=0.001 s, average=0.001 s; distance=9 kB, estimate=1001 kB
e2e-tests	Stop containers	2025-09-24T05:59:44.7224029Z Stop and remove container: 2c7c2e8794a54ab2a0c35573fdc9d24a_postgres15_c06e7d
e2e-tests	Stop containers	2025-09-24T05:59:44.7228527Z ##[command]/usr/bin/docker rm --force ca70625e3ca71c53dc75c91804296aff94f29fa43969daad8028ff96949f8ae9
e2e-tests	Stop containers	2025-09-24T05:59:44.8545420Z ca70625e3ca71c53dc75c91804296aff94f29fa43969daad8028ff96949f8ae9
e2e-tests	Stop containers	2025-09-24T05:59:44.8577941Z Remove container network: github_network_2988cceab7b64586b1539655ddca153a
e2e-tests	Stop containers	2025-09-24T05:59:44.8582404Z ##[command]/usr/bin/docker network rm github_network_2988cceab7b64586b1539655ddca153a
e2e-tests	Stop containers	2025-09-24T05:59:44.9888269Z github_network_2988cceab7b64586b1539655ddca153a
e2e-tests	Complete job	﻿2025-09-24T05:59:44.9945189Z Cleaning up orphan processes
e2e-tests	Complete job	2025-09-24T05:59:45.0215664Z Terminate orphan process: pid (3118) (php)
e2e-tests	Complete job	2025-09-24T05:59:45.0232331Z Terminate orphan process: pid (3121) (php8.2)
e2e-tests	Complete job	2025-09-24T05:59:45.0346022Z Terminate orphan process: pid (4566) (npm start)
e2e-tests	Complete job	2025-09-24T05:59:45.0369306Z Terminate orphan process: pid (4577) (sh)
e2e-tests	Complete job	2025-09-24T05:59:45.0397230Z Terminate orphan process: pid (4578) (next-server (v15.5.0))
```


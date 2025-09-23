# PR #222 — CI Snapshot (2025-09-23 08:37Z)

## Checks
- e2e — state: SKIPPED (https://github.com/lomendor/Project-Dixis/actions/runs/17940095339/job/51014743694) [wf: CI Pipeline]
- e2e-tests — state: IN_PROGRESS (https://github.com/lomendor/Project-Dixis/actions/runs/17940095204/job/51014569635) [wf: frontend-ci]
- e2e-tests — state: IN_PROGRESS (https://github.com/lomendor/Project-Dixis/actions/runs/17940095366/job/51014568759) [wf: frontend-ci]
- frontend — state: FAILURE (https://github.com/lomendor/Project-Dixis/actions/runs/17940095339/job/51014569111) [wf: CI Pipeline]
- frontend-tests — state: SUCCESS (https://github.com/lomendor/Project-Dixis/actions/runs/17940095204/job/51014493549) [wf: frontend-ci]
- frontend-tests — state: SUCCESS (https://github.com/lomendor/Project-Dixis/actions/runs/17940095366/job/51014492483) [wf: frontend-ci]
- dependabot-smoke — state: SKIPPED (https://github.com/lomendor/Project-Dixis/actions/runs/17940095366/job/51014446436) [wf: frontend-ci]
- type-check — state: SUCCESS (https://github.com/lomendor/Project-Dixis/actions/runs/17940095204/job/51014441969) [wf: frontend-ci]
- type-check — state: SUCCESS (https://github.com/lomendor/Project-Dixis/actions/runs/17940095366/job/51014439689) [wf: frontend-ci]
- lighthouse — state: IN_PROGRESS (https://github.com/lomendor/Project-Dixis/actions/runs/17940095343/job/51014440313) [wf: Lighthouse CI]
- dependabot-smoke — state: SKIPPED (https://github.com/lomendor/Project-Dixis/actions/runs/17940095204/job/51014442077) [wf: frontend-ci]
- dependabot-smoke — state: SKIPPED (https://github.com/lomendor/Project-Dixis/actions/runs/17940095343/job/51014440289) [wf: Lighthouse CI]
- backend — state: SUCCESS (https://github.com/lomendor/Project-Dixis/actions/runs/17940095339/job/51014417232) [wf: CI Pipeline]
- PR Hygiene Check — state: FAILURE (https://github.com/lomendor/Project-Dixis/actions/runs/17940095386/job/51014417473) [wf: Pull Request Quality Gates]
- danger — state: SUCCESS (https://github.com/lomendor/Project-Dixis/actions/runs/17940095378/job/51014417367) [wf: DangerJS Gatekeeper]
- Quality Assurance — state: FAILURE (https://github.com/lomendor/Project-Dixis/actions/runs/17940095386/job/51014417469) [wf: Pull Request Quality Gates]
- Smoke Tests — state: SUCCESS (https://github.com/lomendor/Project-Dixis/actions/runs/17940095386/job/51014417479) [wf: Pull Request Quality Gates]
- danger — state: SUCCESS (https://github.com/lomendor/Project-Dixis/actions/runs/17940095403/job/51014417417) [wf: Danger PR Gatekeeper]
- dependabot-smoke — state: SKIPPED (https://github.com/lomendor/Project-Dixis/actions/runs/17940095339/job/51014417272) [wf: CI Pipeline]

## Focus
First non-success: name=e2e, state=SKIPPED, link=https://github.com/lomendor/Project-Dixis/actions/runs/17940095339/job/51014743694

## Logs
**Run URL:** https://github.com/lomendor/Project-Dixis/actions/runs/17940095339/job/51014743694

<details><summary>Head (first 80)</summary>

```
backend	Set up job	﻿2025-09-23T08:25:16.1855619Z Current runner version: '2.328.0'
backend	Set up job	2025-09-23T08:25:16.1878704Z ##[group]Runner Image Provisioner
backend	Set up job	2025-09-23T08:25:16.1879521Z Hosted Compute Agent
backend	Set up job	2025-09-23T08:25:16.1880016Z Version: 20250829.383
backend	Set up job	2025-09-23T08:25:16.1880759Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
backend	Set up job	2025-09-23T08:25:16.1881410Z Build Date: 2025-08-29T13:48:48Z
backend	Set up job	2025-09-23T08:25:16.1881977Z ##[endgroup]
backend	Set up job	2025-09-23T08:25:16.1882559Z ##[group]Operating System
backend	Set up job	2025-09-23T08:25:16.1883117Z Ubuntu
backend	Set up job	2025-09-23T08:25:16.1883574Z 24.04.3
backend	Set up job	2025-09-23T08:25:16.1884227Z LTS
backend	Set up job	2025-09-23T08:25:16.1884674Z ##[endgroup]
backend	Set up job	2025-09-23T08:25:16.1885122Z ##[group]Runner Image
backend	Set up job	2025-09-23T08:25:16.1885916Z Image: ubuntu-24.04
backend	Set up job	2025-09-23T08:25:16.1886387Z Version: 20250907.24.1
backend	Set up job	2025-09-23T08:25:16.1887407Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
backend	Set up job	2025-09-23T08:25:16.1888771Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
backend	Set up job	2025-09-23T08:25:16.1889885Z ##[endgroup]
backend	Set up job	2025-09-23T08:25:16.1891029Z ##[group]GITHUB_TOKEN Permissions
backend	Set up job	2025-09-23T08:25:16.1892769Z Contents: read
backend	Set up job	2025-09-23T08:25:16.1893405Z Metadata: read
backend	Set up job	2025-09-23T08:25:16.1893888Z Packages: read
backend	Set up job	2025-09-23T08:25:16.1894379Z ##[endgroup]
backend	Set up job	2025-09-23T08:25:16.1897372Z Secret source: Actions
backend	Set up job	2025-09-23T08:25:16.1898062Z Prepare workflow directory
backend	Set up job	2025-09-23T08:25:16.2314564Z Prepare all required actions
backend	Set up job	2025-09-23T08:25:16.2369927Z Getting action download info
backend	Set up job	2025-09-23T08:25:16.6792831Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
backend	Set up job	2025-09-23T08:25:16.8608098Z Download action repository 'shivammathur/setup-php@v2' (SHA:bf6b4fbd49ca58e4608c9c89fba0b8d90bd2a39f)
backend	Set up job	2025-09-23T08:25:17.3860711Z Complete job name: backend
backend	Initialize containers	﻿2025-09-23T08:25:17.4361909Z ##[group]Checking docker version
backend	Initialize containers	2025-09-23T08:25:17.4374824Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
backend	Initialize containers	2025-09-23T08:25:17.5353204Z '1.48'
backend	Initialize containers	2025-09-23T08:25:17.5366285Z Docker daemon API version: '1.48'
backend	Initialize containers	2025-09-23T08:25:17.5367098Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
backend	Initialize containers	2025-09-23T08:25:17.5580743Z '1.48'
backend	Initialize containers	2025-09-23T08:25:17.5594448Z Docker client API version: '1.48'
backend	Initialize containers	2025-09-23T08:25:17.5600349Z ##[endgroup]
backend	Initialize containers	2025-09-23T08:25:17.5603755Z ##[group]Clean up resources from previous jobs
backend	Initialize containers	2025-09-23T08:25:17.5608933Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=dce002"
backend	Initialize containers	2025-09-23T08:25:17.5747282Z ##[command]/usr/bin/docker network prune --force --filter "label=dce002"
backend	Initialize containers	2025-09-23T08:25:17.5878118Z ##[endgroup]
backend	Initialize containers	2025-09-23T08:25:17.5878645Z ##[group]Create local container network
backend	Initialize containers	2025-09-23T08:25:17.5888903Z ##[command]/usr/bin/docker network create --label dce002 github_network_6ed51ac189e64391a8e02d4a9fa0825a
backend	Initialize containers	2025-09-23T08:25:17.6398615Z 0d8d548a885c0e7d4e4cef0d035632b75eff29a7c9e989eb6fcdf6095d5ede92
backend	Initialize containers	2025-09-23T08:25:17.6417269Z ##[endgroup]
backend	Initialize containers	2025-09-23T08:25:17.6441013Z ##[group]Starting postgres service container
backend	Initialize containers	2025-09-23T08:25:17.6460196Z ##[command]/usr/bin/docker pull postgres:15
backend	Initialize containers	2025-09-23T08:25:18.7023610Z 15: Pulling from library/postgres
backend	Initialize containers	2025-09-23T08:25:18.9783431Z ce1261c6d567: Pulling fs layer
backend	Initialize containers	2025-09-23T08:25:18.9784087Z 80ed16669c95: Pulling fs layer
backend	Initialize containers	2025-09-23T08:25:18.9784558Z 4e5806601837: Pulling fs layer
backend	Initialize containers	2025-09-23T08:25:18.9785015Z b18445125df5: Pulling fs layer
backend	Initialize containers	2025-09-23T08:25:18.9785686Z 874a3ca0fb79: Pulling fs layer
backend	Initialize containers	2025-09-23T08:25:18.9785997Z 38a0056e8c05: Pulling fs layer
backend	Initialize containers	2025-09-23T08:25:18.9786351Z cb4494753109: Pulling fs layer
backend	Initialize containers	2025-09-23T08:25:18.9786830Z 9286f415f93a: Pulling fs layer
backend	Initialize containers	2025-09-23T08:25:18.9787278Z 60570350e677: Pulling fs layer
backend	Initialize containers	2025-09-23T08:25:18.9787678Z 0b33c9cfc245: Pulling fs layer
backend	Initialize containers	2025-09-23T08:25:18.9788136Z f082d788df98: Pulling fs layer
backend	Initialize containers	2025-09-23T08:25:18.9788635Z b2ae65346945: Pulling fs layer
backend	Initialize containers	2025-09-23T08:25:18.9789155Z 3e69ab42557e: Pulling fs layer
backend	Initialize containers	2025-09-23T08:25:18.9789476Z f35e17a433de: Pulling fs layer
backend	Initialize containers	2025-09-23T08:25:18.9789881Z 9286f415f93a: Waiting
backend	Initialize containers	2025-09-23T08:25:18.9790559Z 60570350e677: Waiting
backend	Initialize containers	2025-09-23T08:25:18.9790817Z 0b33c9cfc245: Waiting
backend	Initialize containers	2025-09-23T08:25:18.9791065Z f082d788df98: Waiting
backend	Initialize containers	2025-09-23T08:25:18.9791313Z b2ae65346945: Waiting
backend	Initialize containers	2025-09-23T08:25:18.9791553Z 3e69ab42557e: Waiting
backend	Initialize containers	2025-09-23T08:25:18.9791817Z f35e17a433de: Waiting
backend	Initialize containers	2025-09-23T08:25:18.9792066Z 874a3ca0fb79: Waiting
backend	Initialize containers	2025-09-23T08:25:18.9792312Z 38a0056e8c05: Waiting
backend	Initialize containers	2025-09-23T08:25:18.9792560Z b18445125df5: Waiting
backend	Initialize containers	2025-09-23T08:25:18.9792797Z cb4494753109: Waiting
backend	Initialize containers	2025-09-23T08:25:19.2481270Z 80ed16669c95: Verifying Checksum
backend	Initialize containers	2025-09-23T08:25:19.2481866Z 80ed16669c95: Download complete
backend	Initialize containers	2025-09-23T08:25:19.2935204Z 4e5806601837: Verifying Checksum
backend	Initialize containers	2025-09-23T08:25:19.2935966Z 4e5806601837: Download complete
backend	Initialize containers	2025-09-23T08:25:19.5351734Z b18445125df5: Download complete
backend	Initialize containers	2025-09-23T08:25:19.6020837Z ce1261c6d567: Verifying Checksum
(head unavailable)
```
</details>

<details><summary>Tail (last 80)</summary>

```
frontend	Build	2025-09-23T08:28:13.1097659Z ├ ○ /cart                                 26.8 kB         149 kB
frontend	Build	2025-09-23T08:28:13.1098443Z ├ ○ /checkout                             5.55 kB         107 kB
frontend	Build	2025-09-23T08:28:13.1099317Z ├ ƒ /checkout/payment/[orderId]           9.52 kB         119 kB
frontend	Build	2025-09-23T08:28:13.1100208Z ├ ○ /manifest.webmanifest                   170 B         102 kB
frontend	Build	2025-09-23T08:28:13.1101149Z ├ ƒ /order/confirmation/[orderId]         5.13 kB         110 kB
frontend	Build	2025-09-23T08:28:13.1102035Z ├ ƒ /orders/[id]                          2.44 kB         112 kB
frontend	Build	2025-09-23T08:28:13.1102910Z ├ ○ /producer/analytics                   4.11 kB         180 kB
frontend	Build	2025-09-23T08:28:13.1103800Z ├ ○ /producer/dashboard                   3.51 kB         113 kB
frontend	Build	2025-09-23T08:28:13.1104736Z ├ ○ /producer/onboarding                  5.78 kB         108 kB
frontend	Build	2025-09-23T08:28:13.1105956Z ├ ○ /producer/orders                      4.08 kB         106 kB
frontend	Build	2025-09-23T08:28:13.1106914Z ├ ○ /producer/products                    5.57 kB         107 kB
frontend	Build	2025-09-23T08:28:13.1107821Z ├ ƒ /products/[id]                        6.38 kB         129 kB
frontend	Build	2025-09-23T08:28:13.1108692Z ├ ○ /robots.txt                             170 B         102 kB
frontend	Build	2025-09-23T08:28:13.1109517Z ├ ○ /sitemap.xml                            170 B         102 kB
frontend	Build	2025-09-23T08:28:13.1110329Z └ ○ /test-error                           2.88 kB         128 kB
frontend	Build	2025-09-23T08:28:13.1110992Z + First Load JS shared by all              102 kB
frontend	Build	2025-09-23T08:28:13.1111676Z   ├ chunks/1255-70f71da5b64d662c.js       45.7 kB
frontend	Build	2025-09-23T08:28:13.1112347Z   ├ chunks/4bd1b696-f785427dddbba9fb.js   54.2 kB
frontend	Build	2025-09-23T08:28:13.1113012Z   └ other shared chunks (total)           1.93 kB
frontend	Build	2025-09-23T08:28:13.1113344Z 
frontend	Build	2025-09-23T08:28:13.1113711Z Route (pages)                                Size  First Load JS
frontend	Build	2025-09-23T08:28:13.1114804Z ─ ƒ /api/csp-report                           0 B        96.4 kB
frontend	Build	2025-09-23T08:28:13.1115684Z + First Load JS shared by all             96.4 kB
frontend	Build	2025-09-23T08:28:13.1116373Z   ├ chunks/framework-b9fffb5537caa07c.js  57.7 kB
frontend	Build	2025-09-23T08:28:13.1117051Z   ├ chunks/main-87580715e16894aa.js       36.8 kB
frontend	Build	2025-09-23T08:28:13.1117706Z   └ other shared chunks (total)            1.9 kB
frontend	Build	2025-09-23T08:28:13.1118130Z 
frontend	Build	2025-09-23T08:28:13.1118509Z ƒ Middleware                              34.6 kB
frontend	Build	2025-09-23T08:28:13.1118837Z 
frontend	Build	2025-09-23T08:28:13.1119186Z ○  (Static)   prerendered as static content
frontend	Build	2025-09-23T08:28:13.1119826Z ƒ  (Dynamic)  server-rendered on demand
frontend	Build	2025-09-23T08:28:13.1120140Z 
frontend	Start frontend server	﻿2025-09-23T08:28:13.1741896Z ##[group]Run cd frontend && npm run start &
frontend	Start frontend server	2025-09-23T08:28:13.1742267Z [36;1mcd frontend && npm run start &[0m
frontend	Start frontend server	2025-09-23T08:28:13.1772024Z shell: /usr/bin/bash -e {0}
frontend	Start frontend server	2025-09-23T08:28:13.1772282Z ##[endgroup]
frontend	Start frontend server	2025-09-23T08:28:13.2858466Z 
frontend	Start frontend server	2025-09-23T08:28:13.2859108Z > frontend@0.1.0 start
frontend	Start frontend server	2025-09-23T08:28:13.2859525Z > next start
frontend	Start frontend server	2025-09-23T08:28:13.2859661Z 
frontend	Start frontend server	2025-09-23T08:28:13.5259482Z    ▲ Next.js 15.5.0
frontend	Start frontend server	2025-09-23T08:28:13.5262318Z    - Local:        http://localhost:3000
frontend	Start frontend server	2025-09-23T08:28:13.5262937Z    - Network:      http://10.1.0.42:3000
frontend	Start frontend server	2025-09-23T08:28:13.5263291Z 
frontend	Start frontend server	2025-09-23T08:28:13.5264215Z  ✓ Starting...
frontend	Start frontend server	2025-09-23T08:28:13.9622723Z  ✓ Ready in 588ms
frontend	Wait for frontend	﻿2025-09-23T08:28:18.1871631Z ##[group]Run npx wait-on http://127.0.0.1:3001 --timeout 60000
frontend	Wait for frontend	2025-09-23T08:28:18.1872076Z [36;1mnpx wait-on http://127.0.0.1:3001 --timeout 60000[0m
frontend	Wait for frontend	2025-09-23T08:28:18.1901722Z shell: /usr/bin/bash -e {0}
frontend	Wait for frontend	2025-09-23T08:28:18.1901964Z ##[endgroup]
frontend	Wait for frontend	2025-09-23T08:28:19.0484261Z npm warn exec The following package was not found and will be installed: wait-on@9.0.1
frontend	Wait for frontend	2025-09-23T08:29:20.8444876Z Error: Timed out waiting for: http://127.0.0.1:3001
frontend	Wait for frontend	2025-09-23T08:29:20.8446172Z     at /home/runner/.npm/_npx/04d57496964ca6d1/node_modules/wait-on/lib/wait-on.js:131:31
frontend	Wait for frontend	2025-09-23T08:29:20.8447570Z     at doInnerSub (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/operators/mergeInternals.js:22:31)
frontend	Wait for frontend	2025-09-23T08:29:20.8449072Z     at outerNext (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/operators/mergeInternals.js:17:70)
frontend	Wait for frontend	2025-09-23T08:29:20.8450948Z     at OperatorSubscriber._this._next (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/operators/OperatorSubscriber.js:33:21)
frontend	Wait for frontend	2025-09-23T08:29:20.8452420Z     at Subscriber.next (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/Subscriber.js:51:18)
frontend	Wait for frontend	2025-09-23T08:29:20.8453644Z     at AsyncAction.work (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/observable/timer.js:28:28)
frontend	Wait for frontend	2025-09-23T08:29:20.8455312Z     at AsyncAction._execute (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/scheduler/AsyncAction.js:79:18)
frontend	Wait for frontend	2025-09-23T08:29:20.8456392Z     at AsyncAction.execute (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/scheduler/AsyncAction.js:67:26)
frontend	Wait for frontend	2025-09-23T08:29:20.8457316Z     at AsyncScheduler.flush (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/scheduler/AsyncScheduler.js:38:33)
frontend	Wait for frontend	2025-09-23T08:29:20.8457923Z     at listOnTimeout (node:internal/timers:581:17)
frontend	Wait for frontend	2025-09-23T08:29:20.8599165Z ##[error]Process completed with exit code 1.
frontend	Post Run actions/checkout@v4	﻿2025-09-23T08:29:20.8718203Z Post job cleanup.
frontend	Post Run actions/checkout@v4	2025-09-23T08:29:20.9654586Z [command]/usr/bin/git version
frontend	Post Run actions/checkout@v4	2025-09-23T08:29:20.9697211Z git version 2.51.0
frontend	Post Run actions/checkout@v4	2025-09-23T08:29:20.9740640Z Temporarily overriding HOME='/home/runner/work/_temp/eb552406-330b-4745-b774-168561787138' before making global git config changes
frontend	Post Run actions/checkout@v4	2025-09-23T08:29:20.9742064Z Adding repository directory to the temporary git global config as a safe directory
frontend	Post Run actions/checkout@v4	2025-09-23T08:29:20.9746948Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
frontend	Post Run actions/checkout@v4	2025-09-23T08:29:20.9781072Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
frontend	Post Run actions/checkout@v4	2025-09-23T08:29:20.9813103Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
frontend	Post Run actions/checkout@v4	2025-09-23T08:29:21.0050225Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
frontend	Post Run actions/checkout@v4	2025-09-23T08:29:21.0070148Z http.https://github.com/.extraheader
frontend	Post Run actions/checkout@v4	2025-09-23T08:29:21.0082478Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
frontend	Post Run actions/checkout@v4	2025-09-23T08:29:21.0112313Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
frontend	Complete job	﻿2025-09-23T08:29:21.0436360Z Cleaning up orphan processes
frontend	Complete job	2025-09-23T08:29:21.0722093Z Terminate orphan process: pid (2354) (bash)
frontend	Complete job	2025-09-23T08:29:21.0738458Z Terminate orphan process: pid (2355) (npm run start)
frontend	Complete job	2025-09-23T08:29:21.0759934Z Terminate orphan process: pid (2366) (sh)
frontend	Complete job	2025-09-23T08:29:21.0781077Z Terminate orphan process: pid (2367) (next-server (v15.5.0))
```
</details>

## Next-step
- Inspect tail for failing test or step.
- Prepare micro-PR with minimal fix (timeouts, seed, TEST_BASE_URL).

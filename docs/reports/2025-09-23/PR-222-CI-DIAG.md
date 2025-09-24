# PR #222 — CI Diagnostics (2025-09-23)

**Summary:** PASS=6 · FAIL=3 · PENDING=2

## Checks
- e2e: SKIPPED — https://github.com/lomendor/Project-Dixis/actions/runs/17942344615/job/51021804357 [wf: CI Pipeline]
- e2e-tests: IN_PROGRESS — https://github.com/lomendor/Project-Dixis/actions/runs/17942344645/job/51021669099 [wf: frontend-ci]
- frontend: FAILURE — https://github.com/lomendor/Project-Dixis/actions/runs/17942344615/job/51021646037 [wf: CI Pipeline]
- frontend-tests: SUCCESS — https://github.com/lomendor/Project-Dixis/actions/runs/17942344645/job/51021580749 [wf: frontend-ci]
- lighthouse: IN_PROGRESS — https://github.com/lomendor/Project-Dixis/actions/runs/17942344639/job/51021551708 [wf: Lighthouse CI]
- dependabot-smoke: SKIPPED — https://github.com/lomendor/Project-Dixis/actions/runs/17942344639/job/51021551793 [wf: Lighthouse CI]
- PR Hygiene Check: FAILURE — https://github.com/lomendor/Project-Dixis/actions/runs/17942344590/job/51021530356 [wf: Pull Request Quality Gates]
- backend: SUCCESS — https://github.com/lomendor/Project-Dixis/actions/runs/17942344615/job/51021530439 [wf: CI Pipeline]
- Smoke Tests: SUCCESS — https://github.com/lomendor/Project-Dixis/actions/runs/17942344590/job/51021530367 [wf: Pull Request Quality Gates]
- Quality Assurance: FAILURE — https://github.com/lomendor/Project-Dixis/actions/runs/17942344590/job/51021530359 [wf: Pull Request Quality Gates]
- type-check: SUCCESS — https://github.com/lomendor/Project-Dixis/actions/runs/17942344645/job/51021530428 [wf: frontend-ci]
- danger: SUCCESS — https://github.com/lomendor/Project-Dixis/actions/runs/17942344638/job/51021530360 [wf: DangerJS Gatekeeper]
- danger: SUCCESS — https://github.com/lomendor/Project-Dixis/actions/runs/17942344610/job/51021530501 [wf: Danger PR Gatekeeper]
- dependabot-smoke: SKIPPED — https://github.com/lomendor/Project-Dixis/actions/runs/17942344615/job/51021530585 [wf: CI Pipeline]
- dependabot-smoke: SKIPPED — https://github.com/lomendor/Project-Dixis/actions/runs/17942344645/job/51021530504 [wf: frontend-ci]

## Failure Details

### Failing job
- URL: https://github.com/lomendor/Project-Dixis/actions/runs/17942344615/job/51021646037
- RUN_ID: 17942344615

#### Head (first 120 lines)
```
backend	Set up job	﻿2025-09-23T09:56:32.0317910Z Current runner version: '2.328.0'
backend	Set up job	2025-09-23T09:56:32.0343132Z ##[group]Runner Image Provisioner
backend	Set up job	2025-09-23T09:56:32.0343935Z Hosted Compute Agent
backend	Set up job	2025-09-23T09:56:32.0344550Z Version: 20250829.383
backend	Set up job	2025-09-23T09:56:32.0345127Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
backend	Set up job	2025-09-23T09:56:32.0345848Z Build Date: 2025-08-29T13:48:48Z
backend	Set up job	2025-09-23T09:56:32.0346469Z ##[endgroup]
backend	Set up job	2025-09-23T09:56:32.0346969Z ##[group]Operating System
backend	Set up job	2025-09-23T09:56:32.0347726Z Ubuntu
backend	Set up job	2025-09-23T09:56:32.0348168Z 24.04.3
backend	Set up job	2025-09-23T09:56:32.0348720Z LTS
backend	Set up job	2025-09-23T09:56:32.0349181Z ##[endgroup]
backend	Set up job	2025-09-23T09:56:32.0349653Z ##[group]Runner Image
backend	Set up job	2025-09-23T09:56:32.0350207Z Image: ubuntu-24.04
backend	Set up job	2025-09-23T09:56:32.0350736Z Version: 20250907.24.1
backend	Set up job	2025-09-23T09:56:32.0351688Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
backend	Set up job	2025-09-23T09:56:32.0353077Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
backend	Set up job	2025-09-23T09:56:32.0354226Z ##[endgroup]
backend	Set up job	2025-09-23T09:56:32.0355340Z ##[group]GITHUB_TOKEN Permissions
backend	Set up job	2025-09-23T09:56:32.0357549Z Contents: read
backend	Set up job	2025-09-23T09:56:32.0358211Z Metadata: read
backend	Set up job	2025-09-23T09:56:32.0358729Z Packages: read
backend	Set up job	2025-09-23T09:56:32.0359231Z ##[endgroup]
backend	Set up job	2025-09-23T09:56:32.0361807Z Secret source: Actions
backend	Set up job	2025-09-23T09:56:32.0362907Z Prepare workflow directory
backend	Set up job	2025-09-23T09:56:32.0782025Z Prepare all required actions
backend	Set up job	2025-09-23T09:56:32.0819283Z Getting action download info
backend	Set up job	2025-09-23T09:56:32.3969017Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
backend	Set up job	2025-09-23T09:56:32.4659103Z Download action repository 'shivammathur/setup-php@v2' (SHA:bf6b4fbd49ca58e4608c9c89fba0b8d90bd2a39f)
backend	Set up job	2025-09-23T09:56:32.7594319Z Complete job name: backend
backend	Initialize containers	﻿2025-09-23T09:56:32.8077176Z ##[group]Checking docker version
backend	Initialize containers	2025-09-23T09:56:32.8089938Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
backend	Initialize containers	2025-09-23T09:56:32.8943391Z '1.48'
backend	Initialize containers	2025-09-23T09:56:32.8954652Z Docker daemon API version: '1.48'
backend	Initialize containers	2025-09-23T09:56:32.8955426Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
backend	Initialize containers	2025-09-23T09:56:32.9104864Z '1.48'
backend	Initialize containers	2025-09-23T09:56:32.9118744Z Docker client API version: '1.48'
backend	Initialize containers	2025-09-23T09:56:32.9124614Z ##[endgroup]
backend	Initialize containers	2025-09-23T09:56:32.9127696Z ##[group]Clean up resources from previous jobs
backend	Initialize containers	2025-09-23T09:56:32.9132691Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=fc7aa4"
backend	Initialize containers	2025-09-23T09:56:32.9275905Z ##[command]/usr/bin/docker network prune --force --filter "label=fc7aa4"
backend	Initialize containers	2025-09-23T09:56:32.9400950Z ##[endgroup]
backend	Initialize containers	2025-09-23T09:56:32.9401464Z ##[group]Create local container network
backend	Initialize containers	2025-09-23T09:56:32.9410857Z ##[command]/usr/bin/docker network create --label fc7aa4 github_network_44db3088de8c47d8a916ddbf96a51839
backend	Initialize containers	2025-09-23T09:56:32.9917468Z 83210bfc4216f9cfc986ec2d85789b12c6f0adaa37ae8240b9494316de77207e
backend	Initialize containers	2025-09-23T09:56:32.9934198Z ##[endgroup]
backend	Initialize containers	2025-09-23T09:56:32.9957856Z ##[group]Starting postgres service container
backend	Initialize containers	2025-09-23T09:56:32.9976341Z ##[command]/usr/bin/docker pull postgres:15
backend	Initialize containers	2025-09-23T09:56:33.2453986Z 15: Pulling from library/postgres
backend	Initialize containers	2025-09-23T09:56:33.3106861Z ce1261c6d567: Pulling fs layer
backend	Initialize containers	2025-09-23T09:56:33.3107999Z 80ed16669c95: Pulling fs layer
backend	Initialize containers	2025-09-23T09:56:33.3108819Z 4e5806601837: Pulling fs layer
backend	Initialize containers	2025-09-23T09:56:33.3109640Z b18445125df5: Pulling fs layer
backend	Initialize containers	2025-09-23T09:56:33.3110444Z 874a3ca0fb79: Pulling fs layer
backend	Initialize containers	2025-09-23T09:56:33.3111221Z 38a0056e8c05: Pulling fs layer
backend	Initialize containers	2025-09-23T09:56:33.3112023Z cb4494753109: Pulling fs layer
backend	Initialize containers	2025-09-23T09:56:33.3113446Z 9286f415f93a: Pulling fs layer
backend	Initialize containers	2025-09-23T09:56:33.3114074Z 60570350e677: Pulling fs layer
backend	Initialize containers	2025-09-23T09:56:33.3114562Z 0b33c9cfc245: Pulling fs layer
backend	Initialize containers	2025-09-23T09:56:33.3115099Z f082d788df98: Pulling fs layer
backend	Initialize containers	2025-09-23T09:56:33.3115565Z b2ae65346945: Pulling fs layer
backend	Initialize containers	2025-09-23T09:56:33.3116118Z 3e69ab42557e: Pulling fs layer
backend	Initialize containers	2025-09-23T09:56:33.3116591Z f35e17a433de: Pulling fs layer
backend	Initialize containers	2025-09-23T09:56:33.3117049Z 874a3ca0fb79: Waiting
backend	Initialize containers	2025-09-23T09:56:33.3118182Z 38a0056e8c05: Waiting
backend	Initialize containers	2025-09-23T09:56:33.3118603Z cb4494753109: Waiting
backend	Initialize containers	2025-09-23T09:56:33.3118996Z f082d788df98: Waiting
backend	Initialize containers	2025-09-23T09:56:33.3119397Z b18445125df5: Waiting
backend	Initialize containers	2025-09-23T09:56:33.3119792Z 9286f415f93a: Waiting
backend	Initialize containers	2025-09-23T09:56:33.3120186Z 60570350e677: Waiting
backend	Initialize containers	2025-09-23T09:56:33.3120571Z 0b33c9cfc245: Waiting
backend	Initialize containers	2025-09-23T09:56:33.3120956Z b2ae65346945: Waiting
backend	Initialize containers	2025-09-23T09:56:33.3121353Z 3e69ab42557e: Waiting
backend	Initialize containers	2025-09-23T09:56:33.3121732Z f35e17a433de: Waiting
backend	Initialize containers	2025-09-23T09:56:33.4024395Z 80ed16669c95: Verifying Checksum
backend	Initialize containers	2025-09-23T09:56:33.4025396Z 80ed16669c95: Download complete
backend	Initialize containers	2025-09-23T09:56:33.4435442Z 4e5806601837: Verifying Checksum
backend	Initialize containers	2025-09-23T09:56:33.4436423Z 4e5806601837: Download complete
backend	Initialize containers	2025-09-23T09:56:33.5038673Z b18445125df5: Download complete
backend	Initialize containers	2025-09-23T09:56:33.5615816Z 874a3ca0fb79: Verifying Checksum
backend	Initialize containers	2025-09-23T09:56:33.6000649Z 874a3ca0fb79: Download complete
backend	Initialize containers	2025-09-23T09:56:33.6001600Z 38a0056e8c05: Verifying Checksum
backend	Initialize containers	2025-09-23T09:56:33.6002631Z 38a0056e8c05: Download complete
backend	Initialize containers	2025-09-23T09:56:33.6344587Z cb4494753109: Verifying Checksum
backend	Initialize containers	2025-09-23T09:56:33.6348169Z cb4494753109: Download complete
backend	Initialize containers	2025-09-23T09:56:33.6831606Z 9286f415f93a: Download complete
backend	Initialize containers	2025-09-23T09:56:33.7372127Z ce1261c6d567: Verifying Checksum
backend	Initialize containers	2025-09-23T09:56:33.7373947Z ce1261c6d567: Download complete
backend	Initialize containers	2025-09-23T09:56:33.7482417Z 0b33c9cfc245: Verifying Checksum
backend	Initialize containers	2025-09-23T09:56:33.7485051Z 0b33c9cfc245: Download complete
backend	Initialize containers	2025-09-23T09:56:33.8166604Z f082d788df98: Verifying Checksum
backend	Initialize containers	2025-09-23T09:56:33.8170609Z f082d788df98: Download complete
backend	Initialize containers	2025-09-23T09:56:33.8416700Z b2ae65346945: Verifying Checksum
backend	Initialize containers	2025-09-23T09:56:33.8418925Z b2ae65346945: Download complete
backend	Initialize containers	2025-09-23T09:56:33.8994176Z 3e69ab42557e: Verifying Checksum
backend	Initialize containers	2025-09-23T09:56:33.8995207Z 3e69ab42557e: Download complete
backend	Initialize containers	2025-09-23T09:56:33.9121478Z f35e17a433de: Verifying Checksum
backend	Initialize containers	2025-09-23T09:56:33.9122569Z f35e17a433de: Download complete
backend	Initialize containers	2025-09-23T09:56:34.4326655Z 60570350e677: Verifying Checksum
backend	Initialize containers	2025-09-23T09:56:34.4327582Z 60570350e677: Download complete
backend	Initialize containers	2025-09-23T09:56:34.7119589Z ce1261c6d567: Pull complete
backend	Initialize containers	2025-09-23T09:56:34.9601965Z 80ed16669c95: Pull complete
backend	Initialize containers	2025-09-23T09:56:35.1381345Z 4e5806601837: Pull complete
backend	Initialize containers	2025-09-23T09:56:35.1796976Z b18445125df5: Pull complete
backend	Initialize containers	2025-09-23T09:56:35.4798958Z 874a3ca0fb79: Pull complete
backend	Initialize containers	2025-09-23T09:56:35.5668951Z 38a0056e8c05: Pull complete
backend	Initialize containers	2025-09-23T09:56:35.5799439Z cb4494753109: Pull complete
backend	Initialize containers	2025-09-23T09:56:35.5937096Z 9286f415f93a: Pull complete
backend	Initialize containers	2025-09-23T09:56:38.5065635Z 60570350e677: Pull complete
backend	Initialize containers	2025-09-23T09:56:38.5279028Z 0b33c9cfc245: Pull complete
backend	Initialize containers	2025-09-23T09:56:38.5429362Z f082d788df98: Pull complete
backend	Initialize containers	2025-09-23T09:56:38.5557658Z b2ae65346945: Pull complete
backend	Initialize containers	2025-09-23T09:56:38.5693946Z 3e69ab42557e: Pull complete
backend	Initialize containers	2025-09-23T09:56:38.5839527Z f35e17a433de: Pull complete
backend	Initialize containers	2025-09-23T09:56:38.5890715Z Digest: sha256:1cd9dd548427751dc0fabb24a3bdf96a6dd08c0025a167ecbb5c14bec21ff94c
backend	Initialize containers	2025-09-23T09:56:38.5908870Z Status: Downloaded newer image for postgres:15
backend	Initialize containers	2025-09-23T09:56:38.5922814Z docker.io/library/postgres:15
backend	Initialize containers	2025-09-23T09:56:38.5981026Z ##[command]/usr/bin/docker create --name 1740bd9e08774516b8daabbd92d9227a_postgres15_3e1bea --label fc7aa4 --network github_network_44db3088de8c47d8a916ddbf96a51839 --network-alias postgres -p 5432:5432 --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5 -e "POSTGRES_PASSWORD=postgres" -e "POSTGRES_DB=project_dixis_test" -e GITHUB_ACTIONS=true -e CI=true postgres:15
backend	Initialize containers	2025-09-23T09:56:38.6255999Z 24d6d311b7f37eed00777c5ff21072132456aae9c6e7283b9dbcb09f0ce50ce3
backend	Initialize containers	2025-09-23T09:56:38.6278990Z ##[command]/usr/bin/docker start 24d6d311b7f37eed00777c5ff21072132456aae9c6e7283b9dbcb09f0ce50ce3
```

#### Tail (last 120 lines)
```
frontend	Build	2025-09-23T09:58:35.9928177Z    ▲ Next.js 15.5.0
frontend	Build	2025-09-23T09:58:35.9928868Z 
frontend	Build	2025-09-23T09:58:36.0929742Z    Creating an optimized production build ...
frontend	Build	2025-09-23T09:58:46.0253394Z  ✓ Compiled successfully in 9.8s
frontend	Build	2025-09-23T09:58:46.0289952Z    Skipping linting
frontend	Build	2025-09-23T09:58:46.0292033Z    Checking validity of types ...
frontend	Build	2025-09-23T09:58:52.1262701Z    Collecting page data ...
frontend	Build	2025-09-23T09:58:54.1804916Z    Generating static pages (0/33) ...
frontend	Build	2025-09-23T09:58:54.7677974Z    Generating static pages (8/33) 
frontend	Build	2025-09-23T09:58:54.9527644Z    Generating static pages (16/33) 
frontend	Build	2025-09-23T09:58:54.9530971Z    Generating static pages (24/33) 
frontend	Build	2025-09-23T09:58:55.1045497Z  ✓ Generating static pages (33/33)
frontend	Build	2025-09-23T09:58:55.9294484Z    Finalizing page optimization ...
frontend	Build	2025-09-23T09:58:55.9295129Z    Collecting build traces ...
frontend	Build	2025-09-23T09:59:02.2036302Z 
frontend	Build	2025-09-23T09:59:02.2126436Z Route (app)                                  Size  First Load JS
frontend	Build	2025-09-23T09:59:02.2127816Z ┌ ○ /                                     6.41 kB         121 kB
frontend	Build	2025-09-23T09:59:02.2128608Z ├ ○ /_not-found                             998 B         103 kB
frontend	Build	2025-09-23T09:59:02.2129385Z ├ ○ /account/orders                       4.38 kB         110 kB
frontend	Build	2025-09-23T09:59:02.2130203Z ├ ƒ /account/orders/[orderId]             5.45 kB         116 kB
frontend	Build	2025-09-23T09:59:02.2131117Z ├ ○ /admin/analytics                      3.91 kB         180 kB
frontend	Build	2025-09-23T09:59:02.2131910Z ├ ○ /admin/orders                          3.6 kB         105 kB
frontend	Build	2025-09-23T09:59:02.2132678Z ├ ○ /admin/pricing                        5.02 kB         120 kB
frontend	Build	2025-09-23T09:59:02.2133476Z ├ ○ /admin/producers                      4.91 kB         107 kB
frontend	Build	2025-09-23T09:59:02.2134468Z ├ ○ /admin/toggle                         4.52 kB         106 kB
frontend	Build	2025-09-23T09:59:02.2134979Z ├ ƒ /api/admin/orders/[id]/update-status    170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2135559Z ├ ƒ /api/admin/producers                    170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2136065Z ├ ƒ /api/admin/producers/[id]/approve       170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2136572Z ├ ƒ /api/admin/producers/[id]/reject        170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2137057Z ├ ƒ /api/checkout/address                   170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2137537Z ├ ƒ /api/checkout/pay                       170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2137997Z ├ ƒ /api/checkout/quote                     170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2138525Z ├ ƒ /api/producer/onboarding                170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2139002Z ├ ƒ /api/producer/orders/[id]/ship          170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2139475Z ├ ƒ /api/producer/products                  170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2139946Z ├ ƒ /api/producer/status                    170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2140404Z ├ ƒ /api/v1/lockers/search                  170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2140859Z ├ ƒ /api/v1/shipping/quote                  170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2141308Z ├ ○ /auth/login                           3.87 kB         109 kB
frontend	Build	2025-09-23T09:59:02.2141993Z ├ ○ /auth/register                        4.08 kB         109 kB
frontend	Build	2025-09-23T09:59:02.2142432Z ├ ○ /cart                                 26.8 kB         149 kB
frontend	Build	2025-09-23T09:59:02.2142845Z ├ ○ /checkout                             5.55 kB         107 kB
frontend	Build	2025-09-23T09:59:02.2143288Z ├ ƒ /checkout/payment/[orderId]           9.52 kB         119 kB
frontend	Build	2025-09-23T09:59:02.2143749Z ├ ○ /manifest.webmanifest                   170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2144413Z ├ ƒ /order/confirmation/[orderId]         5.13 kB         110 kB
frontend	Build	2025-09-23T09:59:02.2144864Z ├ ƒ /orders/[id]                          2.44 kB         112 kB
frontend	Build	2025-09-23T09:59:02.2145303Z ├ ○ /producer/analytics                   4.11 kB         180 kB
frontend	Build	2025-09-23T09:59:02.2145753Z ├ ○ /producer/dashboard                   3.51 kB         113 kB
frontend	Build	2025-09-23T09:59:02.2146204Z ├ ○ /producer/onboarding                  5.78 kB         108 kB
frontend	Build	2025-09-23T09:59:02.2146667Z ├ ○ /producer/orders                      4.08 kB         106 kB
frontend	Build	2025-09-23T09:59:02.2147114Z ├ ○ /producer/products                    5.57 kB         107 kB
frontend	Build	2025-09-23T09:59:02.2147549Z ├ ƒ /products/[id]                        6.38 kB         129 kB
frontend	Build	2025-09-23T09:59:02.2147996Z ├ ○ /robots.txt                             170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2148500Z ├ ○ /sitemap.xml                            170 B         102 kB
frontend	Build	2025-09-23T09:59:02.2149270Z └ ○ /test-error                           2.88 kB         128 kB
frontend	Build	2025-09-23T09:59:02.2149919Z + First Load JS shared by all              102 kB
frontend	Build	2025-09-23T09:59:02.2150555Z   ├ chunks/1255-70f71da5b64d662c.js       45.7 kB
frontend	Build	2025-09-23T09:59:02.2151147Z   ├ chunks/4bd1b696-f785427dddbba9fb.js   54.2 kB
frontend	Build	2025-09-23T09:59:02.2151687Z   └ other shared chunks (total)           1.93 kB
frontend	Build	2025-09-23T09:59:02.2151944Z 
frontend	Build	2025-09-23T09:59:02.2152214Z Route (pages)                                Size  First Load JS
frontend	Build	2025-09-23T09:59:02.2153085Z ─ ƒ /api/csp-report                           0 B        96.4 kB
frontend	Build	2025-09-23T09:59:02.2153594Z + First Load JS shared by all             96.4 kB
frontend	Build	2025-09-23T09:59:02.2154245Z   ├ chunks/framework-b9fffb5537caa07c.js  57.7 kB
frontend	Build	2025-09-23T09:59:02.2154737Z   ├ chunks/main-87580715e16894aa.js       36.8 kB
frontend	Build	2025-09-23T09:59:02.2155198Z   └ other shared chunks (total)            1.9 kB
frontend	Build	2025-09-23T09:59:02.2155442Z 
frontend	Build	2025-09-23T09:59:02.2155702Z ƒ Middleware                              34.6 kB
frontend	Build	2025-09-23T09:59:02.2155941Z 
frontend	Build	2025-09-23T09:59:02.2156190Z ○  (Static)   prerendered as static content
frontend	Build	2025-09-23T09:59:02.2156655Z ƒ  (Dynamic)  server-rendered on demand
frontend	Build	2025-09-23T09:59:02.2156876Z 
frontend	Start frontend server	﻿2025-09-23T09:59:02.2796242Z ##[group]Run cd frontend && npm run start &
frontend	Start frontend server	2025-09-23T09:59:02.2796593Z [36;1mcd frontend && npm run start &[0m
frontend	Start frontend server	2025-09-23T09:59:02.2826415Z shell: /usr/bin/bash -e {0}
frontend	Start frontend server	2025-09-23T09:59:02.2826651Z ##[endgroup]
frontend	Start frontend server	2025-09-23T09:59:02.3919314Z 
frontend	Start frontend server	2025-09-23T09:59:02.3919823Z > frontend@0.1.0 start
frontend	Start frontend server	2025-09-23T09:59:02.3920210Z > next start
frontend	Start frontend server	2025-09-23T09:59:02.3920378Z 
frontend	Start frontend server	2025-09-23T09:59:02.6227564Z    ▲ Next.js 15.5.0
frontend	Start frontend server	2025-09-23T09:59:02.6230575Z    - Local:        http://localhost:3000
frontend	Start frontend server	2025-09-23T09:59:02.6231145Z    - Network:      http://10.1.0.179:3000
frontend	Start frontend server	2025-09-23T09:59:02.6231544Z 
frontend	Start frontend server	2025-09-23T09:59:02.6232475Z  ✓ Starting...
frontend	Start frontend server	2025-09-23T09:59:03.0620400Z  ✓ Ready in 582ms
frontend	Wait for frontend	﻿2025-09-23T09:59:07.2915026Z ##[group]Run npx wait-on http://127.0.0.1:3001 --timeout 60000
frontend	Wait for frontend	2025-09-23T09:59:07.2915502Z [36;1mnpx wait-on http://127.0.0.1:3001 --timeout 60000[0m
frontend	Wait for frontend	2025-09-23T09:59:07.2947572Z shell: /usr/bin/bash -e {0}
frontend	Wait for frontend	2025-09-23T09:59:07.2947969Z ##[endgroup]
frontend	Wait for frontend	2025-09-23T09:59:08.0982952Z npm warn exec The following package was not found and will be installed: wait-on@9.0.1
frontend	Wait for frontend	2025-09-23T10:00:09.7454711Z Error: Timed out waiting for: http://127.0.0.1:3001
frontend	Wait for frontend	2025-09-23T10:00:09.7455734Z     at /home/runner/.npm/_npx/04d57496964ca6d1/node_modules/wait-on/lib/wait-on.js:131:31
frontend	Wait for frontend	2025-09-23T10:00:09.7457637Z     at doInnerSub (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/operators/mergeInternals.js:22:31)
frontend	Wait for frontend	2025-09-23T10:00:09.7460043Z     at outerNext (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/operators/mergeInternals.js:17:70)
frontend	Wait for frontend	2025-09-23T10:00:09.7462352Z     at OperatorSubscriber._this._next (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/operators/OperatorSubscriber.js:33:21)
frontend	Wait for frontend	2025-09-23T10:00:09.7464535Z     at Subscriber.next (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/Subscriber.js:51:18)
frontend	Wait for frontend	2025-09-23T10:00:09.7466167Z     at AsyncAction.work (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/observable/timer.js:28:28)
frontend	Wait for frontend	2025-09-23T10:00:09.7467796Z     at AsyncAction._execute (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/scheduler/AsyncAction.js:79:18)
frontend	Wait for frontend	2025-09-23T10:00:09.7469660Z     at AsyncAction.execute (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/scheduler/AsyncAction.js:67:26)
frontend	Wait for frontend	2025-09-23T10:00:09.7471790Z     at AsyncScheduler.flush (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/scheduler/AsyncScheduler.js:38:33)
frontend	Wait for frontend	2025-09-23T10:00:09.7473068Z     at listOnTimeout (node:internal/timers:581:17)
frontend	Wait for frontend	2025-09-23T10:00:09.7602563Z ##[error]Process completed with exit code 1.
frontend	Post Run actions/checkout@v4	﻿2025-09-23T10:00:09.7722049Z Post job cleanup.
frontend	Post Run actions/checkout@v4	2025-09-23T10:00:09.8664772Z [command]/usr/bin/git version
frontend	Post Run actions/checkout@v4	2025-09-23T10:00:09.8707413Z git version 2.51.0
frontend	Post Run actions/checkout@v4	2025-09-23T10:00:09.8750974Z Temporarily overriding HOME='/home/runner/work/_temp/92593152-6a86-43ac-8a95-53e0cf0c4174' before making global git config changes
frontend	Post Run actions/checkout@v4	2025-09-23T10:00:09.8752433Z Adding repository directory to the temporary git global config as a safe directory
frontend	Post Run actions/checkout@v4	2025-09-23T10:00:09.8757308Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
frontend	Post Run actions/checkout@v4	2025-09-23T10:00:09.8791110Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
frontend	Post Run actions/checkout@v4	2025-09-23T10:00:09.8823895Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
frontend	Post Run actions/checkout@v4	2025-09-23T10:00:09.9048614Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
frontend	Post Run actions/checkout@v4	2025-09-23T10:00:09.9069570Z http.https://github.com/.extraheader
frontend	Post Run actions/checkout@v4	2025-09-23T10:00:09.9081801Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
frontend	Post Run actions/checkout@v4	2025-09-23T10:00:09.9111854Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
frontend	Complete job	﻿2025-09-23T10:00:09.9441123Z Cleaning up orphan processes
frontend	Complete job	2025-09-23T10:00:09.9714255Z Terminate orphan process: pid (2375) (bash)
frontend	Complete job	2025-09-23T10:00:09.9730905Z Terminate orphan process: pid (2376) (npm run start)
frontend	Complete job	2025-09-23T10:00:09.9751707Z Terminate orphan process: pid (2387) (sh)
frontend	Complete job	2025-09-23T10:00:09.9773009Z Terminate orphan process: pid (2388) (next-server (v15.5.0))
```

### Failing job
- URL: https://github.com/lomendor/Project-Dixis/actions/runs/17942344590/job/51021530356
- RUN_ID: 17942344590

#### Head (first 120 lines)
```
PR Hygiene Check	Set up job	﻿2025-09-23T09:56:32.8175144Z Current runner version: '2.328.0'
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8198739Z ##[group]Runner Image Provisioner
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8199577Z Hosted Compute Agent
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8200280Z Version: 20250829.383
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8200940Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8201741Z Build Date: 2025-08-29T13:48:48Z
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8202402Z ##[endgroup]
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8203018Z ##[group]Operating System
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8203845Z Ubuntu
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8204421Z 24.04.3
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8204987Z LTS
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8205508Z ##[endgroup]
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8206097Z ##[group]Runner Image
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8206684Z Image: ubuntu-24.04
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8207262Z Version: 20250907.24.1
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8208276Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8209758Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8210988Z ##[endgroup]
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8212141Z ##[group]GITHUB_TOKEN Permissions
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8214223Z Contents: read
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8214930Z Metadata: read
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8215542Z Packages: read
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8216091Z ##[endgroup]
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8218458Z Secret source: Actions
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8219235Z Prepare workflow directory
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8639793Z Prepare all required actions
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8697749Z Getting action download info
PR Hygiene Check	Set up job	2025-09-23T09:56:33.2973151Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
PR Hygiene Check	Set up job	2025-09-23T09:56:33.4953991Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
PR Hygiene Check	Set up job	2025-09-23T09:56:33.6552883Z Complete job name: PR Hygiene Check
PR Hygiene Check	Checkout	﻿2025-09-23T09:56:33.7218179Z ##[group]Run actions/checkout@v4
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7219009Z with:
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7219399Z   fetch-depth: 0
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7219825Z   repository: lomendor/Project-Dixis
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7220493Z   token: ***
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7220874Z   ssh-strict: true
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7221270Z   ssh-user: git
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7221680Z   persist-credentials: true
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7222141Z   clean: true
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7222550Z   sparse-checkout-cone-mode: true
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7223015Z   fetch-tags: false
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7223419Z   show-progress: true
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7224022Z   lfs: false
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7224394Z   submodules: false
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7224814Z   set-safe-directory: true
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7225494Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8288773Z Syncing repository: lomendor/Project-Dixis
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8290470Z ##[group]Getting Git version info
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8291221Z Working directory is '/home/runner/work/Project-Dixis/Project-Dixis'
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8292265Z [command]/usr/bin/git version
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8375676Z git version 2.51.0
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8401189Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8414824Z Temporarily overriding HOME='/home/runner/work/_temp/32b5132c-1518-4728-ba01-c24e6a7091db' before making global git config changes
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8416290Z Adding repository directory to the temporary git global config as a safe directory
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8419662Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8454896Z Deleting the contents of '/home/runner/work/Project-Dixis/Project-Dixis'
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8458414Z ##[group]Initializing the repository
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8462028Z [command]/usr/bin/git init /home/runner/work/Project-Dixis/Project-Dixis
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8562913Z hint: Using 'master' as the name for the initial branch. This default branch name
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8564631Z hint: is subject to change. To configure the initial branch name to use in all
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8566226Z hint: of your new repositories, which will suppress this warning, call:
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8567433Z hint:
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8568283Z hint: 	git config --global init.defaultBranch <name>
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8569718Z hint:
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8570342Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8571317Z hint: 'development'. The just-created branch can be renamed via this command:
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8572085Z hint:
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8572494Z hint: 	git branch -m <name>
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8572966Z hint:
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8573896Z hint: Disable this message with "git config set advice.defaultBranchName false"
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8575537Z Initialized empty Git repository in /home/runner/work/Project-Dixis/Project-Dixis/.git/
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8579681Z [command]/usr/bin/git remote add origin https://github.com/lomendor/Project-Dixis
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8615933Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8616808Z ##[group]Disabling automatic garbage collection
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8619707Z [command]/usr/bin/git config --local gc.auto 0
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8647435Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8648276Z ##[group]Setting up auth
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8653905Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8682600Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
PR Hygiene Check	Checkout	2025-09-23T09:56:33.9007252Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
PR Hygiene Check	Checkout	2025-09-23T09:56:33.9039508Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
PR Hygiene Check	Checkout	2025-09-23T09:56:33.9275945Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
PR Hygiene Check	Checkout	2025-09-23T09:56:33.9321045Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-23T09:56:33.9322305Z ##[group]Fetching the repository
PR Hygiene Check	Checkout	2025-09-23T09:56:33.9332419Z [command]/usr/bin/git -c protocol.version=2 fetch --prune --no-recurse-submodules origin +refs/heads/*:refs/remotes/origin/* +refs/tags/*:refs/tags/* +ebf1026b05fec8cde8f28bd4ab69dcefdd8e7d63:refs/remotes/pull/222/merge
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2808093Z From https://github.com/lomendor/Project-Dixis
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2810465Z  * [new branch]      chore/consolidation-waitforroot-asset-docs -> origin/chore/consolidation-waitforroot-asset-docs
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2813151Z  * [new branch]      chore/e2e-webservers-and-global-setup    -> origin/chore/e2e-webservers-and-global-setup
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2815924Z  * [new branch]      chore/pg-testing-and-slim-playwright-artifacts -> origin/chore/pg-testing-and-slim-playwright-artifacts
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2818789Z  * [new branch]      chore/quality-gates-subagents            -> origin/chore/quality-gates-subagents
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2821089Z  * [new branch]      chore/smoke-integration-split            -> origin/chore/smoke-integration-split
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2823264Z  * [new branch]      chore/testing-pg-and-slim-playwright     -> origin/chore/testing-pg-and-slim-playwright
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2825621Z  * [new branch]      ci/auth-e2e-hotfix                       -> origin/ci/auth-e2e-hotfix
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2827407Z  * [new branch]      ci/consolidate-workflows                 -> origin/ci/consolidate-workflows
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2829139Z  * [new branch]      ci/fix-212-round2                        -> origin/ci/fix-212-round2
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2830964Z  * [new branch]      ci/fix-212-workflow-hardening            -> origin/ci/fix-212-workflow-hardening
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2833230Z  * [new branch]      ci/fix-e2e-shipping-timeouts             -> origin/ci/fix-e2e-shipping-timeouts
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2836002Z  * [new branch]      ci/pr216-hotfix-contracts-e2e            -> origin/ci/pr216-hotfix-contracts-e2e
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2838288Z  * [new branch]      ci/status-1758367092                     -> origin/ci/status-1758367092
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2840920Z  * [new branch]      ci/throttle-bots-concurrency-paths-ignore -> origin/ci/throttle-bots-concurrency-paths-ignore
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2844970Z  * [new branch]      dependabot/composer/backend/laravel/framework-12.30.1 -> origin/dependabot/composer/backend/laravel/framework-12.30.1
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2848395Z  * [new branch]      dependabot/composer/backend/laravel/pint-1.25.1 -> origin/dependabot/composer/backend/laravel/pint-1.25.1
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2851468Z  * [new branch]      dependabot/github_actions/actions/checkout-5 -> origin/dependabot/github_actions/actions/checkout-5
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2854774Z  * [new branch]      dependabot/github_actions/actions/setup-node-5 -> origin/dependabot/github_actions/actions/setup-node-5
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2858477Z  * [new branch]      dependabot/npm_and_yarn/backend/frontend/eslint-config-next-15.5.3 -> origin/dependabot/npm_and_yarn/backend/frontend/eslint-config-next-15.5.3
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2862515Z  * [new branch]      dependabot/npm_and_yarn/backend/frontend/multi-0c18ad9c18 -> origin/dependabot/npm_and_yarn/backend/frontend/multi-0c18ad9c18
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2866569Z  * [new branch]      dependabot/npm_and_yarn/backend/frontend/multi-70832524d6 -> origin/dependabot/npm_and_yarn/backend/frontend/multi-70832524d6
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2870634Z  * [new branch]      dependabot/npm_and_yarn/backend/frontend/tailwindcss/postcss-4.1.13 -> origin/dependabot/npm_and_yarn/backend/frontend/tailwindcss/postcss-4.1.13
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2874824Z  * [new branch]      dependabot/npm_and_yarn/backend/frontend/types/node-24.5.2 -> origin/dependabot/npm_and_yarn/backend/frontend/types/node-24.5.2
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2877697Z  * [new branch]      docs/audit-ci-20250905                   -> origin/docs/audit-ci-20250905
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2879785Z  * [new branch]      feat/account-orders-history              -> origin/feat/account-orders-history
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2882207Z  * [new branch]      feat/admin-light-panel                   -> origin/feat/admin-light-panel
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2884202Z  * [new branch]      feat/api-orders-v1                       -> origin/feat/api-orders-v1
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2886062Z  * [new branch]      feat/api-producers-v1                    -> origin/feat/api-producers-v1
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2888425Z  * [new branch]      feat/api-products-v1-embedded-producer   -> origin/feat/api-products-v1-embedded-producer
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2890864Z  * [new branch]      feat/api-readonly-v1                     -> origin/feat/api-readonly-v1
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2892686Z  * [new branch]      feat/api-smoke-tests                     -> origin/feat/api-smoke-tests
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2894757Z  * [new branch]      feat/cart-summary-hygiene                -> origin/feat/cart-summary-hygiene
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2896813Z  * [new branch]      feat/checkout-flow-completion            -> origin/feat/checkout-flow-completion
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2898852Z  * [new branch]      feat/ci-e2e-guardrails                   -> origin/feat/ci-e2e-guardrails
```

#### Tail (last 120 lines)
```
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:19.6694750Z Preparing to unpack .../7-xfonts-utils_1%3a7.7+6build3_amd64.deb ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:19.6702250Z Unpacking xfonts-utils (1:7.7+6build3) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:19.9541022Z Selecting previously unselected package xfonts-cyrillic.
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:19.9671035Z Preparing to unpack .../8-xfonts-cyrillic_1%3a1.0.5+nmu1_all.deb ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:19.9678724Z Unpacking xfonts-cyrillic (1:1.0.5+nmu1) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0010785Z Selecting previously unselected package xfonts-scalable.
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0139834Z Preparing to unpack .../9-xfonts-scalable_1%3a1.0.3-1.3_all.deb ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0147860Z Unpacking xfonts-scalable (1:1.0.3-1.3) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0557229Z Setting up fonts-wqy-zenhei (0.9.45-8) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0669292Z Setting up fonts-freefont-ttf (20211204+svn4273-2) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0688583Z Setting up fonts-tlwg-loma-otf (1:0.7.3-1) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0706868Z Setting up xfonts-encodings (1:1.0.5-0ubuntu2) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0726627Z Setting up fonts-ipafont-gothic (00303-21ubuntu1) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0790094Z update-alternatives: using /usr/share/fonts/opentype/ipafont-gothic/ipag.ttf to provide /usr/share/fonts/truetype/fonts-japanese-gothic.ttf (fonts-japanese-gothic.ttf) in auto mode
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0804376Z Setting up libcups2t64:amd64 (2.4.7-1.2ubuntu7.4) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0822856Z Setting up fonts-unifont (1:15.1.01-1build1) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0840638Z Setting up xfonts-utils (1:7.7+6build3) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0879794Z Setting up xfonts-cyrillic (1:1.0.5+nmu1) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.1343622Z Setting up xfonts-scalable (1:1.0.3-1.3) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.1602539Z Processing triggers for libc-bin (2.39-0ubuntu8.5) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.3612587Z Processing triggers for man-db (2.12.0-4build2) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:47.6441539Z Processing triggers for fontconfig (2.15.0-1.1ubuntu2) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9435144Z 
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9435720Z Running kernel seems to be up-to-date.
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9436023Z 
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9436154Z Restarting services...
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9502079Z 
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9502594Z Service restarts being deferred:
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9505951Z  systemctl restart hosted-compute-agent.service
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9506234Z 
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9506501Z No containers need to be restarted.
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9506719Z 
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9506897Z No user sessions are running outdated binaries.
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9507097Z 
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9507368Z No VM guests are running outdated hypervisor (qemu) binaries on this host.
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:50.7417178Z Downloading Chromium 140.0.7339.16 (playwright build v1187) from https://cdn.playwright.dev/dbazure/download/playwright/builds/chromium/1187/chromium-linux.zip
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:50.9770122Z |                                                                                |   0% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.1232212Z |■■■■■■■■                                                                        |  10% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.2345349Z |■■■■■■■■■■■■■■■■                                                                |  20% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.3292480Z |■■■■■■■■■■■■■■■■■■■■■■■■                                                        |  30% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.4112829Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                                |  40% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.4846121Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                        |  50% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.5578625Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                |  60% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.6284769Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                        |  70% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.6995998Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                |  80% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.7714734Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■        |  90% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.8399008Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■| 100% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.5399312Z Chromium 140.0.7339.16 (playwright build v1187) downloaded to /home/runner/.cache/ms-playwright/chromium-1187
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.5401231Z Downloading FFMPEG playwright build v1011 from https://cdn.playwright.dev/dbazure/download/playwright/builds/ffmpeg/1011/ffmpeg-linux.zip
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.6956676Z |                                                                                |   0% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7016237Z |■■■■■■■■                                                                        |  10% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7046406Z |■■■■■■■■■■■■■■■■                                                                |  20% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7069406Z |■■■■■■■■■■■■■■■■■■■■■■■■                                                        |  30% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7092821Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                                |  40% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7118728Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                        |  50% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7141908Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                |  60% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7167446Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                        |  70% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7193778Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                |  80% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7218653Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■        |  90% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7244269Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■| 100% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7881496Z FFMPEG playwright build v1011 downloaded to /home/runner/.cache/ms-playwright/ffmpeg-1011
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7884100Z Downloading Chromium Headless Shell 140.0.7339.16 (playwright build v1187) from https://cdn.playwright.dev/dbazure/download/playwright/builds/chromium/1187/chromium-headless-shell-linux.zip
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.9375128Z |                                                                                |   0% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.0417043Z |■■■■■■■■                                                                        |  10% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.1244966Z |■■■■■■■■■■■■■■■■                                                                |  20% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.1952295Z |■■■■■■■■■■■■■■■■■■■■■■■■                                                        |  30% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.2616746Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                                |  40% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.3231134Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                        |  50% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.3859377Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                |  60% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.4506704Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                        |  70% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.5160005Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                |  80% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.5723191Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■        |  90% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.6303242Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■| 100% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:58.6286304Z Chromium Headless Shell 140.0.7339.16 (playwright build v1187) downloaded to /home/runner/.cache/ms-playwright/chromium_headless_shell-1187
Smoke Tests	Run smoke tests	﻿2025-09-23T09:58:58.8489312Z ##[group]Run npm run e2e:smoke
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.8489612Z [36;1mnpm run e2e:smoke[0m
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.8519597Z shell: /usr/bin/bash -e {0}
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.8519844Z ##[endgroup]
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9627850Z 
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9628550Z > frontend@0.1.0 pree2e:smoke
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9630344Z > node -e "const p=process.cwd(); if(!p.includes('Project-Dixis/frontend')){console.error('❌ Wrong workspace:',p); process.exit(1)}"
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9631218Z 
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9918385Z 
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9918830Z > frontend@0.1.0 e2e:smoke
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9919667Z > playwright test tests/e2e/smoke.spec.ts tests/e2e/e3-docs-smoke.spec.ts
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9920219Z 
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.4838462Z 🔐 Setting up authenticated storageState files...
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.4839358Z 🔗 Using baseURL: http://127.0.0.1:3001
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.4847016Z 🧪 SMOKE TEST MODE: Creating mock storage states without server...
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.4905232Z ✅ Mock storage states created successfully!
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.4906627Z    Consumer: /home/runner/work/Project-Dixis/Project-Dixis/frontend/.auth/consumer.json
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.4908707Z    Producer: /home/runner/work/Project-Dixis/Project-Dixis/frontend/.auth/producer.json
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.6771126Z 
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.6771688Z Running 7 tests using 2 workers
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.6772074Z 
Smoke Tests	Run smoke tests	2025-09-23T09:59:11.2761300Z   ✓  2 [smoke] › tests/e2e/e3-docs-smoke.spec.ts:18:7 › PP03-E3 Documentation & Performance Smoke Tests › Homepage loads correctly (281ms)
Smoke Tests	Run smoke tests	2025-09-23T09:59:11.5314821Z   ✓  3 [smoke] › tests/e2e/e3-docs-smoke.spec.ts:50:7 › PP03-E3 Documentation & Performance Smoke Tests › Products page navigation (219ms)
Smoke Tests	Run smoke tests	2025-09-23T09:59:11.7346076Z   ✓  4 [smoke] › tests/e2e/e3-docs-smoke.spec.ts:78:7 › PP03-E3 Documentation & Performance Smoke Tests › Cart page accessibility (176ms)
Smoke Tests	Run smoke tests	2025-09-23T09:59:12.0432659Z   -  1 [smoke] › tests/e2e/smoke.spec.ts:33:7 › Smoke Tests - Lightweight Stubs › Mobile navigation shows cart link for logged-in consumer
Smoke Tests	Run smoke tests	2025-09-23T09:59:12.0449594Z   ✓  5 [smoke] › tests/e2e/e3-docs-smoke.spec.ts:108:7 › PP03-E3 Documentation & Performance Smoke Tests › Navigation elements present (278ms)
Smoke Tests	Run smoke tests	2025-09-23T09:59:28.7721441Z   ✓  6 [smoke] › tests/e2e/smoke.spec.ts:74:7 › Smoke Tests - Lightweight Stubs › Checkout happy path: from cart to confirmation (16.6s)
Smoke Tests	Run smoke tests	2025-09-23T09:59:29.5204806Z   ✓  7 [smoke] › tests/e2e/smoke.spec.ts:105:7 › Smoke Tests - Lightweight Stubs › Homepage loads with lightweight API stubs (710ms)
Smoke Tests	Run smoke tests	2025-09-23T09:59:29.6466552Z 
Smoke Tests	Run smoke tests	2025-09-23T09:59:29.6471358Z   1 skipped
Smoke Tests	Run smoke tests	2025-09-23T09:59:29.6471747Z   6 passed (29.9s)
Smoke Tests	Post Setup Node.js	﻿2025-09-23T09:59:29.6709966Z Post job cleanup.
Smoke Tests	Post Setup Node.js	2025-09-23T09:59:29.8203750Z Cache hit occurred on the primary key node-cache-Linux-x64-npm-293628c5a38b8f23887ffd4671116a273ba70156e0aac05412b18ef525fdc791, not saving cache.
Smoke Tests	Post Checkout	﻿2025-09-23T09:59:29.8325869Z Post job cleanup.
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9241728Z [command]/usr/bin/git version
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9276206Z git version 2.51.0
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9325774Z Temporarily overriding HOME='/home/runner/work/_temp/39128baf-5e9c-45e9-b19d-ca08780a1fe3' before making global git config changes
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9327311Z Adding repository directory to the temporary git global config as a safe directory
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9331938Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9364046Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9394801Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9616743Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9636429Z http.https://github.com/.extraheader
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9649208Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9681724Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
Smoke Tests	Complete job	﻿2025-09-23T09:59:30.0029323Z Cleaning up orphan processes
```

### Failing job
- URL: https://github.com/lomendor/Project-Dixis/actions/runs/17942344590/job/51021530359
- RUN_ID: 17942344590

#### Head (first 120 lines)
```
PR Hygiene Check	Set up job	﻿2025-09-23T09:56:32.8175144Z Current runner version: '2.328.0'
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8198739Z ##[group]Runner Image Provisioner
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8199577Z Hosted Compute Agent
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8200280Z Version: 20250829.383
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8200940Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8201741Z Build Date: 2025-08-29T13:48:48Z
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8202402Z ##[endgroup]
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8203018Z ##[group]Operating System
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8203845Z Ubuntu
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8204421Z 24.04.3
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8204987Z LTS
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8205508Z ##[endgroup]
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8206097Z ##[group]Runner Image
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8206684Z Image: ubuntu-24.04
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8207262Z Version: 20250907.24.1
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8208276Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8209758Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8210988Z ##[endgroup]
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8212141Z ##[group]GITHUB_TOKEN Permissions
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8214223Z Contents: read
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8214930Z Metadata: read
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8215542Z Packages: read
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8216091Z ##[endgroup]
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8218458Z Secret source: Actions
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8219235Z Prepare workflow directory
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8639793Z Prepare all required actions
PR Hygiene Check	Set up job	2025-09-23T09:56:32.8697749Z Getting action download info
PR Hygiene Check	Set up job	2025-09-23T09:56:33.2973151Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
PR Hygiene Check	Set up job	2025-09-23T09:56:33.4953991Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
PR Hygiene Check	Set up job	2025-09-23T09:56:33.6552883Z Complete job name: PR Hygiene Check
PR Hygiene Check	Checkout	﻿2025-09-23T09:56:33.7218179Z ##[group]Run actions/checkout@v4
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7219009Z with:
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7219399Z   fetch-depth: 0
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7219825Z   repository: lomendor/Project-Dixis
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7220493Z   token: ***
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7220874Z   ssh-strict: true
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7221270Z   ssh-user: git
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7221680Z   persist-credentials: true
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7222141Z   clean: true
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7222550Z   sparse-checkout-cone-mode: true
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7223015Z   fetch-tags: false
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7223419Z   show-progress: true
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7224022Z   lfs: false
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7224394Z   submodules: false
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7224814Z   set-safe-directory: true
PR Hygiene Check	Checkout	2025-09-23T09:56:33.7225494Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8288773Z Syncing repository: lomendor/Project-Dixis
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8290470Z ##[group]Getting Git version info
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8291221Z Working directory is '/home/runner/work/Project-Dixis/Project-Dixis'
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8292265Z [command]/usr/bin/git version
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8375676Z git version 2.51.0
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8401189Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8414824Z Temporarily overriding HOME='/home/runner/work/_temp/32b5132c-1518-4728-ba01-c24e6a7091db' before making global git config changes
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8416290Z Adding repository directory to the temporary git global config as a safe directory
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8419662Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8454896Z Deleting the contents of '/home/runner/work/Project-Dixis/Project-Dixis'
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8458414Z ##[group]Initializing the repository
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8462028Z [command]/usr/bin/git init /home/runner/work/Project-Dixis/Project-Dixis
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8562913Z hint: Using 'master' as the name for the initial branch. This default branch name
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8564631Z hint: is subject to change. To configure the initial branch name to use in all
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8566226Z hint: of your new repositories, which will suppress this warning, call:
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8567433Z hint:
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8568283Z hint: 	git config --global init.defaultBranch <name>
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8569718Z hint:
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8570342Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8571317Z hint: 'development'. The just-created branch can be renamed via this command:
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8572085Z hint:
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8572494Z hint: 	git branch -m <name>
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8572966Z hint:
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8573896Z hint: Disable this message with "git config set advice.defaultBranchName false"
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8575537Z Initialized empty Git repository in /home/runner/work/Project-Dixis/Project-Dixis/.git/
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8579681Z [command]/usr/bin/git remote add origin https://github.com/lomendor/Project-Dixis
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8615933Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8616808Z ##[group]Disabling automatic garbage collection
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8619707Z [command]/usr/bin/git config --local gc.auto 0
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8647435Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8648276Z ##[group]Setting up auth
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8653905Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
PR Hygiene Check	Checkout	2025-09-23T09:56:33.8682600Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
PR Hygiene Check	Checkout	2025-09-23T09:56:33.9007252Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
PR Hygiene Check	Checkout	2025-09-23T09:56:33.9039508Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
PR Hygiene Check	Checkout	2025-09-23T09:56:33.9275945Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
PR Hygiene Check	Checkout	2025-09-23T09:56:33.9321045Z ##[endgroup]
PR Hygiene Check	Checkout	2025-09-23T09:56:33.9322305Z ##[group]Fetching the repository
PR Hygiene Check	Checkout	2025-09-23T09:56:33.9332419Z [command]/usr/bin/git -c protocol.version=2 fetch --prune --no-recurse-submodules origin +refs/heads/*:refs/remotes/origin/* +refs/tags/*:refs/tags/* +ebf1026b05fec8cde8f28bd4ab69dcefdd8e7d63:refs/remotes/pull/222/merge
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2808093Z From https://github.com/lomendor/Project-Dixis
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2810465Z  * [new branch]      chore/consolidation-waitforroot-asset-docs -> origin/chore/consolidation-waitforroot-asset-docs
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2813151Z  * [new branch]      chore/e2e-webservers-and-global-setup    -> origin/chore/e2e-webservers-and-global-setup
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2815924Z  * [new branch]      chore/pg-testing-and-slim-playwright-artifacts -> origin/chore/pg-testing-and-slim-playwright-artifacts
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2818789Z  * [new branch]      chore/quality-gates-subagents            -> origin/chore/quality-gates-subagents
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2821089Z  * [new branch]      chore/smoke-integration-split            -> origin/chore/smoke-integration-split
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2823264Z  * [new branch]      chore/testing-pg-and-slim-playwright     -> origin/chore/testing-pg-and-slim-playwright
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2825621Z  * [new branch]      ci/auth-e2e-hotfix                       -> origin/ci/auth-e2e-hotfix
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2827407Z  * [new branch]      ci/consolidate-workflows                 -> origin/ci/consolidate-workflows
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2829139Z  * [new branch]      ci/fix-212-round2                        -> origin/ci/fix-212-round2
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2830964Z  * [new branch]      ci/fix-212-workflow-hardening            -> origin/ci/fix-212-workflow-hardening
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2833230Z  * [new branch]      ci/fix-e2e-shipping-timeouts             -> origin/ci/fix-e2e-shipping-timeouts
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2836002Z  * [new branch]      ci/pr216-hotfix-contracts-e2e            -> origin/ci/pr216-hotfix-contracts-e2e
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2838288Z  * [new branch]      ci/status-1758367092                     -> origin/ci/status-1758367092
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2840920Z  * [new branch]      ci/throttle-bots-concurrency-paths-ignore -> origin/ci/throttle-bots-concurrency-paths-ignore
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2844970Z  * [new branch]      dependabot/composer/backend/laravel/framework-12.30.1 -> origin/dependabot/composer/backend/laravel/framework-12.30.1
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2848395Z  * [new branch]      dependabot/composer/backend/laravel/pint-1.25.1 -> origin/dependabot/composer/backend/laravel/pint-1.25.1
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2851468Z  * [new branch]      dependabot/github_actions/actions/checkout-5 -> origin/dependabot/github_actions/actions/checkout-5
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2854774Z  * [new branch]      dependabot/github_actions/actions/setup-node-5 -> origin/dependabot/github_actions/actions/setup-node-5
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2858477Z  * [new branch]      dependabot/npm_and_yarn/backend/frontend/eslint-config-next-15.5.3 -> origin/dependabot/npm_and_yarn/backend/frontend/eslint-config-next-15.5.3
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2862515Z  * [new branch]      dependabot/npm_and_yarn/backend/frontend/multi-0c18ad9c18 -> origin/dependabot/npm_and_yarn/backend/frontend/multi-0c18ad9c18
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2866569Z  * [new branch]      dependabot/npm_and_yarn/backend/frontend/multi-70832524d6 -> origin/dependabot/npm_and_yarn/backend/frontend/multi-70832524d6
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2870634Z  * [new branch]      dependabot/npm_and_yarn/backend/frontend/tailwindcss/postcss-4.1.13 -> origin/dependabot/npm_and_yarn/backend/frontend/tailwindcss/postcss-4.1.13
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2874824Z  * [new branch]      dependabot/npm_and_yarn/backend/frontend/types/node-24.5.2 -> origin/dependabot/npm_and_yarn/backend/frontend/types/node-24.5.2
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2877697Z  * [new branch]      docs/audit-ci-20250905                   -> origin/docs/audit-ci-20250905
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2879785Z  * [new branch]      feat/account-orders-history              -> origin/feat/account-orders-history
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2882207Z  * [new branch]      feat/admin-light-panel                   -> origin/feat/admin-light-panel
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2884202Z  * [new branch]      feat/api-orders-v1                       -> origin/feat/api-orders-v1
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2886062Z  * [new branch]      feat/api-producers-v1                    -> origin/feat/api-producers-v1
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2888425Z  * [new branch]      feat/api-products-v1-embedded-producer   -> origin/feat/api-products-v1-embedded-producer
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2890864Z  * [new branch]      feat/api-readonly-v1                     -> origin/feat/api-readonly-v1
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2892686Z  * [new branch]      feat/api-smoke-tests                     -> origin/feat/api-smoke-tests
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2894757Z  * [new branch]      feat/cart-summary-hygiene                -> origin/feat/cart-summary-hygiene
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2896813Z  * [new branch]      feat/checkout-flow-completion            -> origin/feat/checkout-flow-completion
PR Hygiene Check	Checkout	2025-09-23T09:56:35.2898852Z  * [new branch]      feat/ci-e2e-guardrails                   -> origin/feat/ci-e2e-guardrails
```

#### Tail (last 120 lines)
```
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:19.6694750Z Preparing to unpack .../7-xfonts-utils_1%3a7.7+6build3_amd64.deb ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:19.6702250Z Unpacking xfonts-utils (1:7.7+6build3) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:19.9541022Z Selecting previously unselected package xfonts-cyrillic.
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:19.9671035Z Preparing to unpack .../8-xfonts-cyrillic_1%3a1.0.5+nmu1_all.deb ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:19.9678724Z Unpacking xfonts-cyrillic (1:1.0.5+nmu1) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0010785Z Selecting previously unselected package xfonts-scalable.
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0139834Z Preparing to unpack .../9-xfonts-scalable_1%3a1.0.3-1.3_all.deb ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0147860Z Unpacking xfonts-scalable (1:1.0.3-1.3) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0557229Z Setting up fonts-wqy-zenhei (0.9.45-8) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0669292Z Setting up fonts-freefont-ttf (20211204+svn4273-2) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0688583Z Setting up fonts-tlwg-loma-otf (1:0.7.3-1) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0706868Z Setting up xfonts-encodings (1:1.0.5-0ubuntu2) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0726627Z Setting up fonts-ipafont-gothic (00303-21ubuntu1) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0790094Z update-alternatives: using /usr/share/fonts/opentype/ipafont-gothic/ipag.ttf to provide /usr/share/fonts/truetype/fonts-japanese-gothic.ttf (fonts-japanese-gothic.ttf) in auto mode
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0804376Z Setting up libcups2t64:amd64 (2.4.7-1.2ubuntu7.4) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0822856Z Setting up fonts-unifont (1:15.1.01-1build1) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0840638Z Setting up xfonts-utils (1:7.7+6build3) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.0879794Z Setting up xfonts-cyrillic (1:1.0.5+nmu1) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.1343622Z Setting up xfonts-scalable (1:1.0.3-1.3) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.1602539Z Processing triggers for libc-bin (2.39-0ubuntu8.5) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:57:20.3612587Z Processing triggers for man-db (2.12.0-4build2) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:47.6441539Z Processing triggers for fontconfig (2.15.0-1.1ubuntu2) ...
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9435144Z 
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9435720Z Running kernel seems to be up-to-date.
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9436023Z 
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9436154Z Restarting services...
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9502079Z 
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9502594Z Service restarts being deferred:
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9505951Z  systemctl restart hosted-compute-agent.service
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9506234Z 
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9506501Z No containers need to be restarted.
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9506719Z 
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9506897Z No user sessions are running outdated binaries.
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9507097Z 
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:49.9507368Z No VM guests are running outdated hypervisor (qemu) binaries on this host.
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:50.7417178Z Downloading Chromium 140.0.7339.16 (playwright build v1187) from https://cdn.playwright.dev/dbazure/download/playwright/builds/chromium/1187/chromium-linux.zip
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:50.9770122Z |                                                                                |   0% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.1232212Z |■■■■■■■■                                                                        |  10% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.2345349Z |■■■■■■■■■■■■■■■■                                                                |  20% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.3292480Z |■■■■■■■■■■■■■■■■■■■■■■■■                                                        |  30% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.4112829Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                                |  40% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.4846121Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                        |  50% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.5578625Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                |  60% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.6284769Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                        |  70% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.6995998Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                |  80% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.7714734Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■        |  90% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:51.8399008Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■| 100% of 173.7 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.5399312Z Chromium 140.0.7339.16 (playwright build v1187) downloaded to /home/runner/.cache/ms-playwright/chromium-1187
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.5401231Z Downloading FFMPEG playwright build v1011 from https://cdn.playwright.dev/dbazure/download/playwright/builds/ffmpeg/1011/ffmpeg-linux.zip
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.6956676Z |                                                                                |   0% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7016237Z |■■■■■■■■                                                                        |  10% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7046406Z |■■■■■■■■■■■■■■■■                                                                |  20% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7069406Z |■■■■■■■■■■■■■■■■■■■■■■■■                                                        |  30% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7092821Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                                |  40% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7118728Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                        |  50% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7141908Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                |  60% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7167446Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                        |  70% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7193778Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                |  80% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7218653Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■        |  90% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7244269Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■| 100% of 2.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7881496Z FFMPEG playwright build v1011 downloaded to /home/runner/.cache/ms-playwright/ffmpeg-1011
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.7884100Z Downloading Chromium Headless Shell 140.0.7339.16 (playwright build v1187) from https://cdn.playwright.dev/dbazure/download/playwright/builds/chromium/1187/chromium-headless-shell-linux.zip
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:55.9375128Z |                                                                                |   0% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.0417043Z |■■■■■■■■                                                                        |  10% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.1244966Z |■■■■■■■■■■■■■■■■                                                                |  20% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.1952295Z |■■■■■■■■■■■■■■■■■■■■■■■■                                                        |  30% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.2616746Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                                |  40% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.3231134Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                        |  50% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.3859377Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                                |  60% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.4506704Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                        |  70% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.5160005Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                |  80% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.5723191Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■        |  90% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:56.6303242Z |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■| 100% of 104.3 MiB
Smoke Tests	Install Playwright browsers	2025-09-23T09:58:58.6286304Z Chromium Headless Shell 140.0.7339.16 (playwright build v1187) downloaded to /home/runner/.cache/ms-playwright/chromium_headless_shell-1187
Smoke Tests	Run smoke tests	﻿2025-09-23T09:58:58.8489312Z ##[group]Run npm run e2e:smoke
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.8489612Z [36;1mnpm run e2e:smoke[0m
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.8519597Z shell: /usr/bin/bash -e {0}
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.8519844Z ##[endgroup]
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9627850Z 
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9628550Z > frontend@0.1.0 pree2e:smoke
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9630344Z > node -e "const p=process.cwd(); if(!p.includes('Project-Dixis/frontend')){console.error('❌ Wrong workspace:',p); process.exit(1)}"
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9631218Z 
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9918385Z 
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9918830Z > frontend@0.1.0 e2e:smoke
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9919667Z > playwright test tests/e2e/smoke.spec.ts tests/e2e/e3-docs-smoke.spec.ts
Smoke Tests	Run smoke tests	2025-09-23T09:58:58.9920219Z 
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.4838462Z 🔐 Setting up authenticated storageState files...
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.4839358Z 🔗 Using baseURL: http://127.0.0.1:3001
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.4847016Z 🧪 SMOKE TEST MODE: Creating mock storage states without server...
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.4905232Z ✅ Mock storage states created successfully!
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.4906627Z    Consumer: /home/runner/work/Project-Dixis/Project-Dixis/frontend/.auth/consumer.json
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.4908707Z    Producer: /home/runner/work/Project-Dixis/Project-Dixis/frontend/.auth/producer.json
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.6771126Z 
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.6771688Z Running 7 tests using 2 workers
Smoke Tests	Run smoke tests	2025-09-23T09:59:08.6772074Z 
Smoke Tests	Run smoke tests	2025-09-23T09:59:11.2761300Z   ✓  2 [smoke] › tests/e2e/e3-docs-smoke.spec.ts:18:7 › PP03-E3 Documentation & Performance Smoke Tests › Homepage loads correctly (281ms)
Smoke Tests	Run smoke tests	2025-09-23T09:59:11.5314821Z   ✓  3 [smoke] › tests/e2e/e3-docs-smoke.spec.ts:50:7 › PP03-E3 Documentation & Performance Smoke Tests › Products page navigation (219ms)
Smoke Tests	Run smoke tests	2025-09-23T09:59:11.7346076Z   ✓  4 [smoke] › tests/e2e/e3-docs-smoke.spec.ts:78:7 › PP03-E3 Documentation & Performance Smoke Tests › Cart page accessibility (176ms)
Smoke Tests	Run smoke tests	2025-09-23T09:59:12.0432659Z   -  1 [smoke] › tests/e2e/smoke.spec.ts:33:7 › Smoke Tests - Lightweight Stubs › Mobile navigation shows cart link for logged-in consumer
Smoke Tests	Run smoke tests	2025-09-23T09:59:12.0449594Z   ✓  5 [smoke] › tests/e2e/e3-docs-smoke.spec.ts:108:7 › PP03-E3 Documentation & Performance Smoke Tests › Navigation elements present (278ms)
Smoke Tests	Run smoke tests	2025-09-23T09:59:28.7721441Z   ✓  6 [smoke] › tests/e2e/smoke.spec.ts:74:7 › Smoke Tests - Lightweight Stubs › Checkout happy path: from cart to confirmation (16.6s)
Smoke Tests	Run smoke tests	2025-09-23T09:59:29.5204806Z   ✓  7 [smoke] › tests/e2e/smoke.spec.ts:105:7 › Smoke Tests - Lightweight Stubs › Homepage loads with lightweight API stubs (710ms)
Smoke Tests	Run smoke tests	2025-09-23T09:59:29.6466552Z 
Smoke Tests	Run smoke tests	2025-09-23T09:59:29.6471358Z   1 skipped
Smoke Tests	Run smoke tests	2025-09-23T09:59:29.6471747Z   6 passed (29.9s)
Smoke Tests	Post Setup Node.js	﻿2025-09-23T09:59:29.6709966Z Post job cleanup.
Smoke Tests	Post Setup Node.js	2025-09-23T09:59:29.8203750Z Cache hit occurred on the primary key node-cache-Linux-x64-npm-293628c5a38b8f23887ffd4671116a273ba70156e0aac05412b18ef525fdc791, not saving cache.
Smoke Tests	Post Checkout	﻿2025-09-23T09:59:29.8325869Z Post job cleanup.
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9241728Z [command]/usr/bin/git version
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9276206Z git version 2.51.0
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9325774Z Temporarily overriding HOME='/home/runner/work/_temp/39128baf-5e9c-45e9-b19d-ca08780a1fe3' before making global git config changes
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9327311Z Adding repository directory to the temporary git global config as a safe directory
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9331938Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9364046Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9394801Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9616743Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9636429Z http.https://github.com/.extraheader
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9649208Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
Smoke Tests	Post Checkout	2025-09-23T09:59:29.9681724Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
Smoke Tests	Complete job	﻿2025-09-23T09:59:30.0029323Z Cleaning up orphan processes
```

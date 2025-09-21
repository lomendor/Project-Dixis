# PR #216 — CI Failure Snapshot (2025-09-21)

Failing run: https://github.com/lomendor/Project-Dixis/actions/runs/17897875124/job/50886940166

## Head (first 120)

backend	Set up job	﻿2025-09-21T19:16:26.8359802Z Current runner version: '2.328.0'
backend	Set up job	2025-09-21T19:16:26.8382630Z ##[group]Runner Image Provisioner
backend	Set up job	2025-09-21T19:16:26.8383402Z Hosted Compute Agent
backend	Set up job	2025-09-21T19:16:26.8384013Z Version: 20250829.383
backend	Set up job	2025-09-21T19:16:26.8384594Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
backend	Set up job	2025-09-21T19:16:26.8385599Z Build Date: 2025-08-29T13:48:48Z
backend	Set up job	2025-09-21T19:16:26.8386269Z ##[endgroup]
backend	Set up job	2025-09-21T19:16:26.8386824Z ##[group]Operating System
backend	Set up job	2025-09-21T19:16:26.8387389Z Ubuntu
backend	Set up job	2025-09-21T19:16:26.8387817Z 24.04.3
backend	Set up job	2025-09-21T19:16:26.8388338Z LTS
backend	Set up job	2025-09-21T19:16:26.8388751Z ##[endgroup]
backend	Set up job	2025-09-21T19:16:26.8389213Z ##[group]Runner Image
backend	Set up job	2025-09-21T19:16:26.8389803Z Image: ubuntu-24.04
backend	Set up job	2025-09-21T19:16:26.8390352Z Version: 20250907.24.1
backend	Set up job	2025-09-21T19:16:26.8391335Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
backend	Set up job	2025-09-21T19:16:26.8392734Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
backend	Set up job	2025-09-21T19:16:26.8393853Z ##[endgroup]
backend	Set up job	2025-09-21T19:16:26.8395363Z ##[group]GITHUB_TOKEN Permissions
backend	Set up job	2025-09-21T19:16:26.8397166Z Contents: read
backend	Set up job	2025-09-21T19:16:26.8397802Z Metadata: read
backend	Set up job	2025-09-21T19:16:26.8398260Z Packages: read
backend	Set up job	2025-09-21T19:16:26.8398738Z ##[endgroup]
backend	Set up job	2025-09-21T19:16:26.8400990Z Secret source: Actions
backend	Set up job	2025-09-21T19:16:26.8401718Z Prepare workflow directory
backend	Set up job	2025-09-21T19:16:26.8817587Z Prepare all required actions
backend	Set up job	2025-09-21T19:16:26.8854382Z Getting action download info
backend	Set up job	2025-09-21T19:16:27.2733818Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
backend	Set up job	2025-09-21T19:16:27.4653404Z Download action repository 'shivammathur/setup-php@v2' (SHA:bf6b4fbd49ca58e4608c9c89fba0b8d90bd2a39f)
backend	Set up job	2025-09-21T19:16:28.2122489Z Complete job name: backend
backend	Initialize containers	﻿2025-09-21T19:16:28.2624194Z ##[group]Checking docker version
backend	Initialize containers	2025-09-21T19:16:28.2636984Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
backend	Initialize containers	2025-09-21T19:16:28.3664257Z '1.48'
backend	Initialize containers	2025-09-21T19:16:28.3676368Z Docker daemon API version: '1.48'
backend	Initialize containers	2025-09-21T19:16:28.3677205Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
backend	Initialize containers	2025-09-21T19:16:28.3827196Z '1.48'
backend	Initialize containers	2025-09-21T19:16:28.3840363Z Docker client API version: '1.48'
backend	Initialize containers	2025-09-21T19:16:28.3846410Z ##[endgroup]
backend	Initialize containers	2025-09-21T19:16:28.3849400Z ##[group]Clean up resources from previous jobs
backend	Initialize containers	2025-09-21T19:16:28.3854902Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=2d313b"
backend	Initialize containers	2025-09-21T19:16:28.3987656Z ##[command]/usr/bin/docker network prune --force --filter "label=2d313b"
backend	Initialize containers	2025-09-21T19:16:28.4111895Z ##[endgroup]
backend	Initialize containers	2025-09-21T19:16:28.4112441Z ##[group]Create local container network
backend	Initialize containers	2025-09-21T19:16:28.4123100Z ##[command]/usr/bin/docker network create --label 2d313b github_network_733c8049b05d4e6b8e1c05359a1de5b5
backend	Initialize containers	2025-09-21T19:16:28.4639475Z 40bec14281c9ba4581774e8efa4feab4c7802e67f54a1e77fcb2f9c61b396851
backend	Initialize containers	2025-09-21T19:16:28.4658031Z ##[endgroup]
backend	Initialize containers	2025-09-21T19:16:28.4681425Z ##[group]Starting postgres service container
backend	Initialize containers	2025-09-21T19:16:28.4700611Z ##[command]/usr/bin/docker pull postgres:15
backend	Initialize containers	2025-09-21T19:16:29.4382274Z 15: Pulling from library/postgres
backend	Initialize containers	2025-09-21T19:16:29.6646076Z ce1261c6d567: Pulling fs layer
backend	Initialize containers	2025-09-21T19:16:29.6647612Z 80ed16669c95: Pulling fs layer
backend	Initialize containers	2025-09-21T19:16:29.6648509Z 4e5806601837: Pulling fs layer
backend	Initialize containers	2025-09-21T19:16:29.6649277Z b18445125df5: Pulling fs layer
backend	Initialize containers	2025-09-21T19:16:29.6650239Z 874a3ca0fb79: Pulling fs layer
backend	Initialize containers	2025-09-21T19:16:29.6651282Z 38a0056e8c05: Pulling fs layer
backend	Initialize containers	2025-09-21T19:16:29.6652398Z cb4494753109: Pulling fs layer
backend	Initialize containers	2025-09-21T19:16:29.6653308Z 9286f415f93a: Pulling fs layer
backend	Initialize containers	2025-09-21T19:16:29.6654218Z 60570350e677: Pulling fs layer
backend	Initialize containers	2025-09-21T19:16:29.6655197Z 0b33c9cfc245: Pulling fs layer
backend	Initialize containers	2025-09-21T19:16:29.6656174Z f082d788df98: Pulling fs layer
backend	Initialize containers	2025-09-21T19:16:29.6657005Z b2ae65346945: Pulling fs layer
backend	Initialize containers	2025-09-21T19:16:29.6657900Z 3e69ab42557e: Pulling fs layer
backend	Initialize containers	2025-09-21T19:16:29.6658725Z f35e17a433de: Pulling fs layer
backend	Initialize containers	2025-09-21T19:16:29.6659590Z 9286f415f93a: Waiting
backend	Initialize containers	2025-09-21T19:16:29.6660680Z 60570350e677: Waiting
backend	Initialize containers	2025-09-21T19:16:29.6661379Z 0b33c9cfc245: Waiting
backend	Initialize containers	2025-09-21T19:16:29.6662077Z f082d788df98: Waiting
backend	Initialize containers	2025-09-21T19:16:29.6662788Z b2ae65346945: Waiting
backend	Initialize containers	2025-09-21T19:16:29.6663485Z 3e69ab42557e: Waiting
backend	Initialize containers	2025-09-21T19:16:29.6664191Z f35e17a433de: Waiting
backend	Initialize containers	2025-09-21T19:16:29.6664881Z 874a3ca0fb79: Waiting
backend	Initialize containers	2025-09-21T19:16:29.6665814Z 38a0056e8c05: Waiting
backend	Initialize containers	2025-09-21T19:16:29.6666507Z cb4494753109: Waiting
backend	Initialize containers	2025-09-21T19:16:29.6667218Z b18445125df5: Waiting
backend	Initialize containers	2025-09-21T19:16:29.9522942Z 80ed16669c95: Verifying Checksum
backend	Initialize containers	2025-09-21T19:16:29.9525758Z 80ed16669c95: Download complete
backend	Initialize containers	2025-09-21T19:16:30.1135604Z 4e5806601837: Verifying Checksum
backend	Initialize containers	2025-09-21T19:16:30.1137557Z 4e5806601837: Download complete
backend	Initialize containers	2025-09-21T19:16:30.3179318Z b18445125df5: Verifying Checksum
backend	Initialize containers	2025-09-21T19:16:30.3179955Z b18445125df5: Download complete
backend	Initialize containers	2025-09-21T19:16:30.6562140Z 874a3ca0fb79: Verifying Checksum
backend	Initialize containers	2025-09-21T19:16:30.6563533Z 874a3ca0fb79: Download complete
backend	Initialize containers	2025-09-21T19:16:30.6596687Z 38a0056e8c05: Verifying Checksum
backend	Initialize containers	2025-09-21T19:16:30.6597352Z 38a0056e8c05: Download complete
backend	Initialize containers	2025-09-21T19:16:30.6960074Z ce1261c6d567: Verifying Checksum
backend	Initialize containers	2025-09-21T19:16:30.6961179Z ce1261c6d567: Download complete
backend	Initialize containers	2025-09-21T19:16:30.9384928Z cb4494753109: Verifying Checksum
backend	Initialize containers	2025-09-21T19:16:30.9386172Z cb4494753109: Download complete
backend	Initialize containers	2025-09-21T19:16:31.0380177Z 9286f415f93a: Verifying Checksum
backend	Initialize containers	2025-09-21T19:16:31.0380737Z 9286f415f93a: Download complete
backend	Initialize containers	2025-09-21T19:16:31.2072582Z 0b33c9cfc245: Download complete
backend	Initialize containers	2025-09-21T19:16:31.3204187Z f082d788df98: Verifying Checksum
backend	Initialize containers	2025-09-21T19:16:31.3204814Z f082d788df98: Download complete
backend	Initialize containers	2025-09-21T19:16:31.5273842Z b2ae65346945: Download complete
backend	Initialize containers	2025-09-21T19:16:31.6311233Z 3e69ab42557e: Verifying Checksum
backend	Initialize containers	2025-09-21T19:16:31.6311840Z 3e69ab42557e: Download complete
backend	Initialize containers	2025-09-21T19:16:31.6571766Z ce1261c6d567: Pull complete
backend	Initialize containers	2025-09-21T19:16:31.8667820Z f35e17a433de: Verifying Checksum
backend	Initialize containers	2025-09-21T19:16:31.8672016Z f35e17a433de: Download complete
backend	Initialize containers	2025-09-21T19:16:32.3258012Z 60570350e677: Verifying Checksum
backend	Initialize containers	2025-09-21T19:16:32.3258557Z 60570350e677: Download complete
backend	Initialize containers	2025-09-21T19:16:32.6200911Z 80ed16669c95: Pull complete
backend	Initialize containers	2025-09-21T19:16:32.8083885Z 4e5806601837: Pull complete
backend	Initialize containers	2025-09-21T19:16:32.8586543Z b18445125df5: Pull complete
backend	Initialize containers	2025-09-21T19:16:33.1673427Z 874a3ca0fb79: Pull complete
backend	Initialize containers	2025-09-21T19:16:33.2693455Z 38a0056e8c05: Pull complete
backend	Initialize containers	2025-09-21T19:16:33.2830794Z cb4494753109: Pull complete
backend	Initialize containers	2025-09-21T19:16:33.2962391Z 9286f415f93a: Pull complete
backend	Initialize containers	2025-09-21T19:16:36.2259019Z 60570350e677: Pull complete
backend	Initialize containers	2025-09-21T19:16:36.2480833Z 0b33c9cfc245: Pull complete
backend	Initialize containers	2025-09-21T19:16:36.2607568Z f082d788df98: Pull complete
backend	Initialize containers	2025-09-21T19:16:36.2748871Z b2ae65346945: Pull complete
backend	Initialize containers	2025-09-21T19:16:36.2901400Z 3e69ab42557e: Pull complete
backend	Initialize containers	2025-09-21T19:16:36.3039771Z f35e17a433de: Pull complete
backend	Initialize containers	2025-09-21T19:16:36.3098659Z Digest: sha256:1cd9dd548427751dc0fabb24a3bdf96a6dd08c0025a167ecbb5c14bec21ff94c
backend	Initialize containers	2025-09-21T19:16:36.3117818Z Status: Downloaded newer image for postgres:15
backend	Initialize containers	2025-09-21T19:16:36.3169029Z docker.io/library/postgres:15
backend	Initialize containers	2025-09-21T19:16:36.3228985Z ##[command]/usr/bin/docker create --name eaba9b474deb4e09af91f2efd8d81d23_postgres15_92fd9d --label 2d313b --network github_network_733c8049b05d4e6b8e1c05359a1de5b5 --network-alias postgres -p 5432:5432 --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5 -e "POSTGRES_PASSWORD=postgres" -e "POSTGRES_DB=project_dixis_test" -e GITHUB_ACTIONS=true -e CI=true postgres:15
backend	Initialize containers	2025-09-21T19:16:36.3497294Z 25522c14bdcfcdedca0c7c8f6a17d47b827a9d1770311d06bbdbfe9bba9132c6
backend	Initialize containers	2025-09-21T19:16:36.3518947Z ##[command]/usr/bin/docker start 25522c14bdcfcdedca0c7c8f6a17d47b827a9d1770311d06bbdbfe9bba9132c6

## Tail (last 120)

frontend	Build	2025-09-21T19:18:50.4330695Z    ▲ Next.js 15.5.0
frontend	Build	2025-09-21T19:18:50.4331261Z
frontend	Build	2025-09-21T19:18:50.5296740Z    Creating an optimized production build ...
frontend	Build	2025-09-21T19:19:00.7351270Z  ✓ Compiled successfully in 10.1s
frontend	Build	2025-09-21T19:19:00.7399788Z    Skipping linting
frontend	Build	2025-09-21T19:19:00.7401709Z    Checking validity of types ...
frontend	Build	2025-09-21T19:19:07.0457668Z    Collecting page data ...
frontend	Build	2025-09-21T19:19:09.3121329Z    Generating static pages (0/33) ...
frontend	Build	2025-09-21T19:19:09.9330085Z    Generating static pages (8/33)
frontend	Build	2025-09-21T19:19:10.0052461Z    Generating static pages (16/33)
frontend	Build	2025-09-21T19:19:10.1063379Z    Generating static pages (24/33)
frontend	Build	2025-09-21T19:19:10.2361089Z  ✓ Generating static pages (33/33)
frontend	Build	2025-09-21T19:19:11.0971709Z    Finalizing page optimization ...
frontend	Build	2025-09-21T19:19:11.0972837Z    Collecting build traces ...
frontend	Build	2025-09-21T19:19:17.8730168Z
frontend	Build	2025-09-21T19:19:17.8809590Z Route (app)                                  Size  First Load JS
frontend	Build	2025-09-21T19:19:17.8810630Z ┌ ○ /                                     6.41 kB         121 kB
frontend	Build	2025-09-21T19:19:17.8811346Z ├ ○ /_not-found                             998 B         103 kB
frontend	Build	2025-09-21T19:19:17.8811813Z ├ ○ /account/orders                       4.38 kB         110 kB
frontend	Build	2025-09-21T19:19:17.8812279Z ├ ƒ /account/orders/[orderId]             5.45 kB         116 kB
frontend	Build	2025-09-21T19:19:17.8812740Z ├ ○ /admin/analytics                       3.9 kB         180 kB
frontend	Build	2025-09-21T19:19:17.8813187Z ├ ○ /admin/orders                          3.6 kB         105 kB
frontend	Build	2025-09-21T19:19:17.8813639Z ├ ○ /admin/pricing                        5.02 kB         120 kB
frontend	Build	2025-09-21T19:19:17.8814097Z ├ ○ /admin/producers                      4.91 kB         107 kB
frontend	Build	2025-09-21T19:19:17.8814784Z ├ ○ /admin/toggle                         4.52 kB         106 kB
frontend	Build	2025-09-21T19:19:17.8815272Z ├ ƒ /api/admin/orders/[id]/update-status    170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8815790Z ├ ƒ /api/admin/producers                    170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8816268Z ├ ƒ /api/admin/producers/[id]/approve       170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8816758Z ├ ƒ /api/admin/producers/[id]/reject        170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8817230Z ├ ƒ /api/checkout/address                   170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8818428Z ├ ƒ /api/checkout/pay                       170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8819347Z ├ ƒ /api/checkout/quote                     170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8820237Z ├ ƒ /api/producer/onboarding                170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8821096Z ├ ƒ /api/producer/orders/[id]/ship          170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8821877Z ├ ƒ /api/producer/products                  170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8822379Z ├ ƒ /api/producer/status                    170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8822843Z ├ ƒ /api/v1/lockers/search                  170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8823331Z ├ ƒ /api/v1/shipping/quote                  170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8823782Z ├ ○ /auth/login                           3.87 kB         109 kB
frontend	Build	2025-09-21T19:19:17.8824533Z ├ ○ /auth/register                        4.08 kB         109 kB
frontend	Build	2025-09-21T19:19:17.8824962Z ├ ○ /cart                                 26.8 kB         149 kB
frontend	Build	2025-09-21T19:19:17.8825385Z ├ ○ /checkout                             5.56 kB         107 kB
frontend	Build	2025-09-21T19:19:17.8825831Z ├ ƒ /checkout/payment/[orderId]           9.52 kB         119 kB
frontend	Build	2025-09-21T19:19:17.8826301Z ├ ○ /manifest.webmanifest                   170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8826799Z ├ ƒ /order/confirmation/[orderId]         5.13 kB         110 kB
frontend	Build	2025-09-21T19:19:17.8827242Z ├ ƒ /orders/[id]                          2.44 kB         112 kB
frontend	Build	2025-09-21T19:19:17.8827685Z ├ ○ /producer/analytics                   4.11 kB         180 kB
frontend	Build	2025-09-21T19:19:17.8828670Z ├ ○ /producer/dashboard                   3.51 kB         113 kB
frontend	Build	2025-09-21T19:19:17.8829548Z ├ ○ /producer/onboarding                  5.78 kB         108 kB
frontend	Build	2025-09-21T19:19:17.8830400Z ├ ○ /producer/orders                      4.08 kB         106 kB
frontend	Build	2025-09-21T19:19:17.8831243Z ├ ○ /producer/products                    5.57 kB         107 kB
frontend	Build	2025-09-21T19:19:17.8832039Z ├ ƒ /products/[id]                        6.38 kB         129 kB
frontend	Build	2025-09-21T19:19:17.8832541Z ├ ○ /robots.txt                             170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8832972Z ├ ○ /sitemap.xml                            170 B         102 kB
frontend	Build	2025-09-21T19:19:17.8833396Z └ ○ /test-error                           2.88 kB         128 kB
frontend	Build	2025-09-21T19:19:17.8833764Z + First Load JS shared by all              102 kB
frontend	Build	2025-09-21T19:19:17.8834194Z   ├ chunks/1255-70f71da5b64d662c.js       45.7 kB
frontend	Build	2025-09-21T19:19:17.8834829Z   ├ chunks/4bd1b696-f785427dddbba9fb.js   54.2 kB
frontend	Build	2025-09-21T19:19:17.8835460Z   └ other shared chunks (total)           1.93 kB
frontend	Build	2025-09-21T19:19:17.8835750Z
frontend	Build	2025-09-21T19:19:17.8836377Z Route (pages)                                Size  First Load JS
frontend	Build	2025-09-21T19:19:17.8837102Z ─ ƒ /api/csp-report                           0 B        96.4 kB
frontend	Build	2025-09-21T19:19:17.8837659Z + First Load JS shared by all             96.4 kB
frontend	Build	2025-09-21T19:19:17.8838358Z   ├ chunks/framework-b9fffb5537caa07c.js  57.7 kB
frontend	Build	2025-09-21T19:19:17.8838850Z   ├ chunks/main-87580715e16894aa.js       36.8 kB
frontend	Build	2025-09-21T19:19:17.8839324Z   └ other shared chunks (total)            1.9 kB
frontend	Build	2025-09-21T19:19:17.8839575Z
frontend	Build	2025-09-21T19:19:17.8839840Z ƒ Middleware                              34.6 kB
frontend	Build	2025-09-21T19:19:17.8840084Z
frontend	Build	2025-09-21T19:19:17.8840344Z ○  (Static)   prerendered as static content
frontend	Build	2025-09-21T19:19:17.8840826Z ƒ  (Dynamic)  server-rendered on demand
frontend	Build	2025-09-21T19:19:17.8841054Z
frontend	Start frontend server	﻿2025-09-21T19:19:17.9529395Z ##[group]Run cd frontend && npm run start &
frontend	Start frontend server	2025-09-21T19:19:17.9529752Z [36;1mcd frontend && npm run start &[0m
frontend	Start frontend server	2025-09-21T19:19:17.9559826Z shell: /usr/bin/bash -e {0}
frontend	Start frontend server	2025-09-21T19:19:17.9560085Z ##[endgroup]
frontend	Start frontend server	2025-09-21T19:19:18.0749336Z
frontend	Start frontend server	2025-09-21T19:19:18.0750005Z > frontend@0.1.0 start
frontend	Start frontend server	2025-09-21T19:19:18.0750484Z > next start
frontend	Start frontend server	2025-09-21T19:19:18.0750701Z
frontend	Start frontend server	2025-09-21T19:19:18.3254272Z    ▲ Next.js 15.5.0
frontend	Start frontend server	2025-09-21T19:19:18.3257288Z    - Local:        http://localhost:3000
frontend	Start frontend server	2025-09-21T19:19:18.3258191Z    - Network:      http://10.1.0.214:3000
frontend	Start frontend server	2025-09-21T19:19:18.3258627Z
frontend	Start frontend server	2025-09-21T19:19:18.3259488Z  ✓ Starting...
frontend	Start frontend server	2025-09-21T19:19:18.7744420Z  ✓ Ready in 600ms
frontend	Wait for frontend	﻿2025-09-21T19:19:22.9639486Z ##[group]Run npx wait-on http://127.0.0.1:3001 --timeout 60000
frontend	Wait for frontend	2025-09-21T19:19:22.9639942Z [36;1mnpx wait-on http://127.0.0.1:3001 --timeout 60000[0m
frontend	Wait for frontend	2025-09-21T19:19:22.9669227Z shell: /usr/bin/bash -e {0}
frontend	Wait for frontend	2025-09-21T19:19:22.9669464Z ##[endgroup]
frontend	Wait for frontend	2025-09-21T19:19:23.7812544Z npm warn exec The following package was not found and will be installed: wait-on@9.0.1
frontend	Wait for frontend	2025-09-21T19:20:25.7743176Z Error: Timed out waiting for: http://127.0.0.1:3001
frontend	Wait for frontend	2025-09-21T19:20:25.7744318Z     at /home/runner/.npm/_npx/04d57496964ca6d1/node_modules/wait-on/lib/wait-on.js:131:31
frontend	Wait for frontend	2025-09-21T19:20:25.7745693Z     at doInnerSub (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/operators/mergeInternals.js:22:31)
frontend	Wait for frontend	2025-09-21T19:20:25.7746952Z     at outerNext (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/operators/mergeInternals.js:17:70)
frontend	Wait for frontend	2025-09-21T19:20:25.7748543Z     at OperatorSubscriber._this._next (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/operators/OperatorSubscriber.js:33:21)
frontend	Wait for frontend	2025-09-21T19:20:25.7749643Z     at Subscriber.next (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/Subscriber.js:51:18)
frontend	Wait for frontend	2025-09-21T19:20:25.7750505Z     at AsyncAction.work (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/observable/timer.js:28:28)
frontend	Wait for frontend	2025-09-21T19:20:25.7751410Z     at AsyncAction._execute (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/scheduler/AsyncAction.js:79:18)
frontend	Wait for frontend	2025-09-21T19:20:25.7752605Z     at AsyncAction.execute (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/scheduler/AsyncAction.js:67:26)
frontend	Wait for frontend	2025-09-21T19:20:25.7753775Z     at AsyncScheduler.flush (/home/runner/.npm/_npx/04d57496964ca6d1/node_modules/rxjs/dist/cjs/internal/scheduler/AsyncScheduler.js:38:33)
frontend	Wait for frontend	2025-09-21T19:20:25.7754583Z     at listOnTimeout (node:internal/timers:581:17)
frontend	Wait for frontend	2025-09-21T19:20:25.7901526Z ##[error]Process completed with exit code 1.
frontend	Post Run actions/checkout@v4	﻿2025-09-21T19:20:25.8022744Z Post job cleanup.
frontend	Post Run actions/checkout@v4	2025-09-21T19:20:25.8991967Z [command]/usr/bin/git version
frontend	Post Run actions/checkout@v4	2025-09-21T19:20:25.9039182Z git version 2.51.0
frontend	Post Run actions/checkout@v4	2025-09-21T19:20:25.9084606Z Temporarily overriding HOME='/home/runner/work/_temp/af38f56a-48af-4332-a3ec-f95799079da8' before making global git config changes
frontend	Post Run actions/checkout@v4	2025-09-21T19:20:25.9085689Z Adding repository directory to the temporary git global config as a safe directory
frontend	Post Run actions/checkout@v4	2025-09-21T19:20:25.9090518Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
frontend	Post Run actions/checkout@v4	2025-09-21T19:20:25.9128903Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
frontend	Post Run actions/checkout@v4	2025-09-21T19:20:25.9163429Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
frontend	Post Run actions/checkout@v4	2025-09-21T19:20:25.9397619Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
frontend	Post Run actions/checkout@v4	2025-09-21T19:20:25.9420910Z http.https://github.com/.extraheader
frontend	Post Run actions/checkout@v4	2025-09-21T19:20:25.9433725Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
frontend	Post Run actions/checkout@v4	2025-09-21T19:20:25.9465796Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
frontend	Complete job	﻿2025-09-21T19:20:25.9809711Z Cleaning up orphan processes
frontend	Complete job	2025-09-21T19:20:26.0082484Z Terminate orphan process: pid (2358) (bash)
frontend	Complete job	2025-09-21T19:20:26.0099540Z Terminate orphan process: pid (2359) (npm run start)
frontend	Complete job	2025-09-21T19:20:26.0132321Z Terminate orphan process: pid (2370) (sh)
frontend	Complete job	2025-09-21T19:20:26.0153426Z Terminate orphan process: pid (2371) (next-server (v15.5.0))

## Analysis

**Root Cause**: Port mismatch in frontend workflow
- Frontend server starts on `localhost:3000`
- wait-on command expects `http://127.0.0.1:3001`
- This causes timeout waiting for server availability
- **Error**: "Timed out waiting for: http://127.0.0.1:3001"

**Issue**: Workflow configuration mismatch between server start port and health check URL.
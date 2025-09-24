# PR #222 — CI DIAGNOSTICS (2025-09-23)

Run: https://github.com/lomendor/Project-Dixis/actions/runs/17942531358

## Checks summary
[{"conclusion":"failure","databaseId":17942531050,"name":".github/workflows/backend-ci.yml","status":"completed","url":"https://github.com/lomendor/Project-Dixis/actions/runs/17942531050"},{"conclusion":"success","databaseId":17942531355,"name":"DangerJS Gatekeeper","status":"completed","url":"https://github.com/lomendor/Project-Dixis/actions/runs/17942531355"},{"conclusion":"success","databaseId":17942531351,"name":"Danger PR Gatekeeper","status":"completed","url":"https://github.com/lomendor/Project-Dixis/actions/runs/17942531351"},{"conclusion":"","databaseId":17942531362,"name":"Lighthouse CI","status":"in_progress","url":"https://github.com/lomendor/Project-Dixis/actions/runs/17942531362"},{"conclusion":"failure","databaseId":17942531335,"name":"Pull Request Quality Gates","status":"completed","url":"https://github.com/lomendor/Project-Dixis/actions/runs/17942531335"},{"conclusion":"","databaseId":17942531393,"name":"frontend-ci","status":"in_progress","url":"https://github.com/lomendor/Project-Dixis/actions/runs/17942531393"},{"conclusion":"","databaseId":17942531352,"name":"frontend-ci","status":"in_progress","url":"https://github.com/lomendor/Project-Dixis/actions/runs/17942531352"},{"conclusion":"failure","databaseId":17942531358,"name":"CI Pipeline","status":"completed","url":"https://github.com/lomendor/Project-Dixis/actions/runs/17942531358"},{"conclusion":"failure","databaseId":17942530774,"name":".github/workflows/frontend-e2e.yml","status":"completed","url":"https://github.com/lomendor/Project-Dixis/actions/runs/17942530774"},{"conclusion":"failure","databaseId":17942530902,"name":".github/workflows/fe-api-integration.yml","status":"completed","url":"https://github.com/lomendor/Project-Dixis/actions/runs/17942530902"}]

## Head (first 120 lines)
backend	Set up job	﻿2025-09-23T10:02:49.1300561Z Current runner version: '2.328.0'
backend	Set up job	2025-09-23T10:02:49.1325048Z ##[group]Runner Image Provisioner
backend	Set up job	2025-09-23T10:02:49.1325871Z Hosted Compute Agent
backend	Set up job	2025-09-23T10:02:49.1326466Z Version: 20250829.383
backend	Set up job	2025-09-23T10:02:49.1327090Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
backend	Set up job	2025-09-23T10:02:49.1327739Z Build Date: 2025-08-29T13:48:48Z
backend	Set up job	2025-09-23T10:02:49.1328367Z ##[endgroup]
backend	Set up job	2025-09-23T10:02:49.1328944Z ##[group]Operating System
backend	Set up job	2025-09-23T10:02:49.1329502Z Ubuntu
backend	Set up job	2025-09-23T10:02:49.1330021Z 24.04.3
backend	Set up job	2025-09-23T10:02:49.1330521Z LTS
backend	Set up job	2025-09-23T10:02:49.1330981Z ##[endgroup]
backend	Set up job	2025-09-23T10:02:49.1331411Z ##[group]Runner Image
backend	Set up job	2025-09-23T10:02:49.1332037Z Image: ubuntu-24.04
backend	Set up job	2025-09-23T10:02:49.1332502Z Version: 20250907.24.1
backend	Set up job	2025-09-23T10:02:49.1333492Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
backend	Set up job	2025-09-23T10:02:49.1335309Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
backend	Set up job	2025-09-23T10:02:49.1336536Z ##[endgroup]
backend	Set up job	2025-09-23T10:02:49.1337641Z ##[group]GITHUB_TOKEN Permissions
backend	Set up job	2025-09-23T10:02:49.1339619Z Contents: read
backend	Set up job	2025-09-23T10:02:49.1340284Z Metadata: read
backend	Set up job	2025-09-23T10:02:49.1340802Z Packages: read
backend	Set up job	2025-09-23T10:02:49.1341263Z ##[endgroup]
backend	Set up job	2025-09-23T10:02:49.1343270Z Secret source: Actions
backend	Set up job	2025-09-23T10:02:49.1344184Z Prepare workflow directory
backend	Set up job	2025-09-23T10:02:49.1764037Z Prepare all required actions
backend	Set up job	2025-09-23T10:02:49.1801364Z Getting action download info
backend	Set up job	2025-09-23T10:02:49.5010038Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
backend	Set up job	2025-09-23T10:02:49.6407509Z Download action repository 'shivammathur/setup-php@v2' (SHA:bf6b4fbd49ca58e4608c9c89fba0b8d90bd2a39f)
backend	Set up job	2025-09-23T10:02:50.0327270Z Complete job name: backend
backend	Initialize containers	﻿2025-09-23T10:02:50.0807093Z ##[group]Checking docker version
backend	Initialize containers	2025-09-23T10:02:50.0819980Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
backend	Initialize containers	2025-09-23T10:02:50.1670555Z '1.48'
backend	Initialize containers	2025-09-23T10:02:50.1683166Z Docker daemon API version: '1.48'
backend	Initialize containers	2025-09-23T10:02:50.1683924Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
backend	Initialize containers	2025-09-23T10:02:50.1862287Z '1.48'
backend	Initialize containers	2025-09-23T10:02:50.1876191Z Docker client API version: '1.48'
backend	Initialize containers	2025-09-23T10:02:50.1880882Z ##[endgroup]
backend	Initialize containers	2025-09-23T10:02:50.1883798Z ##[group]Clean up resources from previous jobs
backend	Initialize containers	2025-09-23T10:02:50.1889243Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=19e37d"
backend	Initialize containers	2025-09-23T10:02:50.2055968Z ##[command]/usr/bin/docker network prune --force --filter "label=19e37d"
backend	Initialize containers	2025-09-23T10:02:50.2179677Z ##[endgroup]
backend	Initialize containers	2025-09-23T10:02:50.2180278Z ##[group]Create local container network
backend	Initialize containers	2025-09-23T10:02:50.2190103Z ##[command]/usr/bin/docker network create --label 19e37d github_network_77f5b172a23540f39aae9ecba2a19e58
backend	Initialize containers	2025-09-23T10:02:50.2668074Z 63f453a5a5a3952f063b7f28bdf6162b3994ab0a095ab1feebd78ce02f798fee
backend	Initialize containers	2025-09-23T10:02:50.2688717Z ##[endgroup]
backend	Initialize containers	2025-09-23T10:02:50.2712349Z ##[group]Starting postgres service container
backend	Initialize containers	2025-09-23T10:02:50.2732770Z ##[command]/usr/bin/docker pull postgres:15
backend	Initialize containers	2025-09-23T10:02:50.7773426Z 15: Pulling from library/postgres
backend	Initialize containers	2025-09-23T10:02:50.8973779Z ce1261c6d567: Pulling fs layer
backend	Initialize containers	2025-09-23T10:02:50.8975282Z 80ed16669c95: Pulling fs layer
backend	Initialize containers	2025-09-23T10:02:50.8976429Z 4e5806601837: Pulling fs layer
backend	Initialize containers	2025-09-23T10:02:50.8977403Z b18445125df5: Pulling fs layer
backend	Initialize containers	2025-09-23T10:02:50.8978254Z 874a3ca0fb79: Pulling fs layer
backend	Initialize containers	2025-09-23T10:02:50.8978945Z 38a0056e8c05: Pulling fs layer
backend	Initialize containers	2025-09-23T10:02:50.8979630Z cb4494753109: Pulling fs layer
backend	Initialize containers	2025-09-23T10:02:50.8980299Z 9286f415f93a: Pulling fs layer
backend	Initialize containers	2025-09-23T10:02:50.8980952Z 60570350e677: Pulling fs layer
backend	Initialize containers	2025-09-23T10:02:50.8981621Z 0b33c9cfc245: Pulling fs layer
backend	Initialize containers	2025-09-23T10:02:50.8982280Z f082d788df98: Pulling fs layer
backend	Initialize containers	2025-09-23T10:02:50.8982938Z b2ae65346945: Pulling fs layer
backend	Initialize containers	2025-09-23T10:02:50.8983619Z 3e69ab42557e: Pulling fs layer
backend	Initialize containers	2025-09-23T10:02:50.8984325Z f35e17a433de: Pulling fs layer
backend	Initialize containers	2025-09-23T10:02:50.8985204Z b18445125df5: Waiting
backend	Initialize containers	2025-09-23T10:02:50.8986144Z 874a3ca0fb79: Waiting
backend	Initialize containers	2025-09-23T10:02:50.8986764Z 38a0056e8c05: Waiting
backend	Initialize containers	2025-09-23T10:02:50.8987397Z 60570350e677: Waiting
backend	Initialize containers	2025-09-23T10:02:50.8988007Z cb4494753109: Waiting
backend	Initialize containers	2025-09-23T10:02:50.8988618Z 9286f415f93a: Waiting
backend	Initialize containers	2025-09-23T10:02:50.8989237Z 0b33c9cfc245: Waiting
backend	Initialize containers	2025-09-23T10:02:50.8989894Z f082d788df98: Waiting
backend	Initialize containers	2025-09-23T10:02:50.8990539Z b2ae65346945: Waiting
backend	Initialize containers	2025-09-23T10:02:50.8991178Z f35e17a433de: Waiting
backend	Initialize containers	2025-09-23T10:02:50.8991823Z 3e69ab42557e: Waiting
backend	Initialize containers	2025-09-23T10:02:51.0118429Z 80ed16669c95: Verifying Checksum
backend	Initialize containers	2025-09-23T10:02:51.0120181Z 80ed16669c95: Download complete
backend	Initialize containers	2025-09-23T10:02:51.0380626Z 4e5806601837: Verifying Checksum
backend	Initialize containers	2025-09-23T10:02:51.0382292Z 4e5806601837: Download complete
backend	Initialize containers	2025-09-23T10:02:51.1292470Z b18445125df5: Verifying Checksum
backend	Initialize containers	2025-09-23T10:02:51.1293139Z b18445125df5: Download complete
backend	Initialize containers	2025-09-23T10:02:51.1371416Z ce1261c6d567: Verifying Checksum
backend	Initialize containers	2025-09-23T10:02:51.1372042Z ce1261c6d567: Download complete
backend	Initialize containers	2025-09-23T10:02:51.1726855Z 874a3ca0fb79: Verifying Checksum
backend	Initialize containers	2025-09-23T10:02:51.1727544Z 874a3ca0fb79: Download complete
backend	Initialize containers	2025-09-23T10:02:51.2469261Z cb4494753109: Verifying Checksum
backend	Initialize containers	2025-09-23T10:02:51.2471148Z cb4494753109: Download complete
backend	Initialize containers	2025-09-23T10:02:51.2568464Z 38a0056e8c05: Verifying Checksum
backend	Initialize containers	2025-09-23T10:02:51.2569240Z 38a0056e8c05: Download complete
backend	Initialize containers	2025-09-23T10:02:51.2945903Z 9286f415f93a: Verifying Checksum
backend	Initialize containers	2025-09-23T10:02:51.2947500Z 9286f415f93a: Download complete
backend	Initialize containers	2025-09-23T10:02:51.3644207Z 0b33c9cfc245: Verifying Checksum
backend	Initialize containers	2025-09-23T10:02:51.3644950Z 0b33c9cfc245: Download complete
backend	Initialize containers	2025-09-23T10:02:51.3977814Z f082d788df98: Verifying Checksum
backend	Initialize containers	2025-09-23T10:02:51.3978891Z f082d788df98: Download complete
backend	Initialize containers	2025-09-23T10:02:51.4819029Z b2ae65346945: Verifying Checksum
backend	Initialize containers	2025-09-23T10:02:51.4819843Z b2ae65346945: Download complete
backend	Initialize containers	2025-09-23T10:02:51.5216462Z 3e69ab42557e: Verifying Checksum
backend	Initialize containers	2025-09-23T10:02:51.5217142Z 3e69ab42557e: Download complete
backend	Initialize containers	2025-09-23T10:02:51.5972965Z f35e17a433de: Verifying Checksum
backend	Initialize containers	2025-09-23T10:02:51.5973645Z f35e17a433de: Download complete
backend	Initialize containers	2025-09-23T10:02:51.8744907Z 60570350e677: Verifying Checksum
backend	Initialize containers	2025-09-23T10:02:51.8747189Z 60570350e677: Download complete
backend	Initialize containers	2025-09-23T10:02:52.1537045Z ce1261c6d567: Pull complete
backend	Initialize containers	2025-09-23T10:02:52.4313758Z 80ed16669c95: Pull complete
backend	Initialize containers	2025-09-23T10:02:52.6005683Z 4e5806601837: Pull complete
backend	Initialize containers	2025-09-23T10:02:52.6409842Z b18445125df5: Pull complete
backend	Initialize containers	2025-09-23T10:02:52.9458384Z 874a3ca0fb79: Pull complete
backend	Initialize containers	2025-09-23T10:02:53.0235331Z 38a0056e8c05: Pull complete
backend	Initialize containers	2025-09-23T10:02:53.0352600Z cb4494753109: Pull complete
backend	Initialize containers	2025-09-23T10:02:53.0454202Z 9286f415f93a: Pull complete
backend	Initialize containers	2025-09-23T10:02:55.9274943Z 60570350e677: Pull complete
backend	Initialize containers	2025-09-23T10:02:55.9425439Z 0b33c9cfc245: Pull complete
backend	Initialize containers	2025-09-23T10:02:55.9536799Z f082d788df98: Pull complete
backend	Initialize containers	2025-09-23T10:02:55.9643338Z b2ae65346945: Pull complete
backend	Initialize containers	2025-09-23T10:02:55.9763417Z 3e69ab42557e: Pull complete
backend	Initialize containers	2025-09-23T10:02:55.9875411Z f35e17a433de: Pull complete
backend	Initialize containers	2025-09-23T10:02:55.9916331Z Digest: sha256:1cd9dd548427751dc0fabb24a3bdf96a6dd08c0025a167ecbb5c14bec21ff94c
backend	Initialize containers	2025-09-23T10:02:55.9931053Z Status: Downloaded newer image for postgres:15
backend	Initialize containers	2025-09-23T10:02:55.9942422Z docker.io/library/postgres:15
backend	Initialize containers	2025-09-23T10:02:56.0004544Z ##[command]/usr/bin/docker create --name dfcac13d7804456a88983d2aa9dce99f_postgres15_c77ef4 --label 19e37d --network github_network_77f5b172a23540f39aae9ecba2a19e58 --network-alias postgres -p 5432:5432 --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5 -e "POSTGRES_PASSWORD=postgres" -e "POSTGRES_DB=project_dixis_test" -e GITHUB_ACTIONS=true -e CI=true postgres:15

## Tail (last 120 lines)
frontend	Build	2025-09-23T10:05:01.2702853Z    ▲ Next.js 15.5.0
frontend	Build	2025-09-23T10:05:01.2703512Z
frontend	Build	2025-09-23T10:05:01.3470479Z    Creating an optimized production build ...
frontend	Build	2025-09-23T10:05:11.2798649Z  ✓ Compiled successfully in 9.8s
frontend	Build	2025-09-23T10:05:11.2832581Z    Skipping linting
frontend	Build	2025-09-23T10:05:11.2833655Z    Checking validity of types ...
frontend	Build	2025-09-23T10:05:17.4335058Z    Collecting page data ...
frontend	Build	2025-09-23T10:05:19.5274699Z    Generating static pages (0/33) ...
frontend	Build	2025-09-23T10:05:20.2624002Z    Generating static pages (8/33)
frontend	Build	2025-09-23T10:05:20.2624671Z    Generating static pages (16/33)
frontend	Build	2025-09-23T10:05:20.3004319Z    Generating static pages (24/33)
frontend	Build	2025-09-23T10:05:20.4410793Z  ✓ Generating static pages (33/33)
frontend	Build	2025-09-23T10:05:21.2458386Z    Finalizing page optimization ...
frontend	Build	2025-09-23T10:05:21.2459014Z    Collecting build traces ...
frontend	Build	2025-09-23T10:05:27.5691437Z
frontend	Build	2025-09-23T10:05:27.5770620Z Route (app)                                  Size  First Load JS
frontend	Build	2025-09-23T10:05:27.5771957Z ┌ ○ /                                     6.41 kB         121 kB
frontend	Build	2025-09-23T10:05:27.5772823Z ├ ○ /_not-found                             998 B         103 kB
frontend	Build	2025-09-23T10:05:27.5773801Z ├ ○ /account/orders                       4.38 kB         110 kB
frontend	Build	2025-09-23T10:05:27.5774681Z ├ ƒ /account/orders/[orderId]             5.45 kB         116 kB
frontend	Build	2025-09-23T10:05:27.5775538Z ├ ○ /admin/analytics                      3.91 kB         180 kB
frontend	Build	2025-09-23T10:05:27.5776470Z ├ ○ /admin/orders                          3.6 kB         105 kB
frontend	Build	2025-09-23T10:05:27.5777201Z ├ ○ /admin/pricing                        5.02 kB         120 kB
frontend	Build	2025-09-23T10:05:27.5777690Z ├ ○ /admin/producers                      4.91 kB         107 kB
frontend	Build	2025-09-23T10:05:27.5778432Z ├ ○ /admin/toggle                         4.52 kB         106 kB
frontend	Build	2025-09-23T10:05:27.5779366Z ├ ƒ /api/admin/orders/[id]/update-status    170 B         102 kB
frontend	Build	2025-09-23T10:05:27.5780500Z ├ ƒ /api/admin/producers                    170 B         102 kB
frontend	Build	2025-09-23T10:05:27.5781480Z ├ ƒ /api/admin/producers/[id]/approve       170 B         102 kB
frontend	Build	2025-09-23T10:05:27.5782480Z ├ ƒ /api/admin/producers/[id]/reject        170 B         102 kB
frontend	Build	2025-09-23T10:05:27.5783386Z ├ ƒ /api/checkout/address                   170 B         102 kB
frontend	Build	2025-09-23T10:05:27.5783891Z ├ ƒ /api/checkout/pay                       170 B         102 kB
frontend	Build	2025-09-23T10:05:27.5784383Z ├ ƒ /api/checkout/quote                     170 B         102 kB
frontend	Build	2025-09-23T10:05:27.5784868Z ├ ƒ /api/producer/onboarding                170 B         102 kB
frontend	Build	2025-09-23T10:05:27.5785400Z ├ ƒ /api/producer/orders/[id]/ship          170 B         102 kB
frontend	Build	2025-09-23T10:05:27.5785882Z ├ ƒ /api/producer/products                  170 B         102 kB
frontend	Build	2025-09-23T10:05:27.5786349Z ├ ƒ /api/producer/status                    170 B         102 kB
frontend	Build	2025-09-23T10:05:27.5786815Z ├ ƒ /api/v1/lockers/search                  170 B         102 kB

frontend	Start frontend server	﻿2025-09-23T10:05:27.6435095Z ##[group]Run cd frontend && npm run start &
frontend	Start frontend server	2025-09-23T10:05:27.7550953Z
frontend	Start frontend server	2025-09-23T10:05:27.7551297Z > frontend@0.1.0 start
frontend	Start frontend server	2025-09-23T10:05:27.7551594Z > next start
frontend	Start frontend server	2025-09-23T10:05:27.9882348Z    ▲ Next.js 15.5.0
frontend	Start frontend server	2025-09-23T10:05:27.9885229Z    - Local:        http://localhost:3000
frontend	Start frontend server	2025-09-23T10:05:27.9885819Z    - Network:      http://10.1.1.31:3000
frontend	Start frontend server	2025-09-23T10:05:27.9887072Z  ✓ Starting...
frontend	Start frontend server	2025-09-23T10:05:28.4261071Z  ✓ Ready in 582ms

🚨 CRITICAL ERROR - PORT MISMATCH DETECTED:
frontend	Wait for frontend	2025-09-23T10:05:32.6557021Z ##[group]Run npx wait-on http://127.0.0.1:3001 --timeout 60000
frontend	Wait for frontend	2025-09-23T10:06:35.4106422Z Error: Timed out waiting for: http://127.0.0.1:3001

✅ Frontend server started on port 3000 (line: "Local: http://localhost:3000")
❌ CI workflow waiting on port 3001 (line: "npx wait-on http://127.0.0.1:3001")
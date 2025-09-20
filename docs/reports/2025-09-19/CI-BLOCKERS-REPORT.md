# CI Blockers Report (2025-09-19)

Analyzed PRs: 27

## Summary
Bucket | Count | Representative PRs
--- | ---: | ---
frontend-tests | 13 | #20, #33, #34, #36, #37
lighthouse | 4 | #111, #113, #114, #172
phpunit-feature | 10 | #64, #65, #66, #112, #159

## Quick Fixes
- frontend-tests: Stabilize flaky tests; mock network; run pnpm test
- lighthouse: Ensure app starts; set TEST_BASE_URL; seed minimal DB
- phpunit-feature: Run php artisan test --testsuite=Feature; ensure DB seeders

## Top Error Patterns
- [x1] backend	UNKNOWN STEP	2025-08-31T11:25:22.4237779Z    FAIL  Tests\Feature\CartOrderIntegrationTest
- [x1] backend	UNKNOWN STEP	2025-08-31T15:08:31.0522218Z ##[command]/usr/bin/docker create --name dbfa0f2b4dcf4bce8aea32da17a84ac6_postgres15_3a8ed3 --label a7ea2a --network github_network_34292fafbb24406882904c33a3b55864 --network-alias postgres 
- [x1] backend	UNKNOWN STEP	2025-08-31T15:08:32.5029272Z ##[command]/usr/bin/docker create --name 72916f3548b14930bc1ea644f69453e8_postgres15_d522bb --label a765cd --network github_network_9917bdae87cb49fa83237ddd7695be43 --network-alias postgres 
- [x1] backend	UNKNOWN STEP	2025-09-06T13:50:47.4872354Z    FAIL  Tests\Feature\Public\OrdersDemoTest
- [x1] backend	UNKNOWN STEP	2025-09-15T20:09:12.8346177Z ##[command]/usr/bin/docker create --name 7b86a01932b646cfb0a4cec80302b8d3_postgres15_67c123 --label 3ea5f3 --network github_network_26af819365004540978a444faab87f96 --network-alias postgres 

## Appendix: Per-PR Details

### PR #172
- URL: https://github.com/lomendor/Project-Dixis/pull/172
- Bucket: lighthouse
- Failing Job: lighthouse
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17763786811/job/50482325016

<details><summary>Head (first 60 lines)</summary>

```
lighthouse	UNKNOWN STEP	﻿2025-09-16T11:08:45.8157402Z Current runner version: '2.328.0'
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8180641Z ##[group]Runner Image Provisioner
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8181431Z Hosted Compute Agent
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8182070Z Version: 20250829.383
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8182921Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8183591Z Build Date: 2025-08-29T13:48:48Z
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8184348Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8184897Z ##[group]Operating System
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8185478Z Ubuntu
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8186032Z 24.04.3
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8186475Z LTS
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8186946Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8187457Z ##[group]Runner Image
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8188081Z Image: ubuntu-24.04
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8188572Z Version: 20250907.24.1
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8189646Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8191194Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8192257Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8193629Z ##[group]GITHUB_TOKEN Permissions
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8195408Z Contents: read
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8196111Z Metadata: read
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8196602Z Packages: read
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8197102Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8199211Z Secret source: Actions
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8199881Z Prepare workflow directory
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8758097Z Prepare all required actions
lighthouse	UNKNOWN STEP	2025-09-16T11:08:45.8812097Z Getting action download info
lighthouse	UNKNOWN STEP	2025-09-16T11:08:46.2861831Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
lighthouse	UNKNOWN STEP	2025-09-16T11:08:46.4475632Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
lighthouse	UNKNOWN STEP	2025-09-16T11:08:46.7887399Z Download action repository 'actions/setup-node@v5' (SHA:a0853c24544627f65ddf259abe73b1d18a591444)
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.1925471Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.3038008Z Download action repository 'actions/github-script@v8' (SHA:ed597411d8f924073f98dfc5c65a23a2325f34cd)
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.7267437Z Complete job name: lighthouse
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.7885298Z ##[group]Checking docker version
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.7905024Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.9233845Z '1.48'
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.9248761Z Docker daemon API version: '1.48'
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.9250135Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.9417024Z '1.48'
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.9431527Z Docker client API version: '1.48'
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.9437811Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.9441131Z ##[group]Clean up resources from previous jobs
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.9447288Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=22203d"
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.9650440Z ##[command]/usr/bin/docker network prune --force --filter "label=22203d"
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.9786408Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.9787273Z ##[group]Create local container network
lighthouse	UNKNOWN STEP	2025-09-16T11:08:47.9798524Z ##[command]/usr/bin/docker network create --label 22203d github_network_87fa8978ecfc4566b0ddb9678df2b2c6
lighthouse	UNKNOWN STEP	2025-09-16T11:08:48.0303416Z bfebfaac0065d97ee7923b8c4a1746eb15d03a8843af14c47870ce3c3ee28082
lighthouse	UNKNOWN STEP	2025-09-16T11:08:48.0323053Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-16T11:08:48.0347480Z ##[group]Starting postgres service container
lighthouse	UNKNOWN STEP	2025-09-16T11:08:48.0368255Z ##[command]/usr/bin/docker pull postgres:15
lighthouse	UNKNOWN STEP	2025-09-16T11:08:48.4615931Z 15: Pulling from library/postgres
lighthouse	UNKNOWN STEP	2025-09-16T11:08:48.5829208Z ce1261c6d567: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-16T11:08:48.5829752Z 80ed16669c95: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-16T11:08:48.5830102Z 4e5806601837: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-16T11:08:48.5830551Z b18445125df5: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-16T11:08:48.5831009Z 874a3ca0fb79: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-16T11:08:48.5831372Z 38a0056e8c05: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-16T11:08:48.5831648Z cb4494753109: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-16T11:08:48.5831915Z 9286f415f93a: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5160603Z  2025-09-16 11:10:35.648 UTC [152] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5161128Z  
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5161547Z  The database cluster will be initialized with locale "en_US.utf8".
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5161967Z  The default database encoding has accordingly been set to "UTF8".
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5162571Z  The default text search configuration will be set to "english".
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5162875Z  
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5163050Z  Data page checksums are disabled.
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5163265Z  
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5163531Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5163887Z  creating subdirectories ... ok
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5164181Z  selecting dynamic shared memory implementation ... posix
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5164488Z  selecting default max_connections ... 100
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5164755Z  selecting default shared_buffers ... 128MB
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5165014Z  selecting default time zone ... Etc/UTC
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5165263Z  creating configuration files ... ok
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5165502Z  running bootstrap script ... ok
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5165773Z  performing post-bootstrap initialization ... ok
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5166045Z  syncing data to disk ... ok
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5166247Z  
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5166390Z  
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5166599Z  Success. You can now start the database server using:
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5166868Z  
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5167076Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5167332Z  
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5168145Z  waiting for server to start....2025-09-16 11:08:55.600 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5169046Z  2025-09-16 11:08:55.601 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5169525Z  2025-09-16 11:08:55.604 UTC [51] LOG:  database system was shut down at 2025-09-16 11:08:55 UTC
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5169963Z  2025-09-16 11:08:55.607 UTC [48] LOG:  database system is ready to accept connections
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5170278Z   done
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5170441Z  server started
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5170621Z  CREATE DATABASE
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5170791Z  
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5170927Z  
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5171220Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5171575Z  
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5171792Z  2025-09-16 11:08:55.786 UTC [48] LOG:  received fast shutdown request
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5172247Z  waiting for server to shut down....2025-09-16 11:08:55.787 UTC [48] LOG:  aborting any active transactions
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5173036Z  2025-09-16 11:08:55.789 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5173494Z  2025-09-16 11:08:55.789 UTC [49] LOG:  shutting down
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5173827Z  2025-09-16 11:08:55.789 UTC [49] LOG:  checkpoint starting: shutdown immediate
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5174631Z  2025-09-16 11:08:55.807 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.013 s, sync=0.003 s, total=0.019 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5175413Z  2025-09-16 11:08:55.813 UTC [48] LOG:  database system is shut down
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5175683Z   done
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5175845Z  server stopped
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5176019Z  
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5176232Z  PostgreSQL init process complete; ready for start up.
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5176496Z  
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5181846Z Stop and remove container: cbaa5f2177a14e449589f3758e326328_postgres15_19788e
lighthouse	UNKNOWN STEP	2025-09-16T11:10:41.5187532Z ##[command]/usr/bin/docker rm --force 6c25eb06d8de723b35ede9b1d8a7bcacde88d004ebbd27bca73be959da046338
lighthouse	UNKNOWN STEP	2025-09-16T11:10:42.4459500Z 6c25eb06d8de723b35ede9b1d8a7bcacde88d004ebbd27bca73be959da046338
lighthouse	UNKNOWN STEP	2025-09-16T11:10:42.4487407Z Remove container network: github_network_87fa8978ecfc4566b0ddb9678df2b2c6
lighthouse	UNKNOWN STEP	2025-09-16T11:10:42.4491594Z ##[command]/usr/bin/docker network rm github_network_87fa8978ecfc4566b0ddb9678df2b2c6
lighthouse	UNKNOWN STEP	2025-09-16T11:10:42.5555973Z github_network_87fa8978ecfc4566b0ddb9678df2b2c6
lighthouse	UNKNOWN STEP	2025-09-16T11:10:42.5613605Z Cleaning up orphan processes
lighthouse	UNKNOWN STEP	2025-09-16T11:10:42.5940530Z Terminate orphan process: pid (3318) (bash)
lighthouse	UNKNOWN STEP	2025-09-16T11:10:42.5957708Z Terminate orphan process: pid (3319) (php)
lighthouse	UNKNOWN STEP	2025-09-16T11:10:42.5973485Z Terminate orphan process: pid (3322) (php8.2)
lighthouse	UNKNOWN STEP	2025-09-16T11:10:42.5999166Z Terminate orphan process: pid (3535) (npm run start --port 3001)
lighthouse	UNKNOWN STEP	2025-09-16T11:10:42.6034346Z Terminate orphan process: pid (3547) (sh)
lighthouse	UNKNOWN STEP	2025-09-16T11:10:42.6068934Z Terminate orphan process: pid (3548) (next-server (v15.5.0))
```

</details>

### PR #166
- URL: https://github.com/lomendor/Project-Dixis/pull/166
- Bucket: phpunit-feature
- Failing Job: backend
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17746836784/job/50433796358

<details><summary>Head (first 60 lines)</summary>

```
backend	UNKNOWN STEP	﻿2025-09-15T21:14:46.3873622Z Current runner version: '2.328.0'
backend	UNKNOWN STEP	2025-09-15T21:14:46.3895799Z ##[group]Runner Image Provisioner
backend	UNKNOWN STEP	2025-09-15T21:14:46.3896601Z Hosted Compute Agent
backend	UNKNOWN STEP	2025-09-15T21:14:46.3897113Z Version: 20250829.383
backend	UNKNOWN STEP	2025-09-15T21:14:46.3897825Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
backend	UNKNOWN STEP	2025-09-15T21:14:46.3898521Z Build Date: 2025-08-29T13:48:48Z
backend	UNKNOWN STEP	2025-09-15T21:14:46.3899102Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T21:14:46.3899671Z ##[group]Operating System
backend	UNKNOWN STEP	2025-09-15T21:14:46.3900247Z Ubuntu
backend	UNKNOWN STEP	2025-09-15T21:14:46.3900700Z 24.04.3
backend	UNKNOWN STEP	2025-09-15T21:14:46.3901227Z LTS
backend	UNKNOWN STEP	2025-09-15T21:14:46.3902038Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T21:14:46.3902554Z ##[group]Runner Image
backend	UNKNOWN STEP	2025-09-15T21:14:46.3903313Z Image: ubuntu-24.04
backend	UNKNOWN STEP	2025-09-15T21:14:46.3903842Z Version: 20250907.24.1
backend	UNKNOWN STEP	2025-09-15T21:14:46.3904888Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
backend	UNKNOWN STEP	2025-09-15T21:14:46.3906444Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
backend	UNKNOWN STEP	2025-09-15T21:14:46.3907456Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T21:14:46.3908558Z ##[group]GITHUB_TOKEN Permissions
backend	UNKNOWN STEP	2025-09-15T21:14:46.3910338Z Contents: read
backend	UNKNOWN STEP	2025-09-15T21:14:46.3910970Z Metadata: read
backend	UNKNOWN STEP	2025-09-15T21:14:46.3911775Z Packages: read
backend	UNKNOWN STEP	2025-09-15T21:14:46.3912298Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T21:14:46.3914624Z Secret source: Actions
backend	UNKNOWN STEP	2025-09-15T21:14:46.3915440Z Prepare workflow directory
backend	UNKNOWN STEP	2025-09-15T21:14:46.4323104Z Prepare all required actions
backend	UNKNOWN STEP	2025-09-15T21:14:46.4360011Z Getting action download info
backend	UNKNOWN STEP	2025-09-15T21:14:46.8892288Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
backend	UNKNOWN STEP	2025-09-15T21:14:47.0514504Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
backend	UNKNOWN STEP	2025-09-15T21:14:47.6043203Z Complete job name: backend
backend	UNKNOWN STEP	2025-09-15T21:14:47.6574042Z ##[group]Checking docker version
backend	UNKNOWN STEP	2025-09-15T21:14:47.6587371Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
backend	UNKNOWN STEP	2025-09-15T21:14:47.7367941Z '1.48'
backend	UNKNOWN STEP	2025-09-15T21:14:47.7382122Z Docker daemon API version: '1.48'
backend	UNKNOWN STEP	2025-09-15T21:14:47.7383469Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
backend	UNKNOWN STEP	2025-09-15T21:14:47.7544560Z '1.48'
backend	UNKNOWN STEP	2025-09-15T21:14:47.7558475Z Docker client API version: '1.48'
backend	UNKNOWN STEP	2025-09-15T21:14:47.7564052Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T21:14:47.7567240Z ##[group]Clean up resources from previous jobs
backend	UNKNOWN STEP	2025-09-15T21:14:47.7574039Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=5c7aa2"
backend	UNKNOWN STEP	2025-09-15T21:14:47.7708164Z ##[command]/usr/bin/docker network prune --force --filter "label=5c7aa2"
backend	UNKNOWN STEP	2025-09-15T21:14:47.7834170Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T21:14:47.7835104Z ##[group]Create local container network
backend	UNKNOWN STEP	2025-09-15T21:14:47.7845907Z ##[command]/usr/bin/docker network create --label 5c7aa2 github_network_3bfd9b893bea4d0d8f80f3be29b6e005
backend	UNKNOWN STEP	2025-09-15T21:14:47.8317867Z d3038aa1f524f91d1f1dc794c40af9d88a33cb899531d5cba6c82c948b2da01d
backend	UNKNOWN STEP	2025-09-15T21:14:47.8335563Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T21:14:47.8360829Z ##[group]Starting postgres service container
backend	UNKNOWN STEP	2025-09-15T21:14:47.8381582Z ##[command]/usr/bin/docker pull postgres:15
backend	UNKNOWN STEP	2025-09-15T21:14:48.8846662Z 15: Pulling from library/postgres
backend	UNKNOWN STEP	2025-09-15T21:14:49.1529087Z ce1261c6d567: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T21:14:49.1530820Z 80ed16669c95: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T21:14:49.1531923Z 4e5806601837: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T21:14:49.1532666Z b18445125df5: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T21:14:49.1533199Z 874a3ca0fb79: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T21:14:49.1533757Z 38a0056e8c05: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T21:14:49.1534395Z cb4494753109: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T21:14:49.1534934Z 9286f415f93a: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T21:14:49.1535491Z 60570350e677: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T21:14:49.1536038Z 0b33c9cfc245: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T21:14:49.1536571Z f082d788df98: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
backend	UNKNOWN STEP	2025-09-15T21:15:28.1392170Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
backend	UNKNOWN STEP	2025-09-15T21:15:28.1392578Z  creating subdirectories ... ok
backend	UNKNOWN STEP	2025-09-15T21:15:28.1392858Z  selecting dynamic shared memory implementation ... posix
backend	UNKNOWN STEP	2025-09-15T21:15:28.1393165Z  selecting default max_connections ... 100
backend	UNKNOWN STEP	2025-09-15T21:15:28.1393417Z  selecting default shared_buffers ... 128MB
backend	UNKNOWN STEP	2025-09-15T21:15:28.1393896Z  selecting default time zone ... Etc/UTC
backend	UNKNOWN STEP	2025-09-15T21:15:28.1394141Z  creating configuration files ... ok
backend	UNKNOWN STEP	2025-09-15T21:15:28.1394379Z  running bootstrap script ... ok
backend	UNKNOWN STEP	2025-09-15T21:15:28.1394639Z  performing post-bootstrap initialization ... ok
backend	UNKNOWN STEP	2025-09-15T21:15:28.1394900Z  syncing data to disk ... ok
backend	UNKNOWN STEP	2025-09-15T21:15:28.1395093Z  
backend	UNKNOWN STEP	2025-09-15T21:15:28.1395227Z  
backend	UNKNOWN STEP	2025-09-15T21:15:28.1395415Z  Success. You can now start the database server using:
backend	UNKNOWN STEP	2025-09-15T21:15:28.1395668Z  
backend	UNKNOWN STEP	2025-09-15T21:15:28.1395862Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
backend	UNKNOWN STEP	2025-09-15T21:15:28.1396116Z  
backend	UNKNOWN STEP	2025-09-15T21:15:28.1396663Z  waiting for server to start....2025-09-15 21:14:56.043 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
backend	UNKNOWN STEP	2025-09-15T21:15:28.1397405Z  2025-09-15 21:14:56.044 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
backend	UNKNOWN STEP	2025-09-15T21:15:28.1397879Z  2025-09-15 21:14:56.046 UTC [51] LOG:  database system was shut down at 2025-09-15 21:14:55 UTC
backend	UNKNOWN STEP	2025-09-15T21:15:28.1398314Z  2025-09-15 21:14:56.050 UTC [48] LOG:  database system is ready to accept connections
backend	UNKNOWN STEP	2025-09-15T21:15:28.1398613Z   done
backend	UNKNOWN STEP	2025-09-15T21:15:28.1398767Z  server started
backend	UNKNOWN STEP	2025-09-15T21:15:28.1398929Z  CREATE DATABASE
backend	UNKNOWN STEP	2025-09-15T21:15:28.1399093Z  
backend	UNKNOWN STEP	2025-09-15T21:15:28.1399228Z  
backend	UNKNOWN STEP	2025-09-15T21:15:28.1399500Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
backend	UNKNOWN STEP	2025-09-15T21:15:28.1399840Z  
backend	UNKNOWN STEP	2025-09-15T21:15:28.1400041Z  2025-09-15 21:14:56.229 UTC [48] LOG:  received fast shutdown request
backend	UNKNOWN STEP	2025-09-15T21:15:28.1400711Z  waiting for server to shut down....2025-09-15 21:14:56.230 UTC [48] LOG:  aborting any active transactions
backend	UNKNOWN STEP	2025-09-15T21:15:28.1401867Z  2025-09-15 21:14:56.232 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
backend	UNKNOWN STEP	2025-09-15T21:15:28.1402609Z  2025-09-15 21:14:56.232 UTC [49] LOG:  shutting down
backend	UNKNOWN STEP	2025-09-15T21:15:28.1402945Z  2025-09-15 21:14:56.232 UTC [49] LOG:  checkpoint starting: shutdown immediate
backend	UNKNOWN STEP	2025-09-15T21:15:28.1403741Z  2025-09-15 21:14:56.249 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.002 s, total=0.017 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
backend	UNKNOWN STEP	2025-09-15T21:15:28.1404503Z  2025-09-15 21:14:56.255 UTC [48] LOG:  database system is shut down
backend	UNKNOWN STEP	2025-09-15T21:15:28.1404772Z   done
backend	UNKNOWN STEP	2025-09-15T21:15:28.1404926Z  server stopped
backend	UNKNOWN STEP	2025-09-15T21:15:28.1405086Z  
backend	UNKNOWN STEP	2025-09-15T21:15:28.1405299Z  PostgreSQL init process complete; ready for start up.
backend	UNKNOWN STEP	2025-09-15T21:15:28.1405559Z  
backend	UNKNOWN STEP	2025-09-15T21:15:28.1406635Z  initdb: warning: enabling "trust" authentication for local connections
backend	UNKNOWN STEP	2025-09-15T21:15:28.1407325Z  initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
backend	UNKNOWN STEP	2025-09-15T21:15:28.1408126Z  2025-09-15 21:14:56.348 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
backend	UNKNOWN STEP	2025-09-15T21:15:28.1408722Z  2025-09-15 21:14:56.348 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
backend	UNKNOWN STEP	2025-09-15T21:15:28.1409113Z  2025-09-15 21:14:56.348 UTC [1] LOG:  listening on IPv6 address "::", port 5432
backend	UNKNOWN STEP	2025-09-15T21:15:28.1409547Z  2025-09-15 21:14:56.349 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
backend	UNKNOWN STEP	2025-09-15T21:15:28.1410011Z  2025-09-15 21:14:56.352 UTC [64] LOG:  database system was shut down at 2025-09-15 21:14:56 UTC
backend	UNKNOWN STEP	2025-09-15T21:15:28.1410436Z  2025-09-15 21:14:56.356 UTC [1] LOG:  database system is ready to accept connections
backend	UNKNOWN STEP	2025-09-15T21:15:28.1410810Z  2025-09-15 21:15:05.505 UTC [75] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-09-15T21:15:28.1411132Z  2025-09-15 21:15:15.571 UTC [83] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-09-15T21:15:28.1411765Z  2025-09-15 21:15:25.637 UTC [91] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-09-15T21:15:28.1412552Z  2025-09-15 21:15:27.900 UTC [93] ERROR:  null value in column "title" of relation "products" violates not-null constraint
backend	UNKNOWN STEP	2025-09-15T21:15:28.1413804Z  2025-09-15 21:15:27.900 UTC [93] DETAIL:  Failing row contains (1, 1, Organic Tomatoes, organic-tomatoes, Fresh organic tomatoes grown without pesticides, 3.50, kg, 100, Vegetables, https://images.unsplash.com/photo-1592841200221-a6898f307baa, available, 2025-09-15 21:15:27, 2025-09-15 21:15:27, t, 1.000, t, null, f, EUR, null, null, null, null, null).
backend	UNKNOWN STEP	2025-09-15T21:15:28.1415472Z  2025-09-15 21:15:27.900 UTC [93] STATEMENT:  insert into "products" ("slug", "producer_id", "name", "description", "price", "weight_per_unit", "unit", "stock", "category", "is_organic", "image_url", "status", "is_active", "updated_at", "created_at") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) returning "id"
backend	UNKNOWN STEP	2025-09-15T21:15:28.1420987Z Stop and remove container: 13183776255347aa943049f82b81f635_postgres15_f5a8a8
backend	UNKNOWN STEP	2025-09-15T21:15:28.1425712Z ##[command]/usr/bin/docker rm --force 59b97d52c5ae31aba810bd4399d1a8b378b83b2ad856339c25d98d46d07637b1
backend	UNKNOWN STEP	2025-09-15T21:15:29.5689345Z 59b97d52c5ae31aba810bd4399d1a8b378b83b2ad856339c25d98d46d07637b1
backend	UNKNOWN STEP	2025-09-15T21:15:29.5715822Z Remove container network: github_network_3bfd9b893bea4d0d8f80f3be29b6e005
backend	UNKNOWN STEP	2025-09-15T21:15:29.5719997Z ##[command]/usr/bin/docker network rm github_network_3bfd9b893bea4d0d8f80f3be29b6e005
backend	UNKNOWN STEP	2025-09-15T21:15:29.6986529Z github_network_3bfd9b893bea4d0d8f80f3be29b6e005
backend	UNKNOWN STEP	2025-09-15T21:15:29.7043057Z Cleaning up orphan processes
```

</details>

### PR #165
- URL: https://github.com/lomendor/Project-Dixis/pull/165
- Bucket: phpunit-feature
- Failing Job: backend
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17745688367/job/50430212036

<details><summary>Head (first 60 lines)</summary>

```
backend	UNKNOWN STEP	﻿2025-09-15T20:27:05.5439803Z Current runner version: '2.328.0'
backend	UNKNOWN STEP	2025-09-15T20:27:05.5473041Z ##[group]Runner Image Provisioner
backend	UNKNOWN STEP	2025-09-15T20:27:05.5474451Z Hosted Compute Agent
backend	UNKNOWN STEP	2025-09-15T20:27:05.5475385Z Version: 20250829.383
backend	UNKNOWN STEP	2025-09-15T20:27:05.5476359Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
backend	UNKNOWN STEP	2025-09-15T20:27:05.5477917Z Build Date: 2025-08-29T13:48:48Z
backend	UNKNOWN STEP	2025-09-15T20:27:05.5478885Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T20:27:05.5479789Z ##[group]Operating System
backend	UNKNOWN STEP	2025-09-15T20:27:05.5480814Z Ubuntu
backend	UNKNOWN STEP	2025-09-15T20:27:05.5481603Z 24.04.3
backend	UNKNOWN STEP	2025-09-15T20:27:05.5482286Z LTS
backend	UNKNOWN STEP	2025-09-15T20:27:05.5483165Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T20:27:05.5483980Z ##[group]Runner Image
backend	UNKNOWN STEP	2025-09-15T20:27:05.5484943Z Image: ubuntu-24.04
backend	UNKNOWN STEP	2025-09-15T20:27:05.5485975Z Version: 20250907.24.1
backend	UNKNOWN STEP	2025-09-15T20:27:05.5488191Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
backend	UNKNOWN STEP	2025-09-15T20:27:05.5490991Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
backend	UNKNOWN STEP	2025-09-15T20:27:05.5492576Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T20:27:05.5494400Z ##[group]GITHUB_TOKEN Permissions
backend	UNKNOWN STEP	2025-09-15T20:27:05.5497356Z Contents: read
backend	UNKNOWN STEP	2025-09-15T20:27:05.5498130Z Metadata: read
backend	UNKNOWN STEP	2025-09-15T20:27:05.5498951Z Packages: read
backend	UNKNOWN STEP	2025-09-15T20:27:05.5499670Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T20:27:05.5502418Z Secret source: Actions
backend	UNKNOWN STEP	2025-09-15T20:27:05.5503814Z Prepare workflow directory
backend	UNKNOWN STEP	2025-09-15T20:27:05.5942760Z Prepare all required actions
backend	UNKNOWN STEP	2025-09-15T20:27:05.5979940Z Getting action download info
backend	UNKNOWN STEP	2025-09-15T20:27:05.9193601Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
backend	UNKNOWN STEP	2025-09-15T20:27:06.3726842Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
backend	UNKNOWN STEP	2025-09-15T20:27:06.8724652Z Complete job name: backend
backend	UNKNOWN STEP	2025-09-15T20:27:06.9230317Z ##[group]Checking docker version
backend	UNKNOWN STEP	2025-09-15T20:27:06.9243042Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
backend	UNKNOWN STEP	2025-09-15T20:27:08.4227292Z '1.48'
backend	UNKNOWN STEP	2025-09-15T20:27:08.4241545Z Docker daemon API version: '1.48'
backend	UNKNOWN STEP	2025-09-15T20:27:08.4242102Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
backend	UNKNOWN STEP	2025-09-15T20:27:08.4390512Z '1.48'
backend	UNKNOWN STEP	2025-09-15T20:27:08.4403140Z Docker client API version: '1.48'
backend	UNKNOWN STEP	2025-09-15T20:27:08.4408227Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T20:27:08.4410785Z ##[group]Clean up resources from previous jobs
backend	UNKNOWN STEP	2025-09-15T20:27:08.4416102Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=83b980"
backend	UNKNOWN STEP	2025-09-15T20:27:08.4589692Z ##[command]/usr/bin/docker network prune --force --filter "label=83b980"
backend	UNKNOWN STEP	2025-09-15T20:27:08.4710849Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T20:27:08.4711177Z ##[group]Create local container network
backend	UNKNOWN STEP	2025-09-15T20:27:08.4720585Z ##[command]/usr/bin/docker network create --label 83b980 github_network_887280a8fa64446e8a436117c18a2233
backend	UNKNOWN STEP	2025-09-15T20:27:08.5240950Z 318480228bcf78b3f4b015b8cfb1629a86710dceb6671b398df08ec8a7348ece
backend	UNKNOWN STEP	2025-09-15T20:27:08.5261627Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T20:27:08.5284644Z ##[group]Starting postgres service container
backend	UNKNOWN STEP	2025-09-15T20:27:08.5304225Z ##[command]/usr/bin/docker pull postgres:15
backend	UNKNOWN STEP	2025-09-15T20:27:09.1863399Z 15: Pulling from library/postgres
backend	UNKNOWN STEP	2025-09-15T20:27:09.3515385Z ce1261c6d567: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:27:09.3516317Z 80ed16669c95: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:27:09.3517458Z 4e5806601837: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:27:09.3517895Z b18445125df5: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:27:09.3518390Z 874a3ca0fb79: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:27:09.3518787Z 38a0056e8c05: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:27:09.3519181Z cb4494753109: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:27:09.3519575Z 9286f415f93a: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:27:09.3520002Z 60570350e677: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:27:09.3520451Z 0b33c9cfc245: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:27:09.3520852Z f082d788df98: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
backend	UNKNOWN STEP	2025-09-15T20:27:48.4410038Z  Data page checksums are disabled.
backend	UNKNOWN STEP	2025-09-15T20:27:48.4410411Z  
backend	UNKNOWN STEP	2025-09-15T20:27:48.4410847Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
backend	UNKNOWN STEP	2025-09-15T20:27:48.4411751Z  creating subdirectories ... ok
backend	UNKNOWN STEP	2025-09-15T20:27:48.4412225Z  selecting dynamic shared memory implementation ... posix
backend	UNKNOWN STEP	2025-09-15T20:27:48.4412766Z  selecting default max_connections ... 100
backend	UNKNOWN STEP	2025-09-15T20:27:48.4413225Z  selecting default shared_buffers ... 128MB
backend	UNKNOWN STEP	2025-09-15T20:27:48.4413663Z  selecting default time zone ... Etc/UTC
backend	UNKNOWN STEP	2025-09-15T20:27:48.4414093Z  creating configuration files ... ok
backend	UNKNOWN STEP	2025-09-15T20:27:48.4414507Z  running bootstrap script ... ok
backend	UNKNOWN STEP	2025-09-15T20:27:48.4414952Z  performing post-bootstrap initialization ... ok
backend	UNKNOWN STEP	2025-09-15T20:27:48.4415420Z  syncing data to disk ... ok
backend	UNKNOWN STEP	2025-09-15T20:27:48.4415753Z  
backend	UNKNOWN STEP	2025-09-15T20:27:48.4415994Z  
backend	UNKNOWN STEP	2025-09-15T20:27:48.4416328Z  Success. You can now start the database server using:
backend	UNKNOWN STEP	2025-09-15T20:27:48.4416760Z  
backend	UNKNOWN STEP	2025-09-15T20:27:48.4417278Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
backend	UNKNOWN STEP	2025-09-15T20:27:48.4417698Z  
backend	UNKNOWN STEP	2025-09-15T20:27:48.4418641Z  waiting for server to start....2025-09-15 20:27:17.627 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
backend	UNKNOWN STEP	2025-09-15T20:27:48.4419952Z  2025-09-15 20:27:17.628 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
backend	UNKNOWN STEP	2025-09-15T20:27:48.4420787Z  2025-09-15 20:27:17.630 UTC [51] LOG:  database system was shut down at 2025-09-15 20:27:17 UTC
backend	UNKNOWN STEP	2025-09-15T20:27:48.4421928Z  2025-09-15 20:27:17.931 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
backend	UNKNOWN STEP	2025-09-15T20:27:48.4422991Z  2025-09-15 20:27:17.932 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
backend	UNKNOWN STEP	2025-09-15T20:27:48.4423699Z  2025-09-15 20:27:17.932 UTC [1] LOG:  listening on IPv6 address "::", port 5432
backend	UNKNOWN STEP	2025-09-15T20:27:48.4424450Z  2025-09-15 20:27:17.933 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
backend	UNKNOWN STEP	2025-09-15T20:27:48.4425916Z  2025-09-15 20:27:17.938 UTC [64] LOG:  database system was shut down at 2025-09-15 20:27:17 UTC
backend	UNKNOWN STEP	2025-09-15T20:27:48.4426656Z  2025-09-15 20:27:17.942 UTC [1] LOG:  database system is ready to accept connections
backend	UNKNOWN STEP	2025-09-15T20:27:48.4427262Z  2025-09-15 20:27:27.072 UTC [75] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-09-15T20:27:48.4427635Z  2025-09-15 20:27:37.137 UTC [83] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-09-15T20:27:48.4427967Z  2025-09-15 20:27:47.211 UTC [92] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-09-15T20:27:48.4428441Z  2025-09-15 20:27:48.199 UTC [84] ERROR:  null value in column "title" of relation "products" violates not-null constraint
backend	UNKNOWN STEP	2025-09-15T20:27:48.4429933Z  2025-09-15 20:27:48.199 UTC [84] DETAIL:  Failing row contains (1, 1, Organic Tomatoes, organic-tomatoes, Fresh organic tomatoes grown without pesticides, 3.50, kg, 100, Vegetables, https://images.unsplash.com/photo-1592841200221-a6898f307baa, available, 2025-09-15 20:27:48, 2025-09-15 20:27:48, t, 1.000, t, null, f, EUR, null, null, null, null, null).
backend	UNKNOWN STEP	2025-09-15T20:27:48.4431630Z  2025-09-15 20:27:48.199 UTC [84] STATEMENT:  insert into "products" ("slug", "producer_id", "name", "description", "price", "weight_per_unit", "unit", "stock", "category", "is_organic", "image_url", "status", "is_active", "updated_at", "created_at") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) returning "id"
backend	UNKNOWN STEP	2025-09-15T20:27:48.4432571Z  2025-09-15 20:27:17.634 UTC [48] LOG:  database system is ready to accept connections
backend	UNKNOWN STEP	2025-09-15T20:27:48.4432893Z   done
backend	UNKNOWN STEP	2025-09-15T20:27:48.4433058Z  server started
backend	UNKNOWN STEP	2025-09-15T20:27:48.4433228Z  CREATE DATABASE
backend	UNKNOWN STEP	2025-09-15T20:27:48.4433398Z  
backend	UNKNOWN STEP	2025-09-15T20:27:48.4433536Z  
backend	UNKNOWN STEP	2025-09-15T20:27:48.4433827Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
backend	UNKNOWN STEP	2025-09-15T20:27:48.4434182Z  
backend	UNKNOWN STEP	2025-09-15T20:27:48.4434397Z  2025-09-15 20:27:17.812 UTC [48] LOG:  received fast shutdown request
backend	UNKNOWN STEP	2025-09-15T20:27:48.4434853Z  waiting for server to shut down....2025-09-15 20:27:17.813 UTC [48] LOG:  aborting any active transactions
backend	UNKNOWN STEP	2025-09-15T20:27:48.4435563Z  2025-09-15 20:27:17.815 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
backend	UNKNOWN STEP	2025-09-15T20:27:48.4436014Z  2025-09-15 20:27:17.815 UTC [49] LOG:  shutting down
backend	UNKNOWN STEP	2025-09-15T20:27:48.4436355Z  2025-09-15 20:27:17.815 UTC [49] LOG:  checkpoint starting: shutdown immediate
backend	UNKNOWN STEP	2025-09-15T20:27:48.4437362Z  2025-09-15 20:27:17.831 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.013 s, sync=0.002 s, total=0.017 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
backend	UNKNOWN STEP	2025-09-15T20:27:48.4438142Z  2025-09-15 20:27:17.837 UTC [48] LOG:  database system is shut down
backend	UNKNOWN STEP	2025-09-15T20:27:48.4438424Z   done
backend	UNKNOWN STEP	2025-09-15T20:27:48.4438578Z  server stopped
backend	UNKNOWN STEP	2025-09-15T20:27:48.4438754Z  
backend	UNKNOWN STEP	2025-09-15T20:27:48.4438960Z  PostgreSQL init process complete; ready for start up.
backend	UNKNOWN STEP	2025-09-15T20:27:48.4439222Z  
backend	UNKNOWN STEP	2025-09-15T20:27:48.4445087Z Stop and remove container: 794f15fb29324fa3adcfcbb54b53119e_postgres15_53f854
backend	UNKNOWN STEP	2025-09-15T20:27:48.4450425Z ##[command]/usr/bin/docker rm --force c5437491ceb776f360dd679af728027d412e4e851da9371a37b815e5691da33e
backend	UNKNOWN STEP	2025-09-15T20:27:49.8617378Z c5437491ceb776f360dd679af728027d412e4e851da9371a37b815e5691da33e
backend	UNKNOWN STEP	2025-09-15T20:27:49.8643048Z Remove container network: github_network_887280a8fa64446e8a436117c18a2233
backend	UNKNOWN STEP	2025-09-15T20:27:49.8647602Z ##[command]/usr/bin/docker network rm github_network_887280a8fa64446e8a436117c18a2233
backend	UNKNOWN STEP	2025-09-15T20:27:49.9811946Z github_network_887280a8fa64446e8a436117c18a2233
backend	UNKNOWN STEP	2025-09-15T20:27:49.9867692Z Cleaning up orphan processes
```

</details>

### PR #164
- URL: https://github.com/lomendor/Project-Dixis/pull/164
- Bucket: phpunit-feature
- Failing Job: backend
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17745228438/job/50428791894

<details><summary>Head (first 60 lines)</summary>

```
backend	UNKNOWN STEP	﻿2025-09-15T20:09:05.8715394Z Current runner version: '2.328.0'
backend	UNKNOWN STEP	2025-09-15T20:09:05.8746444Z ##[group]Runner Image Provisioner
backend	UNKNOWN STEP	2025-09-15T20:09:05.8747691Z Hosted Compute Agent
backend	UNKNOWN STEP	2025-09-15T20:09:05.8748548Z Version: 20250829.383
backend	UNKNOWN STEP	2025-09-15T20:09:05.8749432Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
backend	UNKNOWN STEP	2025-09-15T20:09:05.8750730Z Build Date: 2025-08-29T13:48:48Z
backend	UNKNOWN STEP	2025-09-15T20:09:05.8751665Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T20:09:05.8752639Z ##[group]Operating System
backend	UNKNOWN STEP	2025-09-15T20:09:05.8753708Z Ubuntu
backend	UNKNOWN STEP	2025-09-15T20:09:05.8754467Z 24.04.3
backend	UNKNOWN STEP	2025-09-15T20:09:05.8755169Z LTS
backend	UNKNOWN STEP	2025-09-15T20:09:05.8755937Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T20:09:05.8756779Z ##[group]Runner Image
backend	UNKNOWN STEP	2025-09-15T20:09:05.8757605Z Image: ubuntu-24.04
backend	UNKNOWN STEP	2025-09-15T20:09:05.8758481Z Version: 20250907.24.1
backend	UNKNOWN STEP	2025-09-15T20:09:05.8760136Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
backend	UNKNOWN STEP	2025-09-15T20:09:05.8763064Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
backend	UNKNOWN STEP	2025-09-15T20:09:05.8764668Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T20:09:05.8766479Z ##[group]GITHUB_TOKEN Permissions
backend	UNKNOWN STEP	2025-09-15T20:09:05.8768863Z Contents: read
backend	UNKNOWN STEP	2025-09-15T20:09:05.8769681Z Metadata: read
backend	UNKNOWN STEP	2025-09-15T20:09:05.8770628Z Packages: read
backend	UNKNOWN STEP	2025-09-15T20:09:05.8771382Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T20:09:05.8774342Z Secret source: Actions
backend	UNKNOWN STEP	2025-09-15T20:09:05.8775499Z Prepare workflow directory
backend	UNKNOWN STEP	2025-09-15T20:09:05.9363941Z Prepare all required actions
backend	UNKNOWN STEP	2025-09-15T20:09:05.9418843Z Getting action download info
backend	UNKNOWN STEP	2025-09-15T20:09:06.2298033Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
backend	UNKNOWN STEP	2025-09-15T20:09:06.2974962Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
backend	UNKNOWN STEP	2025-09-15T20:09:06.5888643Z Complete job name: backend
backend	UNKNOWN STEP	2025-09-15T20:09:06.6364584Z ##[group]Checking docker version
backend	UNKNOWN STEP	2025-09-15T20:09:06.6377719Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
backend	UNKNOWN STEP	2025-09-15T20:09:06.6852185Z '1.48'
backend	UNKNOWN STEP	2025-09-15T20:09:06.6865337Z Docker daemon API version: '1.48'
backend	UNKNOWN STEP	2025-09-15T20:09:06.6866092Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
backend	UNKNOWN STEP	2025-09-15T20:09:06.7014883Z '1.48'
backend	UNKNOWN STEP	2025-09-15T20:09:06.7027805Z Docker client API version: '1.48'
backend	UNKNOWN STEP	2025-09-15T20:09:06.7033160Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T20:09:06.7035939Z ##[group]Clean up resources from previous jobs
backend	UNKNOWN STEP	2025-09-15T20:09:06.7040897Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=3ea5f3"
backend	UNKNOWN STEP	2025-09-15T20:09:06.7176800Z ##[command]/usr/bin/docker network prune --force --filter "label=3ea5f3"
backend	UNKNOWN STEP	2025-09-15T20:09:06.7295723Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T20:09:06.7296180Z ##[group]Create local container network
backend	UNKNOWN STEP	2025-09-15T20:09:06.7305823Z ##[command]/usr/bin/docker network create --label 3ea5f3 github_network_26af819365004540978a444faab87f96
backend	UNKNOWN STEP	2025-09-15T20:09:06.7826952Z de181829b0eda63aa81981514c4d86c4c67c82382baa296133d5d69b21f80d4b
backend	UNKNOWN STEP	2025-09-15T20:09:06.7845954Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-15T20:09:06.7869581Z ##[group]Starting postgres service container
backend	UNKNOWN STEP	2025-09-15T20:09:06.7888975Z ##[command]/usr/bin/docker pull postgres:15
backend	UNKNOWN STEP	2025-09-15T20:09:07.0501252Z 15: Pulling from library/postgres
backend	UNKNOWN STEP	2025-09-15T20:09:07.1202498Z ce1261c6d567: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:09:07.1204296Z 80ed16669c95: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:09:07.1205191Z 4e5806601837: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:09:07.1205984Z b18445125df5: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:09:07.1206779Z 874a3ca0fb79: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:09:07.1207588Z 38a0056e8c05: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:09:07.1208419Z cb4494753109: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:09:07.1209257Z 9286f415f93a: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:09:07.1209848Z 60570350e677: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:09:07.1210439Z 0b33c9cfc245: Pulling fs layer
backend	UNKNOWN STEP	2025-09-15T20:09:07.1210929Z 38a0056e8c05: Waiting
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
backend	UNKNOWN STEP	2025-09-15T20:09:41.5581330Z  2025-09-15 20:09:13.959 UTC [1] LOG:  database system is ready to accept connections
backend	UNKNOWN STEP	2025-09-15T20:09:41.5582056Z  2025-09-15 20:09:23.088 UTC [75] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-09-15T20:09:41.5582843Z  2025-09-15 20:09:33.155 UTC [83] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-09-15T20:09:41.5583640Z  2025-09-15 20:09:41.299 UTC [84] ERROR:  null value in column "title" of relation "products" violates not-null constraint
backend	UNKNOWN STEP	2025-09-15T20:09:41.5585872Z  2025-09-15 20:09:41.299 UTC [84] DETAIL:  Failing row contains (1, 1, Organic Tomatoes, organic-tomatoes, Fresh organic tomatoes grown without pesticides, 3.50, kg, 100, Vegetables, https://images.unsplash.com/photo-1592841200221-a6898f307baa, available, 2025-09-15 20:09:41, 2025-09-15 20:09:41, t, 1.000, t, null, f, EUR, null, null, null, null, null).
backend	UNKNOWN STEP	2025-09-15T20:09:41.5589025Z  2025-09-15 20:09:41.299 UTC [84] STATEMENT:  insert into "products" ("slug", "producer_id", "name", "description", "price", "weight_per_unit", "unit", "stock", "category", "is_organic", "image_url", "status", "is_active", "updated_at", "created_at") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) returning "id"
backend	UNKNOWN STEP	2025-09-15T20:09:41.5590437Z  This user must also own the server process.
backend	UNKNOWN STEP	2025-09-15T20:09:41.5590686Z  
backend	UNKNOWN STEP	2025-09-15T20:09:41.5590939Z  The database cluster will be initialized with locale "en_US.utf8".
backend	UNKNOWN STEP	2025-09-15T20:09:41.5591333Z  The default database encoding has accordingly been set to "UTF8".
backend	UNKNOWN STEP	2025-09-15T20:09:41.5591709Z  The default text search configuration will be set to "english".
backend	UNKNOWN STEP	2025-09-15T20:09:41.5591994Z  
backend	UNKNOWN STEP	2025-09-15T20:09:41.5592155Z  Data page checksums are disabled.
backend	UNKNOWN STEP	2025-09-15T20:09:41.5592666Z  
backend	UNKNOWN STEP	2025-09-15T20:09:41.5592957Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
backend	UNKNOWN STEP	2025-09-15T20:09:41.5593351Z  creating subdirectories ... ok
backend	UNKNOWN STEP	2025-09-15T20:09:41.5593635Z  selecting dynamic shared memory implementation ... posix
backend	UNKNOWN STEP	2025-09-15T20:09:41.5593939Z  selecting default max_connections ... 100
backend	UNKNOWN STEP	2025-09-15T20:09:41.5594202Z  selecting default shared_buffers ... 128MB
backend	UNKNOWN STEP	2025-09-15T20:09:41.5594466Z  selecting default time zone ... Etc/UTC
backend	UNKNOWN STEP	2025-09-15T20:09:41.5594709Z  creating configuration files ... ok
backend	UNKNOWN STEP	2025-09-15T20:09:41.5594947Z  running bootstrap script ... ok
backend	UNKNOWN STEP	2025-09-15T20:09:41.5595201Z  performing post-bootstrap initialization ... ok
backend	UNKNOWN STEP	2025-09-15T20:09:41.5595471Z  syncing data to disk ... ok
backend	UNKNOWN STEP	2025-09-15T20:09:41.5595667Z  
backend	UNKNOWN STEP	2025-09-15T20:09:41.5595800Z  
backend	UNKNOWN STEP	2025-09-15T20:09:41.5595998Z  Success. You can now start the database server using:
backend	UNKNOWN STEP	2025-09-15T20:09:41.5596254Z  
backend	UNKNOWN STEP	2025-09-15T20:09:41.5596454Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
backend	UNKNOWN STEP	2025-09-15T20:09:41.5596717Z  
backend	UNKNOWN STEP	2025-09-15T20:09:41.5597470Z  waiting for server to start....2025-09-15 20:09:13.645 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
backend	UNKNOWN STEP	2025-09-15T20:09:41.5598223Z  2025-09-15 20:09:13.646 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
backend	UNKNOWN STEP	2025-09-15T20:09:41.5598722Z  2025-09-15 20:09:13.649 UTC [51] LOG:  database system was shut down at 2025-09-15 20:09:13 UTC
backend	UNKNOWN STEP	2025-09-15T20:09:41.5599167Z  2025-09-15 20:09:13.652 UTC [48] LOG:  database system is ready to accept connections
backend	UNKNOWN STEP	2025-09-15T20:09:41.5599490Z   done
backend	UNKNOWN STEP	2025-09-15T20:09:41.5599645Z  server started
backend	UNKNOWN STEP	2025-09-15T20:09:41.5599811Z  CREATE DATABASE
backend	UNKNOWN STEP	2025-09-15T20:09:41.5599972Z  
backend	UNKNOWN STEP	2025-09-15T20:09:41.5600108Z  
backend	UNKNOWN STEP	2025-09-15T20:09:41.5600395Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
backend	UNKNOWN STEP	2025-09-15T20:09:41.5600759Z  
backend	UNKNOWN STEP	2025-09-15T20:09:41.5600971Z  2025-09-15 20:09:13.832 UTC [48] LOG:  received fast shutdown request
backend	UNKNOWN STEP	2025-09-15T20:09:41.5601431Z  waiting for server to shut down....2025-09-15 20:09:13.833 UTC [48] LOG:  aborting any active transactions
backend	UNKNOWN STEP	2025-09-15T20:09:41.5602200Z  2025-09-15 20:09:13.834 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
backend	UNKNOWN STEP	2025-09-15T20:09:41.5602854Z  2025-09-15 20:09:13.835 UTC [49] LOG:  shutting down
backend	UNKNOWN STEP	2025-09-15T20:09:41.5603191Z  2025-09-15 20:09:13.836 UTC [49] LOG:  checkpoint starting: shutdown immediate
backend	UNKNOWN STEP	2025-09-15T20:09:41.5604002Z  2025-09-15 20:09:13.853 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.002 s, total=0.018 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
backend	UNKNOWN STEP	2025-09-15T20:09:41.5604780Z  2025-09-15 20:09:13.859 UTC [48] LOG:  database system is shut down
backend	UNKNOWN STEP	2025-09-15T20:09:41.5605055Z   done
backend	UNKNOWN STEP	2025-09-15T20:09:41.5605202Z  server stopped
backend	UNKNOWN STEP	2025-09-15T20:09:41.5605362Z  
backend	UNKNOWN STEP	2025-09-15T20:09:41.5605568Z  PostgreSQL init process complete; ready for start up.
backend	UNKNOWN STEP	2025-09-15T20:09:41.5605823Z  
backend	UNKNOWN STEP	2025-09-15T20:09:41.5610950Z Stop and remove container: 7b86a01932b646cfb0a4cec80302b8d3_postgres15_67c123
backend	UNKNOWN STEP	2025-09-15T20:09:41.5616170Z ##[command]/usr/bin/docker rm --force 6ddee3d74d7836a8c9d567886d258a4d089aedd2ea3f4e9ae32fc518d0466640
backend	UNKNOWN STEP	2025-09-15T20:09:43.0161678Z 6ddee3d74d7836a8c9d567886d258a4d089aedd2ea3f4e9ae32fc518d0466640
backend	UNKNOWN STEP	2025-09-15T20:09:43.0188815Z Remove container network: github_network_26af819365004540978a444faab87f96
backend	UNKNOWN STEP	2025-09-15T20:09:43.0193213Z ##[command]/usr/bin/docker network rm github_network_26af819365004540978a444faab87f96
backend	UNKNOWN STEP	2025-09-15T20:09:43.1441288Z github_network_26af819365004540978a444faab87f96
backend	UNKNOWN STEP	2025-09-15T20:09:43.1498832Z Cleaning up orphan processes
```

</details>

### PR #162
- URL: https://github.com/lomendor/Project-Dixis/pull/162
- Bucket: phpunit-feature
- Failing Job: e2e
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17742384644/job/50419561057

<details><summary>Head (first 60 lines)</summary>

```
e2e	UNKNOWN STEP	﻿2025-09-15T18:10:34.8813061Z Current runner version: '2.328.0'
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8839397Z ##[group]Runner Image Provisioner
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8840178Z Hosted Compute Agent
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8840684Z Version: 20250829.383
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8841367Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8842063Z Build Date: 2025-08-29T13:48:48Z
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8842609Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8843219Z ##[group]Operating System
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8844078Z Ubuntu
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8844613Z 24.04.3
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8845108Z LTS
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8845590Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8846041Z ##[group]Runner Image
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8846693Z Image: ubuntu-24.04
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8847195Z Version: 20250907.24.1
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8848181Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8849809Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8850764Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8851932Z ##[group]GITHUB_TOKEN Permissions
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8854192Z Contents: read
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8854788Z Metadata: read
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8855307Z Packages: read
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8855754Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8858270Z Secret source: Dependabot
e2e	UNKNOWN STEP	2025-09-15T18:10:34.8859352Z Prepare workflow directory
e2e	UNKNOWN STEP	2025-09-15T18:10:34.9289642Z Prepare all required actions
e2e	UNKNOWN STEP	2025-09-15T18:10:34.9328673Z Getting action download info
e2e	UNKNOWN STEP	2025-09-15T18:10:35.2806703Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
e2e	UNKNOWN STEP	2025-09-15T18:10:35.4694804Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
e2e	UNKNOWN STEP	2025-09-15T18:10:35.6479188Z Download action repository 'actions/setup-node@v5' (SHA:a0853c24544627f65ddf259abe73b1d18a591444)
e2e	UNKNOWN STEP	2025-09-15T18:10:35.9479335Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
e2e	UNKNOWN STEP	2025-09-15T18:10:36.1661731Z Complete job name: e2e
e2e	UNKNOWN STEP	2025-09-15T18:10:36.2413973Z ##[group]Checking docker version
e2e	UNKNOWN STEP	2025-09-15T18:10:36.2433497Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
e2e	UNKNOWN STEP	2025-09-15T18:10:36.6307479Z '1.48'
e2e	UNKNOWN STEP	2025-09-15T18:10:36.6330673Z Docker daemon API version: '1.48'
e2e	UNKNOWN STEP	2025-09-15T18:10:36.6332085Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
e2e	UNKNOWN STEP	2025-09-15T18:10:36.6520446Z '1.48'
e2e	UNKNOWN STEP	2025-09-15T18:10:36.6537154Z Docker client API version: '1.48'
e2e	UNKNOWN STEP	2025-09-15T18:10:36.6544633Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T18:10:36.6548888Z ##[group]Clean up resources from previous jobs
e2e	UNKNOWN STEP	2025-09-15T18:10:36.6555925Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=1729e4"
e2e	UNKNOWN STEP	2025-09-15T18:10:36.6724651Z ##[command]/usr/bin/docker network prune --force --filter "label=1729e4"
e2e	UNKNOWN STEP	2025-09-15T18:10:36.6875021Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T18:10:36.6875924Z ##[group]Create local container network
e2e	UNKNOWN STEP	2025-09-15T18:10:36.6887715Z ##[command]/usr/bin/docker network create --label 1729e4 github_network_769a0e57f32046ccb8c93f3b76c38a86
e2e	UNKNOWN STEP	2025-09-15T18:10:36.7405234Z 15ca6fc8c6e91296b3f946b3f28dd300ac9b631001975cbca0e997fb2f73cb29
e2e	UNKNOWN STEP	2025-09-15T18:10:36.7424712Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T18:10:36.7450910Z ##[group]Starting postgres service container
e2e	UNKNOWN STEP	2025-09-15T18:10:36.7471464Z ##[command]/usr/bin/docker pull postgres:15
e2e	UNKNOWN STEP	2025-09-15T18:10:37.0331579Z 15: Pulling from library/postgres
e2e	UNKNOWN STEP	2025-09-15T18:10:37.1051564Z ce1261c6d567: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:37.1053410Z 80ed16669c95: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:37.1055084Z 4e5806601837: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:37.1056553Z b18445125df5: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:37.1058114Z 874a3ca0fb79: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:37.1059309Z 38a0056e8c05: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:37.1060507Z cb4494753109: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:37.1061680Z 9286f415f93a: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:37.1062830Z 60570350e677: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3555628Z  2025-09-15 18:13:55.216 UTC [229] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3556019Z  The database cluster will be initialized with locale "en_US.utf8".
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3556434Z  The default database encoding has accordingly been set to "UTF8".
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3556869Z  The default text search configuration will be set to "english".
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3557403Z  
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3557717Z  Data page checksums are disabled.
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3558112Z  
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3558570Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3559208Z  creating subdirectories ... ok
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3559720Z  selecting dynamic shared memory implementation ... posix
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3560561Z  selecting default max_connections ... 100
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3561054Z  selecting default shared_buffers ... 128MB
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3561502Z  selecting default time zone ... Etc/UTC
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3561779Z  creating configuration files ... ok
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3562196Z  running bootstrap script ... ok
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3562481Z  performing post-bootstrap initialization ... ok
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3562771Z  syncing data to disk ... ok
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3562987Z  
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3563142Z  
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3563351Z  Success. You can now start the database server using:
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3563844Z  
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3564087Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3564359Z  
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3564905Z  waiting for server to start....2025-09-15 18:10:44.519 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3565658Z  2025-09-15 18:10:44.520 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3566151Z  2025-09-15 18:10:44.523 UTC [51] LOG:  database system was shut down at 2025-09-15 18:10:44 UTC
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3566591Z  2025-09-15 18:10:44.527 UTC [48] LOG:  database system is ready to accept connections
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3566913Z   done
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3567085Z  server started
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3567271Z  CREATE DATABASE
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3567449Z  
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3567600Z  
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3567898Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3568266Z  
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3568497Z  2025-09-15 18:10:44.708 UTC [48] LOG:  received fast shutdown request
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3568964Z  waiting for server to shut down....2025-09-15 18:10:44.708 UTC [48] LOG:  aborting any active transactions
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3569603Z  2025-09-15 18:10:44.710 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3570075Z  2025-09-15 18:10:44.710 UTC [49] LOG:  shutting down
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3570422Z  2025-09-15 18:10:44.711 UTC [49] LOG:  checkpoint starting: shutdown immediate
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3571253Z  2025-09-15 18:10:44.728 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.015 s, sync=0.002 s, total=0.018 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3572060Z  2025-09-15 18:10:44.735 UTC [48] LOG:  database system is shut down
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3572354Z   done
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3572521Z  server stopped
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3572699Z  
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3572915Z  PostgreSQL init process complete; ready for start up.
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3573191Z  
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3578385Z Stop and remove container: bc295633d78c4412b6edf04784d2347a_postgres15_6f2aac
e2e	UNKNOWN STEP	2025-09-15T18:14:00.3582836Z ##[command]/usr/bin/docker rm --force 7222b58a96a6e37b038749b0838a374052341d2192285990e1cda503ef1e4639
e2e	UNKNOWN STEP	2025-09-15T18:14:00.4842370Z 7222b58a96a6e37b038749b0838a374052341d2192285990e1cda503ef1e4639
e2e	UNKNOWN STEP	2025-09-15T18:14:00.4870529Z Remove container network: github_network_769a0e57f32046ccb8c93f3b76c38a86
e2e	UNKNOWN STEP	2025-09-15T18:14:00.4875319Z ##[command]/usr/bin/docker network rm github_network_769a0e57f32046ccb8c93f3b76c38a86
e2e	UNKNOWN STEP	2025-09-15T18:14:00.6288954Z github_network_769a0e57f32046ccb8c93f3b76c38a86
e2e	UNKNOWN STEP	2025-09-15T18:14:00.6351439Z Cleaning up orphan processes
e2e	UNKNOWN STEP	2025-09-15T18:14:00.6784617Z Terminate orphan process: pid (4292) (bash)
e2e	UNKNOWN STEP	2025-09-15T18:14:00.6801685Z Terminate orphan process: pid (4293) (php)
e2e	UNKNOWN STEP	2025-09-15T18:14:00.6817928Z Terminate orphan process: pid (4296) (php8.2)
e2e	UNKNOWN STEP	2025-09-15T18:14:00.6843363Z Terminate orphan process: pid (4511) (bash)
e2e	UNKNOWN STEP	2025-09-15T18:14:00.6898262Z Terminate orphan process: pid (4512) (npm run start)
e2e	UNKNOWN STEP	2025-09-15T18:14:00.6926776Z Terminate orphan process: pid (4523) (sh)
e2e	UNKNOWN STEP	2025-09-15T18:14:00.6948581Z Terminate orphan process: pid (4524) (next-server (v15.5.0))
```

</details>

### PR #161
- URL: https://github.com/lomendor/Project-Dixis/pull/161
- Bucket: phpunit-feature
- Failing Job: e2e
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17742366795/job/50419525365

<details><summary>Head (first 60 lines)</summary>

```
e2e	UNKNOWN STEP	﻿2025-09-15T18:10:08.7024986Z Current runner version: '2.328.0'
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7074255Z ##[group]Runner Image Provisioner
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7075037Z Hosted Compute Agent
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7075571Z Version: 20250829.383
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7076241Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7076927Z Build Date: 2025-08-29T13:48:48Z
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7077481Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7078107Z ##[group]Operating System
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7078628Z Ubuntu
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7079102Z 24.04.3
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7079906Z LTS
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7080360Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7080856Z ##[group]Runner Image
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7081499Z Image: ubuntu-24.04
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7082027Z Version: 20250907.24.1
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7082999Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7084579Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7085565Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7086665Z ##[group]GITHUB_TOKEN Permissions
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7088796Z Contents: read
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7089536Z Metadata: read
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7090192Z Packages: read
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7090665Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7092787Z Secret source: Dependabot
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7093623Z Prepare workflow directory
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7529109Z Prepare all required actions
e2e	UNKNOWN STEP	2025-09-15T18:10:08.7567667Z Getting action download info
e2e	UNKNOWN STEP	2025-09-15T18:10:09.1686563Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
e2e	UNKNOWN STEP	2025-09-15T18:10:09.3826622Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
e2e	UNKNOWN STEP	2025-09-15T18:10:09.7911153Z Download action repository 'actions/setup-node@v5' (SHA:a0853c24544627f65ddf259abe73b1d18a591444)
e2e	UNKNOWN STEP	2025-09-15T18:10:10.2010999Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
e2e	UNKNOWN STEP	2025-09-15T18:10:10.4860518Z Complete job name: e2e
e2e	UNKNOWN STEP	2025-09-15T18:10:10.5444836Z ##[group]Checking docker version
e2e	UNKNOWN STEP	2025-09-15T18:10:10.5458358Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
e2e	UNKNOWN STEP	2025-09-15T18:10:12.3307507Z '1.48'
e2e	UNKNOWN STEP	2025-09-15T18:10:12.3321149Z Docker daemon API version: '1.48'
e2e	UNKNOWN STEP	2025-09-15T18:10:12.3321634Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
e2e	UNKNOWN STEP	2025-09-15T18:10:12.3532306Z '1.48'
e2e	UNKNOWN STEP	2025-09-15T18:10:12.3545210Z Docker client API version: '1.48'
e2e	UNKNOWN STEP	2025-09-15T18:10:12.3551121Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T18:10:12.3554028Z ##[group]Clean up resources from previous jobs
e2e	UNKNOWN STEP	2025-09-15T18:10:12.3558947Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=ee0322"
e2e	UNKNOWN STEP	2025-09-15T18:10:12.3690415Z ##[command]/usr/bin/docker network prune --force --filter "label=ee0322"
e2e	UNKNOWN STEP	2025-09-15T18:10:12.3814622Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T18:10:12.3814951Z ##[group]Create local container network
e2e	UNKNOWN STEP	2025-09-15T18:10:12.3824377Z ##[command]/usr/bin/docker network create --label ee0322 github_network_e273fb011ac64ef39047f116a63929e1
e2e	UNKNOWN STEP	2025-09-15T18:10:12.4318254Z 5ba1da17ad193de22afa68526153b73320a683a8c66d462c6782c89eebf0a508
e2e	UNKNOWN STEP	2025-09-15T18:10:12.4336597Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T18:10:12.4359656Z ##[group]Starting postgres service container
e2e	UNKNOWN STEP	2025-09-15T18:10:12.4378909Z ##[command]/usr/bin/docker pull postgres:15
e2e	UNKNOWN STEP	2025-09-15T18:10:12.9242190Z 15: Pulling from library/postgres
e2e	UNKNOWN STEP	2025-09-15T18:10:13.0413134Z ce1261c6d567: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:13.0414221Z 80ed16669c95: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:13.0414648Z 4e5806601837: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:13.0415155Z b18445125df5: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:13.0416102Z 874a3ca0fb79: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:13.0416515Z 38a0056e8c05: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:13.0417203Z cb4494753109: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:13.0417581Z 9286f415f93a: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T18:10:13.0417938Z 60570350e677: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5863634Z  
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5863959Z  The database cluster will be initialized with locale "en_US.utf8".
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5864382Z  The default database encoding has accordingly been set to "UTF8".
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5864816Z  The default text search configuration will be set to "english".
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5865117Z  
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5865292Z  Data page checksums are disabled.
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5865513Z  
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5866079Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5866591Z  creating subdirectories ... ok
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5866889Z  selecting dynamic shared memory implementation ... posix
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5867211Z  selecting default max_connections ... 100
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5867485Z  selecting default shared_buffers ... 128MB
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5867749Z  selecting default time zone ... Etc/UTC
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5868008Z  creating configuration files ... ok
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5868258Z  running bootstrap script ... ok
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5868532Z  performing post-bootstrap initialization ... ok
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5868807Z  syncing data to disk ... ok
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5869014Z  
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5869164Z  
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5869600Z  Success. You can now start the database server using:
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5869887Z  
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5870108Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5870378Z  
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5870931Z  waiting for server to start....2025-09-15 18:10:20.576 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5871680Z  2025-09-15 18:10:20.576 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5872173Z  2025-09-15 18:10:20.579 UTC [51] LOG:  database system was shut down at 2025-09-15 18:10:20 UTC
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5872612Z  2025-09-15 18:10:20.583 UTC [48] LOG:  database system is ready to accept connections
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5872935Z   done
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5873101Z  server started
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5873284Z  CREATE DATABASE
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5873458Z  
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5873604Z  
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5873905Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5874267Z  
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5874493Z  2025-09-15 18:10:20.762 UTC [48] LOG:  received fast shutdown request
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5874951Z  waiting for server to shut down....2025-09-15 18:10:20.763 UTC [48] LOG:  aborting any active transactions
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5875555Z  2025-09-15 18:10:20.764 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5876018Z  2025-09-15 18:10:20.765 UTC [49] LOG:  shutting down
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5876368Z  2025-09-15 18:10:20.765 UTC [49] LOG:  checkpoint starting: shutdown immediate
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5877179Z  2025-09-15 18:10:20.784 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.004 s, total=0.020 s; sync files=301, longest=0.002 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5877973Z  2025-09-15 18:10:20.790 UTC [48] LOG:  database system is shut down
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5878258Z   done
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5878419Z  server stopped
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5878593Z  
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5878807Z  PostgreSQL init process complete; ready for start up.
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5879088Z  
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5885849Z Stop and remove container: 9c4355e047cb49c499c742d2fb60e07e_postgres15_08cb01
e2e	UNKNOWN STEP	2025-09-15T18:13:54.5891006Z ##[command]/usr/bin/docker rm --force a79b5253cea92cb2b4c046b31c1d68f34052c216e3db82d50549455a0e9566ed
e2e	UNKNOWN STEP	2025-09-15T18:13:54.7128696Z a79b5253cea92cb2b4c046b31c1d68f34052c216e3db82d50549455a0e9566ed
e2e	UNKNOWN STEP	2025-09-15T18:13:54.7156922Z Remove container network: github_network_e273fb011ac64ef39047f116a63929e1
e2e	UNKNOWN STEP	2025-09-15T18:13:54.7161298Z ##[command]/usr/bin/docker network rm github_network_e273fb011ac64ef39047f116a63929e1
e2e	UNKNOWN STEP	2025-09-15T18:13:54.8399876Z github_network_e273fb011ac64ef39047f116a63929e1
e2e	UNKNOWN STEP	2025-09-15T18:13:54.8457286Z Cleaning up orphan processes
e2e	UNKNOWN STEP	2025-09-15T18:13:54.8869078Z Terminate orphan process: pid (4353) (bash)
e2e	UNKNOWN STEP	2025-09-15T18:13:54.8888129Z Terminate orphan process: pid (4354) (php)
e2e	UNKNOWN STEP	2025-09-15T18:13:54.8904427Z Terminate orphan process: pid (4357) (php8.2)
e2e	UNKNOWN STEP	2025-09-15T18:13:54.8940429Z Terminate orphan process: pid (4572) (bash)
e2e	UNKNOWN STEP	2025-09-15T18:13:54.8958746Z Terminate orphan process: pid (4573) (npm run start)
e2e	UNKNOWN STEP	2025-09-15T18:13:54.8981643Z Terminate orphan process: pid (4584) (sh)
e2e	UNKNOWN STEP	2025-09-15T18:13:54.9005570Z Terminate orphan process: pid (4585) (next-server (v15.5.0))
```

</details>

### PR #159
- URL: https://github.com/lomendor/Project-Dixis/pull/159
- Bucket: phpunit-feature
- Failing Job: e2e
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17741797477/job/50417506725

<details><summary>Head (first 60 lines)</summary>

```
e2e	UNKNOWN STEP	﻿2025-09-15T17:44:59.5554727Z Current runner version: '2.328.0'
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5582961Z ##[group]Runner Image Provisioner
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5583877Z Hosted Compute Agent
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5584488Z Version: 20250829.383
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5585131Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5585794Z Build Date: 2025-08-29T13:48:48Z
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5586438Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5586987Z ##[group]Operating System
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5587559Z Ubuntu
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5588137Z 24.04.3
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5588607Z LTS
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5589076Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5589549Z ##[group]Runner Image
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5590216Z Image: ubuntu-24.04
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5590700Z Version: 20250907.24.1
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5591701Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5593451Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5594495Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5595573Z ##[group]GITHUB_TOKEN Permissions
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5598231Z Contents: read
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5598914Z Metadata: read
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5599400Z Packages: read
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5599905Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5602062Z Secret source: Dependabot
e2e	UNKNOWN STEP	2025-09-15T17:44:59.5603700Z Prepare workflow directory
e2e	UNKNOWN STEP	2025-09-15T17:44:59.6056905Z Prepare all required actions
e2e	UNKNOWN STEP	2025-09-15T17:44:59.6097896Z Getting action download info
e2e	UNKNOWN STEP	2025-09-15T17:45:00.0324257Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
e2e	UNKNOWN STEP	2025-09-15T17:45:00.2324366Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
e2e	UNKNOWN STEP	2025-09-15T17:45:00.5328655Z Download action repository 'actions/setup-node@v5' (SHA:a0853c24544627f65ddf259abe73b1d18a591444)
e2e	UNKNOWN STEP	2025-09-15T17:45:00.9497087Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
e2e	UNKNOWN STEP	2025-09-15T17:45:01.1659274Z Complete job name: e2e
e2e	UNKNOWN STEP	2025-09-15T17:45:01.2278975Z ##[group]Checking docker version
e2e	UNKNOWN STEP	2025-09-15T17:45:01.2293033Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
e2e	UNKNOWN STEP	2025-09-15T17:45:01.3637744Z '1.48'
e2e	UNKNOWN STEP	2025-09-15T17:45:01.3651442Z Docker daemon API version: '1.48'
e2e	UNKNOWN STEP	2025-09-15T17:45:01.3653317Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
e2e	UNKNOWN STEP	2025-09-15T17:45:01.3833051Z '1.48'
e2e	UNKNOWN STEP	2025-09-15T17:45:01.3848189Z Docker client API version: '1.48'
e2e	UNKNOWN STEP	2025-09-15T17:45:01.3855309Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T17:45:01.3858586Z ##[group]Clean up resources from previous jobs
e2e	UNKNOWN STEP	2025-09-15T17:45:01.3865814Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=46703a"
e2e	UNKNOWN STEP	2025-09-15T17:45:01.4029942Z ##[command]/usr/bin/docker network prune --force --filter "label=46703a"
e2e	UNKNOWN STEP	2025-09-15T17:45:01.4165781Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T17:45:01.4166695Z ##[group]Create local container network
e2e	UNKNOWN STEP	2025-09-15T17:45:01.4177722Z ##[command]/usr/bin/docker network create --label 46703a github_network_7144b8df3f1346af812fabfd2d4c557a
e2e	UNKNOWN STEP	2025-09-15T17:45:01.4689263Z 7695cbf3df49b2fd17230b045b9384138a4133b14e9e08d498afc0555b8b5966
e2e	UNKNOWN STEP	2025-09-15T17:45:01.4708571Z ##[endgroup]
e2e	UNKNOWN STEP	2025-09-15T17:45:01.4733864Z ##[group]Starting postgres service container
e2e	UNKNOWN STEP	2025-09-15T17:45:01.4754383Z ##[command]/usr/bin/docker pull postgres:15
e2e	UNKNOWN STEP	2025-09-15T17:45:01.9030630Z 15: Pulling from library/postgres
e2e	UNKNOWN STEP	2025-09-15T17:45:02.0425626Z ce1261c6d567: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T17:45:02.0427746Z 80ed16669c95: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T17:45:02.0429528Z 4e5806601837: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T17:45:02.0431277Z b18445125df5: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T17:45:02.0433088Z 874a3ca0fb79: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T17:45:02.0434556Z 38a0056e8c05: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T17:45:02.0435966Z cb4494753109: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T17:45:02.0437283Z 9286f415f93a: Pulling fs layer
e2e	UNKNOWN STEP	2025-09-15T17:45:02.0438602Z 60570350e677: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3593605Z  2025-09-15 17:45:09.342 UTC [49] LOG:  database system is ready to accept connections
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3594187Z   done
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3594471Z  server started
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3594779Z  CREATE DATABASE
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3595087Z  
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3595345Z  
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3595868Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3597033Z  2025-09-15 17:45:09.642 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3598138Z  2025-09-15 17:45:09.642 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3598855Z  2025-09-15 17:45:09.642 UTC [1] LOG:  listening on IPv6 address "::", port 5432
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3599634Z  2025-09-15 17:45:09.643 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3600494Z  2025-09-15 17:45:09.646 UTC [65] LOG:  database system was shut down at 2025-09-15 17:45:09 UTC
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3601265Z  2025-09-15 17:45:09.650 UTC [1] LOG:  database system is ready to accept connections
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3601962Z  2025-09-15 17:45:18.742 UTC [76] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3603005Z  2025-09-15 17:45:28.808 UTC [84] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3603863Z  2025-09-15 17:45:38.884 UTC [92] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3604472Z  2025-09-15 17:45:48.950 UTC [101] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3605290Z  2025-09-15 17:45:59.030 UTC [109] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3605915Z  2025-09-15 17:46:09.100 UTC [117] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3606516Z  2025-09-15 17:46:19.167 UTC [126] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3606941Z  2025-09-15 17:46:29.254 UTC [134] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3607292Z  2025-09-15 17:46:39.321 UTC [143] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3607634Z  2025-09-15 17:46:49.400 UTC [152] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3607984Z  2025-09-15 17:46:59.481 UTC [160] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3608344Z  2025-09-15 17:47:09.562 UTC [169] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3608716Z  2025-09-15 17:47:19.643 UTC [177] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3609066Z  2025-09-15 17:47:29.708 UTC [187] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3609402Z  2025-09-15 17:47:39.773 UTC [196] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3609741Z  2025-09-15 17:47:49.852 UTC [204] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3610073Z  2025-09-15 17:47:59.917 UTC [213] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3610413Z  2025-09-15 17:48:09.982 UTC [221] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3610750Z  2025-09-15 17:48:20.050 UTC [230] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3611083Z  2025-09-15 17:48:30.114 UTC [238] FATAL:  role "root" does not exist
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3611367Z  
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3611594Z  2025-09-15 17:45:09.522 UTC [49] LOG:  received fast shutdown request
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3612060Z  waiting for server to shut down....2025-09-15 17:45:09.523 UTC [49] LOG:  aborting any active transactions
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3612914Z  2025-09-15 17:45:09.524 UTC [49] LOG:  background worker "logical replication launcher" (PID 55) exited with exit code 1
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3613384Z  2025-09-15 17:45:09.525 UTC [50] LOG:  shutting down
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3613732Z  2025-09-15 17:45:09.525 UTC [50] LOG:  checkpoint starting: shutdown immediate
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3614541Z  2025-09-15 17:45:09.543 UTC [50] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.003 s, total=0.019 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3615338Z  2025-09-15 17:45:09.550 UTC [49] LOG:  database system is shut down
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3615625Z   done
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3615784Z  server stopped
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3615959Z  
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3616184Z  PostgreSQL init process complete; ready for start up.
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3616471Z  
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3622808Z Stop and remove container: c158fa55e43249139595f1377342db65_postgres15_31646c
e2e	UNKNOWN STEP	2025-09-15T17:48:37.3627421Z ##[command]/usr/bin/docker rm --force e33d3aa8bd9e3764ffecd32c45d4cbb9a4fe7b86775c6a1b6e9792b3ad2d4fa0
e2e	UNKNOWN STEP	2025-09-15T17:48:37.4874852Z e33d3aa8bd9e3764ffecd32c45d4cbb9a4fe7b86775c6a1b6e9792b3ad2d4fa0
e2e	UNKNOWN STEP	2025-09-15T17:48:37.4903337Z Remove container network: github_network_7144b8df3f1346af812fabfd2d4c557a
e2e	UNKNOWN STEP	2025-09-15T17:48:37.4907695Z ##[command]/usr/bin/docker network rm github_network_7144b8df3f1346af812fabfd2d4c557a
e2e	UNKNOWN STEP	2025-09-15T17:48:37.6007423Z github_network_7144b8df3f1346af812fabfd2d4c557a
e2e	UNKNOWN STEP	2025-09-15T17:48:37.6065359Z Cleaning up orphan processes
e2e	UNKNOWN STEP	2025-09-15T17:48:37.6480768Z Terminate orphan process: pid (4341) (bash)
e2e	UNKNOWN STEP	2025-09-15T17:48:37.6498575Z Terminate orphan process: pid (4342) (php)
e2e	UNKNOWN STEP	2025-09-15T17:48:37.6524321Z Terminate orphan process: pid (4345) (php8.2)
e2e	UNKNOWN STEP	2025-09-15T17:48:37.6547390Z Terminate orphan process: pid (4557) (bash)
e2e	UNKNOWN STEP	2025-09-15T17:48:37.6584879Z Terminate orphan process: pid (4558) (npm run start)
e2e	UNKNOWN STEP	2025-09-15T17:48:37.6608308Z Terminate orphan process: pid (4569) (sh)
e2e	UNKNOWN STEP	2025-09-15T17:48:37.6630305Z Terminate orphan process: pid (4570) (next-server (v15.5.0))
```

</details>

### PR #114
- URL: https://github.com/lomendor/Project-Dixis/pull/114
- Bucket: lighthouse
- Failing Job: lighthouse
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17515808636/job/49753134415

<details><summary>Head (first 60 lines)</summary>

```
lighthouse	UNKNOWN STEP	﻿2025-09-06T14:39:58.0249805Z Current runner version: '2.328.0'
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0272225Z ##[group]Runner Image Provisioner
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0273207Z Hosted Compute Agent
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0273736Z Version: 20250829.383
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0274428Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0275106Z Build Date: 2025-08-29T13:48:48Z
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0275712Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0276288Z ##[group]Operating System
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0276876Z Ubuntu
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0277326Z 24.04.3
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0277839Z LTS
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0278314Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0278773Z ##[group]Runner Image
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0279392Z Image: ubuntu-24.04
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0279889Z Version: 20250831.1.0
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0280905Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250831.1/images/ubuntu/Ubuntu2404-Readme.md
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0282468Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250831.1
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0283774Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0284946Z ##[group]GITHUB_TOKEN Permissions
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0286714Z Contents: read
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0287250Z Metadata: read
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0287823Z Packages: read
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0288330Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0290299Z Secret source: Actions
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0291074Z Prepare workflow directory
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0699229Z Prepare all required actions
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.0738520Z Getting action download info
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.5850347Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
lighthouse	UNKNOWN STEP	2025-09-06T14:39:58.6476435Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
lighthouse	UNKNOWN STEP	2025-09-06T14:39:59.1393372Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
lighthouse	UNKNOWN STEP	2025-09-06T14:39:59.2232184Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
lighthouse	UNKNOWN STEP	2025-09-06T14:39:59.3390731Z Download action repository 'actions/github-script@v7' (SHA:f28e40c7f34bde8b3046d885e986cb6290c5673b)
lighthouse	UNKNOWN STEP	2025-09-06T14:39:59.9428625Z Complete job name: lighthouse
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.0020969Z ##[group]Checking docker version
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.0035156Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.0405484Z '1.48'
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.0418648Z Docker daemon API version: '1.48'
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.0420085Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.0570180Z '1.48'
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.0585721Z Docker client API version: '1.48'
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.0592426Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.0598112Z ##[group]Clean up resources from previous jobs
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.0604098Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=ccd3b7"
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.0739844Z ##[command]/usr/bin/docker network prune --force --filter "label=ccd3b7"
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.0875133Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.0876648Z ##[group]Create local container network
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.0891735Z ##[command]/usr/bin/docker network create --label ccd3b7 github_network_7283f1ba9e894aa9b6eaa6d95193f779
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.1522382Z 4a432c6ad0d837062246928c6aa8ff82075af6eca0a88534b8018b865a0e52c7
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.1543099Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.1579727Z ##[group]Starting postgres service container
lighthouse	UNKNOWN STEP	2025-09-06T14:40:00.1609685Z ##[command]/usr/bin/docker pull postgres:15
lighthouse	UNKNOWN STEP	2025-09-06T14:40:01.2121571Z 15: Pulling from library/postgres
lighthouse	UNKNOWN STEP	2025-09-06T14:40:01.4841302Z 396b1da7636e: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T14:40:01.4841961Z 16f135227934: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T14:40:01.4842452Z f56e480b4c77: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T14:40:01.4843170Z a421874e67d9: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T14:40:01.4843657Z 7f3001e6144e: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T14:40:01.4844120Z ad84dee38c61: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T14:40:01.4844565Z 812f8629a6fe: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T14:40:01.4844913Z d796a5724824: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7004314Z  2025-09-06 14:40:09.394 UTC [1] LOG:  database system is ready to accept connections
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7005006Z  2025-09-06 14:40:18.542 UTC [75] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7005614Z  2025-09-06 14:40:28.605 UTC [83] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7006218Z  2025-09-06 14:40:38.668 UTC [91] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7006828Z  2025-09-06 14:40:48.739 UTC [100] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7007446Z  2025-09-06 14:40:58.808 UTC [108] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7008016Z  This user must also own the server process.
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7008452Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7008885Z  The database cluster will be initialized with locale "en_US.utf8".
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7009627Z  The default database encoding has accordingly been set to "UTF8".
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7010329Z  The default text search configuration will be set to "english".
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7010889Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7011200Z  Data page checksums are disabled.
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7011615Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7012131Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7013090Z  creating subdirectories ... ok
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7013619Z  selecting dynamic shared memory implementation ... posix
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7014184Z  selecting default max_connections ... 100
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7014665Z  selecting default shared_buffers ... 128MB
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7015247Z  selecting default time zone ... Etc/UTC
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7015538Z  creating configuration files ... ok
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7015816Z  running bootstrap script ... ok
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7016134Z  performing post-bootstrap initialization ... ok
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7016454Z  syncing data to disk ... ok
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7016692Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7016853Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7017088Z  Success. You can now start the database server using:
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7017375Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7017601Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7017884Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7018453Z  waiting for server to start....2025-09-06 14:40:09.085 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7019233Z  2025-09-06 14:40:09.085 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7019744Z  2025-09-06 14:40:09.088 UTC [51] LOG:  database system was shut down at 2025-09-06 14:40:09 UTC
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7020218Z  2025-09-06 14:40:09.091 UTC [48] LOG:  database system is ready to accept connections
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7020555Z   done
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7020910Z  server started
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7021114Z  CREATE DATABASE
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7021301Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7021459Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7021778Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7022156Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7022397Z  2025-09-06 14:40:09.268 UTC [48] LOG:  received fast shutdown request
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7023116Z  waiting for server to shut down....2025-09-06 14:40:09.269 UTC [48] LOG:  aborting any active transactions
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7023754Z  2025-09-06 14:40:09.270 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7024244Z  2025-09-06 14:40:09.271 UTC [49] LOG:  shutting down
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7024613Z  2025-09-06 14:40:09.272 UTC [49] LOG:  checkpoint starting: shutdown immediate
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7025486Z  2025-09-06 14:40:09.287 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.013 s, sync=0.002 s, total=0.016 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7026358Z  2025-09-06 14:40:09.293 UTC [48] LOG:  database system is shut down
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7026665Z   done
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7027228Z  server stopped
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7027489Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7027825Z  PostgreSQL init process complete; ready for start up.
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7028131Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7033510Z Stop and remove container: 0e3a4c1ab413453da3dc11c0d20dbe5b_postgres15_d2530f
lighthouse	UNKNOWN STEP	2025-09-06T14:40:59.7037898Z ##[command]/usr/bin/docker rm --force 3b79258bb3a767fab1900c5a29fea8334b987a1b0f4ec9a266330fefd09d8cdf
lighthouse	UNKNOWN STEP	2025-09-06T14:41:00.8746317Z 3b79258bb3a767fab1900c5a29fea8334b987a1b0f4ec9a266330fefd09d8cdf
lighthouse	UNKNOWN STEP	2025-09-06T14:41:00.8771353Z Remove container network: github_network_7283f1ba9e894aa9b6eaa6d95193f779
lighthouse	UNKNOWN STEP	2025-09-06T14:41:00.8776104Z ##[command]/usr/bin/docker network rm github_network_7283f1ba9e894aa9b6eaa6d95193f779
lighthouse	UNKNOWN STEP	2025-09-06T14:41:00.9896679Z github_network_7283f1ba9e894aa9b6eaa6d95193f779
lighthouse	UNKNOWN STEP	2025-09-06T14:41:00.9956640Z Cleaning up orphan processes
```

</details>

### PR #113
- URL: https://github.com/lomendor/Project-Dixis/pull/113
- Bucket: lighthouse
- Failing Job: lighthouse
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17515686861/job/49752879692

<details><summary>Head (first 60 lines)</summary>

```
lighthouse	UNKNOWN STEP	﻿2025-09-06T14:28:09.1792609Z Current runner version: '2.328.0'
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1815809Z ##[group]Runner Image Provisioner
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1816739Z Hosted Compute Agent
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1817229Z Version: 20250829.383
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1817947Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1818594Z Build Date: 2025-08-29T13:48:48Z
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1819177Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1819807Z ##[group]Operating System
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1820361Z Ubuntu
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1820817Z 24.04.3
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1821308Z LTS
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1821764Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1822208Z ##[group]Runner Image
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1822825Z Image: ubuntu-24.04
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1823290Z Version: 20250831.1.0
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1824272Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250831.1/images/ubuntu/Ubuntu2404-Readme.md
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1825885Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250831.1
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1827193Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1828374Z ##[group]GITHUB_TOKEN Permissions
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1830530Z Contents: read
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1831161Z Metadata: read
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1831643Z Packages: read
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1832131Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1834529Z Secret source: Actions
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.1835410Z Prepare workflow directory
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.2258156Z Prepare all required actions
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.2299294Z Getting action download info
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.6016490Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
lighthouse	UNKNOWN STEP	2025-09-06T14:28:09.8703885Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
lighthouse	UNKNOWN STEP	2025-09-06T14:28:10.3251566Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
lighthouse	UNKNOWN STEP	2025-09-06T14:28:10.4543924Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
lighthouse	UNKNOWN STEP	2025-09-06T14:28:10.5667554Z Download action repository 'actions/github-script@v7' (SHA:f28e40c7f34bde8b3046d885e986cb6290c5673b)
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.0736454Z Complete job name: lighthouse
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.1333613Z ##[group]Checking docker version
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.1347541Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.2278227Z '1.48'
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.2292863Z Docker daemon API version: '1.48'
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.2294330Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.2473646Z '1.48'
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.2491135Z Docker client API version: '1.48'
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.2497438Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.2500742Z ##[group]Clean up resources from previous jobs
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.2507404Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=53a0ed"
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.2651240Z ##[command]/usr/bin/docker network prune --force --filter "label=53a0ed"
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.2785271Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.2786497Z ##[group]Create local container network
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.2797916Z ##[command]/usr/bin/docker network create --label 53a0ed github_network_4d8e776ed1894e5d9a92ad5bf81844b7
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.3302822Z b386a1e57f6cbb94dfc7f9822d7aec1a6339ea0d5b75f6258895b92c65d7d1a6
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.3322484Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.3347676Z ##[group]Starting postgres service container
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.3367842Z ##[command]/usr/bin/docker pull postgres:15
lighthouse	UNKNOWN STEP	2025-09-06T14:28:11.8966183Z 15: Pulling from library/postgres
lighthouse	UNKNOWN STEP	2025-09-06T14:28:12.0190116Z 396b1da7636e: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T14:28:12.0190667Z 16f135227934: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T14:28:12.0191186Z f56e480b4c77: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T14:28:12.0191698Z a421874e67d9: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T14:28:12.0192234Z 7f3001e6144e: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T14:28:12.0192800Z ad84dee38c61: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T14:28:12.0193336Z 812f8629a6fe: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T14:28:12.0193872Z d796a5724824: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9886623Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9886796Z  Data page checksums are disabled.
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9887025Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9887304Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9887672Z  creating subdirectories ... ok
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9887976Z  selecting dynamic shared memory implementation ... posix
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9888289Z  selecting default max_connections ... 100
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9888553Z  selecting default shared_buffers ... 128MB
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9888815Z  selecting default time zone ... Etc/UTC
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9889064Z  creating configuration files ... ok
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9889304Z  running bootstrap script ... ok
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9889568Z  performing post-bootstrap initialization ... ok
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9889845Z  syncing data to disk ... ok
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9890049Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9890184Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9890387Z  Success. You can now start the database server using:
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9890656Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9890853Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9891114Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9891692Z  waiting for server to start....2025-09-06 14:28:18.938 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9892460Z  2025-09-06 14:28:18.939 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9892960Z  2025-09-06 14:28:18.942 UTC [51] LOG:  database system was shut down at 2025-09-06 14:28:18 UTC
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9893403Z  2025-09-06 14:28:18.945 UTC [48] LOG:  database system is ready to accept connections
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9893721Z   done
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9893880Z  server started
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9894054Z  CREATE DATABASE
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9894474Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9895264Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9895812Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9896657Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9897030Z  2025-09-06 14:28:19.126 UTC [48] LOG:  received fast shutdown request
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9897548Z  waiting for server to shut down....2025-09-06 14:28:19.126 UTC [48] LOG:  aborting any active transactions
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9898156Z  2025-09-06 14:28:19.128 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9898635Z  2025-09-06 14:28:19.128 UTC [49] LOG:  shutting down
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9898978Z  2025-09-06 14:28:19.129 UTC [49] LOG:  checkpoint starting: shutdown immediate
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9899604Z  2025-09-06 14:28:19.245 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9900208Z  2025-09-06 14:28:19.245 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9900613Z  2025-09-06 14:28:19.245 UTC [1] LOG:  listening on IPv6 address "::", port 5432
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9901302Z  2025-09-06 14:28:19.246 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9901820Z  2025-09-06 14:28:19.249 UTC [64] LOG:  database system was shut down at 2025-09-06 14:28:19 UTC
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9902251Z  2025-09-06 14:28:19.253 UTC [1] LOG:  database system is ready to accept connections
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9902637Z  2025-09-06 14:28:28.365 UTC [75] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9902973Z  2025-09-06 14:28:38.428 UTC [83] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9903303Z  2025-09-06 14:28:48.498 UTC [91] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9903639Z  2025-09-06 14:28:58.578 UTC [100] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9903970Z  2025-09-06 14:29:08.651 UTC [108] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9904776Z  2025-09-06 14:28:19.146 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.003 s, total=0.018 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9905575Z  2025-09-06 14:28:19.152 UTC [48] LOG:  database system is shut down
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9905852Z   done
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9906197Z  server stopped
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9906369Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9906581Z  PostgreSQL init process complete; ready for start up.
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9906853Z  
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9911845Z Stop and remove container: ee483c6c3a7e46c6937cac8116ddf451_postgres15_4522f7
lighthouse	UNKNOWN STEP	2025-09-06T14:29:08.9917115Z ##[command]/usr/bin/docker rm --force ed280c108af30f9a47507378768f7ee9a84fc500fde06a1fa8da7f27e58010ce
lighthouse	UNKNOWN STEP	2025-09-06T14:29:09.7765315Z ed280c108af30f9a47507378768f7ee9a84fc500fde06a1fa8da7f27e58010ce
lighthouse	UNKNOWN STEP	2025-09-06T14:29:09.7794822Z Remove container network: github_network_4d8e776ed1894e5d9a92ad5bf81844b7
lighthouse	UNKNOWN STEP	2025-09-06T14:29:09.7799482Z ##[command]/usr/bin/docker network rm github_network_4d8e776ed1894e5d9a92ad5bf81844b7
lighthouse	UNKNOWN STEP	2025-09-06T14:29:09.9153266Z github_network_4d8e776ed1894e5d9a92ad5bf81844b7
lighthouse	UNKNOWN STEP	2025-09-06T14:29:09.9211894Z Cleaning up orphan processes
```

</details>

### PR #112
- URL: https://github.com/lomendor/Project-Dixis/pull/112
- Bucket: phpunit-feature
- Failing Job: backend
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17515310409/job/49752044998

<details><summary>Head (first 60 lines)</summary>

```
backend	UNKNOWN STEP	﻿2025-09-06T13:49:51.3587480Z Current runner version: '2.328.0'
backend	UNKNOWN STEP	2025-09-06T13:49:51.3609801Z ##[group]Runner Image Provisioner
backend	UNKNOWN STEP	2025-09-06T13:49:51.3610692Z Hosted Compute Agent
backend	UNKNOWN STEP	2025-09-06T13:49:51.3611249Z Version: 20250829.383
backend	UNKNOWN STEP	2025-09-06T13:49:51.3612049Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
backend	UNKNOWN STEP	2025-09-06T13:49:51.3612797Z Build Date: 2025-08-29T13:48:48Z
backend	UNKNOWN STEP	2025-09-06T13:49:51.3613408Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-06T13:49:51.3613886Z ##[group]Operating System
backend	UNKNOWN STEP	2025-09-06T13:49:51.3614493Z Ubuntu
backend	UNKNOWN STEP	2025-09-06T13:49:51.3614958Z 24.04.3
backend	UNKNOWN STEP	2025-09-06T13:49:51.3615422Z LTS
backend	UNKNOWN STEP	2025-09-06T13:49:51.3615954Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-06T13:49:51.3616417Z ##[group]Runner Image
backend	UNKNOWN STEP	2025-09-06T13:49:51.3616947Z Image: ubuntu-24.04
backend	UNKNOWN STEP	2025-09-06T13:49:51.3617391Z Version: 20250831.1.0
backend	UNKNOWN STEP	2025-09-06T13:49:51.3618453Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250831.1/images/ubuntu/Ubuntu2404-Readme.md
backend	UNKNOWN STEP	2025-09-06T13:49:51.3619892Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250831.1
backend	UNKNOWN STEP	2025-09-06T13:49:51.3620926Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-06T13:49:51.3622305Z ##[group]GITHUB_TOKEN Permissions
backend	UNKNOWN STEP	2025-09-06T13:49:51.3624157Z Contents: read
backend	UNKNOWN STEP	2025-09-06T13:49:51.3624703Z Metadata: read
backend	UNKNOWN STEP	2025-09-06T13:49:51.3625198Z Packages: read
backend	UNKNOWN STEP	2025-09-06T13:49:51.3625792Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-06T13:49:51.3628112Z Secret source: Actions
backend	UNKNOWN STEP	2025-09-06T13:49:51.3628835Z Prepare workflow directory
backend	UNKNOWN STEP	2025-09-06T13:49:51.4057614Z Prepare all required actions
backend	UNKNOWN STEP	2025-09-06T13:49:51.4111096Z Getting action download info
backend	UNKNOWN STEP	2025-09-06T13:49:51.8465235Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
backend	UNKNOWN STEP	2025-09-06T13:49:51.9129848Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
backend	UNKNOWN STEP	2025-09-06T13:49:52.4549532Z Complete job name: backend
backend	UNKNOWN STEP	2025-09-06T13:49:52.5036527Z ##[group]Checking docker version
backend	UNKNOWN STEP	2025-09-06T13:49:52.5049608Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
backend	UNKNOWN STEP	2025-09-06T13:49:52.5482912Z '1.48'
backend	UNKNOWN STEP	2025-09-06T13:49:52.5493995Z Docker daemon API version: '1.48'
backend	UNKNOWN STEP	2025-09-06T13:49:52.5494745Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
backend	UNKNOWN STEP	2025-09-06T13:49:52.5647271Z '1.48'
backend	UNKNOWN STEP	2025-09-06T13:49:52.5660628Z Docker client API version: '1.48'
backend	UNKNOWN STEP	2025-09-06T13:49:52.5665980Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-06T13:49:52.5668789Z ##[group]Clean up resources from previous jobs
backend	UNKNOWN STEP	2025-09-06T13:49:52.5675089Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=f9f496"
backend	UNKNOWN STEP	2025-09-06T13:49:52.5810417Z ##[command]/usr/bin/docker network prune --force --filter "label=f9f496"
backend	UNKNOWN STEP	2025-09-06T13:49:52.5936866Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-06T13:49:52.5937864Z ##[group]Create local container network
backend	UNKNOWN STEP	2025-09-06T13:49:52.5951654Z ##[command]/usr/bin/docker network create --label f9f496 github_network_8ecee93768864c8bb3049c45eab5ef65
backend	UNKNOWN STEP	2025-09-06T13:49:52.6425304Z 716b88c74b42c9cd1e1e0c2e6ab740530f8a9cda92072177e5c4c8ce0447f381
backend	UNKNOWN STEP	2025-09-06T13:49:52.6443825Z ##[endgroup]
backend	UNKNOWN STEP	2025-09-06T13:49:52.6467505Z ##[group]Starting postgres service container
backend	UNKNOWN STEP	2025-09-06T13:49:52.6486355Z ##[command]/usr/bin/docker pull postgres:15
backend	UNKNOWN STEP	2025-09-06T13:49:53.6407964Z 15: Pulling from library/postgres
backend	UNKNOWN STEP	2025-09-06T13:49:53.8811599Z 396b1da7636e: Pulling fs layer
backend	UNKNOWN STEP	2025-09-06T13:49:53.8813032Z 16f135227934: Pulling fs layer
backend	UNKNOWN STEP	2025-09-06T13:49:53.8814357Z f56e480b4c77: Pulling fs layer
backend	UNKNOWN STEP	2025-09-06T13:49:53.8815695Z a421874e67d9: Pulling fs layer
backend	UNKNOWN STEP	2025-09-06T13:49:53.8816990Z 7f3001e6144e: Pulling fs layer
backend	UNKNOWN STEP	2025-09-06T13:49:53.8818003Z ad84dee38c61: Pulling fs layer
backend	UNKNOWN STEP	2025-09-06T13:49:53.8819109Z 812f8629a6fe: Pulling fs layer
backend	UNKNOWN STEP	2025-09-06T13:49:53.8820128Z d796a5724824: Pulling fs layer
backend	UNKNOWN STEP	2025-09-06T13:49:53.8821145Z b82a6003f517: Pulling fs layer
backend	UNKNOWN STEP	2025-09-06T13:49:53.8822446Z 446859ca5fb2: Pulling fs layer
backend	UNKNOWN STEP	2025-09-06T13:49:53.8823439Z ded31e88e046: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
backend	UNKNOWN STEP	2025-09-06T13:50:49.8726482Z  2025-09-06 13:50:29.642 UTC [92] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-09-06T13:50:49.8726825Z  2025-09-06 13:50:39.706 UTC [122] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-09-06T13:50:49.8727162Z  2025-09-06 13:50:49.774 UTC [292] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-09-06T13:50:49.8727460Z  This user must also own the server process.
backend	UNKNOWN STEP	2025-09-06T13:50:49.8727701Z  
backend	UNKNOWN STEP	2025-09-06T13:50:49.8727949Z  The database cluster will be initialized with locale "en_US.utf8".
backend	UNKNOWN STEP	2025-09-06T13:50:49.8728333Z  The default database encoding has accordingly been set to "UTF8".
backend	UNKNOWN STEP	2025-09-06T13:50:49.8728709Z  The default text search configuration will be set to "english".
backend	UNKNOWN STEP	2025-09-06T13:50:49.8729037Z  
backend	UNKNOWN STEP	2025-09-06T13:50:49.8729195Z  Data page checksums are disabled.
backend	UNKNOWN STEP	2025-09-06T13:50:49.8729403Z  
backend	UNKNOWN STEP	2025-09-06T13:50:49.8729657Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
backend	UNKNOWN STEP	2025-09-06T13:50:49.8730008Z  creating subdirectories ... ok
backend	UNKNOWN STEP	2025-09-06T13:50:49.8730288Z  selecting dynamic shared memory implementation ... posix
backend	UNKNOWN STEP	2025-09-06T13:50:49.8730591Z  selecting default max_connections ... 100
backend	UNKNOWN STEP	2025-09-06T13:50:49.8730851Z  selecting default shared_buffers ... 128MB
backend	UNKNOWN STEP	2025-09-06T13:50:49.8731102Z  selecting default time zone ... Etc/UTC
backend	UNKNOWN STEP	2025-09-06T13:50:49.8731347Z  creating configuration files ... ok
backend	UNKNOWN STEP	2025-09-06T13:50:49.8731802Z  running bootstrap script ... ok
backend	UNKNOWN STEP	2025-09-06T13:50:49.8732061Z  performing post-bootstrap initialization ... ok
backend	UNKNOWN STEP	2025-09-06T13:50:49.8732341Z  syncing data to disk ... ok
backend	UNKNOWN STEP	2025-09-06T13:50:49.8732537Z  
backend	UNKNOWN STEP	2025-09-06T13:50:49.8732670Z  
backend	UNKNOWN STEP	2025-09-06T13:50:49.8732919Z  Success. You can now start the database server using:
backend	UNKNOWN STEP	2025-09-06T13:50:49.8733551Z  
backend	UNKNOWN STEP	2025-09-06T13:50:49.8733887Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
backend	UNKNOWN STEP	2025-09-06T13:50:49.8734290Z  
backend	UNKNOWN STEP	2025-09-06T13:50:49.8734818Z  waiting for server to start....2025-09-06 13:50:00.070 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
backend	UNKNOWN STEP	2025-09-06T13:50:49.8735779Z  2025-09-06 13:50:00.071 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
backend	UNKNOWN STEP	2025-09-06T13:50:49.8736250Z  2025-09-06 13:50:00.074 UTC [51] LOG:  database system was shut down at 2025-09-06 13:49:59 UTC
backend	UNKNOWN STEP	2025-09-06T13:50:49.8736671Z  2025-09-06 13:50:00.077 UTC [48] LOG:  database system is ready to accept connections
backend	UNKNOWN STEP	2025-09-06T13:50:49.8736983Z   done
backend	UNKNOWN STEP	2025-09-06T13:50:49.8737297Z  server started
backend	UNKNOWN STEP	2025-09-06T13:50:49.8737492Z  CREATE DATABASE
backend	UNKNOWN STEP	2025-09-06T13:50:49.8737658Z  
backend	UNKNOWN STEP	2025-09-06T13:50:49.8737790Z  
backend	UNKNOWN STEP	2025-09-06T13:50:49.8738082Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
backend	UNKNOWN STEP	2025-09-06T13:50:49.8738430Z  
backend	UNKNOWN STEP	2025-09-06T13:50:49.8738643Z  2025-09-06 13:50:00.256 UTC [48] LOG:  received fast shutdown request
backend	UNKNOWN STEP	2025-09-06T13:50:49.8739083Z  waiting for server to shut down....2025-09-06 13:50:00.256 UTC [48] LOG:  aborting any active transactions
backend	UNKNOWN STEP	2025-09-06T13:50:49.8739659Z  2025-09-06 13:50:00.258 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
backend	UNKNOWN STEP	2025-09-06T13:50:49.8740112Z  2025-09-06 13:50:00.258 UTC [49] LOG:  shutting down
backend	UNKNOWN STEP	2025-09-06T13:50:49.8740442Z  2025-09-06 13:50:00.259 UTC [49] LOG:  checkpoint starting: shutdown immediate
backend	UNKNOWN STEP	2025-09-06T13:50:49.8741237Z  2025-09-06 13:50:00.275 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.002 s, total=0.017 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
backend	UNKNOWN STEP	2025-09-06T13:50:49.8742211Z  2025-09-06 13:50:00.281 UTC [48] LOG:  database system is shut down
backend	UNKNOWN STEP	2025-09-06T13:50:49.8742488Z   done
backend	UNKNOWN STEP	2025-09-06T13:50:49.8742638Z  server stopped
backend	UNKNOWN STEP	2025-09-06T13:50:49.8742802Z  
backend	UNKNOWN STEP	2025-09-06T13:50:49.8743004Z  PostgreSQL init process complete; ready for start up.
backend	UNKNOWN STEP	2025-09-06T13:50:49.8743270Z  
backend	UNKNOWN STEP	2025-09-06T13:50:49.8748788Z Stop and remove container: 92551e5f91c649aebd298635773c7adc_postgres15_529fc1
backend	UNKNOWN STEP	2025-09-06T13:50:49.8753448Z ##[command]/usr/bin/docker rm --force 1f1604c02dd06011ffcd0519be04cd23d9ffc902a600179b22a7af4d0448cb7a
backend	UNKNOWN STEP	2025-09-06T13:50:50.0886513Z 1f1604c02dd06011ffcd0519be04cd23d9ffc902a600179b22a7af4d0448cb7a
backend	UNKNOWN STEP	2025-09-06T13:50:50.0913685Z Remove container network: github_network_8ecee93768864c8bb3049c45eab5ef65
backend	UNKNOWN STEP	2025-09-06T13:50:50.0918348Z ##[command]/usr/bin/docker network rm github_network_8ecee93768864c8bb3049c45eab5ef65
backend	UNKNOWN STEP	2025-09-06T13:50:50.2134980Z github_network_8ecee93768864c8bb3049c45eab5ef65
backend	UNKNOWN STEP	2025-09-06T13:50:50.2195886Z Cleaning up orphan processes
backend	UNKNOWN STEP	2025-09-06T13:50:50.2498190Z Terminate orphan process: pid (3050) (bash)
backend	UNKNOWN STEP	2025-09-06T13:50:50.2514153Z Terminate orphan process: pid (3051) (php)
backend	UNKNOWN STEP	2025-09-06T13:50:50.2529080Z Terminate orphan process: pid (3054) (php8.2)
```

</details>

### PR #111
- URL: https://github.com/lomendor/Project-Dixis/pull/111
- Bucket: lighthouse
- Failing Job: lighthouse
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17515257505/job/49751919390

<details><summary>Head (first 60 lines)</summary>

```
lighthouse	UNKNOWN STEP	﻿2025-09-06T13:43:19.4051527Z Current runner version: '2.328.0'
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4081757Z ##[group]Runner Image Provisioner
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4082836Z Hosted Compute Agent
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4083591Z Version: 20250829.383
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4084268Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4084993Z Build Date: 2025-08-29T13:48:48Z
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4085566Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4086147Z ##[group]Operating System
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4086727Z Ubuntu
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4087217Z 24.04.3
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4087722Z LTS
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4088174Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4088674Z ##[group]Runner Image
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4089173Z Image: ubuntu-24.04
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4089808Z Version: 20250831.1.0
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4090774Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250831.1/images/ubuntu/Ubuntu2404-Readme.md
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4092334Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250831.1
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4093302Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4094626Z ##[group]GITHUB_TOKEN Permissions
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4096418Z Contents: read
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4096948Z Metadata: read
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4097567Z Packages: read
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4098062Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4100029Z Secret source: Actions
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4100845Z Prepare workflow directory
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4677260Z Prepare all required actions
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.4731304Z Getting action download info
lighthouse	UNKNOWN STEP	2025-09-06T13:43:19.8194115Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
lighthouse	UNKNOWN STEP	2025-09-06T13:43:20.0642814Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
lighthouse	UNKNOWN STEP	2025-09-06T13:43:20.4195751Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
lighthouse	UNKNOWN STEP	2025-09-06T13:43:20.5522579Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
lighthouse	UNKNOWN STEP	2025-09-06T13:43:20.6631471Z Download action repository 'actions/github-script@v7' (SHA:f28e40c7f34bde8b3046d885e986cb6290c5673b)
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.0687566Z Complete job name: lighthouse
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.1271240Z ##[group]Checking docker version
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.1285068Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.1681855Z '1.48'
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.1695466Z Docker daemon API version: '1.48'
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.1696845Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.1847945Z '1.48'
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.1862494Z Docker client API version: '1.48'
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.1869977Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.1874980Z ##[group]Clean up resources from previous jobs
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.1880825Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=c8a076"
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.2014150Z ##[command]/usr/bin/docker network prune --force --filter "label=c8a076"
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.2141921Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.2142814Z ##[group]Create local container network
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.2153872Z ##[command]/usr/bin/docker network create --label c8a076 github_network_dfe8e4fe23c14341912c4bb131884bf2
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.2644078Z 566fcf728f61a9128e120d98a73366d6c17dc161e61698d06700c00efaead68e
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.2662861Z ##[endgroup]
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.2687862Z ##[group]Starting postgres service container
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.2707887Z ##[command]/usr/bin/docker pull postgres:15
lighthouse	UNKNOWN STEP	2025-09-06T13:43:21.9315971Z 15: Pulling from library/postgres
lighthouse	UNKNOWN STEP	2025-09-06T13:43:22.0614572Z 396b1da7636e: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T13:43:22.0616948Z 16f135227934: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T13:43:22.0618566Z f56e480b4c77: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T13:43:22.0620627Z a421874e67d9: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T13:43:22.0622213Z 7f3001e6144e: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T13:43:22.0623745Z ad84dee38c61: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T13:43:22.0625050Z 812f8629a6fe: Pulling fs layer
lighthouse	UNKNOWN STEP	2025-09-06T13:43:22.0626217Z d796a5724824: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0051741Z  2025-09-06 13:43:29.249 UTC [64] LOG:  database system was shut down at 2025-09-06 13:43:29 UTC
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0052489Z  2025-09-06 13:43:29.253 UTC [1] LOG:  database system is ready to accept connections
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0053137Z  2025-09-06 13:43:38.383 UTC [75] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0053926Z  2025-09-06 13:43:48.446 UTC [83] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0054507Z  2025-09-06 13:43:58.512 UTC [91] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0055093Z  2025-09-06 13:44:08.578 UTC [100] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0055674Z  2025-09-06 13:44:18.655 UTC [108] FATAL:  role "root" does not exist
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0056125Z  
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0056510Z  The database cluster will be initialized with locale "en_US.utf8".
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0057161Z  The default database encoding has accordingly been set to "UTF8".
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0057822Z  The default text search configuration will be set to "english".
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0058314Z  
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0058585Z  Data page checksums are disabled.
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0058952Z  
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0059398Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0060000Z  creating subdirectories ... ok
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0060473Z  selecting dynamic shared memory implementation ... posix
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0061013Z  selecting default max_connections ... 100
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0061468Z  selecting default shared_buffers ... 128MB
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0062170Z  selecting default time zone ... Etc/UTC
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0062598Z  creating configuration files ... ok
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0063015Z  running bootstrap script ... ok
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0063622Z  performing post-bootstrap initialization ... ok
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0064111Z  syncing data to disk ... ok
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0064478Z  
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0064758Z  
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0065131Z  Success. You can now start the database server using:
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0065534Z  
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0065751Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0066136Z  
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0066715Z  waiting for server to start....2025-09-06 13:43:28.942 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0067571Z  2025-09-06 13:43:28.943 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0068135Z  2025-09-06 13:43:28.945 UTC [51] LOG:  database system was shut down at 2025-09-06 13:43:28 UTC
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0068692Z  2025-09-06 13:43:28.949 UTC [48] LOG:  database system is ready to accept connections
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0069015Z   done
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0069467Z  server started
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0069674Z  CREATE DATABASE
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0069845Z  
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0070032Z  
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0070415Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0070781Z  
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0071109Z  2025-09-06 13:43:29.126 UTC [48] LOG:  received fast shutdown request
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0071567Z  waiting for server to shut down....2025-09-06 13:43:29.127 UTC [48] LOG:  aborting any active transactions
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0072244Z  2025-09-06 13:43:29.129 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0072817Z  2025-09-06 13:43:29.129 UTC [49] LOG:  shutting down
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0073149Z  2025-09-06 13:43:29.130 UTC [49] LOG:  checkpoint starting: shutdown immediate
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0074311Z  2025-09-06 13:43:29.146 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.002 s, total=0.017 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0075199Z  2025-09-06 13:43:29.152 UTC [48] LOG:  database system is shut down
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0075482Z   done
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0075688Z  server stopped
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0075907Z  
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0076127Z  PostgreSQL init process complete; ready for start up.
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0076401Z  
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0083092Z Stop and remove container: a254e0e8c86b4ea4b530bb7076c9171f_postgres15_60e4ed
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.0088300Z ##[command]/usr/bin/docker rm --force 9bfb1b2a239738ce5d6555592aedbb285e8ffd493329a1775d1f46059e3b9447
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.9050453Z 9bfb1b2a239738ce5d6555592aedbb285e8ffd493329a1775d1f46059e3b9447
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.9077080Z Remove container network: github_network_dfe8e4fe23c14341912c4bb131884bf2
lighthouse	UNKNOWN STEP	2025-09-06T13:44:20.9081706Z ##[command]/usr/bin/docker network rm github_network_dfe8e4fe23c14341912c4bb131884bf2
lighthouse	UNKNOWN STEP	2025-09-06T13:44:21.0166770Z github_network_dfe8e4fe23c14341912c4bb131884bf2
lighthouse	UNKNOWN STEP	2025-09-06T13:44:21.0222737Z Cleaning up orphan processes
```

</details>

### PR #66
- URL: https://github.com/lomendor/Project-Dixis/pull/66
- Bucket: phpunit-feature
- Failing Job: backend
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17356460667/job/49270125882

<details><summary>Head (first 60 lines)</summary>

```
backend	UNKNOWN STEP	﻿2025-08-31T11:24:24.5222378Z Current runner version: '2.328.0'
backend	UNKNOWN STEP	2025-08-31T11:24:24.5246681Z ##[group]Runner Image Provisioner
backend	UNKNOWN STEP	2025-08-31T11:24:24.5247663Z Hosted Compute Agent
backend	UNKNOWN STEP	2025-08-31T11:24:24.5248262Z Version: 20250829.383
backend	UNKNOWN STEP	2025-08-31T11:24:24.5248919Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
backend	UNKNOWN STEP	2025-08-31T11:24:24.5249656Z Build Date: 2025-08-29T13:48:48Z
backend	UNKNOWN STEP	2025-08-31T11:24:24.5250229Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T11:24:24.5250837Z ##[group]Operating System
backend	UNKNOWN STEP	2025-08-31T11:24:24.5251669Z Ubuntu
backend	UNKNOWN STEP	2025-08-31T11:24:24.5252185Z 24.04.3
backend	UNKNOWN STEP	2025-08-31T11:24:24.5252710Z LTS
backend	UNKNOWN STEP	2025-08-31T11:24:24.5253171Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T11:24:24.5253684Z ##[group]Runner Image
backend	UNKNOWN STEP	2025-08-31T11:24:24.5254240Z Image: ubuntu-24.04
backend	UNKNOWN STEP	2025-08-31T11:24:24.5254816Z Version: 20250824.1.0
backend	UNKNOWN STEP	2025-08-31T11:24:24.5255814Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250824.1/images/ubuntu/Ubuntu2404-Readme.md
backend	UNKNOWN STEP	2025-08-31T11:24:24.5257501Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250824.1
backend	UNKNOWN STEP	2025-08-31T11:24:24.5258499Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T11:24:24.5259691Z ##[group]GITHUB_TOKEN Permissions
backend	UNKNOWN STEP	2025-08-31T11:24:24.5261986Z Contents: read
backend	UNKNOWN STEP	2025-08-31T11:24:24.5262516Z Metadata: read
backend	UNKNOWN STEP	2025-08-31T11:24:24.5263147Z Packages: read
backend	UNKNOWN STEP	2025-08-31T11:24:24.5263643Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T11:24:24.5265669Z Secret source: Actions
backend	UNKNOWN STEP	2025-08-31T11:24:24.5266498Z Prepare workflow directory
backend	UNKNOWN STEP	2025-08-31T11:24:24.5676353Z Prepare all required actions
backend	UNKNOWN STEP	2025-08-31T11:24:24.5713658Z Getting action download info
backend	UNKNOWN STEP	2025-08-31T11:24:24.8802296Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
backend	UNKNOWN STEP	2025-08-31T11:24:25.1013218Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
backend	UNKNOWN STEP	2025-08-31T11:24:25.3983547Z Complete job name: backend
backend	UNKNOWN STEP	2025-08-31T11:24:25.4490959Z ##[group]Checking docker version
backend	UNKNOWN STEP	2025-08-31T11:24:25.4504306Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
backend	UNKNOWN STEP	2025-08-31T11:24:26.3212165Z '1.48'
backend	UNKNOWN STEP	2025-08-31T11:24:26.3227325Z Docker daemon API version: '1.48'
backend	UNKNOWN STEP	2025-08-31T11:24:26.3228385Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
backend	UNKNOWN STEP	2025-08-31T11:24:26.3453918Z '1.48'
backend	UNKNOWN STEP	2025-08-31T11:24:26.3468700Z Docker client API version: '1.48'
backend	UNKNOWN STEP	2025-08-31T11:24:26.3474798Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T11:24:26.3477823Z ##[group]Clean up resources from previous jobs
backend	UNKNOWN STEP	2025-08-31T11:24:26.3483973Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=7e144d"
backend	UNKNOWN STEP	2025-08-31T11:24:26.3620391Z ##[command]/usr/bin/docker network prune --force --filter "label=7e144d"
backend	UNKNOWN STEP	2025-08-31T11:24:26.3748654Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T11:24:26.3749726Z ##[group]Create local container network
backend	UNKNOWN STEP	2025-08-31T11:24:26.3760934Z ##[command]/usr/bin/docker network create --label 7e144d github_network_5a446ca9609f47829acba0a283d62707
backend	UNKNOWN STEP	2025-08-31T11:24:26.4248789Z 4b14dcc2bf58d2b32162bd2d8bd846d306290c3286f64b4482df8413a4f1911d
backend	UNKNOWN STEP	2025-08-31T11:24:26.4268880Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T11:24:26.4294384Z ##[group]Starting postgres service container
backend	UNKNOWN STEP	2025-08-31T11:24:26.4314436Z ##[command]/usr/bin/docker pull postgres:15
backend	UNKNOWN STEP	2025-08-31T11:24:26.6929297Z 15: Pulling from library/postgres
backend	UNKNOWN STEP	2025-08-31T11:24:26.7546664Z 396b1da7636e: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T11:24:26.7555036Z fca2566eba32: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T11:24:26.7556985Z 631fe8c6d606: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T11:24:26.7558686Z 77c7671c4414: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T11:24:26.7559868Z 2d9e29180a27: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T11:24:26.7560909Z 77c7671c4414: Waiting
backend	UNKNOWN STEP	2025-08-31T11:24:26.7562197Z c6bcc2c9a041: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T11:24:26.7563332Z ac4b721eb66f: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T11:24:26.7564409Z 606bd164980e: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T11:24:26.7565518Z f5dfd246bc6e: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T11:24:26.7566596Z ba7036bb0a60: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
backend	UNKNOWN STEP	2025-08-31T11:25:30.7811345Z  2025-08-31 11:25:22.309 UTC [160] STATEMENT:  insert into "orders" ("user_id", "subtotal", "tax_amount", "shipping_amount", "total_amount", "payment_status", "status", "shipping_method", "updated_at", "created_at") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning "id"
backend	UNKNOWN STEP	2025-08-31T11:25:30.7813049Z  2025-08-31 11:25:22.309 UTC [160] ERROR:  current transaction is aborted, commands ignored until end of transaction block
backend	UNKNOWN STEP	2025-08-31T11:25:30.7813895Z  2025-08-31 11:25:22.309 UTC [160] STATEMENT:  DEALLOCATE pdo_stmt_0000001b
backend	UNKNOWN STEP	2025-08-31T11:25:30.7814325Z  2025-08-31 11:25:23.781 UTC [187] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-08-31T11:25:30.7814605Z  
backend	UNKNOWN STEP	2025-08-31T11:25:30.7814847Z  The database cluster will be initialized with locale "en_US.utf8".
backend	UNKNOWN STEP	2025-08-31T11:25:30.7815441Z  The default database encoding has accordingly been set to "UTF8".
backend	UNKNOWN STEP	2025-08-31T11:25:30.7815956Z  The default text search configuration will be set to "english".
backend	UNKNOWN STEP	2025-08-31T11:25:30.7816243Z  
backend	UNKNOWN STEP	2025-08-31T11:25:30.7816400Z  Data page checksums are disabled.
backend	UNKNOWN STEP	2025-08-31T11:25:30.7816612Z  
backend	UNKNOWN STEP	2025-08-31T11:25:30.7816865Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
backend	UNKNOWN STEP	2025-08-31T11:25:30.7817203Z  creating subdirectories ... ok
backend	UNKNOWN STEP	2025-08-31T11:25:30.7817478Z  selecting dynamic shared memory implementation ... posix
backend	UNKNOWN STEP	2025-08-31T11:25:30.7817781Z  selecting default max_connections ... 100
backend	UNKNOWN STEP	2025-08-31T11:25:30.7818039Z  selecting default shared_buffers ... 128MB
backend	UNKNOWN STEP	2025-08-31T11:25:30.7818314Z  selecting default time zone ... Etc/UTC
backend	UNKNOWN STEP	2025-08-31T11:25:30.7818556Z  creating configuration files ... ok
backend	UNKNOWN STEP	2025-08-31T11:25:30.7818794Z  running bootstrap script ... ok
backend	UNKNOWN STEP	2025-08-31T11:25:30.7819043Z  performing post-bootstrap initialization ... ok
backend	UNKNOWN STEP	2025-08-31T11:25:30.7819310Z  syncing data to disk ... ok
backend	UNKNOWN STEP	2025-08-31T11:25:30.7819502Z  
backend	UNKNOWN STEP	2025-08-31T11:25:30.7819642Z  
backend	UNKNOWN STEP	2025-08-31T11:25:30.7819840Z  Success. You can now start the database server using:
backend	UNKNOWN STEP	2025-08-31T11:25:30.7820091Z  
backend	UNKNOWN STEP	2025-08-31T11:25:30.7820287Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
backend	UNKNOWN STEP	2025-08-31T11:25:30.7820544Z  
backend	UNKNOWN STEP	2025-08-31T11:25:30.7821070Z  waiting for server to start....2025-08-31 11:24:34.077 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
backend	UNKNOWN STEP	2025-08-31T11:25:30.7822017Z  2025-08-31 11:24:34.077 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
backend	UNKNOWN STEP	2025-08-31T11:25:30.7822490Z  2025-08-31 11:24:34.081 UTC [51] LOG:  database system was shut down at 2025-08-31 11:24:33 UTC
backend	UNKNOWN STEP	2025-08-31T11:25:30.7822911Z  2025-08-31 11:24:34.084 UTC [48] LOG:  database system is ready to accept connections
backend	UNKNOWN STEP	2025-08-31T11:25:30.7823224Z   done
backend	UNKNOWN STEP	2025-08-31T11:25:30.7823379Z  server started
backend	UNKNOWN STEP	2025-08-31T11:25:30.7823540Z  CREATE DATABASE
backend	UNKNOWN STEP	2025-08-31T11:25:30.7823703Z  
backend	UNKNOWN STEP	2025-08-31T11:25:30.7823843Z  
backend	UNKNOWN STEP	2025-08-31T11:25:30.7824123Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
backend	UNKNOWN STEP	2025-08-31T11:25:30.7824474Z  
backend	UNKNOWN STEP	2025-08-31T11:25:30.7824680Z  2025-08-31 11:24:34.265 UTC [48] LOG:  received fast shutdown request
backend	UNKNOWN STEP	2025-08-31T11:25:30.7825121Z  waiting for server to shut down....2025-08-31 11:24:34.265 UTC [48] LOG:  aborting any active transactions
backend	UNKNOWN STEP	2025-08-31T11:25:30.7825685Z  2025-08-31 11:24:34.267 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
backend	UNKNOWN STEP	2025-08-31T11:25:30.7826134Z  2025-08-31 11:24:34.268 UTC [49] LOG:  shutting down
backend	UNKNOWN STEP	2025-08-31T11:25:30.7826466Z  2025-08-31 11:24:34.268 UTC [49] LOG:  checkpoint starting: shutdown immediate
backend	UNKNOWN STEP	2025-08-31T11:25:30.7827274Z  2025-08-31 11:24:34.286 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.013 s, sync=0.004 s, total=0.019 s; sync files=301, longest=0.002 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
backend	UNKNOWN STEP	2025-08-31T11:25:30.7828045Z  2025-08-31 11:24:34.293 UTC [48] LOG:  database system is shut down
backend	UNKNOWN STEP	2025-08-31T11:25:30.7828312Z   done
backend	UNKNOWN STEP	2025-08-31T11:25:30.7828461Z  server stopped
backend	UNKNOWN STEP	2025-08-31T11:25:30.7828623Z  
backend	UNKNOWN STEP	2025-08-31T11:25:30.7828815Z  PostgreSQL init process complete; ready for start up.
backend	UNKNOWN STEP	2025-08-31T11:25:30.7829073Z  
backend	UNKNOWN STEP	2025-08-31T11:25:30.7834758Z Stop and remove container: 069b9f81932047589fbfcc4e2b2bf61b_postgres15_835005
backend	UNKNOWN STEP	2025-08-31T11:25:30.7839063Z ##[command]/usr/bin/docker rm --force 844d80d5d1dd39656cec9c9a8538dd3efb3e10a71bc3940493fbc4832a6ac6ec
backend	UNKNOWN STEP	2025-08-31T11:25:30.9868306Z 844d80d5d1dd39656cec9c9a8538dd3efb3e10a71bc3940493fbc4832a6ac6ec
backend	UNKNOWN STEP	2025-08-31T11:25:30.9893060Z Remove container network: github_network_5a446ca9609f47829acba0a283d62707
backend	UNKNOWN STEP	2025-08-31T11:25:30.9897752Z ##[command]/usr/bin/docker network rm github_network_5a446ca9609f47829acba0a283d62707
backend	UNKNOWN STEP	2025-08-31T11:25:31.0938570Z github_network_5a446ca9609f47829acba0a283d62707
backend	UNKNOWN STEP	2025-08-31T11:25:31.0998688Z Cleaning up orphan processes
backend	UNKNOWN STEP	2025-08-31T11:25:31.1311243Z Terminate orphan process: pid (3073) (bash)
backend	UNKNOWN STEP	2025-08-31T11:25:31.1327618Z Terminate orphan process: pid (3074) (php)
backend	UNKNOWN STEP	2025-08-31T11:25:31.1342358Z Terminate orphan process: pid (3078) (php8.2)
```

</details>

### PR #65
- URL: https://github.com/lomendor/Project-Dixis/pull/65
- Bucket: phpunit-feature
- Failing Job: backend
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17358842986/job/49275922001

<details><summary>Head (first 60 lines)</summary>

```
backend	UNKNOWN STEP	﻿2025-08-31T15:08:22.8986933Z Current runner version: '2.328.0'
backend	UNKNOWN STEP	2025-08-31T15:08:22.9010866Z ##[group]Runner Image Provisioner
backend	UNKNOWN STEP	2025-08-31T15:08:22.9011627Z Hosted Compute Agent
backend	UNKNOWN STEP	2025-08-31T15:08:22.9012177Z Version: 20250821.380
backend	UNKNOWN STEP	2025-08-31T15:08:22.9012881Z Commit: 438d12cb4fe092871db9867344e3bc0bc5319035
backend	UNKNOWN STEP	2025-08-31T15:08:22.9013966Z Build Date: 2025-08-21T20:49:43Z
backend	UNKNOWN STEP	2025-08-31T15:08:22.9014596Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T15:08:22.9015227Z ##[group]Operating System
backend	UNKNOWN STEP	2025-08-31T15:08:22.9015820Z Ubuntu
backend	UNKNOWN STEP	2025-08-31T15:08:22.9016267Z 24.04.3
backend	UNKNOWN STEP	2025-08-31T15:08:22.9016793Z LTS
backend	UNKNOWN STEP	2025-08-31T15:08:22.9017220Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T15:08:22.9017723Z ##[group]Runner Image
backend	UNKNOWN STEP	2025-08-31T15:08:22.9018361Z Image: ubuntu-24.04
backend	UNKNOWN STEP	2025-08-31T15:08:22.9019043Z Version: 20250824.1.0
backend	UNKNOWN STEP	2025-08-31T15:08:22.9020107Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250824.1/images/ubuntu/Ubuntu2404-Readme.md
backend	UNKNOWN STEP	2025-08-31T15:08:22.9021862Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250824.1
backend	UNKNOWN STEP	2025-08-31T15:08:22.9022895Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T15:08:22.9024219Z ##[group]GITHUB_TOKEN Permissions
backend	UNKNOWN STEP	2025-08-31T15:08:22.9026267Z Contents: read
backend	UNKNOWN STEP	2025-08-31T15:08:22.9026896Z Metadata: read
backend	UNKNOWN STEP	2025-08-31T15:08:22.9027445Z Packages: read
backend	UNKNOWN STEP	2025-08-31T15:08:22.9027963Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T15:08:22.9029870Z Secret source: Actions
backend	UNKNOWN STEP	2025-08-31T15:08:22.9030738Z Prepare workflow directory
backend	UNKNOWN STEP	2025-08-31T15:08:22.9448505Z Prepare all required actions
backend	UNKNOWN STEP	2025-08-31T15:08:22.9486208Z Getting action download info
backend	UNKNOWN STEP	2025-08-31T15:08:23.2672973Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
backend	UNKNOWN STEP	2025-08-31T15:08:23.6995535Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
backend	UNKNOWN STEP	2025-08-31T15:08:24.0999217Z Complete job name: backend
backend	UNKNOWN STEP	2025-08-31T15:08:24.1493529Z ##[group]Checking docker version
backend	UNKNOWN STEP	2025-08-31T15:08:24.1506290Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
backend	UNKNOWN STEP	2025-08-31T15:08:25.1670209Z '1.48'
backend	UNKNOWN STEP	2025-08-31T15:08:25.1685002Z Docker daemon API version: '1.48'
backend	UNKNOWN STEP	2025-08-31T15:08:25.1686960Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
backend	UNKNOWN STEP	2025-08-31T15:08:25.1939428Z '1.48'
backend	UNKNOWN STEP	2025-08-31T15:08:25.1953675Z Docker client API version: '1.48'
backend	UNKNOWN STEP	2025-08-31T15:08:25.1959799Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T15:08:25.1963203Z ##[group]Clean up resources from previous jobs
backend	UNKNOWN STEP	2025-08-31T15:08:25.1970383Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=a7ea2a"
backend	UNKNOWN STEP	2025-08-31T15:08:25.2110293Z ##[command]/usr/bin/docker network prune --force --filter "label=a7ea2a"
backend	UNKNOWN STEP	2025-08-31T15:08:25.2238891Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T15:08:25.2240170Z ##[group]Create local container network
backend	UNKNOWN STEP	2025-08-31T15:08:25.2252833Z ##[command]/usr/bin/docker network create --label a7ea2a github_network_34292fafbb24406882904c33a3b55864
backend	UNKNOWN STEP	2025-08-31T15:08:25.2785194Z 5320a23d004bc36ef3aabe21f917eef2ba3f4c11febd92eaee7cb5bcbbebccb5
backend	UNKNOWN STEP	2025-08-31T15:08:25.2804477Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T15:08:25.2829890Z ##[group]Starting postgres service container
backend	UNKNOWN STEP	2025-08-31T15:08:25.2850578Z ##[command]/usr/bin/docker pull postgres:15
backend	UNKNOWN STEP	2025-08-31T15:08:25.7777128Z 15: Pulling from library/postgres
backend	UNKNOWN STEP	2025-08-31T15:08:25.8907659Z 396b1da7636e: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:25.8908419Z fca2566eba32: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:25.8908825Z 631fe8c6d606: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:25.8909219Z 77c7671c4414: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:25.8909624Z 2d9e29180a27: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:25.8910009Z c6bcc2c9a041: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:25.8910397Z ac4b721eb66f: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:25.8910767Z 606bd164980e: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:25.8911168Z f5dfd246bc6e: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:25.8911580Z ba7036bb0a60: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:25.8911930Z 799f859abbbd: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
backend	UNKNOWN STEP	2025-08-31T15:09:02.4446762Z  2025-08-31 15:08:42.059 UTC [75] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-08-31T15:09:02.4447096Z  2025-08-31 15:08:52.122 UTC [83] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-08-31T15:09:02.4447424Z  2025-08-31 15:09:02.200 UTC [92] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-08-31T15:09:02.4447889Z  2025-08-31 15:09:02.210 UTC [84] ERROR:  new row for relation "orders" violates check constraint "orders_status_new_check"
backend	UNKNOWN STEP	2025-08-31T15:09:02.4448644Z  2025-08-31 15:09:02.210 UTC [84] DETAIL:  Failing row contains (10, null, 0.00, 0.00, 1.14, 0.00, paid, HOME, null, null, null, 2025-08-31 15:09:02, 2025-08-31 15:09:02, processing, bank_transfer, 1.14, 0.00, EUR).
backend	UNKNOWN STEP	2025-08-31T15:09:02.4450106Z  2025-08-31 15:09:02.210 UTC [84] STATEMENT:  insert into "orders" ("user_id", "status", "payment_status", "payment_method", "shipping_method", "subtotal", "shipping_cost", "total", "tax_amount", "shipping_amount", "total_amount", "updated_at", "created_at") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) returning "id"
backend	UNKNOWN STEP	2025-08-31T15:09:02.4451042Z  This user must also own the server process.
backend	UNKNOWN STEP	2025-08-31T15:09:02.4451285Z  
backend	UNKNOWN STEP	2025-08-31T15:09:02.4451538Z  The database cluster will be initialized with locale "en_US.utf8".
backend	UNKNOWN STEP	2025-08-31T15:09:02.4451924Z  The default database encoding has accordingly been set to "UTF8".
backend	UNKNOWN STEP	2025-08-31T15:09:02.4452305Z  The default text search configuration will be set to "english".
backend	UNKNOWN STEP	2025-08-31T15:09:02.4452662Z  
backend	UNKNOWN STEP	2025-08-31T15:09:02.4453100Z  Data page checksums are disabled.
backend	UNKNOWN STEP	2025-08-31T15:09:02.4453635Z  
backend	UNKNOWN STEP	2025-08-31T15:09:02.4454080Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
backend	UNKNOWN STEP	2025-08-31T15:09:02.4454665Z  creating subdirectories ... ok
backend	UNKNOWN STEP	2025-08-31T15:09:02.4454966Z  selecting dynamic shared memory implementation ... posix
backend	UNKNOWN STEP	2025-08-31T15:09:02.4455275Z  selecting default max_connections ... 100
backend	UNKNOWN STEP	2025-08-31T15:09:02.4455542Z  selecting default shared_buffers ... 128MB
backend	UNKNOWN STEP	2025-08-31T15:09:02.4455804Z  selecting default time zone ... Etc/UTC
backend	UNKNOWN STEP	2025-08-31T15:09:02.4456051Z  creating configuration files ... ok
backend	UNKNOWN STEP	2025-08-31T15:09:02.4456293Z  running bootstrap script ... ok
backend	UNKNOWN STEP	2025-08-31T15:09:02.4456552Z  performing post-bootstrap initialization ... ok
backend	UNKNOWN STEP	2025-08-31T15:09:02.4456826Z  syncing data to disk ... ok
backend	UNKNOWN STEP	2025-08-31T15:09:02.4457024Z  
backend	UNKNOWN STEP	2025-08-31T15:09:02.4457161Z  
backend	UNKNOWN STEP	2025-08-31T15:09:02.4457358Z  Success. You can now start the database server using:
backend	UNKNOWN STEP	2025-08-31T15:09:02.4457615Z  
backend	UNKNOWN STEP	2025-08-31T15:09:02.4457815Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
backend	UNKNOWN STEP	2025-08-31T15:09:02.4458078Z  
backend	UNKNOWN STEP	2025-08-31T15:09:02.4458804Z  waiting for server to start....2025-08-31 15:08:32.628 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
backend	UNKNOWN STEP	2025-08-31T15:09:02.4459543Z  2025-08-31 15:08:32.628 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
backend	UNKNOWN STEP	2025-08-31T15:09:02.4460016Z  2025-08-31 15:08:32.631 UTC [51] LOG:  database system was shut down at 2025-08-31 15:08:32 UTC
backend	UNKNOWN STEP	2025-08-31T15:09:02.4460462Z  2025-08-31 15:08:32.634 UTC [48] LOG:  database system is ready to accept connections
backend	UNKNOWN STEP	2025-08-31T15:09:02.4460774Z   done
backend	UNKNOWN STEP	2025-08-31T15:09:02.4460929Z  server started
backend	UNKNOWN STEP	2025-08-31T15:09:02.4461094Z  CREATE DATABASE
backend	UNKNOWN STEP	2025-08-31T15:09:02.4461258Z  
backend	UNKNOWN STEP	2025-08-31T15:09:02.4461391Z  
backend	UNKNOWN STEP	2025-08-31T15:09:02.4461680Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
backend	UNKNOWN STEP	2025-08-31T15:09:02.4462027Z  
backend	UNKNOWN STEP	2025-08-31T15:09:02.4462233Z  2025-08-31 15:08:32.813 UTC [48] LOG:  received fast shutdown request
backend	UNKNOWN STEP	2025-08-31T15:09:02.4462688Z  waiting for server to shut down....2025-08-31 15:08:32.814 UTC [48] LOG:  aborting any active transactions
backend	UNKNOWN STEP	2025-08-31T15:09:02.4463263Z  2025-08-31 15:08:32.815 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
backend	UNKNOWN STEP	2025-08-31T15:09:02.4463983Z  2025-08-31 15:08:32.816 UTC [49] LOG:  shutting down
backend	UNKNOWN STEP	2025-08-31T15:09:02.4464318Z  2025-08-31 15:08:32.816 UTC [49] LOG:  checkpoint starting: shutdown immediate
backend	UNKNOWN STEP	2025-08-31T15:09:02.4465114Z  2025-08-31 15:08:32.833 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.002 s, total=0.018 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
backend	UNKNOWN STEP	2025-08-31T15:09:02.4465890Z  2025-08-31 15:08:32.839 UTC [48] LOG:  database system is shut down
backend	UNKNOWN STEP	2025-08-31T15:09:02.4466165Z   done
backend	UNKNOWN STEP	2025-08-31T15:09:02.4466315Z  server stopped
backend	UNKNOWN STEP	2025-08-31T15:09:02.4466616Z  
backend	UNKNOWN STEP	2025-08-31T15:09:02.4466818Z  PostgreSQL init process complete; ready for start up.
backend	UNKNOWN STEP	2025-08-31T15:09:02.4467078Z  
backend	UNKNOWN STEP	2025-08-31T15:09:02.4471906Z Stop and remove container: dbfa0f2b4dcf4bce8aea32da17a84ac6_postgres15_3a8ed3
backend	UNKNOWN STEP	2025-08-31T15:09:02.4477265Z ##[command]/usr/bin/docker rm --force 2942fdae21474701cfd892ce7c4d5e177b2198bc20470f3c70c279ef8245c58b
backend	UNKNOWN STEP	2025-08-31T15:09:03.8799299Z 2942fdae21474701cfd892ce7c4d5e177b2198bc20470f3c70c279ef8245c58b
backend	UNKNOWN STEP	2025-08-31T15:09:03.8826576Z Remove container network: github_network_34292fafbb24406882904c33a3b55864
backend	UNKNOWN STEP	2025-08-31T15:09:03.8830715Z ##[command]/usr/bin/docker network rm github_network_34292fafbb24406882904c33a3b55864
backend	UNKNOWN STEP	2025-08-31T15:09:04.0076168Z github_network_34292fafbb24406882904c33a3b55864
backend	UNKNOWN STEP	2025-08-31T15:09:04.0132610Z Cleaning up orphan processes
```

</details>

### PR #64
- URL: https://github.com/lomendor/Project-Dixis/pull/64
- Bucket: phpunit-feature
- Failing Job: backend
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17358843430/job/49275923085

<details><summary>Head (first 60 lines)</summary>

```
backend	UNKNOWN STEP	﻿2025-08-31T15:08:24.2982298Z Current runner version: '2.328.0'
backend	UNKNOWN STEP	2025-08-31T15:08:24.3004561Z ##[group]Runner Image Provisioner
backend	UNKNOWN STEP	2025-08-31T15:08:24.3005303Z Hosted Compute Agent
backend	UNKNOWN STEP	2025-08-31T15:08:24.3005981Z Version: 20250821.380
backend	UNKNOWN STEP	2025-08-31T15:08:24.3006574Z Commit: 438d12cb4fe092871db9867344e3bc0bc5319035
backend	UNKNOWN STEP	2025-08-31T15:08:24.3007381Z Build Date: 2025-08-21T20:49:43Z
backend	UNKNOWN STEP	2025-08-31T15:08:24.3007985Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T15:08:24.3008528Z ##[group]Operating System
backend	UNKNOWN STEP	2025-08-31T15:08:24.3009148Z Ubuntu
backend	UNKNOWN STEP	2025-08-31T15:08:24.3009627Z 24.04.3
backend	UNKNOWN STEP	2025-08-31T15:08:24.3010107Z LTS
backend	UNKNOWN STEP	2025-08-31T15:08:24.3010555Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T15:08:24.3011396Z ##[group]Runner Image
backend	UNKNOWN STEP	2025-08-31T15:08:24.3011923Z Image: ubuntu-24.04
backend	UNKNOWN STEP	2025-08-31T15:08:24.3012436Z Version: 20250824.1.0
backend	UNKNOWN STEP	2025-08-31T15:08:24.3013537Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250824.1/images/ubuntu/Ubuntu2404-Readme.md
backend	UNKNOWN STEP	2025-08-31T15:08:24.3015103Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250824.1
backend	UNKNOWN STEP	2025-08-31T15:08:24.3016206Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T15:08:24.3017277Z ##[group]GITHUB_TOKEN Permissions
backend	UNKNOWN STEP	2025-08-31T15:08:24.3019152Z Contents: read
backend	UNKNOWN STEP	2025-08-31T15:08:24.3019690Z Metadata: read
backend	UNKNOWN STEP	2025-08-31T15:08:24.3020225Z Packages: read
backend	UNKNOWN STEP	2025-08-31T15:08:24.3021126Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T15:08:24.3023191Z Secret source: Actions
backend	UNKNOWN STEP	2025-08-31T15:08:24.3023977Z Prepare workflow directory
backend	UNKNOWN STEP	2025-08-31T15:08:24.3438555Z Prepare all required actions
backend	UNKNOWN STEP	2025-08-31T15:08:24.3476635Z Getting action download info
backend	UNKNOWN STEP	2025-08-31T15:08:24.6138595Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
backend	UNKNOWN STEP	2025-08-31T15:08:24.6806835Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
backend	UNKNOWN STEP	2025-08-31T15:08:24.9112481Z Complete job name: backend
backend	UNKNOWN STEP	2025-08-31T15:08:24.9596800Z ##[group]Checking docker version
backend	UNKNOWN STEP	2025-08-31T15:08:24.9609584Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
backend	UNKNOWN STEP	2025-08-31T15:08:26.2338403Z '1.48'
backend	UNKNOWN STEP	2025-08-31T15:08:26.2351881Z Docker daemon API version: '1.48'
backend	UNKNOWN STEP	2025-08-31T15:08:26.2353010Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
backend	UNKNOWN STEP	2025-08-31T15:08:26.2513653Z '1.48'
backend	UNKNOWN STEP	2025-08-31T15:08:26.2527636Z Docker client API version: '1.48'
backend	UNKNOWN STEP	2025-08-31T15:08:26.2533393Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T15:08:26.2536479Z ##[group]Clean up resources from previous jobs
backend	UNKNOWN STEP	2025-08-31T15:08:26.2542167Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=a765cd"
backend	UNKNOWN STEP	2025-08-31T15:08:26.2680566Z ##[command]/usr/bin/docker network prune --force --filter "label=a765cd"
backend	UNKNOWN STEP	2025-08-31T15:08:26.2855436Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T15:08:26.2856497Z ##[group]Create local container network
backend	UNKNOWN STEP	2025-08-31T15:08:26.2867669Z ##[command]/usr/bin/docker network create --label a765cd github_network_9917bdae87cb49fa83237ddd7695be43
backend	UNKNOWN STEP	2025-08-31T15:08:26.3357632Z 9b2b01d0b6d23bdd297836310b5a53dc93410461a024fa911859e2d436a369b1
backend	UNKNOWN STEP	2025-08-31T15:08:26.3377606Z ##[endgroup]
backend	UNKNOWN STEP	2025-08-31T15:08:26.3404505Z ##[group]Starting postgres service container
backend	UNKNOWN STEP	2025-08-31T15:08:26.3425401Z ##[command]/usr/bin/docker pull postgres:15
backend	UNKNOWN STEP	2025-08-31T15:08:26.5677950Z 15: Pulling from library/postgres
backend	UNKNOWN STEP	2025-08-31T15:08:26.6331816Z 396b1da7636e: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:26.6332799Z fca2566eba32: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:26.6333361Z 631fe8c6d606: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:26.6333871Z 77c7671c4414: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:26.6334353Z 2d9e29180a27: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:26.6334784Z c6bcc2c9a041: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:26.6335130Z ac4b721eb66f: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:26.6335548Z 606bd164980e: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:26.6336082Z f5dfd246bc6e: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:26.6336617Z ba7036bb0a60: Pulling fs layer
backend	UNKNOWN STEP	2025-08-31T15:08:26.6337141Z 799f859abbbd: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
backend	UNKNOWN STEP	2025-08-31T15:09:00.0981918Z  
backend	UNKNOWN STEP	2025-08-31T15:09:00.0982198Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
backend	UNKNOWN STEP	2025-08-31T15:09:00.0982645Z  creating subdirectories ... ok
backend	UNKNOWN STEP	2025-08-31T15:09:00.0982932Z  selecting dynamic shared memory implementation ... posix
backend	UNKNOWN STEP	2025-08-31T15:09:00.0983251Z  selecting default max_connections ... 100
backend	UNKNOWN STEP	2025-08-31T15:09:00.0983523Z  selecting default shared_buffers ... 128MB
backend	UNKNOWN STEP	2025-08-31T15:09:00.0983792Z  selecting default time zone ... Etc/UTC
backend	UNKNOWN STEP	2025-08-31T15:09:00.0984050Z  creating configuration files ... ok
backend	UNKNOWN STEP	2025-08-31T15:09:00.0984294Z  running bootstrap script ... ok
backend	UNKNOWN STEP	2025-08-31T15:09:00.0984563Z  performing post-bootstrap initialization ... ok
backend	UNKNOWN STEP	2025-08-31T15:09:00.0984854Z  syncing data to disk ... ok
backend	UNKNOWN STEP	2025-08-31T15:09:00.0985062Z  
backend	UNKNOWN STEP	2025-08-31T15:09:00.0985212Z  
backend	UNKNOWN STEP	2025-08-31T15:09:00.0986219Z  initdb: warning: enabling "trust" authentication for local connections
backend	UNKNOWN STEP	2025-08-31T15:09:00.0986873Z  initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
backend	UNKNOWN STEP	2025-08-31T15:09:00.0987960Z  2025-08-31 15:08:34.469 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
backend	UNKNOWN STEP	2025-08-31T15:09:00.0988565Z  2025-08-31 15:08:34.469 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
backend	UNKNOWN STEP	2025-08-31T15:09:00.0988962Z  2025-08-31 15:08:34.469 UTC [1] LOG:  listening on IPv6 address "::", port 5432
backend	UNKNOWN STEP	2025-08-31T15:09:00.0989394Z  2025-08-31 15:08:34.470 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
backend	UNKNOWN STEP	2025-08-31T15:09:00.0989860Z  2025-08-31 15:08:34.474 UTC [64] LOG:  database system was shut down at 2025-08-31 15:08:34 UTC
backend	UNKNOWN STEP	2025-08-31T15:09:00.0990283Z  2025-08-31 15:08:34.478 UTC [1] LOG:  database system is ready to accept connections
backend	UNKNOWN STEP	2025-08-31T15:09:00.0990743Z  2025-08-31 15:08:43.610 UTC [75] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-08-31T15:09:00.0991367Z  2025-08-31 15:08:53.676 UTC [83] FATAL:  role "root" does not exist
backend	UNKNOWN STEP	2025-08-31T15:09:00.0991841Z  2025-08-31 15:08:59.813 UTC [84] ERROR:  new row for relation "orders" violates check constraint "orders_status_new_check"
backend	UNKNOWN STEP	2025-08-31T15:09:00.0992601Z  2025-08-31 15:08:59.813 UTC [84] DETAIL:  Failing row contains (9, null, 0.00, 0.00, 3.23, 0.00, failed, HOME, null, null, null, 2025-08-31 15:08:59, 2025-08-31 15:08:59, processing, paypal, 3.23, 0.00, EUR).
backend	UNKNOWN STEP	2025-08-31T15:09:00.0994247Z  2025-08-31 15:08:59.813 UTC [84] STATEMENT:  insert into "orders" ("user_id", "status", "payment_status", "payment_method", "shipping_method", "subtotal", "shipping_cost", "total", "tax_amount", "shipping_amount", "total_amount", "updated_at", "created_at") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) returning "id"
backend	UNKNOWN STEP	2025-08-31T15:09:00.0995715Z  Success. You can now start the database server using:
backend	UNKNOWN STEP	2025-08-31T15:09:00.0995988Z  
backend	UNKNOWN STEP	2025-08-31T15:09:00.0996190Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
backend	UNKNOWN STEP	2025-08-31T15:09:00.0996448Z  
backend	UNKNOWN STEP	2025-08-31T15:09:00.0997198Z  waiting for server to start....2025-08-31 15:08:34.165 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
backend	UNKNOWN STEP	2025-08-31T15:09:00.0997932Z  2025-08-31 15:08:34.166 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
backend	UNKNOWN STEP	2025-08-31T15:09:00.0998398Z  2025-08-31 15:08:34.169 UTC [51] LOG:  database system was shut down at 2025-08-31 15:08:34 UTC
backend	UNKNOWN STEP	2025-08-31T15:09:00.0998816Z  2025-08-31 15:08:34.172 UTC [48] LOG:  database system is ready to accept connections
backend	UNKNOWN STEP	2025-08-31T15:09:00.0999115Z   done
backend	UNKNOWN STEP	2025-08-31T15:09:00.0999270Z  server started
backend	UNKNOWN STEP	2025-08-31T15:09:00.0999443Z  CREATE DATABASE
backend	UNKNOWN STEP	2025-08-31T15:09:00.0999604Z  
backend	UNKNOWN STEP	2025-08-31T15:09:00.0999745Z  
backend	UNKNOWN STEP	2025-08-31T15:09:00.1000020Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
backend	UNKNOWN STEP	2025-08-31T15:09:00.1000378Z  
backend	UNKNOWN STEP	2025-08-31T15:09:00.1000599Z  2025-08-31 15:08:34.350 UTC [48] LOG:  received fast shutdown request
backend	UNKNOWN STEP	2025-08-31T15:09:00.1001242Z  waiting for server to shut down....2025-08-31 15:08:34.351 UTC [48] LOG:  aborting any active transactions
backend	UNKNOWN STEP	2025-08-31T15:09:00.1001831Z  2025-08-31 15:08:34.353 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
backend	UNKNOWN STEP	2025-08-31T15:09:00.1002280Z  2025-08-31 15:08:34.353 UTC [49] LOG:  shutting down
backend	UNKNOWN STEP	2025-08-31T15:09:00.1002605Z  2025-08-31 15:08:34.353 UTC [49] LOG:  checkpoint starting: shutdown immediate
backend	UNKNOWN STEP	2025-08-31T15:09:00.1003399Z  2025-08-31 15:08:34.369 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.013 s, sync=0.002 s, total=0.016 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
backend	UNKNOWN STEP	2025-08-31T15:09:00.1004171Z  2025-08-31 15:08:34.375 UTC [48] LOG:  database system is shut down
backend	UNKNOWN STEP	2025-08-31T15:09:00.1004436Z   done
backend	UNKNOWN STEP	2025-08-31T15:09:00.1004594Z  server stopped
backend	UNKNOWN STEP	2025-08-31T15:09:00.1004751Z  
backend	UNKNOWN STEP	2025-08-31T15:09:00.1004954Z  PostgreSQL init process complete; ready for start up.
backend	UNKNOWN STEP	2025-08-31T15:09:00.1005348Z  
backend	UNKNOWN STEP	2025-08-31T15:09:00.1010415Z Stop and remove container: 72916f3548b14930bc1ea644f69453e8_postgres15_d522bb
backend	UNKNOWN STEP	2025-08-31T15:09:00.1015574Z ##[command]/usr/bin/docker rm --force 43f7217912905df400e61261aa5fcfbcc2b642fdbb6c95fa610dbdccfb804bb1
backend	UNKNOWN STEP	2025-08-31T15:09:00.4371572Z 43f7217912905df400e61261aa5fcfbcc2b642fdbb6c95fa610dbdccfb804bb1
backend	UNKNOWN STEP	2025-08-31T15:09:00.4399579Z Remove container network: github_network_9917bdae87cb49fa83237ddd7695be43
backend	UNKNOWN STEP	2025-08-31T15:09:00.4404579Z ##[command]/usr/bin/docker network rm github_network_9917bdae87cb49fa83237ddd7695be43
backend	UNKNOWN STEP	2025-08-31T15:09:00.5465304Z github_network_9917bdae87cb49fa83237ddd7695be43
backend	UNKNOWN STEP	2025-08-31T15:09:00.5542039Z Cleaning up orphan processes
```

</details>

### PR #50
- URL: https://github.com/lomendor/Project-Dixis/pull/50
- Bucket: frontend-tests
- Failing Job: e2e-tests
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17346182509/job/49246465637

<details><summary>Head (first 60 lines)</summary>

```
e2e-tests	UNKNOWN STEP	﻿2025-08-30T16:42:09.8462597Z Current runner version: '2.328.0'
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8484894Z ##[group]Runner Image Provisioner
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8485776Z Hosted Compute Agent
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8486314Z Version: 20250821.380
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8486904Z Commit: 438d12cb4fe092871db9867344e3bc0bc5319035
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8487587Z Build Date: 2025-08-21T20:49:43Z
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8488261Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8488740Z ##[group]Operating System
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8489290Z Ubuntu
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8490056Z 24.04.3
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8490543Z LTS
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8491000Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8491557Z ##[group]Runner Image
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8492109Z Image: ubuntu-24.04
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8492572Z Version: 20250824.1.0
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8493665Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250824.1/images/ubuntu/Ubuntu2404-Readme.md
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8495281Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250824.1
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8496332Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8497393Z ##[group]GITHUB_TOKEN Permissions
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8499229Z Contents: read
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8499982Z Metadata: read
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8500495Z Packages: read
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8501019Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8502963Z Secret source: Actions
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.8503662Z Prepare workflow directory
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.9053690Z Prepare all required actions
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:09.9108052Z Getting action download info
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:10.2712595Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:10.3406093Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:10.4386420Z Download action repository 'actions/cache@v4' (SHA:0400d5f644dc74513175e3cd8d07132dd4860809)
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:10.5355979Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:10.8599721Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.0858342Z Complete job name: e2e-tests
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.1439423Z ##[group]Checking docker version
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.1452999Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.1795741Z '1.48'
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.1808478Z Docker daemon API version: '1.48'
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.1809502Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.1962454Z '1.48'
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.1975726Z Docker client API version: '1.48'
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.1981197Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.1984135Z ##[group]Clean up resources from previous jobs
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.1989876Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=abc836"
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.2126588Z ##[command]/usr/bin/docker network prune --force --filter "label=abc836"
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.2250738Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.2251285Z ##[group]Create local container network
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.2261886Z ##[command]/usr/bin/docker network create --label abc836 github_network_9862c5f370ef4cbd9e2e85696deb709b
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.2743485Z dcb2c1d107a0eb175038dc1b273fd6c6dff0fcc289cb7a78d7e82b43705be2c0
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.2761193Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.2785735Z ##[group]Starting postgres service container
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.2807182Z ##[command]/usr/bin/docker pull postgres:15
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.7202158Z 15: Pulling from library/postgres
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.8204471Z 396b1da7636e: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.8207561Z fca2566eba32: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.8209107Z 631fe8c6d606: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.8272515Z 77c7671c4414: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.8274008Z 2d9e29180a27: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.8275221Z c6bcc2c9a041: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.8276374Z ac4b721eb66f: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-30T16:42:11.8277479Z 606bd164980e: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.8996747Z  2025-08-30 16:42:19.037 UTC [64] LOG:  database system was shut down at 2025-08-30 16:42:18 UTC
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.8997525Z  2025-08-30 16:42:19.041 UTC [1] LOG:  database system is ready to accept connections
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.8998089Z  
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.8998579Z  The database cluster will be initialized with locale "en_US.utf8".
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.8999301Z  The default database encoding has accordingly been set to "UTF8".
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9000158Z  The default text search configuration will be set to "english".
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9000687Z  
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9001001Z  Data page checksums are disabled.
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9001413Z  
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9001907Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9002557Z  creating subdirectories ... ok
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9003086Z  selecting dynamic shared memory implementation ... posix
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9003637Z  selecting default max_connections ... 100
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9004085Z  selecting default shared_buffers ... 128MB
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9004520Z  selecting default time zone ... Etc/UTC
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9004934Z  creating configuration files ... ok
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9005339Z  running bootstrap script ... ok
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9005827Z  performing post-bootstrap initialization ... ok
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9006327Z  syncing data to disk ... ok
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9006697Z  
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9006960Z  
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9007329Z  Success. You can now start the database server using:
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9007814Z  
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9008381Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9008873Z  
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9009934Z  waiting for server to start....2025-08-30 16:42:18.729 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9010739Z  2025-08-30 16:42:18.730 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9011245Z  2025-08-30 16:42:18.733 UTC [51] LOG:  database system was shut down at 2025-08-30 16:42:18 UTC
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9011703Z  2025-08-30 16:42:18.736 UTC [48] LOG:  database system is ready to accept connections
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9012035Z   done
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9012222Z  server started
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9012415Z  CREATE DATABASE
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9012605Z  
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9012766Z  
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9013082Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9013463Z  
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9013711Z  2025-08-30 16:42:18.914 UTC [48] LOG:  received fast shutdown request
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9014418Z  waiting for server to shut down....2025-08-30 16:42:18.915 UTC [48] LOG:  aborting any active transactions
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9015028Z  2025-08-30 16:42:18.917 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9015506Z  2025-08-30 16:42:18.917 UTC [49] LOG:  shutting down
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9015862Z  2025-08-30 16:42:18.918 UTC [49] LOG:  checkpoint starting: shutdown immediate
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9016688Z  2025-08-30 16:42:18.935 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.002 s, total=0.018 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9017488Z  2025-08-30 16:42:18.941 UTC [48] LOG:  database system is shut down
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9017781Z   done
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9017962Z  server stopped
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9018150Z  
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9018385Z  PostgreSQL init process complete; ready for start up.
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9018805Z  
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9024625Z Stop and remove container: b127080c930346ee90edc65044374191_postgres15_eb757d
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:35.9028955Z ##[command]/usr/bin/docker rm --force eb693aa56fc91c591f3b24d6f0a5bc0a3e798cdfc4525d81e374ccd1087c9f1e
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:36.0330439Z eb693aa56fc91c591f3b24d6f0a5bc0a3e798cdfc4525d81e374ccd1087c9f1e
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:36.0364048Z Remove container network: github_network_9862c5f370ef4cbd9e2e85696deb709b
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:36.0368546Z ##[command]/usr/bin/docker network rm github_network_9862c5f370ef4cbd9e2e85696deb709b
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:36.1362593Z github_network_9862c5f370ef4cbd9e2e85696deb709b
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:36.1424158Z Cleaning up orphan processes
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:36.1721912Z Terminate orphan process: pid (2948) (php)
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:36.1739441Z Terminate orphan process: pid (2951) (php8.3)
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:36.1869333Z Terminate orphan process: pid (5609) (npm run start -p 3001)
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:36.1896065Z Terminate orphan process: pid (5626) (sh)
e2e-tests	UNKNOWN STEP	2025-08-30T16:46:36.1920678Z Terminate orphan process: pid (5627) (next-server (v15.5.0))
```

</details>

### PR #48
- URL: https://github.com/lomendor/Project-Dixis/pull/48
- Bucket: frontend-tests
- Failing Job: integration
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17341898151/job/49236936507

<details><summary>Head (first 60 lines)</summary>

```
integration	UNKNOWN STEP	﻿2025-08-30T09:04:32.4408255Z Current runner version: '2.328.0'
integration	UNKNOWN STEP	2025-08-30T09:04:32.4431678Z ##[group]Runner Image Provisioner
integration	UNKNOWN STEP	2025-08-30T09:04:32.4432564Z Hosted Compute Agent
integration	UNKNOWN STEP	2025-08-30T09:04:32.4433128Z Version: 20250829.383
integration	UNKNOWN STEP	2025-08-30T09:04:32.4433681Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
integration	UNKNOWN STEP	2025-08-30T09:04:32.4434494Z Build Date: 2025-08-29T13:48:48Z
integration	UNKNOWN STEP	2025-08-30T09:04:32.4435103Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T09:04:32.4435611Z ##[group]Operating System
integration	UNKNOWN STEP	2025-08-30T09:04:32.4436118Z Ubuntu
integration	UNKNOWN STEP	2025-08-30T09:04:32.4436671Z 24.04.3
integration	UNKNOWN STEP	2025-08-30T09:04:32.4437097Z LTS
integration	UNKNOWN STEP	2025-08-30T09:04:32.4437728Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T09:04:32.4438330Z ##[group]Runner Image
integration	UNKNOWN STEP	2025-08-30T09:04:32.4438823Z Image: ubuntu-24.04
integration	UNKNOWN STEP	2025-08-30T09:04:32.4439298Z Version: 20250824.1.0
integration	UNKNOWN STEP	2025-08-30T09:04:32.4440326Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250824.1/images/ubuntu/Ubuntu2404-Readme.md
integration	UNKNOWN STEP	2025-08-30T09:04:32.4441855Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250824.1
integration	UNKNOWN STEP	2025-08-30T09:04:32.4442864Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T09:04:32.4443885Z ##[group]GITHUB_TOKEN Permissions
integration	UNKNOWN STEP	2025-08-30T09:04:32.4445724Z Contents: read
integration	UNKNOWN STEP	2025-08-30T09:04:32.4446218Z Metadata: read
integration	UNKNOWN STEP	2025-08-30T09:04:32.4446736Z Packages: read
integration	UNKNOWN STEP	2025-08-30T09:04:32.4447237Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T09:04:32.4449406Z Secret source: Actions
integration	UNKNOWN STEP	2025-08-30T09:04:32.4450035Z Prepare workflow directory
integration	UNKNOWN STEP	2025-08-30T09:04:32.4862161Z Prepare all required actions
integration	UNKNOWN STEP	2025-08-30T09:04:32.4900382Z Getting action download info
integration	UNKNOWN STEP	2025-08-30T09:04:32.9595628Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
integration	UNKNOWN STEP	2025-08-30T09:04:33.0255884Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
integration	UNKNOWN STEP	2025-08-30T09:04:33.5102511Z Download action repository 'actions/cache@v4' (SHA:0400d5f644dc74513175e3cd8d07132dd4860809)
integration	UNKNOWN STEP	2025-08-30T09:04:33.6032360Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
integration	UNKNOWN STEP	2025-08-30T09:04:33.6942107Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
integration	UNKNOWN STEP	2025-08-30T09:04:33.8908990Z Complete job name: integration
integration	UNKNOWN STEP	2025-08-30T09:04:33.9444550Z ##[group]Checking docker version
integration	UNKNOWN STEP	2025-08-30T09:04:33.9457321Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
integration	UNKNOWN STEP	2025-08-30T09:04:33.9992458Z '1.48'
integration	UNKNOWN STEP	2025-08-30T09:04:34.0005540Z Docker daemon API version: '1.48'
integration	UNKNOWN STEP	2025-08-30T09:04:34.0006304Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
integration	UNKNOWN STEP	2025-08-30T09:04:34.0154413Z '1.48'
integration	UNKNOWN STEP	2025-08-30T09:04:34.0167880Z Docker client API version: '1.48'
integration	UNKNOWN STEP	2025-08-30T09:04:34.0172475Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T09:04:34.0175338Z ##[group]Clean up resources from previous jobs
integration	UNKNOWN STEP	2025-08-30T09:04:34.0180563Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=6be713"
integration	UNKNOWN STEP	2025-08-30T09:04:34.0320383Z ##[command]/usr/bin/docker network prune --force --filter "label=6be713"
integration	UNKNOWN STEP	2025-08-30T09:04:34.0444103Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T09:04:34.0444631Z ##[group]Create local container network
integration	UNKNOWN STEP	2025-08-30T09:04:34.0454241Z ##[command]/usr/bin/docker network create --label 6be713 github_network_fc3831398b8e49a5909b0872f098fbfc
integration	UNKNOWN STEP	2025-08-30T09:04:34.0940902Z 6bb9edf6d7cb58393ef65e97f7c3bd5d6f4bcf97c033f20d9e82100defefc3a5
integration	UNKNOWN STEP	2025-08-30T09:04:34.0959423Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T09:04:34.0983874Z ##[group]Starting postgres service container
integration	UNKNOWN STEP	2025-08-30T09:04:34.1003400Z ##[command]/usr/bin/docker pull postgres:15
integration	UNKNOWN STEP	2025-08-30T09:04:35.1251396Z 15: Pulling from library/postgres
integration	UNKNOWN STEP	2025-08-30T09:04:35.4863703Z 396b1da7636e: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T09:04:35.4865709Z fca2566eba32: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T09:04:35.4867044Z 631fe8c6d606: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T09:04:35.4868608Z 77c7671c4414: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T09:04:35.4869449Z 2d9e29180a27: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T09:04:35.4870260Z c6bcc2c9a041: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T09:04:35.4871080Z ac4b721eb66f: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T09:04:35.4871889Z 606bd164980e: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
integration	UNKNOWN STEP	2025-08-30T09:06:26.9838579Z  The database cluster will be initialized with locale "en_US.utf8".
integration	UNKNOWN STEP	2025-08-30T09:06:26.9839310Z  The default database encoding has accordingly been set to "UTF8".
integration	UNKNOWN STEP	2025-08-30T09:06:26.9840008Z  The default text search configuration will be set to "english".
integration	UNKNOWN STEP	2025-08-30T09:06:26.9840580Z  
integration	UNKNOWN STEP	2025-08-30T09:06:26.9840883Z  Data page checksums are disabled.
integration	UNKNOWN STEP	2025-08-30T09:06:26.9841518Z  
integration	UNKNOWN STEP	2025-08-30T09:06:26.9841994Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
integration	UNKNOWN STEP	2025-08-30T09:06:26.9842645Z  creating subdirectories ... ok
integration	UNKNOWN STEP	2025-08-30T09:06:26.9843144Z  selecting dynamic shared memory implementation ... posix
integration	UNKNOWN STEP	2025-08-30T09:06:26.9843692Z  selecting default max_connections ... 100
integration	UNKNOWN STEP	2025-08-30T09:06:26.9844166Z  selecting default shared_buffers ... 128MB
integration	UNKNOWN STEP	2025-08-30T09:06:26.9844630Z  selecting default time zone ... Etc/UTC
integration	UNKNOWN STEP	2025-08-30T09:06:26.9845131Z  creating configuration files ... ok
integration	UNKNOWN STEP	2025-08-30T09:06:26.9845565Z  running bootstrap script ... ok
integration	UNKNOWN STEP	2025-08-30T09:06:26.9846029Z  performing post-bootstrap initialization ... ok
integration	UNKNOWN STEP	2025-08-30T09:06:26.9846533Z  syncing data to disk ... ok
integration	UNKNOWN STEP	2025-08-30T09:06:26.9846898Z  
integration	UNKNOWN STEP	2025-08-30T09:06:26.9847164Z  
integration	UNKNOWN STEP	2025-08-30T09:06:26.9847521Z  Success. You can now start the database server using:
integration	UNKNOWN STEP	2025-08-30T09:06:26.9848173Z  
integration	UNKNOWN STEP	2025-08-30T09:06:26.9848544Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
integration	UNKNOWN STEP	2025-08-30T09:06:26.9849026Z  
integration	UNKNOWN STEP	2025-08-30T09:06:26.9849985Z  waiting for server to start....2025-08-30 09:04:41.550 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
integration	UNKNOWN STEP	2025-08-30T09:06:26.9851486Z  2025-08-30 09:04:41.551 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-08-30T09:06:26.9852071Z  2025-08-30 09:04:41.554 UTC [51] LOG:  database system was shut down at 2025-08-30 09:04:41 UTC
integration	UNKNOWN STEP	2025-08-30T09:06:26.9852880Z  2025-08-30 09:04:41.558 UTC [48] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-08-30T09:06:26.9853332Z   done
integration	UNKNOWN STEP	2025-08-30T09:06:26.9853507Z  server started
integration	UNKNOWN STEP	2025-08-30T09:06:26.9853695Z  CREATE DATABASE
integration	UNKNOWN STEP	2025-08-30T09:06:26.9853874Z  
integration	UNKNOWN STEP	2025-08-30T09:06:26.9854028Z  
integration	UNKNOWN STEP	2025-08-30T09:06:26.9854334Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
integration	UNKNOWN STEP	2025-08-30T09:06:26.9854720Z  
integration	UNKNOWN STEP	2025-08-30T09:06:26.9854956Z  2025-08-30 09:04:41.735 UTC [48] LOG:  received fast shutdown request
integration	UNKNOWN STEP	2025-08-30T09:06:26.9855444Z  waiting for server to shut down....2025-08-30 09:04:41.736 UTC [48] LOG:  aborting any active transactions
integration	UNKNOWN STEP	2025-08-30T09:06:26.9856197Z  2025-08-30 09:04:41.854 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
integration	UNKNOWN STEP	2025-08-30T09:06:26.9856845Z  2025-08-30 09:04:41.855 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
integration	UNKNOWN STEP	2025-08-30T09:06:26.9857271Z  2025-08-30 09:04:41.855 UTC [1] LOG:  listening on IPv6 address "::", port 5432
integration	UNKNOWN STEP	2025-08-30T09:06:26.9857981Z  2025-08-30 09:04:41.856 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-08-30T09:06:26.9858501Z  2025-08-30 09:04:41.859 UTC [64] LOG:  database system was shut down at 2025-08-30 09:04:41 UTC
integration	UNKNOWN STEP	2025-08-30T09:06:26.9859187Z  2025-08-30 09:04:41.864 UTC [1] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-08-30T09:06:26.9859751Z  2025-08-30 09:04:41.738 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
integration	UNKNOWN STEP	2025-08-30T09:06:26.9860236Z  2025-08-30 09:04:41.738 UTC [49] LOG:  shutting down
integration	UNKNOWN STEP	2025-08-30T09:06:26.9860600Z  2025-08-30 09:04:41.739 UTC [49] LOG:  checkpoint starting: shutdown immediate
integration	UNKNOWN STEP	2025-08-30T09:06:26.9861448Z  2025-08-30 09:04:41.759 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.013 s, sync=0.006 s, total=0.021 s; sync files=301, longest=0.003 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
integration	UNKNOWN STEP	2025-08-30T09:06:26.9862271Z  2025-08-30 09:04:41.765 UTC [48] LOG:  database system is shut down
integration	UNKNOWN STEP	2025-08-30T09:06:26.9862571Z   done
integration	UNKNOWN STEP	2025-08-30T09:06:26.9862747Z  server stopped
integration	UNKNOWN STEP	2025-08-30T09:06:26.9862930Z  
integration	UNKNOWN STEP	2025-08-30T09:06:26.9863157Z  PostgreSQL init process complete; ready for start up.
integration	UNKNOWN STEP	2025-08-30T09:06:26.9863446Z  
integration	UNKNOWN STEP	2025-08-30T09:06:26.9869127Z Stop and remove container: 581acc7969424929837bf4484feea0c3_postgres15_17b94d
integration	UNKNOWN STEP	2025-08-30T09:06:26.9874004Z ##[command]/usr/bin/docker rm --force 1eb47c49e96a94fc2f000697c19f70110d437d5cc678b3df10519f090c99a4e8
integration	UNKNOWN STEP	2025-08-30T09:06:27.1640682Z 1eb47c49e96a94fc2f000697c19f70110d437d5cc678b3df10519f090c99a4e8
integration	UNKNOWN STEP	2025-08-30T09:06:27.1665838Z Remove container network: github_network_fc3831398b8e49a5909b0872f098fbfc
integration	UNKNOWN STEP	2025-08-30T09:06:27.1671241Z ##[command]/usr/bin/docker network rm github_network_fc3831398b8e49a5909b0872f098fbfc
integration	UNKNOWN STEP	2025-08-30T09:06:27.2831529Z github_network_fc3831398b8e49a5909b0872f098fbfc
integration	UNKNOWN STEP	2025-08-30T09:06:27.2888885Z Cleaning up orphan processes
integration	UNKNOWN STEP	2025-08-30T09:06:27.3172058Z Terminate orphan process: pid (2861) (php)
integration	UNKNOWN STEP	2025-08-30T09:06:27.3199471Z Terminate orphan process: pid (2864) (php8.3)
```

</details>

### PR #47
- URL: https://github.com/lomendor/Project-Dixis/pull/47
- Bucket: frontend-tests
- Failing Job: integration
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17341842506/job/49236804870

<details><summary>Head (first 60 lines)</summary>

```
integration	UNKNOWN STEP	﻿2025-08-30T08:58:57.7013716Z Current runner version: '2.328.0'
integration	UNKNOWN STEP	2025-08-30T08:58:57.7048798Z ##[group]Runner Image Provisioner
integration	UNKNOWN STEP	2025-08-30T08:58:57.7050084Z Hosted Compute Agent
integration	UNKNOWN STEP	2025-08-30T08:58:57.7050880Z Version: 20250821.380
integration	UNKNOWN STEP	2025-08-30T08:58:57.7051911Z Commit: 438d12cb4fe092871db9867344e3bc0bc5319035
integration	UNKNOWN STEP	2025-08-30T08:58:57.7053087Z Build Date: 2025-08-21T20:49:43Z
integration	UNKNOWN STEP	2025-08-30T08:58:57.7054030Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T08:58:57.7054859Z ##[group]Operating System
integration	UNKNOWN STEP	2025-08-30T08:58:57.7055829Z Ubuntu
integration	UNKNOWN STEP	2025-08-30T08:58:57.7056767Z 24.04.3
integration	UNKNOWN STEP	2025-08-30T08:58:57.7057625Z LTS
integration	UNKNOWN STEP	2025-08-30T08:58:57.7058496Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T08:58:57.7059272Z ##[group]Runner Image
integration	UNKNOWN STEP	2025-08-30T08:58:57.7060357Z Image: ubuntu-24.04
integration	UNKNOWN STEP	2025-08-30T08:58:57.7061154Z Version: 20250824.1.0
integration	UNKNOWN STEP	2025-08-30T08:58:57.7062825Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250824.1/images/ubuntu/Ubuntu2404-Readme.md
integration	UNKNOWN STEP	2025-08-30T08:58:57.7065561Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250824.1
integration	UNKNOWN STEP	2025-08-30T08:58:57.7067471Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T08:58:57.7069361Z ##[group]GITHUB_TOKEN Permissions
integration	UNKNOWN STEP	2025-08-30T08:58:57.7072177Z Contents: read
integration	UNKNOWN STEP	2025-08-30T08:58:57.7073200Z Metadata: read
integration	UNKNOWN STEP	2025-08-30T08:58:57.7074034Z Packages: read
integration	UNKNOWN STEP	2025-08-30T08:58:57.7074826Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T08:58:57.7078965Z Secret source: Actions
integration	UNKNOWN STEP	2025-08-30T08:58:57.7080157Z Prepare workflow directory
integration	UNKNOWN STEP	2025-08-30T08:58:57.7726497Z Prepare all required actions
integration	UNKNOWN STEP	2025-08-30T08:58:57.7785124Z Getting action download info
integration	UNKNOWN STEP	2025-08-30T08:58:58.1229372Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
integration	UNKNOWN STEP	2025-08-30T08:58:58.1956165Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
integration	UNKNOWN STEP	2025-08-30T08:58:58.4506522Z Download action repository 'actions/cache@v4' (SHA:0400d5f644dc74513175e3cd8d07132dd4860809)
integration	UNKNOWN STEP	2025-08-30T08:58:58.5981516Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
integration	UNKNOWN STEP	2025-08-30T08:58:58.7307977Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
integration	UNKNOWN STEP	2025-08-30T08:58:58.9660697Z Complete job name: integration
integration	UNKNOWN STEP	2025-08-30T08:58:59.0316219Z ##[group]Checking docker version
integration	UNKNOWN STEP	2025-08-30T08:58:59.0330736Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
integration	UNKNOWN STEP	2025-08-30T08:58:59.0767203Z '1.48'
integration	UNKNOWN STEP	2025-08-30T08:58:59.0780633Z Docker daemon API version: '1.48'
integration	UNKNOWN STEP	2025-08-30T08:58:59.0782040Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
integration	UNKNOWN STEP	2025-08-30T08:58:59.0954569Z '1.48'
integration	UNKNOWN STEP	2025-08-30T08:58:59.0969602Z Docker client API version: '1.48'
integration	UNKNOWN STEP	2025-08-30T08:58:59.0976915Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T08:58:59.0980465Z ##[group]Clean up resources from previous jobs
integration	UNKNOWN STEP	2025-08-30T08:58:59.0987064Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=3f030f"
integration	UNKNOWN STEP	2025-08-30T08:58:59.1144360Z ##[command]/usr/bin/docker network prune --force --filter "label=3f030f"
integration	UNKNOWN STEP	2025-08-30T08:58:59.1291198Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T08:58:59.1292067Z ##[group]Create local container network
integration	UNKNOWN STEP	2025-08-30T08:58:59.1304687Z ##[command]/usr/bin/docker network create --label 3f030f github_network_dce78831fc4e4981b81c79dbba5c17e8
integration	UNKNOWN STEP	2025-08-30T08:58:59.1828309Z a31d15e48f900be621e6757ca730f302f52d736d063fa6131b624ac2e580fcb5
integration	UNKNOWN STEP	2025-08-30T08:58:59.1849217Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T08:58:59.1876081Z ##[group]Starting postgres service container
integration	UNKNOWN STEP	2025-08-30T08:58:59.1898073Z ##[command]/usr/bin/docker pull postgres:15
integration	UNKNOWN STEP	2025-08-30T08:58:59.4438146Z 15: Pulling from library/postgres
integration	UNKNOWN STEP	2025-08-30T08:58:59.5124189Z 396b1da7636e: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T08:58:59.5125926Z fca2566eba32: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T08:58:59.5127371Z 631fe8c6d606: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T08:58:59.5128960Z 77c7671c4414: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T08:58:59.5130406Z 2d9e29180a27: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T08:58:59.5131557Z c6bcc2c9a041: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T08:58:59.5132695Z ac4b721eb66f: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T08:58:59.5133819Z 606bd164980e: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
integration	UNKNOWN STEP	2025-08-30T09:00:40.0344896Z  2025-08-30 08:59:05.974 UTC [1] LOG:  listening on IPv6 address "::", port 5432
integration	UNKNOWN STEP	2025-08-30T09:00:40.0345621Z  2025-08-30 08:59:05.975 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-08-30T09:00:40.0346374Z  2025-08-30 08:59:05.978 UTC [64] LOG:  database system was shut down at 2025-08-30 08:59:05 UTC
integration	UNKNOWN STEP	2025-08-30T09:00:40.0347347Z  2025-08-30 08:59:05.982 UTC [1] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-08-30T09:00:40.0347943Z  This user must also own the server process.
integration	UNKNOWN STEP	2025-08-30T09:00:40.0348343Z  
integration	UNKNOWN STEP	2025-08-30T09:00:40.0348743Z  The database cluster will be initialized with locale "en_US.utf8".
integration	UNKNOWN STEP	2025-08-30T09:00:40.0349418Z  The default database encoding has accordingly been set to "UTF8".
integration	UNKNOWN STEP	2025-08-30T09:00:40.0350040Z  The default text search configuration will be set to "english".
integration	UNKNOWN STEP	2025-08-30T09:00:40.0350540Z  
integration	UNKNOWN STEP	2025-08-30T09:00:40.0350822Z  Data page checksums are disabled.
integration	UNKNOWN STEP	2025-08-30T09:00:40.0351199Z  
integration	UNKNOWN STEP	2025-08-30T09:00:40.0351650Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
integration	UNKNOWN STEP	2025-08-30T09:00:40.0352659Z  creating subdirectories ... ok
integration	UNKNOWN STEP	2025-08-30T09:00:40.0353143Z  selecting dynamic shared memory implementation ... posix
integration	UNKNOWN STEP	2025-08-30T09:00:40.0353679Z  selecting default max_connections ... 100
integration	UNKNOWN STEP	2025-08-30T09:00:40.0354130Z  selecting default shared_buffers ... 128MB
integration	UNKNOWN STEP	2025-08-30T09:00:40.0354585Z  selecting default time zone ... Etc/UTC
integration	UNKNOWN STEP	2025-08-30T09:00:40.0355277Z  creating configuration files ... ok
integration	UNKNOWN STEP	2025-08-30T09:00:40.0355722Z  running bootstrap script ... ok
integration	UNKNOWN STEP	2025-08-30T09:00:40.0356200Z  performing post-bootstrap initialization ... ok
integration	UNKNOWN STEP	2025-08-30T09:00:40.0356830Z  syncing data to disk ... ok
integration	UNKNOWN STEP	2025-08-30T09:00:40.0357188Z  
integration	UNKNOWN STEP	2025-08-30T09:00:40.0357454Z  
integration	UNKNOWN STEP	2025-08-30T09:00:40.0357703Z  Success. You can now start the database server using:
integration	UNKNOWN STEP	2025-08-30T09:00:40.0357994Z  
integration	UNKNOWN STEP	2025-08-30T09:00:40.0358220Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
integration	UNKNOWN STEP	2025-08-30T09:00:40.0358492Z  
integration	UNKNOWN STEP	2025-08-30T09:00:40.0359075Z  waiting for server to start....2025-08-30 08:59:05.664 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
integration	UNKNOWN STEP	2025-08-30T09:00:40.0359836Z  2025-08-30 08:59:05.665 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-08-30T09:00:40.0360330Z  2025-08-30 08:59:05.668 UTC [51] LOG:  database system was shut down at 2025-08-30 08:59:05 UTC
integration	UNKNOWN STEP	2025-08-30T09:00:40.0360784Z  2025-08-30 08:59:05.672 UTC [48] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-08-30T09:00:40.0361109Z   done
integration	UNKNOWN STEP	2025-08-30T09:00:40.0361280Z  server started
integration	UNKNOWN STEP	2025-08-30T09:00:40.0361466Z  CREATE DATABASE
integration	UNKNOWN STEP	2025-08-30T09:00:40.0361647Z  
integration	UNKNOWN STEP	2025-08-30T09:00:40.0361801Z  
integration	UNKNOWN STEP	2025-08-30T09:00:40.0362103Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
integration	UNKNOWN STEP	2025-08-30T09:00:40.0362471Z  
integration	UNKNOWN STEP	2025-08-30T09:00:40.0362705Z  2025-08-30 08:59:05.854 UTC [48] LOG:  received fast shutdown request
integration	UNKNOWN STEP	2025-08-30T09:00:40.0363534Z  waiting for server to shut down....2025-08-30 08:59:05.854 UTC [48] LOG:  aborting any active transactions
integration	UNKNOWN STEP	2025-08-30T09:00:40.0364163Z  2025-08-30 08:59:05.856 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
integration	UNKNOWN STEP	2025-08-30T09:00:40.0364630Z  2025-08-30 08:59:05.856 UTC [49] LOG:  shutting down
integration	UNKNOWN STEP	2025-08-30T09:00:40.0364984Z  2025-08-30 08:59:05.857 UTC [49] LOG:  checkpoint starting: shutdown immediate
integration	UNKNOWN STEP	2025-08-30T09:00:40.0365807Z  2025-08-30 08:59:05.874 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.003 s, total=0.018 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
integration	UNKNOWN STEP	2025-08-30T09:00:40.0366831Z  2025-08-30 08:59:05.880 UTC [48] LOG:  database system is shut down
integration	UNKNOWN STEP	2025-08-30T09:00:40.0367128Z   done
integration	UNKNOWN STEP	2025-08-30T09:00:40.0367298Z  server stopped
integration	UNKNOWN STEP	2025-08-30T09:00:40.0367475Z  
integration	UNKNOWN STEP	2025-08-30T09:00:40.0367700Z  PostgreSQL init process complete; ready for start up.
integration	UNKNOWN STEP	2025-08-30T09:00:40.0367986Z  
integration	UNKNOWN STEP	2025-08-30T09:00:40.0377724Z Stop and remove container: 84265207227f432baca8b15e50981e6f_postgres15_f72e39
integration	UNKNOWN STEP	2025-08-30T09:00:40.0383638Z ##[command]/usr/bin/docker rm --force f7260aebafded95ba4a7ca208ff132a4ee621bf0003d9b8ba6764043f0120c23
integration	UNKNOWN STEP	2025-08-30T09:00:40.2062764Z f7260aebafded95ba4a7ca208ff132a4ee621bf0003d9b8ba6764043f0120c23
integration	UNKNOWN STEP	2025-08-30T09:00:40.2091224Z Remove container network: github_network_dce78831fc4e4981b81c79dbba5c17e8
integration	UNKNOWN STEP	2025-08-30T09:00:40.2095597Z ##[command]/usr/bin/docker network rm github_network_dce78831fc4e4981b81c79dbba5c17e8
integration	UNKNOWN STEP	2025-08-30T09:00:40.3382525Z github_network_dce78831fc4e4981b81c79dbba5c17e8
integration	UNKNOWN STEP	2025-08-30T09:00:40.3443139Z Cleaning up orphan processes
integration	UNKNOWN STEP	2025-08-30T09:00:40.3764415Z Terminate orphan process: pid (2909) (php)
integration	UNKNOWN STEP	2025-08-30T09:00:40.3782474Z Terminate orphan process: pid (2912) (php8.3)
```

</details>

### PR #45
- URL: https://github.com/lomendor/Project-Dixis/pull/45
- Bucket: frontend-tests
- Failing Job: integration
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17341602325/job/49236242220

<details><summary>Head (first 60 lines)</summary>

```
integration	UNKNOWN STEP	﻿2025-08-30T08:32:21.7955274Z Current runner version: '2.328.0'
integration	UNKNOWN STEP	2025-08-30T08:32:21.7978164Z ##[group]Runner Image Provisioner
integration	UNKNOWN STEP	2025-08-30T08:32:21.7978970Z Hosted Compute Agent
integration	UNKNOWN STEP	2025-08-30T08:32:21.7979588Z Version: 20250829.383
integration	UNKNOWN STEP	2025-08-30T08:32:21.7980173Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
integration	UNKNOWN STEP	2025-08-30T08:32:21.7980889Z Build Date: 2025-08-29T13:48:48Z
integration	UNKNOWN STEP	2025-08-30T08:32:21.7981421Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T08:32:21.7982002Z ##[group]Operating System
integration	UNKNOWN STEP	2025-08-30T08:32:21.7982572Z Ubuntu
integration	UNKNOWN STEP	2025-08-30T08:32:21.7983029Z 24.04.3
integration	UNKNOWN STEP	2025-08-30T08:32:21.7983512Z LTS
integration	UNKNOWN STEP	2025-08-30T08:32:21.7983999Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T08:32:21.7984444Z ##[group]Runner Image
integration	UNKNOWN STEP	2025-08-30T08:32:21.7985013Z Image: ubuntu-24.04
integration	UNKNOWN STEP	2025-08-30T08:32:21.7985505Z Version: 20250824.1.0
integration	UNKNOWN STEP	2025-08-30T08:32:21.7986783Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250824.1/images/ubuntu/Ubuntu2404-Readme.md
integration	UNKNOWN STEP	2025-08-30T08:32:21.7988366Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250824.1
integration	UNKNOWN STEP	2025-08-30T08:32:21.7989319Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T08:32:21.7990425Z ##[group]GITHUB_TOKEN Permissions
integration	UNKNOWN STEP	2025-08-30T08:32:21.7992159Z Contents: read
integration	UNKNOWN STEP	2025-08-30T08:32:21.7992741Z Metadata: read
integration	UNKNOWN STEP	2025-08-30T08:32:21.7993301Z Packages: read
integration	UNKNOWN STEP	2025-08-30T08:32:21.7993797Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T08:32:21.7995816Z Secret source: Actions
integration	UNKNOWN STEP	2025-08-30T08:32:21.7996827Z Prepare workflow directory
integration	UNKNOWN STEP	2025-08-30T08:32:21.8414632Z Prepare all required actions
integration	UNKNOWN STEP	2025-08-30T08:32:21.8452650Z Getting action download info
integration	UNKNOWN STEP	2025-08-30T08:32:22.3182532Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
integration	UNKNOWN STEP	2025-08-30T08:32:22.4141256Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
integration	UNKNOWN STEP	2025-08-30T08:32:23.0179752Z Download action repository 'actions/cache@v4' (SHA:0400d5f644dc74513175e3cd8d07132dd4860809)
integration	UNKNOWN STEP	2025-08-30T08:32:23.1124453Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
integration	UNKNOWN STEP	2025-08-30T08:32:23.2103827Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
integration	UNKNOWN STEP	2025-08-30T08:32:23.4632990Z Complete job name: integration
integration	UNKNOWN STEP	2025-08-30T08:32:23.5165755Z ##[group]Checking docker version
integration	UNKNOWN STEP	2025-08-30T08:32:23.5178976Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
integration	UNKNOWN STEP	2025-08-30T08:32:24.5174214Z '1.48'
integration	UNKNOWN STEP	2025-08-30T08:32:24.5188108Z Docker daemon API version: '1.48'
integration	UNKNOWN STEP	2025-08-30T08:32:24.5189194Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
integration	UNKNOWN STEP	2025-08-30T08:32:24.5343160Z '1.48'
integration	UNKNOWN STEP	2025-08-30T08:32:24.5357239Z Docker client API version: '1.48'
integration	UNKNOWN STEP	2025-08-30T08:32:24.5363320Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T08:32:24.5366638Z ##[group]Clean up resources from previous jobs
integration	UNKNOWN STEP	2025-08-30T08:32:24.5372044Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=4aa5fd"
integration	UNKNOWN STEP	2025-08-30T08:32:24.5548888Z ##[command]/usr/bin/docker network prune --force --filter "label=4aa5fd"
integration	UNKNOWN STEP	2025-08-30T08:32:24.5675816Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T08:32:24.5677233Z ##[group]Create local container network
integration	UNKNOWN STEP	2025-08-30T08:32:24.5689166Z ##[command]/usr/bin/docker network create --label 4aa5fd github_network_4120dcfa40eb4aa3a0cc9cff774c0de9
integration	UNKNOWN STEP	2025-08-30T08:32:24.6181207Z 07ac72c0a221f3e3dacc00e73a53b4ec50c2b92a3da402ea4646b9853c01521a
integration	UNKNOWN STEP	2025-08-30T08:32:24.6200207Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T08:32:24.6225974Z ##[group]Starting postgres service container
integration	UNKNOWN STEP	2025-08-30T08:32:24.6246544Z ##[command]/usr/bin/docker pull postgres:15
integration	UNKNOWN STEP	2025-08-30T08:32:25.6716727Z 15: Pulling from library/postgres
integration	UNKNOWN STEP	2025-08-30T08:32:25.9315205Z 396b1da7636e: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T08:32:25.9315715Z fca2566eba32: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T08:32:25.9316325Z 631fe8c6d606: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T08:32:25.9316749Z 77c7671c4414: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T08:32:25.9317179Z 2d9e29180a27: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T08:32:25.9317602Z c6bcc2c9a041: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T08:32:25.9318068Z ac4b721eb66f: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T08:32:25.9318546Z 606bd164980e: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
integration	UNKNOWN STEP	2025-08-30T08:34:25.2568615Z  The default text search configuration will be set to "english".
integration	UNKNOWN STEP	2025-08-30T08:34:25.2569158Z  
integration	UNKNOWN STEP	2025-08-30T08:34:25.2569486Z  Data page checksums are disabled.
integration	UNKNOWN STEP	2025-08-30T08:34:25.2569893Z  
integration	UNKNOWN STEP	2025-08-30T08:34:25.2570391Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
integration	UNKNOWN STEP	2025-08-30T08:34:25.2571974Z  initdb: warning: enabling "trust" authentication for local connections
integration	UNKNOWN STEP	2025-08-30T08:34:25.2573039Z  initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
integration	UNKNOWN STEP	2025-08-30T08:34:25.2574661Z  2025-08-30 08:32:32.932 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
integration	UNKNOWN STEP	2025-08-30T08:34:25.2575689Z  2025-08-30 08:32:32.932 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
integration	UNKNOWN STEP	2025-08-30T08:34:25.2576555Z  2025-08-30 08:32:32.932 UTC [1] LOG:  listening on IPv6 address "::", port 5432
integration	UNKNOWN STEP	2025-08-30T08:34:25.2577281Z  2025-08-30 08:32:32.934 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-08-30T08:34:25.2578079Z  2025-08-30 08:32:32.937 UTC [64] LOG:  database system was shut down at 2025-08-30 08:32:32 UTC
integration	UNKNOWN STEP	2025-08-30T08:34:25.2578822Z  2025-08-30 08:32:32.941 UTC [1] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-08-30T08:34:25.2579407Z  creating subdirectories ... ok
integration	UNKNOWN STEP	2025-08-30T08:34:25.2579902Z  selecting dynamic shared memory implementation ... posix
integration	UNKNOWN STEP	2025-08-30T08:34:25.2580445Z  selecting default max_connections ... 100
integration	UNKNOWN STEP	2025-08-30T08:34:25.2580928Z  selecting default shared_buffers ... 128MB
integration	UNKNOWN STEP	2025-08-30T08:34:25.2581388Z  selecting default time zone ... Etc/UTC
integration	UNKNOWN STEP	2025-08-30T08:34:25.2581834Z  creating configuration files ... ok
integration	UNKNOWN STEP	2025-08-30T08:34:25.2582254Z  running bootstrap script ... ok
integration	UNKNOWN STEP	2025-08-30T08:34:25.2582690Z  performing post-bootstrap initialization ... ok
integration	UNKNOWN STEP	2025-08-30T08:34:25.2583138Z  syncing data to disk ... ok
integration	UNKNOWN STEP	2025-08-30T08:34:25.2583496Z  
integration	UNKNOWN STEP	2025-08-30T08:34:25.2583762Z  
integration	UNKNOWN STEP	2025-08-30T08:34:25.2584124Z  Success. You can now start the database server using:
integration	UNKNOWN STEP	2025-08-30T08:34:25.2584593Z  
integration	UNKNOWN STEP	2025-08-30T08:34:25.2584942Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
integration	UNKNOWN STEP	2025-08-30T08:34:25.2585394Z  
integration	UNKNOWN STEP	2025-08-30T08:34:25.2586578Z  waiting for server to start....2025-08-30 08:32:32.628 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
integration	UNKNOWN STEP	2025-08-30T08:34:25.2587857Z  2025-08-30 08:32:32.629 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-08-30T08:34:25.2588391Z  2025-08-30 08:32:32.632 UTC [51] LOG:  database system was shut down at 2025-08-30 08:32:32 UTC
integration	UNKNOWN STEP	2025-08-30T08:34:25.2588837Z  2025-08-30 08:32:32.636 UTC [48] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-08-30T08:34:25.2589159Z   done
integration	UNKNOWN STEP	2025-08-30T08:34:25.2589327Z  server started
integration	UNKNOWN STEP	2025-08-30T08:34:25.2589512Z  CREATE DATABASE
integration	UNKNOWN STEP	2025-08-30T08:34:25.2589688Z  
integration	UNKNOWN STEP	2025-08-30T08:34:25.2589839Z  
integration	UNKNOWN STEP	2025-08-30T08:34:25.2590139Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
integration	UNKNOWN STEP	2025-08-30T08:34:25.2590497Z  
integration	UNKNOWN STEP	2025-08-30T08:34:25.2590721Z  2025-08-30 08:32:32.813 UTC [48] LOG:  received fast shutdown request
integration	UNKNOWN STEP	2025-08-30T08:34:25.2591379Z  waiting for server to shut down....2025-08-30 08:32:32.814 UTC [48] LOG:  aborting any active transactions
integration	UNKNOWN STEP	2025-08-30T08:34:25.2591988Z  2025-08-30 08:32:32.816 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
integration	UNKNOWN STEP	2025-08-30T08:34:25.2592456Z  2025-08-30 08:32:32.816 UTC [49] LOG:  shutting down
integration	UNKNOWN STEP	2025-08-30T08:34:25.2592805Z  2025-08-30 08:32:32.816 UTC [49] LOG:  checkpoint starting: shutdown immediate
integration	UNKNOWN STEP	2025-08-30T08:34:25.2593640Z  2025-08-30 08:32:32.834 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.002 s, total=0.019 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
integration	UNKNOWN STEP	2025-08-30T08:34:25.2594443Z  2025-08-30 08:32:32.840 UTC [48] LOG:  database system is shut down
integration	UNKNOWN STEP	2025-08-30T08:34:25.2594730Z   done
integration	UNKNOWN STEP	2025-08-30T08:34:25.2594896Z  server stopped
integration	UNKNOWN STEP	2025-08-30T08:34:25.2595073Z  
integration	UNKNOWN STEP	2025-08-30T08:34:25.2595291Z  PostgreSQL init process complete; ready for start up.
integration	UNKNOWN STEP	2025-08-30T08:34:25.2595566Z  
integration	UNKNOWN STEP	2025-08-30T08:34:25.2600902Z Stop and remove container: 57d4190a7f8c4434a92bbf2d7f27ea94_postgres15_ff3581
integration	UNKNOWN STEP	2025-08-30T08:34:25.2605731Z ##[command]/usr/bin/docker rm --force 925439f456cf97f6005727080eadd2ddf900e86d71bacdc4467a8b395bc67afb
integration	UNKNOWN STEP	2025-08-30T08:34:25.4428879Z 925439f456cf97f6005727080eadd2ddf900e86d71bacdc4467a8b395bc67afb
integration	UNKNOWN STEP	2025-08-30T08:34:25.4454689Z Remove container network: github_network_4120dcfa40eb4aa3a0cc9cff774c0de9
integration	UNKNOWN STEP	2025-08-30T08:34:25.4459838Z ##[command]/usr/bin/docker network rm github_network_4120dcfa40eb4aa3a0cc9cff774c0de9
integration	UNKNOWN STEP	2025-08-30T08:34:25.5616771Z github_network_4120dcfa40eb4aa3a0cc9cff774c0de9
integration	UNKNOWN STEP	2025-08-30T08:34:25.5673322Z Cleaning up orphan processes
integration	UNKNOWN STEP	2025-08-30T08:34:25.5965765Z Terminate orphan process: pid (2922) (php)
integration	UNKNOWN STEP	2025-08-30T08:34:25.5983068Z Terminate orphan process: pid (2925) (php8.3)
```

</details>

### PR #44
- URL: https://github.com/lomendor/Project-Dixis/pull/44
- Bucket: frontend-tests
- Failing Job: integration
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17341143165/job/49235165298

<details><summary>Head (first 60 lines)</summary>

```
integration	UNKNOWN STEP	﻿2025-08-30T07:39:09.0505884Z Current runner version: '2.328.0'
integration	UNKNOWN STEP	2025-08-30T07:39:09.0529568Z ##[group]Runner Image Provisioner
integration	UNKNOWN STEP	2025-08-30T07:39:09.0530344Z Hosted Compute Agent
integration	UNKNOWN STEP	2025-08-30T07:39:09.0530986Z Version: 20250821.380
integration	UNKNOWN STEP	2025-08-30T07:39:09.0531544Z Commit: 438d12cb4fe092871db9867344e3bc0bc5319035
integration	UNKNOWN STEP	2025-08-30T07:39:09.0532446Z Build Date: 2025-08-21T20:49:43Z
integration	UNKNOWN STEP	2025-08-30T07:39:09.0533051Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T07:39:09.0533590Z ##[group]Operating System
integration	UNKNOWN STEP	2025-08-30T07:39:09.0534154Z Ubuntu
integration	UNKNOWN STEP	2025-08-30T07:39:09.0534626Z 24.04.3
integration	UNKNOWN STEP	2025-08-30T07:39:09.0535112Z LTS
integration	UNKNOWN STEP	2025-08-30T07:39:09.0535564Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T07:39:09.0536071Z ##[group]Runner Image
integration	UNKNOWN STEP	2025-08-30T07:39:09.0536585Z Image: ubuntu-24.04
integration	UNKNOWN STEP	2025-08-30T07:39:09.0537082Z Version: 20250824.1.0
integration	UNKNOWN STEP	2025-08-30T07:39:09.0538012Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250824.1/images/ubuntu/Ubuntu2404-Readme.md
integration	UNKNOWN STEP	2025-08-30T07:39:09.0539659Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250824.1
integration	UNKNOWN STEP	2025-08-30T07:39:09.0540650Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T07:39:09.0541705Z ##[group]GITHUB_TOKEN Permissions
integration	UNKNOWN STEP	2025-08-30T07:39:09.0543578Z Contents: read
integration	UNKNOWN STEP	2025-08-30T07:39:09.0544202Z Metadata: read
integration	UNKNOWN STEP	2025-08-30T07:39:09.0544748Z Packages: read
integration	UNKNOWN STEP	2025-08-30T07:39:09.0545225Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T07:39:09.0547282Z Secret source: Actions
integration	UNKNOWN STEP	2025-08-30T07:39:09.0547986Z Prepare workflow directory
integration	UNKNOWN STEP	2025-08-30T07:39:09.1080200Z Prepare all required actions
integration	UNKNOWN STEP	2025-08-30T07:39:09.1117139Z Getting action download info
integration	UNKNOWN STEP	2025-08-30T07:39:09.5224543Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
integration	UNKNOWN STEP	2025-08-30T07:39:09.7483899Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
integration	UNKNOWN STEP	2025-08-30T07:39:10.4003756Z Download action repository 'actions/cache@v4' (SHA:0400d5f644dc74513175e3cd8d07132dd4860809)
integration	UNKNOWN STEP	2025-08-30T07:39:10.5669262Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
integration	UNKNOWN STEP	2025-08-30T07:39:10.6961231Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
integration	UNKNOWN STEP	2025-08-30T07:39:10.9656920Z Complete job name: integration
integration	UNKNOWN STEP	2025-08-30T07:39:11.0317402Z ##[group]Checking docker version
integration	UNKNOWN STEP	2025-08-30T07:39:11.0330875Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
integration	UNKNOWN STEP	2025-08-30T07:39:12.3008036Z '1.48'
integration	UNKNOWN STEP	2025-08-30T07:39:12.3023943Z Docker daemon API version: '1.48'
integration	UNKNOWN STEP	2025-08-30T07:39:12.3024420Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
integration	UNKNOWN STEP	2025-08-30T07:39:12.3470544Z '1.48'
integration	UNKNOWN STEP	2025-08-30T07:39:12.3483880Z Docker client API version: '1.48'
integration	UNKNOWN STEP	2025-08-30T07:39:12.3489687Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T07:39:12.3492641Z ##[group]Clean up resources from previous jobs
integration	UNKNOWN STEP	2025-08-30T07:39:12.3498043Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=a47f5a"
integration	UNKNOWN STEP	2025-08-30T07:39:12.3686805Z ##[command]/usr/bin/docker network prune --force --filter "label=a47f5a"
integration	UNKNOWN STEP	2025-08-30T07:39:12.3810466Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T07:39:12.3810786Z ##[group]Create local container network
integration	UNKNOWN STEP	2025-08-30T07:39:12.3819851Z ##[command]/usr/bin/docker network create --label a47f5a github_network_141df40d61874ab6aa646b320250e409
integration	UNKNOWN STEP	2025-08-30T07:39:12.4309016Z e8b78ed58dcab2ce929f5310b79f8cb05b16952842e97d31ae3d3b3316491c92
integration	UNKNOWN STEP	2025-08-30T07:39:12.4326525Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T07:39:12.4349868Z ##[group]Starting postgres service container
integration	UNKNOWN STEP	2025-08-30T07:39:12.4368793Z ##[command]/usr/bin/docker pull postgres:15
integration	UNKNOWN STEP	2025-08-30T07:39:13.3536888Z 15: Pulling from library/postgres
integration	UNKNOWN STEP	2025-08-30T07:39:13.5710871Z 396b1da7636e: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T07:39:13.5711264Z fca2566eba32: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T07:39:13.5711600Z 631fe8c6d606: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T07:39:13.5711891Z 77c7671c4414: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T07:39:13.5712344Z 2d9e29180a27: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T07:39:13.5712583Z c6bcc2c9a041: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T07:39:13.5712847Z ac4b721eb66f: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T07:39:13.5713181Z 606bd164980e: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
integration	UNKNOWN STEP	2025-08-30T07:41:26.4556140Z  The database cluster will be initialized with locale "en_US.utf8".
integration	UNKNOWN STEP	2025-08-30T07:41:26.4556845Z  The default database encoding has accordingly been set to "UTF8".
integration	UNKNOWN STEP	2025-08-30T07:41:26.4557523Z  The default text search configuration will be set to "english".
integration	UNKNOWN STEP	2025-08-30T07:41:26.4558082Z  
integration	UNKNOWN STEP	2025-08-30T07:41:26.4558378Z  Data page checksums are disabled.
integration	UNKNOWN STEP	2025-08-30T07:41:26.4558787Z  
integration	UNKNOWN STEP	2025-08-30T07:41:26.4559259Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
integration	UNKNOWN STEP	2025-08-30T07:41:26.4559886Z  creating subdirectories ... ok
integration	UNKNOWN STEP	2025-08-30T07:41:26.4560386Z  selecting dynamic shared memory implementation ... posix
integration	UNKNOWN STEP	2025-08-30T07:41:26.4560942Z  selecting default max_connections ... 100
integration	UNKNOWN STEP	2025-08-30T07:41:26.4561416Z  selecting default shared_buffers ... 128MB
integration	UNKNOWN STEP	2025-08-30T07:41:26.4561871Z  selecting default time zone ... Etc/UTC
integration	UNKNOWN STEP	2025-08-30T07:41:26.4562498Z  creating configuration files ... ok
integration	UNKNOWN STEP	2025-08-30T07:41:26.4562928Z  running bootstrap script ... ok
integration	UNKNOWN STEP	2025-08-30T07:41:26.4563395Z  performing post-bootstrap initialization ... ok
integration	UNKNOWN STEP	2025-08-30T07:41:26.4563871Z  syncing data to disk ... ok
integration	UNKNOWN STEP	2025-08-30T07:41:26.4564238Z  
integration	UNKNOWN STEP	2025-08-30T07:41:26.4564492Z  
integration	UNKNOWN STEP	2025-08-30T07:41:26.4564843Z  Success. You can now start the database server using:
integration	UNKNOWN STEP	2025-08-30T07:41:26.4565317Z  
integration	UNKNOWN STEP	2025-08-30T07:41:26.4565674Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
integration	UNKNOWN STEP	2025-08-30T07:41:26.4566140Z  
integration	UNKNOWN STEP	2025-08-30T07:41:26.4567067Z  waiting for server to start....2025-08-30 07:39:20.946 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
integration	UNKNOWN STEP	2025-08-30T07:41:26.4568372Z  2025-08-30 07:39:20.947 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-08-30T07:41:26.4569215Z  2025-08-30 07:39:20.953 UTC [51] LOG:  database system was shut down at 2025-08-30 07:39:20 UTC
integration	UNKNOWN STEP	2025-08-30T07:41:26.4569980Z  2025-08-30 07:39:20.956 UTC [48] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-08-30T07:41:26.4570531Z   done
integration	UNKNOWN STEP	2025-08-30T07:41:26.4570803Z  server started
integration	UNKNOWN STEP	2025-08-30T07:41:26.4571104Z  CREATE DATABASE
integration	UNKNOWN STEP	2025-08-30T07:41:26.4571395Z  
integration	UNKNOWN STEP	2025-08-30T07:41:26.4571652Z  
integration	UNKNOWN STEP	2025-08-30T07:41:26.4572343Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
integration	UNKNOWN STEP	2025-08-30T07:41:26.4572980Z  
integration	UNKNOWN STEP	2025-08-30T07:41:26.4573366Z  2025-08-30 07:39:21.129 UTC [48] LOG:  received fast shutdown request
integration	UNKNOWN STEP	2025-08-30T07:41:26.4574413Z  waiting for server to shut down....2025-08-30 07:39:21.130 UTC [48] LOG:  aborting any active transactions
integration	UNKNOWN STEP	2025-08-30T07:41:26.4575442Z  2025-08-30 07:39:21.131 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
integration	UNKNOWN STEP	2025-08-30T07:41:26.4576243Z  2025-08-30 07:39:21.132 UTC [49] LOG:  shutting down
integration	UNKNOWN STEP	2025-08-30T07:41:26.4576831Z  2025-08-30 07:39:21.132 UTC [49] LOG:  checkpoint starting: shutdown immediate
integration	UNKNOWN STEP	2025-08-30T07:41:26.4578251Z  2025-08-30 07:39:21.153 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.005 s, total=0.022 s; sync files=301, longest=0.003 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
integration	UNKNOWN STEP	2025-08-30T07:41:26.4579629Z  2025-08-30 07:39:21.160 UTC [48] LOG:  database system is shut down
integration	UNKNOWN STEP	2025-08-30T07:41:26.4580364Z   done
integration	UNKNOWN STEP	2025-08-30T07:41:26.4580651Z  server stopped
integration	UNKNOWN STEP	2025-08-30T07:41:26.4580945Z  
integration	UNKNOWN STEP	2025-08-30T07:41:26.4581323Z  PostgreSQL init process complete; ready for start up.
integration	UNKNOWN STEP	2025-08-30T07:41:26.4581807Z  
integration	UNKNOWN STEP	2025-08-30T07:41:26.4582788Z  2025-08-30 07:39:21.249 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
integration	UNKNOWN STEP	2025-08-30T07:41:26.4583853Z  2025-08-30 07:39:21.249 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
integration	UNKNOWN STEP	2025-08-30T07:41:26.4584554Z  2025-08-30 07:39:21.249 UTC [1] LOG:  listening on IPv6 address "::", port 5432
integration	UNKNOWN STEP	2025-08-30T07:41:26.4585323Z  2025-08-30 07:39:21.251 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-08-30T07:41:26.4586156Z  2025-08-30 07:39:21.256 UTC [64] LOG:  database system was shut down at 2025-08-30 07:39:21 UTC
integration	UNKNOWN STEP	2025-08-30T07:41:26.4586915Z  2025-08-30 07:39:21.260 UTC [1] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-08-30T07:41:26.4594005Z Stop and remove container: 03b6396d48cd4571872fbca92b1a3fea_postgres15_4366d0
integration	UNKNOWN STEP	2025-08-30T07:41:26.4600389Z ##[command]/usr/bin/docker rm --force 538e1c1c2fc12312dcc472de13cd9ffb55ff1044a3a3b12eff2ad42d5814eb0b
integration	UNKNOWN STEP	2025-08-30T07:41:26.6493214Z 538e1c1c2fc12312dcc472de13cd9ffb55ff1044a3a3b12eff2ad42d5814eb0b
integration	UNKNOWN STEP	2025-08-30T07:41:26.6517017Z Remove container network: github_network_141df40d61874ab6aa646b320250e409
integration	UNKNOWN STEP	2025-08-30T07:41:26.6521377Z ##[command]/usr/bin/docker network rm github_network_141df40d61874ab6aa646b320250e409
integration	UNKNOWN STEP	2025-08-30T07:41:26.7624787Z github_network_141df40d61874ab6aa646b320250e409
integration	UNKNOWN STEP	2025-08-30T07:41:26.7683642Z Cleaning up orphan processes
integration	UNKNOWN STEP	2025-08-30T07:41:26.7983345Z Terminate orphan process: pid (2993) (php)
integration	UNKNOWN STEP	2025-08-30T07:41:26.8000203Z Terminate orphan process: pid (2996) (php8.3)
```

</details>

### PR #43
- URL: https://github.com/lomendor/Project-Dixis/pull/43
- Bucket: frontend-tests
- Failing Job: integration
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17341050758/job/49234962801

<details><summary>Head (first 60 lines)</summary>

```
integration	UNKNOWN STEP	﻿2025-08-30T07:28:54.4353812Z Current runner version: '2.328.0'
integration	UNKNOWN STEP	2025-08-30T07:28:54.4376308Z ##[group]Runner Image Provisioner
integration	UNKNOWN STEP	2025-08-30T07:28:54.4377075Z Hosted Compute Agent
integration	UNKNOWN STEP	2025-08-30T07:28:54.4377574Z Version: 20250821.380
integration	UNKNOWN STEP	2025-08-30T07:28:54.4378386Z Commit: 438d12cb4fe092871db9867344e3bc0bc5319035
integration	UNKNOWN STEP	2025-08-30T07:28:54.4379026Z Build Date: 2025-08-21T20:49:43Z
integration	UNKNOWN STEP	2025-08-30T07:28:54.4379761Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T07:28:54.4380361Z ##[group]Operating System
integration	UNKNOWN STEP	2025-08-30T07:28:54.4380915Z Ubuntu
integration	UNKNOWN STEP	2025-08-30T07:28:54.4381349Z 24.04.3
integration	UNKNOWN STEP	2025-08-30T07:28:54.4381852Z LTS
integration	UNKNOWN STEP	2025-08-30T07:28:54.4382291Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T07:28:54.4382739Z ##[group]Runner Image
integration	UNKNOWN STEP	2025-08-30T07:28:54.4383345Z Image: ubuntu-24.04
integration	UNKNOWN STEP	2025-08-30T07:28:54.4383806Z Version: 20250824.1.0
integration	UNKNOWN STEP	2025-08-30T07:28:54.4384775Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250824.1/images/ubuntu/Ubuntu2404-Readme.md
integration	UNKNOWN STEP	2025-08-30T07:28:54.4386332Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250824.1
integration	UNKNOWN STEP	2025-08-30T07:28:54.4387384Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T07:28:54.4388389Z ##[group]GITHUB_TOKEN Permissions
integration	UNKNOWN STEP	2025-08-30T07:28:54.4390483Z Contents: read
integration	UNKNOWN STEP	2025-08-30T07:28:54.4391110Z Metadata: read
integration	UNKNOWN STEP	2025-08-30T07:28:54.4391573Z Packages: read
integration	UNKNOWN STEP	2025-08-30T07:28:54.4392057Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T07:28:54.4394074Z Secret source: Actions
integration	UNKNOWN STEP	2025-08-30T07:28:54.4394771Z Prepare workflow directory
integration	UNKNOWN STEP	2025-08-30T07:28:54.4809587Z Prepare all required actions
integration	UNKNOWN STEP	2025-08-30T07:28:54.4846907Z Getting action download info
integration	UNKNOWN STEP	2025-08-30T07:28:54.8075212Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
integration	UNKNOWN STEP	2025-08-30T07:28:54.8772035Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
integration	UNKNOWN STEP	2025-08-30T07:28:55.0621187Z Download action repository 'actions/cache@v4' (SHA:0400d5f644dc74513175e3cd8d07132dd4860809)
integration	UNKNOWN STEP	2025-08-30T07:28:55.2293346Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
integration	UNKNOWN STEP	2025-08-30T07:28:55.3685181Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
integration	UNKNOWN STEP	2025-08-30T07:28:55.6481920Z Complete job name: integration
integration	UNKNOWN STEP	2025-08-30T07:28:55.7070707Z ##[group]Checking docker version
integration	UNKNOWN STEP	2025-08-30T07:28:55.7083835Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
integration	UNKNOWN STEP	2025-08-30T07:28:57.1292736Z '1.48'
integration	UNKNOWN STEP	2025-08-30T07:28:57.1308543Z Docker daemon API version: '1.48'
integration	UNKNOWN STEP	2025-08-30T07:28:57.1308958Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
integration	UNKNOWN STEP	2025-08-30T07:28:57.1465854Z '1.48'
integration	UNKNOWN STEP	2025-08-30T07:28:57.1478397Z Docker client API version: '1.48'
integration	UNKNOWN STEP	2025-08-30T07:28:57.1484281Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T07:28:57.1486816Z ##[group]Clean up resources from previous jobs
integration	UNKNOWN STEP	2025-08-30T07:28:57.1492115Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=ccf55e"
integration	UNKNOWN STEP	2025-08-30T07:28:57.1623225Z ##[command]/usr/bin/docker network prune --force --filter "label=ccf55e"
integration	UNKNOWN STEP	2025-08-30T07:28:57.1827237Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T07:28:57.1827513Z ##[group]Create local container network
integration	UNKNOWN STEP	2025-08-30T07:28:57.1836673Z ##[command]/usr/bin/docker network create --label ccf55e github_network_0be563bc02684faeb6e268443db1705d
integration	UNKNOWN STEP	2025-08-30T07:28:57.2309843Z af512000b33e37194c6d3a1883c115c1ec679506f73ec57cddda6f76ebc597a2
integration	UNKNOWN STEP	2025-08-30T07:28:57.2326958Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-30T07:28:57.2350623Z ##[group]Starting postgres service container
integration	UNKNOWN STEP	2025-08-30T07:28:57.2369523Z ##[command]/usr/bin/docker pull postgres:15
integration	UNKNOWN STEP	2025-08-30T07:28:57.5218629Z 15: Pulling from library/postgres
integration	UNKNOWN STEP	2025-08-30T07:28:57.5823900Z 396b1da7636e: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T07:28:57.5826253Z fca2566eba32: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T07:28:57.5827432Z 631fe8c6d606: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T07:28:57.5827797Z 77c7671c4414: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T07:28:57.5828149Z 2d9e29180a27: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T07:28:57.5828505Z c6bcc2c9a041: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T07:28:57.5828744Z ac4b721eb66f: Pulling fs layer
integration	UNKNOWN STEP	2025-08-30T07:28:57.5829001Z 606bd164980e: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
integration	UNKNOWN STEP	2025-08-30T07:31:06.4631062Z  The default text search configuration will be set to "english".
integration	UNKNOWN STEP	2025-08-30T07:31:06.4631599Z  
integration	UNKNOWN STEP	2025-08-30T07:31:06.4631873Z  Data page checksums are disabled.
integration	UNKNOWN STEP	2025-08-30T07:31:06.4632126Z  
integration	UNKNOWN STEP	2025-08-30T07:31:06.4632421Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
integration	UNKNOWN STEP	2025-08-30T07:31:06.4632845Z  creating subdirectories ... ok
integration	UNKNOWN STEP	2025-08-30T07:31:06.4633158Z  selecting dynamic shared memory implementation ... posix
integration	UNKNOWN STEP	2025-08-30T07:31:06.4633488Z  selecting default max_connections ... 100
integration	UNKNOWN STEP	2025-08-30T07:31:06.4633766Z  selecting default shared_buffers ... 128MB
integration	UNKNOWN STEP	2025-08-30T07:31:06.4634045Z  selecting default time zone ... Etc/UTC
integration	UNKNOWN STEP	2025-08-30T07:31:06.4634309Z  creating configuration files ... ok
integration	UNKNOWN STEP	2025-08-30T07:31:06.4634567Z  running bootstrap script ... ok
integration	UNKNOWN STEP	2025-08-30T07:31:06.4634849Z  performing post-bootstrap initialization ... ok
integration	UNKNOWN STEP	2025-08-30T07:31:06.4635131Z  syncing data to disk ... ok
integration	UNKNOWN STEP	2025-08-30T07:31:06.4635342Z  
integration	UNKNOWN STEP	2025-08-30T07:31:06.4635493Z  
integration	UNKNOWN STEP	2025-08-30T07:31:06.4635707Z  Success. You can now start the database server using:
integration	UNKNOWN STEP	2025-08-30T07:31:06.4635982Z  
integration	UNKNOWN STEP	2025-08-30T07:31:06.4636203Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
integration	UNKNOWN STEP	2025-08-30T07:31:06.4637378Z  initdb: warning: enabling "trust" authentication for local connections
integration	UNKNOWN STEP	2025-08-30T07:31:06.4638035Z  initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
integration	UNKNOWN STEP	2025-08-30T07:31:06.4638852Z  2025-08-30 07:29:04.899 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
integration	UNKNOWN STEP	2025-08-30T07:31:06.4639740Z  2025-08-30 07:29:04.899 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
integration	UNKNOWN STEP	2025-08-30T07:31:06.4640152Z  2025-08-30 07:29:04.899 UTC [1] LOG:  listening on IPv6 address "::", port 5432
integration	UNKNOWN STEP	2025-08-30T07:31:06.4640596Z  2025-08-30 07:29:04.900 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-08-30T07:31:06.4641082Z  2025-08-30 07:29:04.903 UTC [64] LOG:  database system was shut down at 2025-08-30 07:29:04 UTC
integration	UNKNOWN STEP	2025-08-30T07:31:06.4641522Z  2025-08-30 07:29:04.906 UTC [1] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-08-30T07:31:06.4641845Z  
integration	UNKNOWN STEP	2025-08-30T07:31:06.4642381Z  waiting for server to start....2025-08-30 07:29:04.593 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
integration	UNKNOWN STEP	2025-08-30T07:31:06.4643113Z  2025-08-30 07:29:04.593 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-08-30T07:31:06.4643903Z  2025-08-30 07:29:04.596 UTC [51] LOG:  database system was shut down at 2025-08-30 07:29:04 UTC
integration	UNKNOWN STEP	2025-08-30T07:31:06.4644848Z  2025-08-30 07:29:04.600 UTC [48] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-08-30T07:31:06.4645358Z   done
integration	UNKNOWN STEP	2025-08-30T07:31:06.4645532Z  server started
integration	UNKNOWN STEP	2025-08-30T07:31:06.4645718Z  CREATE DATABASE
integration	UNKNOWN STEP	2025-08-30T07:31:06.4645903Z  
integration	UNKNOWN STEP	2025-08-30T07:31:06.4646055Z  
integration	UNKNOWN STEP	2025-08-30T07:31:06.4646359Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
integration	UNKNOWN STEP	2025-08-30T07:31:06.4646722Z  
integration	UNKNOWN STEP	2025-08-30T07:31:06.4646949Z  2025-08-30 07:29:04.779 UTC [48] LOG:  received fast shutdown request
integration	UNKNOWN STEP	2025-08-30T07:31:06.4647618Z  waiting for server to shut down....2025-08-30 07:29:04.780 UTC [48] LOG:  aborting any active transactions
integration	UNKNOWN STEP	2025-08-30T07:31:06.4648221Z  2025-08-30 07:29:04.782 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
integration	UNKNOWN STEP	2025-08-30T07:31:06.4648684Z  2025-08-30 07:29:04.783 UTC [49] LOG:  shutting down
integration	UNKNOWN STEP	2025-08-30T07:31:06.4649241Z  2025-08-30 07:29:04.783 UTC [49] LOG:  checkpoint starting: shutdown immediate
integration	UNKNOWN STEP	2025-08-30T07:31:06.4650109Z  2025-08-30 07:29:04.799 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.002 s, total=0.017 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
integration	UNKNOWN STEP	2025-08-30T07:31:06.4650914Z  2025-08-30 07:29:04.806 UTC [48] LOG:  database system is shut down
integration	UNKNOWN STEP	2025-08-30T07:31:06.4651204Z   done
integration	UNKNOWN STEP	2025-08-30T07:31:06.4651374Z  server stopped
integration	UNKNOWN STEP	2025-08-30T07:31:06.4651560Z  
integration	UNKNOWN STEP	2025-08-30T07:31:06.4651780Z  PostgreSQL init process complete; ready for start up.
integration	UNKNOWN STEP	2025-08-30T07:31:06.4652059Z  
integration	UNKNOWN STEP	2025-08-30T07:31:06.4657383Z Stop and remove container: 37427a64c44d43e98b27b6662f5c1956_postgres15_2ccff0
integration	UNKNOWN STEP	2025-08-30T07:31:06.4662239Z ##[command]/usr/bin/docker rm --force dfdd82605d7c22d61cd697c12378611d6edfc22c1a172227f94b408f437c6e3a
integration	UNKNOWN STEP	2025-08-30T07:31:06.6125956Z dfdd82605d7c22d61cd697c12378611d6edfc22c1a172227f94b408f437c6e3a
integration	UNKNOWN STEP	2025-08-30T07:31:06.6151845Z Remove container network: github_network_0be563bc02684faeb6e268443db1705d
integration	UNKNOWN STEP	2025-08-30T07:31:06.6156679Z ##[command]/usr/bin/docker network rm github_network_0be563bc02684faeb6e268443db1705d
integration	UNKNOWN STEP	2025-08-30T07:31:06.7524879Z github_network_0be563bc02684faeb6e268443db1705d
integration	UNKNOWN STEP	2025-08-30T07:31:06.7567342Z Cleaning up orphan processes
integration	UNKNOWN STEP	2025-08-30T07:31:06.7885312Z Terminate orphan process: pid (2856) (php)
integration	UNKNOWN STEP	2025-08-30T07:31:06.7903405Z Terminate orphan process: pid (2859) (php8.3)
```

</details>

### PR #39
- URL: https://github.com/lomendor/Project-Dixis/pull/39
- Bucket: frontend-tests
- Failing Job: integration
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17334572105/job/49218075278

<details><summary>Head (first 60 lines)</summary>

```
integration	UNKNOWN STEP	﻿2025-08-29T21:23:34.0305554Z Current runner version: '2.328.0'
integration	UNKNOWN STEP	2025-08-29T21:23:34.0329003Z ##[group]Runner Image Provisioner
integration	UNKNOWN STEP	2025-08-29T21:23:34.0329987Z Hosted Compute Agent
integration	UNKNOWN STEP	2025-08-29T21:23:34.0330493Z Version: 20250829.383
integration	UNKNOWN STEP	2025-08-29T21:23:34.0331136Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
integration	UNKNOWN STEP	2025-08-29T21:23:34.0331802Z Build Date: 2025-08-29T13:48:48Z
integration	UNKNOWN STEP	2025-08-29T21:23:34.0332376Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-29T21:23:34.0332874Z ##[group]Operating System
integration	UNKNOWN STEP	2025-08-29T21:23:34.0333500Z Ubuntu
integration	UNKNOWN STEP	2025-08-29T21:23:34.0333938Z 24.04.3
integration	UNKNOWN STEP	2025-08-29T21:23:34.0334395Z LTS
integration	UNKNOWN STEP	2025-08-29T21:23:34.0334934Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-29T21:23:34.0335431Z ##[group]Runner Image
integration	UNKNOWN STEP	2025-08-29T21:23:34.0335984Z Image: ubuntu-24.04
integration	UNKNOWN STEP	2025-08-29T21:23:34.0336508Z Version: 20250824.1.0
integration	UNKNOWN STEP	2025-08-29T21:23:34.0337504Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250824.1/images/ubuntu/Ubuntu2404-Readme.md
integration	UNKNOWN STEP	2025-08-29T21:23:34.0339050Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250824.1
integration	UNKNOWN STEP	2025-08-29T21:23:34.0340136Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-29T21:23:34.0341251Z ##[group]GITHUB_TOKEN Permissions
integration	UNKNOWN STEP	2025-08-29T21:23:34.0343019Z Contents: read
integration	UNKNOWN STEP	2025-08-29T21:23:34.0343549Z Metadata: read
integration	UNKNOWN STEP	2025-08-29T21:23:34.0344076Z Packages: read
integration	UNKNOWN STEP	2025-08-29T21:23:34.0344578Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-29T21:23:34.0346561Z Secret source: Actions
integration	UNKNOWN STEP	2025-08-29T21:23:34.0347314Z Prepare workflow directory
integration	UNKNOWN STEP	2025-08-29T21:23:34.0782645Z Prepare all required actions
integration	UNKNOWN STEP	2025-08-29T21:23:34.0841995Z Getting action download info
integration	UNKNOWN STEP	2025-08-29T21:23:34.5754985Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
integration	UNKNOWN STEP	2025-08-29T21:23:34.6411281Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
integration	UNKNOWN STEP	2025-08-29T21:23:35.1621842Z Download action repository 'actions/cache@v4' (SHA:0400d5f644dc74513175e3cd8d07132dd4860809)
integration	UNKNOWN STEP	2025-08-29T21:23:35.2588870Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
integration	UNKNOWN STEP	2025-08-29T21:23:35.3753195Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
integration	UNKNOWN STEP	2025-08-29T21:23:35.5970263Z Complete job name: integration
integration	UNKNOWN STEP	2025-08-29T21:23:35.6597017Z ##[group]Checking docker version
integration	UNKNOWN STEP	2025-08-29T21:23:35.6610702Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
integration	UNKNOWN STEP	2025-08-29T21:23:35.7434080Z '1.48'
integration	UNKNOWN STEP	2025-08-29T21:23:35.7446377Z Docker daemon API version: '1.48'
integration	UNKNOWN STEP	2025-08-29T21:23:35.7447862Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
integration	UNKNOWN STEP	2025-08-29T21:23:35.7617245Z '1.48'
integration	UNKNOWN STEP	2025-08-29T21:23:35.7631610Z Docker client API version: '1.48'
integration	UNKNOWN STEP	2025-08-29T21:23:35.7638208Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-29T21:23:35.7641899Z ##[group]Clean up resources from previous jobs
integration	UNKNOWN STEP	2025-08-29T21:23:35.7647670Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=12c036"
integration	UNKNOWN STEP	2025-08-29T21:23:35.7789558Z ##[command]/usr/bin/docker network prune --force --filter "label=12c036"
integration	UNKNOWN STEP	2025-08-29T21:23:35.7921208Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-29T21:23:35.7922084Z ##[group]Create local container network
integration	UNKNOWN STEP	2025-08-29T21:23:35.7933270Z ##[command]/usr/bin/docker network create --label 12c036 github_network_ca05e8b40846449289d146d5eea80a7a
integration	UNKNOWN STEP	2025-08-29T21:23:35.8440479Z 2c529694de4a84905b92656e062d71c721aed8867d274f6abb6c828965bbeced
integration	UNKNOWN STEP	2025-08-29T21:23:35.8460564Z ##[endgroup]
integration	UNKNOWN STEP	2025-08-29T21:23:35.8486507Z ##[group]Starting postgres service container
integration	UNKNOWN STEP	2025-08-29T21:23:35.8506525Z ##[command]/usr/bin/docker pull postgres:15
integration	UNKNOWN STEP	2025-08-29T21:23:36.8314665Z 15: Pulling from library/postgres
integration	UNKNOWN STEP	2025-08-29T21:23:37.0816586Z 396b1da7636e: Pulling fs layer
integration	UNKNOWN STEP	2025-08-29T21:23:37.0818941Z fca2566eba32: Pulling fs layer
integration	UNKNOWN STEP	2025-08-29T21:23:37.0820573Z 631fe8c6d606: Pulling fs layer
integration	UNKNOWN STEP	2025-08-29T21:23:37.0822379Z 77c7671c4414: Pulling fs layer
integration	UNKNOWN STEP	2025-08-29T21:23:37.0823299Z 2d9e29180a27: Pulling fs layer
integration	UNKNOWN STEP	2025-08-29T21:23:37.0824208Z c6bcc2c9a041: Pulling fs layer
integration	UNKNOWN STEP	2025-08-29T21:23:37.0825159Z ac4b721eb66f: Pulling fs layer
integration	UNKNOWN STEP	2025-08-29T21:23:37.0826042Z 606bd164980e: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
integration	UNKNOWN STEP	2025-08-29T21:32:47.9644334Z  
integration	UNKNOWN STEP	2025-08-29T21:32:47.9644625Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
integration	UNKNOWN STEP	2025-08-29T21:32:47.9645005Z  creating subdirectories ... ok
integration	UNKNOWN STEP	2025-08-29T21:32:47.9645312Z  selecting dynamic shared memory implementation ... posix
integration	UNKNOWN STEP	2025-08-29T21:32:47.9645664Z  selecting default max_connections ... 100
integration	UNKNOWN STEP	2025-08-29T21:32:47.9645955Z  selecting default shared_buffers ... 128MB
integration	UNKNOWN STEP	2025-08-29T21:32:47.9646233Z  selecting default time zone ... Etc/UTC
integration	UNKNOWN STEP	2025-08-29T21:32:47.9646508Z  creating configuration files ... ok
integration	UNKNOWN STEP	2025-08-29T21:32:47.9646775Z  running bootstrap script ... ok
integration	UNKNOWN STEP	2025-08-29T21:32:47.9647107Z  performing post-bootstrap initialization ... ok
integration	UNKNOWN STEP	2025-08-29T21:32:47.9647411Z  syncing data to disk ... ok
integration	UNKNOWN STEP	2025-08-29T21:32:47.9647639Z  
integration	UNKNOWN STEP	2025-08-29T21:32:47.9647803Z  
integration	UNKNOWN STEP	2025-08-29T21:32:47.9648030Z  Success. You can now start the database server using:
integration	UNKNOWN STEP	2025-08-29T21:32:47.9648317Z  
integration	UNKNOWN STEP	2025-08-29T21:32:47.9648543Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
integration	UNKNOWN STEP	2025-08-29T21:32:47.9648834Z  
integration	UNKNOWN STEP	2025-08-29T21:32:47.9649578Z  waiting for server to start....2025-08-29 21:23:43.767 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
integration	UNKNOWN STEP	2025-08-29T21:32:47.9650489Z  2025-08-29 21:23:43.767 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-08-29T21:32:47.9651150Z  2025-08-29 21:23:43.770 UTC [51] LOG:  database system was shut down at 2025-08-29 21:23:43 UTC
integration	UNKNOWN STEP	2025-08-29T21:32:47.9651959Z  2025-08-29 21:23:43.774 UTC [48] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-08-29T21:32:47.9652462Z   done
integration	UNKNOWN STEP	2025-08-29T21:32:47.9652751Z  server started
integration	UNKNOWN STEP	2025-08-29T21:32:47.9652964Z  CREATE DATABASE
integration	UNKNOWN STEP	2025-08-29T21:32:47.9653154Z  
integration	UNKNOWN STEP	2025-08-29T21:32:47.9653312Z  
integration	UNKNOWN STEP	2025-08-29T21:32:47.9653643Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
integration	UNKNOWN STEP	2025-08-29T21:32:47.9654024Z  
integration	UNKNOWN STEP	2025-08-29T21:32:47.9654268Z  2025-08-29 21:23:43.954 UTC [48] LOG:  received fast shutdown request
integration	UNKNOWN STEP	2025-08-29T21:32:47.9654740Z  waiting for server to shut down....2025-08-29 21:23:43.954 UTC [48] LOG:  aborting any active transactions
integration	UNKNOWN STEP	2025-08-29T21:32:47.9655342Z  2025-08-29 21:23:43.956 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
integration	UNKNOWN STEP	2025-08-29T21:32:47.9655820Z  2025-08-29 21:23:43.956 UTC [49] LOG:  shutting down
integration	UNKNOWN STEP	2025-08-29T21:32:47.9656179Z  2025-08-29 21:23:43.957 UTC [49] LOG:  checkpoint starting: shutdown immediate
integration	UNKNOWN STEP	2025-08-29T21:32:47.9657016Z  2025-08-29 21:23:43.976 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.015 s, sync=0.002 s, total=0.020 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
integration	UNKNOWN STEP	2025-08-29T21:32:47.9658106Z  2025-08-29 21:23:43.982 UTC [48] LOG:  database system is shut down
integration	UNKNOWN STEP	2025-08-29T21:32:47.9658586Z   done
integration	UNKNOWN STEP	2025-08-29T21:32:47.9658769Z  server stopped
integration	UNKNOWN STEP	2025-08-29T21:32:47.9658959Z  
integration	UNKNOWN STEP	2025-08-29T21:32:47.9659194Z  PostgreSQL init process complete; ready for start up.
integration	UNKNOWN STEP	2025-08-29T21:32:47.9659732Z  
integration	UNKNOWN STEP	2025-08-29T21:32:47.9660231Z  2025-08-29 21:23:44.073 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
integration	UNKNOWN STEP	2025-08-29T21:32:47.9660847Z  2025-08-29 21:23:44.073 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
integration	UNKNOWN STEP	2025-08-29T21:32:47.9661270Z  2025-08-29 21:23:44.074 UTC [1] LOG:  listening on IPv6 address "::", port 5432
integration	UNKNOWN STEP	2025-08-29T21:32:47.9661733Z  2025-08-29 21:23:44.076 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-08-29T21:32:47.9662229Z  2025-08-29 21:23:44.079 UTC [64] LOG:  database system was shut down at 2025-08-29 21:23:43 UTC
integration	UNKNOWN STEP	2025-08-29T21:32:47.9662675Z  2025-08-29 21:23:44.083 UTC [1] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-08-29T21:32:47.9663079Z  2025-08-29 21:28:44.179 UTC [62] LOG:  checkpoint starting: time
integration	UNKNOWN STEP	2025-08-29T21:32:47.9663867Z  2025-08-29 21:29:14.449 UTC [62] LOG:  checkpoint complete: wrote 305 buffers (1.9%); 0 WAL file(s) added, 0 removed, 0 recycled; write=30.266 s, sync=0.002 s, total=30.270 s; sync files=197, longest=0.001 s, average=0.001 s; distance=1389 kB, estimate=1389 kB
integration	UNKNOWN STEP	2025-08-29T21:32:47.9670119Z Stop and remove container: 913f9861f0df421caf443b2dcb4c7714_postgres15_f437f4
integration	UNKNOWN STEP	2025-08-29T21:32:47.9674695Z ##[command]/usr/bin/docker rm --force 7deb4604b3e2b95370d8ddfe86952313b54889b27295a76e55f056968b0bb1d1
integration	UNKNOWN STEP	2025-08-29T21:32:48.1144162Z 7deb4604b3e2b95370d8ddfe86952313b54889b27295a76e55f056968b0bb1d1
integration	UNKNOWN STEP	2025-08-29T21:32:48.1177780Z Remove container network: github_network_ca05e8b40846449289d146d5eea80a7a
integration	UNKNOWN STEP	2025-08-29T21:32:48.1182813Z ##[command]/usr/bin/docker network rm github_network_ca05e8b40846449289d146d5eea80a7a
integration	UNKNOWN STEP	2025-08-29T21:32:48.2175134Z github_network_ca05e8b40846449289d146d5eea80a7a
integration	UNKNOWN STEP	2025-08-29T21:32:48.2234129Z Cleaning up orphan processes
integration	UNKNOWN STEP	2025-08-29T21:32:48.2448110Z Terminate orphan process: pid (2875) (php)
integration	UNKNOWN STEP	2025-08-29T21:32:48.2465421Z Terminate orphan process: pid (2878) (php8.3)
integration	UNKNOWN STEP	2025-08-29T21:32:48.2565071Z Terminate orphan process: pid (5676) (npm run start -p 3001)
integration	UNKNOWN STEP	2025-08-29T21:32:48.2588869Z Terminate orphan process: pid (5692) (sh)
integration	UNKNOWN STEP	2025-08-29T21:32:48.2614244Z Terminate orphan process: pid (5693) (next-server (v15.5.0))
```

</details>

### PR #38
- URL: https://github.com/lomendor/Project-Dixis/pull/38
- Bucket: frontend-tests
- Failing Job: e2e-tests
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17334529982/job/49217953528

<details><summary>Head (first 60 lines)</summary>

```
e2e-tests	UNKNOWN STEP	﻿2025-08-29T21:21:00.8893749Z Current runner version: '2.328.0'
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8917779Z ##[group]Runner Image Provisioner
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8918623Z Hosted Compute Agent
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8919182Z Version: 20250821.380
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8919885Z Commit: 438d12cb4fe092871db9867344e3bc0bc5319035
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8920569Z Build Date: 2025-08-21T20:49:43Z
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8921179Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8921698Z ##[group]Operating System
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8922359Z Ubuntu
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8922970Z 24.04.3
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8923472Z LTS
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8923991Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8924505Z ##[group]Runner Image
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8925096Z Image: ubuntu-24.04
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8925663Z Version: 20250824.1.0
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8926694Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250824.1/images/ubuntu/Ubuntu2404-Readme.md
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8928269Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250824.1
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8929243Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8930382Z ##[group]GITHUB_TOKEN Permissions
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8932532Z Contents: read
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8933396Z Metadata: read
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8933957Z Packages: read
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8934489Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8936785Z Secret source: Actions
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.8937836Z Prepare workflow directory
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.9389174Z Prepare all required actions
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:00.9427074Z Getting action download info
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:01.3688338Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:01.5509172Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:01.6461528Z Download action repository 'actions/cache@v4' (SHA:0400d5f644dc74513175e3cd8d07132dd4860809)
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:01.7445111Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.2295791Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.5143447Z Complete job name: e2e-tests
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.5772174Z ##[group]Checking docker version
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.5785900Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.6753893Z '1.48'
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.6766739Z Docker daemon API version: '1.48'
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.6768120Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.6933447Z '1.48'
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.6947592Z Docker client API version: '1.48'
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.6955322Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.6960932Z ##[group]Clean up resources from previous jobs
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.6966915Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=3851e7"
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.7108028Z ##[command]/usr/bin/docker network prune --force --filter "label=3851e7"
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.7237283Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.7238120Z ##[group]Create local container network
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.7249297Z ##[command]/usr/bin/docker network create --label 3851e7 github_network_4d29897eb6314f98a81666e6b21a418b
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.7751559Z 722c432adb48f27fa93ffd2296de8d2a86cc1ed404aa69636aaee339ded94e06
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.7771109Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.7796986Z ##[group]Starting postgres service container
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:02.7817070Z ##[command]/usr/bin/docker pull postgres:15
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:03.3804760Z 15: Pulling from library/postgres
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:03.5307625Z 396b1da7636e: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:03.5308893Z fca2566eba32: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:03.5309806Z 631fe8c6d606: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:03.5310678Z 77c7671c4414: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:03.5311558Z 2d9e29180a27: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:03.5312453Z c6bcc2c9a041: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:03.5313556Z ac4b721eb66f: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T21:21:03.5314419Z 606bd164980e: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9651850Z  2025-08-29 21:21:12.164 UTC [1] LOG:  database system is ready to accept connections
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9652489Z  This user must also own the server process.
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9653469Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9653920Z  The database cluster will be initialized with locale "en_US.utf8".
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9654620Z  The default database encoding has accordingly been set to "UTF8".
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9655292Z  The default text search configuration will be set to "english".
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9655821Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9656135Z  Data page checksums are disabled.
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9656540Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9657012Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9657643Z  creating subdirectories ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9658160Z  selecting dynamic shared memory implementation ... posix
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9658721Z  selecting default max_connections ... 100
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9659206Z  selecting default shared_buffers ... 128MB
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9659679Z  selecting default time zone ... Etc/UTC
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9660138Z  creating configuration files ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9660586Z  running bootstrap script ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9661073Z  performing post-bootstrap initialization ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9661584Z  syncing data to disk ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9661958Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9662225Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9662586Z  Success. You can now start the database server using:
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9663234Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9663801Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9664302Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9665254Z  waiting for server to start....2025-08-29 21:21:11.850 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9666091Z  2025-08-29 21:21:11.851 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9666614Z  2025-08-29 21:21:11.854 UTC [51] LOG:  database system was shut down at 2025-08-29 21:21:11 UTC
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9667072Z  2025-08-29 21:21:11.858 UTC [48] LOG:  database system is ready to accept connections
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9667417Z   done
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9667589Z  server started
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9667778Z  CREATE DATABASE
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9667960Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9668117Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9668431Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9668813Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9669133Z  waiting for server to shut down....2025-08-29 21:21:12.036 UTC [48] LOG:  received fast shutdown request
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9669848Z  2025-08-29 21:21:12.037 UTC [48] LOG:  aborting any active transactions
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9670377Z  2025-08-29 21:21:12.040 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9670859Z  2025-08-29 21:21:12.040 UTC [49] LOG:  shutting down
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9671217Z  2025-08-29 21:21:12.041 UTC [49] LOG:  checkpoint starting: shutdown immediate
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9672054Z  2025-08-29 21:21:12.059 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.013 s, sync=0.003 s, total=0.020 s; sync files=301, longest=0.002 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9673142Z  2025-08-29 21:21:12.067 UTC [48] LOG:  database system is shut down
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9673449Z   done
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9673632Z  server stopped
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9673814Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9674048Z  PostgreSQL init process complete; ready for start up.
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9674340Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9680039Z Stop and remove container: 27ddf273496c49a881c166ecb8c22eab_postgres15_201819
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:55.9685865Z ##[command]/usr/bin/docker rm --force ddf1cbe9f493f26080233034485e86d0b675c61b87ef68bb87183b05faf879a8
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:56.1006937Z ddf1cbe9f493f26080233034485e86d0b675c61b87ef68bb87183b05faf879a8
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:56.1038842Z Remove container network: github_network_4d29897eb6314f98a81666e6b21a418b
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:56.1043981Z ##[command]/usr/bin/docker network rm github_network_4d29897eb6314f98a81666e6b21a418b
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:56.2099038Z github_network_4d29897eb6314f98a81666e6b21a418b
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:56.2156543Z Cleaning up orphan processes
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:56.2462691Z Terminate orphan process: pid (2948) (php)
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:56.2496977Z Terminate orphan process: pid (2951) (php8.3)
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:56.2611876Z Terminate orphan process: pid (5631) (npm run start -p 3001)
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:56.2648946Z Terminate orphan process: pid (5647) (sh)
e2e-tests	UNKNOWN STEP	2025-08-29T21:25:56.2673271Z Terminate orphan process: pid (5648) (next-server (v15.5.0))
```

</details>

### PR #37
- URL: https://github.com/lomendor/Project-Dixis/pull/37
- Bucket: frontend-tests
- Failing Job: e2e-tests
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17334329965/job/49217377670

<details><summary>Head (first 60 lines)</summary>

```
e2e-tests	UNKNOWN STEP	﻿2025-08-29T21:09:58.1400220Z Current runner version: '2.328.0'
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1425847Z ##[group]Runner Image Provisioner
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1426620Z Hosted Compute Agent
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1427331Z Version: 20250821.380
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1427926Z Commit: 438d12cb4fe092871db9867344e3bc0bc5319035
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1428555Z Build Date: 2025-08-21T20:49:43Z
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1429227Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1429750Z ##[group]Operating System
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1430296Z Ubuntu
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1430815Z 24.04.3
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1431280Z LTS
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1431771Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1432342Z ##[group]Runner Image
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1433424Z Image: ubuntu-24.04
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1433907Z Version: 20250824.1.0
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1434977Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250824.1/images/ubuntu/Ubuntu2404-Readme.md
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1436473Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250824.1
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1437491Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1438567Z ##[group]GITHUB_TOKEN Permissions
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1440467Z Contents: read
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1441029Z Metadata: read
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1441492Z Packages: read
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1442033Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1444383Z Secret source: Actions
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1445082Z Prepare workflow directory
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1909870Z Prepare all required actions
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.1947972Z Getting action download info
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:58.6627468Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:59.1229557Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:59.2772526Z Download action repository 'actions/cache@v4' (SHA:0400d5f644dc74513175e3cd8d07132dd4860809)
e2e-tests	UNKNOWN STEP	2025-08-29T21:09:59.4228317Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:00.1007625Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:00.3852237Z Complete job name: e2e-tests
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:00.4477971Z ##[group]Checking docker version
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:00.4492002Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.4820587Z '1.48'
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.4835243Z Docker daemon API version: '1.48'
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.4835722Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.5028647Z '1.48'
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.5041741Z Docker client API version: '1.48'
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.5047367Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.5050181Z ##[group]Clean up resources from previous jobs
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.5055878Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=feead9"
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.5279567Z ##[command]/usr/bin/docker network prune --force --filter "label=feead9"
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.5403745Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.5404074Z ##[group]Create local container network
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.5413393Z ##[command]/usr/bin/docker network create --label feead9 github_network_5bc5648f8ef34455a3cb8c626265006a
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.5980954Z 10e8776225c1089cd7f0b3b5eb71ff23c08548f69170dacc33ec4ebdb1671875
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.6001213Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.6025053Z ##[group]Starting postgres service container
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:01.6044254Z ##[command]/usr/bin/docker pull postgres:15
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:02.4685876Z 15: Pulling from library/postgres
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:02.6770307Z 396b1da7636e: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:02.6770804Z fca2566eba32: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:02.6771181Z 631fe8c6d606: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:02.6771593Z 77c7671c4414: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:02.6771969Z 2d9e29180a27: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:02.6773132Z c6bcc2c9a041: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:02.6773650Z ac4b721eb66f: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T21:10:02.6774050Z 606bd164980e: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5320905Z  2025-08-29 21:10:10.801 UTC [64] LOG:  database system was shut down at 2025-08-29 21:10:10 UTC
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5321681Z  2025-08-29 21:10:10.805 UTC [1] LOG:  database system is ready to accept connections
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5322272Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5322736Z  The database cluster will be initialized with locale "en_US.utf8".
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5323709Z  The default database encoding has accordingly been set to "UTF8".
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5324439Z  The default text search configuration will be set to "english".
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5324995Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5325309Z  Data page checksums are disabled.
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5325712Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5326217Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5326822Z  creating subdirectories ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5327288Z  selecting dynamic shared memory implementation ... posix
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5327828Z  selecting default max_connections ... 100
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5328304Z  selecting default shared_buffers ... 128MB
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5328787Z  selecting default time zone ... Etc/UTC
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5329261Z  creating configuration files ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5329720Z  running bootstrap script ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5330262Z  performing post-bootstrap initialization ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5330770Z  syncing data to disk ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5331632Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5331919Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5332298Z  Success. You can now start the database server using:
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5332756Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5333307Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5333786Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5334464Z  waiting for server to start....2025-08-29 21:10:10.485 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5335234Z  2025-08-29 21:10:10.486 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5335737Z  2025-08-29 21:10:10.494 UTC [51] LOG:  database system was shut down at 2025-08-29 21:10:10 UTC
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5336216Z  2025-08-29 21:10:10.499 UTC [48] LOG:  database system is ready to accept connections
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5336551Z   done
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5336727Z  server started
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5337146Z  CREATE DATABASE
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5337337Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5337504Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5337814Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5338190Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5338434Z  2025-08-29 21:10:10.672 UTC [48] LOG:  received fast shutdown request
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5339066Z  waiting for server to shut down....2025-08-29 21:10:10.673 UTC [48] LOG:  aborting any active transactions
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5339705Z  2025-08-29 21:10:10.675 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5340185Z  2025-08-29 21:10:10.675 UTC [49] LOG:  shutting down
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5340546Z  2025-08-29 21:10:10.676 UTC [49] LOG:  checkpoint starting: shutdown immediate
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5341378Z  2025-08-29 21:10:10.699 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.004 s, total=0.024 s; sync files=301, longest=0.002 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5342187Z  2025-08-29 21:10:10.705 UTC [48] LOG:  database system is shut down
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5342480Z   done
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5342651Z  server stopped
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5343045Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5343280Z  PostgreSQL init process complete; ready for start up.
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5343571Z  
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5348732Z Stop and remove container: 9c12f761eda14ab08f68aefbe1bf9abb_postgres15_3af952
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.5353249Z ##[command]/usr/bin/docker rm --force c681611b5d551555a86fafed2363d17fb15179e9203a57718f742b6ccb8acd97
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.6743515Z c681611b5d551555a86fafed2363d17fb15179e9203a57718f742b6ccb8acd97
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.6771530Z Remove container network: github_network_5bc5648f8ef34455a3cb8c626265006a
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.6776389Z ##[command]/usr/bin/docker network rm github_network_5bc5648f8ef34455a3cb8c626265006a
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.7976955Z github_network_5bc5648f8ef34455a3cb8c626265006a
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.8033345Z Cleaning up orphan processes
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.8350149Z Terminate orphan process: pid (3215) (php)
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.8367657Z Terminate orphan process: pid (3218) (php8.3)
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.8515948Z Terminate orphan process: pid (5931) (npm run start -p 3001)
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.8543577Z Terminate orphan process: pid (5947) (sh)
e2e-tests	UNKNOWN STEP	2025-08-29T21:13:56.8566721Z Terminate orphan process: pid (5948) (next-server (v15.5.0))
```

</details>

### PR #36
- URL: https://github.com/lomendor/Project-Dixis/pull/36
- Bucket: frontend-tests
- Failing Job: e2e-tests
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17333297717/job/49214150207

<details><summary>Head (first 60 lines)</summary>

```
e2e-tests	UNKNOWN STEP	﻿2025-08-29T20:10:51.1397175Z Current runner version: '2.328.0'
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1421268Z ##[group]Runner Image Provisioner
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1422101Z Hosted Compute Agent
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1422749Z Version: 20250821.380
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1423325Z Commit: 438d12cb4fe092871db9867344e3bc0bc5319035
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1424020Z Build Date: 2025-08-21T20:49:43Z
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1424621Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1425197Z ##[group]Operating System
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1425721Z Ubuntu
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1426231Z 24.04.3
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1426684Z LTS
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1427148Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1427684Z ##[group]Runner Image
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1428231Z Image: ubuntu-24.04
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1429122Z Version: 20250824.1.0
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1430099Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250824.1/images/ubuntu/Ubuntu2404-Readme.md
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1431726Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250824.1
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1432724Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1433829Z ##[group]GITHUB_TOKEN Permissions
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1435628Z Contents: read
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1436250Z Metadata: read
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1436762Z Packages: read
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1437215Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1439647Z Secret source: Actions
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1440328Z Prepare workflow directory
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1937684Z Prepare all required actions
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.1975270Z Getting action download info
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.6191744Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.8288000Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:51.9271424Z Download action repository 'actions/cache@v4' (SHA:0400d5f644dc74513175e3cd8d07132dd4860809)
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:52.0267768Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:52.7547717Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:52.9709851Z Complete job name: e2e-tests
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.0294667Z ##[group]Checking docker version
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.0307956Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.1428117Z '1.48'
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.1441984Z Docker daemon API version: '1.48'
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.1443016Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.1605621Z '1.48'
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.1618265Z Docker client API version: '1.48'
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.1623993Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.1626926Z ##[group]Clean up resources from previous jobs
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.1633994Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=087114"
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.1773933Z ##[command]/usr/bin/docker network prune --force --filter "label=087114"
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.1916550Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.1917113Z ##[group]Create local container network
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.1927827Z ##[command]/usr/bin/docker network create --label 087114 github_network_bf61517470884dd3b88af3876d46b18b
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.2515605Z c243e39c3d829a4abc2cd4bf903246a2ce5e3650296816f50bd8cf95a7017ceb
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.2535374Z ##[endgroup]
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.2559866Z ##[group]Starting postgres service container
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:53.2581823Z ##[command]/usr/bin/docker pull postgres:15
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:54.1296957Z 15: Pulling from library/postgres
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:54.3469369Z 396b1da7636e: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:54.3472823Z fca2566eba32: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:54.3476162Z 631fe8c6d606: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:54.3477564Z 77c7671c4414: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:54.3478635Z 2d9e29180a27: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:54.3479687Z c6bcc2c9a041: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:54.3480474Z ac4b721eb66f: Pulling fs layer
e2e-tests	UNKNOWN STEP	2025-08-29T20:10:54.3481230Z 606bd164980e: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7677015Z  
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7677321Z  Data page checksums are disabled.
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7677715Z  
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7678176Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7678979Z  creating subdirectories ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7679486Z  selecting dynamic shared memory implementation ... posix
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7680039Z  selecting default max_connections ... 100
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7680500Z  selecting default shared_buffers ... 128MB
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7680956Z  selecting default time zone ... Etc/UTC
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7681397Z  creating configuration files ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7681817Z  running bootstrap script ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7682267Z  performing post-bootstrap initialization ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7682739Z  syncing data to disk ... ok
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7683104Z  
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7683370Z  
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7683728Z  Success. You can now start the database server using:
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7684188Z  
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7684537Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7684991Z  
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7685895Z  waiting for server to start....2025-08-29 20:11:01.524 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7687176Z  2025-08-29 20:11:01.525 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7687955Z  2025-08-29 20:11:01.529 UTC [51] LOG:  database system was shut down at 2025-08-29 20:11:01 UTC
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7688844Z  2025-08-29 20:11:01.533 UTC [48] LOG:  database system is ready to accept connections
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7689406Z   done
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7689691Z  server started
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7690007Z  CREATE DATABASE
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7690326Z  
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7690590Z  
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7691086Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7691897Z  
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7692309Z  2025-08-29 20:11:01.713 UTC [48] LOG:  received fast shutdown request
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7692953Z  waiting for server to shut down....2025-08-29 20:11:01.714 UTC [48] LOG:  aborting any active transactions
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7693710Z  2025-08-29 20:11:01.833 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7694338Z  2025-08-29 20:11:01.833 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7694752Z  2025-08-29 20:11:01.833 UTC [1] LOG:  listening on IPv6 address "::", port 5432
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7695209Z  2025-08-29 20:11:01.835 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7695698Z  2025-08-29 20:11:01.838 UTC [64] LOG:  database system was shut down at 2025-08-29 20:11:01 UTC
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7696542Z  2025-08-29 20:11:01.842 UTC [1] LOG:  database system is ready to accept connections
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7697082Z  2025-08-29 20:11:01.715 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7697548Z  2025-08-29 20:11:01.716 UTC [49] LOG:  shutting down
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7697895Z  2025-08-29 20:11:01.717 UTC [49] LOG:  checkpoint starting: shutdown immediate
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7698889Z  2025-08-29 20:11:01.737 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.016 s, sync=0.002 s, total=0.021 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7699722Z  2025-08-29 20:11:01.743 UTC [48] LOG:  database system is shut down
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7700020Z   done
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7700193Z  server stopped
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7700384Z  
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7700608Z  PostgreSQL init process complete; ready for start up.
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7700888Z  
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7706490Z Stop and remove container: 7b48f402fa584d09a8aaf0317236af04_postgres15_999faa
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.7711262Z ##[command]/usr/bin/docker rm --force fa0da72713e31f42991d0ac3edd94c768c7cfa9fd96183d28475668cabaa5af8
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.9222416Z fa0da72713e31f42991d0ac3edd94c768c7cfa9fd96183d28475668cabaa5af8
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.9253770Z Remove container network: github_network_bf61517470884dd3b88af3876d46b18b
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:29.9258304Z ##[command]/usr/bin/docker network rm github_network_bf61517470884dd3b88af3876d46b18b
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:30.0413142Z github_network_bf61517470884dd3b88af3876d46b18b
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:30.0473447Z Cleaning up orphan processes
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:30.0783086Z Terminate orphan process: pid (2949) (php)
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:30.0809431Z Terminate orphan process: pid (2952) (php8.3)
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:30.0983226Z Terminate orphan process: pid (5646) (npm run start -p 3001)
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:30.1018527Z Terminate orphan process: pid (5662) (sh)
e2e-tests	UNKNOWN STEP	2025-08-29T20:14:30.1043749Z Terminate orphan process: pid (5663) (next-server (v15.5.0))
```

</details>

### PR #34
- URL: https://github.com/lomendor/Project-Dixis/pull/34
- Bucket: frontend-tests
- Failing Job: integration
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17699792686/job/50303939139

<details><summary>Head (first 60 lines)</summary>

```
integration	UNKNOWN STEP	﻿2025-09-13T17:29:07.2304626Z Current runner version: '2.328.0'
integration	UNKNOWN STEP	2025-09-13T17:29:07.2327000Z ##[group]Runner Image Provisioner
integration	UNKNOWN STEP	2025-09-13T17:29:07.2327874Z Hosted Compute Agent
integration	UNKNOWN STEP	2025-09-13T17:29:07.2328415Z Version: 20250829.383
integration	UNKNOWN STEP	2025-09-13T17:29:07.2329026Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
integration	UNKNOWN STEP	2025-09-13T17:29:07.2329773Z Build Date: 2025-08-29T13:48:48Z
integration	UNKNOWN STEP	2025-09-13T17:29:07.2330530Z ##[endgroup]
integration	UNKNOWN STEP	2025-09-13T17:29:07.2331114Z ##[group]Operating System
integration	UNKNOWN STEP	2025-09-13T17:29:07.2331732Z Ubuntu
integration	UNKNOWN STEP	2025-09-13T17:29:07.2332171Z 24.04.3
integration	UNKNOWN STEP	2025-09-13T17:29:07.2332626Z LTS
integration	UNKNOWN STEP	2025-09-13T17:29:07.2333073Z ##[endgroup]
integration	UNKNOWN STEP	2025-09-13T17:29:07.2333584Z ##[group]Runner Image
integration	UNKNOWN STEP	2025-09-13T17:29:07.2334110Z Image: ubuntu-24.04
integration	UNKNOWN STEP	2025-09-13T17:29:07.2334644Z Version: 20250907.24.1
integration	UNKNOWN STEP	2025-09-13T17:29:07.2335644Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
integration	UNKNOWN STEP	2025-09-13T17:29:07.2337247Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
integration	UNKNOWN STEP	2025-09-13T17:29:07.2338289Z ##[endgroup]
integration	UNKNOWN STEP	2025-09-13T17:29:07.2339333Z ##[group]GITHUB_TOKEN Permissions
integration	UNKNOWN STEP	2025-09-13T17:29:07.2341352Z Contents: read
integration	UNKNOWN STEP	2025-09-13T17:29:07.2341873Z Metadata: read
integration	UNKNOWN STEP	2025-09-13T17:29:07.2342359Z Packages: read
integration	UNKNOWN STEP	2025-09-13T17:29:07.2342956Z ##[endgroup]
integration	UNKNOWN STEP	2025-09-13T17:29:07.2344885Z Secret source: Dependabot
integration	UNKNOWN STEP	2025-09-13T17:29:07.2345585Z Prepare workflow directory
integration	UNKNOWN STEP	2025-09-13T17:29:07.2782113Z Prepare all required actions
integration	UNKNOWN STEP	2025-09-13T17:29:07.2822706Z Getting action download info
integration	UNKNOWN STEP	2025-09-13T17:29:07.6973403Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
integration	UNKNOWN STEP	2025-09-13T17:29:07.9007421Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
integration	UNKNOWN STEP	2025-09-13T17:29:08.1827644Z Download action repository 'actions/cache@v4' (SHA:0400d5f644dc74513175e3cd8d07132dd4860809)
integration	UNKNOWN STEP	2025-09-13T17:29:08.2773537Z Download action repository 'actions/setup-node@v5' (SHA:a0853c24544627f65ddf259abe73b1d18a591444)
integration	UNKNOWN STEP	2025-09-13T17:29:08.7096392Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
integration	UNKNOWN STEP	2025-09-13T17:29:08.9639891Z Complete job name: integration
integration	UNKNOWN STEP	2025-09-13T17:29:09.0265117Z ##[group]Checking docker version
integration	UNKNOWN STEP	2025-09-13T17:29:09.0278768Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
integration	UNKNOWN STEP	2025-09-13T17:29:10.4693799Z '1.48'
integration	UNKNOWN STEP	2025-09-13T17:29:10.4707511Z Docker daemon API version: '1.48'
integration	UNKNOWN STEP	2025-09-13T17:29:10.4707984Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
integration	UNKNOWN STEP	2025-09-13T17:29:10.4872680Z '1.48'
integration	UNKNOWN STEP	2025-09-13T17:29:10.4885317Z Docker client API version: '1.48'
integration	UNKNOWN STEP	2025-09-13T17:29:10.4891048Z ##[endgroup]
integration	UNKNOWN STEP	2025-09-13T17:29:10.4894230Z ##[group]Clean up resources from previous jobs
integration	UNKNOWN STEP	2025-09-13T17:29:10.4899350Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=b2b38e"
integration	UNKNOWN STEP	2025-09-13T17:29:10.5036856Z ##[command]/usr/bin/docker network prune --force --filter "label=b2b38e"
integration	UNKNOWN STEP	2025-09-13T17:29:10.5215467Z ##[endgroup]
integration	UNKNOWN STEP	2025-09-13T17:29:10.5215799Z ##[group]Create local container network
integration	UNKNOWN STEP	2025-09-13T17:29:10.5225651Z ##[command]/usr/bin/docker network create --label b2b38e github_network_b3643609cd2e421da6a9022c70f0f579
integration	UNKNOWN STEP	2025-09-13T17:29:10.5722552Z a2f573545685ce8500ffaec05de003655c579e317de49ee2973110a26f9b283a
integration	UNKNOWN STEP	2025-09-13T17:29:10.5741717Z ##[endgroup]
integration	UNKNOWN STEP	2025-09-13T17:29:10.5766216Z ##[group]Starting postgres service container
integration	UNKNOWN STEP	2025-09-13T17:29:10.5785983Z ##[command]/usr/bin/docker pull postgres:15
integration	UNKNOWN STEP	2025-09-13T17:29:11.0307931Z 15: Pulling from library/postgres
integration	UNKNOWN STEP	2025-09-13T17:29:11.1326859Z ce1261c6d567: Pulling fs layer
integration	UNKNOWN STEP	2025-09-13T17:29:11.1328380Z 80ed16669c95: Pulling fs layer
integration	UNKNOWN STEP	2025-09-13T17:29:11.1328948Z 4e5806601837: Pulling fs layer
integration	UNKNOWN STEP	2025-09-13T17:29:11.1329339Z b18445125df5: Pulling fs layer
integration	UNKNOWN STEP	2025-09-13T17:29:11.1329753Z 874a3ca0fb79: Pulling fs layer
integration	UNKNOWN STEP	2025-09-13T17:29:11.1330152Z 38a0056e8c05: Pulling fs layer
integration	UNKNOWN STEP	2025-09-13T17:29:11.1330720Z cb4494753109: Pulling fs layer
integration	UNKNOWN STEP	2025-09-13T17:29:11.1331093Z 9286f415f93a: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
integration	UNKNOWN STEP	2025-09-13T17:31:05.0187585Z  The default database encoding has accordingly been set to "UTF8".
integration	UNKNOWN STEP	2025-09-13T17:31:05.0188292Z  The default text search configuration will be set to "english".
integration	UNKNOWN STEP	2025-09-13T17:31:05.0188818Z  
integration	UNKNOWN STEP	2025-09-13T17:31:05.0189117Z  Data page checksums are disabled.
integration	UNKNOWN STEP	2025-09-13T17:31:05.0189505Z  
integration	UNKNOWN STEP	2025-09-13T17:31:05.0190020Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
integration	UNKNOWN STEP	2025-09-13T17:31:05.0190830Z  creating subdirectories ... ok
integration	UNKNOWN STEP	2025-09-13T17:31:05.0191340Z  selecting dynamic shared memory implementation ... posix
integration	UNKNOWN STEP	2025-09-13T17:31:05.0191892Z  selecting default max_connections ... 100
integration	UNKNOWN STEP	2025-09-13T17:31:05.0192380Z  selecting default shared_buffers ... 128MB
integration	UNKNOWN STEP	2025-09-13T17:31:05.0192847Z  selecting default time zone ... Etc/UTC
integration	UNKNOWN STEP	2025-09-13T17:31:05.0193295Z  creating configuration files ... ok
integration	UNKNOWN STEP	2025-09-13T17:31:05.0193724Z  running bootstrap script ... ok
integration	UNKNOWN STEP	2025-09-13T17:31:05.0194182Z  performing post-bootstrap initialization ... ok
integration	UNKNOWN STEP	2025-09-13T17:31:05.0194638Z  syncing data to disk ... ok
integration	UNKNOWN STEP	2025-09-13T17:31:05.0194973Z  
integration	UNKNOWN STEP	2025-09-13T17:31:05.0195758Z  initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
integration	UNKNOWN STEP	2025-09-13T17:31:05.0197183Z  2025-09-13 17:29:19.095 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
integration	UNKNOWN STEP	2025-09-13T17:31:05.0198273Z  2025-09-13 17:29:19.095 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
integration	UNKNOWN STEP	2025-09-13T17:31:05.0198995Z  2025-09-13 17:29:19.095 UTC [1] LOG:  listening on IPv6 address "::", port 5432
integration	UNKNOWN STEP	2025-09-13T17:31:05.0199801Z  2025-09-13 17:29:19.096 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-09-13T17:31:05.0200793Z  2025-09-13 17:29:19.099 UTC [64] LOG:  database system was shut down at 2025-09-13 17:29:18 UTC
integration	UNKNOWN STEP	2025-09-13T17:31:05.0201572Z  2025-09-13 17:29:19.103 UTC [1] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-09-13T17:31:05.0202121Z  
integration	UNKNOWN STEP	2025-09-13T17:31:05.0202639Z  Success. You can now start the database server using:
integration	UNKNOWN STEP	2025-09-13T17:31:05.0203128Z  
integration	UNKNOWN STEP	2025-09-13T17:31:05.0203484Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
integration	UNKNOWN STEP	2025-09-13T17:31:05.0203768Z  
integration	UNKNOWN STEP	2025-09-13T17:31:05.0204326Z  waiting for server to start....2025-09-13 17:29:18.789 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
integration	UNKNOWN STEP	2025-09-13T17:31:05.0205079Z  2025-09-13 17:29:18.790 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-09-13T17:31:05.0205559Z  2025-09-13 17:29:18.792 UTC [51] LOG:  database system was shut down at 2025-09-13 17:29:18 UTC
integration	UNKNOWN STEP	2025-09-13T17:31:05.0205989Z  2025-09-13 17:29:18.796 UTC [48] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-09-13T17:31:05.0206313Z   done
integration	UNKNOWN STEP	2025-09-13T17:31:05.0206475Z  server started
integration	UNKNOWN STEP	2025-09-13T17:31:05.0206650Z  CREATE DATABASE
integration	UNKNOWN STEP	2025-09-13T17:31:05.0206820Z  
integration	UNKNOWN STEP	2025-09-13T17:31:05.0206964Z  
integration	UNKNOWN STEP	2025-09-13T17:31:05.0207258Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
integration	UNKNOWN STEP	2025-09-13T17:31:05.0207611Z  
integration	UNKNOWN STEP	2025-09-13T17:31:05.0207916Z  waiting for server to shut down...2025-09-13 17:29:18.976 UTC [48] LOG:  received fast shutdown request
integration	UNKNOWN STEP	2025-09-13T17:31:05.0208615Z  .2025-09-13 17:29:18.977 UTC [48] LOG:  aborting any active transactions
integration	UNKNOWN STEP	2025-09-13T17:31:05.0209115Z  2025-09-13 17:29:18.978 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
integration	UNKNOWN STEP	2025-09-13T17:31:05.0209571Z  2025-09-13 17:29:18.979 UTC [49] LOG:  shutting down
integration	UNKNOWN STEP	2025-09-13T17:31:05.0210042Z  2025-09-13 17:29:18.979 UTC [49] LOG:  checkpoint starting: shutdown immediate
integration	UNKNOWN STEP	2025-09-13T17:31:05.0211057Z  2025-09-13 17:29:18.995 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.013 s, sync=0.002 s, total=0.017 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
integration	UNKNOWN STEP	2025-09-13T17:31:05.0211837Z  2025-09-13 17:29:19.001 UTC [48] LOG:  database system is shut down
integration	UNKNOWN STEP	2025-09-13T17:31:05.0212113Z   done
integration	UNKNOWN STEP	2025-09-13T17:31:05.0212273Z  server stopped
integration	UNKNOWN STEP	2025-09-13T17:31:05.0212443Z  
integration	UNKNOWN STEP	2025-09-13T17:31:05.0212653Z  PostgreSQL init process complete; ready for start up.
integration	UNKNOWN STEP	2025-09-13T17:31:05.0212920Z  
integration	UNKNOWN STEP	2025-09-13T17:31:05.0218388Z Stop and remove container: 22459926c6f94d24a9522b461427641d_postgres15_03b0b8
integration	UNKNOWN STEP	2025-09-13T17:31:05.0223158Z ##[command]/usr/bin/docker rm --force 9b462fa56e6efa9374fd8a37462822ff61bb752d695700dcb8308344b6bcf0dc
integration	UNKNOWN STEP	2025-09-13T17:31:05.2019247Z 9b462fa56e6efa9374fd8a37462822ff61bb752d695700dcb8308344b6bcf0dc
integration	UNKNOWN STEP	2025-09-13T17:31:05.2046667Z Remove container network: github_network_b3643609cd2e421da6a9022c70f0f579
integration	UNKNOWN STEP	2025-09-13T17:31:05.2051636Z ##[command]/usr/bin/docker network rm github_network_b3643609cd2e421da6a9022c70f0f579
integration	UNKNOWN STEP	2025-09-13T17:31:05.3173824Z github_network_b3643609cd2e421da6a9022c70f0f579
integration	UNKNOWN STEP	2025-09-13T17:31:05.3230077Z Cleaning up orphan processes
integration	UNKNOWN STEP	2025-09-13T17:31:05.3530718Z Terminate orphan process: pid (2860) (php)
integration	UNKNOWN STEP	2025-09-13T17:31:05.3559656Z Terminate orphan process: pid (2863) (php8.3)
```

</details>

### PR #33
- URL: https://github.com/lomendor/Project-Dixis/pull/33
- Bucket: frontend-tests
- Failing Job: integration
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17699798478/job/50303953577

<details><summary>Head (first 60 lines)</summary>

```
integration	UNKNOWN STEP	﻿2025-09-13T17:29:08.4634332Z Current runner version: '2.328.0'
integration	UNKNOWN STEP	2025-09-13T17:29:08.4658062Z ##[group]Runner Image Provisioner
integration	UNKNOWN STEP	2025-09-13T17:29:08.4659044Z Hosted Compute Agent
integration	UNKNOWN STEP	2025-09-13T17:29:08.4659561Z Version: 20250829.383
integration	UNKNOWN STEP	2025-09-13T17:29:08.4660261Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
integration	UNKNOWN STEP	2025-09-13T17:29:08.4661148Z Build Date: 2025-08-29T13:48:48Z
integration	UNKNOWN STEP	2025-09-13T17:29:08.4661751Z ##[endgroup]
integration	UNKNOWN STEP	2025-09-13T17:29:08.4662386Z ##[group]Operating System
integration	UNKNOWN STEP	2025-09-13T17:29:08.4662924Z Ubuntu
integration	UNKNOWN STEP	2025-09-13T17:29:08.4663395Z 24.04.3
integration	UNKNOWN STEP	2025-09-13T17:29:08.4663871Z LTS
integration	UNKNOWN STEP	2025-09-13T17:29:08.4664345Z ##[endgroup]
integration	UNKNOWN STEP	2025-09-13T17:29:08.4664790Z ##[group]Runner Image
integration	UNKNOWN STEP	2025-09-13T17:29:08.4665364Z Image: ubuntu-24.04
integration	UNKNOWN STEP	2025-09-13T17:29:08.4665876Z Version: 20250907.24.1
integration	UNKNOWN STEP	2025-09-13T17:29:08.4666920Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
integration	UNKNOWN STEP	2025-09-13T17:29:08.4668492Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
integration	UNKNOWN STEP	2025-09-13T17:29:08.4669443Z ##[endgroup]
integration	UNKNOWN STEP	2025-09-13T17:29:08.4670706Z ##[group]GITHUB_TOKEN Permissions
integration	UNKNOWN STEP	2025-09-13T17:29:08.4672749Z Contents: read
integration	UNKNOWN STEP	2025-09-13T17:29:08.4673369Z Metadata: read
integration	UNKNOWN STEP	2025-09-13T17:29:08.4673979Z Packages: read
integration	UNKNOWN STEP	2025-09-13T17:29:08.4674440Z ##[endgroup]
integration	UNKNOWN STEP	2025-09-13T17:29:08.4676483Z Secret source: Dependabot
integration	UNKNOWN STEP	2025-09-13T17:29:08.4677283Z Prepare workflow directory
integration	UNKNOWN STEP	2025-09-13T17:29:08.5122848Z Prepare all required actions
integration	UNKNOWN STEP	2025-09-13T17:29:08.5179601Z Getting action download info
integration	UNKNOWN STEP	2025-09-13T17:29:08.9920857Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
integration	UNKNOWN STEP	2025-09-13T17:29:09.1617928Z Download action repository 'shivammathur/setup-php@v2' (SHA:ec406be512d7077f68eed36e63f4d91bc006edc4)
integration	UNKNOWN STEP	2025-09-13T17:29:09.6270989Z Download action repository 'actions/cache@v4' (SHA:0400d5f644dc74513175e3cd8d07132dd4860809)
integration	UNKNOWN STEP	2025-09-13T17:29:09.7960759Z Download action repository 'actions/setup-node@v5' (SHA:a0853c24544627f65ddf259abe73b1d18a591444)
integration	UNKNOWN STEP	2025-09-13T17:29:10.6035206Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
integration	UNKNOWN STEP	2025-09-13T17:29:10.8005365Z Complete job name: integration
integration	UNKNOWN STEP	2025-09-13T17:29:10.8525751Z ##[group]Checking docker version
integration	UNKNOWN STEP	2025-09-13T17:29:10.8538574Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
integration	UNKNOWN STEP	2025-09-13T17:29:10.9544645Z '1.48'
integration	UNKNOWN STEP	2025-09-13T17:29:10.9556915Z Docker daemon API version: '1.48'
integration	UNKNOWN STEP	2025-09-13T17:29:10.9557478Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
integration	UNKNOWN STEP	2025-09-13T17:29:10.9712916Z '1.48'
integration	UNKNOWN STEP	2025-09-13T17:29:10.9725881Z Docker client API version: '1.48'
integration	UNKNOWN STEP	2025-09-13T17:29:10.9731960Z ##[endgroup]
integration	UNKNOWN STEP	2025-09-13T17:29:10.9734825Z ##[group]Clean up resources from previous jobs
integration	UNKNOWN STEP	2025-09-13T17:29:10.9739974Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=10c040"
integration	UNKNOWN STEP	2025-09-13T17:29:10.9882308Z ##[command]/usr/bin/docker network prune --force --filter "label=10c040"
integration	UNKNOWN STEP	2025-09-13T17:29:11.0015262Z ##[endgroup]
integration	UNKNOWN STEP	2025-09-13T17:29:11.0015680Z ##[group]Create local container network
integration	UNKNOWN STEP	2025-09-13T17:29:11.0025513Z ##[command]/usr/bin/docker network create --label 10c040 github_network_0feb847802d84c8b90ba3fec912a2d46
integration	UNKNOWN STEP	2025-09-13T17:29:11.0527500Z c11b47e862bc820362aa1008a59f74d8b5e46b0fdaa464e81cc0810b70e82304
integration	UNKNOWN STEP	2025-09-13T17:29:11.0545408Z ##[endgroup]
integration	UNKNOWN STEP	2025-09-13T17:29:11.0568479Z ##[group]Starting postgres service container
integration	UNKNOWN STEP	2025-09-13T17:29:11.0588366Z ##[command]/usr/bin/docker pull postgres:15
integration	UNKNOWN STEP	2025-09-13T17:29:12.1768939Z 15: Pulling from library/postgres
integration	UNKNOWN STEP	2025-09-13T17:29:12.4580934Z ce1261c6d567: Pulling fs layer
integration	UNKNOWN STEP	2025-09-13T17:29:12.4581882Z 80ed16669c95: Pulling fs layer
integration	UNKNOWN STEP	2025-09-13T17:29:12.4582500Z 4e5806601837: Pulling fs layer
integration	UNKNOWN STEP	2025-09-13T17:29:12.4582994Z b18445125df5: Pulling fs layer
integration	UNKNOWN STEP	2025-09-13T17:29:12.4583480Z 874a3ca0fb79: Pulling fs layer
integration	UNKNOWN STEP	2025-09-13T17:29:12.4583957Z 38a0056e8c05: Pulling fs layer
integration	UNKNOWN STEP	2025-09-13T17:29:12.4584468Z cb4494753109: Pulling fs layer
integration	UNKNOWN STEP	2025-09-13T17:29:12.4584963Z 9286f415f93a: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
integration	UNKNOWN STEP	2025-09-13T17:30:15.2188997Z  2025-09-13 17:29:19.415 UTC [1] LOG:  listening on IPv6 address "::", port 5432
integration	UNKNOWN STEP	2025-09-13T17:30:15.2189477Z  2025-09-13 17:29:19.417 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-09-13T17:30:15.2189990Z  2025-09-13 17:29:19.420 UTC [64] LOG:  database system was shut down at 2025-09-13 17:29:19 UTC
integration	UNKNOWN STEP	2025-09-13T17:30:15.2190443Z  2025-09-13 17:29:19.424 UTC [1] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-09-13T17:30:15.2191030Z  This user must also own the server process.
integration	UNKNOWN STEP	2025-09-13T17:30:15.2191299Z  
integration	UNKNOWN STEP	2025-09-13T17:30:15.2191570Z  The database cluster will be initialized with locale "en_US.utf8".
integration	UNKNOWN STEP	2025-09-13T17:30:15.2191991Z  The default database encoding has accordingly been set to "UTF8".
integration	UNKNOWN STEP	2025-09-13T17:30:15.2192393Z  The default text search configuration will be set to "english".
integration	UNKNOWN STEP	2025-09-13T17:30:15.2192700Z  
integration	UNKNOWN STEP	2025-09-13T17:30:15.2192889Z  Data page checksums are disabled.
integration	UNKNOWN STEP	2025-09-13T17:30:15.2193380Z  
integration	UNKNOWN STEP	2025-09-13T17:30:15.2193664Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
integration	UNKNOWN STEP	2025-09-13T17:30:15.2194036Z  creating subdirectories ... ok
integration	UNKNOWN STEP	2025-09-13T17:30:15.2194336Z  selecting dynamic shared memory implementation ... posix
integration	UNKNOWN STEP	2025-09-13T17:30:15.2194671Z  selecting default max_connections ... 100
integration	UNKNOWN STEP	2025-09-13T17:30:15.2194956Z  selecting default shared_buffers ... 128MB
integration	UNKNOWN STEP	2025-09-13T17:30:15.2195231Z  selecting default time zone ... Etc/UTC
integration	UNKNOWN STEP	2025-09-13T17:30:15.2195507Z  creating configuration files ... ok
integration	UNKNOWN STEP	2025-09-13T17:30:15.2195768Z  running bootstrap script ... ok
integration	UNKNOWN STEP	2025-09-13T17:30:15.2196053Z  performing post-bootstrap initialization ... ok
integration	UNKNOWN STEP	2025-09-13T17:30:15.2196345Z  syncing data to disk ... ok
integration	UNKNOWN STEP	2025-09-13T17:30:15.2196631Z  
integration	UNKNOWN STEP	2025-09-13T17:30:15.2197077Z  
integration	UNKNOWN STEP	2025-09-13T17:30:15.2197463Z  Success. You can now start the database server using:
integration	UNKNOWN STEP	2025-09-13T17:30:15.2197968Z  
integration	UNKNOWN STEP	2025-09-13T17:30:15.2198212Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
integration	UNKNOWN STEP	2025-09-13T17:30:15.2198505Z  
integration	UNKNOWN STEP	2025-09-13T17:30:15.2199063Z  waiting for server to start....2025-09-13 17:29:19.104 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
integration	UNKNOWN STEP	2025-09-13T17:30:15.2199821Z  2025-09-13 17:29:19.105 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
integration	UNKNOWN STEP	2025-09-13T17:30:15.2200322Z  2025-09-13 17:29:19.109 UTC [51] LOG:  database system was shut down at 2025-09-13 17:29:19 UTC
integration	UNKNOWN STEP	2025-09-13T17:30:15.2201038Z  2025-09-13 17:29:19.114 UTC [48] LOG:  database system is ready to accept connections
integration	UNKNOWN STEP	2025-09-13T17:30:15.2201380Z   done
integration	UNKNOWN STEP	2025-09-13T17:30:15.2201550Z  server started
integration	UNKNOWN STEP	2025-09-13T17:30:15.2201734Z  CREATE DATABASE
integration	UNKNOWN STEP	2025-09-13T17:30:15.2201914Z  
integration	UNKNOWN STEP	2025-09-13T17:30:15.2202067Z  
integration	UNKNOWN STEP	2025-09-13T17:30:15.2202375Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
integration	UNKNOWN STEP	2025-09-13T17:30:15.2202750Z  
integration	UNKNOWN STEP	2025-09-13T17:30:15.2202985Z  2025-09-13 17:29:19.295 UTC [48] LOG:  received fast shutdown request
integration	UNKNOWN STEP	2025-09-13T17:30:15.2203683Z  waiting for server to shut down....2025-09-13 17:29:19.296 UTC [48] LOG:  aborting any active transactions
integration	UNKNOWN STEP	2025-09-13T17:30:15.2204301Z  2025-09-13 17:29:19.297 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
integration	UNKNOWN STEP	2025-09-13T17:30:15.2204774Z  2025-09-13 17:29:19.298 UTC [49] LOG:  shutting down
integration	UNKNOWN STEP	2025-09-13T17:30:15.2205127Z  2025-09-13 17:29:19.298 UTC [49] LOG:  checkpoint starting: shutdown immediate
integration	UNKNOWN STEP	2025-09-13T17:30:15.2205957Z  2025-09-13 17:29:19.317 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.003 s, total=0.019 s; sync files=301, longest=0.002 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
integration	UNKNOWN STEP	2025-09-13T17:30:15.2206765Z  2025-09-13 17:29:19.323 UTC [48] LOG:  database system is shut down
integration	UNKNOWN STEP	2025-09-13T17:30:15.2207053Z   done
integration	UNKNOWN STEP	2025-09-13T17:30:15.2207223Z  server stopped
integration	UNKNOWN STEP	2025-09-13T17:30:15.2207898Z  
integration	UNKNOWN STEP	2025-09-13T17:30:15.2208129Z  PostgreSQL init process complete; ready for start up.
integration	UNKNOWN STEP	2025-09-13T17:30:15.2208424Z  
integration	UNKNOWN STEP	2025-09-13T17:30:15.2213810Z Stop and remove container: b8d1014d7e1d46e1afd38040b0e89bbe_postgres15_d924b3
integration	UNKNOWN STEP	2025-09-13T17:30:15.2218261Z ##[command]/usr/bin/docker rm --force 77937b6918e7ad5ad8b8904fe28b83cfdc98d96f490ed35d000b989de33f2ee6
integration	UNKNOWN STEP	2025-09-13T17:30:16.8140143Z 77937b6918e7ad5ad8b8904fe28b83cfdc98d96f490ed35d000b989de33f2ee6
integration	UNKNOWN STEP	2025-09-13T17:30:16.8166953Z Remove container network: github_network_0feb847802d84c8b90ba3fec912a2d46
integration	UNKNOWN STEP	2025-09-13T17:30:16.8171710Z ##[command]/usr/bin/docker network rm github_network_0feb847802d84c8b90ba3fec912a2d46
integration	UNKNOWN STEP	2025-09-13T17:30:16.9168580Z github_network_0feb847802d84c8b90ba3fec912a2d46
integration	UNKNOWN STEP	2025-09-13T17:30:16.9225794Z Cleaning up orphan processes
integration	UNKNOWN STEP	2025-09-13T17:30:16.9519681Z Terminate orphan process: pid (2902) (php)
integration	UNKNOWN STEP	2025-09-13T17:30:16.9547558Z Terminate orphan process: pid (2905) (php8.3)
```

</details>

### PR #20
- URL: https://github.com/lomendor/Project-Dixis/pull/20
- Bucket: frontend-tests
- Failing Job: php-tests
- Details: https://github.com/lomendor/Project-Dixis/actions/runs/17852322525/job/50763457989

<details><summary>Head (first 60 lines)</summary>

```
php-tests	Set up job	﻿2025-09-19T08:01:28.8324552Z Current runner version: '2.328.0'
php-tests	Set up job	2025-09-19T08:01:28.8348190Z ##[group]Runner Image Provisioner
php-tests	Set up job	2025-09-19T08:01:28.8349041Z Hosted Compute Agent
php-tests	Set up job	2025-09-19T08:01:28.8349615Z Version: 20250829.383
php-tests	Set up job	2025-09-19T08:01:28.8350217Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
php-tests	Set up job	2025-09-19T08:01:28.8350948Z Build Date: 2025-08-29T13:48:48Z
php-tests	Set up job	2025-09-19T08:01:28.8351558Z ##[endgroup]
php-tests	Set up job	2025-09-19T08:01:28.8352051Z ##[group]Operating System
php-tests	Set up job	2025-09-19T08:01:28.8352637Z Ubuntu
php-tests	Set up job	2025-09-19T08:01:28.8353102Z 24.04.3
php-tests	Set up job	2025-09-19T08:01:28.8353568Z LTS
php-tests	Set up job	2025-09-19T08:01:28.8354282Z ##[endgroup]
php-tests	Set up job	2025-09-19T08:01:28.8354905Z ##[group]Runner Image
php-tests	Set up job	2025-09-19T08:01:28.8355453Z Image: ubuntu-24.04
php-tests	Set up job	2025-09-19T08:01:28.8355913Z Version: 20250907.24.1
php-tests	Set up job	2025-09-19T08:01:28.8356967Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
php-tests	Set up job	2025-09-19T08:01:28.8358268Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
php-tests	Set up job	2025-09-19T08:01:28.8359478Z ##[endgroup]
php-tests	Set up job	2025-09-19T08:01:28.8360510Z ##[group]GITHUB_TOKEN Permissions
php-tests	Set up job	2025-09-19T08:01:28.8362666Z Contents: read
php-tests	Set up job	2025-09-19T08:01:28.8363237Z Metadata: read
php-tests	Set up job	2025-09-19T08:01:28.8363871Z Packages: read
php-tests	Set up job	2025-09-19T08:01:28.8364480Z ##[endgroup]
php-tests	Set up job	2025-09-19T08:01:28.8366412Z Secret source: Dependabot
php-tests	Set up job	2025-09-19T08:01:28.8367157Z Prepare workflow directory
php-tests	Set up job	2025-09-19T08:01:28.8842519Z Prepare all required actions
php-tests	Set up job	2025-09-19T08:01:28.8899426Z Getting action download info
php-tests	Set up job	2025-09-19T08:01:29.4118613Z Download action repository 'actions/checkout@v5' (SHA:08c6903cd8c0fde910a37f88322edcfb5dd907a8)
php-tests	Set up job	2025-09-19T08:01:29.5947306Z Download action repository 'shivammathur/setup-php@v2' (SHA:bf6b4fbd49ca58e4608c9c89fba0b8d90bd2a39f)
php-tests	Set up job	2025-09-19T08:01:30.0981790Z Download action repository 'actions/cache@v4' (SHA:0400d5f644dc74513175e3cd8d07132dd4860809)
php-tests	Set up job	2025-09-19T08:01:30.2446541Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
php-tests	Set up job	2025-09-19T08:01:30.4879703Z Complete job name: php-tests
php-tests	Initialize containers	﻿2025-09-19T08:01:30.5409573Z ##[group]Checking docker version
php-tests	Initialize containers	2025-09-19T08:01:30.5422751Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
php-tests	Initialize containers	2025-09-19T08:01:30.6785295Z '1.48'
php-tests	Initialize containers	2025-09-19T08:01:30.6797517Z Docker daemon API version: '1.48'
php-tests	Initialize containers	2025-09-19T08:01:30.6798644Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
php-tests	Initialize containers	2025-09-19T08:01:30.7000433Z '1.48'
php-tests	Initialize containers	2025-09-19T08:01:30.7014896Z Docker client API version: '1.48'
php-tests	Initialize containers	2025-09-19T08:01:30.7020301Z ##[endgroup]
php-tests	Initialize containers	2025-09-19T08:01:30.7023225Z ##[group]Clean up resources from previous jobs
php-tests	Initialize containers	2025-09-19T08:01:30.7029218Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=1164db"
php-tests	Initialize containers	2025-09-19T08:01:30.7165333Z ##[command]/usr/bin/docker network prune --force --filter "label=1164db"
php-tests	Initialize containers	2025-09-19T08:01:30.7290515Z ##[endgroup]
php-tests	Initialize containers	2025-09-19T08:01:30.7291158Z ##[group]Create local container network
php-tests	Initialize containers	2025-09-19T08:01:30.7301736Z ##[command]/usr/bin/docker network create --label 1164db github_network_a3c2f9d86b764d55a0f8c914bad11f74
php-tests	Initialize containers	2025-09-19T08:01:30.7792899Z 789eb660a940d66f7f93f98046df15287aabfae06c04ce629b1f02b4c566ccae
php-tests	Initialize containers	2025-09-19T08:01:30.7811769Z ##[endgroup]
php-tests	Initialize containers	2025-09-19T08:01:30.7836819Z ##[group]Starting postgres service container
php-tests	Initialize containers	2025-09-19T08:01:30.7857415Z ##[command]/usr/bin/docker pull postgres:15
php-tests	Initialize containers	2025-09-19T08:01:31.7316238Z 15: Pulling from library/postgres
php-tests	Initialize containers	2025-09-19T08:01:31.9946586Z ce1261c6d567: Pulling fs layer
php-tests	Initialize containers	2025-09-19T08:01:31.9947695Z 80ed16669c95: Pulling fs layer
php-tests	Initialize containers	2025-09-19T08:01:31.9948644Z 4e5806601837: Pulling fs layer
php-tests	Initialize containers	2025-09-19T08:01:31.9949580Z b18445125df5: Pulling fs layer
php-tests	Initialize containers	2025-09-19T08:01:31.9950510Z 874a3ca0fb79: Pulling fs layer
php-tests	Initialize containers	2025-09-19T08:01:31.9951424Z 38a0056e8c05: Pulling fs layer
php-tests	Initialize containers	2025-09-19T08:01:31.9952316Z cb4494753109: Pulling fs layer
php-tests	Initialize containers	2025-09-19T08:01:31.9952944Z 9286f415f93a: Pulling fs layer
php-tests	Initialize containers	2025-09-19T08:01:31.9953844Z 60570350e677: Pulling fs layer
```

</details>

<details><summary>Tail (last 60 lines)</summary>

```
php-tests	Stop containers	2025-09-19T08:02:44.8978975Z  selecting dynamic shared memory implementation ... posix
php-tests	Stop containers	2025-09-19T08:02:44.8979290Z  selecting default max_connections ... 100
php-tests	Stop containers	2025-09-19T08:02:44.8979563Z  selecting default shared_buffers ... 128MB
php-tests	Stop containers	2025-09-19T08:02:44.8979834Z  selecting default time zone ... Etc/UTC
php-tests	Stop containers	2025-09-19T08:02:44.8980089Z  creating configuration files ... ok
php-tests	Stop containers	2025-09-19T08:02:44.8980344Z  running bootstrap script ... ok
php-tests	Stop containers	2025-09-19T08:02:44.8980616Z  performing post-bootstrap initialization ... ok
php-tests	Stop containers	2025-09-19T08:02:44.8980888Z  syncing data to disk ... ok
php-tests	Stop containers	2025-09-19T08:02:44.8981103Z  
php-tests	Stop containers	2025-09-19T08:02:44.8981254Z  
php-tests	Stop containers	2025-09-19T08:02:44.8981461Z  Success. You can now start the database server using:
php-tests	Stop containers	2025-09-19T08:02:44.8981728Z  
php-tests	Stop containers	2025-09-19T08:02:44.8981941Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
php-tests	Stop containers	2025-09-19T08:02:44.8982205Z  
php-tests	Stop containers	2025-09-19T08:02:44.8982741Z  waiting for server to start....2025-09-19 08:01:39.432 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
php-tests	Stop containers	2025-09-19T08:02:44.8983472Z  2025-09-19 08:01:39.433 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
php-tests	Stop containers	2025-09-19T08:02:44.8984201Z  2025-09-19 08:01:39.436 UTC [51] LOG:  database system was shut down at 2025-09-19 08:01:39 UTC
php-tests	Stop containers	2025-09-19T08:02:44.8984643Z  2025-09-19 08:01:39.440 UTC [48] LOG:  database system is ready to accept connections
php-tests	Stop containers	2025-09-19T08:02:44.8984960Z   done
php-tests	Stop containers	2025-09-19T08:02:44.8985127Z  server started
php-tests	Stop containers	2025-09-19T08:02:44.8985306Z  CREATE DATABASE
php-tests	Stop containers	2025-09-19T08:02:44.8985806Z  2025-09-19 08:01:39.738 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
php-tests	Stop containers	2025-09-19T08:02:44.8986410Z  2025-09-19 08:01:39.738 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
php-tests	Stop containers	2025-09-19T08:02:44.8986810Z  2025-09-19 08:01:39.738 UTC [1] LOG:  listening on IPv6 address "::", port 5432
php-tests	Stop containers	2025-09-19T08:02:44.8987564Z  2025-09-19 08:01:39.739 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
php-tests	Stop containers	2025-09-19T08:02:44.8988405Z  2025-09-19 08:01:39.742 UTC [64] LOG:  database system was shut down at 2025-09-19 08:01:39 UTC
php-tests	Stop containers	2025-09-19T08:02:44.8988886Z  2025-09-19 08:01:39.745 UTC [1] LOG:  database system is ready to accept connections
php-tests	Stop containers	2025-09-19T08:02:44.8989434Z  2025-09-19 08:02:12.788 UTC [125] ERROR:  null value in column "payload" of relation "notifications" violates not-null constraint
php-tests	Stop containers	2025-09-19T08:02:44.8990078Z  2025-09-19 08:02:12.788 UTC [125] DETAIL:  Failing row contains (3, 30, low_stock, null, null, 2025-09-19 08:02:12, 2025-09-19 08:02:12).
php-tests	Stop containers	2025-09-19T08:02:44.8990779Z  2025-09-19 08:02:12.788 UTC [125] STATEMENT:  insert into "notifications" ("user_id", "type", "updated_at", "created_at") values ($1, $2, $3, $4) returning "id"
php-tests	Stop containers	2025-09-19T08:02:44.8991841Z  2025-09-19 08:02:12.788 UTC [125] ERROR:  current transaction is aborted, commands ignored until end of transaction block
php-tests	Stop containers	2025-09-19T08:02:44.8992358Z  2025-09-19 08:02:12.788 UTC [125] STATEMENT:  DEALLOCATE pdo_stmt_00000016
php-tests	Stop containers	2025-09-19T08:02:44.8992876Z  2025-09-19 08:02:37.358 UTC [315] ERROR:  null value in column "payload" of relation "notifications" violates not-null constraint
php-tests	Stop containers	2025-09-19T08:02:44.8993860Z  2025-09-19 08:02:37.358 UTC [315] DETAIL:  Failing row contains (3, 191, low_stock, null, null, 2025-09-19 08:02:37, 2025-09-19 08:02:37).
php-tests	Stop containers	2025-09-19T08:02:44.8994657Z  2025-09-19 08:02:37.358 UTC [315] STATEMENT:  insert into "notifications" ("user_id", "type", "updated_at", "created_at") values ($1, $2, $3, $4) returning "id"
php-tests	Stop containers	2025-09-19T08:02:44.8995356Z  2025-09-19 08:02:37.359 UTC [315] ERROR:  current transaction is aborted, commands ignored until end of transaction block
php-tests	Stop containers	2025-09-19T08:02:44.8995868Z  2025-09-19 08:02:37.359 UTC [315] STATEMENT:  DEALLOCATE pdo_stmt_00000016
php-tests	Stop containers	2025-09-19T08:02:44.8996162Z  
php-tests	Stop containers	2025-09-19T08:02:44.8996316Z  
php-tests	Stop containers	2025-09-19T08:02:44.8996610Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
php-tests	Stop containers	2025-09-19T08:02:44.8996966Z  
php-tests	Stop containers	2025-09-19T08:02:44.8997190Z  2025-09-19 08:01:39.618 UTC [48] LOG:  received fast shutdown request
php-tests	Stop containers	2025-09-19T08:02:44.8997639Z  waiting for server to shut down....2025-09-19 08:01:39.619 UTC [48] LOG:  aborting any active transactions
php-tests	Stop containers	2025-09-19T08:02:44.8998229Z  2025-09-19 08:01:39.621 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
php-tests	Stop containers	2025-09-19T08:02:44.8998689Z  2025-09-19 08:01:39.621 UTC [49] LOG:  shutting down
php-tests	Stop containers	2025-09-19T08:02:44.8999026Z  2025-09-19 08:01:39.621 UTC [49] LOG:  checkpoint starting: shutdown immediate
php-tests	Stop containers	2025-09-19T08:02:44.8999823Z  2025-09-19 08:01:39.639 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.014 s, sync=0.004 s, total=0.019 s; sync files=301, longest=0.003 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
php-tests	Stop containers	2025-09-19T08:02:44.9000627Z  2025-09-19 08:01:39.645 UTC [48] LOG:  database system is shut down
php-tests	Stop containers	2025-09-19T08:02:44.9000923Z   done
php-tests	Stop containers	2025-09-19T08:02:44.9001105Z  server stopped
php-tests	Stop containers	2025-09-19T08:02:44.9001281Z  
php-tests	Stop containers	2025-09-19T08:02:44.9001488Z  PostgreSQL init process complete; ready for start up.
php-tests	Stop containers	2025-09-19T08:02:44.9001761Z  
php-tests	Stop containers	2025-09-19T08:02:44.9007485Z Stop and remove container: fcf577e0f4a546ad891d6b80d6a37b47_postgres15_8abeef
php-tests	Stop containers	2025-09-19T08:02:44.9011724Z ##[command]/usr/bin/docker rm --force 70ae60506a99879c7c54c72feea5507b53a330dc60fd90bc519c4bc35e3ae7df
php-tests	Stop containers	2025-09-19T08:02:45.1083916Z 70ae60506a99879c7c54c72feea5507b53a330dc60fd90bc519c4bc35e3ae7df
php-tests	Stop containers	2025-09-19T08:02:45.1115306Z Remove container network: github_network_a3c2f9d86b764d55a0f8c914bad11f74
php-tests	Stop containers	2025-09-19T08:02:45.1119846Z ##[command]/usr/bin/docker network rm github_network_a3c2f9d86b764d55a0f8c914bad11f74
php-tests	Stop containers	2025-09-19T08:02:45.2144849Z github_network_a3c2f9d86b764d55a0f8c914bad11f74
php-tests	Complete job	﻿2025-09-19T08:02:45.2201906Z Cleaning up orphan processes
```

</details>

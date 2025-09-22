# PR #222 — CI Monitor & Action (2025-09-22)

Start: 2025-09-22T23:08:12+03:00
## 1) Initial status snapshot
{"baseRefName":"main","headRefName":"ci/auth-e2e-hotfix","mergeable":"CONFLICTING","title":"ci(auth): test-only login endpoint + e2e helper (flagged)","url":"https://github.com/lomendor/Project-Dixis/pull/222"}

### Checks for PR #222
[{"link":"https://github.com/lomendor/Project-Dixis/actions/runs/17926629532/job/50974306792","name":"e2e-tests","state":"IN_PROGRESS"},{"link":"https://github.com/lomendor/Project-Dixis/actions/runs/17926629532/job/50974230957","name":"frontend-tests","state":"SUCCESS"},{"link":"https://github.com/lomendor/Project-Dixis/actions/runs/17926629532/job/50974187557","name":"type-check","state":"SUCCESS"},{"link":"https://github.com/lomendor/Project-Dixis/actions/runs/17926629532/job/50974187624","name":"dependabot-smoke","state":"SKIPPED"}]

## 2) Poll CI (max 25 minutes)
Current status: e2e-tests IN_PROGRESS, others complete
Starting polling...
- Poll 1/25 at 2025-09-22T23:09:00+03:00
Total checks: 4
Failures: 0, Pending: 1
- Poll 2/25 at 2025-09-22T23:09:59+03:00
[{"link":"https://github.com/lomendor/Project-Dixis/actions/runs/17926629532/job/50974306792","name":"e2e-tests","state":"IN_PROGRESS"},{"link":"https://github.com/lomendor/Project-Dixis/actions/runs/17926629532/job/50974230957","name":"frontend-tests","state":"SUCCESS"},{"link":"https://github.com/lomendor/Project-Dixis/actions/runs/17926629532/job/50974187557","name":"type-check","state":"SUCCESS"},{"link":"https://github.com/lomendor/Project-Dixis/actions/runs/17926629532/job/50974187624","name":"dependabot-smoke","state":"SKIPPED"}]
Failures: 0, Pending: 1
## 3) Failure/Timeout — Diagnostics
- Poll completed at 2025-09-22T23:16:02+03:00
- Final state: e2e-tests FAILURE detected
- First failing job: https://github.com/lomendor/Project-Dixis/actions/runs/17926629532/job/50974306792
- Run ID: 17926629532

### Head (first 120 log lines)
type-check	Set up job	﻿2025-09-22T19:44:45.9739326Z Current runner version: '2.328.0'
type-check	Set up job	2025-09-22T19:44:45.9765992Z ##[group]Runner Image Provisioner
type-check	Set up job	2025-09-22T19:44:45.9766803Z Hosted Compute Agent
type-check	Set up job	2025-09-22T19:44:45.9767348Z Version: 20250829.383
type-check	Set up job	2025-09-22T19:44:45.9768399Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
type-check	Set up job	2025-09-22T19:44:45.9769129Z Build Date: 2025-08-29T13:48:48Z
type-check	Set up job	2025-09-22T19:44:45.9769694Z ##[endgroup]
type-check	Set up job	2025-09-22T19:44:45.9770315Z ##[group]Operating System
type-check	Set up job	2025-09-22T19:44:45.9770862Z Ubuntu
type-check	Set up job	2025-09-22T19:44:45.9771360Z 24.04.3
type-check	Set up job	2025-09-22T19:44:45.9771894Z LTS
type-check	Set up job	2025-09-22T19:44:45.9772412Z ##[endgroup]
type-check	Set up job	2025-09-22T19:44:45.9772900Z ##[group]Runner Image
type-check	Set up job	2025-09-22T19:44:45.9773494Z Image: ubuntu-24.04
type-check	Set up job	2025-09-22T19:44:45.9774021Z Version: 20250907.24.1
type-check	Set up job	2025-09-22T19:44:45.9775002Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
type-check	Set up job	2025-09-22T19:44:45.9776434Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
type-check	Set up job	2025-09-22T19:44:45.9777593Z ##[endgroup]
type-check	Set up job	2025-09-22T19:44:45.9779069Z ##[group]GITHUB_TOKEN Permissions
type-check	Set up job	2025-09-22T19:44:45.9780898Z Contents: read
type-check	Set up job	2025-09-22T19:44:45.9781408Z Metadata: read
type-check	Set up job	2025-09-22T19:44:45.9782053Z Packages: read
type-check	Set up job	2025-09-22T19:44:45.9782516Z ##[endgroup]
type-check	Set up job	2025-09-22T19:44:45.9785260Z Secret source: Actions
type-check	Set up job	2025-09-22T19:44:45.9786004Z Prepare workflow directory
type-check	Set up job	2025-09-22T19:44:46.0182608Z Prepare all required actions
type-check	Set up job	2025-09-22T19:44:46.0222079Z Getting action download info
type-check	Set up job	2025-09-22T19:44:46.3469916Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
type-check	Set up job	2025-09-22T19:44:46.4163263Z Download action repository 'actions/setup-node@v5' (SHA:a0853c24544627f65ddf259abe73b1d18a591444)
type-check	Set up job	2025-09-22T19:44:46.8223278Z Complete job name: type-check
type-check	Run actions/checkout@v4	﻿2025-09-22T19:44:46.8920045Z ##[group]Run actions/checkout@v4
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8920907Z with:
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8921334Z   repository: lomendor/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8922050Z   token: ***
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8922465Z   ssh-strict: true
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8922860Z   ssh-user: git
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8923262Z   persist-credentials: true
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8923752Z   clean: true
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8924155Z   sparse-checkout-cone-mode: true
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8924632Z   fetch-depth: 1
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8925017Z   fetch-tags: false
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8925417Z   show-progress: true
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8925813Z   lfs: false
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8926188Z   submodules: false
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8926591Z   set-safe-directory: true
type-check	Run actions/checkout@v4	2025-09-22T19:44:46.8927238Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0027320Z Syncing repository: lomendor/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0029459Z ##[group]Getting Git version info
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0030276Z Working directory is '/home/runner/work/Project-Dixis/Project-Dixis'
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0031371Z [command]/usr/bin/git version
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0103138Z git version 2.51.0
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0144970Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0173860Z Temporarily overriding HOME='/home/runner/work/_temp/f4e16375-a7dc-4e3b-ae0c-2a76e5c41446' before making global git config changes
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0175641Z Adding repository directory to the temporary git global config as a safe directory
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0182153Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0225281Z Deleting the contents of '/home/runner/work/Project-Dixis/Project-Dixis'
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0231737Z ##[group]Initializing the repository
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0238368Z [command]/usr/bin/git init /home/runner/work/Project-Dixis/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0320861Z hint: Using 'master' as the name for the initial branch. This default branch name
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0323454Z hint: is subject to change. To configure the initial branch name to use in all
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0324984Z hint: of your new repositories, which will suppress this warning, call:
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0325743Z hint:
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0326217Z hint: 	git config --global init.defaultBranch <name>
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0327099Z hint:
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0327654Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0329069Z hint: 'development'. The just-created branch can be renamed via this command:
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0330062Z hint:
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0330447Z hint: 	git branch -m <name>
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0330895Z hint:
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0331464Z hint: Disable this message with "git config set advice.defaultBranchName false"
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0332463Z Initialized empty Git repository in /home/runner/work/Project-Dixis/Project-Dixis/.git/
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0338319Z [command]/usr/bin/git remote add origin https://github.com/lomendor/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0377943Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0379167Z ##[group]Disabling automatic garbage collection
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0383423Z [command]/usr/bin/git config --local gc.auto 0
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0414685Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0415376Z ##[group]Setting up auth
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0422620Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0456675Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0769042Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.0803302Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.1044463Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.1088842Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.1089658Z ##[group]Fetching the repository
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.1097419Z [command]/usr/bin/git -c protocol.version=2 fetch --no-tags --prune --no-recurse-submodules --depth=1 origin +f37f95641b7a0908bc76641a5b28657fb1355a91:refs/remotes/origin/ci/auth-e2e-hotfix
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.5178063Z From https://github.com/lomendor/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.5180293Z  * [new ref]         f37f95641b7a0908bc76641a5b28657fb1355a91 -> origin/ci/auth-e2e-hotfix
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.5211947Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.5213245Z ##[group]Determining the checkout info
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.5216233Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.5221158Z [command]/usr/bin/git sparse-checkout disable
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.5264461Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.5294600Z ##[group]Checking out the ref
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.5299597Z [command]/usr/bin/git checkout --progress --force -B ci/auth-e2e-hotfix refs/remotes/origin/ci/auth-e2e-hotfix
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.5903465Z Switched to a new branch 'ci/auth-e2e-hotfix'
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.5907646Z branch 'ci/auth-e2e-hotfix' set up to track 'origin/ci/auth-e2e-hotfix'.
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.5918128Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.5958007Z [command]/usr/bin/git log -1 --format=%H
type-check	Run actions/checkout@v4	2025-09-22T19:44:47.5981590Z f37f95641b7a0908bc76641a5b28657fb1355a91
type-check	Setup Node.js	﻿2025-09-22T19:44:47.6274586Z ##[group]Run actions/setup-node@v5
type-check	Setup Node.js	2025-09-22T19:44:47.6275742Z with:
type-check	Setup Node.js	2025-09-22T19:44:47.6276577Z   node-version: 20.x
type-check	Setup Node.js	2025-09-22T19:44:47.6277450Z   cache: npm
type-check	Setup Node.js	2025-09-22T19:44:47.6278579Z   cache-dependency-path: frontend/package-lock.json
type-check	Setup Node.js	2025-09-22T19:44:47.6279799Z   always-auth: false
type-check	Setup Node.js	2025-09-22T19:44:47.6280673Z   check-latest: false
type-check	Setup Node.js	2025-09-22T19:44:47.6281847Z   token: ***
type-check	Setup Node.js	2025-09-22T19:44:47.6282712Z   package-manager-cache: true
type-check	Setup Node.js	2025-09-22T19:44:47.6283677Z ##[endgroup]
type-check	Setup Node.js	2025-09-22T19:44:47.7722588Z Found in cache @ /opt/hostedtoolcache/node/20.19.5/x64
type-check	Setup Node.js	2025-09-22T19:44:47.7726946Z (node:2057) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
type-check	Setup Node.js	2025-09-22T19:44:47.7730016Z (Use `node --trace-deprecation ...` to show where the warning was created)
type-check	Setup Node.js	2025-09-22T19:44:47.7732569Z ##[group]Environment details
type-check	Setup Node.js	2025-09-22T19:44:49.4418943Z node: v20.19.5
type-check	Setup Node.js	2025-09-22T19:44:49.4419522Z npm: 10.8.2
type-check	Setup Node.js	2025-09-22T19:44:49.4419936Z yarn: 1.22.22
type-check	Setup Node.js	2025-09-22T19:44:49.4421370Z ##[endgroup]
type-check	Setup Node.js	2025-09-22T19:44:49.4444486Z [command]/opt/hostedtoolcache/node/20.19.5/x64/bin/npm config get cache
type-check	Setup Node.js	2025-09-22T19:44:49.6717388Z /home/runner/.npm
type-check	Setup Node.js	2025-09-22T19:44:49.7773323Z Cache hit for: node-cache-Linux-x64-npm-293628c5a38b8f23887ffd4671116a273ba70156e0aac05412b18ef525fdc791

### Tail (last 120 log lines)
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:20.5697201Z Uploaded bytes 16777216
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:20.7473624Z Uploaded bytes 25165824
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:20.9957803Z Uploaded bytes 33554432
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:21.0072890Z Uploaded bytes 41943040
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:21.2479053Z Uploaded bytes 50331648
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:21.5748617Z Uploaded bytes 58720256
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:21.6041918Z Uploaded bytes 67108864
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:21.8674763Z Uploaded bytes 75497472
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:22.1739307Z Uploaded bytes 83886080
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:22.3126721Z Uploaded bytes 92274688
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:22.6160150Z Uploaded bytes 100663296
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:22.9006512Z Uploaded bytes 109051904
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:23.1938168Z Uploaded bytes 117440512
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:23.3215363Z Uploaded bytes 125829120
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:23.6699674Z Uploaded bytes 134217728
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:23.8245622Z Uploaded bytes 142606336
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:24.0688665Z Uploaded bytes 150994944
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:24.3271462Z Uploaded bytes 159383552
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:24.5822873Z Uploaded bytes 167772160
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:24.8985989Z Uploaded bytes 176160768
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:25.1801519Z Uploaded bytes 184549376
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:25.4536090Z Uploaded bytes 189849953
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:25.5440370Z Finished uploading artifact content to blob storage!
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:25.5442809Z SHA256 digest of uploaded artifact zip is 033aab912b6b84c488fb0da1e8b15568438704ed1718dd5aceddf07bb164c054
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:25.5445044Z Finalizing artifact upload
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:25.8321538Z Artifact e2e-traces-failure.zip successfully finalized. Artifact ID 4076234131
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:25.8322632Z Artifact e2e-traces-failure has been successfully uploaded! Final size is 189849953 bytes. Artifact ID is 4076234131
e2e-tests	Upload E2E traces (on failure only)	2025-09-22T20:15:25.8329553Z Artifact download URL: https://github.com/lomendor/Project-Dixis/actions/runs/17926629532/artifacts/4076234131
e2e-tests	Post Run actions/checkout@v4	﻿2025-09-22T20:15:25.8495865Z Post job cleanup.
e2e-tests	Post Run actions/checkout@v4	2025-09-22T20:15:25.9426532Z [command]/usr/bin/git version
e2e-tests	Post Run actions/checkout@v4	2025-09-22T20:15:25.9463618Z git version 2.51.0
e2e-tests	Post Run actions/checkout@v4	2025-09-22T20:15:25.9508723Z Temporarily overriding HOME='/home/runner/work/_temp/e4c5bf67-9f06-48d5-aed7-b97a14f25fac' before making global git config changes
e2e-tests	Post Run actions/checkout@v4	2025-09-22T20:15:25.9510281Z Adding repository directory to the temporary git global config as a safe directory
e2e-tests	Post Run actions/checkout@v4	2025-09-22T20:15:25.9522846Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
e2e-tests	Post Run actions/checkout@v4	2025-09-22T20:15:25.9557300Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
e2e-tests	Post Run actions/checkout@v4	2025-09-22T20:15:25.9589649Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
e2e-tests	Post Run actions/checkout@v4	2025-09-22T20:15:25.9826549Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
e2e-tests	Post Run actions/checkout@v4	2025-09-22T20:15:25.9849052Z http.https://github.com/.extraheader
e2e-tests	Post Run actions/checkout@v4	2025-09-22T20:15:25.9861862Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
e2e-tests	Post Run actions/checkout@v4	2025-09-22T20:15:25.9893589Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
e2e-tests	Stop containers	﻿2025-09-22T20:15:26.0203979Z Print service container logs: d425f863fd0e49d59e7138ef40536720_postgres15_40049a
e2e-tests	Stop containers	2025-09-22T20:15:26.0208595Z ##[command]/usr/bin/docker logs --details 300df07c47f4dd0d1a24d7c99bb399ca79630f2042bdd113f995a66d91909265
e2e-tests	Stop containers	2025-09-22T20:15:26.0332180Z  The files belonging to this database system will be owned by user "postgres".
e2e-tests	Stop containers	2025-09-22T20:15:26.0332955Z  This user must also own the server process.
e2e-tests	Stop containers	2025-09-22T20:15:26.0333741Z  
e2e-tests	Stop containers	2025-09-22T20:15:26.0334201Z  The database cluster will be initialized with locale "en_US.utf8".
e2e-tests	Stop containers	2025-09-22T20:15:26.0334935Z  The default database encoding has accordingly been set to "UTF8".
e2e-tests	Stop containers	2025-09-22T20:15:26.0335634Z  The default text search configuration will be set to "english".
e2e-tests	Stop containers	2025-09-22T20:15:26.0336164Z  
e2e-tests	Stop containers	2025-09-22T20:15:26.0336477Z  Data page checksums are disabled.
e2e-tests	Stop containers	2025-09-22T20:15:26.0336875Z  
e2e-tests	Stop containers	2025-09-22T20:15:26.0337362Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
e2e-tests	Stop containers	2025-09-22T20:15:26.0338002Z  creating subdirectories ... ok
e2e-tests	Stop containers	2025-09-22T20:15:26.0338776Z  selecting dynamic shared memory implementation ... posix
e2e-tests	Stop containers	2025-09-22T20:15:26.0339375Z  selecting default max_connections ... 100
e2e-tests	Stop containers	2025-09-22T20:15:26.0339710Z  selecting default shared_buffers ... 128MB
e2e-tests	Stop containers	2025-09-22T20:15:26.0340001Z  selecting default time zone ... Etc/UTC
e2e-tests	Stop containers	2025-09-22T20:15:26.0340290Z  creating configuration files ... ok
e2e-tests	Stop containers	2025-09-22T20:15:26.0340575Z  running bootstrap script ... ok
e2e-tests	Stop containers	2025-09-22T20:15:26.0341906Z  initdb: warning: enabling "trust" authentication for local connections
e2e-tests	Stop containers	2025-09-22T20:15:26.0342620Z  initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
e2e-tests	Stop containers	2025-09-22T20:15:26.0343451Z  2025-09-22 19:46:34.985 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e-tests	Stop containers	2025-09-22T20:15:26.0344085Z  2025-09-22 19:46:34.985 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
e2e-tests	Stop containers	2025-09-22T20:15:26.0344517Z  2025-09-22 19:46:34.985 UTC [1] LOG:  listening on IPv6 address "::", port 5432
e2e-tests	Stop containers	2025-09-22T20:15:26.0344993Z  2025-09-22 19:46:34.986 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e-tests	Stop containers	2025-09-22T20:15:26.0345499Z  2025-09-22 19:46:34.990 UTC [65] LOG:  database system was shut down at 2025-09-22 19:46:34 UTC
e2e-tests	Stop containers	2025-09-22T20:15:26.0345966Z  2025-09-22 19:46:34.993 UTC [1] LOG:  database system is ready to accept connections
e2e-tests	Stop containers	2025-09-22T20:15:26.0346374Z  2025-09-22 19:51:35.023 UTC [63] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-22T20:15:26.0347170Z  2025-09-22 19:52:07.386 UTC [63] LOG:  checkpoint complete: wrote 326 buffers (2.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=32.360 s, sync=0.002 s, total=32.364 s; sync files=220, longest=0.001 s, average=0.001 s; distance=1519 kB, estimate=1519 kB
e2e-tests	Stop containers	2025-09-22T20:15:26.0347969Z  2025-09-22 19:56:35.445 UTC [63] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-22T20:15:26.0349001Z  2025-09-22 19:56:36.255 UTC [63] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.802 s, sync=0.002 s, total=0.810 s; sync files=9, longest=0.001 s, average=0.001 s; distance=6 kB, estimate=1368 kB
e2e-tests	Stop containers	2025-09-22T20:15:26.0349787Z  2025-09-22 20:01:35.354 UTC [63] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-22T20:15:26.0350547Z  2025-09-22 20:01:36.159 UTC [63] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.803 s, sync=0.001 s, total=0.805 s; sync files=9, longest=0.001 s, average=0.001 s; distance=6 kB, estimate=1232 kB
e2e-tests	Stop containers	2025-09-22T20:15:26.0351309Z  2025-09-22 20:06:35.237 UTC [63] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-22T20:15:26.0352130Z  2025-09-22 20:06:36.042 UTC [63] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.803 s, sync=0.001 s, total=0.806 s; sync files=9, longest=0.001 s, average=0.001 s; distance=10 kB, estimate=1110 kB
e2e-tests	Stop containers	2025-09-22T20:15:26.0353674Z  2025-09-22 20:11:35.071 UTC [63] LOG:  checkpoint starting: time
e2e-tests	Stop containers	2025-09-22T20:15:26.0354782Z  2025-09-22 20:11:35.876 UTC [63] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.802 s, sync=0.001 s, total=0.805 s; sync files=9, longest=0.001 s, average=0.001 s; distance=9 kB, estimate=1000 kB
e2e-tests	Stop containers	2025-09-22T20:15:26.0355551Z  performing post-bootstrap initialization ... ok
e2e-tests	Stop containers	2025-09-22T20:15:26.0355979Z  syncing data to disk ... ok
e2e-tests	Stop containers	2025-09-22T20:15:26.0356201Z  
e2e-tests	Stop containers	2025-09-22T20:15:26.0356364Z  
e2e-tests	Stop containers	2025-09-22T20:15:26.0356585Z  Success. You can now start the database server using:
e2e-tests	Stop containers	2025-09-22T20:15:26.0356869Z  
e2e-tests	Stop containers	2025-09-22T20:15:26.0357094Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
e2e-tests	Stop containers	2025-09-22T20:15:26.0357381Z  
e2e-tests	Stop containers	2025-09-22T20:15:26.0357924Z  waiting for server to start....2025-09-22 19:46:34.678 UTC [49] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e-tests	Stop containers	2025-09-22T20:15:26.0358873Z  2025-09-22 19:46:34.679 UTC [49] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e-tests	Stop containers	2025-09-22T20:15:26.0359381Z  2025-09-22 19:46:34.682 UTC [52] LOG:  database system was shut down at 2025-09-22 19:46:34 UTC
e2e-tests	Stop containers	2025-09-22T20:15:26.0359838Z  2025-09-22 19:46:34.685 UTC [49] LOG:  database system is ready to accept connections
e2e-tests	Stop containers	2025-09-22T20:15:26.0360174Z   done
e2e-tests	Stop containers	2025-09-22T20:15:26.0360351Z  server started
e2e-tests	Stop containers	2025-09-22T20:15:26.0360547Z  CREATE DATABASE
e2e-tests	Stop containers	2025-09-22T20:15:26.0360732Z  
e2e-tests	Stop containers	2025-09-22T20:15:26.0360887Z  
e2e-tests	Stop containers	2025-09-22T20:15:26.0361197Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
e2e-tests	Stop containers	2025-09-22T20:15:26.0361568Z  
e2e-tests	Stop containers	2025-09-22T20:15:26.0361807Z  2025-09-22 19:46:34.866 UTC [49] LOG:  received fast shutdown request
e2e-tests	Stop containers	2025-09-22T20:15:26.0362274Z  waiting for server to shut down....2025-09-22 19:46:34.866 UTC [49] LOG:  aborting any active transactions
e2e-tests	Stop containers	2025-09-22T20:15:26.0362874Z  2025-09-22 19:46:34.868 UTC [49] LOG:  background worker "logical replication launcher" (PID 55) exited with exit code 1
e2e-tests	Stop containers	2025-09-22T20:15:26.0363362Z  2025-09-22 19:46:34.868 UTC [50] LOG:  shutting down
e2e-tests	Stop containers	2025-09-22T20:15:26.0363716Z  2025-09-22 19:46:34.869 UTC [50] LOG:  checkpoint starting: shutdown immediate
e2e-tests	Stop containers	2025-09-22T20:15:26.0364535Z  2025-09-22 19:46:34.887 UTC [50] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.015 s, sync=0.002 s, total=0.019 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
e2e-tests	Stop containers	2025-09-22T20:15:26.0365325Z  2025-09-22 19:46:34.894 UTC [49] LOG:  database system is shut down
e2e-tests	Stop containers	2025-09-22T20:15:26.0365624Z   done
e2e-tests	Stop containers	2025-09-22T20:15:26.0365802Z  server stopped
e2e-tests	Stop containers	2025-09-22T20:15:26.0365989Z  
e2e-tests	Stop containers	2025-09-22T20:15:26.0366210Z  PostgreSQL init process complete; ready for start up.
e2e-tests	Stop containers	2025-09-22T20:15:26.0366491Z  
e2e-tests	Stop containers	2025-09-22T20:15:26.0372400Z Stop and remove container: d425f863fd0e49d59e7138ef40536720_postgres15_40049a
e2e-tests	Stop containers	2025-09-22T20:15:26.0377081Z ##[command]/usr/bin/docker rm --force 300df07c47f4dd0d1a24d7c99bb399ca79630f2042bdd113f995a66d91909265
e2e-tests	Stop containers	2025-09-22T20:15:26.4209194Z 300df07c47f4dd0d1a24d7c99bb399ca79630f2042bdd113f995a66d91909265
e2e-tests	Stop containers	2025-09-22T20:15:26.4235893Z Remove container network: github_network_c7f0c78cf0d147dc9787b26d07747178
e2e-tests	Stop containers	2025-09-22T20:15:26.4240968Z ##[command]/usr/bin/docker network rm github_network_c7f0c78cf0d147dc9787b26d07747178
e2e-tests	Stop containers	2025-09-22T20:15:26.5515406Z github_network_c7f0c78cf0d147dc9787b26d07747178
e2e-tests	Complete job	﻿2025-09-22T20:15:26.5574244Z Cleaning up orphan processes
e2e-tests	Complete job	2025-09-22T20:15:26.5876250Z Terminate orphan process: pid (3097) (php)
e2e-tests	Complete job	2025-09-22T20:15:26.5893985Z Terminate orphan process: pid (3100) (php8.2)
e2e-tests	Complete job	2025-09-22T20:15:26.5997873Z Terminate orphan process: pid (4567) (npm start)
e2e-tests	Complete job	2025-09-22T20:15:26.6033936Z Terminate orphan process: pid (4578) (sh)
e2e-tests	Complete job	2025-09-22T20:15:26.6058953Z Terminate orphan process: pid (4579) (next-server (v15.5.0))

## 4) Conclusion
- Status: FAILURE detected in e2e-tests job
- Previous fixes (TypeError) successful, but new issues in E2E tests
- Traces uploaded: e2e-traces-failure.zip (189MB)
- End: 2025-09-22T23:17:50+03:00

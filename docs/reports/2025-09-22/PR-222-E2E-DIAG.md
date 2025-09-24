# PR #222 — E2E Failure Diagnostics
Run: https://github.com/lomendor/Project-Dixis/actions/runs/17928542831/job/50980706140

## Failure Summary
- **e2e-tests**: FAILURE
- **frontend-tests**: SUCCESS
- **type-check**: SUCCESS
- **dependabot-smoke**: SKIPPED
- **integration**: CANCELLED

## Head (first 120)
```
type-check	UNKNOWN STEP	﻿2025-09-22T21:08:47.8845017Z Current runner version: '2.328.0'
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8870239Z ##[group]Runner Image Provisioner
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8871164Z Hosted Compute Agent
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8871727Z Version: 20250829.383
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8872310Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8873086Z Build Date: 2025-08-29T13:48:48Z
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8873648Z ##[endgroup]
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8874252Z ##[group]Operating System
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8874837Z Ubuntu
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8875339Z 24.04.3
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8875770Z LTS
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8876299Z ##[endgroup]
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8876770Z ##[group]Runner Image
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8877305Z Image: ubuntu-24.04
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8877844Z Version: 20250907.24.1
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8879113Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8880754Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8881805Z ##[endgroup]
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8882855Z ##[group]GITHUB_TOKEN Permissions
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8884785Z Contents: read
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8885303Z Metadata: read
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8885911Z Packages: read
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8886405Z ##[endgroup]
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8888596Z Secret source: Actions
type-check	UNKNOWN STEP	2025-09-22T21:08:47.8889518Z Prepare workflow directory
type-check	UNKNOWN STEP	2025-09-22T21:08:47.9290462Z Prepare all required actions
type-check	UNKNOWN STEP	2025-09-22T21:08:47.9327671Z Getting action download info
type-check	UNKNOWN STEP	2025-09-22T21:08:48.2829883Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
type-check	UNKNOWN STEP	2025-09-22T21:08:48.4849111Z Download action repository 'actions/setup-node@v5' (SHA:a0853c24544627f65ddf259abe73b1d18a591444)
type-check	UNKNOWN STEP	2025-09-22T21:08:49.0566736Z Complete job name: type-check
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1241130Z ##[group]Run actions/checkout@v4
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1241949Z with:
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1242354Z   repository: lomendor/Project-Dixis
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1243023Z   token: ***
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1243420Z   ssh-strict: true
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1243809Z   ssh-user: git
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1244195Z   persist-credentials: true
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1244633Z   clean: true
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1245022Z   sparse-checkout-cone-mode: true
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1245771Z   fetch-depth: 1
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1246327Z   fetch-tags: false
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1246715Z   show-progress: true
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1247124Z   lfs: false
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1247481Z   submodules: false
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1247886Z   set-safe-directory: true
type-check	UNKNOWN STEP	2025-09-22T21:08:49.1248767Z ##[endgroup]
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2301417Z Syncing repository: lomendor/Project-Dixis
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2303143Z ##[group]Getting Git version info
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2303958Z Working directory is '/home/runner/work/Project-Dixis/Project-Dixis'
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2305123Z [command]/usr/bin/git version
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2379461Z git version 2.51.0
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2404568Z ##[endgroup]
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2424865Z Temporarily overriding HOME='/home/runner/work/_temp/4a4bc81b-df8b-499f-a1cd-3d5d38c5b54c' before making global git config changes
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2427024Z Adding repository directory to the temporary git global config as a safe directory
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2429709Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2464470Z Deleting the contents of '/home/runner/work/Project-Dixis/Project-Dixis'
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2467730Z ##[group]Initializing the repository
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2471868Z [command]/usr/bin/git init /home/runner/work/Project-Dixis/Project-Dixis
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2573543Z hint: Using 'master' as the name for the initial branch. This default branch name
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2575231Z hint: is subject to change. To configure the initial branch name to use in all
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2576753Z hint: of your new repositories, which will suppress this warning, call:
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2577938Z hint:
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2578708Z hint: 	git config --global init.defaultBranch <name>
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2580154Z hint:
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2581031Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2582039Z hint: 'development'. The just-created branch can be renamed via this command:
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2582751Z hint:
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2583138Z hint: 	git branch -m <name>
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2583612Z hint:
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2584471Z hint: Disable this message with "git config set advice.defaultBranchName false"
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2585488Z Initialized empty Git repository in /home/runner/work/Project-Dixis/Project-Dixis/.git/
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2590000Z [command]/usr/bin/git remote add origin https://github.com/lomendor/Project-Dixis
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2626494Z ##[endgroup]
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2627689Z ##[group]Disabling automatic garbage collection
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2631422Z [command]/usr/bin/git config --local gc.auto 0
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2659909Z ##[endgroup]
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2661082Z ##[group]Setting up auth
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2667200Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
type-check	UNKNOWN STEP	2025-09-22T21:08:49.2697777Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
type-check	UNKNOWN STEP	2025-09-22T21:08:49.3012984Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
type-check	UNKNOWN STEP	2025-09-22T21:08:49.3042180Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
type-check	UNKNOWN STEP	2025-09-22T21:08:49.3259765Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
type-check	UNKNOWN STEP	2025-09-22T21:08:49.3292639Z ##[endgroup]
type-check	UNKNOWN STEP	2025-09-22T21:08:49.3293551Z ##[group]Fetching the repository
type-check	UNKNOWN STEP	2025-09-22T21:08:49.3309550Z [command]/usr/bin/git -c protocol.version=2 fetch --no-tags --prune --no-recurse-submodules --depth=1 origin +1470ca32e2ba153802f655ca7412f3fae676c10f:refs/remotes/origin/ci/auth-e2e-hotfix
type-check	UNKNOWN STEP	2025-09-22T21:08:49.9532213Z From https://github.com/lomendor/Project-Dixis
type-check	UNKNOWN STEP	2025-09-22T21:08:49.9534023Z  * [new ref]         1470ca32e2ba153802f655ca7412f3fae676c10f -> origin/ci/auth-e2e-hotfix
type-check	UNKNOWN STEP	2025-09-22T21:08:49.9570683Z ##[endgroup]
type-check	UNKNOWN STEP	2025-09-22T21:08:49.9573033Z ##[group]Determining the checkout info
type-check	UNKNOWN STEP	2025-09-22T21:08:49.9575814Z ##[endgroup]
type-check	UNKNOWN STEP	2025-09-22T21:08:49.9577553Z [command]/usr/bin/git sparse-checkout disable
type-check	UNKNOWN STEP	2025-09-22T21:08:49.9621213Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
type-check	UNKNOWN STEP	2025-09-22T21:08:49.9650350Z ##[group]Checking out the ref
type-check	UNKNOWN STEP	2025-09-22T21:08:49.9654194Z [command]/usr/bin/git checkout --progress --force -B ci/auth-e2e-hotfix refs/remotes/origin/ci/auth-e2e-hotfix
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0254540Z Switched to a new branch 'ci/auth-e2e-hotfix'
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0256641Z branch 'ci/auth-e2e-hotfix' set up to track 'origin/ci/auth-e2e-hotfix'.
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0269455Z ##[endgroup]
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0308331Z [command]/usr/bin/git log -1 --format=%H
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0330606Z 1470ca32e2ba153802f655ca7412f3fae676c10f
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0639282Z ##[group]Run actions/setup-node@v5
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0640440Z with:
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0641242Z   node-version: 20.x
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0642132Z   cache: npm
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0643148Z   cache-dependency-path: frontend/package-lock.json
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0644455Z   always-auth: false
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0645365Z   check-latest: false
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0646572Z   token: ***
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0647448Z   package-manager-cache: true
type-check	UNKNOWN STEP	2025-09-22T21:08:50.0648479Z ##[endgroup]
type-check	UNKNOWN STEP	2025-09-22T21:08:50.2092822Z Found in cache @ /opt/hostedtoolcache/node/20.19.5/x64
type-check	UNKNOWN STEP	2025-09-22T21:08:50.2097069Z (node:2054) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
type-check	UNKNOWN STEP	2025-09-22T21:08:50.2101861Z (Use `node --trace-deprecation ...` to show where the warning was created)
type-check	UNKNOWN STEP	2025-09-22T21:08:50.2105903Z ##[group]Environment details
type-check	UNKNOWN STEP	2025-09-22T21:08:52.3818302Z node: v20.19.5
type-check	UNKNOWN STEP	2025-09-22T21:08:52.3819052Z npm: 10.8.2
type-check	UNKNOWN STEP	2025-09-22T21:08:52.3819478Z yarn: 1.22.22
type-check	UNKNOWN STEP	2025-09-22T21:08:52.3820377Z ##[endgroup]
type-check	UNKNOWN STEP	2025-09-22T21:08:52.3847686Z [command]/opt/hostedtoolcache/node/20.19.5/x64/bin/npm config get cache
type-check	UNKNOWN STEP	2025-09-22T21:08:52.6651558Z /home/runner/.npm
type-check	UNKNOWN STEP	2025-09-22T21:08:52.8513264Z Cache hit for: node-cache-Linux-x64-npm-293628c5a38b8f23887ffd4671116a273ba70156e0aac05412b18ef525fdc791
```

## Tail (last 120)
```
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:36.1450200Z Uploaded bytes 25165824
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:36.3090309Z Uploaded bytes 33554432
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:36.3673288Z Uploaded bytes 41943040
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:36.4274059Z Uploaded bytes 50331648
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:36.6498455Z Uploaded bytes 58720256
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:36.9977002Z Uploaded bytes 67108864
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:37.2453439Z Uploaded bytes 75497472
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:37.4886976Z Uploaded bytes 83886080
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:37.6880700Z Uploaded bytes 92274688
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:38.0037172Z Uploaded bytes 100663296
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:38.2771476Z Uploaded bytes 109051904
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:38.5051889Z Uploaded bytes 117440512
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:38.7599960Z Uploaded bytes 125829120
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:39.0452812Z Uploaded bytes 134217728
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:39.1931889Z Uploaded bytes 142606336
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:39.5120056Z Uploaded bytes 150994944
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:39.7628273Z Uploaded bytes 159383552
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:40.0130848Z Uploaded bytes 167772160
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:40.2734327Z Uploaded bytes 176160768
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:40.4986436Z Uploaded bytes 184549376
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:40.8202113Z Uploaded bytes 192937984
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.0587853Z Uploaded bytes 198100315
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.1453414Z Finished uploading artifact content to blob storage!
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.1456060Z SHA256 digest of uploaded artifact zip is 22010cf703b3843beca9d7d9c79135a37061496ca2bdb9efb01aa9d79bd0f78c
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.1457578Z Finalizing artifact upload
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.3953869Z Artifact e2e-traces-failure.zip successfully finalized. Artifact ID 4076918990
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.3954929Z Artifact e2e-traces-failure has been successfully uploaded! Final size is 198100315 bytes. Artifact ID is 4076918990
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.3961953Z Artifact download URL: https://github.com/lomendor/Project-Dixis/actions/runs/17928542831/artifacts/4076918990
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.4144960Z Post job cleanup.
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5065534Z [command]/usr/bin/git version
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5101078Z git version 2.51.0
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5144750Z Temporarily overriding HOME='/home/runner/work/_temp/2cdf9127-6341-4707-a532-33c918b8d622' before making global git config changes
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5146274Z Adding repository directory to the temporary git global config as a safe directory
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5157646Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5191249Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5223300Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5449826Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5470778Z http.https://github.com/.extraheader
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5483713Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5514314Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5816954Z Print service container logs: 8288506ba6c5400d986ee9584f5199e5_postgres15_3aba46
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5822310Z ##[command]/usr/bin/docker logs --details 69434523211f9328ee687378c181f3e47eeabba4bbd7d21c8102cde0ec2c2a49
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5943151Z  The files belonging to this database system will be owned by user "postgres".
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5943903Z  This user must also own the server process.
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5944395Z  
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5944878Z  The database cluster will be initialized with locale "en_US.utf8".
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5945675Z  The default database encoding has accordingly been set to "UTF8".
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5946424Z  The default text search configuration will be set to "english".
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5947000Z  
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5947348Z  Data page checksums are disabled.
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5947780Z  
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5948275Z  fixing permissions on existing directory /var/lib/postgresql/data ... ok
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5948994Z  creating subdirectories ... ok
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5949571Z  selecting dynamic shared memory implementation ... posix
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5951236Z  initdb: warning: enabling "trust" authentication for local connections
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5951929Z  initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5952781Z  2025-09-22 21:10:34.609 UTC [1] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5953420Z  2025-09-22 21:10:34.609 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5953870Z  2025-09-22 21:10:34.609 UTC [1] LOG:  listening on IPv6 address "::", port 5432
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5954355Z  2025-09-22 21:10:34.611 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5954872Z  2025-09-22 21:10:34.614 UTC [64] LOG:  database system was shut down at 2025-09-22 21:10:34 UTC
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5955335Z  2025-09-22 21:10:34.618 UTC [1] LOG:  database system is ready to accept connections
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5955736Z  2025-09-22 21:15:34.711 UTC [62] LOG:  checkpoint starting: time
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5956561Z  2025-09-22 21:16:07.074 UTC [62] LOG:  checkpoint complete: wrote 326 buffers (2.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=32.358 s, sync=0.002 s, total=32.363 s; sync files=220, longest=0.001 s, average=0.001 s; distance=1521 kB, estimate=1521 kB
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5957383Z  2025-09-22 21:20:34.112 UTC [62] LOG:  checkpoint starting: time
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5958162Z  2025-09-22 21:20:34.916 UTC [62] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.802 s, sync=0.001 s, total=0.805 s; sync files=9, longest=0.001 s, average=0.001 s; distance=6 kB, estimate=1370 kB
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5958937Z  2025-09-22 21:25:34.996 UTC [62] LOG:  checkpoint starting: time
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5959709Z  2025-09-22 21:25:35.802 UTC [62] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.802 s, sync=0.002 s, total=0.806 s; sync files=9, longest=0.002 s, average=0.001 s; distance=6 kB, estimate=1233 kB
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5960970Z  2025-09-22 21:30:34.887 UTC [62] LOG:  checkpoint starting: time
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5961738Z  2025-09-22 21:30:35.693 UTC [62] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.802 s, sync=0.001 s, total=0.806 s; sync files=9, longest=0.001 s, average=0.001 s; distance=10 kB, estimate=1111 kB
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5962505Z  2025-09-22 21:35:34.793 UTC [62] LOG:  checkpoint starting: time
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5963264Z  2025-09-22 21:35:35.601 UTC [62] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.803 s, sync=0.003 s, total=0.808 s; sync files=9, longest=0.003 s, average=0.001 s; distance=9 kB, estimate=1001 kB
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5964871Z  selecting default max_connections ... 100
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5965298Z  selecting default shared_buffers ... 128MB
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5965603Z  selecting default time zone ... Etc/UTC
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5965877Z  creating configuration files ... ok
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5966145Z  running bootstrap script ... ok
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5966435Z  performing post-bootstrap initialization ... ok
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5966730Z  syncing data to disk ... ok
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5966952Z  
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5967114Z  
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5967335Z  Success. You can now start the database server using:
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5967621Z  
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5967846Z      pg_ctl -D /var/lib/postgresql/data -l logfile start
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5968127Z  
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5968682Z  waiting for server to start....2025-09-22 21:10:34.304 UTC [48] LOG:  starting PostgreSQL 15.14 (Debian 15.14-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5969473Z  2025-09-22 21:10:34.305 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5969986Z  2025-09-22 21:10:34.308 UTC [51] LOG:  database system was shut down at 2025-09-22 21:10:34 UTC
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5970628Z  2025-09-22 21:10:34.311 UTC [48] LOG:  database system is ready to accept connections
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5970971Z   done
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5971146Z  server started
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5971337Z  CREATE DATABASE
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5971519Z  
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5971679Z  
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5971987Z  /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5972359Z  
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5972597Z  2025-09-22 21:10:34.490 UTC [48] LOG:  received fast shutdown request
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5973070Z  waiting for server to shut down....2025-09-22 21:10:34.491 UTC [48] LOG:  aborting any active transactions
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5973683Z  2025-09-22 21:10:34.493 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5974165Z  2025-09-22 21:10:34.493 UTC [49] LOG:  shutting down
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5974529Z  2025-09-22 21:10:34.493 UTC [49] LOG:  checkpoint starting: shutdown immediate
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5975353Z  2025-09-22 21:10:34.511 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.015 s, sync=0.002 s, total=0.019 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5976165Z  2025-09-22 21:10:34.518 UTC [48] LOG:  database system is shut down
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5976466Z   done
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5976644Z  server stopped
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5976832Z  
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5977056Z  PostgreSQL init process complete; ready for start up.
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5977340Z  
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5983067Z Stop and remove container: 8288506ba6c5400d986ee9584f5199e5_postgres15_3aba46
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.5987576Z ##[command]/usr/bin/docker rm --force 69434523211f9328ee687378c181f3e47eeabba4bbd7d21c8102cde0ec2c2a49
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.9855219Z 69434523211f9328ee687378c181f3e47eeabba4bbd7d21c8102cde0ec2c2a49
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.9881819Z Remove container network: github_network_bb0358c41128403fa10bf8d094752a05
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:41.9886086Z ##[command]/usr/bin/docker network rm github_network_bb0358c41128403fa10bf8d094752a05
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:42.1151122Z github_network_bb0358c41128403fa10bf8d094752a05
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:42.1209015Z Cleaning up orphan processes
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:42.1536479Z Terminate orphan process: pid (3109) (php)
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:42.1553927Z Terminate orphan process: pid (3112) (php8.2)
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:42.1656368Z Terminate orphan process: pid (4603) (npm start)
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:42.1681700Z Terminate orphan process: pid (4614) (sh)
e2e-tests	UNKNOWN STEP	2025-09-22T21:39:42.1705949Z Terminate orphan process: pid (4615) (next-server (v15.5.0))
```

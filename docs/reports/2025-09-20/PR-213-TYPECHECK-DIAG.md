# PR #213 — Type-Check Diagnostics (2025-09-20)

## Link
https://github.com/lomendor/Project-Dixis/actions/runs/17880106103/job/50846665669

## First errors (top 30)
```
ERR_PNPM_NO_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is absent
```

## Head (first 120 lines)
```
type-check	Set up job	﻿2025-09-20T12:55:26.2571037Z Current runner version: '2.328.0'
type-check	Set up job	2025-09-20T12:55:26.2609568Z ##[group]Runner Image Provisioner
type-check	Set up job	2025-09-20T12:55:26.2610798Z Hosted Compute Agent
type-check	Set up job	2025-09-20T12:55:26.2611712Z Version: 20250829.383
type-check	Set up job	2025-09-20T12:55:26.2612698Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
type-check	Set up job	2025-09-20T12:55:26.2613807Z Build Date: 2025-08-29T13:48:48Z
type-check	Set up job	2025-09-20T12:55:26.2614946Z ##[endgroup]
type-check	Set up job	2025-09-20T12:55:26.2615833Z ##[group]Operating System
type-check	Set up job	2025-09-20T12:55:26.2616615Z Image: ubuntu-24.04
type-check	Set up job	2025-09-20T12:55:26.2617301Z Version: 20250916.1.0
type-check	Set up job	2025-09-20T12:55:26.2618182Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250916.1/images/ubuntu/Ubuntu2404-Readme.md
type-check	Set up job	2025-09-20T12:55:26.2619341Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250916.1
type-check	Set up job	2025-09-20T12:55:26.2620475Z ##[endgroup]
type-check	Set up job	2025-09-20T12:55:26.2621278Z ##[group]Runner Image Provisioner
type-check	Set up job	2025-09-20T12:55:26.2622068Z Image was provisioned from a shared gallery
type-check	Set up job	2025-09-20T12:55:26.2622779Z ##[endgroup]
type-check	Set up job	2025-09-20T12:55:26.2623531Z ##[group]GITHUB_TOKEN Permissions
type-check	Set up job	2025-09-20T12:55:26.2624344Z Contents: read
type-check	Set up job	2025-09-20T12:55:26.2624966Z Metadata: read
type-check	Set up job	2025-09-20T12:55:26.2625611Z ##[endgroup]
type-check	Set up job	2025-09-20T12:55:26.2626376Z Secret source: Actions
type-check	Set up job	2025-09-20T12:55:26.2627096Z Prepare workflow directory
type-check	Set up job	2025-09-20T12:55:26.2746079Z Prepare all required actions
type-check	Set up job	2025-09-20T12:55:26.2759096Z Getting action download info
type-check	Set up job	2025-09-20T12:55:26.3916806Z Download action repository 'actions/checkout@v4' (SHA:d632683dd7b4114ad314bca15554477dd762a938)
type-check	Set up job	2025-09-20T12:55:26.4789076Z Download action repository 'actions/setup-node@v5' (SHA:0a44ba7841725637a19e28fa30b79a866c81b0a6)
type-check	Set up job	2025-09-20T12:55:26.5264825Z Download action repository 'pnpm/action-setup@v4' (SHA:fe1e16c48bc669cc9fe2182058d41896d3e76cbc)
type-check	Set up job	2025-09-20T12:55:26.5684693Z Uses: actions/checkout@v4
type-check	Set up job	2025-09-20T12:55:26.5685344Z Uses: actions/setup-node@v5
type-check	Set up job	2025-09-20T12:55:26.5685821Z Uses: pnpm/action-setup@v4
type-check	Set up job	2025-09-20T12:55:26.5686362Z Complete job name: type-check
type-check	Run actions/checkout@v4	﻿2025-09-20T12:55:26.8043652Z ##[group]Run actions/checkout@v4
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8044013Z with:
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8044279Z   token: ***
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8044536Z   ssh-strict: true
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8044797Z   ssh-user: git
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8045052Z   persist-credentials: true
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8045339Z   clean: true
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8045602Z   sparse-checkout-cone-mode: true
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8045908Z   fetch-depth: 1
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8046178Z   fetch-tags: false
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8046459Z   show-progress: true
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8046732Z   lfs: false
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8046984Z   submodules: false
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8047251Z   set-safe-directory: true
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8047527Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8394549Z ##[group]Getting Git version info
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8395108Z Working directory is '/home/runner/work/Project-Dixis/Project-Dixis'
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8396001Z [command]/usr/bin/git version
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8437651Z git version 2.51.0
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8458659Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8459306Z Temporarily overriding HOME='/home/runner/work/_temp/73a50b55-6d11-41c1-9ffa-33b9f67a3536' before making global git config changes
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8460445Z Adding repository directory to the temporary git global config as a safe directory
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8467138Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8508433Z ##[group]Determining the checkout info
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8511364Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8511891Z ##[group]Git LFS checkout info
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8512393Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8512859Z ##[group]Checking out the ref
type-check	Run actions/checkout@v4	2025-09-20T12:55:26.8513542Z [command]/usr/bin/git checkout --progress --force refs/remotes/pull/213/merge
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3969772Z Note: switching to 'refs/remotes/pull/213/merge'.
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3970549Z
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3970956Z You are in 'detached HEAD' state. You can look around, make experimental
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3971644Z changes and commit them, and you can discard any commits you make in this
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3972317Z state without impacting any branches by switching back to a branch.
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3972993Z
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3973423Z If you want to create a new branch to retain commits you create, you may
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3974086Z do so (now or later) by using -c with the switch command. Example:
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3974648Z
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3975026Z   git switch -c <new-branch-name>
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3975568Z
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3975980Z Or undo this operation with:
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3976455Z
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3976809Z   git switch -
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3977186Z
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3977644Z Turn off this advice by setting config variable advice.detachedHead to false
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3978303Z
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3971887Z HEAD is now at fa792d9 Merge 94f4d83eea74e7a0452ca98a80e6f1cc4a9a2f9e into 4b63b1741df4e8274a630caa6f95810d79abeca7
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.3977249Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.4008808Z [command]/usr/bin/git log -1 --format=%H
type-check	Run actions/checkout@v4	2025-09-20T12:55:28.4032436Z fa792d93bfa2787591b82c18f78e83a5b04d3c89
type-check	Setup Node.js	﻿2025-09-20T12:55:28.4353420Z ##[group]Run actions/setup-node@v5
type-check	Setup Node.js	2025-09-20T12:55:28.4354655Z with:
type-check	Setup Node.js	2025-09-20T12:55:28.4355529Z   node-version: 20.x
type-check	Setup Node.js	2025-09-20T12:55:28.4356597Z   always-auth: false
```

## Tail (last 200 lines)
```
type-check	Setup Node.js	2025-09-20T12:55:28.4357618Z   check-latest: false
type-check	Setup Node.js	2025-09-20T12:55:28.4359221Z   token: ***
type-check	Setup Node.js	2025-09-20T12:55:28.4360288Z   package-manager-cache: true
type-check	Setup Node.js	2025-09-20T12:55:28.4361445Z ##[endgroup]
type-check	Setup Node.js	2025-09-20T12:55:28.6207085Z (node:2056) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
type-check	Setup Node.js	2025-09-20T12:55:28.6212080Z (Use `node --trace-deprecation ...` to show where the warning was created)
type-check	Setup Node.js	2025-09-20T12:55:28.6233597Z Found in cache @ /opt/hostedtoolcache/node/20.19.5/x64
type-check	Setup Node.js	2025-09-20T12:55:28.6236994Z ##[group]Environment details
type-check	Setup Node.js	2025-09-20T12:55:31.4781309Z node: v20.19.5
type-check	Setup Node.js	2025-09-20T12:55:31.4782189Z npm: 10.8.2
type-check	Setup Node.js	2025-09-20T12:55:31.4782783Z yarn: 1.22.22
type-check	Setup Node.js	2025-09-20T12:55:31.4784549Z ##[endgroup]
type-check	Setup pnpm	﻿2025-09-20T12:55:31.4994935Z ##[group]Run pnpm/action-setup@v4
type-check	Setup pnpm	2025-09-20T12:55:31.4995272Z with:
type-check	Setup pnpm	2025-09-20T12:55:31.4995470Z   version: 9
type-check	Setup pnpm	2025-09-20T12:55:31.4995681Z   dest: ~/setup-pnpm
type-check	Setup pnpm	2025-09-20T12:55:31.4995903Z   run_install: null
type-check	Setup pnpm	2025-09-20T12:55:31.4996138Z   package_json_file: package.json
type-check	Setup pnpm	2025-09-20T12:55:31.4996394Z   standalone: false
type-check	Setup pnpm	2025-09-20T12:55:31.4996617Z ##[endgroup]
type-check	Setup pnpm	2025-09-20T12:55:31.5546545Z ##[group]Running self-installer...
type-check	Setup pnpm	2025-09-20T12:55:32.1003114Z Progress: resolved 1, reused 0, downloaded 0, added 0
type-check	Setup pnpm	2025-09-20T12:55:32.1120889Z Packages: +1
type-check	Setup pnpm	2025-09-20T12:55:32.1121812Z +
type-check	Setup pnpm	2025-09-20T12:55:32.5005495Z Progress: resolved 1, reused 0, downloaded 1, added 1, done
type-check	Setup pnpm	2025-09-20T12:55:32.5301012Z
type-check	Setup pnpm	2025-09-20T12:55:32.5301645Z dependencies:
type-check	Setup pnpm	2025-09-20T12:55:32.5302112Z + pnpm 9.15.9 (10.17.0 is available)
type-check	Setup pnpm	2025-09-20T12:55:32.5302467Z
type-check	Setup pnpm	2025-09-20T12:55:32.5334422Z Done in 812ms
type-check	Setup pnpm	2025-09-20T12:55:32.5502889Z ##[endgroup]
type-check	Setup pnpm	2025-09-20T12:55:32.5506823Z Installation Completed!
type-check	Install dependencies	﻿2025-09-20T12:55:32.5603735Z ##[group]Run pnpm install --frozen-lockfile
type-check	Install dependencies	2025-09-20T12:55:32.5604137Z [36;1mpnpm install --frozen-lockfile[0m
type-check	Install dependencies	2025-09-20T12:55:32.5904372Z shell: /usr/bin/bash -e {0}
type-check	Install dependencies	2025-09-20T12:55:32.5904687Z env:
type-check	Install dependencies	2025-09-20T12:55:32.5904958Z   PNPM_HOME: /home/runner/setup-pnpm/node_modules/.bin
type-check	Install dependencies	2025-09-20T12:55:32.5905320Z ##[endgroup]
type-check	Install dependencies	2025-09-20T12:55:33.1588822Z  ERR_PNPM_NO_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is absent
type-check	Install dependencies	2025-09-20T12:55:33.1589692Z
type-check	Install dependencies	2025-09-20T12:55:33.1819791Z Note that in CI environments this setting is true by default. If you still need to run install in such cases, use "pnpm install --no-frozen-lockfile"
type-check	Install dependencies	2025-09-20T12:55:33.1833184Z ##[error]Process completed with exit code 1.
type-check	Post Setup pnpm	﻿2025-09-20T12:55:33.1895895Z Post job cleanup.
type-check	Post Setup pnpm	2025-09-20T12:55:33.2453397Z Pruning is unnecessary.
type-check	Post Run actions/checkout@v4	﻿2025-09-20T12:55:33.2551205Z Post job cleanup.
type-check	Post Run actions/checkout@v4	2025-09-20T12:55:33.3527778Z [command]/usr/bin/git version
type-check	Post Run actions/checkout@v4	2025-09-20T12:55:33.3573764Z git version 2.51.0
type-check	Post Run actions/checkout@v4	2025-09-20T12:55:33.3619763Z Temporarily overriding HOME='/home/runner/work/_temp/235af850-1562-41ed-85ff-e103d890e170' before making global git config changes
type-check	Post Run actions/checkout@v4	2025-09-20T12:55:33.3621320Z Adding repository directory to the temporary git global config as a safe directory
type-check	Post Run actions/checkout@v4	2025-09-20T12:55:33.3626202Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
type-check	Post Run actions/checkout@v4	2025-09-20T12:55:33.3664269Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
type-check	Post Run actions/checkout@v4	2025-09-20T12:55:33.3699062Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
type-check	Post Run actions/checkout@v4	2025-09-20T12:55:33.3932583Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
type-check	Post Run actions/checkout@v4	2025-09-20T12:55:33.3955805Z http.https://github.com/.extraheader
type-check	Post Run actions/checkout@v4	2025-09-20T12:55:33.3971109Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
type-check	Post Run actions/checkout@v4	2025-09-20T12:55:33.4005495Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
type-check	Complete job	﻿2025-09-20T12:55:33.4337315Z Cleaning up orphan processes
```

## Likely cause (hypothesis)

- **Primary issue**: Missing `pnpm-lock.yaml` file in repository root
- **Root cause**: Workflow consolidation changed from npm to pnpm, but lockfile doesn't exist
- **Current state**: Repository uses `npm` and has `package-lock.json`, but CI now expects `pnpm-lock.yaml`
- **Impact**: All frontend CI jobs fail at dependency installation step

## Minimal, safe fix plan (DO NOT APPLY YET)

1. **Check package manager setup**: Verify if repo should use pnpm or npm
   - File: `frontend-ci.yml` line ~59 (pnpm setup step)
   - Option A: Change back to npm (revert pnpm standardization for this repo)
   - Option B: Generate pnpm-lock.yaml from existing package-lock.json

2. **Working directory fix**: Ensure CI runs in correct directory
   - File: `frontend-ci.yml` - add `working-directory: frontend` to install step
   - Current: runs in repo root, should run in `frontend/` subdirectory

3. **Lockfile alignment**:
   - If keeping pnpm: Run `cd frontend && pnpm install` locally to generate pnpm-lock.yaml
   - If reverting to npm: Change workflow to use npm instead of pnpm setup
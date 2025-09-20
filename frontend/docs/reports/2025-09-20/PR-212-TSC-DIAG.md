# PR #212 — TypeScript Type-Check Diagnostics (2025-09-20)

## Job 1
- URL: https://github.com/lomendor/Project-Dixis/actions/runs/17879493106/job/50845314657
- RUN_ID: 17879493106

### Head (first 120 lines)
```
type-check	Set up job	﻿2025-09-20T11:52:07.3611761Z Current runner version: '2.328.0'
type-check	Set up job	2025-09-20T11:52:07.3637308Z ##[group]Runner Image Provisioner
type-check	Set up job	2025-09-20T11:52:07.3638240Z Hosted Compute Agent
type-check	Set up job	2025-09-20T11:52:07.3638760Z Version: 20250829.383
type-check	Set up job	2025-09-20T11:52:07.3639348Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
type-check	Set up job	2025-09-20T11:52:07.3640122Z Build Date: 2025-08-29T13:48:48Z
type-check	Set up job	2025-09-20T11:52:07.3640722Z ##[endgroup]
type-check	Set up job	2025-09-20T11:52:07.3641306Z ##[group]Operating System
type-check	Set up job	2025-09-20T11:52:07.3641896Z Ubuntu
type-check	Set up job	2025-09-20T11:52:07.3642374Z 24.04.3
type-check	Set up job	2025-09-20T11:52:07.3642803Z LTS
type-check	Set up job	2025-09-20T11:52:07.3643323Z ##[endgroup]
type-check	Set up job	2025-09-20T11:52:07.3643762Z ##[group]Runner Image
type-check	Set up job	2025-09-20T11:52:07.3644332Z Image: ubuntu-24.04
type-check	Set up job	2025-09-20T11:52:07.3644837Z Version: 20250907.24.1
type-check	Set up job	2025-09-20T11:52:07.3646427Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
type-check	Set up job	2025-09-20T11:52:07.3647829Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
type-check	Set up job	2025-09-20T11:52:07.3649017Z ##[endgroup]
type-check	Set up job	2025-09-20T11:52:07.3650193Z ##[group]GITHUB_TOKEN Permissions
type-check	Set up job	2025-09-20T11:52:07.3652388Z Contents: read
type-check	Set up job	2025-09-20T11:52:07.3652897Z Metadata: read
type-check	Set up job	2025-09-20T11:52:07.3653458Z Packages: read
type-check	Set up job	2025-09-20T11:52:07.3653926Z ##[endgroup]
type-check	Set up job	2025-09-20T11:52:07.3656163Z Secret source: Actions
type-check	Set up job	2025-09-20T11:52:07.3657070Z Prepare workflow directory
type-check	Set up job	2025-09-20T11:52:07.4070437Z Prepare all required actions
type-check	Set up job	2025-09-20T11:52:07.4109098Z Getting action download info
type-check	Set up job	2025-09-20T11:52:07.7739196Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
type-check	Set up job	2025-09-20T11:52:07.9435036Z Download action repository 'actions/setup-node@v5' (SHA:a0853c24544627f65ddf259abe73b1d18a591444)
type-check	Set up job	2025-09-20T11:52:08.5319461Z Download action repository 'pnpm/action-setup@v4' (SHA:a7487c7e89a18df4991f7f222e4898a00d66ddda)
type-check	Set up job	2025-09-20T11:52:09.1203928Z Complete job name: type-check
type-check	Run actions/checkout@v4	﻿2025-09-20T11:52:09.2014669Z ##[group]Run actions/checkout@v4
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2016204Z with:
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2017064Z   repository: lomendor/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2018388Z   token: ***
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2019146Z   ssh-strict: true
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2019933Z   ssh-user: git
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2020735Z   persist-credentials: true
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2021622Z   clean: true
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2022427Z   sparse-checkout-cone-mode: true
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2023397Z   fetch-depth: 1
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2024166Z   fetch-tags: false
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2024972Z   show-progress: true
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2025886Z   lfs: false
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2026633Z   submodules: false
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2027452Z   set-safe-directory: true
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2028627Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3167927Z Syncing repository: lomendor/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3171944Z ##[group]Getting Git version info
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3174328Z Working directory is '/home/runner/work/Project-Dixis/Project-Dixis'
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3178023Z [command]/usr/bin/git version
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3268028Z git version 2.51.0
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3296547Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3311006Z Temporarily overriding HOME='/home/runner/work/_temp/94ffa5e0-1a7e-4459-87b7-b9b98ba58a63' before making global git config changes
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3315542Z Adding repository directory to the temporary git global config as a safe directory
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3320744Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3358583Z Deleting the contents of '/home/runner/work/Project-Dixis/Project-Dixis'
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3362814Z ##[group]Initializing the repository
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3368882Z [command]/usr/bin/git init /home/runner/work/Project-Dixis/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3482524Z hint: Using 'master' as the name for the initial branch. This default branch name
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3485946Z hint: is subject to change. To configure the initial branch name to use in all
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3488418Z hint: of your new repositories, which will suppress this warning, call:
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3490070Z hint:
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3491171Z hint: 	git config --global init.defaultBranch <name>
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3492781Z hint:
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3493870Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3495835Z hint: 'development'. The just-created branch can be renamed via this command:
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3497370Z hint:
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3498385Z hint: 	git branch -m <name>
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3499258Z hint:
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3500412Z hint: Disable this message with "git config set advice.defaultBranchName false"
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3502492Z Initialized empty Git repository in /home/runner/work/Project-Dixis/Project-Dixis/.git/
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3505953Z [command]/usr/bin/git remote add origin https://github.com/lomendor/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3540110Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3541488Z ##[group]Disabling automatic garbage collection
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3543402Z [command]/usr/bin/git config --local gc.auto 0
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3572606Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3573977Z ##[group]Setting up auth
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3579370Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3609538Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3969652Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.4003493Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.4251642Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.4292599Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.4295298Z ##[group]Fetching the repository
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.4304326Z [command]/usr/bin/git -c protocol.version=2 fetch --no-tags --prune --no-recurse-submodules --depth=1 origin +f4bebf0a7dab27937169bb68060d923af954861d:refs/remotes/pull/212/merge
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0165279Z From https://github.com/lomendor/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0167440Z  * [new ref]         f4bebf0a7dab27937169bb68060d923af954861d -> pull/212/merge
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0197909Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0200072Z ##[group]Determining the checkout info
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0202725Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0206050Z [command]/usr/bin/git sparse-checkout disable
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0248070Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0277315Z ##[group]Checking out the ref
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0280605Z [command]/usr/bin/git checkout --progress --force refs/remotes/pull/212/merge
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0831639Z Note: switching to 'refs/remotes/pull/212/merge'.
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0833007Z 
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0833816Z You are in 'detached HEAD' state. You can look around, make experimental
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0836098Z changes and commit them, and you can discard any commits you make in this
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0838401Z state without impacting any branches by switching back to a branch.
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0840144Z 
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0841189Z If you want to create a new branch to retain commits you create, you may
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0843500Z do so (now or later) by using -c with the switch command. Example:
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0845169Z 
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0845968Z   git switch -c <new-branch-name>
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0847059Z 
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0847584Z Or undo this operation with:
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0848516Z 
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0849003Z   git switch -
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0849697Z 
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0850833Z Turn off this advice by setting config variable advice.detachedHead to false
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0852499Z 
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0854418Z HEAD is now at f4bebf0 Merge cf33e45a4fa73efa21b3591feee98d2da1624b55 into 4b63b1741df4e8274a630caa6f95810d79abeca7
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0859080Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0885480Z [command]/usr/bin/git log -1 --format=%H
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0908027Z f4bebf0a7dab27937169bb68060d923af954861d
type-check	Setup Node.js	﻿2025-09-20T11:52:10.1187448Z ##[group]Run actions/setup-node@v5
type-check	Setup Node.js	2025-09-20T11:52:10.1188359Z with:
type-check	Setup Node.js	2025-09-20T11:52:10.1188956Z   node-version: 20.x
type-check	Setup Node.js	2025-09-20T11:52:10.1189628Z   cache: pnpm
```

### Tail (last 120 lines)
```
type-check	Set up job	2025-09-20T11:52:07.9435036Z Download action repository 'actions/setup-node@v5' (SHA:a0853c24544627f65ddf259abe73b1d18a591444)
type-check	Set up job	2025-09-20T11:52:08.5319461Z Download action repository 'pnpm/action-setup@v4' (SHA:a7487c7e89a18df4991f7f222e4898a00d66ddda)
type-check	Set up job	2025-09-20T11:52:09.1203928Z Complete job name: type-check
type-check	Run actions/checkout@v4	﻿2025-09-20T11:52:09.2014669Z ##[group]Run actions/checkout@v4
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2016204Z with:
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2017064Z   repository: lomendor/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2018388Z   token: ***
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2019146Z   ssh-strict: true
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2019933Z   ssh-user: git
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2020735Z   persist-credentials: true
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2021622Z   clean: true
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2022427Z   sparse-checkout-cone-mode: true
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2023397Z   fetch-depth: 1
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2024166Z   fetch-tags: false
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2024972Z   show-progress: true
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2025886Z   lfs: false
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2026633Z   submodules: false
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2027452Z   set-safe-directory: true
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.2028627Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3167927Z Syncing repository: lomendor/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3171944Z ##[group]Getting Git version info
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3174328Z Working directory is '/home/runner/work/Project-Dixis/Project-Dixis'
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3178023Z [command]/usr/bin/git version
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3268028Z git version 2.51.0
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3296547Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3311006Z Temporarily overriding HOME='/home/runner/work/_temp/94ffa5e0-1a7e-4459-87b7-b9b98ba58a63' before making global git config changes
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3315542Z Adding repository directory to the temporary git global config as a safe directory
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3320744Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3358583Z Deleting the contents of '/home/runner/work/Project-Dixis/Project-Dixis'
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3362814Z ##[group]Initializing the repository
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3368882Z [command]/usr/bin/git init /home/runner/work/Project-Dixis/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3482524Z hint: Using 'master' as the name for the initial branch. This default branch name
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3485946Z hint: is subject to change. To configure the initial branch name to use in all
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3488418Z hint: of your new repositories, which will suppress this warning, call:
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3490070Z hint:
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3491171Z hint: 	git config --global init.defaultBranch <name>
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3492781Z hint:
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3493870Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3495835Z hint: 'development'. The just-created branch can be renamed via this command:
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3497370Z hint:
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3498385Z hint: 	git branch -m <name>
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3499258Z hint:
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3500412Z hint: Disable this message with "git config set advice.defaultBranchName false"
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3502492Z Initialized empty Git repository in /home/runner/work/Project-Dixis/Project-Dixis/.git/
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3505953Z [command]/usr/bin/git remote add origin https://github.com/lomendor/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3540110Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3541488Z ##[group]Disabling automatic garbage collection
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3543402Z [command]/usr/bin/git config --local gc.auto 0
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3572606Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3573977Z ##[group]Setting up auth
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3579370Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3609538Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.3969652Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.4003493Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.4251642Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.4292599Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.4295298Z ##[group]Fetching the repository
type-check	Run actions/checkout@v4	2025-09-20T11:52:09.4304326Z [command]/usr/bin/git -c protocol.version=2 fetch --no-tags --prune --no-recurse-submodules --depth=1 origin +f4bebf0a7dab27937169bb68060d923af954861d:refs/remotes/pull/212/merge
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0165279Z From https://github.com/lomendor/Project-Dixis
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0167440Z  * [new ref]         f4bebf0a7dab27937169bb68060d923af954861d -> pull/212/merge
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0197909Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0200072Z ##[group]Determining the checkout info
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0202725Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0206050Z [command]/usr/bin/git sparse-checkout disable
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0248070Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0277315Z ##[group]Checking out the ref
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0280605Z [command]/usr/bin/git checkout --progress --force refs/remotes/pull/212/merge
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0831639Z Note: switching to 'refs/remotes/pull/212/merge'.
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0833007Z 
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0833816Z You are in 'detached HEAD' state. You can look around, make experimental
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0836098Z changes and commit them, and you can discard any commits you make in this
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0838401Z state without impacting any branches by switching back to a branch.
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0840144Z 
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0841189Z If you want to create a new branch to retain commits you create, you may
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0843500Z do so (now or later) by using -c with the switch command. Example:
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0845169Z 
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0845968Z   git switch -c <new-branch-name>
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0847059Z 
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0847584Z Or undo this operation with:
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0848516Z 
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0849003Z   git switch -
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0849697Z 
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0850833Z Turn off this advice by setting config variable advice.detachedHead to false
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0852499Z 
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0854418Z HEAD is now at f4bebf0 Merge cf33e45a4fa73efa21b3591feee98d2da1624b55 into 4b63b1741df4e8274a630caa6f95810d79abeca7
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0859080Z ##[endgroup]
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0885480Z [command]/usr/bin/git log -1 --format=%H
type-check	Run actions/checkout@v4	2025-09-20T11:52:10.0908027Z f4bebf0a7dab27937169bb68060d923af954861d
type-check	Setup Node.js	﻿2025-09-20T11:52:10.1187448Z ##[group]Run actions/setup-node@v5
type-check	Setup Node.js	2025-09-20T11:52:10.1188359Z with:
type-check	Setup Node.js	2025-09-20T11:52:10.1188956Z   node-version: 20.x
type-check	Setup Node.js	2025-09-20T11:52:10.1189628Z   cache: pnpm
type-check	Setup Node.js	2025-09-20T11:52:10.1190405Z   cache-dependency-path: frontend/pnpm-lock.yaml
type-check	Setup Node.js	2025-09-20T11:52:10.1191411Z   always-auth: false
type-check	Setup Node.js	2025-09-20T11:52:10.1192099Z   check-latest: false
type-check	Setup Node.js	2025-09-20T11:52:10.1193037Z   token: ***
type-check	Setup Node.js	2025-09-20T11:52:10.1193699Z   package-manager-cache: true
type-check	Setup Node.js	2025-09-20T11:52:10.1194487Z ##[endgroup]
type-check	Setup Node.js	2025-09-20T11:52:10.3009424Z Found in cache @ /opt/hostedtoolcache/node/20.19.5/x64
type-check	Setup Node.js	2025-09-20T11:52:10.3013716Z (node:2816) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
type-check	Setup Node.js	2025-09-20T11:52:10.3017816Z (Use `node --trace-deprecation ...` to show where the warning was created)
type-check	Setup Node.js	2025-09-20T11:52:10.3020925Z ##[group]Environment details
type-check	Setup Node.js	2025-09-20T11:52:13.1324067Z node: v20.19.5
type-check	Setup Node.js	2025-09-20T11:52:13.1324606Z npm: 10.8.2
type-check	Setup Node.js	2025-09-20T11:52:13.1324902Z yarn: 1.22.22
type-check	Setup Node.js	2025-09-20T11:52:13.1326206Z ##[endgroup]
type-check	Setup Node.js	2025-09-20T11:52:13.1373351Z ##[error]Unable to locate executable file: pnpm. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also check the file mode to verify the file is executable.
type-check	Post Run actions/checkout@v4	﻿2025-09-20T11:52:13.1623850Z Post job cleanup.
type-check	Post Run actions/checkout@v4	2025-09-20T11:52:13.2572635Z [command]/usr/bin/git version
type-check	Post Run actions/checkout@v4	2025-09-20T11:52:13.2610233Z git version 2.51.0
type-check	Post Run actions/checkout@v4	2025-09-20T11:52:13.2661057Z Temporarily overriding HOME='/home/runner/work/_temp/5311e538-c9fb-4a4b-98bb-9a65d615cacf' before making global git config changes
type-check	Post Run actions/checkout@v4	2025-09-20T11:52:13.2662363Z Adding repository directory to the temporary git global config as a safe directory
type-check	Post Run actions/checkout@v4	2025-09-20T11:52:13.2667504Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/Project-Dixis/Project-Dixis
type-check	Post Run actions/checkout@v4	2025-09-20T11:52:13.2702920Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
type-check	Post Run actions/checkout@v4	2025-09-20T11:52:13.2735447Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
type-check	Post Run actions/checkout@v4	2025-09-20T11:52:13.2963526Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
type-check	Post Run actions/checkout@v4	2025-09-20T11:52:13.2984996Z http.https://github.com/.extraheader
type-check	Post Run actions/checkout@v4	2025-09-20T11:52:13.2997641Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
type-check	Post Run actions/checkout@v4	2025-09-20T11:52:13.3027498Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
type-check	Complete job	﻿2025-09-20T11:52:13.3350367Z Cleaning up orphan processes
```

### Extracted TS Errors (last 30 matches)
```
```

## Job 2
- URL: https://github.com/lomendor/Project-Dixis/actions/runs/17879492773/job/50845313928
- RUN_ID: 17879492773

### Key Findings
Both jobs fail with the **same root cause**:

```
##[error]Unable to locate executable file: pnpm. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable.
```

**Issue Analysis**: The `actions/setup-node@v5` action is configured with `cache: pnpm` but runs **before** the `pnpm/action-setup@v4` step. This creates a dependency order issue where Node.js setup tries to cache pnpm before pnpm is actually installed.

**Fix Required**: Reorder workflow steps or remove pnpm cache from setup-node action.


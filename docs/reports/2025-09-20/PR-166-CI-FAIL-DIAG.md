# PR #166 — CI Failure Diagnostics
Run: https://github.com/lomendor/Project-Dixis/actions/runs/17874165633/job/50832804049

## Head (first 80)
php-tests	Set up job	﻿2025-09-20T02:33:55.6704555Z Current runner version: '2.328.0'
php-tests	Set up job	2025-09-20T02:33:55.6730429Z ##[group]Runner Image Provisioner
php-tests	Set up job	2025-09-20T02:33:55.6731258Z Hosted Compute Agent
php-tests	Set up job	2025-09-20T02:33:55.6731804Z Version: 20250829.383
php-tests	Set up job	2025-09-20T02:33:55.6732416Z Commit: 27cb235aab5b0e52e153a26cd86b4742e89dac5d
php-tests	Set up job	2025-09-20T02:33:55.6733133Z Build Date: 2025-08-29T13:48:48Z
php-tests	Set up job	2025-09-20T02:33:55.6733682Z ##[endgroup]
php-tests	Set up job	2025-09-20T02:33:55.6734274Z ##[group]Operating System
php-tests	Set up job	2025-09-20T02:33:55.6734811Z Ubuntu
php-tests	Set up job	2025-09-20T02:33:55.6735285Z 24.04.3
php-tests	Set up job	2025-09-20T02:33:55.6735773Z LTS
php-tests	Set up job	2025-09-20T02:33:55.6736208Z ##[endgroup]
php-tests	Set up job	2025-09-20T02:33:55.6736728Z ##[group]Runner Image
php-tests	Set up job	2025-09-20T02:33:55.6737237Z Image: ubuntu-24.04
php-tests	Set up job	2025-09-20T02:33:55.6737805Z Version: 20250907.24.1
php-tests	Set up job	2025-09-20T02:33:55.6738771Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250907.24/images/ubuntu/Ubuntu2404-Readme.md
php-tests	Set up job	2025-09-20T02:33:55.6740384Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250907.24
php-tests	Set up job	2025-09-20T02:33:55.6741659Z ##[endgroup]
php-tests	Set up job	2025-09-20T02:33:55.6743135Z ##[group]GITHUB_TOKEN Permissions
php-tests	Set up job	2025-09-20T02:33:55.6745234Z Contents: read
php-tests	Set up job	2025-09-20T02:33:55.6745758Z Metadata: read
php-tests	Set up job	2025-09-20T02:33:55.6746339Z Packages: read
php-tests	Set up job	2025-09-20T02:33:55.6746855Z ##[endgroup]
php-tests	Set up job	2025-09-20T02:33:55.6749704Z Secret source: Actions
php-tests	Set up job	2025-09-20T02:33:55.6751079Z Prepare workflow directory
php-tests	Set up job	2025-09-20T02:33:55.7246862Z Prepare all required actions
php-tests	Set up job	2025-09-20T02:33:55.7302452Z Getting action download info
php-tests	Set up job	2025-09-20T02:33:56.0565029Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
php-tests	Set up job	2025-09-20T02:33:56.2403379Z Download action repository 'shivammathur/setup-php@v2' (SHA:bf6b4fbd49ca58e4608c9c89fba0b8d90bd2a39f)
php-tests	Set up job	2025-09-20T02:33:56.6282935Z Download action repository 'actions/cache@v4' (SHA:0400d5f644dc74513175e3cd8d07132dd4860809)
php-tests	Set up job	2025-09-20T02:33:56.7251673Z Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
php-tests	Set up job	2025-09-20T02:33:56.9209826Z Complete job name: php-tests
php-tests	Initialize containers	﻿2025-09-20T02:33:56.9717016Z ##[group]Checking docker version
php-tests	Initialize containers	2025-09-20T02:33:56.9730085Z ##[command]/usr/bin/docker version --format '{{.Server.APIVersion}}'
php-tests	Initialize containers	2025-09-20T02:33:57.0878432Z '1.48'
php-tests	Initialize containers	2025-09-20T02:33:57.0891954Z Docker daemon API version: '1.48'
php-tests	Initialize containers	2025-09-20T02:33:57.0892714Z ##[command]/usr/bin/docker version --format '{{.Client.APIVersion}}'
php-tests	Initialize containers	2025-09-20T02:33:57.1068991Z '1.48'
php-tests	Initialize containers	2025-09-20T02:33:57.1084227Z Docker client API version: '1.48'
php-tests	Initialize containers	2025-09-20T02:33:57.1090173Z ##[endgroup]
php-tests	Initialize containers	2025-09-20T02:33:57.1093289Z ##[group]Clean up resources from previous jobs
php-tests	Initialize containers	2025-09-20T02:33:57.1098499Z ##[command]/usr/bin/docker ps --all --quiet --no-trunc --filter "label=8e2b68"
php-tests	Initialize containers	2025-09-20T02:33:57.1248426Z ##[command]/usr/bin/docker network prune --force --filter "label=8e2b68"
php-tests	Initialize containers	2025-09-20T02:33:57.1378384Z ##[endgroup]
php-tests	Initialize containers	2025-09-20T02:33:57.1378902Z ##[group]Create local container network
php-tests	Initialize containers	2025-09-20T02:33:57.1389160Z ##[command]/usr/bin/docker network create --label 8e2b68 github_network_0bc47af5ebea4c17ab1f3e63c5e080ad
php-tests	Initialize containers	2025-09-20T02:33:57.1902963Z 7e44caf7a3530be2915b099176c9f920edf6e3ccec0485f3b668a8957382c957
php-tests	Initialize containers	2025-09-20T02:33:57.1921589Z ##[endgroup]
php-tests	Initialize containers	2025-09-20T02:33:57.1945427Z ##[group]Starting postgres service container
php-tests	Initialize containers	2025-09-20T02:33:57.1964594Z ##[command]/usr/bin/docker pull postgres:15
php-tests	Initialize containers	2025-09-20T02:33:57.7466574Z 15: Pulling from library/postgres
php-tests	Initialize containers	2025-09-20T02:33:57.8934690Z ce1261c6d567: Pulling fs layer
php-tests	Initialize containers	2025-09-20T02:33:57.8935557Z 80ed16669c95: Pulling fs layer
php-tests	Initialize containers	2025-09-20T02:33:57.8936216Z 4e5806601837: Pulling fs layer
php-tests	Initialize containers	2025-09-20T02:33:57.8937145Z b18445125df5: Pulling fs layer
php-tests	Initialize containers	2025-09-20T02:33:57.8937852Z 874a3ca0fb79: Pulling fs layer
php-tests	Initialize containers	2025-09-20T02:33:57.8938536Z 38a0056e8c05: Pulling fs layer
php-tests	Initialize containers	2025-09-20T02:33:57.8939043Z cb4494753109: Pulling fs layer
php-tests	Initialize containers	2025-09-20T02:33:57.8939894Z 9286f415f93a: Pulling fs layer
php-tests	Initialize containers	2025-09-20T02:33:57.8940389Z 60570350e677: Pulling fs layer
php-tests	Initialize containers	2025-09-20T02:33:57.8940872Z 0b33c9cfc245: Pulling fs layer
php-tests	Initialize containers	2025-09-20T02:33:57.8941347Z f082d788df98: Pulling fs layer
php-tests	Initialize containers	2025-09-20T02:33:57.8942268Z b2ae65346945: Pulling fs layer
php-tests	Initialize containers	2025-09-20T02:33:57.8942766Z 3e69ab42557e: Pulling fs layer
php-tests	Initialize containers	2025-09-20T02:33:57.8943236Z b18445125df5: Waiting
php-tests	Initialize containers	2025-09-20T02:33:57.8943683Z f35e17a433de: Pulling fs layer
php-tests	Initialize containers	2025-09-20T02:33:57.8944134Z 874a3ca0fb79: Waiting
php-tests	Initialize containers	2025-09-20T02:33:57.8944539Z 38a0056e8c05: Waiting
php-tests	Initialize containers	2025-09-20T02:33:57.8944941Z cb4494753109: Waiting
php-tests	Initialize containers	2025-09-20T02:33:57.8945401Z f082d788df98: Waiting
php-tests	Initialize containers	2025-09-20T02:33:57.8945818Z b2ae65346945: Waiting
php-tests	Initialize containers	2025-09-20T02:33:57.8946223Z 9286f415f93a: Waiting
php-tests	Initialize containers	2025-09-20T02:33:57.8946614Z 60570350e677: Waiting
php-tests	Initialize containers	2025-09-20T02:33:57.8947026Z 3e69ab42557e: Waiting
php-tests	Initialize containers	2025-09-20T02:33:57.8947577Z 0b33c9cfc245: Waiting
php-tests	Initialize containers	2025-09-20T02:33:57.8947991Z f35e17a433de: Waiting
php-tests	Initialize containers	2025-09-20T02:33:58.0828330Z 80ed16669c95: Verifying Checksum
php-tests	Initialize containers	2025-09-20T02:33:58.0830165Z 80ed16669c95: Download complete
php-tests	Initialize containers	2025-09-20T02:33:58.2674330Z 4e5806601837: Verifying Checksum
php-tests	Initialize containers	2025-09-20T02:33:58.2675821Z 4e5806601837: Download complete

## Tail (last 80)
php-tests	Stop containers	2025-09-20T02:34:35.9336325Z  2025-09-20 02:34:35.004 UTC [84] ERROR:  null value in column "title" of relation "products" violates not-null constraint
php-tests	Stop containers	2025-09-20T02:34:35.9338542Z  2025-09-20 02:34:35.004 UTC [84] DETAIL:  Failing row contains (1, 1, Organic Tomatoes, organic-tomatoes, Fresh organic tomatoes grown without pesticides, 3.50, kg, 100, Vegetables, https://images.unsplash.com/photo-1592841200221-a6898f307baa, available, 2025-09-20 02:34:35, 2025-09-20 02:34:35, t, 1.000, t, null, f, EUR, null, null, null, null, null).
php-tests	Stop containers	2025-09-20T02:34:35.9341643Z  2025-09-20 02:34:35.004 UTC [84] STATEMENT:  insert into "products" ("slug", "producer_id", "name", "description", "price", "weight_per_unit", "unit", "stock", "category", "is_organic", "image_url", "status", "is_active", "updated_at", "created_at") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) returning "id"

## Suggested next fix
- Database schema mismatch: `products` table expects NOT NULL `title` column but insert provides null value
- Fix 1: Add `title` field to ProductFactory/seeder (populate with same value as `name` field)
- Fix 2: Check if recent migration added `title` column requirement - may need migration rollback or schema update
- Fix 3: Update Product model `$fillable` array to include `title` field if missing
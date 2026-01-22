# TASK — Pass VPS-MAINT-WINDOW-01

## Goal

Execute VPS hygiene checklist on production VPS (read-only checks).

## Scope

OPS verification only. No code changes. No updates applied.

## Steps

1. [x] Sync to main @ `836018a8`
2. [x] Read VPS hygiene runbook
3. [x] SSH to VPS → SUCCESS
4. [x] Run read-only checks (uptime, disk, memory, services)
5. [x] Check for pending updates
6. [x] Verify production health
7. [x] Create TASKS + SUMMARY artifacts
8. [x] Update STATE.md + NEXT-7D.md

## DoD

- [x] VPS SSH connection verified
- [x] Resource metrics documented (disk, memory, CPU)
- [x] Services health verified (nginx, php-fpm)
- [x] Pending updates assessed
- [x] No reboot required
- [x] Production healthz OK
- [x] Pass artifacts created
- [x] No code changes

## Result

**PASS** — VPS hygiene checks complete. All metrics healthy.

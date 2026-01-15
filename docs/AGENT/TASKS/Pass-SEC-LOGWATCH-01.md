# Pass SEC-LOGWATCH-01 — Local Log Monitoring (No Email)

**When**: 2026-01-15

## Goal

Add automated local log analysis for security anomalies without email dependency (Pass 60 blocked).

## Why

Need visibility into auth patterns, fail2ban activity, and nginx traffic without external email infrastructure.

## How

1. **Created sec-logwatch.sh** (/usr/local/sbin/)
   - Daily summary to /var/log/sec-logwatch.log
   - Analyzes: auth.log, fail2ban.log, nginx access/error logs
   - Flags unknown IPs with accepted logins

2. **Admin IP Whitelist**
   - 94.66.136.90 and 94.66.136.115 (same key, different IPs)
   - Unknown IPs flagged with warning

3. **Scheduled via sec-logwatch.timer**
   - Runs daily at 07:00 UTC
   - After sec-egress (06:00) to stagger load

## Reports Include

| Section | Content |
|---------|---------|
| AUTH.LOG | Top 10 IPs with accepted logins, unknown IP flagging |
| FAIL2BAN | Total bans, bans by jail |
| NGINX ACCESS | Top 10 IPs, top 10 status codes (last 1000 lines) |
| NGINX ERROR | Last 20 lines |

## Definition of Done

- [x] sec-logwatch.sh created with whitelist support
- [x] sec-logwatch.timer scheduled (07:00 UTC daily)
- [x] Log permissions: 640 root:adm
- [x] First run verified: all logins from admin IPs
- [x] Docs: STATE + NEXT-7D + SUMMARY updated

## PRs

| PR | Title | Status |
|----|-------|--------|
| TBD | docs(security): Pass SEC-LOGWATCH-01 local log monitoring | PENDING |

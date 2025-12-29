# MONITOR-01 — Uptime Alerting

**Date**: 2025-12-29
**Status**: COMPLETE
**PR**: #TBD

## TL;DR

Added automated uptime monitoring with GitHub Issue creation on failure. No external secrets required.

## What Changed

| File | Type | Description |
|------|------|-------------|
| `.github/workflows/uptime-monitor.yml` | New | Uptime monitor with GitHub Issue alerts |
| `docs/OPS/MONITORING.md` | Modified | Added MONITOR-01 workflow docs, updated runbook to systemd |
| `docs/OPS/STATE.md` | Modified | Added MONITOR-01 to CLOSED section |

## How It Works

1. **Schedule**: Every 10 minutes via cron (`*/10 * * * *`)
2. **Check**: Curls `https://dixis.gr/api/healthz` with 3 retries, 5s delay, 15s timeout
3. **On Success**: Workflow passes, no action
4. **On Failure**: Creates GitHub Issue with `production-down` label
5. **Deduplication**: If issue already open, adds comment instead of new issue

## Alert Format

```markdown
🚨 Production DOWN - healthz check failed

## Production Health Check Failed

**Time**: 2025-12-29T10:30:00.000Z
**Endpoint**: https://dixis.gr/api/healthz
**Last HTTP Code**: 502
**Workflow Run**: [link]

## First Steps
1. Check if site is accessible: https://dixis.gr
2. SSH to VPS and check services: `systemctl status dixis-backend dixis-frontend-launcher`
3. Check logs: `journalctl -u dixis-backend -n 50`
4. See runbook: docs/OPS/MONITORING.md
```

## Limitations

- **No external alerting**: Relies on GitHub Issue notifications (no Slack/email)
- **GitHub dependency**: If GitHub Actions is down, no alerts fire
- **No latency monitoring**: Only checks up/down, not response time
- **Staging not monitored**: staging.dixis.io doesn't exist

## Future Improvements

1. Add Slack/email webhook notifications (requires secrets)
2. Monitor response time (P95 latency)
3. Add database health check endpoint
4. Add staging monitoring when it exists

---
Generated-by: Claude (MONITOR-01)

# Monitoring MVP (no infra dependency)

**Last Updated:** 2025-12-18
**Status:** Proposal (doc-only, no implementation required)

## Monitored URLs

Monitor these endpoints for availability:

- `https://dixis.gr/api/healthz`
- `https://dixis.gr/api/v1/public/products`
- `https://dixis.gr/products`

## Alert Conditions

Trigger alerts when:
- Non-200 HTTP status for **2 consecutive checks** (5-minute interval)
- OR response time > **3 seconds** sustained over 3 checks
- OR endpoint returns error response body

## Suggested Free Tools

### Option 1: UptimeRobot (Simple)
- **URL:** https://uptimerobot.com
- **Free Tier:** 50 monitors, 5-minute checks
- **Setup:** Add 3 HTTP(s) monitors for URLs above
- **Alerts:** Email notifications included

### Option 2: Better Stack (Optional)
- **URL:** https://betterstack.com/uptime
- **Free Tier:** 10 monitors, 30-second checks
- **Setup:** Add HTTP monitors with custom assertions
- **Alerts:** Email, Slack, Discord, SMS

### Option 3: GitHub Actions (Current)
- **Status:** Already implemented in `.github/workflows/monitor-uptime.yml`
- **Frequency:** Every 5 minutes
- **Alerts:** GitHub notifications on failure
- **Limitation:** Cannot detect VPS-level failures (runs from GitHub infrastructure)

## Implementation Notes

- **No infrastructure changes required** - this is a doc-only proposal
- External monitoring (UptimeRobot/Better Stack) provides **outside-in visibility**
- GitHub Actions provides **basic health checks** but runs from same cloud provider
- For production confidence, recommend **dual monitoring**: GitHub Actions + external service

## Related Documentation

- [MONITORING.md](MONITORING.md) - Full monitoring setup and investigation playbooks
- [STATE.md](STATE.md) - Current production state
- [ACCESS.md](ACCESS.md) - Server access for debugging

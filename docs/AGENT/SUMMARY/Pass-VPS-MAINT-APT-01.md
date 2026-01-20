# Pass VPS-MAINT-APT-01 — Safe APT Updates

**Date (UTC)**: 2026-01-20
**VPS**: 147.93.126.235 (dixis-prod)

## Actions Performed

1. **apt update**: Package lists refreshed
2. **apt upgrade**: Applied safe upgrades
3. **apt autoremove**: Cleaned up unused packages

## Packages Upgraded

| Package | From | To |
|---------|------|-----|
| nodejs | 20.19.6-1nodesource1 | 20.20.0-1nodesource1 |
| kpartx | 0.9.4-5ubuntu8 | 0.9.4-5ubuntu8.1 |
| multipath-tools | 0.9.4-5ubuntu8 | 0.9.4-5ubuntu8.1 |

## Packages Held Back (not upgraded)

- cloud-init
- libgd3

## Post-Verification

| Check | Result |
|-------|--------|
| nginx | active |
| nginx -t | syntax OK |
| PM2 | running |
| /api/healthz | OK (status: ok, database: connected) |
| Reboot required | No |

## VPS State After

- Uptime: 6 days, 11:35
- Disk: 12G used / 96G total (13%)
- Memory: 3.1Gi used / 7.8Gi total
- Load: 0.00

## Notes

- Node.js upgraded to 20.20.0 (LTS minor update)
- PM2 daemon shows "outdated binary" warning but is running correctly
- No service restart required
- No reboot required

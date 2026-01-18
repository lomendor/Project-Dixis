# Pass SEC-EGRESS-01 — Egress Monitoring + fail2ban Tightening

**When**: 2026-01-15

## Goal

Add egress monitoring and tighten fail2ban settings for enhanced security visibility.

## Why

Post-incident defense-in-depth. Need visibility into outbound connections and stronger brute-force protection.

## How

1. **Baseline Evidence** (read-only)
   - Verify established connections clean (no stratum/mining)
   - Verify accepted logins only from known IPs
   - Document current fail2ban and nftables state

2. **Egress Monitoring** (sec-egress.timer)
   - Daily report: outbound connections, top remote IPs, mining port scan
   - Log to /var/log/sec-egress.log
   - Schedule: 06:00 UTC daily

3. **fail2ban Tightening**
   - bantime: 3600s (1 hour)
   - findtime: 600s (10 minutes)
   - maxretry: 5
   - ignoreip: admin IP added to prevent lockout

## Definition of Done

- [x] Baseline evidence: connections clean, logins legitimate
- [x] sec-egress.timer: installed and scheduled daily
- [x] fail2ban: tightened config with ignoreip
- [x] Docs: STATE + NEXT-7D + SUMMARY updated

## PRs

| PR | Title | Status |
|----|-------|--------|
| TBD | docs(security): Pass SEC-EGRESS-01 egress monitoring | PENDING |

# Pass SEC-WATCH-01 — Miner Reappearance Check + Hardening Baseline

**When**: 2026-01-15

## Goal

Confirm no miner/persistence reappeared after SEC-UDEV-01 remediation and apply baseline hardening.

## Why

48-72h monitoring window after SEC-UDEV-01 incident. Need to verify system is clean and add defense-in-depth measures.

## How

1. **VPS Re-check** (read-only evidence)
   - Check uptime, top CPU processes, network connections
   - Scan for stratum/mining pool connections
   - Verify udev rules and cron jobs clean

2. **Hardening Baseline**
   - SSHD: prohibit-password, pubkey only, no password auth
   - fail2ban: enabled and active on sshd jail
   - UFW firewall: deny incoming (except 22/80/443), allow outgoing

3. **Outbound Mining Port Block** (nftables)
   - Block TCP outbound to ports 3333, 4444, 5555, 14444

4. **Watchdog Timer** (sec-watch.timer)
   - Daily scan logging to /var/log/sec-watch.log
   - Checks: top CPU, stratum connections, suspicious cron/udev patterns

## Definition of Done

- [x] VPS evidence: no stratum connections, no suspicious udev/cron, CPU normalized
- [x] fail2ban: enabled and active (19 total banned IPs historically)
- [x] UFW: active with deny incoming policy
- [x] nftables: outbound mining ports blocked
- [x] sec-watch.timer: installed and scheduled daily
- [x] Docs: STATE + NEXT-7D + SUMMARY updated

## PRs

| PR | Title | Status |
|----|-------|--------|
| TBD | docs(security): Pass SEC-WATCH-01 hardening baseline | PENDING |

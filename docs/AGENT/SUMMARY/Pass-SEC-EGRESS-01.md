# Pass SEC-EGRESS-01 Summary

**Date**: 2026-01-15
**Status**: COMPLETE

## What We Did

1. **Baseline Evidence Collected**
   - Established connections: only nginx, next-server, admin SSH
   - Accepted logins: ONLY deploy user from admin IP (94.66.136.90)
   - fail2ban: active (19 total banned, 0 currently)
   - nftables: mining ports blocked (3333/4444/5555/14444)

2. **Egress Monitoring Installed**
   - Script: /usr/local/sbin/sec-egress.sh
   - Log: /var/log/sec-egress.log
   - Timer: sec-egress.timer (daily at 06:00 UTC)
   - Reports: outbound connections, top IPs, mining port scan, failed SSH count

3. **fail2ban Tightened**
   - bantime: 3600s (1 hour ban)
   - findtime: 600s (10 minute window)
   - maxretry: 5 (failures before ban)
   - ignoreip: 127.0.0.0/8, ::1, 94.66.136.90 (admin IP)

## Evidence (Non-Secret)

```
Baseline:
- Established outbound: nginx (443), next-server, sshd (admin)
- Accepted logins: ALL from 94.66.136.90 (admin IP) via publickey
- Mining port scan: CLEAN
- Failed SSH attempts (24h): 0

Egress Monitoring:
- sec-egress.timer: scheduled 06:00:00 UTC daily
- First scan: CLEAN (no suspicious connections)

fail2ban:
- sshd jail: enabled
- Settings: bantime=3600, findtime=600, maxretry=5
- ignoreip: admin IP whitelisted
```

## Impact

- Daily visibility into outbound connection patterns
- Automatic reporting of any mining port activity
- 1-hour ban for SSH brute force (up from default 10min)
- Admin IP protected from accidental lockout

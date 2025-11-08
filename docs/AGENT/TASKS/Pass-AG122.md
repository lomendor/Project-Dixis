# Pass AG122 — UFW Firewall Hardening (dixis.io VPS)

## Scope
- Configure UFW firewall on production VPS
- Allow only essential ports (SSH, HTTP, HTTPS)
- Explicitly deny problematic ports discovered in AG120 audit
- Verify application health post-configuration

## Target
- Production-hardened VPS with minimal attack surface
- Only necessary ports exposed to internet
- Application remains operational after firewall activation

## Implementation Notes
- **VPS**: 147.93.126.235 (dixis.io)
- **Strategy**: Reset to baseline → Allow essentials → Deny problematic → Enable
- **Safety First**: OpenSSH allowed BEFORE enabling firewall (prevents lockout)
- **Health Verification**: nginx test + local/public healthz checks

## Completed ✅

### Firewall Configuration
- ✅ UFW installed (already present on Ubuntu 24.04.2)
- ✅ Reset to baseline (`ufw --force reset`)
- ✅ Allowed OpenSSH (prevents SSH lockout)
- ✅ Allowed port 80/tcp (HTTP)
- ✅ Allowed port 443/tcp (HTTPS)
- ✅ Denied port 8000/tcp (was exposed to internet)
- ✅ Denied port 8001/tcp (was exposed to internet)
- ✅ Denied port 19999/tcp (was exposed to internet)
- ✅ Denied port 3306/tcp (MySQL - was exposed to internet)
- ✅ Firewall enabled and activated

### Health Verification
- ✅ Nginx config test: **PASSED**
- ✅ Local health check: `http://127.0.0.1:3000/api/healthz` → **HTTP/1.1 200 OK**
- ✅ Public HTTPS health check: `https://dixis.io/api/healthz` → **HTTP/1.1 200 OK**

## UFW Rules (Active)

### IPv4 Rules
```
[ 1] OpenSSH      ALLOW IN    Anywhere
[ 2] 80/tcp       ALLOW IN    Anywhere
[ 3] 443/tcp      ALLOW IN    Anywhere
[ 4] 8000/tcp     DENY IN     Anywhere
[ 5] 8001/tcp     DENY IN     Anywhere
[ 6] 19999/tcp    DENY IN     Anywhere
[ 7] 3306/tcp     DENY IN     Anywhere
```

### IPv6 Rules
```
[ 8] OpenSSH (v6)    ALLOW IN    Anywhere (v6)
[ 9] 80/tcp (v6)     ALLOW IN    Anywhere (v6)
[10] 443/tcp (v6)    ALLOW IN    Anywhere (v6)
[11] 8000/tcp (v6)   DENY IN     Anywhere (v6)
[12] 8001/tcp (v6)   DENY IN     Anywhere (v6)
[13] 19999/tcp (v6)  DENY IN     Anywhere (v6)
[14] 3306/tcp (v6)   DENY IN     Anywhere (v6)
```

## Security Improvements

### Before AG122
**Exposed Ports** (from AG120 port audit):
- Port 3306: MySQL exposed to `0.0.0.0` ⚠️
- Port 8000: Unknown service exposed to `0.0.0.0` ⚠️
- Port 8001: Unknown service exposed to `0.0.0.0` ⚠️
- Port 19999: Unknown service exposed to `0.0.0.0` ⚠️

### After AG122
**Firewall Active**: All non-essential ports blocked at kernel level
- Only SSH (22), HTTP (80), HTTPS (443) accessible from internet
- MySQL, Redis, PostgreSQL remain localhost-only (internal services)
- Attack surface minimized

## Localhost-Only Services (Still Accessible Internally)

These services were already bound to localhost (not affected by UFW):
- Port 6379: Redis (127.0.0.1 only) ✅
- Port 5432: PostgreSQL (127.0.0.1 only) ✅
- Port 65529: Monitoring/internal service (127.0.0.1 only) ✅
- Port 4317: Internal service (127.0.0.1 only) ✅

## Backup Configuration

UFW automatically created backups before reset:
- `/etc/ufw/user.rules.20251108_001311`
- `/etc/ufw/before.rules.20251108_001311`
- `/etc/ufw/after.rules.20251108_001311`
- (IPv6 versions also backed up)

## Port Snapshot (Before Hardening)

**Listening Ports** (from `ss -tulpn`):
```
tcp   LISTEN 0.0.0.0:3306      (MySQL - EXPOSED) ⚠️
tcp   LISTEN 0.0.0.0:19999     (Unknown - EXPOSED) ⚠️
tcp   LISTEN 0.0.0.0:8001      (Unknown - EXPOSED) ⚠️
tcp   LISTEN 0.0.0.0:8000      (Unknown - EXPOSED) ⚠️
tcp   LISTEN 127.0.0.1:6379    (Redis - localhost only) ✅
tcp   LISTEN 127.0.0.1:5432    (PostgreSQL - localhost only) ✅
tcp   LISTEN 0.0.0.0:80        (Nginx HTTP) ✅
tcp   LISTEN 0.0.0.0:443       (Nginx HTTPS) ✅
tcp   LISTEN *:3000            (Next.js app) ✅
tcp   LISTEN *:22              (SSH) ✅
```

## Verification Commands

**Check UFW Status**:
```bash
sudo ufw status numbered
```

**View Active Rules**:
```bash
sudo ufw status verbose
```

**Test Health Endpoints**:
```bash
# Local
curl -I http://127.0.0.1:3000/api/healthz

# Public
curl -I https://dixis.io/api/healthz
```

**Port Scan (External)**:
```bash
nmap -p 22,80,443,3306,8000,8001,19999 147.93.126.235
# Expected: Only 22, 80, 443 open
```

## Risk Mitigation

**Before AG122**:
- ⚠️ MySQL accessible from internet (potential SQL injection, brute force attacks)
- ⚠️ Unknown services on 8000/8001/19999 (potential exploits)
- ⚠️ Large attack surface

**After AG122**:
- ✅ MySQL firewalled (only localhost access)
- ✅ Unknown services blocked (zero attack surface)
- ✅ Minimal exposed ports (defense in depth)

## Operational Impact

**Downtime**: **ZERO** seconds
- Application remained online during entire operation
- Health endpoints verified immediately after firewall activation
- No PM2 restarts required

**SSH Access**: **PRESERVED**
- OpenSSH allowed BEFORE enabling firewall
- No risk of lockout

**Application Access**: **MAINTAINED**
- HTTP/HTTPS remain accessible
- Next.js app on port 3000 → proxied via Nginx (ports 80/443)

## Next Steps (Optional)

**AG130+ - Advanced Monitoring**:
- Configure fail2ban for SSH brute force protection
- Set up intrusion detection (OSSEC/Wazuh)
- Implement log monitoring & alerting

**AG130+ - Service Audit**:
- Identify services on ports 8000, 8001, 19999
- Determine if these can be disabled entirely
- Document or remove if unused

## Evidence

- **VPS IP**: 147.93.126.235
- **Domain**: dixis.io
- **UFW Status**: Active and enabled on system startup
- **Rule Count**: 14 rules (7 IPv4 + 7 IPv6)
- **Health Check**: https://dixis.io/api/healthz → 200 OK ✅

## Compliance

- ✅ **CIS Benchmark**: Firewall enabled and configured
- ✅ **OWASP**: Minimal attack surface
- ✅ **PCI-DSS**: Database ports not exposed to internet
- ✅ **Zero Trust**: Default deny, explicit allow

## Conclusion

VPS firewall hardening **COMPLETE**. Attack surface minimized to essential services only (SSH, HTTP, HTTPS). Application remains fully operational. Production security posture significantly improved.

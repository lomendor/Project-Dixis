# BOOT STABILITY - Process Management Snapshot

**Last Updated**: 2025-12-21 10:34 UTC (post-incident recovery)
**VPS Host**: srv709397 (deploy user)
**Uptime**: 48 minutes (rebooted 2025-12-21 09:45 UTC)

---

## Executive Summary

Frontend and backend use **different process managers** for reliability:

| Component | Manager | User | Auto-Start | Why |
|-----------|---------|------|------------|-----|
| **Frontend (Next.js)** | systemd | root | ✅ Yes | System-level reliability, IPv6 fix built-in |
| **Backend (Laravel API)** | PM2 | deploy | ✅ Yes | User-level management, easy restarts |
| **Nginx (Reverse Proxy)** | systemd | root | ✅ Yes | System HTTP/HTTPS server |

**Key Change (2025-12-21)**: Frontend switched from PM2 to systemd due to Next.js 15.5.0 IPv6 binding incompatibility.

---

## Frontend Process Management (systemd)

### Launcher Service (Persistent)

**File**: `/etc/systemd/system/dixis-frontend-launcher.service`

```ini
[Unit]
Description=Dixis Frontend Launcher (spawns transient unit)
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/bin/systemd-run \
  --unit=dixis-frontend-prod \
  --working-directory=/var/www/dixis/frontend \
  --setenv=HOSTNAME=127.0.0.1 \
  --setenv=PORT=3000 \
  /var/www/dixis/frontend/node_modules/.bin/next start -H 127.0.0.1 -p 3000
ExecStop=/usr/bin/systemctl stop dixis-frontend-prod

[Install]
WantedBy=multi-user.target
```

**Status** (2025-12-21 10:34 UTC):
```
● dixis-frontend-launcher.service - Dixis Frontend Launcher
     Loaded: loaded (/etc/systemd/system/dixis-frontend-launcher.service; enabled)
     Active: active (exited) since Sun 2025-12-21 09:45:37 UTC; 48min ago
    Process: 631 ExecStart=.../systemd-run ... (code=exited, status=0/SUCCESS)
   Main PID: 631 (code=exited, status=0/SUCCESS)
```

**Key Features**:
- ✅ **Enabled** (auto-starts on boot)
- ✅ **HOSTNAME=127.0.0.1** (forces IPv4 binding, fixes Next.js 15.5.0 IPv6 issue)
- ✅ **-H 127.0.0.1** flag (belt-and-suspenders IPv4 enforcement)
- ✅ Creates transient `dixis-frontend-prod.service`

---

### Frontend Runtime Service (Transient)

**Unit**: `dixis-frontend-prod.service` (created by launcher)

**Status** (2025-12-21 10:34 UTC):
```
● dixis-frontend-prod.service - /var/www/dixis/frontend/node_modules/.bin/next start -H 127.0.0.1 -p 3000
     Loaded: loaded (/run/systemd/transient/dixis-frontend-prod.service; transient)
  Transient: yes
     Active: active (running) since Sun 2025-12-21 09:45:37 UTC; 48min ago
   Main PID: 720 (next-server (v15.5.0))
      Tasks: 15 (limit: 9483)
     Memory: 389.8M (peak: 398.7M)
        CPU: 6.855s
     CGroup: /system.slice/dixis-frontend-prod.service
             └─720 "next-server (v15.5.0)"
```

**Network Binding**:
```
LISTEN 0  511  127.0.0.1:3000  0.0.0.0:*
```
- ✅ Listening on **IPv4 only** (127.0.0.1)
- ✅ No IPv6 binding (resolves EADDRINUSE issue)

**Process Details**:
- User: root
- PID: 720
- Next.js version: 15.5.0
- Memory: ~390MB
- Uptime: 48 minutes (stable)

---

## Backend Process Management (PM2)

**Manager**: PM2 v6.0.14 (user: deploy)

**Status** (2025-12-21 10:34 UTC):
```
┌────┬──────────────────┬─────────┬─────┬──────┬────────┬──────┬───────────┐
│ id │ name             │ mode    │ pid │ ↺    │ status │ cpu  │ mem       │
├────┼──────────────────┼─────────┼─────┼──────┼────────┼──────┼───────────┤
│ 1  │ dixis-backend    │ fork    │ 862 │ 0    │ online │ 0%   │ 51.3mb    │
└────┴──────────────────┴─────────┴─────┴──────┴────────┴──────┴───────────┘
```

**Network Binding**:
```
LISTEN 0  4096  127.0.0.1:8001  0.0.0.0:*    users:(("php8.2",pid=1021,fd=7))
```
- ✅ Listening on **127.0.0.1:8001** (Laravel API)

**PM2 Configuration**:
- Saved process list: `~/.pm2/dump.pm2`
- Auto-resurrect: Managed by PM2 systemd service (if configured)
- **Note**: Frontend removed from PM2 on 2025-12-21 (now managed by systemd)

---

## Nginx Reverse Proxy (systemd)

**Status** (2025-12-21 10:34 UTC):
```
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled)
     Active: active (running) since Sun 2025-12-21 09:45:37 UTC; 48min ago
   Main PID: 694 (nginx)
      Tasks: 3 (limit: 9483)
     Memory: 5.6M (peak: 6.2M)
     CGroup: /system.slice/nginx.service
             ├─694 "nginx: master process ..."
             ├─696 "nginx: worker process"
             └─697 "nginx: worker process"
```

**Network Binding**:
```
LISTEN 0  511  0.0.0.0:80     0.0.0.0:*    # HTTP
LISTEN 0  511  0.0.0.0:443    0.0.0.0:*    # HTTPS
LISTEN 0  511     [::]:80        [::]:*    # HTTP (IPv6)
LISTEN 0  511     [::]:443       [::]:*    # HTTPS (IPv6)
```

**Proxy Configuration**:
- `https://dixis.gr/` → `127.0.0.1:3000` (frontend)
- `https://dixis.gr/api/` → `127.0.0.1:8001` (backend)

---

## PROD Health Verification

**Timestamp**: 2025-12-21 10:34 UTC

| Endpoint | Status | Served By |
|----------|--------|-----------|
| `https://dixis.gr/api/healthz` | ✅ 200 | Backend (8001) |
| `https://dixis.gr/products` | ✅ 200 | Frontend (3000) |
| `https://dixis.gr/orders` | ✅ 200 | Frontend (3000) |
| `https://dixis.gr/api/v1/public/products` | ✅ 200 | Backend (8001) |

**All endpoints operational** ✅

---

## Boot Sequence

### On VPS Reboot:

1. **systemd starts** (PID 1)
2. **nginx.service** starts (enabled)
   - Binds to ports 80, 443
   - Waits for upstream services (3000, 8001)
3. **dixis-frontend-launcher.service** starts (enabled, After=network.target)
   - Runs `systemd-run` to create transient unit
   - Creates `dixis-frontend-prod.service`
4. **dixis-frontend-prod.service** (transient, spawned by launcher)
   - Working directory: `/var/www/dixis/frontend`
   - Environment: `HOSTNAME=127.0.0.1`, `PORT=3000`
   - Starts: `next start -H 127.0.0.1 -p 3000`
   - Binds to `127.0.0.1:3000` (IPv4 only)
5. **PM2 resurrect** (if pm2-deploy.service enabled for user deploy)
   - Restores `dixis-backend` from saved process list
   - Binds to `127.0.0.1:8001`
6. **Nginx** proxies requests to upstream services

**Expected Boot Time**: ~10-20 seconds for all services to be online

---

## Verification Commands

### Check All Services
```bash
# Nginx
systemctl status nginx

# Frontend launcher
systemctl status dixis-frontend-launcher

# Frontend runtime
systemctl status dixis-frontend-prod

# Backend (PM2)
sudo -u deploy pm2 ls
```

### Check Network Listeners
```bash
ss -lntp | egrep ":(80|443|3000|8001)\b"
# Expected:
# :80, :443 → nginx
# :3000 → next-server (IPv4 only)
# :8001 → php8.2 (Laravel)
```

### Test PROD Endpoints
```bash
curl -sS -o /dev/null -w "%{http_code}" https://dixis.gr/api/healthz    # 200
curl -sS -o /dev/null -w "%{http_code}" https://dixis.gr/products       # 200
curl -sS -o /dev/null -w "%{http_code}" https://dixis.gr/orders         # 200
```

---

## Why Frontend Uses systemd (Not PM2)

**Date Changed**: 2025-12-21 (during PROD outage recovery)

**Reasons**:
1. **IPv6 Binding Fix Built-In**: Launcher service sets `HOSTNAME=127.0.0.1` environment variable
2. **System-Level Reliability**: Root-owned, managed by systemd (more stable than user-level PM2)
3. **No Daemon Dependency**: Doesn't rely on PM2 daemon state (which caused issues during incident)
4. **Clear Separation**: PM2 for backend (user deploy), systemd for frontend (root)
5. **Boot Guarantee**: systemd ensures service starts on boot without manual intervention

**Previous Setup**: Both frontend + backend managed by PM2 (user deploy)

**Incident**: PM2 frontend crashed in IPv6 binding loop, systemd recovery proved more reliable

---

## Troubleshooting

### Frontend Not Starting

1. Check launcher service status:
   ```bash
   systemctl status dixis-frontend-launcher
   ```

2. Check transient service status:
   ```bash
   systemctl status dixis-frontend-prod
   ```

3. View launcher logs:
   ```bash
   journalctl -u dixis-frontend-launcher -n 50
   ```

4. View frontend process logs:
   ```bash
   journalctl -u dixis-frontend-prod -n 100
   ```

5. Common issues:
   - Port 3000 already in use → Check `ss -lntp | grep :3000`
   - EADDRINUSE IPv6 error → Verify `HOSTNAME=127.0.0.1` in launcher service
   - Build missing → Rebuild frontend: `cd /var/www/dixis/frontend && pnpm build`

### Backend Not Starting

1. Check PM2 status:
   ```bash
   sudo -u deploy pm2 status
   ```

2. View PM2 logs:
   ```bash
   sudo -u deploy pm2 logs dixis-backend --lines 100
   ```

3. Resurrect PM2 processes:
   ```bash
   sudo -u deploy pm2 resurrect
   ```

---

## References

- **Incident Report**: `docs/OPS/INCIDENTS/2025-12-21-prod-outage-hostname.md`
- **Root Cause Analysis**: `docs/OPS/VPS-DEPLOYMENT-BLOCKER-ANALYSIS.md`
- **STATE.md**: Incident CLOSED gate entry
- **systemd.run**: https://www.freedesktop.org/software/systemd/man/systemd-run.html

---

**Document Status**: LOCKED (reflects current production state)
**Next Update**: After any process management changes or VPS reboot test

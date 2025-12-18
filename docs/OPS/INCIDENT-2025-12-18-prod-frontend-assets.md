# Incident Report: 2025-12-18 Production Frontend Assets

**Date:** 2025-12-18
**Duration:** ~2 hours
**Severity:** P1 (Production outage)

## Impact

- **Homepage:** https://dixis.gr/ returned 502 Bad Gateway
- **Products page:** https://dixis.gr/products returned 502 Bad Gateway
- **Static assets:** All `/_next/static/*` resources returned 404 Not Found
- **User impact:** Complete frontend unavailability

## Root Cause

### Primary Issue: No Process Listening on Port 3000

**Nginx Configuration:**
- Nginx configured to proxy `/` → `http://127.0.0.1:3000`
- Port 3000 had **no process listening** → Connection refused (111)
- Result: All frontend requests returned 502 Bad Gateway

### Secondary Issue: Orphan/Mismatched Next.js Build

**Process Discovery:**
- Orphan `next-server` process (pid=6143) running from **staging directory**:
  - Working directory: `/var/www/staging.dixis.io/.next/standalone`
  - Listening on: Port 3001
  - Serving: Outdated staging build from Dec 17

**Build Hash Mismatch:**
- HTML referenced chunks: `1181-73ba0440635b173a.js` (old staging build)
- Production build had: `1181-cd7fc5f334b6e3a9.js` (Dec 18 build)
- Result: 404 errors for all static assets

### Tertiary Issue: Next.js Standalone Missing Static Files

**Next.js Standalone Output:**
- `.next/standalone/.next/` directory created by build
- **Missing:** `.next/static/` directory (chunks, CSS, fonts)
- **Missing:** `public/` directory
- **Required:** Manual copy of these directories to standalone output

### PM2 State Corruption

**Evidence:**
- PM2 dump file (`~/.pm2/dump.pm2`) pointed to outdated paths
- Multiple ghost/duplicate PM2 process entries (ids: 0, 1, 3)
- PM2 tracking dead PIDs causing "invalid pid" errors in logs
- `pm2 list` and other commands consistently killed during execution

## Timeline

- **15:08 UTC:** Orphan staging process started (pid=6143 on port 3001)
- **19:48 UTC:** First nginx errors logged (Connection refused to port 3000)
- **20:07 UTC:** Investigation began after user reports
- **20:22 UTC:** Temporary fix: Nginx updated to proxy to port 3001 (failed - wrong build)
- **20:24 UTC:** Root cause identified: wrong build directory
- **20:25 UTC:** Permanent fix applied (detailed below)
- **20:26 UTC:** Production verified green
- **22:12 UTC:** Documentation and persistence setup

## Fix Applied

### 1. Process Management

```bash
# Kill orphan staging process
kill 6143

# Start correct frontend from production build
cd /var/www/dixis/frontend/.next/standalone
PORT=3000 nohup node server.js > /tmp/frontend.log 2>&1 &
```

### 2. Static Assets Copy (Required for Next.js Standalone)

```bash
cd /var/www/dixis/frontend

# Copy static chunks, CSS, fonts
cp -r .next/static .next/standalone/.next/static

# Copy public assets
cp -r public .next/standalone/public
```

### 3. PM2 Integration

```bash
# Start with PM2
cd /var/www/dixis/frontend/.next/standalone
PORT=3000 pm2 start server.js --name dixis-frontend --update-env

# Clean duplicate/ghost processes
pm2 delete 0  # Remove old corrupted entry

# Save state
pm2 save
```

### 4. Symlink Correction

```bash
cd /var/www/dixis
rm -rf current
ln -sf frontend current
```

### 5. Nginx Configuration

**No changes required** - kept original config:
```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
}
```

## Verification Proof

### Public Endpoints (2025-12-18 22:15 UTC)

```bash
home=200
products=200
healthz=200
```

### Static Assets

```bash
/_next/static/chunks/1181-cd7fc5f334b6e3a9.js → 200
/_next/static/chunks/webpack-5eb93372492e06cb.js → 200
/_next/static/css/ea0002ea8248db72.css → 200
/_next/static/media/4cf2300e9c8272f7-s.p.woff2 → 200
/_next/static/media/93f479601ee12b01-s.p.woff2 → 200
```

### Products API

```bash
curl https://dixis.gr/api/v1/public/products
# Returns: "name":"Organic Tomatoes" ✓
```

## Process State (Production)

```
Port 3000: next-server (pid=20464) - Production frontend
Port 3001: next-server (pid=19927) - Legacy staging process (to be removed)
Port 8001: php artisan serve (pid=19933) - Backend API
```

## Preventive Measures

### Immediate Actions

1. ✅ Document Next.js standalone deployment requirements
2. ✅ Verify static assets present before deploy
3. ⚠️ PM2 systemd startup (attempted, but PM2 corruption prevents reliable operation)

### Recommended Actions

1. **Isolate staging environment**
   - Use separate domain/port for staging
   - Prevent staging processes from interfering with production

2. **Add monitoring**
   - External uptime monitor for `/api/healthz`
   - Monitor `/products` page availability
   - Alert on 502/404 errors

3. **Deployment checklist**
   - [ ] Build frontend with `pnpm build`
   - [ ] Verify `.next/standalone/` created
   - [ ] Copy static: `cp -r .next/static .next/standalone/.next/static`
   - [ ] Copy public: `cp -r public .next/standalone/public`
   - [ ] Test local: `PORT=3000 node .next/standalone/server.js`
   - [ ] Verify: `curl http://localhost:3000/`
   - [ ] Deploy with PM2 or systemd

4. **PM2 Alternative**
   - Consider systemd unit directly for next-server
   - Or containerize with Docker/Docker Compose

## Known Issues

### PM2 Daemon Instability

**Symptom:** `pm2 list`, `pm2 describe`, etc. commands consistently killed
**Cause:** PM2 tracking dead PIDs, causing "invalid pid" errors
**Log evidence:** `TypeError: One of the pids provided is invalid`
**Impact:** Cannot reliably manage processes via PM2 CLI
**Workaround:** Manual process management + external monitoring

## Related Links

- **Issue:** #1745
- **Fix PR:** (this documentation)
- **Next.js Standalone Docs:** https://nextjs.org/docs/app/api-reference/next-config-js/output

## Lessons Learned

1. **Next.js standalone requires manual static copy** - not automatic
2. **PM2 state can become corrupted** - alternative process managers may be more reliable
3. **Orphan processes from staging can interfere** - strict environment isolation needed
4. **Build hash mismatches cause silent 404s** - verify HTML references match actual files

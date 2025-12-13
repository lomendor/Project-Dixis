# Incident Report: DDoS Attack + ChunkLoadError (2025-12-06)

**Status**: RESOLVED
**Impact**: Full site outage (10+ hours downtime)
**Systems Affected**: VPS (dixis.gr), Frontend (Next.js), PM2 process manager
**Incident Date**: 2025-12-06

---

## Context

Production VPS (Hostinger, IP 147.93.126.235, domain dixis.gr) was suspended by hosting provider due to DDoS/UDP traffic. Upon investigation, we discovered:
- Cryptocurrency miner running as `/tmp/docker-daemon` (103% CPU, 2.4GB RAM)
- PM2 frontend process crash-looping (51 restarts) due to malware interference
- After malware cleanup, users reported ChunkLoadError on frontend

---

## Timeline

1. **VPS suspended** by Hostinger due to 10M+ UDP packets dropped (DDoS activity)
2. **Malware discovered**: `/tmp/docker-daemon` (crypto miner), `/tmp/dockerd` (parent process), `/tmp/bot` (wget payload)
3. **Malware eliminated**: Processes killed, files deleted, immutable placeholders created (`chattr +i`)
4. **Frontend ChunkLoadError reported**: Chunk `1760-050058fbd4c31c95.js` returning 404
5. **Root cause identified**: PM2 frontend process not running (stopped during malware cleanup)
6. **Fix applied**: Started PM2 with existing complete build (no rebuild needed)
7. **Verification**: All chunks return 200 OK via Nginx, no malware activity in logs

---

## Root Cause

**Primary**: Malware infection on VPS
- Crypto miner disguised as Docker binaries (`/tmp/docker-daemon`, `/tmp/dockerd`)
- Downloaded via wget from `http://gfxnick.emerald.us/bot`
- Ran for extended period (evidence in PM2 logs: 51 restarts over ~10 hours)
- Consumed 103% CPU + 2.4GB RAM, triggered Hostinger DDoS detection

**Secondary**: PM2 frontend process stopped
- During malware cleanup, PM2 process was stopped
- Frontend build (1.1GB, 194 chunks) remained intact but wasn't being served
- Nginx proxy to localhost:3000 got connection refused → 502/504 errors
- Users saw ChunkLoadError when attempting to load pages

---

## Fix / Actions Taken

### Security Cleanup
1. Killed malware processes (PID 11900, 11797, respawns)
2. Deleted malware files: `/tmp/docker-daemon`, `/tmp/dockerd`, `/tmp/bot`
3. Created immutable placeholders to prevent respawn: `chattr +i /tmp/{docker-daemon,dockerd,bot}`
4. Verified 60-second monitoring: NO respawn
5. Documented findings in `/root/security-audit-20251206/malware-audit.log`

### Frontend Restoration
1. Verified build integrity: 1.1GB .next directory, 194 chunks (including "missing" 1760), BUILD_ID present
2. Created clean PM2 ecosystem config: `/var/www/dixis/current/frontend/ecosystem.production.js`
3. Started PM2 process: `pm2 start ecosystem.production.js && pm2 save`
4. Health checks:
   - localhost:3000 → 200 OK
   - Chunk 1760 → 200 OK, MIME type: `application/javascript` ✓
   - No wget/bot activity in PM2 logs ✓
   - PM2 uptime stable, 0 restarts ✓

---

## Remaining Risks

1. **No active monitoring**: Malware ran undetected until VPS suspension
2. **Manual security audits**: No automated checks for suspicious binaries/cron jobs
3. **Hostinger limits**: Unknown tolerance for future traffic spikes
4. **No DDoS mitigation**: If legitimate traffic spikes, could trigger false positive
5. **Single point of failure**: All services on one VPS (no redundancy)

---

## Recommended Next Steps

### Immediate (Week 1)
- [ ] Monitor PM2 logs daily for 7 days (watch for wget/bot/unusual CPU)
- [ ] Review nginx access logs for suspicious traffic patterns
- [ ] Check `/tmp` directory weekly for new unauthorized binaries
- [ ] Verify no new cron jobs or systemd timers added

### Short-term (Month 1)
- [ ] Implement basic monitoring (CPU/RAM/disk alerts via Hostinger dashboard or external tool)
- [ ] Set up weekly automated security scan (e.g., `find /tmp -type f -executable`)
- [ ] Document Hostinger contact/escalation process for future incidents
- [ ] Consider fail2ban for SSH brute-force protection

### Long-term (When Product Matures)
- [ ] Evaluate moving to containerized deployment (Docker with proper isolation)
- [ ] Implement proper observability (Sentry for errors, uptime monitoring)
- [ ] Consider CDN for static assets (reduce VPS load, DDoS protection)
- [ ] Evaluate multi-server setup or managed hosting (if traffic justifies cost)

---

## Lessons Learned

1. **TypeScript build errors ≠ broken builds**: Spent 90+ minutes on unnecessary rebuilds when types-only errors didn't affect runtime JavaScript
2. **Malware can disguise as legitimate tools**: Crypto miner used Docker naming to blend in
3. **PM2 process state not obvious**: After malware cleanup, didn't immediately realize frontend wasn't running
4. **Build verification matters**: Should have checked existing build before attempting rebuild
5. **Document incident response**: Having clear runbooks would have saved time

---

**Resolution Time**: ~3 hours (malware cleanup: 30min, diagnosis: 90min, fix: 15min)
**Total Downtime**: ~10 hours (VPS suspension to PM2 restart)
**Business Impact**: Full site unavailability, user frustration, potential SEO impact
**Status**: Site operational, monitoring required for 48-72 hours

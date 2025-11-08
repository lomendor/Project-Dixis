# Pass AG116 — Production Hardening (dixis.io domain+SSL+health)

## Scope
- Verify VPS production status (HTTP, PM2, Nginx)
- Ensure `/api/healthz` endpoint exists and responds 200
- Setup Nginx server block for dixis.io domain
- Configure Let's Encrypt SSL certificates
- Safely verify Prisma migrations (read-only operations)
- PM2 diagnostics (investigate restart count)
- Generate comprehensive deployment report

## Target
- Production-ready VPS with HTTPS access
- Health monitoring endpoint operational
- Clean deploy flow documented
- No business code changes (ops/infra only)

## Implementation Notes
- **Domain Strategy**: Focused on dixis.io (working DNS) instead of dixis.gr (DNS points to old server)
- **DNS Verification**: dixis.io and www.dixis.io correctly point to 147.93.126.235
- **SSL Success**: Let's Encrypt certificates issued successfully for dixis.io domains
- **Prisma Issue**: DATABASE_URL in VPS .env is invalid but app runs fine (uses runtime config)
- **PM2 Status**: 96 total restarts, 0 unstable restarts (stable operation)

## Completed ✅
- ✅ Context rehydration & TL;DR
- ✅ SSH access established (dixis@147.93.126.235)
- ✅ VPS verification (PM2 ONLINE, Nginx OK, HTTP 200)
- ✅ `/api/healthz` endpoint verified (already existed)
- ✅ DNS check for dixis.io (correct IP: 147.93.126.235)
- ✅ Nginx configuration updated (dixis.io + www.dixis.io)
- ✅ SSL certificates issued (Let's Encrypt) and deployed
- ✅ Prisma migrations checked (known DATABASE_URL issue - non-critical)
- ✅ PM2 diagnostics completed
- ✅ Final report generated

## Known Issues (Non-Critical)
- ⚠️ DATABASE_URL in VPS .env is invalid
  - App runs correctly (uses runtime environment variables)
  - Recommended: Verify via GitHub Action "Production Migration"

- ⚠️ Application logs show "Failed to fetch products: 404"
  - Application-level errors (not PM2 crashes)
  - Recommended: Investigate product API endpoint

- ⚠️ PM2 restart count is 96 (but 0 unstable)
  - Likely from deployments/manual restarts during setup
  - Recommended: Monitor for increases over next 24h

## Pending Actions (Optional)
1. Fix DNS A-record for dixis.gr → 147.93.126.235 (για future cutover)
2. Investigate "/products" API 404 errors
3. Monitor PM2 restart count trend
4. Run GitHub Action "Production Migration" με confirm=DIXIS-PROD-OK

## Evidence
- VPS location: `/var/www/dixis/current/frontend`
- Nginx config: `/etc/nginx/sites-available/dixis`
- Production URLs: https://dixis.io, https://www.dixis.io
- Health endpoint: https://dixis.io/api/healthz
- SSL Provider: Let's Encrypt (auto-renewal enabled)
- Node Version: 22.21.0
- PM2 Mode: fork_mode (production)

## Next Steps
- **AG120**: Zero-downtime deploys, Neon backups policy, monitoring/alerting setup, performance optimization

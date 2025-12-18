# Production Release State

**Last Verified:** 2025-12-18 UTC

## Production Endpoints Status

All endpoints returning 200 OK:

| Endpoint | Status | Notes |
|----------|--------|-------|
| `/api/v1/public/products` | 200 ✅ | Returns 4 products |
| `/products` | 200 ✅ | List page renders, contains product names |
| `/products/1` | 200 ✅ | Detail page renders "Organic Tomatoes" |
| `/login` | 200 ✅ | Working |
| `/register` | 200 ✅ | Working |
| `/api/healthz` | 200 ✅ | Health check operational |

## Infrastructure Status

**PM2 Processes:**
- `dixis-frontend` (port 3000): online, 0 restarts
- `dixis-backend` (port 8001): online, 0 restarts  
- `dixis-staging` (port 3001): online, 0 restarts

**Services:**
- nginx: active
- ssh: active
- PM2 uptime: 2+ hours

**Network Ports:**
- 22 (SSH): listening
- 80 (HTTP): listening
- 443 (HTTPS): listening
- 3000 (frontend): listening
- 3001 (staging): listening
- 8001 (backend): listening

## SSH Stability

**Server Configuration:**
- fail2ban sshd jail: active
- Currently failed attempts: 0
- Currently banned IPs: 1 (134.209.207.242 - not our IP)
- Our IP in ignoreip: 94.66.136.129 ✅

**Local Configuration:**
- SSH config: `~/.ssh/config` has `Host dixis-prod`
- User: deploy
- Key: `~/.ssh/dixis_prod_ed25519`
- IdentitiesOnly: yes

**Result:** No failed authentication attempts, no risk of IP ban.

## Recent Changes

**PR #1736 (Merged):**
- Removed Prisma from frontend `/products/[id]` page
- Replaced with API fetch to `/api/v1/public/products`
- Fixed PrismaClientInitializationError in production
- Merge commit: `93589438e58f8081a16a16e9f6004fe619ca7033`

## Notes

- No staging changes made
- No code changes required in this verification pass
- All changes were ops hardening + verification only
- Production is stable and all endpoints operational

## Next Actions

- Monitor endpoints via automated uptime monitoring (see MONITORING.md)
- Review monitoring alerts daily
- Document any production incidents in this file

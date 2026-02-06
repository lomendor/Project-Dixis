# Active Workarounds

> **Purpose**: Document temporary solutions that need proper fixes.
> **Rule**: Every workaround must have removal conditions.

---

## 1. Admin Auth Env-Based Fallback

**Added**: 2026-02-06
**Pass**: ADMIN-EMAIL-OTP-01
**Status**: CAN BE REMOVED (DB fixed 2026-02-06)

### Problem
- Neon PostgreSQL `AdminUser` table doesn't exist
- Prisma migrations haven't run on production
- `requireAdmin()` fails when querying non-existent table

### Workaround
When DB query fails, check `ADMIN_PHONES` env var:

```typescript
// frontend/src/lib/auth/admin.ts (lines 103-117)
const envAdminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => p.trim()).filter(Boolean);
if (envAdminPhones.includes(phone)) {
  console.log(`[Admin] DB unavailable, using env-based admin fallback for ${phone}`);
  return { id: `env-admin-${phone}`, phone, role: 'admin', ... };
}
```

### Production Env Vars Required
```
ADMIN_PHONES=+306979195028
ADMIN_EMAIL_MAPPING=+306979195028:kourkoutisp@gmail.com
```

### Removal Conditions
- [x] Run `npx prisma migrate deploy` on VPS (DONE 2026-02-06)
- [x] Verify AdminUser table exists in Neon (DONE - has record)
- [x] Insert admin record via Prisma (DONE - already existed)
- [ ] Remove fallback code from `admin.ts` (optional - harmless to keep)
- [ ] Remove `ADMIN_PHONES` env var (optional)

### How to Properly Fix
```bash
ssh root@147.93.126.235
cd /var/www/dixis/current/frontend

# 1. Check migration status
npx prisma migrate status

# 2. If Neon is accessible, run migrations
npx prisma migrate deploy

# 3. Insert admin record
npx prisma db execute --stdin <<EOF
INSERT INTO "AdminUser" (id, phone, email, role, "isActive", "createdAt", "updatedAt")
VALUES ('admin-001', '+306979195028', 'kourkoutisp@gmail.com', 'super_admin', true, NOW(), NOW())
ON CONFLICT (phone) DO UPDATE SET email = EXCLUDED.email;
EOF

# 4. Test without fallback
# Edit admin.ts to remove fallback, rebuild, deploy
```

---

## 2. Phone Number Normalization

**Added**: 2026-02-06
**Pass**: ADMIN-EMAIL-OTP-01
**Status**: ACTIVE (acceptable long-term)

### Problem
Users enter phone numbers in different formats:
- `6979195028` (no prefix)
- `306979195028` (country code, no +)
- `+306979195028` (full international)

### Workaround
Normalize all formats to `+30XXXXXXXXXX`:

```typescript
// frontend/src/app/api/auth/request-otp/route.ts
function normalizeGreekPhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+30')) return cleaned;
  if (cleaned.startsWith('30') && cleaned.length === 12) return '+' + cleaned;
  if (cleaned.startsWith('6') && cleaned.length === 10) return '+30' + cleaned;
  return phone;
}
```

### Removal Conditions
- This is acceptable as permanent code
- Consider moving to shared utility if used elsewhere

---

## 3. Deploy Script Protects .env

**Added**: 2026-02-06
**Pass**: INFRA-STABILITY-01
**Status**: PERMANENT SOLUTION

### Problem
- `rsync --delete` was deleting `.env` file on VPS
- Each deploy broke authentication (no secrets)
- Had to manually restore `.env` after every deploy

### Solution
Created `scripts/deploy.sh` that:
1. Uses `--exclude='.env'` in rsync
2. Copies `.env` from `/var/www/dixis/shared/frontend.env` after sync
3. Restarts PM2 with `--update-env`

### Usage
```bash
./scripts/deploy.sh
```

### Removal Conditions
- This is the permanent solution - no removal needed
- If moving to CI/CD, replicate this logic in GitHub Actions

---

## 4. Nginx Admin API Routing

**Added**: 2026-02-06
**Pass**: INFRA-STABILITY-01
**Status**: PERMANENT SOLUTION

### Problem
- `/api/admin/*` routes were going to Laravel instead of Next.js
- Admin pages showed empty (404 from Laravel)

### Solution
Added nginx location blocks:
```nginx
location ^~ /api/admin/ { proxy_pass http://127.0.0.1:3000; ... }
location ^~ /api/categories { proxy_pass http://127.0.0.1:3000; ... }
```

### Config Location
- VPS: `/etc/nginx/sites-enabled/dixis.gr`
- Backup: `/var/www/dixis/shared/nginx-dixis.gr.conf.bak`
- Docs: `docs/OPS/NGINX-CONFIG.md`

### Removal Conditions
- This is permanent configuration
- If migrating all APIs to one server, simplify routing

---

## Template for New Workarounds

```markdown
## N. [Title]

**Added**: YYYY-MM-DD
**Pass**: [PASS-ID]
**Status**: ACTIVE | REMOVED

### Problem
[What's broken]

### Workaround
[What we did instead]

### Removal Conditions
- [ ] [Condition 1]
- [ ] [Condition 2]

### How to Properly Fix
[Steps to implement proper solution]
```

---

_Last updated: 2026-02-06 (INFRA-STABILITY-01)_

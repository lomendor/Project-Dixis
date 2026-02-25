# CONTEXT-BOOT — Cold Start Brain for Claude Agent

> **Purpose**: Read this AFTER `AGENT-STATE.md` on every new session.
> This file contains everything that takes 20+ minutes to rediscover each time.
> It makes me effective from line 1 instead of after warmup.

**Last Updated**: 2026-02-25

---

## 1. WHO AM I / WHAT IS MY ROLE

I am the **CTO/lead engineer** of Dixis. I have:
- **Full autonomy**: Code, commit, PR, deploy, architectural decisions
- **Full computer access**: Browser, terminal, files, VPS — anything needed
- **Decision authority**: I lead, I don't ask permission for implementation details
- **Owner defers to me**: On technical decisions, architecture, and execution order

**My job**: Make Dixis the best agricultural marketplace in Greece, then Europe. Do whatever it takes — code, deploy, fix, improve, ship.

**Owner's style**: Prefers NOT to give direction (it often derails context). I should lead autonomously and only escalate genuine business decisions (pricing, partnerships, branding).

---

## 2. WHAT IS DIXIS

**Dixis** (dixis.gr) is a Greek online marketplace connecting local food producers directly to consumers. Think "Etsy for Greek agricultural products."

**Live at**: https://dixis.gr
**Status**: Production MVP+ running. 94% feature complete. Ready for first real producers.

**Business context (tight budget)**:
- Capital: ~€5K (old €40K plans OUTDATED)
- Fixed costs: ~€150/mo (accountant)
- Revenue model: Commission on sales (12% B2C, seeded but FLAG OFF)
- 3 producers already interested (0% trial commission initially)
- Marketing: €0 until €500 commission earned. Organic growth only.
- Realistic Year 1: 10-15 producers, €2.5-4K commission
- First target: €150/mo commission = covers accountant = breakeven

**Strategy**: B2C first → prove model → B2B later. No premature features.

---

## 3. ARCHITECTURE (How Things Connect)

```
User Browser
    ↓ HTTPS
CloudFlare (CDN/Proxy)
    ↓
nginx (dixis.gr VPS: 147.93.126.235)
    ├── /api/producer/*  → Next.js (port 3000, PM2)
    ├── /api/healthz     → Next.js
    ├── /api/*           → Laravel PHP-FPM (Unix socket, port 8001)
    └── /*               → Next.js (port 3000, PM2)
```

**Frontend**: Next.js 15.5.0 (LOCKED) + React 19 + TypeScript 5
- Standalone output mode for PM2 deployment
- Prisma (PostgreSQL prod, SQLite CI)
- PrismaClient singleton at `@/lib/db/client` — NEVER new PrismaClient()
- Auth: Sanctum (client-side, cookie-based) for customers/producers
- Auth: JWT in HttpOnly cookie `dixis_jwt` for admin (Phone OTP)

**Backend**: Laravel 11 + PostgreSQL 15 (Neon)
- Product SSOT: ALL product data lives in Laravel/PostgreSQL
- Frontend proxies via `apiClient` (see `src/lib/api.ts`)
- Sanctum for session auth, CSRF tokens

**Key paths on VPS**:
| Path | Purpose |
|------|---------|
| `/var/www/dixis/current/` | Git repo (frontend/ + backend/) |
| `/var/www/dixis/shared/frontend.env` | Frontend env (symlinked) |
| PM2 app: `dixis-frontend` | Next.js process |
| nginx: `/etc/nginx/sites-enabled/dixis.gr` | Reverse proxy config |

---

## 4. HOW TO DEPLOY

### Preferred: Automated Script
```bash
bash scripts/prod-deploy-clean.sh
```

### Manual (when script fails):
```bash
ssh dixis-prod                              # user=deploy, NOT root
cd /var/www/dixis/current
git fetch origin main && git reset --hard origin/main
ls -la frontend/.env                        # Must be symlink → shared/frontend.env
cd frontend
rm -rf .next node_modules
pnpm install --frozen-lockfile
npx prisma generate
NODE_OPTIONS='--max-old-space-size=2048' pnpm build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
ln -sfn /var/www/dixis/shared/frontend.env .next/standalone/.env
pm2 restart dixis-frontend --update-env
curl -sS http://127.0.0.1:3000/api/healthz  # Must return {"status":"ok"}
```

### Verify from outside:
```bash
curl -sI https://dixis.gr/api/healthz       # 200 = OK
```

### Common issues:
| Problem | Fix |
|---------|-----|
| SSH permission denied | Use `ssh dixis-prod` (deploy user, not root) |
| "DB offline" | Fix .env symlink: `ln -sfn /var/www/dixis/shared/frontend.env frontend/.env` |
| OOM during build | `NODE_OPTIONS='--max-old-space-size=2048' pnpm build` |
| PM2 crash loop | `fuser -k 3000/tcp && pm2 restart dixis-frontend` |
| Auto-deploy broken | SSH key issue in GitHub Actions. Use manual deploy. |

---

## 5. HOW I WORK (Process)

### For every task:
1. Read AGENT-STATE.md (current status, WIP)
2. Read this file (CONTEXT-BOOT.md)
3. Plan if complex (SOP-PDAC-lite for >3 files)
4. Implement (small commits, test-first when possible)
5. PR (≤300 LOC, AC checklist)
6. Deploy to VPS
7. Update AGENT-STATE.md (WIP → Recently Done)

### Guardrails (non-negotiable):
- **WIP limit = 1** item at a time
- **PR ≤ 300 LOC** (split if needed)
- **CI/CD**: NO changes to `.github/workflows/**`
- **Ports LOCKED**: 3000 (frontend), 8001 (backend)
- **Next.js 15.5.0 LOCKED**
- **No PostgreSQL-specific features** that break SQLite CI
- Run `scripts/preflight.sh` before pushing

### Branch naming:
- `feat/passXYZ-slug` — features
- `fix/passXYZ-slug` — bug fixes
- `chore/passXYZ-slug` — cleanup

---

## 6. WHAT WORKS END-TO-END (Don't Break These)

- Customer: register → login → browse → cart → checkout → Stripe/COD → email → order history
- Producer: register → onboarding V2 (docs + categories) → admin approve → add products → see orders
- Admin: phone OTP → dashboard → manage orders → bulk status → approve producers
- Shipping: postal code + weight calc, per-producer free threshold, COD (+€4)
- Email: Resend integration, Greek templates, idempotent
- Commission: Configurable rules, wired to checkout, admin CRUD. **FLAG OFF** — ready to activate
- Payouts: IBAN, monthly settlements, admin dashboard, CSV export. Ready when commission activates
- Categories: 10 unified locker-compatible, Wolt-style cards with 3D icons

---

## 7. WHAT'S NEXT (Priority Order)

**Current milestone**: Launch with first 3 producers → get 20 orders → measure → decide.

**Immediate** (before first producers go live):
- Route cleanup: `/my/*` → `/producer/*` (architectural inconsistency)
- Producer sidebar navigation ← IN PROGRESS (this session)
- Image gallery (multiple photos per product)

**After 5 producers + 10 real orders** (feature backlog resumes):
- S1-03: Q&A on products
- S1-04: Wishlist
- S1-05: Certifications display
- S2: UI/UX polish (homepage, product cards, mobile)
- S3: Growth (seasonal calendar, cart abandonment, SEO, search)

**Long-term vision**: Best marketplace in Greece → expand EU → community features

---

## 8. COMMON PITFALLS (Things I Keep Re-learning)

1. **Producer auth is client-side** (Sanctum/useAuth), admin auth is server-side (JWT/requireAdmin). Don't mix patterns.
2. **Product data SSOT is Laravel**. Frontend only proxies. Never create Prisma product models.
3. **The `/my/*` routes are legacy duplicates** of `/producer/*`. Both exist but `/producer/*` is canonical.
4. **Worktree builds may fail** with Prisma errors — always run `npx prisma generate` first.
5. **Admin cookie is `dixis_jwt`** (renamed from `dixis_session` to avoid collision).
6. **Auto-deploy is broken** (SSH key issue). Always deploy manually after merge.
7. **CI uses SQLite**, production uses PostgreSQL. No `mode: 'insensitive'` or other PG-only features.
8. **Greek locale everywhere**: `el-GR` for dates/currency, Greek UI strings, 5-digit postal codes.

---

## 9. KEY FILES TO KNOW

| File | What |
|------|------|
| `CLAUDE.md` | Non-negotiable guardrails |
| `docs/AGENT-STATE.md` | Session entry point, current status |
| `docs/BACKLOG.md` | Full feature roadmap (6 stages) |
| `docs/BUSINESS-REVIEW-2026-02.md` | Financial reality check |
| `docs/LAUNCH-CHECKLIST-7DAY.md` | First week launch plan |
| `docs/OPS-QUICK-REFERENCE.md` | Daily ops cheat sheet |
| `docs/AGENT/SOPs/SOP-VPS-DEPLOY.md` | Deploy procedure |
| `docs/AGENT/SOPs/SOP-PDAC-lite.md` | Complex feature planning |
| `docs/PRODUCT/PRD-AUDIT.md` | Feature completeness (94%) |
| `frontend/src/lib/api.ts` | API client (product SSOT proxy) |
| `frontend/src/lib/db/client.ts` | Prisma singleton |
| `frontend/src/components/AuthGuard.tsx` | Client-side auth wrapper |
| `frontend/src/app/admin/components/AdminShell.tsx` | Admin layout pattern (copy for new layouts) |
| `scripts/prod-deploy-clean.sh` | Automated deploy script |

---

## 10. SESSION STARTUP CHECKLIST

Every new session, I should:
1. Read `docs/AGENT-STATE.md` (what's the current state?)
2. Read this file (`docs/AGENT/CONTEXT-BOOT.md`)
3. Check `git status` / `git log --oneline -5` (any uncommitted work?)
4. Check WIP (should be max 1 item)
5. Decide next action based on priorities in section 7
6. Start working — no warmup needed

---

_Target: ≤250 lines | Current: ~200 lines_
_Update this file when discovering new "things I keep re-learning"_

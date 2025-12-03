# Project Dixis - Status December 2025

**Date**: December 4, 2025
**Sprint**: Post-Sprint 4 (10 PRs Merged)

---

## Executive Summary

Dixis is a **feature-complete MVP marketplace** connecting Greek producers with consumers. After completing Sprints 1-4, we have:

- Full consumer shopping flow (browse, cart, checkout, payment, tracking)
- Complete producer portal (dashboard, product CRUD, order management)
- Admin panel with approval workflows (producers & products)
- E2E test coverage for critical paths
- Production-ready infrastructure

---

## What Works (By Role)

### Consumer Flow: 100% Complete

| Feature | Status | Notes |
|---------|--------|-------|
| Product Catalog | ✅ | SSR with 30s revalidation |
| Product Search | ✅ | Full-text search |
| Product Detail | ✅ | Images, description, pricing |
| Shopping Cart | ✅ | React Context, persistent |
| Checkout Form | ✅ | Address, shipping method |
| Payment (Viva) | ✅ | Demo mode working |
| Payment (COD) | ✅ | Cash on delivery |
| Order Tracking | ✅ | Token-based lookup |
| Order History | ✅ | Account section |

### Producer Flow: 100% Complete

| Feature | Status | Notes |
|---------|--------|-------|
| Waitlist Signup | ✅ | Application form |
| Onboarding | ✅ | Setup wizard |
| Dashboard | ✅ | KPIs, charts, alerts |
| Product List | ✅ | Search + category filter |
| Create Product | ✅ | Full form with image upload |
| Edit Product | ✅ | All fields editable |
| Delete Product | ✅ | Confirmation modal |
| Order List | ✅ | Filter by status |
| Order Details | ✅ | Full info display |

### Admin Flow: 95% Complete

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard | ✅ | Metrics + alerts |
| Producer Approval | ✅ | Approve/reject with reason |
| Product Approval | ✅ | Approve/reject with reason |
| Order Management | ✅ | Status updates, resend receipt |
| Settings | 🟡 | Placeholder sections |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15.5.0, React 19, TypeScript 5 |
| Styling | Tailwind CSS v4 (emerald-600 primary) |
| Backend | Laravel 11.45.2 (API only) |
| Database | PostgreSQL 15 (Neon) |
| CI Database | SQLite (via schema.ci.prisma) |
| Auth | Sanctum tokens |
| Payments | Viva Wallet (demo + live ready) |
| Testing | Playwright E2E, PHPUnit |
| CI/CD | GitHub Actions |

---

## Recent Milestones (Sprints 1-4)

### Sprint 1: Producer Portal Core
- PR #1246: E2E tests for product CRUD
- PR #1248: Search + category filter for product list

### Sprint 2: Admin Panel Core
- PR #1249: E2E tests for producer approval
- PR #1250: Basic admin settings page

### Sprint 3: Product Approval System
- PR #1251: Database schema change (approvalStatus field)
- PR #1252: Admin UI + API for product approval

### Sprint 4: Security & Quality
- PR #1253: Auth guards on admin API routes
- PR #1254: TypeScript fixes (removed `any` types)
- PR #1255: Error boundaries for major routes
- PR #1256: Toast notifications (replaced alert())

**Total**: 10 PRs merged, ~1,500 LOC

---

## Known Gaps

### Must Fix Before Live

| Gap | Impact | Effort |
|-----|--------|--------|
| Payment in demo mode | Can't accept real payments | Low (env config) |
| SMS disabled | No order notifications | Medium |
| Email disabled | No receipts sent | Medium |

### Nice to Have

| Gap | Impact | Effort |
|-----|--------|--------|
| Admin settings UI real | Admin can't configure | Medium |
| Soft delete products | Data loss on delete | Low |
| Multi-image gallery | Single image only | Medium |

---

## Environment Configuration

Key flags in `.env`:

```bash
# Feature Flags
PUBLIC_LANDING_MODE=false    # Show catalog (not coming-soon)
DIXIS_DEV=0                  # Hide dev pages in production

# Database
DATABASE_URL=postgresql://...  # Neon connection string

# Payment
PAYMENT_PROVIDER=fake         # fake | viva
VIVA_WALLET_ENV=demo         # demo | live

# Notifications (disabled by default)
DIXIS_SMS_DISABLE=1
DIXIS_EMAIL_DISABLE=1

# Shipping Rules
PUBLIC_SHIP_FREE_THRESHOLD_EUR=35
SHIP_MAINLAND_BASE=2.50
SHIP_ISLANDS_BASE=3.50
```

---

## Test Coverage

### E2E Tests (Playwright)
- Producer product CRUD flow
- Producer approval workflow
- Product approval workflow
- Consumer checkout flow
- Payment flow (Viva Wallet)

### CI Pipeline
- TypeScript compilation (strict mode)
- Next.js build
- E2E tests with SQLite
- All checks passing (green)

---

## Next Steps

### Sprint 5: Documentation (Current)
- DB Policy documentation
- User flows documentation
- MVP status documentation

### Sprint 6: Admin Completion
- Notification settings UI
- Shipping configuration UI

### Sprint 7: Go Live Preparation
- Switch Viva Wallet to live mode
- Enable SMS/Email notifications
- Final testing with real data

---

## Quick Reference

### URLs (Development)
- Frontend: http://localhost:3001
- Backend API: http://localhost:8001
- Health check: http://localhost:8001/api/health

### Key Commands
```bash
# Frontend
cd frontend && pnpm dev          # Development server
cd frontend && pnpm build        # Production build
cd frontend && pnpm test:e2e     # E2E tests

# Backend
cd backend && php artisan serve --port=8001
cd backend && php artisan test

# Database
cd frontend && npx prisma studio # DB browser
cd frontend && npx prisma migrate dev # Run migrations
```

### Important Files
- `/CLAUDE.md` - Project rules & DB policy
- `/docs/USER-FLOWS.md` - Navigation documentation
- `/frontend/prisma/schema.prisma` - Database schema
- `/frontend/.env.example` - Environment variables

---

**Status**: MVP Feature-Complete
**Ready For**: Internal testing, producer onboarding demos
**Not Ready For**: Public launch (payment in demo mode)

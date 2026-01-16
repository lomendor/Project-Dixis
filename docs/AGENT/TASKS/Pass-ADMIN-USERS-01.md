# Pass ADMIN-USERS-01 — Admin User Management UI

**When**: 2026-01-16

## Goal

Create admin user management page at `/admin/users` with server-side auth guard.

## Why

- PRD requirement: "Admin user management"
- Identified in PRD-AUDIT-01 as unblocked gap
- Provides visibility into admin accounts for super_admin users

## How

1. **Audit** revealed existing patterns:
   - All admin pages use `requireAdmin()` server-side guard
   - `AdminUser` Prisma model with: id, phone, role, isActive, createdAt
   - Existing admin pages: `/admin/orders`, `/admin/products`, `/admin/producers`

2. **Implementation**:
   - Created `/admin/users/page.tsx` following existing pattern
   - Server-side Prisma query with `requireAdmin()` guard
   - Table displays: phone, role (badge), active status, created date
   - Role badges: super_admin (yellow), admin (blue)
   - Status badges: Ενεργός (green), Ανενεργός (red)
   - Added `data-testid` attributes for E2E testing

3. **E2E tests**:
   - Admin can access page and see users list
   - Non-admin (consumer) is denied access

## Definition of Done

- [x] `/admin/users` page accessible to admin users
- [x] Server-side `requireAdmin()` guard applied
- [x] Table displays admin users with phone, role, status, date
- [x] Non-admin users cannot access page
- [x] Playwright E2E tests pass (admin sees list, non-admin denied)
- [x] TASKS + SUMMARY + STATE + NEXT-7D updated

## PRs

| PR | Title | Status |
|----|-------|--------|
| #2235 | feat: Pass ADMIN-USERS-01 admin users management | MERGED |
| #2236 | fix: E2E guest-checkout cart tests for CI | MERGED |
| #2237 | fix: E2E auth-guard tests for CI | MERGED |

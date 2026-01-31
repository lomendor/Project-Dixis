# Producer Status vs Approval (Architecture Note)

> **Created**: 2026-01-31 (Pass-PRODUCER-STATUS-ARCH-CLARITY-01)
> **Context**: Repeated confusion about producer state terminology led to misleading UI copy

We have **two separate concepts** that look similar but are NOT the same:

---

## 1. Laravel API: Operational State

| Field | `producers.status` |
|-------|-------------------|
| Values | `active` / `inactive` / `pending` |
| Meaning | Operational readiness for producer flows |
| Database | Laravel/PostgreSQL (backend) |
| Used by | Producer-facing routes, auth context |

**Purpose**: Controls whether a producer can access product management, orders, etc.

**UI Labels** (Greek):
- `pending` → "Σε Εκκρεμότητα" (Profile incomplete)
- `active` → "Ενεργός" (Operational)
- `inactive` → "Ανενεργός" (Suspended/deactivated)

---

## 2. Next/Prisma: Admin Approval Workflow

| Field | `Producer.approvalStatus` |
|-------|--------------------------|
| Values | `pending` / `approved` / `rejected` |
| Meaning | Admin workflow for approving producers |
| Database | Prisma/Neon (frontend admin panel) |
| Used by | `/admin/producers` and admin API routes |

**Purpose**: Admins can approve/reject producer applications via the admin panel.

**UI Labels** (Greek):
- `pending` → "Σε αναμονή" (Awaiting admin review)
- `approved` → "Εγκεκριμένος" (Admin approved)
- `rejected` → "Απορρίφθηκε" (Admin rejected)

---

## Guardrail Rule

> **Producer-facing UI** (routes under `/producer/*`, `/my/*`) must:
> - Use Laravel `status` field (via auth context / producerProfile.status)
> - Display operational state messaging (profile completion, activation)
> - **NOT** imply admin approval workflow

> **Admin UI** (routes under `/admin/*`) may:
> - Use Prisma `approvalStatus` field
> - Display approval workflow messaging (pending review, approved, rejected)

---

## Why Two Systems?

Historical reasons:
- Laravel backend handles core business logic and auth
- Next.js frontend has its own Prisma DB for admin features and quick prototyping
- These evolved separately and use different terminology

**Future consideration**: Unify into single source of truth (not in current scope).

---

## Related PRs

- PR #2561: Fixed misleading "approval" copy in producer-facing pages
- PR #2562: Follow-up fix for inactive state copy
- Issue #2563: Tracking issue for dual-system documentation

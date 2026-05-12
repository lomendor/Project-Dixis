# Pass ADMIN-PRODUCER-DELETE-01 — Admin Producer Account Removal

**When**: 2026-05-12
**Branch**: `claude/vigorous-heisenberg-c4e46e`
**Draft PR**: [#3288](https://github.com/lomendor/Project-Dixis/pull/3288) (currently first-pass, needs rewrite per this plan)
**Owner**: CTO agent

---

## Goal

Admin can remove a producer account that requests deletion, in a way that:
1. Solves the immediate need (a producer who just signed up wants their account gone).
2. Respects legal retention obligations once we have real orders (DAC7, DSA traceability, ΕΦΕΤ).
3. Cleans up external state (S3 docs, Stripe Connect).
4. Leaves an admin audit trail consistent with the rest of the admin surface.

## Why

A producer asked the founder to remove their account. The current admin UI has only Approve/Reject — Reject just flips `is_active=false`, it does not actually erase data. This is the first real GDPR-adjacent ask the marketplace receives.

---

## Research findings (full notes from Phase 2 sub-agents — collapsed)

### Legal / retention (`docs/LEGAL-LIABILITY-FOOD-MARKETPLACE.md`, `docs/DAC7-DSA-FIELD-AUDIT.md`, `docs/policies/PRODUCER-AGREEMENT.md`)
- **DAC7 retention period: NOT DOCUMENTED.** Listed as open question for accountant (F6 in AGENT-STATE).
- **GDPR ↔ DAC7 reconciliation: NOT DOCUMENTED.** `BUSINESS-LOGIC-GAP-ANALYSIS.md` flags PRD-07 "Payments & Compliance" as empty.
- **PRODUCER-AGREEMENT.md** has termination clauses (7-day notice, lingering orders) but **no language on deletion / right-to-erasure / retention**.
- **DSA Article 18 (Reg 178/2002 traceability)** requires retention of "which producer supplied which product to which consumer" — exact period not specified for Dixis.
- **No `SoftDeletes` trait or `deleted_at` column exists anywhere in `backend/`.** Hard-delete is the only pattern in the codebase today.

### Existing admin audit & UX patterns
- `AdminAuditLog` Prisma model exists ([frontend/prisma/schema.prisma:193-213](frontend/prisma/schema.prisma)). 10 columns including `oldValue`/`newValue` JSON snapshots.
- `logAdminAction()` helper at [frontend/src/lib/audit/logger.ts:44](frontend/src/lib/audit/logger.ts). Used today in 4 routes: product approve/reject/update, category update. **Producer approve/reject DO NOT log to audit table** — they only proxy to Laravel.
- `AuditAction` union has 8 values, **none for DELETE**. Must extend.
- Laravel has **no audit table**. All audit lives in Next.js (Prisma).
- Confirmation-modal pattern: destructive actions use **typed-phrase confirm** ("ΔΙΑΓΡΑΦΗ"), non-destructive use validation-only. Pattern is already in `admin/producers/page.tsx` (rejection modal = validation-only, delete modal in draft PR = typed-phrase).

### External state cleanup
- **S3 docs**: producers have 4 file fields (`tax_registration_doc_url`, `efet_notification_doc_url`, `haccp_declaration_doc_url`, `image_url`). Uploads via `frontend/src/app/api/uploads/route.ts` → `lib/media/storage.ts`. **No `deleteObject()` helper exists.** S3 objects orphan on delete today.
- **Stripe Connect**: `backend/app/Services/Payment/StripeConnectService.php` has `createConnectedAccount()` but **no `disconnectProducerAccount()` method.** On producer delete, the Stripe account would orphan.
- **Mail classes**: `ProducerApproved`, `ProducerRejected`, `ProducerNewOrder`, `ProducerOrderShipped`, `ProducerWeeklyDigest` exist. **No `ProducerDeleted`.**

### Producer FK constraints (cascade behavior on delete)
| Table | onDelete | Effect |
|-------|----------|--------|
| `products.producer_id` | CASCADE | OK — products auto-removed |
| `messages.producer_id` | CASCADE | OK |
| `producer_digests.producer_id` | CASCADE | OK |
| `order_items.producer_id` | SET NULL | OK — preserves order history with NULL producer |
| `order_shipping_lines.producer_id` | **RESTRICT** | **BLOCKS deletion if any line exists** |
| `commission_settlements.producer_id` | (no FK migration found, but Producer model has relation) | Need to verify |

### User row cascade (when user_id is deleted)
- `producers.user_id` cascades → producer removed (but we'd be deleting producer first anyway)
- `orders.user_id` cascades → orders deleted ❌ **DANGEROUS** if producer's User row is also a customer
- `cart_items.user_id` cascades
- `addresses.user_id` cascades
- `notifications.user_id` cascades
- `personal_access_tokens` polymorphic → Sanctum handles

⚠️ **Hard-deleting the User row can wipe customer orders if the same User also placed customer orders** (e.g., a producer who occasionally shopped on-site as a customer). Must NOT delete User row unless we're certain it's producer-only.

---

## Decisions (locked — founder delegated authority 2026-05-12)

### 1. Two-mode delete based on activity, not admin choice

| Producer state | Mode | What happens |
|---|---|---|
| Pre-revenue (zero `order_items` + zero `order_shipping_lines` + zero `commission_settlements` rows referencing this producer) | **Hard delete** | Producer row removed. Cascade rules clean up `products`, `messages`, `producer_digests`. S3 doc objects deleted. Stripe Connect account deleted via API. User row deleted **only** if `User->orders()->count() === 0`; otherwise user is anonymized instead. Audit log: `PRODUCER_DELETE_HARD`. |
| Post-revenue (any of the three counters > 0) | **Soft delete + anonymize** | Personal fields cleared: `name`, `business_name`, `email`, `phone`, `address`, `tax_id`, `tax_office`, `iban`, `bank_account_holder`, all doc URLs, `image_url`. Set `is_active=false`, `anonymized_at=NOW()`, optional `deletion_reason`. Linked User row anonymized (email→`deleted-<uuid>@dixis.local`, name→`Διαγραφημένος Χρήστης`, password→random hashed, `anonymized_at=NOW()`). Stripe Connect disconnected. S3 docs deleted. Producer row, products, order_items, shipping_lines all kept for traceability/DAC7. Audit log: `PRODUCER_DELETE_SOFT`. |

**Why auto-mode (not admin's choice)**: prevents admin error. The preview endpoint shows which mode will run *before* confirm, so the admin always knows.

**Why anonymization (not enum 'deleted' status)**: `producers.status` is a PostgreSQL `enum('active','inactive','pending')`. Adding 'deleted' requires `ALTER TYPE ... ADD VALUE` which is awkward in CI/SQLite. Using a nullable `anonymized_at` timestamp is portable and queryable. All public producer queries filter `WHERE anonymized_at IS NULL`.

### 2. Audit logging on the Next.js side (matches existing pattern)

- Extend `AuditAction` union with `PRODUCER_DELETE_HARD` and `PRODUCER_DELETE_SOFT`.
- Frontend DELETE proxy calls `logAdminAction()` after Laravel returns success. `oldValue` = producer snapshot (name, email, status, has_orders). `newValue` = `null` for hard / `{ status: 'deleted', anonymized: true }` for soft. `details` = optional admin-supplied reason.

### 3. External cleanup is **best-effort, non-blocking**

- S3 doc deletion runs after DB deletion. Failures are logged but do not roll back the user-facing operation. Orphaned S3 objects are a cleanup-job concern (out of scope for this pass).
- Stripe Connect disconnect runs after DB deletion. Same policy.
- Future pass: orphan-doc reaper cron.

### 4. UI keeps the typed-phrase confirm pattern from the draft PR

- Single "🗑️ Διαγραφή" button per row. Modal shows a preview of what mode will run ("Hard delete" vs "Soft delete + anonymize") based on a backend `GET /admin/producers/{id}/deletion-preview` call. User types `ΔΙΑΓΡΑΦΗ` to confirm. Optional reason textarea.

### 5. Out of scope for this pass

- Updating PRODUCER-AGREEMENT.md with deletion language (legal review, F7).
- DAC7/DSA retention policy (F6 + lawyer + accountant).
- Bulk delete.
- "Restore deleted producer" admin action (soft-delete reverse).
- ProducerDeleted email notification — useful, but adds template work and translations. Track in follow-up.
- S3 orphan reaper cron.

---

## Definition of Done

- [ ] Migration `add_anonymization_columns_to_producers_and_users` adds `anonymized_at` (nullable timestamp + index) to both `producers` and `users`, plus `deletion_reason` (nullable string) to `producers`. Reversible.
- [ ] `StripeConnectService::disconnectProducer($producer)` calls `Stripe\Account::delete($accountId)`. On Stripe API error: log + return false (does not throw — best-effort).
- [ ] `ProducerDeletionService` (new) with two methods: `previewDeletion(Producer): array` returns `{ mode, references }`; `executeDeletion(Producer, ?string $reason): array` runs the chosen path in a DB transaction and returns a snapshot for audit + S3 cleanup.
- [ ] Backend `GET /api/v1/admin/producers/{id}/deletion-preview` (jwt.admin + admin middleware, throttle:60,1) returns preview.
- [ ] Backend `DELETE /api/v1/admin/producers/{id}` (jwt.admin + admin middleware, throttle:30,1, validates optional `reason` ≤500 chars) executes deletion, returns `{ mode, references, doc_urls_to_clean: string[] }`.
- [ ] Public producer queries (storefront + admin list) filter `WHERE anonymized_at IS NULL`. Existing admin "all" list opts in via query param if we want to inspect anonymized records (out of scope for this pass — flag for future).
- [ ] `frontend/src/lib/media/storage.ts::deleteObject(url)` helper added (works for both `fs` and `s3` drivers).
- [ ] `AuditAction` union extended with `PRODUCER_DELETE_HARD`, `PRODUCER_DELETE_SOFT`. Frontend DELETE proxy calls `logAdminAction()` AFTER Laravel returns 2xx, with `oldValue` = pre-delete snapshot (sanitized — no password/IBAN/doc URLs in audit JSON), `newValue` = `null` for hard / `{ anonymized: true }` for soft, `details` = admin reason.
- [ ] Frontend DELETE proxy also calls `deleteObject()` for each URL in `doc_urls_to_clean` — best-effort, logs failures, does not block 2xx response to admin.
- [ ] Admin UI: 🗑️ Διαγραφή button → modal fetches `deletion-preview` on open → shows mode badge + reference counts + warning text per mode → optional reason textarea (≤500 chars) → typed `ΔΙΑΓΡΑΦΗ` to enable confirm → toast on result, refreshes list.
- [ ] PHPUnit Feature test `AdminProducerDestroyTest`:
  - `non_admin_cannot_delete_producer` (403)
  - `delete_returns_404_for_unknown_id`
  - `pre_revenue_producer_is_hard_deleted_with_user_row` (zero orders → hard, user row gone)
  - `producer_with_customer_orders_on_user_is_hard_deleted_but_user_is_anonymized` (zero producer-side orders but user has customer orders → hard delete producer, keep user, anonymize user)
  - `producer_with_order_items_is_soft_deleted_and_anonymized` (has order_items → soft mode, PII cleared, row exists)
  - `delete_writes_audit_compatible_response` (response shape matches frontend expectations)
- [ ] Type-check + lint + php -l clean.
- [ ] AGENT-STATE.md "Recently Done" entry. SUMMARY-Pass-ADMIN-PRODUCER-DELETE-01.md created.

## Out-of-Scope (explicit non-goals)

- DAC7-compliant retention scheme (needs F6 first).
- ProducerDeleted email template.
- Frontend audit-log viewer.
- S3 orphan reaper.

## Risks / Open Questions

1. **F6 accountant guidance still pending.** Soft-delete-with-anonymize is the safest default until then. If F6 returns a stricter retention rule, we revisit anonymization fields.
2. **Stripe Express account deletion**: per Stripe docs, only allowed for accounts with no payouts/balance. For now: try-and-log; on failure, leave a TODO note + flag in the audit log. Future pass: full Stripe Connect offboarding flow.
3. **`order_shipping_lines.producer_id` is `RESTRICT`.** Our soft path avoids the delete entirely, so RESTRICT is no longer a blocker.
4. **`commission_settlements` FK**: not seen in migrations but the model has a hasMany. Confirm during implementation.

## PRs

| PR | Title | Status |
|----|-------|--------|
| [#3288](https://github.com/lomendor/Project-Dixis/pull/3288) | feat(admin): hard-delete producer accounts with safety guards | DRAFT — first-pass, will be force-pushed with the revised plan above |

# Pass ADMIN-PRODUCER-DELETE-01 Summary

**Date**: 2026-05-12
**Status**: COMPLETE — PR [#3288](https://github.com/lomendor/Project-Dixis/pull/3288) ready for review
**Pass doc**: [TASK-Pass-ADMIN-PRODUCER-DELETE-01.md](TASK-Pass-ADMIN-PRODUCER-DELETE-01.md)

## What we did

Admin can now remove a producer who asks for account deletion, with the right level of permanence chosen automatically:

- **Hard delete** when the producer is pre-revenue (no order items, no shipping lines, no settlements).
- **Soft delete + anonymize** when there is any commerce history, so DAC7/DSA traceability survives on past orders.

The admin sees which path will run **before** confirming, via a preview endpoint.

## Why now

A real producer signed up and asked to be removed. Prior options were Approve / Reject — Reject just flips `is_active=false` without erasing any personal data. With F6 (accountant guidance on DAC7 retention) still pending, the pragmatic stance is: erase when nothing is at stake; anonymize-but-retain when it is.

## Components landed

| Layer | Change |
|---|---|
| DB | Migration adds `producers.anonymized_at` (indexed) + `deletion_reason`, `users.anonymized_at` (indexed). No enum change. |
| Model | `Producer::scopeVisible()` filters anonymized rows from public storefront queries. `isAnonymized()` on both Producer and User. |
| Service | `ProducerDeletionService` owns the two-mode logic. `previewDeletion()` is pure inspection. `executeDeletion()` runs the chosen path in a DB transaction and returns a PII-safe snapshot + S3 cleanup targets. |
| Service | `StripeConnectService::disconnectProducer()` calls `accounts.delete()` best-effort. Failures are logged with the orphan account ID; deletion proceeds. |
| API | `GET /api/v1/admin/producers/{id}/deletion-preview` (throttle 60/min) and `DELETE /api/v1/admin/producers/{id}` (throttle 30/min, optional `reason`). Both reject 409 if already anonymized. |
| Frontend | `AuditAction` extended with `PRODUCER_DELETE_HARD` / `PRODUCER_DELETE_SOFT`. DELETE proxy writes the audit row + fires `deleteObject()` for every returned doc URL. GET proxy for preview. `lib/media/storage.ts::deleteObject()` symmetric to `putObject()`, both fs and s3. |
| UI | 🗑️ Διαγραφή button per row → modal fetches preview → shows hard-vs-soft warning + reference counts → optional reason → typed `ΔΙΑΓΡΑΦΗ` to confirm → toast on result. Confirm button is mode-aware ("Οριστική Διαγραφή" vs "Ανωνυμοποίηση"). |
| Tests | `AdminProducerDestroyTest` — 7 scenarios covering authz, 404, hard mode, the user-anonymize edge case, soft mode, idempotence. |

## Safety nets that drove the design

1. **`orders.user_id` cascades.** If we delete a User who has placed customer orders, the orders go with them. The service detects this and anonymizes the User instead — even on hard mode.
2. **`order_shipping_lines.producer_id` is RESTRICT.** Hard delete would fail if any line exists. Soft mode side-steps the FK entirely.
3. **Stripe `accounts.delete()` may reject if the account has balance.** Treated as non-fatal; logged for manual cleanup.
4. **S3 cleanup is async and best-effort.** Failures don't reverse the DB commit; they appear in `doc_cleanup.failures` in the response and in the audit log.
5. **Public storefront and `/producers` API now filter `anonymized_at IS NULL`.** Anonymized rows survive in the DB for traceability but vanish from end-user UI.

## Out-of-scope (flagged for follow-ups)

- ProducerDeleted email notification (mail template + el/en translations) — useful but not blocking.
- Admin "Restore anonymized" action — not asked for; needs UX thought.
- S3 orphan reaper cron — every prior upload before this pass is potentially orphaned.
- Updating `PRODUCER-AGREEMENT.md` with explicit deletion language — pending F7 (lawyer meeting).
- DAC7-specific retention rules — pending F6 (accountant meeting). Anonymization is the safe default until that lands.

## Files

- `docs/AGENT/PASSES/TASK-Pass-ADMIN-PRODUCER-DELETE-01.md` — plan (locked design + DoD)
- `backend/database/migrations/2026_05_12_100000_add_anonymization_columns_to_producers_and_users.php`
- `backend/app/Models/Producer.php` — fillable, casts, `scopeVisible()`, `isAnonymized()`
- `backend/app/Models/User.php` — casts, `isAnonymized()`
- `backend/app/Http/Controllers/Public/ProducerController.php` — `visible()` scope on list + show
- `backend/app/Services/Admin/ProducerDeletionService.php` (new)
- `backend/app/Services/Payment/StripeConnectService.php` — `disconnectProducer()`
- `backend/app/Http/Controllers/Api/Admin/AdminProducerController.php` — `previewDeletion()`, `destroy()`
- `backend/routes/api.php` — two routes added
- `backend/tests/Feature/AdminProducerDestroyTest.php` (new, 7 tests)
- `frontend/src/lib/audit/logger.ts` — two new actions
- `frontend/src/lib/media/storage.ts` — `deleteObject()`
- `frontend/src/app/api/admin/producers/[id]/route.ts` — GET + DELETE handlers
- `frontend/src/app/admin/producers/page.tsx` — button + preview-aware modal

## Verification

- ✅ `php -l` clean on all touched PHP files.
- ✅ `tsc --noEmit` passes.
- ✅ `eslint` 0 warnings on touched TS files.
- ⏳ PHPUnit Feature suite — runs in CI (worktree has no `vendor/`).
- ⏳ Manual end-to-end on staging/prod after deploy. Browser preview cannot exercise Laravel + Neon end-to-end from a worktree.

## Founder hand-off

To remove the producer who asked for deletion right after deploy:

1. Founder shares producer email or ID.
2. CTO runs `GET /admin/producers/{id}/deletion-preview` from the admin UI (or via Neon SQL with the queries used in `ProducerDeletionService::previewDeletion()`).
3. Founder confirms the mode (likely **hard** if zero orders).
4. Click 🗑️ Διαγραφή → type ΔΙΑΓΡΑΦΗ → confirm.

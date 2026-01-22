# Plan: Pass V1-QA-EXECUTE-01

**Date**: 2026-01-22 (Consolidation)
**Status**: COMPLETE
**Type**: QA Execution + Runbook Creation

---

## Objective

Execute final QA verification of 4 core flows on production (dixis.gr) with fresh evidence.

## Prior Verification Status

From `docs/NEXT-7D.md`, V1-QA-EXECUTE-01 was already completed (re-verification 3, 2026-01-21 10:44 UTC):
- ✅ Guest checkout: Order #94
- ✅ User checkout: Order #96, PI `pi_3SrysZQ9Xukpkfmb0wx6f4vt`
- ✅ Producer flow: Product #9
- ✅ Admin flow: Order #94 status updated

## This Pass

Re-execute all 4 flows to generate fresh evidence and confirm production stability.

---

## Execution Plan

### Step 1: Pre-flight Checks
- [ ] Run `./scripts/prod-facts.sh` to verify production health
- [ ] Confirm API healthz returns `{"status":"ok"}`
- [ ] Confirm products API returns valid data

### Step 2: Flow A - Guest Checkout (COD)
- [ ] Navigate to dixis.gr
- [ ] Add product to cart
- [ ] Proceed to checkout as guest
- [ ] Select COD payment method
- [ ] Complete order
- [ ] Record order ID and timestamp

### Step 3: Flow B - User Checkout (Card Payment)
- [ ] Login as test consumer
- [ ] Verify cart sync works
- [ ] Add product and checkout
- [ ] Use Stripe test card
- [ ] Record Payment Intent ID

### Step 4: Flow C - Producer Flow
- [ ] Login as producer
- [ ] Navigate to producer dashboard
- [ ] Verify product management accessible
- [ ] Verify previous Product #9 visible

### Step 5: Flow D - Admin Flow
- [ ] Login as admin
- [ ] Navigate to orders
- [ ] Verify order status update capability
- [ ] Confirm email config shows `configured: true`

### Step 6: Documentation
- [ ] Create `docs/AGENT/TASKS/Pass-V1-QA-EXECUTE-01-4.md`
- [ ] Create `docs/AGENT/SUMMARY/Pass-V1-QA-EXECUTE-01-4.md`
- [ ] Update `docs/OPS/STATE.md`
- [ ] Update `docs/NEXT-7D.md` if needed

---

## Success Criteria

All 4 flows complete without errors. Fresh evidence captured.

---

_Plan: V1-QA-EXECUTE-01 | 2026-01-21_

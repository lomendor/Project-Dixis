# Next 7 Days Roadmap

**Period:** 2025-12-18 to 2025-12-25
**Focus:** Stabilize production + high-impact quick wins
**Updated:** 2025-12-18

## Objectives

1. ✅ Ensure production stability (monitoring, incident response)
2. 🎯 Close critical gaps (email verification, payment validation)
3. 🎯 Improve operational visibility (logging, alerts)
4. 🎯 Reduce friction (guest checkout, better UX)

---

## Day 1-2: Production Stability & Monitoring

### ✅ COMPLETED
- [x] Uptime monitoring workflow (every 5 minutes)
- [x] SSH access stabilization (alias configuration)
- [x] Capability matrix audit (111 features documented)
- [x] Monitoring documentation

### 🎯 IN PROGRESS
- [ ] **Payment Validation (Viva Wallet)**
  - **Owner:** Backend Team
  - **Est:** 6h
  - **Tasks:** Test order in staging, verify webhook, document cases

- [ ] **Email Verification**
  - **Owner:** Backend Team
  - **Est:** 8h
  - **Tasks:** Add email_verified_at column, send verification email, create verify endpoint

---

## Day 3-4: Operational Excellence

### 🎯 TODO
- [ ] **Centralized Logging Setup**
  - **Owner:** DevOps
  - **Option A (Minimal - 2h):** PM2 log aggregation
  - **Option B (Better - 8h):** Loki + Grafana

- [ ] **Admin Alerts (Basic)**
  - **Owner:** DevOps
  - **Est:** 3h
  - **Tasks:** Discord/Slack webhook for critical errors

---

## Day 5-6: UX Improvements

### 🎯 TODO
- [ ] **Guest Checkout (MVP)**
  - **Owner:** Frontend + Backend Team
  - **Est:** 12h
  - **Approach:** Allow checkout without account, create user post-payment

- [ ] **Cart Backend Sync**
  - **Owner:** Frontend Team
  - **Est:** 6h
  - **Tasks:** Sync cart to backend for logged-in users

---

## Day 7: Testing & Documentation

### 🎯 TODO
- [ ] E2E tests for new features (4h)
- [ ] Update documentation (2h)
- [ ] Deploy to production + monitor

---

## Vertical Slices

### Slice 1: Production Monitoring ✅
**Status:** DONE - Uptime checks every 5 minutes

### Slice 2: Payment Validation 🎯
**Status:** IN PROGRESS (Day 1-2)

### Slice 3: User Security 🎯
**Status:** PLANNED (Day 1-2) - Email verification

### Slice 4: Operational Visibility 🎯
**Status:** PLANNED (Day 3-4) - Logging + alerts

### Slice 5: Checkout UX 🎯
**Status:** PLANNED (Day 5-6) - Guest checkout + cart sync

---

## Success Metrics

- [ ] 100% uptime (measured by monitoring)
- [ ] Payment success rate >95%
- [ ] Email verification rate >80%
- [ ] Guest checkout conversion >30%
- [ ] Zero critical production incidents

---

## Links

- [Capability Matrix](PRODUCT/CAPABILITIES.md)
- [Next 30 Days](NEXT-30D.md)
- [Monitoring Guide](OPS/MONITORING.md)

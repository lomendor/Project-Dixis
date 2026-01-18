# Next 30 Days Roadmap

**Period:** 2025-12-18 to 2026-01-17
**Focus:** Feature completion + platform maturity
**Updated:** 2025-12-18

## Overview

30-day plan organized into 4 weekly sprints, each delivering a complete vertical slice of functionality.

---

## Week 1 (Dec 18-25): Stability & Critical Gaps

**Theme:** Production hardening + security
**Status:** IN PROGRESS

### Deliverables

1. ✅ **Uptime Monitoring** - Every 5 minutes, GitHub Actions
2. 🎯 **Email Verification** - Required for new signups
3. 🎯 **Payment Validation** - Viva Wallet end-to-end tested
4. 🎯 **Centralized Logging** - PM2 log aggregation
5. 🎯 **Admin Alerts** - Discord/Slack webhooks for errors
6. 🎯 **Guest Checkout** - Complete order without account
7. 🎯 **Cart Backend Sync** - Persist across devices

**Success Criteria:**
- 100% uptime maintained
- Zero payment failures in test orders
- All new users verify email
- Admin receives alerts within 5 minutes

---

## Week 2 (Dec 26-Jan 1): Admin Tools & Operations

**Theme:** Admin productivity + operational efficiency
**Status:** PLANNED

### Deliverables

1. **User Management (Admin UI)**
   - View all users (consumers + producers)
   - Search/filter by email, role, status
   - Ban/unban users
   - Reset passwords
   - View user activity log
   - **Files:** `frontend/src/app/admin/users/`
   - **Backend:** `backend/app/Http/Controllers/Api/Admin/UserController.php`
   - **Est:** 12h

2. **Shipping Label UI (Admin)**
   - Generate labels for orders
   - Print batch labels
   - Track label status
   - **Files:** `frontend/src/app/admin/shipping/`
   - **Backend:** Integration with existing `ShippingService`
   - **Est:** 16h

3. **Notification Center (Frontend)**
   - Display in-app notifications
   - Mark as read
   - Filter by type
   - **Files:** `frontend/src/components/NotificationCenter.tsx`
   - **Backend:** Existing `/api/notifications` endpoints
   - **Est:** 8h

4. **API Documentation (Swagger/OpenAPI)**
   - Install L5-Swagger
   - Document all public + authenticated endpoints
   - Add examples and schemas
   - **Files:** `backend/swagger/` + annotations
   - **Est:** 12h

**Success Criteria:**
- Admin can manage users without database access
- Shipping labels generated in <30s
- Notifications visible to all user types
- API docs accessible at /api/documentation

---

## Week 3 (Jan 2-8): Search & Discovery

**Theme:** Improve product discoverability + UX
**Status:** PLANNED

### Deliverables

1. **Full-Text Product Search**
   - Implement Laravel Scout (database driver initially)
   - Search by name, description, producer name
   - Highlight search terms
   - **Files:**
     - `backend/config/scout.php`
     - `frontend/src/app/(storefront)/products/page.tsx`
   - **Est:** 10h

2. **Advanced Product Filters**
   - Filter by price range (min/max sliders)
   - Filter by producer
   - Filter by stock availability
   - Combine multiple filters
   - **Files:** `frontend/src/components/ProductFilters.tsx`
   - **Est:** 8h

3. **Product Recommendations**
   - "Similar products" on product detail page
   - Based on category + producer
   - **Files:** `backend/app/Services/RecommendationService.php`
   - **Est:** 6h

4. **Producer Profiles (Public)**
   - Dedicated producer page with all products
   - Producer bio, location, story
   - Reviews (basic)
   - **Files:** `frontend/src/app/producers/[id]/page.tsx`
   - **Est:** 10h

**Success Criteria:**
- Search returns results in <500ms
- Filters reduce results accurately
- Recommendations appear on 100% of product pages
- Producer pages accessible from products

---

## Week 4 (Jan 9-15): Multi-Language & Polish

**Theme:** Internationalization + UX polish
**Status:** PLANNED

### Deliverables

1. **English Language Support**
   - Install next-intl
   - Create translation files (Greek + English)
   - Language switcher in header
   - Detect browser language
   - **Files:**
     - `frontend/src/i18n/`
     - `frontend/messages/el.json`
     - `frontend/messages/en.json`
   - **Est:** 20h

2. **PWA Service Worker**
   - Offline fallback page
   - Cache API responses
   - Add to home screen prompt
   - **Files:** `frontend/src/service-worker.ts`
   - **Est:** 8h

3. **Reorder Functionality**
   - "Reorder" button on order history
   - Pre-fill cart with previous order items
   - Check stock availability before adding
   - **Files:** `frontend/src/app/my/orders/` + CartContext
   - **Est:** 6h

4. **UX Polish Pass**
   - Loading skeletons everywhere
   - Empty states with CTAs
   - Error messages (Greek + English)
   - Success confirmations
   - **Files:** Various components
   - **Est:** 12h

**Success Criteria:**
- Site fully translated (Greek + English)
- PWA installable on mobile
- Reorder works for 100% of past orders
- No "blank screens" on slow connections

---

## Week 5 (Jan 16-17 Buffer): Testing & Launch Prep

**Theme:** Quality assurance + deployment
**Status:** PLANNED

### Deliverables

1. **Comprehensive E2E Tests**
   - New feature coverage (email verify, guest checkout, etc.)
   - Multi-language tests
   - Payment flow tests
   - **Files:** `frontend/tests/e2e/*.spec.ts`
   - **Est:** 16h

2. **Performance Optimization**
   - Lighthouse score >90 (all metrics)
   - Bundle size <300KB initial
   - Database query optimization (N+1 checks)
   - **Est:** 12h

3. **Security Audit**
   - Run OWASP ZAP scan
   - Fix critical/high issues
   - Update dependencies
   - **Est:** 8h

4. **Launch Checklist**
   - All docs updated
   - Runbooks created
   - Rollback tested
   - Monitoring verified
   - **Est:** 6h

**Success Criteria:**
- Test coverage >85%
- Lighthouse all green (90+)
- Zero critical security issues
- Launch checklist 100% complete

---

## Vertical Slices Summary

| Week | Slice | Status | Key Features |
|------|-------|--------|--------------|
| 1 | Production Stability | 🎯 In Progress | Monitoring, email verify, payments, logging |
| 2 | Admin Productivity | 📋 Planned | User mgmt, shipping labels, notifications, API docs |
| 3 | Product Discovery | 📋 Planned | Search, filters, recommendations, producer profiles |
| 4 | Internationalization | 📋 Planned | English support, PWA, reorder, UX polish |
| 5 | Launch Readiness | 📋 Planned | Tests, performance, security, launch prep |

---

## Dependencies & Risks

### Critical Path

```
Week 1 (Stability) → Week 2 (Admin Tools) → Week 3 (Search) → Week 4 (i18n) → Week 5 (Launch)
```

**Blockers:**
- Email verification must complete before guest checkout (users need accounts)
- API docs needed before external integrations
- Search requires database optimization first

### Risk Matrix

| Risk | Impact | Mitigation |
|------|--------|------------|
| Payment testing reveals bugs | High | Test in staging week 1, have rollback plan |
| i18n breaks existing flows | Medium | Feature flag, test thoroughly |
| Performance degrades with new features | Medium | Monitor metrics weekly, optimize continuously |
| Third-party API failures (shipping, payment) | High | Implement circuit breakers, fallback options |
| Security vulnerabilities discovered | High | Run weekly scans, patch immediately |

---

## Success Metrics (30-Day)

### Technical
- [ ] Test coverage: >85% (from current ~80%)
- [ ] Lighthouse score: >90 all categories
- [ ] API response time: <500ms p95
- [ ] Uptime: >99.9% (43 minutes downtime allowed)
- [ ] Error rate: <1%

### Product
- [ ] Email verification rate: >80%
- [ ] Guest checkout conversion: >30%
- [ ] Search usage: >40% of visitors
- [ ] Language switcher usage: >10% (English)
- [ ] PWA install rate: >5% mobile visitors

### Business
- [ ] Order completion rate: >60% (up from baseline)
- [ ] Producer satisfaction: >4.0/5.0 (survey)
- [ ] Admin time saved: >5h/week (estimate)
- [ ] Support tickets: <10/week

---

## Team Allocation

**Week 1-2:**
- **Backend (2 devs):** Email verify, payments, user mgmt, API docs
- **Frontend (2 devs):** Guest checkout, cart sync, notification center
- **DevOps (1):** Logging, alerts, monitoring

**Week 3-4:**
- **Backend (2 devs):** Search, recommendations, i18n backend
- **Frontend (2 devs):** Filters, producer profiles, i18n frontend, PWA
- **DevOps (1):** Performance monitoring, caching

**Week 5:**
- **All hands:** Testing, optimization, launch prep

---

## Post-30-Day Roadmap Preview

**February 2026:**
- Advanced analytics (real-time dashboard)
- Messaging system (consumer ↔ producer)
- Mobile app (React Native)
- Subscription products
- Producer ratings & reviews

**March-April 2026:**
- Multi-currency support
- Advanced shipping (split shipments, tracking)
- Marketing automation
- Loyalty program
- Referral system

---

## Weekly Checkpoints

**Every Friday 5pm:**
1. Review week's deliverables (demo)
2. Update this document (completed ✅)
3. Adjust next week's plan if needed
4. Post summary in #dev channel

**Format:**
```
Week X Summary (YYYY-MM-DD)
✅ Completed: [list features]
🎯 In Progress: [list features]
🚧 Blockers: [list issues]
📊 Metrics: [key numbers]
📅 Next Week: [preview]
```

---

## Links

- [Week 1 Roadmap](AGENT-STATE.md)
- [Capability Matrix](PRODUCT/CAPABILITIES.md)
- [Project Status](PROJECT-STATUS-2025-12.md)
- [PRD Index](PRODUCT/PRD-INDEX.md)
- [Monitoring Guide](OPS/MONITORING.md)

---

## Notes

- **Feature freeze:** Week 5 (Jan 16-17)
- **Launch target:** End of January 2026
- **Review cadence:** Weekly Friday demos
- **Communication:** Async daily standups in #dev
- **Deployment:** Continuous to staging, weekly to production

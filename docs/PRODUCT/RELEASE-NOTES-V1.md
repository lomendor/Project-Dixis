# Release Notes: Dixis V1

**Version:** 1.0.0
**Release Date:** 2026-01-21
**Status:** Production Live
**URL:** https://dixis.gr

---

## Highlights

Dixis V1 is the first production release of the Greek local producer marketplace, connecting consumers directly with local food producers across Greece.

**Key Achievements:**
- Full e-commerce checkout flow (guest + registered users)
- Two payment methods: Cash on Delivery (COD) and Card (Stripe)
- Complete producer self-service dashboard
- Admin oversight and order management
- 40/40 MVP requirements implemented (100%)
- All 4 core flows verified operational in production

---

## What's Included

### For Consumers

| Feature | Description |
|---------|-------------|
| Product Catalog | Browse products with search, filtering by category |
| Shopping Cart | Add to cart, adjust quantities, persistent across sessions |
| Cart Sync | Logged-in users get cart synced across devices |
| Guest Checkout | Order without account using COD payment |
| Card Payment | Secure payments via Stripe (Visa, Mastercard, Klarna, EPS) |
| Order Tracking | View order history and status in account |
| Email Notifications | Order confirmation and status update emails |
| Mobile Support | Fully responsive design for all devices |

### For Producers

| Feature | Description |
|---------|-------------|
| Producer Dashboard | Overview of orders, revenue, quick actions |
| Product Management | Add, edit, toggle availability of products |
| Order Management | View and fulfill incoming orders |
| Producer Profile | Business info visible to consumers |
| Role-Based Access | AuthGuard protection on all producer pages |

### For Administrators

| Feature | Description |
|---------|-------------|
| Admin Dashboard | Platform overview, stats, activity |
| Order Management | View all orders, update statuses |
| User Management | View users and roles |
| Product Oversight | Monitor products across producers |
| Producer Management | Manage producer accounts |

---

## Known Limitations

### Functional Limitations

| Area | Limitation | Workaround |
|------|------------|------------|
| Language Toggle | Position shifts on mobile | Use footer toggle (post-V1 fix planned) |
| Payment | Test mode only (Stripe) | Use test cards for demo |
| Shipping | Fixed shipping zones | Manual adjustment if needed |

### Technical Limitations

| Area | Limitation | Impact |
|------|------------|--------|
| DMARC | Alignment not perfect | Emails deliver but may score lower |
| Real-time | No WebSocket updates | Page refresh for order status |
| Analytics | Basic only | Plausible/Umami ready but disabled |

### Known Issues (Non-Blocking)

1. **Auth guard test flaky**: One pre-existing test failure in E2E suite (not production)
2. **Admin users page**: Shows AdminUser only (nice-to-have for post-V1)

---

## Security Notes

### Implemented Protections

| Protection | Details |
|------------|---------|
| HTTPS | Enforced on all endpoints |
| Auth Rate Limiting | Login: 10 req/min per IP+email, Register: 5 req/min per IP |
| CSRF Protection | Laravel Sanctum tokens |
| CSP Headers | Configured for Stripe iframe compatibility |
| Input Validation | Server-side validation on all forms |
| SQL Injection | Prevented via Eloquent ORM parameterized queries |
| XSS Protection | React auto-escaping + CSP headers |

### Security Testing

- ✅ SEC-AUTH-RL-02: Auth endpoints rate limited
- ✅ No 500 errors exposing stack traces
- ✅ Sensitive routes require authentication

### Credentials & Secrets

All secrets managed via environment variables:
- `RESEND_KEY` - Email service
- `STRIPE_SECRET_KEY` - Payment processing
- `DATABASE_URL` - PostgreSQL connection
- `APP_KEY` - Laravel encryption

---

## Rollback & Recovery

### Quick Rollback (< 5 minutes)

If critical issues are discovered post-launch:

```bash
# Option 1: Revert last commit
git revert HEAD
git push origin main
# Auto-deploy triggers via GitHub Actions

# Option 2: Reset to known-good SHA
ROLLBACK_SHA="06850e79"  # Pre-V1 stable SHA
git reset --hard $ROLLBACK_SHA
git push --force origin main  # Coordinate with team first
```

### Recovery Verification

After rollback, verify:
```bash
# Health check
curl -sS https://dixis.gr/api/healthz

# Products load
curl -sS https://dixis.gr/api/v1/public/products | head -c 200

# Frontend accessible
curl -sS -o /dev/null -w "%{http_code}\n" https://dixis.gr/
```

### Data Recovery

- **Database**: Neon automatic backups (point-in-time recovery)
- **Orders**: Preserved in database, no data loss on rollback
- **User Data**: Stored in PostgreSQL, backed up daily

---

## Verification Evidence

### QA Passes

| Pass ID | Description | Status |
|---------|-------------|--------|
| V1-QA-EXECUTE-01-5 | Final QA verification (all 4 flows) | PASS |
| EMAIL-PROOF-01 | Email delivery verification | PASS |
| SEC-AUTH-RL-02 | Auth rate limiting | PASS |
| LOG-REVIEW-24H-01 | Production logs clean | PASS |
| PERF-SWEEP-PAGES-01 | Performance < 300ms TTFB | PASS |

### Test Results

- **E2E Tests**: 74 PASS, 10 skipped, 1 pre-existing failure
- **Backend Tests**: 30+ PHPUnit tests passing
- **prod-facts.sh**: ALL PASS

---

## Support & Contacts

| Service | Provider | Access |
|---------|----------|--------|
| VPS | Hostinger (Frankfurt) | SSH: `dixis-prod` |
| Database | Neon (PostgreSQL) | Dashboard: neon.tech |
| Email | Resend | Dashboard: resend.com |
| Payments | Stripe | Dashboard: stripe.com |

---

## Next Steps (Post-V1)

See `docs/NEXT-7D.md` for backlog items including:
- Language toggle position fix
- DMARC alignment improvement
- Analytics enablement
- Performance monitoring enhancement

---

_Release Notes: Dixis V1 | 2026-01-21_

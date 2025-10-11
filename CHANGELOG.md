# Changelog

## v0.3.0-alpha — 2025-10-11

### Highlights
- DB hardening: unique `publicToken` + backfill + dev e2e (Pass 178A)
- Quick Wins: PR template, totals/taxes helper + tests, /api/dev/health + x-request-id (Pass 178Q)
- Public order tracking via token (Pass 173M)
- Status emails with tracking links + publicToken backfill
- Shipping normalization + workflow improvements
- CI labeler format fixes + schema-parity enhancements

### Changes
* db: harden Order.publicToken (unique) + backfill + dev e2e checks (Pass 178A) (#495) (3849a3e)
* feat: Quick Wins — PR template; totals/taxes helper + tests; dev health + requestId (Pass 178Q) (#494) (0d41049)
* supersede: #484 — feat(tracking): Public order tracking via token (Pass 173M)... (#491) (804e951)
* ci: fix labeler format + remove schema-parity lockfile dependency (Pass 177J) (#493) (cb0cf13)
* supersede: #485 — feat(tracking): Status emails link + publicToken backfill (P... (#492) (d2c4130)
* supersede: #483 — fix(shipping): normalize aliases→canonical + persist canonic... (#490) (1559701)
* supersede: #482 — Orders API + UI shipping display (rebased on main) (#489) (d65da8d)
* feat(admin): add shipping info panel to order details (label+cost) (#488) (a22000a)
* feat(shipping): Infrastructure for shipping transparency (Pass 173J - PARTIAL) (#480) (6612034)
* feat: Quick-Wins Triad — PR hygiene + Totals/Taxes + Observability (Pass 174Q) (#487) (685b65b)
* chore(admin): Finalize Pass 173I — Print button + global print CSS (no schema) (#479) (af5c7eb)
* ci: fix Prisma schema parity (schema.ci.prisma ↔ schema.prisma) (#486) (62ccfc1)
* feat(admin): Orders dashboard (list+detail+status) + e2e (Pass 170) (#459) (45d72f9)
* ci(playwright): Stabilize CI with SQLite + .env.ci (Pass CI-01) (#462) (6e4791e)
* ops(guardrails): apply audit deltas — policy-gate, labeler, codeql, postgres e2e, required checks (Pass 166b) (#451) (3b27010)
* feat(storefront): wire cart to atomic checkout UI + cart count + e2e (Pass 154) (#439) (7ba14a1)
* feat(storefront): catalog + cart v1 + e2e (Pass 153) (#438) (766a57f)
* ops(checkout): rewire emails after atomic checkout + e2e (Pass 152) (#437) (271503c)
* sec(checkout): atomic stock lock + server price + e2e (Pass 151) (#436) (b0817db)
* feat(admin): dashboard v0 (KPIs + latest orders + low-stock) + e2e (Pass 150) (#435) (c14d075)
* sec(admin): restore guards on /admin/** + e2e (Pass 149) (#434) (4447003)
* feat(inventory): admin products list + low-stock alerts + e2e (Pass 148) (#433) (f321f7f)
* ops/mail: reconcile templates + tracking links (email/confirm/admin) + e2e (Pass 147) (#432) (4ec175c)
* feat(tracking): public order lookup/track + e2e (Pass 146) (#431) (30d4d1e)
* feat(admin): orders dashboard + status transitions + e2e (Pass 130) (#415) (0eadc5d)
* feat(checkout): shipping calc + COD payment abstraction + quote API + e2e (Pass 129) (#414) (54db6be)
* docs(agent): fix scanners with repo root detection + regenerate (Pass AG1.2) (#413) (4a4cd4b)
* docs(agent): Add generated routes/schema + update STATE.md (Pass AG1) (#412) (03ed68f)
* docs(agent): Add generated routes/schema + update STATE.md (Pass AG1) (#411) (2f38d06)
* ops(agent): Agent Docs system + scanners (.mjs) + generated routes/schema (Pass AG1) (#410) (044d447)

_Auto-generated from commit history._


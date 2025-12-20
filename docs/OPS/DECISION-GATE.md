# Decision Gate (MANDATORY before any work)

**Purpose**: Prevent reopening CLOSED topics, enforce WIP=1, and require measurable DoD before execution.

---

## How It Works (3-step preflight check)

### Step 1: CLOSED Protection
1. Read `docs/OPS/STATE.md` → extract CLOSED/STABLE section
2. Extract topic from incoming request
3. **IF** topic ∈ CLOSED list:
   - **STOP immediately**
   - Ask user: "⚠️ CLOSED: [topic] is in STATE.md (line X). Provide evidence it's broken (yes + proof) or say 'no' to STOP."
   - **Do NOT execute** unless user provides:
     - NEW evidence (failing curl, failing test, broken URL, error logs)
     - AND explicit "yes + [evidence]"

### Step 2: WIP=1 Check
1. Read `docs/NEXT-7D.md` → extract current WIP item
2. **IF** request topic ≠ current WIP:
   - **STOP immediately**
   - Ask user: "⚠️ WIP is '[WIP text]' (NEXT-7D.md line Y). Confirm WIP change? (yes/no)"
   - **Do NOT execute** unless user says "yes"
   - **IF** user says "yes" → update NEXT-7D.md first, **THEN** proceed

### Step 3: DoD Required
1. Check if request has measurable Definition of Done (DoD)
2. DoD must include 2-5 concrete checks:
   - HTTP endpoint status (e.g., "GET /api/healthz → 200")
   - Test results (e.g., "php artisan test --filter=ProductPolicy → all pass")
   - E2E scenarios (e.g., "producer cannot edit competitor's product → 403")
3. **IF** no DoD exists:
   - **STOP immediately**
   - Draft DoD with user
   - **THEN** proceed

---

## Concrete Examples

### Example A: SSH/fail2ban (CLOSED topic)

**User request**: "Do SSH hardening / update fail2ban config"

**Decision Gate Response**:
```
⚠️ CLOSED: SSH/fail2ban is in STATE.md (line 6).

STATUS: "Canonical SSH config enforced (deploy user + dixis_prod_ed25519 key +
IdentitiesOnly yes). fail2ban active. Production access stable. (Closed: 2025-12-19)"

Provide evidence it's broken:
- New ban event? (show: sudo fail2ban-client status sshd)
- SSH connection failing? (show: ssh error message)
- Security vulnerability? (show: CVE or scan result)

Say "yes + [evidence]" to reopen, or "no" to STOP.
```

**Action**:
- If user says "no" → **STOP. Do not execute.**
- If user says "yes" but no evidence → **STOP. Ask for evidence.**
- If user provides evidence → reopen, update STATE.md, proceed

---

### Example B: Staging/nginx (non-WIP topic)

**User request**: "Change staging nginx config to separate frontend/backend"

**Decision Gate Response**:
```
⚠️ WIP is "PROD stability monitoring" (NEXT-7D.md line 6).

Current WIP DoD:
- Run scripts/prod-facts.sh daily
- All endpoints return expected codes (healthz=200, products=200, login=307)
- smoke-production CI stays green

You're asking about: Staging nginx configuration

This breaks WIP=1 rule.

Options:
1. Complete current WIP first (mark DONE in NEXT-7D.md)
2. Change WIP to "staging nginx" (update NEXT-7D.md, acknowledge context switch)

Confirm WIP change? (yes/no)
```

**Action**:
- If user says "no" → **STOP. Stay on current WIP.**
- If user says "yes" → update NEXT-7D.md WIP section first, **THEN** proceed

---

### Example C: Product listing (matches WIP - proceed)

**Current WIP** (NEXT-7D.md): "Stage 2 — Permission enforcement audit"

**User request**: "Verify ProductPolicy prevents producers from editing competitors' products"

**Decision Gate Response**:
```
✅ GATE PASSED:
- NOT in CLOSED list
- Matches current WIP: "Stage 2 — Permission enforcement audit"

DoD check:
- ProductPolicy::update() test exists? (yes: tests/Feature/AuthorizationTest.php line 145)
- Producer cross-edit blocked? (yes: test_producer_cannot_update_other_producers_product)
- Admin override works? (yes: test_admin_can_update_any_product)

Proceeding with audit.
```

**Action**: Execute immediately (all checks passed)

---

## When to Apply (ALWAYS)

**Triggers** (apply Decision Gate before ANY of these):
- User sends new prompt/task
- User asks "can you do X"
- User says "next, let's work on Y"
- Chat resumes after break
- New session starts

**Exceptions** (skip Gate only for):
- Pure questions about existing code (no changes)
- Read-only exploration (Grep/Read/ls)
- Answering "what does this do" (no execution)

---

## Enforcement Checklist

Before starting ANY work:

- [ ] Read `docs/OPS/STATE.md` (lines 1-50, CLOSED section)
- [ ] Read `docs/NEXT-7D.md` (lines 1-20, WIP section)
- [ ] Extract topic from user request
- [ ] Run CLOSED check (Step 1)
- [ ] Run WIP check (Step 2)
- [ ] Run DoD check (Step 3)
- [ ] IF all pass → Execute
- [ ] IF any fail → STOP and ask user

**No shortcuts. No "I'll check later". Gate runs FIRST.**

---

## How to Reopen CLOSED Items (the right way)

**IF** user has evidence something CLOSED is broken:

1. User provides evidence (curl output, test failure, error logs)
2. Verify evidence is NEW (not from old issue)
3. Update STATE.md:
   - Move from CLOSED → IN PROGRESS
   - Add evidence reference
   - Set DoD for re-fix
4. THEN proceed with work

**Example**:
```markdown
## IN PROGRESS
- **SSH/fail2ban** (REOPENED 2025-12-21)
  - **Reason**: New ban event from admin IP (evidence: fail2ban-client shows 1 ban)
  - **DoD**: Verify fail2ban ignoreip includes admin IP, 0 bans after fix
  - **Evidence**: sudo fail2ban-client status sshd output attached
```

---

## Files Referenced

- `docs/OPS/STATE.md` - Source of truth for CLOSED/WIP
- `docs/NEXT-7D.md` - Current WIP (one item only)
- `docs/OPS/PROD-FACTS-LAST.md` - Latest health check results

---

**Last Updated**: 2025-12-20
**Status**: ✅ ACTIVE (mandatory enforcement)

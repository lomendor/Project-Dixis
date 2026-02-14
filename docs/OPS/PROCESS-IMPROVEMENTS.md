# PROCESS IMPROVEMENTS (3 ITEMS ONLY)

**Date**: 2025-12-20
**Source**: Actual operational history (SSH bans, DoD loops, multi-pass overhead)

---

## 1) SSH/VPS Access Failures (Wrong Key/Identity)

### Symptom
- SSH connections to VPS fail with "Permission denied" or timeout
- fail2ban bans occur from repeated failed attempts
- Multiple SSH keys in use causing identity confusion
- Production access blocked, requiring manual unbanning

### Root Cause
- SSH client tries multiple keys before the correct one (dixis_prod_ed25519)
- Default SSH behavior: tries all keys in ~/.ssh/, exhausting fail2ban attempts
- Missing `IdentitiesOnly yes` in SSH config
- No canonical SSH command documented

### Fix
**Canonical SSH command** (enforced in all docs):
```bash
ssh dixis-prod
```

> **UPDATE 2026-02-14**: Root login is now DISABLED. User is `deploy`.
> See `docs/AGENT/SYSTEM/ssh-access.md` for canonical SSH config.

SSH config (~/.ssh/config):
```
Host dixis-prod
  HostName 147.93.126.235
  User deploy
  IdentityFile ~/.ssh/dixis_prod_ed25519_20260115
  IdentitiesOnly yes
```

### Enforcement (what we do every time)
1. **Before ANY SSH command**: Use `ssh dixis-prod` (never bare `ssh root@...` — root is disabled)
2. **Document in all VPS-related docs**: Include full SSH command with `-o IdentitiesOnly=yes`
3. **Verify in PR**: Any PR touching VPS access must include canonical SSH command
4. **STATE.md entry**: "SSH/fail2ban: Canonical SSH config enforced" (closed 2025-12-19)

**Evidence**: `docs/OPS/STATE.md` line 6 (SSH/fail2ban CLOSED)

---

## 2) Missing State Snapshots → Infinite Loops

### Symptom
- Same feature audit repeated 3-4 times (e.g., "check if cart exists")
- Work starts without checking STATE.md/AGENT-STATE.md
- Implement feature → discover it already exists → write verification doc → repeat
- No clear "start of pass" ritual

### Root Cause
- No mandatory rehydration step at start of every pass
- STATE.md not treated as source of truth (optional reading)
- Missing Definition of Done (DoD) before starting work
- No enforcement of WIP=1 rule (multiple items in progress)

### Fix
**Mandatory Rehydration Protocol** (PHASE 0 every pass):
```bash
# 1. Read current state (source of truth)
cat docs/OPS/STATE.md | head -120
cat docs/AGENT-STATE.md | head -60

# 2. Run prod facts (verify baseline)
./scripts/prod-facts.sh

# 3. Check WIP count (must be 0 or 1)
grep -A5 "WIP.*ONLY" docs/OPS/STATE.md

# 4. Confirm DoD exists for next item
grep -A10 "NEXT.*ordered" docs/OPS/STATE.md
```

**Before ANY implementation**:
- ✅ DoD written in advance (measurable, testable)
- ✅ WIP limit enforced (max 1 item)
- ✅ Evidence path defined (where to put proof)

### Enforcement (what we do every time)
1. **Start of EVERY pass**: Run rehydration commands (STATE + NEXT + prod-facts)
2. **Before writing code**: Confirm item has DoD in AGENT-STATE.md or create it
3. **WIP=1 gate**: If WIP already occupied, STOP (finish current item first)
4. **PR requirement**: Every PR must update STATE.md (move from IN PROGRESS → CLOSED/STABLE)
5. **Auto-reminder**: If STATE.md not updated in 6+ hours, assume work abandoned

**Evidence**:
- PR #1781: Stage 3 verification (found feature already complete)
- PR #1782: Stage 3 CRUD verification (found feature already complete)
- PR #1783: Stage 4A verification (found feature already complete)

---

## 3) Multi-Pass Overhead (Split Prompts)

### Symptom
- User sends "fix X" → I respond "let me audit" → user says "ok" → I audit → user says "now fix" → I fix
- 5-7 message exchanges for single task
- Slow velocity (20+ minutes for what should be 5 minutes)
- Constant context-switching between research and execution

### Root Cause
- Over-cautious interpretation of "ask before doing"
- No clear distinction between trivial vs complex tasks
- Missing "one-shot execution" pattern for simple tasks
- Treating every request as needing explicit approval

### Fix
**One-Shot Execution Pattern** (for tasks meeting criteria):

**Execute immediately WITHOUT asking if ALL of**:
- Task is docs-only (no code/infra changes)
- DoD is measurable from request (e.g., "verify X works" → run tests + show output)
- Scope is clear (no ambiguity about what to do)
- Risk is low (reversible, no production impact)
- Total work fits in single pass (<300 LOC if code involved)

**Examples**:
- ✅ "Verify cart works" → Run tests, show results, done
- ✅ "Update STATE.md to reflect X" → Edit, commit, PR, done
- ✅ "Run prod facts" → Execute script, show output, done
- ❌ "Add payment integration" → Ask (complex, needs design)
- ❌ "Refactor auth system" → Ask (architectural decision needed)

**Default Pass Template**:
```
User: [request]
Assistant:
  PHASE 0: Rehydrate (STATE + NEXT + prod-facts)
  PHASE 1: Audit (what exists)
  PHASE 2: Execute (fix/implement)
  PHASE 3: Proof (tests + evidence)
  PHASE 4: Update STATE/NEXT
  STOP (one message, end-to-end)
```

### Enforcement (what we do every time)
1. **Single-message execution**: If task is clear + low-risk, execute end-to-end in one response
2. **Ask ONLY when**: Ambiguity exists, or architectural choice needed, or scope unclear
3. **Default to action**: "Done + here's proof" beats "should I do this?"
4. **Time check**: If >3 messages for same task, something is wrong (reset approach)

**Evidence**: This very pass took 4+ hours across multiple PRs when it should have been 1 PR in 20 minutes.

---

## Default Pass Template (WE WILL FOLLOW)

**Every pass must follow this sequence** (no exceptions):

```bash
# PHASE 0 — Rehydrate (5 min max)
cat docs/OPS/STATE.md | head -120        # Current state
cat docs/AGENT-STATE.md | head -60           # Current WIP/NEXT
./scripts/prod-facts.sh                  # Baseline verification
grep "WIP.*ONLY" docs/OPS/STATE.md       # Enforce WIP=1

# PHASE 1 — Decide (2 min max)
# - What is WIP? (from STATE.md IN PROGRESS section)
# - What is DoD? (must be measurable/testable)
# - What is the smallest next action?

# PHASE 2 — Execute End-to-End (10 min max)
# - Audit (search/read existing implementation)
# - Fix/Implement (code/docs/tests)
# - Proof (run tests, show output)
# - Update STATE.md (move from IN PROGRESS → CLOSED/STABLE)
# - Update AGENT-STATE.md (move to DONE, pull next item)

# PHASE 3 — PR + Auto-Merge
# - Branch: feat/* or docs/* or chore/*
# - Commit: clear message with evidence
# - PR: title + body with proof + labels (ai-pass, risk-ok)
# - Auto-merge: gh pr merge --auto --squash

# PHASE 4 — STOP
# - Output: PR URL + test results + updated STATE/NEXT
# - No additional work until next user request
```

**Time Budget**:
- Rehydrate: 5 min
- Decide: 2 min
- Execute: 10 min
- PR: 3 min
- **Total**: 20 min/pass max

**If ANY phase exceeds time budget**: STOP, report blocker, ask for guidance.

---

## Retrospective: What Changed

**Before**:
- SSH: Bare `ssh root@IP` → fail2ban bans
- State: Optional STATE.md reading → repeated work
- Tempo: 5-7 messages/task → slow velocity

**After (enforced via this SOP)**:
- SSH: Canonical command with IdentitiesOnly → no bans
- State: Mandatory rehydration → no duplicate work
- Tempo: Single-pass execution → 20 min/task

**Measurement**: Next 10 PRs must follow this template. If >2 PRs violate, revisit SOP.

---

**Document Owner**: Claude + User (joint accountability)
**Last Updated**: 2025-12-20
**Status**: ✅ **ACTIVE** (enforce immediately)

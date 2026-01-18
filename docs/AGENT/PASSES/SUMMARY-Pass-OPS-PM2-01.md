# Pass OPS-PM2-01 - Summary

**Date**: 2026-01-15
**Duration**: ~30 minutes
**Result**: SUCCESS

## TL;DR

Fixed deploy-frontend workflow false-fails by adding WAIT_FOR_3000 readiness gate (90s max) before OPS-PM2-01 strict 20x curl proof. Also changed .env handling from wipe to upsert to preserve manually-set keys.

## Problem

Deploy workflow was failing at OPS-PM2-01 20x curl proof even though the app was healthy. Root cause: Next.js startup takes 25-30s, and the 20x proof started before the app was fully ready.

## Solution

PR #2203: Added two fixes:
1. **WAIT_FOR_3000 readiness gate**: 90s max (18 attempts × 5s) before starting 20x proof
2. **Upsert .env approach**: Preserve existing keys (like NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) instead of wiping

## Proof

| Item | Link |
|------|------|
| Deploy run (PASS) | https://github.com/lomendor/Project-Dixis/actions/runs/21014160709 |
| PR #2203 | https://github.com/lomendor/Project-Dixis/pull/2203 |
| Merged commit | `ebef2131` |

## Prod Sanity (all pass)

```bash
curl -sI https://dixis.gr/                    # 200 OK
curl -s https://dixis.gr/api/v1/public/products  # 200 OK, JSON (5 products)
```

## Key Changes

### deploy-frontend.yml

**WAIT_FOR_3000 readiness gate** (lines 265-281):
```bash
READY=0
for attempt in $(seq 1 18); do
  if curl -fsS --max-time 3 http://127.0.0.1:3000/ > /dev/null 2>&1; then
    echo "✅ Port 3000 ready after $((attempt*5))s"
    READY=1
    break
  fi
  sleep 5
done
if [ "$READY" -eq 0 ]; then
  echo "FAIL: NO_LISTENER_3000 after 90s"
  exit 1
fi
```

**Upsert .env approach** (lines 159-190):
```bash
upsert_env() {
  local KEY="$1"
  local VALUE="$2"
  grep -v "^${KEY}=" .env > .env.tmp 2>/dev/null || true
  mv .env.tmp .env 2>/dev/null || true
  echo "${KEY}=${VALUE}" >> .env
}
```

## Decisions

- OPS-PM2-01 proof now has a 90s readiness gate to handle slow Next.js startup
- .env preservation via upsert prevents loss of manually-set keys during deploy

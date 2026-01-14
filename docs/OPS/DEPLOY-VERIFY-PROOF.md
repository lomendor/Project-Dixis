# Deploy Verification Proof Standard

**Last Updated**: 2026-01-14
**Purpose**: Canonical post-deploy verification without sudo

---

## Overview

After deploying the frontend via GitHub Actions, the workflow runs verification checks to ensure the app is healthy. These checks must work without `sudo` since the `deploy` user does not have passwordless sudo.

---

## Verification Checks (3-Point Proof)

### 1. Port Listener Check
Verifies port 3000 is listening (curl-based, no sudo):

```bash
curl -s --max-time 3 http://127.0.0.1:3000/ > /dev/null || { echo "FAIL: NO_LISTENER_3000"; exit 1; }
```

**Success**: Curl returns 0 exit code
**Failure**: `FAIL: NO_LISTENER_3000` + exit 1

### 2. Health Endpoint Check
Verifies the app responds with healthy status:

```bash
curl -s --max-time 10 http://127.0.0.1:3000/api/healthz | grep -q '"status":"ok"'
```

**Success**: JSON response contains `"status":"ok"`
**Failure**: Health check failed or timeout

### 3. Deep Health Check (DB Connectivity)
Verifies database connection is working:

```bash
curl -s --max-time 10 http://127.0.0.1:3000/api/healthz?deep=1 | grep -q '"db":"connected"'
```

**Success**: JSON response contains `"db":"connected"`
**Failure**: Warning logged (non-blocking for deploy)

---

## OPS-PM2-01 Strict Proof (20x Curl)

The deploy workflow runs 20 consecutive curl requests to verify stability:

```bash
FAIL_COUNT=0
for i in $(seq 1 20); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:3000/manifest.webmanifest || echo "000")
  if [ "$CODE" != "200" ] && [ "$CODE" != "204" ]; then
    echo "FAIL: Request $i returned $CODE"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
  sleep 1
done
if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "FAIL: $FAIL_COUNT/20 requests failed. PM2 unstable."
  exit 1
fi
echo "OPS-PM2-01 PROOF PASSED: 20/20 requests returned 200/204"
```

---

## Why No Sudo?

The `deploy` user is configured for deployments only:
- Does not have passwordless sudo access
- Previous checks using `sudo ss -lntp` failed with "password required"
- All verification now uses curl which runs as the deploy user

**Fix History**:
- PR #2195: Replaced `sudo ss -lntp` with curl-based listener check

---

## Troubleshooting

### "FAIL: NO_LISTENER_3000"
1. Check PM2 status: `pm2 status`
2. Check PM2 logs: `pm2 logs dixis-frontend --err --lines 50`
3. Verify port 3000 is listening (no sudo needed):
   - `curl -s http://127.0.0.1:3000/ > /dev/null && echo "OK" || echo "NOT LISTENING"`
   - `ss -ltn | grep :3000`
   - (optional, may need sudo): `lsof -i:3000`

### Health check timeout
1. App may be starting slowly - wait and retry
2. Check INTERNAL_API_URL is correct: `grep INTERNAL_API_URL .env`
3. Check PM2 process is running: `pm2 show dixis-frontend`

---

## Related Documentation

- `docs/OPS/SSH-DEPLOY-RUNBOOK.md` - SSH access configuration
- `.github/workflows/deploy-frontend.yml` - Full deployment workflow
- `docs/OPS/PROD-ACCESS.md` - VPS access documentation

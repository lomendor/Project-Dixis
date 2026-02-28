# SSH Deploy Runbook

**Last Updated**: 2026-01-13
**Purpose**: Canonical SSH access for CI/CD deployments

---

## Canonical Configuration

| Setting | Value |
|---------|-------|
| **Host** | `147.93.126.235` |
| **User** | `deploy` |
| **Port** | `22` |
| **Key Name** | `dixis_prod_ed25519` |
| **Key Fingerprint** | `SHA256:KrAQdzHHlh0/GUvONv3Y/5ULgz04h6C6VrC8cHDyy78` |

---

## GitHub Secrets

| Secret | Description |
|--------|-------------|
| `VPS_SSH_KEY` | Private key (`~/.ssh/dixis_prod_ed25519`) |
| `VPS_USER` | `deploy` |
| `VPS_HOST` | `147.93.126.235` |
| `KNOWN_HOSTS` | SSH host key (auto-generated) |

---

## VPS Authorized Keys Path

```
/home/deploy/.ssh/authorized_keys
```

**Required permissions:**
- `/home/deploy/.ssh/` → `700`
- `/home/deploy/.ssh/authorized_keys` → `600`
- Owner: `deploy:deploy`

---

## Verification Commands

### 1. Local SSH Test
```bash
ssh -i ~/.ssh/dixis_prod_ed25519 deploy@147.93.126.235 "whoami; hostname"
```

### 2. GitHub Actions Verify Workflow
```bash
gh workflow run "Verify VPS SSH"
gh run list --workflow="Verify VPS SSH" --limit=1
```

### 3. On-Server Check
```bash
# Check authorized_keys
cat /home/deploy/.ssh/authorized_keys

# Check permissions
ls -la /home/deploy/.ssh/

# Check sshd config
grep -E "AllowUsers|PubkeyAuthentication" /etc/ssh/sshd_config
```

---

## Troubleshooting

### "Permission denied (publickey)"

1. **Check AllowUsers**: VPS has `AllowUsers` directive - ensure `deploy` is listed
2. **Check permissions**: `.ssh` must be 700, `authorized_keys` must be 600
3. **Check ownership**: Must be `deploy:deploy`
4. **Restart sshd**: `systemctl restart sshd`

### "Connection timeout" from GitHub Actions

1. Check VPS firewall allows GitHub Actions IPs
2. Or use self-hosted runner

---

## Important Notes

- **DO NOT use root** for deployments - `deploy` user only
- **Single key**: Only `dixis_prod_ed25519` is authorized
- **PM2 runs as deploy**: All PM2 commands run under deploy user

---

## Common Issues & Fixes (keep updated)

### 1. Deploy smoke test fails: "404 HTML (likely Laravel, not Next.js)"
**Symptom**: Deploy workflow fails at "Security Smoke Test (P0-SEC-01)".
**Root cause**: The smoke test curls `/api/producer/orders/deploy-test/status` and expects 401 JSON. If the Next.js route handler doesn't exist, Next.js returns its 404 page (HTML).
**Fix**: Ensure route handler exists at `frontend/src/app/api/producer/orders/[id]/status/route.ts`. Fixed in PR #3244 (2026-02-28).
**NOT nginx**: The nginx config routes `/api/producer/*` to Next.js correctly.

### 2. Neon "Limit reached" — admin login broken
**Symptom**: Admin enters OTP, gets kicked back to login. `/api/healthz?deep=1` returns `"db":"error"`.
**Root cause**: Neon Free tier compute hours exhausted (100 CU-hrs/month).
**Quick check**: Go to console.neon.tech → look for red "Limit reached" banner.
**Fix**: Wait for monthly reset (1st of month). Long-term: cap Max CU to 0.25 (done PR #3243), or upgrade to Launch plan (~$11/mo).
**Prevention**: Max CU locked at 0.25 CU since 2026-02-28 (PR #3243).

### 3. GitHub secret DATABASE_URL_PROD out of date
**Symptom**: Deploy succeeds but DB unreachable. Neon password changed but GitHub secret still has old one.
**Root cause**: `deploy-frontend.yml` overwrites `.env` DATABASE_URL from GitHub secret on every deploy.
**Fix**: GitHub → repo Settings → Secrets → update `DATABASE_URL_PROD` with the Neon connection string from console.neon.tech → Connection Details.
**Important**: Manual `.env` changes on VPS get overwritten on next deploy!

### 4. SSH "Permission denied" from agent session
**Symptom**: `ssh deploy@147.45.77.130` fails.
**Root cause**: Wrong IP! Correct is `147.93.126.235`. Use alias `ssh dixis-prod`.
**Fix**: Always use `ssh dixis-prod` (alias configured in `~/.ssh/config`).

---

## Related Docs

- `docs/OPS/PROD-ACCESS.md` - Full VPS access documentation
- `docs/OPS/SECRETS-MAP.md` - All GitHub secrets
- `.github/workflows/deploy-frontend.yml` - Frontend deployment workflow

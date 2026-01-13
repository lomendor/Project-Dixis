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

## Related Docs

- `docs/OPS/PROD-ACCESS.md` - Full VPS access documentation
- `docs/OPS/SECRETS-MAP.md` - All GitHub secrets
- `.github/workflows/deploy-frontend.yml` - Frontend deployment workflow

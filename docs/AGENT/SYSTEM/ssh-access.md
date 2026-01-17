# SSH Access - Canonical Configuration

**Last Updated**: 2026-01-17 (Pass OPS-SSH-HYGIENE-01)

## Quick Reference

| Item | Value |
|------|-------|
| **Canonical Alias** | `dixis-prod` |
| **Host** | 147.93.126.235 |
| **User** | root |
| **Key File** | `~/.ssh/dixis_prod_ed25519_20260115` |
| **Key Fingerprint** | SHA256:MekIeM... |

## Health Check Command

Always use the canonical alias, never direct `ssh -i`:

```bash
ssh dixis-prod 'echo SSH_OK && whoami && hostname && uptime'
```

Expected output:
```
SSH_OK
root
srv709397
 HH:MM:SS up X days, ...
```

## ~/.ssh/config (Canonical)

```
Host dixis-prod
  HostName 147.93.126.235
  User root
  Port 22
  IdentityFile ~/.ssh/dixis_prod_ed25519_20260115
  IdentitiesOnly yes
  PubkeyAuthentication yes
  PasswordAuthentication no
  ServerAliveInterval 30
  ServerAliveCountMax 3
```

## Rules

1. **Always use alias**: `ssh dixis-prod` - never `ssh -i ... user@ip`
2. **One canonical key**: Only `dixis_prod_ed25519_20260115` is authorized on server
3. **IdentitiesOnly yes**: Prevents SSH agent from offering other keys
4. **No password auth**: Key-only authentication enforced

## Troubleshooting

### Permission denied (publickey)

1. Verify key exists: `ls -la ~/.ssh/dixis_prod_ed25519_20260115`
2. Check permissions: `chmod 600 ~/.ssh/dixis_prod_ed25519_20260115`
3. Verify config: `ssh -G dixis-prod | grep -E 'hostname|user|identityfile'`
4. Test with verbose: `ssh -vv dixis-prod 'whoami'`

### Key not found

If canonical key is missing, check quarantine:
```bash
ls ~/.ssh/_quarantine_ssh_keys_*
```

Restore if needed (should not be necessary):
```bash
cp ~/.ssh/_quarantine_ssh_keys_20260117/dixis_prod_ed25519_20260115 ~/.ssh/
chmod 600 ~/.ssh/dixis_prod_ed25519_20260115
```

## Key Inventory (Active)

| Key | Purpose | Location |
|-----|---------|----------|
| `dixis_prod_ed25519_20260115` | VPS prod access | ~/.ssh/ |
| `dixis_ci_ed25519` | GitHub Actions CI | ~/.ssh/ |
| `dixis_github_deploy` | GitHub deploy key | ~/.ssh/ |
| `dixis_staging` | Staging (if exists) | ~/.ssh/ |

## Quarantined Keys

Old keys moved to `~/.ssh/_quarantine_ssh_keys_20260117/` on 2026-01-17.
These are NOT deleted, just moved out of active use.

Do NOT restore these without explicit need:
- dixis_prod_ed25519 (replaced by 20260115 version)
- dixis_main_ed25519 (old main key)
- dixis_prod_v3, v4 (old versions)
- hostinger_* (old provider keys)

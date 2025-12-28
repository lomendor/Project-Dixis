# Server Access (no secrets)

## Production VPS

- **Host alias:** dixis-prod
- **Host/IP:** 147.93.126.235
- **User:** deploy
- **SSH key file:** ~/.ssh/dixis_prod_ed25519
- **Requirement:** IdentitiesOnly yes
- **Note:** Root login should remain disabled

## Recommended: GitHub Actions Workflow (Primary Method)

**Use the VPS Migration Runner workflow for all deployment operations.**

```bash
# Run migrations
gh workflow run "VPS Migration Runner" --field migration_action=migrate

# Run full pass (pull code + migrate + seed)
gh workflow run "VPS Migration Runner" --field migration_action=full-pass-50

# Check migration status
gh workflow run "VPS Migration Runner" --field migration_action=status

# Seed shipping zones
gh workflow run "VPS Migration Runner" --field migration_action=seed-shipping-zones

# Diagnose SSH issues
gh workflow run "VPS Migration Runner" --field migration_action=diagnose-ssh
```

**Why prefer GitHub Actions:**
- GitHub IPs are always allowed by the VPS
- Works even when local SSH access is blocked
- Provides logged, auditable deployments
- No local key management needed

## Alternative: Direct SSH (Fallback Only)

Local SSH config (`~/.ssh/config`) should contain:

```
Host dixis-prod
  HostName 147.93.126.235
  User deploy
  IdentityFile ~/.ssh/dixis_prod_ed25519
  IdentitiesOnly yes
  ServerAliveInterval 30
  ServerAliveCountMax 3
```

### Quick Test

```bash
ssh dixis-prod 'whoami && hostname && uptime'
```

Expected output:
```
deploy
srv709397
[uptime info]
```

## Directory Paths

| Component | Path |
|-----------|------|
| Backend (Laravel) | `/var/www/dixis/backend/` |
| Frontend (Next.js) | `/var/www/dixis/current/frontend/` |
| PM2 logs | `/home/deploy/.pm2/logs/` |

## Security Notes

- **fail2ban:** Active on server
- **IdentitiesOnly yes:** Prevents offering other keys that could trigger bans
- **Root login:** Disabled in sshd_config
- **Password auth:** Disabled, public key only

## Common Commands (via SSH)

```bash
# Check PM2 status
ssh dixis-prod 'pm2 list'

# Check service status
ssh dixis-prod 'systemctl status nginx'

# View frontend logs
ssh dixis-prod 'pm2 logs dixis-frontend --lines 50'

# View backend logs
ssh dixis-prod 'pm2 logs dixis-backend --lines 50'

# Run migrations manually
ssh dixis-prod 'cd /var/www/dixis/backend && php artisan migrate --force'
```

## Troubleshooting

### SSH Connection Refused

If local SSH returns "Connection refused":

1. **Use GitHub Actions instead** (recommended):
   ```bash
   gh workflow run "VPS Migration Runner" --field migration_action=diagnose-ssh
   ```

2. The VPS may be blocking your IP at network level (ISP or provider firewall)
   - GitHub Actions IPs are typically allowed
   - Your local IP may not be whitelisted

3. Check if VPS is up:
   ```bash
   curl -sS https://dixis.gr/api/healthz
   ```

### Permission Denied

1. Verify key file exists: `ls -la ~/.ssh/dixis_prod_ed25519`
2. Check key permissions: `chmod 600 ~/.ssh/dixis_prod_ed25519`
3. Verify correct user (deploy, NOT root)

## Related Documentation

- [Production State](STATE.md)
- [Monitoring](MONITORING.md)
- [VPS Migration Workflow](../../.github/workflows/vps-migrate.yml)

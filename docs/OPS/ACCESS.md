# Server Access (no secrets)

## Production VPS

- **Host alias:** dixis-prod
- **Host/IP:** 147.93.126.235
- **User:** deploy
- **SSH key file:** ~/.ssh/dixis_prod_ed25519
- **Requirement:** IdentitiesOnly yes
- **Note:** Root login should remain disabled

## SSH Configuration

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

## Quick Test

Verify access without secrets:

```bash
ssh dixis-prod 'whoami && hostname && uptime'
```

Expected output:
```
deploy
srv709397
[uptime info]
```

## Security Notes

- **fail2ban:** Active on server, our IP (94.66.136.129) is in ignoreip list
- **IdentitiesOnly yes:** Prevents offering other keys that could trigger bans
- **Root login:** Disabled in sshd_config
- **Password auth:** Disabled, public key only

## Common Commands

```bash
# Check PM2 status
ssh dixis-prod 'pm2 list'

# Check service status
ssh dixis-prod 'systemctl status nginx'

# View frontend logs
ssh dixis-prod 'pm2 logs dixis-frontend --lines 50'

# View backend logs
ssh dixis-prod 'pm2 logs dixis-backend --lines 50'
```

## Troubleshooting

If connection is refused:
1. Check fail2ban status: `ssh dixis-prod 'sudo fail2ban-client status sshd'`
2. Verify IP not banned
3. Check sshd service: `ssh dixis-prod 'systemctl status ssh'`

If permission denied:
1. Verify key file exists: `ls -la ~/.ssh/dixis_prod_ed25519`
2. Check key permissions: `chmod 600 ~/.ssh/dixis_prod_ed25519`
3. Verify correct user (deploy, NOT root)

## Related Documentation

- [Production State](STATE.md)
- [Monitoring](MONITORING.md)

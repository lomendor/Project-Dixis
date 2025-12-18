# Production Server Access

## SSH Configuration

**Alias:** `dixis-prod`  
**Host:** `147.93.126.235`  
**User:** `deploy`  
**Key:** `~/.ssh/dixis_prod_ed25519`

## Usage

```bash
# Connect to server
ssh dixis-prod

# Run commands
ssh dixis-prod "whoami && hostname"

# Deploy operations (as deploy user, then sudo)
ssh dixis-prod "cd /var/www/dixis/backend && sudo systemctl status dixis-backend"
```

## Important Notes

- **Never use root user for SSH login** - fail2ban is enabled and will ban after failed attempts
- **Always use the `deploy` user** - escalate with `sudo` when needed
- **SSH config enforces correct key** - uses `IdentitiesOnly yes` to prevent key guessing
- Server has fail2ban active - multiple failed auth attempts will result in IP ban

## SSH Config Entry

Located in `~/.ssh/config`:

```
Host dixis-prod
  HostName 147.93.126.235
  User deploy
  IdentityFile ~/.ssh/dixis_prod_ed25519
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
```

## Production Paths

- **Frontend:** `/var/www/dixis/frontend`
- **Backend:** `/var/www/dixis/backend`
- **Current symlink:** `/var/www/dixis/current` (points to latest release)
- **PM2 processes:** `dixis-frontend`, `dixis-backend`

## Security

- fail2ban monitors SSH login attempts
- PermitRootLogin should be disabled in sshd_config
- Password authentication should be disabled
- Only public key authentication allowed

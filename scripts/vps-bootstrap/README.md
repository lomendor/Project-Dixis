# Dixis VPS Bootstrap Scripts

**Purpose**: Automated setup scripts for clean Ubuntu 24.04 VPS deployment

---

## Quick Start

### Option 1: Master Script (Recommended)

```bash
# After OS reinstall, SSH as root:
ssh root@<VPS_IP>

# Download and run:
cd /tmp
git clone https://github.com/lomendor/Project-Dixis.git
cd Project-Dixis/scripts/vps-bootstrap
bash RUN-ALL.sh
```

The master script will:
1. Run Steps 0-1 as root (OS check, deploy user creation)
2. Prompt you to switch to deploy user
3. Continue Steps 2-8 as deploy (firewall, Node.js, app setup)

### Option 2: Manual Step-by-Step

Run each script individually for more control:

```bash
# Phase 1: As root
ssh root@<VPS_IP>
bash 00-check-os.sh
bash 01-users-ssh.sh

# Switch to deploy user
ssh deploy@<VPS_IP>

# Phase 2: As deploy
sudo bash 02-firewall.sh
bash 03-nodejs-stack.sh
sudo bash 04-nginx.sh
bash 05-clone-repo.sh
bash 06-pm2-service.sh
sudo bash 07-nginx-https.sh
bash 08-final-check.sh
```

---

## Script Overview

| Script | User | Sudo | Description | Duration |
|--------|------|------|-------------|----------|
| `00-check-os.sh` | root | N/A | Check OS version, install basic tools | 2-3 min |
| `01-users-ssh.sh` | root | N/A | Create deploy user, SSH hardening | 3-5 min |
| `02-firewall.sh` | deploy | Yes | Configure UFW firewall, fail2ban | 2-3 min |
| `03-nodejs-stack.sh` | deploy | No | Install Node.js, pnpm, PM2 | 5-10 min |
| `04-nginx.sh` | deploy | Yes | Install Nginx, reverse proxy config | 2-3 min |
| `05-clone-repo.sh` | deploy | No | Clone repo, install deps, build app | 10-15 min |
| `06-pm2-service.sh` | deploy | No | Start app with PM2, health check | 2-3 min |
| `07-nginx-https.sh` | deploy | Yes | Setup HTTPS with LetsEncrypt | 3-5 min |
| `08-final-check.sh` | deploy | No | Final verification, generate report | 1-2 min |

**Total Time**: ~30-60 minutes (including manual inputs)

---

## Manual Inputs Required

### Script 01: SSH Public Key
- **Prompt**: "Paste your SSH public key"
- **Source**: `cat ~/.ssh/id_rsa.pub` (on your Mac)
- **Format**: Starts with `ssh-rsa` or `ssh-ed25519`

### Script 03: PM2 Startup
- **Prompt**: "Run this command to enable PM2 startup"
- **Action**: Copy-paste the provided `sudo env ...` command

### Script 05: Environment Secrets
- **Prompt**: "Fill .env secrets"
- **Required**:
  - `DATABASE_URL` (from Neon dashboard)
  - `VIVA_WALLET_API_KEY` (from Viva Wallet)
  - `VIVA_WALLET_CLIENT_ID`
  - `VIVA_WALLET_CLIENT_SECRET`
- **Action**: Edit `/var/www/dixis/frontend/.env`

### Script 07: Certbot Prompts
- **Prompts**:
  1. Email for renewal notifications
  2. Agree to Terms of Service (Y)
  3. Share email with EFF (optional)
  4. Redirect HTTP to HTTPS (choose 2: Redirect)

---

## Prerequisites

### Before Running Scripts

1. **Fresh OS Install**:
   - Ubuntu 24.04 LTS
   - From Hostinger hPanel → VPS → Change OS → Reinstall

2. **DNS Configuration**:
   ```bash
   # Verify DNS points to VPS:
   dig +short dixis.gr
   # Should return: 147.93.126.235
   ```

3. **Root Access**:
   - SSH password from Hostinger email
   - Ability to create new users

4. **Local SSH Key**:
   ```bash
   # Generate if needed:
   ssh-keygen -t ed25519 -C "your_email@example.com"

   # View public key:
   cat ~/.ssh/id_ed25519.pub
   ```

5. **External Services**:
   - Neon PostgreSQL database created
   - Viva Wallet API credentials ready

---

## What Gets Installed

### System Packages
- `htop`, `git`, `curl`, `wget`, `unzip`, `build-essential`
- `ufw` (firewall), `fail2ban` (intrusion prevention)
- `nginx` (web server), `certbot` (SSL certificates)

### Development Tools
- Node.js 20.x LTS (via nvm)
- pnpm (package manager)
- PM2 (process manager)

### Application
- Dixis marketplace (cloned from GitHub)
- Next.js 15.5.7 (patched for CVE-2025-55182)
- React 19.1.2 (patched)
- Dependencies from package.json

### Services
- `sshd` (SSH server) - hardened
- `ufw` (firewall) - enabled
- `fail2ban` (IPS) - enabled
- `nginx` (web server) - enabled
- `certbot.timer` (SSL renewal) - enabled
- `pm2-deploy.service` (app auto-start) - enabled

---

## Security Features

### SSH Hardening
- Root login: Key-only (no password)
- Deploy user: Key-only authentication
- Password auth: Disabled globally
- Max auth tries: 3
- Login grace time: 60s

### Firewall (UFW)
- Port 22 (SSH): Allow
- Port 80 (HTTP): Allow (redirects to HTTPS)
- Port 443 (HTTPS): Allow
- All other ports: Deny
- Default policy: Deny incoming, Allow outgoing

### Intrusion Prevention (fail2ban)
- SSH jail: Enabled
- Max retries: 3 failed attempts
- Ban time: 2 hours
- Find time: 10 minutes

### SSL/TLS
- Provider: LetsEncrypt (free, auto-renewing)
- Protocol: TLS 1.2, TLS 1.3
- Ciphers: Modern, secure suite
- HSTS: Enabled
- Auto-renewal: Every 60 days (via certbot.timer)

---

## Post-Installation

### Verify Installation

```bash
# Check all services
sudo systemctl status nginx
sudo systemctl status fail2ban
sudo systemctl status certbot.timer
pm2 status

# Test endpoints
curl -I https://dixis.gr/
curl https://dixis.gr/api/healthz

# Check security
sudo ufw status
sudo fail2ban-client status sshd
```

### Monitor Logs

```bash
# Application logs
pm2 logs dixis-frontend

# Nginx logs
sudo tail -f /var/log/nginx/dixis-access.log
sudo tail -f /var/log/nginx/dixis-error.log

# Security logs
sudo tail -f /var/log/auth.log
sudo tail -f /var/log/fail2ban.log
```

### Regular Maintenance

```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Test SSL renewal
sudo certbot renew --dry-run

# Check PM2 status
pm2 list
pm2 monit
```

---

## Troubleshooting

### Script Failed

**Check**:
1. Error message in terminal
2. Log files: `/var/log/auth.log`, `/var/log/syslog`
3. Script-specific logs (if generated)

**Common Issues**:
- Missing sudo password: Re-run with `sudo`
- Network timeout: Check internet connection
- Package conflict: Run `sudo apt update && sudo apt upgrade`
- Permission denied: Check user (should be root or deploy)

### Can't SSH After Step 1

**Problem**: SSH key not added correctly

**Fix**:
1. Console access via Hostinger hPanel
2. Check `/home/deploy/.ssh/authorized_keys`
3. Verify permissions: `chmod 600`, owned by `deploy`
4. Restart SSH: `sudo systemctl restart sshd`

### App Not Starting

**Problem**: PM2 process errored or stopped

**Fix**:
```bash
pm2 logs dixis-frontend --err
# Check error messages

# Common fixes:
pm2 restart dixis-frontend
cd /var/www/dixis/frontend && pnpm build
# Check .env file for missing secrets
```

### HTTPS Not Working

**Problem**: Certificate not obtained or expired

**Fix**:
```bash
sudo certbot certificates
# Check expiry dates

sudo certbot renew
# Force renewal if needed

sudo systemctl restart nginx
```

---

## Support

**Documentation**: `docs/OPS/SERVER-SETUP.md` (comprehensive guide)

**Related Docs**:
- Security patch: `docs/TECH/SECURITY-NEXT-REACT2SHELL.md`
- Incident report: `docs/OPS/INCIDENT-2025-12-DDOS-and-ChunkError.md`

**Emergency Recovery**: If all else fails, reinstall OS and re-run bootstrap scripts

---

## Notes

- Scripts are **idempotent**: Safe to re-run if something fails
- **STOP-on-failure**: Scripts exit on error for manual intervention
- **No secrets in scripts**: All secrets filled manually or via prompts
- **Backed by git**: All code changes committed to GitHub

---

**Last Updated**: 2025-12-10
**Version**: 1.0
**Tested On**: Ubuntu 24.04 LTS (Hostinger VPS)

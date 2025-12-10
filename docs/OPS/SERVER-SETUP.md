# Dixis VPS Server Setup Guide

**Last Updated**: 2025-12-10
**Status**: Production
**Environment**: Ubuntu 24.04 LTS

---

## Overview

This document describes the complete server setup for the Dixis marketplace production environment. The setup is designed for:
- **Security First**: Hardened SSH, firewall, fail2ban, patched dependencies
- **Zero Downtime**: PM2 process management with auto-restart
- **HTTPS Only**: LetsEncrypt SSL certificates with auto-renewal
- **Monitoring Ready**: Health checks, logging, metrics

---

## Server Specifications

### Infrastructure
- **Provider**: Hostinger VPS
- **IP Address**: 147.93.126.235
- **Domain**: dixis.gr (+ www.dixis.gr)
- **OS**: Ubuntu 24.04 LTS (fresh install)
- **Timezone**: Europe/Athens

### Software Stack
- **Runtime**: Node.js 20.x LTS (via nvm)
- **Package Manager**: pnpm (latest)
- **Process Manager**: PM2 (with systemd integration)
- **Web Server**: Nginx (reverse proxy)
- **SSL**: LetsEncrypt (certbot)
- **Firewall**: UFW (Uncomplicated Firewall)
- **Intrusion Prevention**: fail2ban

### Application
- **Framework**: Next.js 15.5.7 (patched for CVE-2025-55182)
- **React**: 19.1.2 (patched for CVE-2025-55182)
- **Database**: PostgreSQL (Neon - external)
- **Payments**: Viva Wallet
- **Error Tracking**: Sentry (optional)

---

## Bootstrap Process

### Prerequisites
1. **Fresh OS Install**: Ubuntu 24.04 LTS from Hostinger hPanel
2. **DNS Configuration**: A records for dixis.gr and www.dixis.gr pointing to 147.93.126.235
3. **SSH Access**: Root password from Hostinger email
4. **Local SSH Key**: Generated on your Mac (`~/.ssh/id_rsa.pub` or `~/.ssh/id_ed25519.pub`)

### Quick Start

```bash
# 1. SSH to VPS as root (first time only)
ssh root@147.93.126.235
# Enter password from Hostinger email

# 2. Download bootstrap scripts
cd /tmp
git clone https://github.com/lomendor/Project-Dixis.git
cd Project-Dixis/scripts/vps-bootstrap

# 3. Run master script (interactive)
bash RUN-ALL.sh
```

### Manual Step-by-Step

If you prefer manual control, run scripts individually:

#### **Phase 1: Root User Setup** (Steps 0-1)

```bash
# As root user:
ssh root@147.93.126.235

cd /tmp/Project-Dixis/scripts/vps-bootstrap

# Step 0: Check OS & Install Tools
bash 00-check-os.sh

# Step 1: Create deploy user & SSH hardening
# ⚠️ IMPORTANT: Have your SSH public key ready
bash 01-users-ssh.sh
# When prompted, paste your SSH public key from:
#   cat ~/.ssh/id_rsa.pub
```

**CRITICAL**: After Step 1, test SSH access in a NEW terminal:
```bash
ssh deploy@147.93.126.235
# Should connect without password (using SSH key)
```

If successful, close root session and continue as deploy user.

#### **Phase 2: Deploy User Setup** (Steps 2-8)

```bash
# As deploy user:
ssh deploy@147.93.126.235

cd /var/www/dixis/scripts/vps-bootstrap

# Step 2: Firewall & fail2ban
sudo bash 02-firewall.sh

# Step 3: Node.js, pnpm, PM2
bash 03-nodejs-stack.sh
# Follow prompts for PM2 startup script

# Step 4: Nginx reverse proxy
sudo bash 04-nginx.sh

# Step 5: Clone repo & install dependencies
bash 05-clone-repo.sh
# ⚠️ IMPORTANT: Fill .env secrets when prompted
#   - DATABASE_URL from Neon dashboard
#   - VIVA_WALLET_* from Viva Wallet dashboard

# Step 6: Start app with PM2
bash 06-pm2-service.sh

# Step 7: Setup HTTPS with LetsEncrypt
sudo bash 07-nginx-https.sh
# Follow certbot prompts:
#   - Email for renewal notifications
#   - Agree to Terms of Service
#   - Choose option 2: Redirect HTTP to HTTPS

# Step 8: Final verification
bash 08-final-check.sh
# Generates comprehensive system report
```

---

## Server Architecture

### Directory Structure

```
/var/www/dixis/              # Application root (owner: deploy)
├── frontend/                # Next.js app
│   ├── .next/              # Built app (generated)
│   ├── src/                # Source code
│   ├── .env                # Environment secrets (NOT in git)
│   ├── ecosystem.config.js # PM2 configuration
│   └── package.json        # Dependencies
├── backend/                 # Laravel API (future)
├── scripts/                 # Utility scripts
└── docs/                    # Documentation

/etc/nginx/
├── sites-available/dixis.gr  # Nginx config
└── sites-enabled/dixis.gr    # Symlink

/etc/letsencrypt/live/dixis.gr/
├── fullchain.pem            # SSL certificate
└── privkey.pem              # Private key

/home/deploy/
├── .ssh/authorized_keys     # SSH public key
├── .nvm/                    # Node Version Manager
└── .pm2/                    # PM2 data & logs
```

### Network Flow

```
Internet
    ↓
UFW Firewall (ports 22, 80, 443)
    ↓
Nginx (Port 80/443)
    ↓ (reverse proxy)
PM2 → Next.js App (Port 3000)
    ↓
External Services:
    - Neon PostgreSQL (database)
    - Viva Wallet (payments)
    - Sentry (error tracking)
```

### Process Management

```bash
# PM2 manages Next.js app
pm2 list                     # Show all processes
pm2 logs dixis-frontend      # View logs
pm2 restart dixis-frontend   # Restart app
pm2 monit                    # Real-time monitoring
pm2 save                     # Save process list
pm2 startup                  # Enable systemd auto-start

# Nginx manages web server
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t                # Test config

# certbot manages SSL
sudo certbot renew --dry-run # Test renewal
sudo systemctl status certbot.timer
```

---

## Security Configuration

### SSH Hardening

**File**: `/etc/ssh/sshd_config`

```bash
# Root login disabled via password (key-only)
PermitRootLogin prohibit-password

# Password authentication disabled (key-only)
PasswordAuthentication no
PubkeyAuthentication yes

# Only deploy user can SSH
AllowUsers deploy

# Security limits
MaxAuthTries 3
LoginGraceTime 60
```

**Test**: `ssh deploy@147.93.126.235` should work without password

### Firewall Rules

**File**: `/etc/ufw/user.rules`

```bash
# Check status
sudo ufw status numbered

# Rules:
# [1] 22/tcp (SSH)        ALLOW IN
# [2] 80/tcp (HTTP)       ALLOW IN
# [3] 443/tcp (HTTPS)     ALLOW IN
# Default: DENY incoming, ALLOW outgoing
```

**Test**: `sudo ufw status` should show 3 rules

### fail2ban Configuration

**File**: `/etc/fail2ban/jail.local`

```ini
[sshd]
enabled = true
port = ssh
maxretry = 3       # Ban after 3 failed attempts
bantime = 7200     # Ban for 2 hours
findtime = 600     # Within 10 minutes
```

**Test**: `sudo fail2ban-client status sshd`

### CVE-2025-55182 Protection

**Critical Security Patch Applied** (Dec 10, 2025):
- **Next.js**: 15.5.0 → 15.5.7 (patched)
- **React**: 19.1.0 → 19.1.2 (patched)
- **React-DOM**: 19.1.0 → 19.1.2 (patched)

**Verification**:
```bash
cd /var/www/dixis/frontend
npm list react react-dom next
# Should show patched versions
```

**Reference**: `docs/TECH/SECURITY-NEXT-REACT2SHELL.md`

---

## Environment Configuration

### Frontend .env

**File**: `/var/www/dixis/frontend/.env` (NOT in git)

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://dixis.gr/api/v1
NEXT_PUBLIC_APP_URL=https://dixis.gr
NEXT_PUBLIC_SITE_URL=https://dixis.gr

# Environment
DIXIS_ENV=production
NODE_ENV=production
PORT=3000

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Payment Provider (Viva Wallet)
NEXT_PUBLIC_PAYMENT_PROVIDER=viva
VIVA_WALLET_API_KEY=<secret>
VIVA_WALLET_CLIENT_ID=<secret>
VIVA_WALLET_CLIENT_SECRET=<secret>

# Error Tracking (Sentry - optional)
# NEXT_PUBLIC_SENTRY_DSN=<secret>

# AWS S3 (File Uploads - optional)
# AWS_ACCESS_KEY_ID=<secret>
# AWS_SECRET_ACCESS_KEY=<secret>
# AWS_REGION=eu-west-1
# AWS_S3_BUCKET=dixis-uploads
```

**Security**: Permissions should be `600` (owner read/write only)

---

## Monitoring & Maintenance

### Health Checks

**Endpoints**:
```bash
# App health
curl https://dixis.gr/api/healthz
# Expected: HTTP 200 {"status":"ok"}

# Nginx health
curl -I https://dixis.gr/
# Expected: HTTP 200

# SSL certificate
echo | openssl s_client -connect dixis.gr:443 2>/dev/null | openssl x509 -noout -dates
# Expected: Valid dates (not expired)
```

### Log Files

```bash
# PM2 Logs
tail -f ~/.pm2/logs/dixis-frontend-out.log   # App output
tail -f ~/.pm2/logs/dixis-frontend-error.log # App errors

# Nginx Logs
sudo tail -f /var/log/nginx/dixis-access.log # HTTP requests
sudo tail -f /var/log/nginx/dixis-error.log  # Nginx errors

# System Logs
sudo tail -f /var/log/auth.log               # SSH attempts
sudo tail -f /var/log/fail2ban.log           # Blocked IPs
sudo journalctl -u nginx -f                  # Nginx systemd logs
```

### Performance Monitoring

```bash
# CPU & Memory
htop

# PM2 Dashboard
pm2 monit

# Nginx Status
sudo systemctl status nginx

# Disk Usage
df -h

# Network Connections
sudo ss -tlnp
```

### Regular Maintenance

**Daily**:
- Check PM2 status: `pm2 list`
- Review error logs: `pm2 logs dixis-frontend --err --lines 50`

**Weekly**:
- Check fail2ban bans: `sudo fail2ban-client status sshd`
- Review disk usage: `df -h`
- Update packages: `sudo apt update && sudo apt list --upgradable`

**Monthly**:
- Apply security updates: `sudo apt upgrade`
- Test SSL renewal: `sudo certbot renew --dry-run`
- Review logs for anomalies

---

## Deployment Workflow

### Code Updates

```bash
# 1. SSH to VPS
ssh deploy@147.93.126.235

# 2. Navigate to app directory
cd /var/www/dixis/frontend

# 3. Pull latest code
git fetch origin
git checkout main
git pull origin main

# 4. Install dependencies (if package.json changed)
pnpm install

# 5. Run Prisma migrations (if schema changed)
pnpm prisma generate
# pnpm prisma migrate deploy  # If needed

# 6. Build application
pnpm build

# 7. Restart PM2
pm2 restart dixis-frontend

# 8. Verify deployment
pm2 logs dixis-frontend --lines 50
curl -I https://dixis.gr/
```

### Rollback Procedure

```bash
# 1. Check git history
git log --oneline -10

# 2. Rollback to previous commit
git checkout <commit-hash>

# 3. Rebuild & restart
pnpm install
pnpm build
pm2 restart dixis-frontend

# 4. Verify
curl -I https://dixis.gr/
```

---

## Troubleshooting

### App Won't Start

**Symptoms**: `pm2 list` shows status "errored" or "stopped"

**Diagnosis**:
```bash
pm2 logs dixis-frontend --err --lines 100
# Look for error messages

pm2 describe dixis-frontend
# Check exit code and error details
```

**Common Fixes**:
1. **Missing .env secrets**: Edit `.env`, fill required values
2. **Build failed**: Run `pnpm build` manually, check errors
3. **Port conflict**: Check if port 3000 in use: `lsof -i :3000`
4. **Out of memory**: Increase PM2 `max_memory_restart` in `ecosystem.config.js`

### HTTPS Not Working

**Symptoms**: `curl https://dixis.gr/` times out or returns SSL error

**Diagnosis**:
```bash
# Check Nginx config
sudo nginx -t

# Check SSL certificate
sudo certbot certificates

# Check firewall
sudo ufw status

# Check Nginx is listening on 443
sudo ss -tlnp | grep :443
```

**Common Fixes**:
1. **Certificate expired**: Run `sudo certbot renew`
2. **Nginx config error**: Check `/etc/nginx/sites-available/dixis.gr`
3. **Firewall blocking 443**: `sudo ufw allow 443/tcp`
4. **DNS not resolving**: Check with `dig dixis.gr`

### High CPU Usage / Crypto Miner Detection

**Symptoms**: `htop` shows 100% CPU, unfamiliar processes

**Diagnosis**:
```bash
# Check running processes
ps aux | grep -vE 'USER|root' | sort -rk3 | head -10

# Check for known miners
ps aux | grep -E 'xmrig|miner|bot\.'

# Check suspicious files in /tmp
ls -la /tmp/ | grep -E 'bot\.|\.sh$'

# Check fail2ban logs
sudo tail -100 /var/log/fail2ban.log
```

**Emergency Response**:
```bash
# 1. Kill suspicious processes
sudo pkill -9 xmrig
sudo pkill -9 -f "bot\."

# 2. Remove malicious files
sudo rm -f /tmp/bot.*
sudo rm -f /tmp/*.sh

# 3. Check crontabs
sudo crontab -l
crontab -l -u deploy

# 4. Review systemd services
sudo systemctl list-units --type=service | grep -v '@\|loaded\|running'

# 5. Review Next.js/React versions (CVE-2025-55182)
cd /var/www/dixis/frontend
npm list react react-dom next
# Should be: next@15.5.7, react@19.1.2, react-dom@19.1.2
```

**If compromised**:
1. Follow `docs/TECH/SECURITY-NEXT-REACT2SHELL.md` for patching
2. Consider OS reinstall if backdoors persist
3. Review `docs/OPS/INCIDENT-2025-12-DDOS-and-ChunkError.md`

---

## Backup & Recovery

### What to Backup

**Code** (already backed up):
- Git repository: `lomendor/Project-Dixis` on GitHub
- All code changes committed to git

**Configuration**:
```bash
# Backup these files manually:
/etc/nginx/sites-available/dixis.gr
/var/www/dixis/frontend/.env
/var/www/dixis/frontend/ecosystem.config.js
/etc/ssh/sshd_config
/etc/fail2ban/jail.local
```

**Database**:
- Neon PostgreSQL: Automated backups (provider-managed)
- Manual backup: Use Neon dashboard export feature

**SSL Certificates**:
- LetsEncrypt: Stored in `/etc/letsencrypt/`
- Auto-renewed by certbot (no manual backup needed)

### Disaster Recovery

**Scenario**: Complete VPS failure, need to rebuild from scratch

**Steps**:
1. **Provision new VPS**: Ubuntu 24.04 LTS
2. **Update DNS**: Point dixis.gr A record to new IP
3. **Run bootstrap scripts**: `scripts/vps-bootstrap/RUN-ALL.sh`
4. **Restore configuration**: Copy backed up files (.env, nginx config)
5. **Deploy code**: Clone from GitHub (will have patched versions)
6. **Verify**: Run health checks

**RTO (Recovery Time Objective)**: ~1-2 hours
**RPO (Recovery Point Objective)**: Latest git commit + daily DB backup

---

## Performance Optimization

### Nginx Caching

Nginx config already includes:
```nginx
# Static assets caching
location /_next/static/ {
    proxy_cache_valid 200 60m;
    add_header Cache-Control "public, immutable";
}
```

### PM2 Clustering (Future)

For higher traffic, enable cluster mode:
```javascript
// ecosystem.config.js
{
  instances: 'max',      // Use all CPU cores
  exec_mode: 'cluster',  // Enable clustering
}
```

### Database Query Optimization

Monitor slow queries:
```bash
# Check Neon dashboard for query performance
# Enable pg_stat_statements if needed
```

---

## Related Documentation

- `docs/TECH/SECURITY-NEXT-REACT2SHELL.md` - CVE-2025-55182 security patch
- `docs/OPS/INCIDENT-2025-12-DDOS-and-ChunkError.md` - Dec 6-10 incident report
- `docs/OPS/BACKLOG-AUTH.md` - Authentication system improvements
- `docs/PRODUCT/AUTH-PRD.md` - Auth system specification

---

## Contact & Support

**Maintainer**: Panagiotis Kourkoutis
**Repository**: https://github.com/lomendor/Project-Dixis
**VPS Provider**: Hostinger (support via hPanel)

**Emergency Contacts**:
- DNS: Hostinger DNS management
- SSL: LetsEncrypt (auto-renewal, check certbot logs)
- Database: Neon support (for DB issues)

---

**Document Version**: 1.0
**Last Verified**: 2025-12-10
**Bootstrap Scripts**: `scripts/vps-bootstrap/*.sh`

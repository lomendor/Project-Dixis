# Ownership Prevention Guide - Dixis VPS

## Root Cause Analysis (2026-01-28)

**Problem**: Deploy workflow failed with "Permission denied" when `git reset --hard` tried to overwrite files.

**Root Cause**: Manual SSH session as `root` (from IP 94.66.136.90) ran `git reset --hard origin/main` at 10:52:53, creating 352 directories and 677 files owned by `root:root` instead of `deploy:deploy`.

**Evidence**:
```
Jan 28 10:52:45 sshd: Accepted publickey for root from 94.66.136.90
Jan 28 10:52:53 git reflog: reset: moving to origin/main
```

GitHub Actions deploy runs as `deploy` user (verified in auth.log at 10:27-10:28 from 20.169.75.149).

---

## Prevention Measures

### 1. Health Check Script (Deployed)
Location: `/var/www/dixis/check-ownership.sh`

```bash
# Check for issues
/var/www/dixis/check-ownership.sh

# Auto-fix issues (requires root)
/var/www/dixis/check-ownership.sh --fix
```

### 2. Manual SSH Best Practices

**ALWAYS use `deploy` user for git operations:**
```bash
# Correct way
ssh deploy@dixis-prod
cd /var/www/dixis/current
git fetch origin main
git reset --hard origin/main

# Or if you MUST use root, switch to deploy:
ssh root@dixis-prod
sudo -u deploy bash
cd /var/www/dixis/current
git reset --hard origin/main
```

**NEVER do this as root:**
```bash
# WRONG - creates root-owned files
ssh root@dixis-prod
cd /var/www/dixis/current
git reset --hard origin/main  # ❌ Files will be root:root
```

### 3. Recommended Workflow Change (Manual)

Add ownership check to deploy workflow (`.github/workflows/deploy-backend.yml`):

```yaml
# After "=== PREFLIGHT CHECKS ===" section, add:

# 5. Check for ownership issues (prevent deploy failures)
if [ -x /var/www/dixis/check-ownership.sh ]; then
  echo "=== OWNERSHIP CHECK ==="
  if ! /var/www/dixis/check-ownership.sh; then
    echo "⚠️ Ownership issues detected, attempting auto-fix..."
    sudo /var/www/dixis/check-ownership.sh --fix
  fi
fi
```

### 4. SSH Config Alias (Optional)

Add to your `~/.ssh/config`:
```
# Always use deploy user for dixis operations
Host dixis
  HostName 147.93.126.235
  User deploy
  IdentityFile ~/.ssh/dixis_key
```

Then use: `ssh dixis` instead of `ssh root@dixis-prod`

---

## Quick Reference

| Action | Correct | Wrong |
|--------|---------|-------|
| Manual git pull | `ssh deploy@...` | `ssh root@...` |
| Emergency fix | `sudo -u deploy git reset` | `git reset` as root |
| Check ownership | `/var/www/dixis/check-ownership.sh` | - |
| Fix ownership | `check-ownership.sh --fix` | `chown -R` on whole repo |

---

## Log Location
`/var/log/dixis-ownership-check.log`

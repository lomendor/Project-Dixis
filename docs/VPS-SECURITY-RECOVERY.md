# 🔒 Dixis VPS Security Recovery Guide

## 🚨 Current Situation

Your VPS was auto-stopped by Hostinger due to **CVE-2025-55182 (React2Shell)** exploitation. This is the **2nd/3rd infection** in recent days.

### What Happened
- **Attackers**: Scanning internet for vulnerable Next.js apps
- **Exploit**: CVE-2025-55182 allows unauthenticated RCE
- **Payload**: Cryptominers installed automatically
- **Impact**: 100% CPU, PM2 crashes, site downtime

---

## ✅ ONE-TIME FIX (Never Reinstall Again)

### **Step 1: Start VPS (via Hostinger Panel)** (2 min)

1. Login to Hostinger → VPS Dashboard
2. Click "Start VPS"
3. **DO NOT** deploy anything yet!

---

### **Step 2: Run Secure Deployment Script** (15 min)

From your LOCAL machine (MacBook), run:

```bash
cd ~/Dixis\ Project\ 2/Project-Dixis
bash scripts/vps-secure-deploy.sh
```

**What This Does:**
- ✅ Kills any existing malware
- ✅ Patches CVE-2025-55182 (upgrades Next.js)
- ✅ Disables test endpoints
- ✅ Fixes CORS vulnerabilities
- ✅ Installs runtime protection
- ✅ Deploys secure application

**Expected Output:**
```
🔒 Dixis Secure Deployment - CVE-2025-55182 Protected
==================================================
📋 Step 1: Pre-deployment Security Audit
...
✅ SECURE DEPLOYMENT COMPLETE!
   CVE-2025-55182: PATCHED ✅
   Runtime Protection: ACTIVE ✅
```

---

### **Step 3: Verify Security** (2 min)

Check that site is live AND secure:

```bash
# Test site loads
curl -I https://dixis.gr

# Test products API
curl https://dixis.gr/api/products | head -50

# Check for malware
ssh dixis-prod "ps aux | grep -E '(xmrig|miner)' | grep -v grep"
# Should return: empty (no malware)
```

---

## 🛡️ Long-Term Protection

The deployment script installed **runtime monitoring** that:
- Detects cryptominers every 60 seconds
- Auto-kills malicious processes
- Logs alerts to `/var/log/dixis/security.log`
- Auto-restarts app if compromised

### Check Monitoring Status

```bash
ssh dixis-prod "ps aux | grep detect-exploit"
# Should show: detect-exploit.sh running
```

### View Security Logs

```bash
ssh dixis-prod "tail -50 /var/log/dixis/security.log"
```

---

## 🚀 Future Deployments (Safe)

**Every time you deploy changes**, use the secure script:

```bash
cd ~/Dixis\ Project\ 2/Project-Dixis

# Make your code changes
git add .
git commit -m "Feature: ..."
git push

# Deploy securely
bash scripts/vps-secure-deploy.sh
```

**NO MORE:**
- ❌ Manual `ssh` → `git pull` → `pnpm build`
- ❌ Fresh OS reinstalls
- ❌ Malware infections

**ALWAYS:**
- ✅ Use `vps-secure-deploy.sh`
- ✅ Patches applied before app goes live
- ✅ Runtime protection active

---

## 🔥 Emergency: If Malware Returns

If you see high CPU or suspicious processes:

```bash
# Kill malware immediately
ssh dixis-prod "pkill -9 -f 'xmrig|miner'"

# Re-run secure deployment
bash scripts/vps-secure-deploy.sh
```

**DO NOT** reinstall OS. The script will clean and re-secure.

---

## 📊 What Changed vs Before

| Before (Vulnerable) | After (Secured) |
|-------------------|-----------------|
| Next.js 15.0.x | Next.js 15.5.0 (patched) |
| `ALLOW_TEST_LOGIN=true` | `ALLOW_TEST_LOGIN=false` |
| `CORS_ALLOWED_ORIGINS=*` | `CORS_ALLOWED_ORIGINS=dixis.gr` |
| No monitoring | Runtime malware detection |
| Manual deployment | Automated secure deployment |
| Malware every 2-3 days | Protected ✅ |

---

## ❓ FAQ

**Q: Will this slow down deployments?**
A: Script runs in ~15 minutes total. Worth it to avoid reinstalls.

**Q: What if I need to update Next.js?**
A: Update `package.json`, commit, run `vps-secure-deploy.sh`. It handles upgrades.

**Q: Can I still SSH manually?**
A: Yes, but always finish with secure deployment script.

**Q: What about the ProductCard fix from PR #1530?**
A: Already merged to main. Secure deployment will include it automatically.

---

## 🎯 Summary

**BEFORE**: Malware → Reinstall → Deploy → Malware → Reinstall...
**AFTER**: Secure Deploy → Protected ✅ → Work on features 🎉

**Next Steps:**
1. Start VPS (Hostinger panel)
2. Run `bash scripts/vps-secure-deploy.sh` (local)
3. Verify site works
4. **NEVER manually deploy again** - always use the script

---

**Generated**: 2025-12-12
**CVE**: CVE-2025-55182 (React2Shell)
**Protection**: Active Runtime Monitoring

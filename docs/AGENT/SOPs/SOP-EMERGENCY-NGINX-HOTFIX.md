# SOP: Emergency Nginx Hotfix (CI Down / P0 Production)

## When to use
Use this when:
- Production has a P0 user-facing break (e.g., missing static assets causing 404s / smoke failures), AND
- CI/CD is blocked by external infrastructure (e.g., GitHub Actions outage), AND
- Branch protections prevent bypass (e.g., `enforce_admins=true` + required checks queued).

## Safety constraints
- Only serve **static, public, non-sensitive** assets.
- Prefer exact-match nginx locations (`location = /path`) to avoid broad routing changes.
- Always keep a **revert plan** and **proof** (curl 200).
- Document the hotfix in `docs/OPS/STATE.md` with DEBT/REVERT PLAN section.

---

## Procedure (copy/paste)

### A) Upload assets to VPS
```bash
# Target directory
ssh dixis-prod "mkdir -p /var/www/dixis-static"

# Upload files
scp /path/to/local/file.jpg dixis-prod:/var/www/dixis-static/

# Verify
ssh dixis-prod "ls -la /var/www/dixis-static/"
```

### B) Add nginx exact-match locations
Config file: `/etc/nginx/sites-enabled/dixis.gr`

Insert **before** catch-all `location / { ... }` block.

```nginx
# === EMERGENCY HOTFIX: <ticket/pass> ===
# Can be removed after PR #XXXX is deployed via normal CI/CD
location = /og-products.jpg {
    root /var/www/dixis-static;
    try_files /og-products.jpg =404;
    add_header Cache-Control "public, max-age=300";
    access_log off;
}

location = /twitter-products.jpg {
    root /var/www/dixis-static;
    try_files /twitter-products.jpg =404;
    add_header Cache-Control "public, max-age=300";
    access_log off;
}
```

### C) Validate & reload
```bash
ssh dixis-prod "nginx -t && systemctl reload nginx"
```

### D) Verify
From VPS (localhost):
```bash
ssh dixis-prod 'curl -k -s -o /dev/null -w "%{http_code}\n" -H "Host: dixis.gr" https://127.0.0.1/og-products.jpg'
```

From internet:
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://dixis.gr/og-products.jpg
```

**Expected:** `200`

---

## Revert / Cleanup (DEBT)

### Pre-cleanup check
Before running cleanup, verify the PR has been deployed:
```bash
# Check PR status
gh pr view 2594 --json state,mergedAt

# Check if app is serving the assets (not nginx hotfix)
# Look for different headers (e.g., x-nextjs-cache instead of our Cache-Control)
curl -sI https://dixis.gr/og-products.jpg | grep -iE 'server:|cache-control:|x-nextjs'
```

### Automated Cleanup Script (copy-paste)
```bash
#!/bin/bash
# Run this AFTER PR is merged and deployed
set -euo pipefail

HOST="dixis-prod"
CONF="/etc/nginx/sites-enabled/dixis.gr"
STATIC_DIR="/var/www/dixis-static"
URLS=("https://dixis.gr/og-products.jpg" "https://dixis.gr/twitter-products.jpg")

echo "== 0) Proof BEFORE cleanup (must be 200) =="
for u in "${URLS[@]}"; do
  echo -n "$u -> "
  curl -s -o /dev/null -w "%{http_code}\n" "$u"
done

echo "== 1) Backup nginx config =="
ssh "$HOST" "sudo cp $CONF ${CONF}.bak.cleanup-\$(date +%Y%m%d-%H%M%S)"

echo "== 2) Remove EMERGENCY HOTFIX blocks manually =="
echo "Opening editor - delete the blocks marked 'EMERGENCY HOTFIX'"
ssh -t "$HOST" "sudo nano $CONF"

echo "== 3) Validate + reload nginx =="
ssh "$HOST" "sudo nginx -t && sudo systemctl reload nginx"

echo "== 4) Cleanup static dir =="
ssh "$HOST" "sudo rm -f $STATIC_DIR/* && ls -la $STATIC_DIR"

echo "== 5) Proof AFTER cleanup (must stay 200) =="
for u in "${URLS[@]}"; do
  echo -n "$u -> "
  curl -s -o /dev/null -w "%{http_code}\n" "$u"
done

echo "DONE - Hotfix removed, assets now served by app"
```

### Manual Steps (alternative)
```bash
# 1. SSH to VPS
ssh dixis-prod

# 2. Edit nginx config - remove EMERGENCY HOTFIX blocks
sudo nano /etc/nginx/sites-enabled/dixis.gr
# (Delete the location blocks marked with "EMERGENCY HOTFIX")

# 3. Validate and reload
sudo nginx -t && sudo systemctl reload nginx

# 4. Clean up static dir
sudo rm -rf /var/www/dixis-static/*

# 5. Verify assets still work (now served by app)
curl -sI https://dixis.gr/og-products.jpg | head -5
```

---

## Incident reference: 2026-02-02 (Pass P0-PROD-OG-ASSETS-01)

| Item | Detail |
|------|--------|
| CI Blocker | GitHub Actions `major_outage`, required checks queued |
| Branch Protection | `enforce_admins=true` prevented admin bypass |
| Assets Hotfixed | `/og-products.jpg`, `/twitter-products.jpg` |
| VPS Location | `/var/www/dixis-static/` |
| Nginx Config | `/etc/nginx/sites-enabled/dixis.gr` |
| Proof | Both URLs returned `200 OK` with `Cache-Control: public, max-age=300` |
| PR | #2594 (pending CI, auto-merge enabled) |

---

## Checklist for next incident

- [ ] Confirm CI is actually blocked (check https://www.githubstatus.com/api/v2/summary.json)
- [ ] Confirm branch protection prevents bypass (`gh api repos/OWNER/REPO/branches/main/protection`)
- [ ] Upload static assets to `/var/www/dixis-static/`
- [ ] Add nginx location blocks with `EMERGENCY HOTFIX` comment
- [ ] Validate nginx config (`nginx -t`)
- [ ] Reload nginx
- [ ] Verify `curl` returns 200 from internet
- [ ] Document in `docs/OPS/STATE.md` with DEBT/REVERT PLAN
- [ ] Enable auto-merge on PR
- [ ] After PR deploys: cleanup hotfix (revert nginx, delete static files)

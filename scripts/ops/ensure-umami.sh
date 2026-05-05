#!/bin/bash
# ensure-umami.sh — self-heal Umami if PM2 has lost it.
#
# WHY THIS EXISTS:
#   The frontend deploy workflow (.github/workflows/deploy-frontend.yml) runs
#   `pm2 delete all` followed by `pm2 kill` as part of an "AGGRESSIVE CLEANUP"
#   step. That wipes the entire PM2 daemon, including the Umami analytics
#   process on port 3001. The deploy then starts only `dixis-frontend` and
#   calls `pm2 save`, which removes Umami from the on-disk PM2 dump file too.
#   Result: every frontend deploy takes Umami down until manually restarted.
#
#   Per the Dixis project rules (CLAUDE.md line 60), this workflow file
#   cannot be modified. So instead, we run this script on a 2-minute cron
#   under the `deploy` user. It checks whether Umami is online in PM2, and
#   if not, starts it from its ecosystem config and persists the state.
#
# DEPLOYED LOCATION: /var/www/dixis/scripts/ensure-umami.sh
# CRONTAB ENTRY:
#   */2 * * * * /var/www/dixis/scripts/ensure-umami.sh >> /tmp/ensure-umami.log 2>&1
#
# Idempotent: safe to run any number of times. Does nothing when Umami is healthy.

set -euo pipefail

UMAMI_DIR="/var/www/dixis/umami"
ECOSYSTEM="${UMAMI_DIR}/ecosystem.config.cjs"
LOG_PREFIX="[$(date -Iseconds)] ensure-umami:"

# Quick check: is umami listed as online in PM2?
if /usr/bin/pm2 list 2>/dev/null | grep -E '\bumami\b' | grep -q 'online'; then
    # Healthy — nothing to do. Stay quiet to keep the log file small.
    exit 0
fi

echo "${LOG_PREFIX} Umami not online in PM2 — restarting"

if [ ! -f "${ECOSYSTEM}" ]; then
    echo "${LOG_PREFIX} ERROR: ${ECOSYSTEM} missing, cannot recover"
    exit 1
fi

cd "${UMAMI_DIR}"

# `pm2 start` is idempotent on the app name: if it exists in any state it
# restarts; if it doesn't, it creates it from the ecosystem file.
if /usr/bin/pm2 start "${ECOSYSTEM}" 2>&1; then
    /usr/bin/pm2 save 2>&1 || true
    echo "${LOG_PREFIX} Umami restarted and PM2 dump saved"
else
    echo "${LOG_PREFIX} ERROR: pm2 start failed (exit $?)"
    exit 1
fi

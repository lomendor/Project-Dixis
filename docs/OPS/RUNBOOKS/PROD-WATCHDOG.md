# PROD Watchdog & PM2 Hardening (AG116.4)

## Τι υπάρχει σε VPS
- Script: `/opt/dixis/watchdog.sh` (τρέχει κάθε 1′ από `/etc/cron.d/dixis-watchdog`)
- Health URL: `http://127.0.0.1:3000/api/healthz`
- Log: `/var/log/dixis-watchdog.log` (logrotate weekly x8)
- PM2: `dixis-frontend` (pm2 save + systemd startup)

## Συνήθεις εντολές
- Tail log: `sudo tail -f /var/log/dixis-watchdog.log`
- Χειροκίνητη εκτέλεση: `sudo PM2_HOME=/home/dixis/.pm2 PM2_NAME=dixis-frontend HEALTH_URL=http://127.0.0.1:3000/api/healthz /opt/dixis/watchdog.sh`
- PM2 status: `pm2 status` / `pm2 logs dixis-frontend`

## Τι προστατεύει
- Restart αν healthz αποτύχει
- Kill ορφανών next-server (εκτός PM2) χωρίς να πειράζει PM2-managed pids

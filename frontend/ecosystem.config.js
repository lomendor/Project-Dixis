/**
 * PM2 ecosystem config for Dixis frontend (Next.js standalone)
 *
 * Used by: scripts/prod-deploy-clean.sh (line ~229)
 * Runs on: VPS at /var/www/dixis/current/frontend/
 *
 * Env vars: PORT, HOSTNAME, NODE_ENV are set here.
 * All other vars (DATABASE_URL, STRIPE keys, etc.) are loaded
 * by Next.js from the .env symlink → /var/www/dixis/shared/frontend.env
 */
module.exports = {
  apps: [{
    name: 'dixis-frontend',
    script: '.next/standalone/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '127.0.0.1', // Critical: prevents Next.js 15 IPv6 bind
    },
    max_memory_restart: '350M',
    restart_delay: 5000,
    min_uptime: 10000,
    max_restarts: 10,
    instances: 1,
    exec_mode: 'fork',
  }],
};

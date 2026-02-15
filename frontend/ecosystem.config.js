/**
 * PM2 ecosystem config for Dixis frontend (Next.js standalone)
 *
 * Used by: scripts/prod-deploy-clean.sh (line ~229)
 * Runs on: VPS at /var/www/dixis/current/frontend/
 *
 * Env loading strategy:
 * - PORT, HOSTNAME, NODE_ENV are always set here.
 * - Server-side env vars (DATABASE_URL, STRIPE keys, etc.) are loaded
 *   from /var/www/dixis/shared/frontend.env at startup.
 *   Next.js standalone mode does NOT reliably load .env files,
 *   so we parse them here and inject via PM2 env.
 */
const fs = require('fs');
const path = require('path');

// Load env vars from shared env file (production VPS)
function loadEnvFile(filePath) {
  const vars = {};
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.substring(0, eqIndex).trim();
      const value = trimmed.substring(eqIndex + 1).trim();
      vars[key] = value;
    }
  } catch {
    // File not found — local dev, CI, etc. Just skip.
  }
  return vars;
}

const sharedEnv = loadEnvFile('/var/www/dixis/shared/frontend.env');

module.exports = {
  apps: [{
    name: 'dixis-frontend',
    script: '.next/standalone/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '127.0.0.1', // Critical: prevents Next.js 15 IPv6 bind
      ...sharedEnv,
    },
    max_memory_restart: '350M',
    restart_delay: 5000,
    min_uptime: 10000,
    max_restarts: 10,
    instances: 1,
    exec_mode: 'fork',
  }],
};

#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
APP="$ROOT"; [ -d "$ROOT/frontend" ] && APP="$ROOT/frontend"
pushd "$APP" >/dev/null
PM="npm"; [ -f pnpm-lock.yaml ] && PM="pnpm"; [ -f yarn.lock ] && PM="yarn"
case "$PM" in
  npm) npm run build; (npm run start & echo $! > /tmp/dixis.pid) ;;
  pnpm) pnpm run build; (pnpm run start & echo $! > /tmp/dixis.pid) ;;
  yarn) yarn build; (yarn start & echo $! > /tmp/dixis.pid) ;;
esac
npx wait-on http://localhost:3000
npx playwright install --with-deps || npx playwright install
set +e
npx playwright test --reporter=html,line
CODE=$?
set -e
[ -d playwright-report ] && tar -czf "$ROOT/docs/_mem/logs/$(date +%Y%m%d-%H%M)-playwright-report.tgz" playwright-report || true
kill "$(cat /tmp/dixis.pid)" 2>/dev/null || true
popd >/dev/null
exit $CODE

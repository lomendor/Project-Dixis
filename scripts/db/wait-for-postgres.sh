#!/usr/bin/env bash
set -euo pipefail
HOST="${PGHOST:-127.0.0.1}"
PORT="${PGPORT:-5432}"
for i in {1..60}; do
  if pg_isready -h "$HOST" -p "$PORT" >/dev/null 2>&1; then 
    echo "✅ Postgres ready at $HOST:$PORT"
    exit 0
  fi
  echo "⏳ Waiting for Postgres at $HOST:$PORT ($i/60)"
  sleep 2
done
echo "❌ Postgres not ready after 120s"
exit 1

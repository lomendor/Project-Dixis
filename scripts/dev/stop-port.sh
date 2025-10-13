#!/usr/bin/env bash
set -e
PORT="${1:-3001}"
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti :"$PORT" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "[stop-port] Kill :$PORT -> $PIDS"
    echo "$PIDS" | xargs kill -9
  else
    echo "[stop-port] No process on :$PORT"
  fi
elif command -v fuser >/dev/null 2>&1; then
  fuser -k "$PORT"/tcp 2>/dev/null || true
else
  echo "[stop-port] No lsof/fuser; nothing done"
fi

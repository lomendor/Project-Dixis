#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <port> [port ...]" 1>&2
  exit 0
fi

for port in "$@"; do
  if (exec 3<>/dev/tcp/127.0.0.1/"$port") 2>/dev/null; then
    echo "OK: port $port listening"
    exec 3>&- 3<&- || true
  else
    echo "DOWN: port $port not reachable"
  fi
done

exit 0


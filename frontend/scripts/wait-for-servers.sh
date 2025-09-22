#!/bin/bash
# Health-wait script for CI - ensures servers are ready before running tests
# Usage: ./scripts/wait-for-servers.sh

set -e

BACKEND_PORT=${BACKEND_PORT:-8001}
FRONTEND_PORT=${FRONTEND_PORT:-3030}
MAX_WAIT=${MAX_WAIT:-90}
CHECK_INTERVAL=2

echo "🔍 Waiting for servers to be ready (max ${MAX_WAIT}s)..."
echo "   Backend:  http://127.0.0.1:${BACKEND_PORT}/api/health"
echo "   Frontend: http://127.0.0.1:${FRONTEND_PORT}/"

backend_ready=false
frontend_ready=false
elapsed=0

while [ $elapsed -lt $MAX_WAIT ]; do
    # Check backend health endpoint
    if [ "$backend_ready" = false ]; then
        if curl -fsS "http://127.0.0.1:${BACKEND_PORT}/api/health" >/dev/null 2>&1; then
            echo "✅ Backend ready at http://127.0.0.1:${BACKEND_PORT}"
            backend_ready=true
        fi
    fi

    # Check frontend root endpoint
    if [ "$frontend_ready" = false ]; then
        if curl -fsS "http://127.0.0.1:${FRONTEND_PORT}/" >/dev/null 2>&1; then
            echo "✅ Frontend ready at http://127.0.0.1:${FRONTEND_PORT}"
            frontend_ready=true
        fi
    fi

    # Exit if both are ready
    if [ "$backend_ready" = true ] && [ "$frontend_ready" = true ]; then
        echo "🎯 READY - All servers are responding"
        exit 0
    fi

    # Show progress every 10 seconds
    if [ $((elapsed % 10)) -eq 0 ] && [ $elapsed -gt 0 ]; then
        echo "⏳ Still waiting... (${elapsed}s/${MAX_WAIT}s)"
        if [ "$backend_ready" = false ]; then
            echo "   Backend:  ❌ Not ready"
        fi
        if [ "$frontend_ready" = false ]; then
            echo "   Frontend: ❌ Not ready"
        fi
    fi

    sleep $CHECK_INTERVAL
    elapsed=$((elapsed + CHECK_INTERVAL))
done

# Timeout reached
echo "❌ TIMEOUT - Servers not ready after ${MAX_WAIT}s"
if [ "$backend_ready" = false ]; then
    echo "   Backend:  FAILED to respond at http://127.0.0.1:${BACKEND_PORT}/api/health"
fi
if [ "$frontend_ready" = false ]; then
    echo "   Frontend: FAILED to respond at http://127.0.0.1:${FRONTEND_PORT}/"
fi

echo ""
echo "💡 Troubleshooting:"
echo "   1. Check if servers are actually running"
echo "   2. Verify port numbers: BACKEND_PORT=${BACKEND_PORT}, FRONTEND_PORT=${FRONTEND_PORT}"
echo "   3. Check server logs for startup errors"

exit 1
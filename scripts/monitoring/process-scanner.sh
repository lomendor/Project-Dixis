#!/bin/bash

################################################################################
# DIXIS Process Scanner
################################################################################
#
# PURPOSE:
#   Scan for suspicious executables and processes that may indicate
#   malware infection (crypto miners, backdoors, etc.)
#
# USAGE:
#   1. Make executable: chmod +x process-scanner.sh
#   2. Test manually: sudo ./process-scanner.sh
#   3. Add to crontab for periodic scanning (see example below)
#
# REQUIREMENTS:
#   - Log directory must exist: /var/log/dixis/
#   - Run with sudo for full /tmp access
#   - Run: sudo mkdir -p /var/log/dixis && sudo chmod 755 /var/log/dixis
#
# CRON EXAMPLE (run every 15 minutes):
#   */15 * * * * /var/www/dixis/scripts/monitoring/process-scanner.sh >> /var/log/dixis/cron.log 2>&1
#
################################################################################

set -euo pipefail

# Configuration
LOG_FILE="/var/log/dixis/process_scanner.log"
SUSPICIOUS_PATHS="/tmp /dev/shm /var/tmp"
SUSPICIOUS_NAMES="xmrig miner minerd cpuminer ethminer ccminer cgminer scanner pcpcat react.py"

# Create log file if it doesn't exist
if [ ! -f "$LOG_FILE" ]; then
    echo "# DIXIS Process Scanner Log - Created $(date)" > "$LOG_FILE"
    echo "# Format: [TIMESTAMP] [TYPE] Message" >> "$LOG_FILE"
fi

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] [INFO] Starting process scan..." >> "$LOG_FILE"

# Scan for suspicious executables in temporary directories
for path in $SUSPICIOUS_PATHS; do
    if [ -d "$path" ]; then
        echo "[$TIMESTAMP] [SCAN] Checking $path for executables..." >> "$LOG_FILE"

        # Find executable files (permissions include 'x')
        FOUND_EXES=$(find "$path" -type f -executable 2>/dev/null | head -20 || true)

        if [ -n "$FOUND_EXES" ]; then
            echo "[$TIMESTAMP] [ALERT] Found executable files in $path:" >> "$LOG_FILE"
            echo "$FOUND_EXES" | while read -r exe; do
                FILE_INFO=$(file "$exe" 2>/dev/null || echo "unknown")
                echo "[$TIMESTAMP] [EXECUTABLE] $exe - $FILE_INFO" >> "$LOG_FILE"
            done
        fi
    fi
done

# Scan for suspicious process names
echo "[$TIMESTAMP] [SCAN] Checking for suspicious processes..." >> "$LOG_FILE"

for name in $SUSPICIOUS_NAMES; do
    if pgrep -f "$name" > /dev/null 2>&1; then
        echo "[$TIMESTAMP] [SECURITY-ALERT] Suspicious process found: $name" >> "$LOG_FILE"

        # Log full process details
        ps aux | grep -i "$name" | grep -v grep | while read -r line; do
            echo "[$TIMESTAMP] [PROCESS-DETAIL] $line" >> "$LOG_FILE"
        done

        # Optional: Kill suspicious processes (uncomment to enable)
        # echo "[$TIMESTAMP] [ACTION] Terminating process: $name" >> "$LOG_FILE"
        # pkill -9 -f "$name" 2>/dev/null || true
    fi
done

# Check for network connections on unusual ports (common miners use 3333, 8333, etc.)
SUSPICIOUS_PORTS="3333 8333 45560"

echo "[$TIMESTAMP] [SCAN] Checking for suspicious network connections..." >> "$LOG_FILE"

for port in $SUSPICIOUS_PORTS; do
    if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
        echo "[$TIMESTAMP] [NETWORK-ALERT] Suspicious port $port is open" >> "$LOG_FILE"

        # Log process using this port
        if command -v lsof &> /dev/null; then
            PROC=$(lsof -i ":$port" 2>/dev/null || echo "unknown")
            echo "[$TIMESTAMP] [NETWORK-PROCESS] Port $port: $PROC" >> "$LOG_FILE"
        fi
    fi
done

# Check for recently modified files in /tmp (malware often creates files here)
echo "[$TIMESTAMP] [SCAN] Checking for recent /tmp modifications..." >> "$LOG_FILE"

RECENT_FILES=$(find /tmp -type f -mtime -1 2>/dev/null | head -20 || true)

if [ -n "$RECENT_FILES" ]; then
    echo "[$TIMESTAMP] [INFO] Recent files in /tmp (last 24h):" >> "$LOG_FILE"
    echo "$RECENT_FILES" | while read -r file; do
        FILE_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "unknown")
        echo "[$TIMESTAMP] [RECENT-FILE] $file ($FILE_SIZE bytes)" >> "$LOG_FILE"
    done
fi

# Keep log file under 10MB (rotate if needed)
LOG_SIZE=$(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null)
if [ "$LOG_SIZE" -gt 10485760 ]; then
    mv "$LOG_FILE" "${LOG_FILE}.old"
    echo "[$TIMESTAMP] [INFO] Log rotated (exceeded 10MB)" > "$LOG_FILE"
fi

echo "[$TIMESTAMP] [INFO] Process scan complete" >> "$LOG_FILE"

# Exit with success
exit 0

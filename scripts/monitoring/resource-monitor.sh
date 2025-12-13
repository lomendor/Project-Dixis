#!/bin/bash

################################################################################
# DIXIS Resource Monitor
################################################################################
#
# PURPOSE:
#   Monitor CPU and memory usage, log high-usage processes to detect
#   potential crypto miners or other malicious activity.
#
# USAGE:
#   1. Make executable: chmod +x resource-monitor.sh
#   2. Test manually: ./resource-monitor.sh
#   3. Add to crontab for periodic monitoring (see example below)
#
# REQUIREMENTS:
#   - Log directory must exist: /var/log/dixis/
#   - Run: sudo mkdir -p /var/log/dixis && sudo chmod 755 /var/log/dixis
#
# CRON EXAMPLE (run every 5 minutes):
#   */5 * * * * /var/www/dixis/scripts/monitoring/resource-monitor.sh >> /var/log/dixis/cron.log 2>&1
#
################################################################################

set -euo pipefail

# Configuration
LOG_FILE="/var/log/dixis/resource_monitor.log"
CPU_THRESHOLD=80  # Alert if any process uses >80% CPU
MEM_THRESHOLD=20  # Alert if any process uses >20% memory

# Create log file if it doesn't exist
if [ ! -f "$LOG_FILE" ]; then
    echo "# DIXIS Resource Monitor Log - Created $(date)" > "$LOG_FILE"
    echo "# Format: [TIMESTAMP] [TYPE] Message" >> "$LOG_FILE"
fi

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Check overall CPU usage
OVERALL_CPU=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}' | cut -d. -f1)

if [ "$OVERALL_CPU" -gt "$CPU_THRESHOLD" ]; then
    echo "[$TIMESTAMP] [CPU-ALERT] Overall CPU usage: ${OVERALL_CPU}%" >> "$LOG_FILE"

    # Log top 5 CPU-consuming processes
    echo "[$TIMESTAMP] [CPU-TOP5] Top CPU processes:" >> "$LOG_FILE"
    ps aux --sort=-%cpu | head -6 | tail -5 | while read -r line; do
        echo "[$TIMESTAMP] [CPU-PROCESS] $line" >> "$LOG_FILE"
    done
fi

# Check for memory-intensive processes
echo "[$TIMESTAMP] [MEM-CHECK] Checking memory usage..." >> "$LOG_FILE"
ps aux --sort=-%mem | awk -v threshold="$MEM_THRESHOLD" '$4 > threshold {print}' | head -5 | while read -r line; do
    echo "[$TIMESTAMP] [MEM-ALERT] High memory process: $line" >> "$LOG_FILE"
done

# Check for suspicious process names (crypto miners)
SUSPICIOUS_PATTERNS="xmrig|miner|minerd|cpuminer|ethminer|ccminer|cgminer|cryptonight"

if ps aux | grep -iE "$SUSPICIOUS_PATTERNS" | grep -v grep > /dev/null 2>&1; then
    echo "[$TIMESTAMP] [SECURITY-ALERT] Suspicious mining process detected!" >> "$LOG_FILE"
    ps aux | grep -iE "$SUSPICIOUS_PATTERNS" | grep -v grep | while read -r line; do
        echo "[$TIMESTAMP] [SECURITY-PROCESS] $line" >> "$LOG_FILE"
    done

    # Optional: Kill suspicious processes (uncomment to enable)
    # pkill -9 -f "$SUSPICIOUS_PATTERNS" 2>/dev/null || true
fi

# Keep log file under 10MB (rotate if needed)
LOG_SIZE=$(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null)
if [ "$LOG_SIZE" -gt 10485760 ]; then
    mv "$LOG_FILE" "${LOG_FILE}.old"
    echo "[$TIMESTAMP] [INFO] Log rotated (exceeded 10MB)" > "$LOG_FILE"
fi

echo "[$TIMESTAMP] [INFO] Resource monitor check complete" >> "$LOG_FILE"

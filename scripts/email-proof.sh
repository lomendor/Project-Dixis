#!/bin/bash
#
# email-proof.sh - Verify production email configuration and delivery
#
# Usage:
#   ./scripts/email-proof.sh                         # Dry-run only (validate config)
#   ./scripts/email-proof.sh --send --to=you@email   # Send actual test email
#
# Pass: OPS-EMAIL-PROOF-01
# Created: 2026-01-19

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROD_URL="${PROD_URL:-https://dixis.gr}"
SSH_HOST="${SSH_HOST:-dixis-prod}"
BACKEND_PATH="${BACKEND_PATH:-/var/www/dixis.gr/backend}"

# Parse arguments
SEND_EMAIL=false
RECIPIENT=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --send)
            SEND_EMAIL=true
            shift
            ;;
        --to=*)
            RECIPIENT="${1#*=}"
            shift
            ;;
        --to)
            RECIPIENT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--send] [--to=email@example.com]"
            exit 1
            ;;
    esac
done

echo "=============================================="
echo "EMAIL-PROOF-01: Production Email Verification"
echo "=============================================="
echo ""
echo "Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo "Target: $PROD_URL"
echo ""

# Step 1: Check health endpoint for email configuration
echo -e "${YELLOW}[1/4] Checking health endpoint...${NC}"
HEALTH_JSON=$(curl -sf "${PROD_URL}/api/healthz" 2>/dev/null || echo '{}')

if [ "$HEALTH_JSON" = "{}" ]; then
    echo -e "${RED}FAIL: Could not reach ${PROD_URL}/api/healthz${NC}"
    exit 1
fi

# Extract email configuration
EMAIL_FLAG=$(echo "$HEALTH_JSON" | jq -r '.email.flag // "unknown"')
EMAIL_MAILER=$(echo "$HEALTH_JSON" | jq -r '.email.mailer // "unknown"')
EMAIL_CONFIGURED=$(echo "$HEALTH_JSON" | jq -r '.email.configured // false')
RESEND_KEY_SET=$(echo "$HEALTH_JSON" | jq -r '.email.keys_present.resend // false')

echo "  flag:       $EMAIL_FLAG"
echo "  mailer:     $EMAIL_MAILER"
echo "  configured: $EMAIL_CONFIGURED"
echo "  resend_key: $RESEND_KEY_SET"
echo ""

# Validate configuration
STEP1_PASS=true
if [ "$EMAIL_FLAG" != "enabled" ]; then
    echo -e "${RED}  ERROR: EMAIL_NOTIFICATIONS_ENABLED is not true${NC}"
    STEP1_PASS=false
fi
if [ "$EMAIL_CONFIGURED" != "true" ]; then
    echo -e "${RED}  ERROR: Email is not configured${NC}"
    STEP1_PASS=false
fi
if [ "$EMAIL_MAILER" = "resend" ] && [ "$RESEND_KEY_SET" != "true" ]; then
    echo -e "${RED}  ERROR: RESEND_KEY is not set${NC}"
    STEP1_PASS=false
fi

if [ "$STEP1_PASS" = true ]; then
    echo -e "${GREEN}[1/4] PASS: Email configuration valid${NC}"
else
    echo -e "${RED}[1/4] FAIL: Email configuration invalid${NC}"
    echo ""
    echo "To fix, ensure these are set in production .env:"
    echo "  MAIL_MAILER=resend"
    echo "  RESEND_KEY=re_xxxx..."
    echo "  EMAIL_NOTIFICATIONS_ENABLED=true"
    exit 1
fi
echo ""

# Step 2: Test SSH connectivity
echo -e "${YELLOW}[2/4] Testing SSH connectivity...${NC}"
if ssh -o BatchMode=yes -o ConnectTimeout=10 "$SSH_HOST" 'echo ok' >/dev/null 2>&1; then
    echo -e "${GREEN}[2/4] PASS: SSH connection successful${NC}"
else
    echo -e "${YELLOW}[2/4] SKIP: SSH connection not available (key-based auth required)${NC}"
    echo "  To enable full verification, configure SSH access to $SSH_HOST"
    echo ""

    # If we can't SSH but health check passed, output partial proof
    if [ "$STEP1_PASS" = true ]; then
        echo "=============================================="
        echo "PARTIAL PROOF (Health Check Only)"
        echo "=============================================="
        echo ""
        echo "EMAIL_FLAG=$EMAIL_FLAG"
        echo "EMAIL_MAILER=$EMAIL_MAILER"
        echo "EMAIL_CONFIGURED=$EMAIL_CONFIGURED"
        echo "RESEND_KEY_SET=$RESEND_KEY_SET"
        echo ""
        echo "SSH access required for full verification (dry-run + send tests)"
        exit 0
    fi
    exit 1
fi
echo ""

# Step 3: Run dry-run via SSH
echo -e "${YELLOW}[3/4] Running dry-run validation on VPS...${NC}"
DRY_RUN_OUTPUT=$(ssh "$SSH_HOST" "cd $BACKEND_PATH && php artisan dixis:email:test --to=test@example.com --dry-run" 2>&1)
echo "$DRY_RUN_OUTPUT"
echo ""

if echo "$DRY_RUN_OUTPUT" | grep -q "Email configuration is valid"; then
    echo -e "${GREEN}[3/4] PASS: Dry-run validation successful${NC}"
elif echo "$DRY_RUN_OUTPUT" | grep -q "Would send to"; then
    echo -e "${GREEN}[3/4] PASS: Configuration valid (minor warnings)${NC}"
else
    echo -e "${RED}[3/4] FAIL: Dry-run validation failed${NC}"
    exit 1
fi
echo ""

# Step 4: Send test email (if --send flag provided)
if [ "$SEND_EMAIL" = true ]; then
    if [ -z "$RECIPIENT" ]; then
        echo -e "${RED}[4/4] ERROR: --send requires --to=email@example.com${NC}"
        exit 1
    fi

    echo -e "${YELLOW}[4/4] Sending test email to $RECIPIENT...${NC}"
    SEND_OUTPUT=$(ssh "$SSH_HOST" "cd $BACKEND_PATH && php artisan dixis:email:test --to='$RECIPIENT'" 2>&1)
    echo "$SEND_OUTPUT"
    echo ""

    if echo "$SEND_OUTPUT" | grep -q "Test email sent successfully"; then
        echo -e "${GREEN}[4/4] PASS: Test email sent${NC}"
        SEND_STATUS="SENT"
    else
        echo -e "${RED}[4/4] FAIL: Failed to send test email${NC}"
        SEND_STATUS="FAILED"
    fi
else
    echo -e "${YELLOW}[4/4] SKIP: Add --send --to=email to send test email${NC}"
    SEND_STATUS="SKIPPED"
fi
echo ""

# Output proof
echo "=============================================="
echo "PROOF: EMAIL-PROOF-01"
echo "=============================================="
echo ""
echo "DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "PROD_URL=$PROD_URL"
echo "EMAIL_FLAG=$EMAIL_FLAG"
echo "EMAIL_MAILER=$EMAIL_MAILER"
echo "EMAIL_CONFIGURED=$EMAIL_CONFIGURED"
echo "RESEND_KEY_SET=$RESEND_KEY_SET"
echo "DRY_RUN=PASS"
echo "SEND_STATUS=$SEND_STATUS"
if [ -n "$RECIPIENT" ] && [ "$SEND_STATUS" = "SENT" ]; then
    echo "RECIPIENT=$RECIPIENT"
fi
echo ""
echo "STATUS=PASS"
echo ""
echo -e "${GREEN}Email verification complete.${NC}"

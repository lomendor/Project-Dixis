#!/bin/bash

# 🔒 PROJECT DIXIS - SANITY LOCK SYSTEM
# Prevents confusion when working across multiple repo copies

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ACTIVE_REPO_FILE="$PROJECT_ROOT/.ACTIVE_REPO"

echo "🔍 PROJECT DIXIS - Sanity Check"
echo "=================================="

# Check if this is the active repo
if [[ ! -f "$ACTIVE_REPO_FILE" ]]; then
    echo "❌ ERROR: No .ACTIVE_REPO marker found"
    echo "   This directory may not be the active Project-Dixis repo"
    echo "   Run 'touch .ACTIVE_REPO' if this is the correct repo"
    exit 1
fi

# Display active repo info
echo "✅ Active Repo Marker Found"
echo ""
echo "📋 Repository Information:"
cat "$ACTIVE_REPO_FILE"
echo ""

# Check git status
if [[ -d "$PROJECT_ROOT/.git" ]]; then
    echo "🔧 Git Status:"
    cd "$PROJECT_ROOT"
    
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    LAST_COMMIT=$(git log -1 --oneline 2>/dev/null || echo "unknown")
    
    echo "   Branch: $CURRENT_BRANCH"
    echo "   Last commit: $LAST_COMMIT"
    echo ""
    
    # Check for uncommitted changes
    if ! git diff --quiet 2>/dev/null; then
        echo "⚠️  WARNING: Uncommitted changes detected"
        git status --porcelain
        echo ""
    fi
else
    echo "⚠️  WARNING: Not a git repository"
    echo ""
fi

# Check for duplicate repos in parent directory
echo "🔍 Checking for duplicate repos..."
PARENT_DIR="$(dirname "$PROJECT_ROOT")"
DUPLICATES=$(find "$PARENT_DIR" -name ".ACTIVE_REPO" -path "*/Project-Dixis/*" 2>/dev/null | wc -l)

if [[ $DUPLICATES -gt 1 ]]; then
    echo "⚠️  WARNING: Multiple active repos found!"
    echo "   Found $DUPLICATES .ACTIVE_REPO files:"
    find "$PARENT_DIR" -name ".ACTIVE_REPO" -path "*/Project-Dixis/*" 2>/dev/null
    echo ""
    echo "   Consider cleaning up duplicate repos to avoid confusion"
else
    echo "✅ No duplicate active repos found"
fi

echo ""
echo "🎯 Current Working Directory: $(pwd)"
echo "🏠 Project Root: $PROJECT_ROOT"
echo ""
echo "✅ SANITY CHECK COMPLETE"

# Update last verified timestamp
sed -i.bak "s/LAST_VERIFIED=.*/LAST_VERIFIED=$(date +%Y-%m-%d)/" "$ACTIVE_REPO_FILE" 2>/dev/null || true
rm -f "$ACTIVE_REPO_FILE.bak" 2>/dev/null || true

echo "📅 Updated last verified timestamp"
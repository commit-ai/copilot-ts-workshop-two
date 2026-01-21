#!/bin/bash

# Test script for session-start.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSION_SCRIPT="$SCRIPT_DIR/session-start.sh"
TEST_LOG="/tmp/test-session.log"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Setup
setup() {
    rm -f "$TEST_LOG"
    # Create a modified version of the script for testing
    sed "s|../../logs/session.log|$TEST_LOG|g" "$SESSION_SCRIPT" > /tmp/test-session-start.sh
    chmod +x /tmp/test-session-start.sh
}

# Teardown
teardown() {
    rm -f "$TEST_LOG"
    rm -f /tmp/test-session-start.sh
}

# Test function
test_session_log_entry() {
    local test_name="$1"
    local input="$2"
    local expected="$3"
    
    echo "$input" | /tmp/test-session-start.sh
    
    if grep -q "$expected" "$TEST_LOG"; then
        echo -e "${GREEN}✓${NC} $test_name"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} $test_name"
        echo "  Expected: $expected"
        echo "  Got: $(cat "$TEST_LOG" 2>/dev/null || echo 'No log file')"
        ((TESTS_FAILED++))
    fi
}

# Run tests
setup

test_session_log_entry \
    "Logs session from vscode" \
    '{"source":"vscode","timestamp":"2024-01-01T10:00:00Z"}' \
    "Session started from vscode at 2024-01-01T10:00:00Z"

test_session_log_entry \
    "Logs session from cli" \
    '{"source":"cli","timestamp":"2024-01-01T11:30:00Z"}' \
    "Session started from cli at 2024-01-01T11:30:00Z"

teardown

# Summary
echo ""
echo "Tests passed: $TESTS_PASSED"
echo "Tests failed: $TESTS_FAILED"

[ $TESTS_FAILED -eq 0 ] && exit 0 || exit 1
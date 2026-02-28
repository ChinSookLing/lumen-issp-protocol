#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
CHARTER_FILE="$ROOT_DIR/docs/governance/CHARTER.md"

if [[ ! -f "$CHARTER_FILE" ]]; then
  echo "FAIL: CHARTER file not found: $CHARTER_FILE"
  exit 1
fi

errors=0

check_contains() {
  local needle="$1"
  local label="$2"
  if ! grep -Fq "$needle" "$CHARTER_FILE"; then
    echo "FAIL: missing $label ($needle)"
    errors=$((errors + 1))
  else
    echo "PASS: $label"
  fi
}

echo "check-charter: validating required Charter anchors in docs/governance/CHARTER.md"

# Header metadata checks
check_contains "# Lumen ISSP Charter" "charter title"
check_contains "**Status:**" "status metadata"
check_contains "**Date:**" "date metadata"

# Core red-line anchors (M84 required coverage)
check_contains "### §2.1" "§2.1 No Decision Recommendation"
check_contains "### §2.2" "§2.2 No Identity Targeting"
check_contains "### §2.3" "§2.3 No Centralization"
check_contains "### §2.4" "§2.4 No Silent Degradation"
check_contains "### §2.5" "§2.5 Anti-Weaponization"
check_contains "### §2.6" "§2.6 Anti-Labeling"
check_contains "### §2.7" "§2.7 Capability Disclosure"

# M84 pending closure anchors (must be explicit placeholders or clauses)
if grep -Fq "§2.8" "$CHARTER_FILE"; then
  echo "PASS: §2.8 anchor exists"
else
  echo "WARN: §2.8 anchor not found (still acceptable only if tracked as open gap)"
fi

if grep -Fq "§2.9" "$CHARTER_FILE"; then
  echo "PASS: §2.9 anchor exists"
else
  echo "WARN: §2.9 anchor not found (still acceptable only if tracked as open gap)"
fi

# Governance integrity anchors
check_contains "### §4.3" "§4.3 change tiers / protocol integrity"
check_contains "### §7.2" "§7.2 two-tier evidence"
check_contains "### §7.3" "§7.3 semantic desensitization"
check_contains "### §7.4" "§7.4 log governance"

if [[ "$errors" -gt 0 ]]; then
  echo "check-charter FAILED: $errors required check(s) missing"
  exit 1
fi

echo "check-charter PASSED"

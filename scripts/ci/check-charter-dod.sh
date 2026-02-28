#!/usr/bin/env bash
set -euo pipefail

# DOD-CH-01 UI Copy Ban Check + DOD-CH-02 Moral Judgment Linter + DOD-CH-05 Cross Ref
# Based on CHARTER.patch.dod.json
# Mode: warning (exit 0) — switch to exit 1 after stabilization

CHARTER_FILE="docs/charter/CHARTER.md"
UI_DIRS=("ui/templates" "docs/ui")
OUTPUT_DIRS=("examples/outputs" "docs")
VIOLATIONS=0

echo "=== DOD-CH-01: UI Copy Ban Check ==="
BANNED_PATTERN='\b(do|must|should|立即|馬上|segera|harus)\b'
for d in "${UI_DIRS[@]}"; do
  if [ -d "$d" ]; then
    if grep -rnE "$BANNED_PATTERN" "$d" 2>/dev/null; then
      VIOLATIONS=$((VIOLATIONS+1))
    fi
  fi
done

echo "=== DOD-CH-02: Moral Judgment Linter ==="
MORAL_PATTERN='\bis immoral\b|\bis evil\b|\btidak bermoral\b|\bis wrong\b|\bis bad\b'
for d in "${OUTPUT_DIRS[@]}"; do
  if [ -d "$d" ]; then
    if grep -rnE "$MORAL_PATTERN" "$d" 2>/dev/null; then
      VIOLATIONS=$((VIOLATIONS+1))
    fi
  fi
done

echo "=== DOD-CH-05: §4.3 Cross Reference ==="
if [ -f "$CHARTER_FILE" ]; then
  if ! grep -q "§4.3" "$CHARTER_FILE" 2>/dev/null; then
    echo "WARNING: §4.3 cross reference not found in $CHARTER_FILE"
    VIOLATIONS=$((VIOLATIONS+1))
  else
    echo "OK: §4.3 reference found"
  fi
else
  echo "WARNING: $CHARTER_FILE not found"
fi

echo ""
echo "=== Summary: $VIOLATIONS potential violation(s) ==="
# Warning mode: always exit 0
# To enforce: change to exit $VIOLATIONS
exit 0

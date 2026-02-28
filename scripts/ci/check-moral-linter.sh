#!/usr/bin/env bash
set -euo pipefail

SAMPLE_DIRS=("examples/outputs" "tests/sample_outputs" "docs")
MORAL_PATTERN='(\bis immoral\b|\bis evil\b|\btidak bermoral\b|\bis wrong\b|\bis bad\b|\bis corrupt\b|\bis guilty\b)'

echo "Running moral judgment linter..."
FOUND=0
for d in "${SAMPLE_DIRS[@]}"; do
  if [ -d "$d" ]; then
    rg -n --hidden --no-ignore-vcs -e "$MORAL_PATTERN" "$d" || true
    if rg -n --hidden --no-ignore-vcs -e "$MORAL_PATTERN" "$d" >/dev/null 2>&1; then
      FOUND=1
    fi
  fi
done

if [ "$FOUND" -eq 1 ]; then
  echo "Moral judgment patterns detected."
  MODE="${MODE:-warning}"
  if [ "$MODE" = "strict" ]; then
    exit 1
  else
    exit 0
  fi
else
  echo "No moral judgment patterns detected."
  exit 0
fi

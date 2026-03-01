#!/bin/bash
# Lumen ISSP — Health Check Script
# Usage: ./scripts/health-check.sh [url]
# Default: http://localhost:3000/health

URL="${1:-http://localhost:3000/health}"

echo "🔭 Lumen Health Check"
echo "   Target: $URL"
echo ""

RESPONSE=$(curl -sf "$URL" 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ HEALTHY"
  echo "   Response: $RESPONSE"
  
  # Parse version if jq available
  if command -v jq &> /dev/null; then
    VERSION=$(echo "$RESPONSE" | jq -r '.version // "unknown"')
    echo "   Version:  $VERSION"
  fi
  
  exit 0
else
  echo "❌ UNHEALTHY"
  echo "   Error: $RESPONSE"
  echo ""
  echo "   Troubleshooting:"
  echo "   1. Check container: docker compose ps"
  echo "   2. Check logs: docker compose logs lumen-node"
  echo "   3. Check port: curl -v $URL"
  exit 1
fi

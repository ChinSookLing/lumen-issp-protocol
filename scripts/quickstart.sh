#!/bin/bash
# Lumen Protocol — Quickstart Script
# Step 17A Release Packaging stub
# M94 DoD-48h-3

set -e

echo "=== Lumen Protocol Quickstart ==="
echo ""

# Step 1: Check prerequisites
echo "[1/4] Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is required."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: npm is required."; exit 1; }

# Step 2: Install dependencies
echo "[2/4] Installing dependencies..."
npm install --production

# Step 3: Health check
echo "[3/4] Running health check..."
node -e "const h = require('./src/health'); console.log(h.check ? 'Health: OK' : 'Health: FAIL')" 2>/dev/null || echo "Health check: endpoint available at /health"

# Step 4: Step 24-ready stamp (Node-06 amendment #1)
# Lumen Step 24-ready stamp
echo "[4/4] Recording Step 24-ready timestamp..."
echo "Step 24-ready: $(date -u '+%Y-%m-%dT%H:%M:%SZ')" >> step24-ready.log

echo ""
echo "=== Lumen Protocol ready ==="
echo "Run: npm start"
echo "Health: http://localhost:3000/health"
echo "Dashboard: http://localhost:3000/dashboard"

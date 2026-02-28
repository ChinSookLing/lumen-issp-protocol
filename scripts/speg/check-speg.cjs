#!/usr/bin/env node
// scripts/speg/check-speg.cjs
// SPEG Gate CI Runner — zero deps, CommonJS
// Design: Node-05 (SPEG-R2-07), Implementation: Node-01
//
// Usage: node scripts/speg/check-speg.cjs [repo-root]
// Exit 0 = PASS, Exit 2 = FAIL (critical/high finding)

'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { runFullScan, determineExitCode } = require('./speg-lib.cjs');

const repoRoot = process.argv[2] || path.resolve(__dirname, '..', '..');

console.log('╔══════════════════════════════════════╗');
console.log('║   SPEG Gate — CI Compliance Check    ║');
console.log('╚══════════════════════════════════════╝');
console.log(`Repo: ${repoRoot}`);
console.log('');

try {
  const findings = runFullScan(repoRoot);

  if (findings.length === 0) {
    console.log('✅ SPEG Gate: PASS — No findings');
    process.exit(0);
  }

  // Group by category
  const byCategory = {};
  for (const f of findings) {
    if (!byCategory[f.category]) byCategory[f.category] = [];
    byCategory[f.category].push(f);
  }

  console.log(`⚠️  SPEG Gate: ${findings.length} finding(s)\n`);

  for (const [cat, items] of Object.entries(byCategory)) {
    console.log(`  Category ${cat}:`);
    for (const item of items) {
      const icon = item.severity === 'critical' ? '🔴' : item.severity === 'high' ? '🟠' : '🟡';
      console.log(`    ${icon} [${item.severity}] ${item.type}: ${item.file || item.dep || 'unknown'}`);
      if (item.rule) console.log(`       Rule: ${item.rule}`);
      if (item.key) console.log(`       Key: ${item.key}`);
      if (item.pattern) console.log(`       Pattern: ${item.pattern}`);
    }
    console.log('');
  }

  // Write findings to artifacts
  const artifactsDir = path.join(repoRoot, 'artifacts');
  if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });
  const outputPath = path.join(artifactsDir, 'speg_findings.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    repo: repoRoot,
    total_findings: findings.length,
    findings,
  }, null, 2));
  console.log(`📄 Findings written to: ${outputPath}`);

  const exitCode = determineExitCode(findings);
  if (exitCode === 0) {
    console.log('\n✅ SPEG Gate: PASS (findings are overridden/low severity)');
  } else {
    console.log('\n❌ SPEG Gate: FAIL — critical/high findings detected');
  }
  process.exit(exitCode);

} catch (err) {
  console.error('❌ SPEG Gate error:', err.message);
  process.exit(1);
}

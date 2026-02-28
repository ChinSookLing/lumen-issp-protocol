#!/usr/bin/env node

/**
 * Anti-drift CI Gate — validate-enum-drift.js
 *
 * Purpose: Ensure enum values are ONLY defined in source-of-truth files
 * (schemas/, config/). If docs/, test descriptions, or src/ files
 * hardcode enum arrays that should reference config, this gate fails.
 *
 * Author: Node-01 — AI Council Architect / Secretary
 * Sprint: 10 (M86 homework #12)
 * Date: 2026-02-25
 *
 * Usage: node scripts/ci/validate-enum-drift.js
 * Exit: 0 = pass, 1 = drift detected
 */

const fs = require('fs');
const path = require('path');

// ─── Source-of-truth files (these are ALLOWED to define enums) ───
const ALLOWED_PATHS = [
  'schemas/',
  'config/',
  'test/fixtures/',          // fixtures may contain enum values as test data
  'scripts/ci/',             // CI scripts may reference enums for validation
  'node_modules/',
  '.git/'
];

// ─── Enum patterns to watch (from ui-request-v0.1.json + config/) ───
// These are enum ARRAYS that should only appear in source-of-truth.
// Individual enum values in prose/comments are OK — we look for array patterns.
const ENUM_SIGNATURES = [
  {
    name: 'scenario',
    pattern: /\[\s*["']monitoring_brief["'].*["']incident_review["'].*["']tabletop["'].*["']export_only["']\s*\]/,
    source: 'schemas/ui-request-v0.1.json'
  },
  {
    name: 'time_scale',
    pattern: /\[\s*["']5m["'].*["']1h["'].*["']24h["'].*["']7d["'].*["']30d["']\s*\]/,
    source: 'schemas/ui-request-v0.1.json'
  },
  {
    name: 'output_mode',
    pattern: /\[\s*["']brief["'].*["']audit["'].*["']json_only["'].*["']dashboard_cards["']\s*\]/,
    source: 'schemas/ui-request-v0.1.json'
  },
  {
    name: 'purpose',
    pattern: /\[\s*["']internal["'].*["']share["'].*["']research["']\s*\]/,
    source: 'schemas/ui-request-v0.1.json'
  },
  {
    name: 'input_source',
    pattern: /\[\s*["']manual_paste["'].*["']local_file["'].*["']user_provided_log["']\s*\]/,
    source: 'schemas/ui-request-v0.1.json'
  },
  {
    name: 'channel',
    pattern: /\[\s*["']web["'].*["']app["'].*["']telegram["'].*["']cli["'].*["']voice["']/,
    source: 'schemas/ui-request-v0.1.json'
  },
  {
    name: 'pii_policy',
    pattern: /\[\s*["']strict["'].*["']standard["'].*["']off["']\s*\]/,
    source: 'schemas/ui-request-v0.1.json'
  },
  {
    name: 'motif_ids',
    pattern: /\[\s*["']MOTIF_IDENTITY_STRIPPING["'].*["']MOTIF_DEBT_SACRIFICE["'].*["']MOTIF_FALSE_DILEMMA["']\s*\]/,
    source: 'config/motifs/structure-motifs.v0.1.json'
  }
];

// ─── File extensions to scan ───
const SCAN_EXTENSIONS = ['.js', '.json', '.md', '.yaml', '.yml', '.ts'];

// ─── Helpers ───

function isAllowedPath(filePath) {
  return ALLOWED_PATHS.some(allowed => filePath.startsWith(allowed));
}

function walkDir(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if (file === 'node_modules' || file === '.git') continue;
        walkDir(filePath, fileList);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (SCAN_EXTENSIONS.includes(ext)) {
          fileList.push(filePath);
        }
      }
    }
  } catch (e) {
    // skip unreadable dirs
  }
  return fileList;
}

// ─── Main ───

function main() {
  const repoRoot = process.cwd();
  const allFiles = walkDir(repoRoot);
  const violations = [];

  for (const filePath of allFiles) {
    const relativePath = path.relative(repoRoot, filePath);

    // Skip allowed paths
    if (isAllowedPath(relativePath)) continue;

    let content;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
      continue;
    }

    // Check each enum signature
    for (const sig of ENUM_SIGNATURES) {
      if (sig.pattern.test(content)) {
        violations.push({
          file: relativePath,
          enum: sig.name,
          source: sig.source
        });
      }
    }
  }

  // ─── Report ───
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Anti-drift CI Gate — Enum Validation   ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log();
  console.log(`Scanned: ${allFiles.length} files`);
  console.log(`Allowed paths: ${ALLOWED_PATHS.join(', ')}`);
  console.log(`Enum signatures: ${ENUM_SIGNATURES.length}`);
  console.log();

  if (violations.length === 0) {
    console.log('✅ PASS — No enum drift detected.');
    console.log('   All enum definitions are in source-of-truth files.');
    process.exit(0);
  } else {
    console.log(`❌ FAIL — ${violations.length} enum drift(s) detected:`);
    console.log();
    for (const v of violations) {
      console.log(`  ⚠️  ${v.file}`);
      console.log(`     Hardcoded enum: "${v.enum}"`);
      console.log(`     Should reference: ${v.source}`);
      console.log();
    }
    console.log('Fix: Remove hardcoded enum arrays and reference the source-of-truth file instead.');
    process.exit(1);
  }
}

main();

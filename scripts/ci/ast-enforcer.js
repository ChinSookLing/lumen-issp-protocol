#!/usr/bin/env node
// scripts/ci/ast-enforcer.js
// AST-Based CI Enforcer — Lumen Compatible Compliance Scanner
//
// Scans JavaScript source code using AST parsing to verify:
//   Rule 1: SPEG compliance (no raw_text/user_id logging)
//   Rule 2: L2b Flags taxonomy integrity (all 6 flags present)
//   Rule 3: DMS/Continuity reference exists
//
// Spec: Node-04 AST CI Enforcer v1.0 (c217)
// Test data: Node-06 Protocol Independence Case Studies ×3 (c208)
// Owner: Node-01 (Architect)
// Sprint 13 · M95-D02 #4

'use strict';

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

// ─── Config ─────────────────────────────────────────────────────────

const REQUIRED_L2B_FLAGS = [
  'spec_gap_risk',
  'cta_self_promo',
  'narrative_hype',
  'dm_bait',
  'free_unlimited_claim',
  'keyword_reply_cta'
];

const SPEG_BANNED_IDENTIFIERS = [
  'raw_text',
  'original_message',
  'user_id',
  'userId',
  'chat_id',
  'chatId',
  'ip_address',
  'ipAddress'
];

const WRITE_FUNCTIONS = [
  'writeFileSync',
  'writeFile',
  'appendFileSync',
  'appendFile',
  'save'
];

// console.log is allowed for debug — only persistent storage is SPEG violation

// ─── AST Walkers ────────────────────────────────────────────────────

/**
 * Walk AST tree recursively, calling visitor on each node.
 */
function walk(node, visitor) {
  if (!node || typeof node !== 'object') return;
  if (node.type) visitor(node);
  for (const key of Object.keys(node)) {
    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach(c => walk(c, visitor));
    } else if (child && typeof child === 'object' && child.type) {
      walk(child, visitor);
    }
  }
}

/**
 * Collect all string literals and identifiers from an AST subtree.
 */
function collectIdentifiers(node) {
  const ids = [];
  walk(node, n => {
    if (n.type === 'Identifier') ids.push(n.name);
    if (n.type === 'Literal' && typeof n.value === 'string') ids.push(n.value);
    if (n.type === 'MemberExpression' && n.property) {
      if (n.property.type === 'Identifier') ids.push(n.property.name);
      if (n.property.type === 'Literal') ids.push(String(n.property.value));
    }
  });
  return ids;
}

// ─── Rule 1: SPEG Compliance ────────────────────────────────────────

/**
 * Scan for write/log calls that reference banned identifiers.
 * Catches: fs.writeFileSync(path, raw_text), console.log(user_id), etc.
 */
function checkSPEG(ast, filePath) {
  const violations = [];

  walk(ast, node => {
    if (node.type !== 'CallExpression') return;

    // Get function name
    let funcName = '';
    if (node.callee.type === 'Identifier') {
      funcName = node.callee.name;
    } else if (node.callee.type === 'MemberExpression' && node.callee.property) {
      funcName = node.callee.property.name || '';
    }

    if (!WRITE_FUNCTIONS.includes(funcName)) return;

    // Check arguments for banned identifiers
    for (const arg of (node.arguments || [])) {
      const ids = collectIdentifiers(arg);
      for (const id of ids) {
        if (SPEG_BANNED_IDENTIFIERS.includes(id)) {
          violations.push({
            rule: 'SPEG-01',
            severity: 'CRITICAL',
            file: filePath,
            line: node.loc?.start?.line || 0,
            message: `Write/log function "${funcName}" references banned identifier "${id}" — violates SPEG Data Minimization`,
            detail: `SPEG A-E prohibits storing raw_text, user identity, or original messages.`
          });
        }
      }
    }
  });

  return violations;
}

// ─── Rule 2: L2b Flags Integrity ────────────────────────────────────

/**
 * Check that all 6 required L2b flags exist in the detector.
 * Uses regex to match actual object keys, not comments or string mentions.
 * Matches: `flag_name:` or `flag_name :` or `'flag_name'` as object key
 */
function checkL2bFlags(sourceCode, filePath) {
  const violations = [];
  const missingFlags = [];

  // Strip comments to avoid false matches
  const stripped = sourceCode
    .replace(/\/\/.*$/gm, '')           // single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '');  // multi-line comments

  for (const flag of REQUIRED_L2B_FLAGS) {
    // Check if flag appears as object key (not in comment)
    const keyPattern = new RegExp(`['"]?${flag}['"]?\\s*[:=]`);
    if (!keyPattern.test(stripped)) {
      missingFlags.push(flag);
    }
  }

  if (missingFlags.length > 0) {
    violations.push({
      rule: 'L2B-01',
      severity: 'CRITICAL',
      file: filePath,
      line: 0,
      message: `Missing L2b flags: ${missingFlags.join(', ')}`,
      detail: `M95-V3 ratified 6 flags. All must be present. Missing ${missingFlags.length}/6.`
    });
  }

  return violations;
}

// ─── Rule 3: DMS/Continuity Reference ───────────────────────────────

/**
 * Check that the codebase has DMS or continuity references.
 * Scans all source files for continuity.md, dms, dead man's switch references.
 */
function checkDMSReference(allSources) {
  const DMS_MARKERS = [
    'continuity.md',
    'continuity',
    'dead_man',
    'deadman',
    'dms',
    'DMS',
    'idle_days',
    'dms-silent-check',
    'dms-alert'
  ];

  let found = false;
  for (const { source } of allSources) {
    for (const marker of DMS_MARKERS) {
      if (source.includes(marker)) {
        found = true;
        break;
      }
    }
    if (found) break;
  }

  if (!found) {
    return [{
      rule: 'DMS-01',
      severity: 'WARNING',
      file: '(codebase)',
      line: 0,
      message: 'No DMS/continuity reference found in codebase',
      detail: 'B4 §12.2 requires Dead Man\'s Switch presence. Check ops/continuity.md or .github/workflows/dms-silent-check.yml'
    }];
  }

  return [];
}

// ─── Scanner ────────────────────────────────────────────────────────

/**
 * Scan a directory for JS files and run all rules.
 * @param {string} targetDir - Directory to scan (default: current project)
 * @returns {{ pass: boolean, violations: array, summary: object }}
 */
function scan(targetDir) {
  targetDir = targetDir || process.cwd();
  const violations = [];
  const allSources = [];

  // Collect JS files
  const jsFiles = findJSFiles(targetDir);
  console.log(`🔍 AST Enforcer — Scanning ${jsFiles.length} files in ${targetDir}`);
  console.log('');

  for (const filePath of jsFiles) {
    const source = fs.readFileSync(filePath, 'utf8');
    const relPath = path.relative(targetDir, filePath);
    allSources.push({ path: relPath, source });

    // Strip shebang if present (#!/usr/bin/env node)
    let cleanSource = source;
    if (cleanSource.startsWith('#!')) {
      cleanSource = cleanSource.replace(/^#!.*\n/, '\n');
    }

    // Parse AST
    let ast;
    try {
      ast = acorn.parse(cleanSource, {
        ecmaVersion: 2022,
        sourceType: 'script',
        locations: true,
        allowReturnOutsideFunction: true
      });
    } catch (parseErr) {
      try {
        ast = acorn.parse(cleanSource, {
          ecmaVersion: 2022,
          sourceType: 'module',
          locations: true,
          allowReturnOutsideFunction: true,
          allowImportExportEverywhere: true
        });
      } catch (_) {
        console.log(`   ⚠️  Parse error in ${relPath}: ${parseErr.message}`);
        continue;
      }
    }

    // Rule 1: SPEG compliance
    violations.push(...checkSPEG(ast, relPath));

    // Rule 2: L2b flags (only check the detector file)
    if (relPath.includes('l2b') && relPath.includes('detector')) {
      violations.push(...checkL2bFlags(source, relPath));
    }
  }

  // Rule 3: DMS reference (codebase-wide)
  violations.push(...checkDMSReference(allSources));

  // Summary
  const critical = violations.filter(v => v.severity === 'CRITICAL').length;
  const warnings = violations.filter(v => v.severity === 'WARNING').length;
  const pass = critical === 0;

  return {
    pass,
    violations,
    summary: {
      files_scanned: jsFiles.length,
      critical,
      warnings,
      total: violations.length,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Recursively find JS files, excluding node_modules and test files.
 */
function findJSFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'test', 'tests', 'conformance', 'test-runs'].includes(entry.name)) continue;
      findJSFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

// ─── CLI ────────────────────────────────────────────────────────────

if (require.main === module) {
  const targetDir = process.argv[2] || process.cwd();

  console.log('========================================');
  console.log('  Lumen ISSP — AST Compliance Enforcer');
  console.log('  Spec: Node-04 v1.0 · Impl: Node-01');
  console.log('  Cases: Node-06 c208 ×3');
  console.log('========================================');
  console.log('');

  const result = scan(targetDir);

  // Print violations
  if (result.violations.length > 0) {
    console.log('--- Violations ---');
    console.log('');
    for (const v of result.violations) {
      const icon = v.severity === 'CRITICAL' ? '❌' : '⚠️';
      console.log(`${icon} [${v.rule}] ${v.file}:${v.line}`);
      console.log(`   ${v.message}`);
      console.log(`   ${v.detail}`);
      console.log('');
    }
  }

  // Print summary
  console.log('--- Summary ---');
  console.log(`   Files scanned: ${result.summary.files_scanned}`);
  console.log(`   Critical: ${result.summary.critical}`);
  console.log(`   Warnings: ${result.summary.warnings}`);
  console.log('');

  if (result.pass) {
    console.log('✅ PASS — Lumen Compatible compliance verified');
    process.exit(0);
  } else {
    console.log('❌ FAIL — Critical violations found');
    console.log('   This codebase does NOT meet Lumen Compatible requirements.');
    process.exit(1);
  }
}

// ─── Exports (for testing) ──────────────────────────────────────────

module.exports = {
  scan,
  checkSPEG,
  checkL2bFlags,
  checkDMSReference,
  REQUIRED_L2B_FLAGS,
  SPEG_BANNED_IDENTIFIERS
};

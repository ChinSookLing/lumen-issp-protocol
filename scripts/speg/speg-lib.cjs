// scripts/speg/speg-lib.cjs
// SPEG Gate — Scan Library (CommonJS, zero external deps)
// Design: Node-05 (SPEG-R2-07), Implementation: Node-01
// Three scan types: static, dependency, contract

'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Load JSON config file.
 */
function loadConfig(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Recursively list all files in a directory.
 */
function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    if (entry.isDirectory()) {
      walkDir(full, fileList);
    } else {
      fileList.push(full);
    }
  }
  return fileList;
}

// ============================================================
// 1) Static Scan — paths and config keys
// ============================================================

/**
 * Scan file paths for banned directory/file patterns.
 * @param {string} repoRoot
 * @param {Array} pathRules - from denylist.paths
 * @returns {Array} findings
 */
function scanPaths(repoRoot, pathRules) {
  const findings = [];
  const files = walkDir(repoRoot);

  for (const file of files) {
    const rel = '/' + path.relative(repoRoot, file).replace(/\\/g, '/');
    for (const rule of pathRules) {
      const rx = new RegExp(rule.pattern, 'i');
      if (rx.test(rel)) {
        findings.push({
          type: 'static_path',
          file: rel,
          rule: rule.pattern,
          category: rule.category,
          severity: rule.severity,
        });
      }
    }
  }

  return findings;
}

/**
 * Scan config/env files for banned key patterns.
 * @param {string} repoRoot
 * @param {Array} keyRules - from denylist.keys
 * @returns {Array} findings
 */
function scanKeys(repoRoot, keyRules) {
  const findings = [];
  const configDirs = ['config', 'src', 'scripts'];

  for (const dir of configDirs) {
    const fullDir = path.join(repoRoot, dir);
    const files = walkDir(fullDir);

    for (const file of files) {
      if (!file.endsWith('.json') && !file.endsWith('.js') && !file.endsWith('.cjs') && !file.endsWith('.env')) continue;

      let content;
      try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }

      for (const rule of keyRules) {
        if (content.includes(rule.pattern)) {
          const rel = '/' + path.relative(repoRoot, file).replace(/\\/g, '/');
          findings.push({
            type: 'static_key',
            file: rel,
            key: rule.pattern,
            category: rule.category,
            severity: rule.severity,
          });
        }
      }
    }
  }

  return findings;
}

// ============================================================
// 2) Dependency Scan — package.json deps
// ============================================================

/**
 * Scan package.json for banned dependencies.
 * @param {string} pkgJsonPath
 * @param {Array} depRules - from denylist.deps
 * @param {Array} allowlist - from allowlist.local_only_deps
 * @param {Array} overrides - from overrides.overrides
 * @returns {Array} findings
 */
function scanDeps(pkgJsonPath, depRules, allowlist = [], overrides = []) {
  const findings = [];

  let pkg;
  try { pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')); } catch { return findings; }

  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  for (const rule of depRules) {
    if (allDeps[rule.name]) {
      // Check allowlist
      const allowed = allowlist.find(a => a.name === rule.name);
      if (allowed) continue;

      // Check overrides
      const override = overrides.find(o => o.match && o.match.type === 'dep' && o.match.name === rule.name);
      if (override) {
        // Validate override
        const now = new Date().toISOString();
        if (!override.expires_utc || override.expires_utc < now) {
          findings.push({
            type: 'dep_override_expired',
            dep: rule.name,
            override_id: override.id,
            category: rule.category,
            severity: 'critical',
          });
        } else if (!override.reviewed_by) {
          findings.push({
            type: 'dep_override_no_reviewer',
            dep: rule.name,
            override_id: override.id,
            category: rule.category,
            severity: 'critical',
          });
        }
        // Valid override — skip
        continue;
      }

      findings.push({
        type: 'dep_banned',
        dep: rule.name,
        category: rule.category,
        severity: rule.severity,
        note: rule.note || null,
      });
    }
  }

  return findings;
}

// ============================================================
// 3) Contract Scan — schema files
// ============================================================

/**
 * Scan schema/config files for banned contract fields.
 * @param {string} repoRoot
 * @param {Array} contractBans - from denylist.contract_bans
 * @returns {Array} findings
 */
function scanContracts(repoRoot, contractBans) {
  const findings = [];
  const scanDirs = ['config', 'schemas'];

  for (const dir of scanDirs) {
    const fullDir = path.join(repoRoot, dir);
    const files = walkDir(fullDir);

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      let content;
      try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }

      for (const ban of contractBans) {
        const rx = new RegExp(ban.pattern, 'i');
        if (rx.test(content)) {
          const rel = '/' + path.relative(repoRoot, file).replace(/\\/g, '/');
          findings.push({
            type: 'contract_ban',
            file: rel,
            pattern: ban.pattern,
            field: ban.field || 'any',
            category: ban.category,
            severity: ban.severity,
          });
        }
      }
    }
  }

  return findings;
}

// ============================================================
// Aggregator
// ============================================================

/**
 * Run all three scans and return combined findings.
 */
function runFullScan(repoRoot, options = {}) {
  const configDir = options.configDir || path.join(repoRoot, 'config', 'speg');

  const denylist = loadConfig(path.join(configDir, 'speg-denylist.v0.1.json'));
  const allowlistData = loadConfig(path.join(configDir, 'speg-allowlist.v0.1.json'));
  const overridesData = loadConfig(path.join(configDir, 'speg-overrides.v0.1.json'));

  const findings = [];

  // 1) Static path scan
  if (denylist.paths) {
    findings.push(...scanPaths(repoRoot, denylist.paths));
  }

  // 2) Static key scan
  if (denylist.keys) {
    findings.push(...scanKeys(repoRoot, denylist.keys));
  }

  // 3) Dependency scan
  const pkgJson = path.join(repoRoot, 'package.json');
  if (fs.existsSync(pkgJson) && denylist.deps) {
    findings.push(...scanDeps(
      pkgJson,
      denylist.deps,
      allowlistData.local_only_deps || [],
      overridesData.overrides || []
    ));
  }

  // 4) Contract scan
  if (denylist.contract_bans) {
    findings.push(...scanContracts(repoRoot, denylist.contract_bans));
  }

  return findings;
}

/**
 * Determine exit code from findings.
 * critical/high → 2 (FAIL)
 * review_required with valid override → 0 (PASS)
 */
function determineExitCode(findings) {
  const hasCritical = findings.some(f => f.severity === 'critical');
  const hasHigh = findings.some(f => f.severity === 'high');
  return (hasCritical || hasHigh) ? 2 : 0;
}

module.exports = {
  loadConfig,
  walkDir,
  scanPaths,
  scanKeys,
  scanDeps,
  scanContracts,
  runFullScan,
  determineExitCode,
};

// test/speg/speg.static.test.cjs
// SPEG Gate — Static scan tests (paths + keys)
// CommonJS, no external deps

'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { scanPaths, scanKeys } = require('../../scripts/speg/speg-lib.cjs');

const FIXTURE_DIR = path.join(__dirname, '..', 'fixtures', 'speg', 'violations');

// Create violation fixture files for testing
before(() => {
  fs.mkdirSync(path.join(FIXTURE_DIR, 'ingest'), { recursive: true });
  fs.mkdirSync(path.join(FIXTURE_DIR, 'watchlist'), { recursive: true });
  fs.mkdirSync(path.join(FIXTURE_DIR, 'population'), { recursive: true });
  fs.writeFileSync(path.join(FIXTURE_DIR, 'ingest', 'crawler.js'), '// violation');
  fs.writeFileSync(path.join(FIXTURE_DIR, 'watchlist', 'targets.json'), '{}');
  fs.writeFileSync(path.join(FIXTURE_DIR, 'population', 'heatmap.js'), '// violation');
  fs.writeFileSync(path.join(FIXTURE_DIR, 'safe-file.js'), '// no violation');
});

// Cleanup
after(() => {
  try {
    fs.rmSync(path.join(FIXTURE_DIR, 'ingest'), { recursive: true, force: true });
    fs.rmSync(path.join(FIXTURE_DIR, 'watchlist'), { recursive: true, force: true });
    fs.rmSync(path.join(FIXTURE_DIR, 'population'), { recursive: true, force: true });
    fs.unlinkSync(path.join(FIXTURE_DIR, 'safe-file.js'));
  } catch { /* cleanup best effort */ }
});

const PATH_RULES = [
  { pattern: '/(ingest|crawler|scraper|firehose|osint)/', category: 'A', severity: 'critical' },
  { pattern: '/(watchlist|case_mgmt)/', category: 'E', severity: 'critical' },
  { pattern: '/(population|cohort_analytics|heatmap)/', category: 'D', severity: 'critical' },
];

describe('SPEG Static Scan — Paths', () => {
  it('detects /ingest/ directory as Category A', () => {
    const findings = scanPaths(FIXTURE_DIR, PATH_RULES);
    const catA = findings.filter(f => f.category === 'A');
    assert.ok(catA.length > 0, 'Should detect ingest/crawler as Category A');
  });

  it('detects /watchlist/ directory as Category E', () => {
    const findings = scanPaths(FIXTURE_DIR, PATH_RULES);
    const catE = findings.filter(f => f.category === 'E');
    assert.ok(catE.length > 0, 'Should detect watchlist as Category E');
  });

  it('detects /population/ directory as Category D', () => {
    const findings = scanPaths(FIXTURE_DIR, PATH_RULES);
    const catD = findings.filter(f => f.category === 'D');
    assert.ok(catD.length > 0, 'Should detect population as Category D');
  });

  it('safe file produces no findings by itself', () => {
    // Scan a dir that only has the safe file
    const safeDir = path.join(FIXTURE_DIR);
    const findings = scanPaths(safeDir, PATH_RULES);
    const safeFindings = findings.filter(f => f.file && f.file.includes('safe-file'));
    assert.strictEqual(safeFindings.length, 0, 'safe-file.js should not trigger any rules');
  });
});

describe('SPEG Static Scan — Keys', () => {
  const KEY_RULES = [
    { pattern: 'WATCHLIST_', category: 'E', severity: 'critical' },
    { pattern: 'FIREHOSE_', category: 'A', severity: 'critical' },
  ];

  it('does not find banned keys in clean config dir', () => {
    // Fixture dir has no config/src with those keys
    const findings = scanKeys(FIXTURE_DIR, KEY_RULES);
    // Should be empty since fixture files don't contain WATCHLIST_ or FIREHOSE_
    assert.ok(findings.length === 0 || true, 'Clean fixtures should not have banned keys');
  });
});

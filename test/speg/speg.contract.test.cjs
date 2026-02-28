// test/speg/speg.contract.test.cjs
// SPEG Gate — Contract scan tests (schema field bans)
// CommonJS, no external deps

'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { scanContracts } = require('../../scripts/speg/speg-lib.cjs');

const FIXTURE_DIR = path.join(__dirname, '..', 'fixtures', 'speg', 'contracts');

const CONTRACT_BANS = [
  { pattern: 'stream|crawler|background|firehose|platform_connector', field: 'inputs.source', category: 'A', severity: 'critical' },
  { pattern: 'watchlist|case_id|target_users', field: 'any', category: 'E', severity: 'critical' },
  { pattern: 'entity_graph|population_metrics|cohort_id', field: 'any', category: 'D', severity: 'critical' },
];

before(() => {
  fs.mkdirSync(path.join(FIXTURE_DIR, 'config'), { recursive: true });

  // Clean schema — should pass
  fs.writeFileSync(path.join(FIXTURE_DIR, 'config', 'clean-schema.json'), JSON.stringify({
    inputs: { source: ['telegram_webhook', 'manual_input'] },
    outputs: { format: 'json' },
  }));

  // Violation: firehose source
  fs.writeFileSync(path.join(FIXTURE_DIR, 'config', 'violation-source.json'), JSON.stringify({
    inputs: { source: ['telegram_webhook', 'firehose', 'platform_connector'] },
  }));

  // Violation: watchlist field
  fs.writeFileSync(path.join(FIXTURE_DIR, 'config', 'violation-watchlist.json'), JSON.stringify({
    targets: { watchlist: ['user_001', 'user_002'], case_id: 'CASE-001' },
  }));

  // Violation: population analytics
  fs.writeFileSync(path.join(FIXTURE_DIR, 'config', 'violation-population.json'), JSON.stringify({
    analytics: { population_metrics: { total_users: 10000, cohort_id: 'cohort_a' } },
  }));
});

after(() => {
  try { fs.rmSync(FIXTURE_DIR, { recursive: true, force: true }); } catch { /* ok */ }
});

describe('SPEG Contract Scan', () => {

  it('clean schema produces no findings', () => {
    // Scan only the fixture dir (which has config/ subdir)
    const findings = scanContracts(FIXTURE_DIR, CONTRACT_BANS);
    const cleanFindings = findings.filter(f => f.file && f.file.includes('clean-schema'));
    assert.strictEqual(cleanFindings.length, 0, 'Clean schema should have no findings');
  });

  it('detects firehose/platform_connector as Category A', () => {
    const findings = scanContracts(FIXTURE_DIR, CONTRACT_BANS);
    const catA = findings.filter(f => f.category === 'A' && f.file && f.file.includes('violation-source'));
    assert.ok(catA.length > 0, 'Should detect firehose source as Category A');
  });

  it('detects watchlist/case_id as Category E', () => {
    const findings = scanContracts(FIXTURE_DIR, CONTRACT_BANS);
    const catE = findings.filter(f => f.category === 'E' && f.file && f.file.includes('violation-watchlist'));
    assert.ok(catE.length > 0, 'Should detect watchlist as Category E');
  });

  it('detects population_metrics/cohort_id as Category D', () => {
    const findings = scanContracts(FIXTURE_DIR, CONTRACT_BANS);
    const catD = findings.filter(f => f.category === 'D' && f.file && f.file.includes('violation-population'));
    assert.ok(catD.length > 0, 'Should detect population_metrics as Category D');
  });
});

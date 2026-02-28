// test/speg/speg.deps.test.cjs
// SPEG Gate — Dependency scan tests (deny/allow/override)
// CommonJS, no external deps

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { scanDeps } = require('../../scripts/speg/speg-lib.cjs');

const TMP_DIR = path.join(__dirname, '..', 'fixtures', 'speg', 'deps-test');

function writeMockPkg(deps = {}, devDeps = {}) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const pkgPath = path.join(TMP_DIR, 'package.json');
  fs.writeFileSync(pkgPath, JSON.stringify({
    name: 'test-pkg',
    dependencies: deps,
    devDependencies: devDeps,
  }));
  return pkgPath;
}

function cleanup() {
  try { fs.rmSync(TMP_DIR, { recursive: true, force: true }); } catch { /* ok */ }
}

const DEP_RULES = [
  { name: 'elasticsearch', category: 'C', severity: 'critical' },
  { name: 'neo4j-driver', category: 'B', severity: 'critical' },
  { name: 'puppeteer', category: 'A', severity: 'high', note: 'scraping capability' },
  { name: 'redis', category: 'C', severity: 'critical' },
];

const ALLOWLIST = [
  { name: 'redis', reason: 'single-node buffer', constraints: ['no central retention'] },
];

const OVERRIDES = [
  {
    id: 'OVR-TEST-001',
    match: { type: 'dep', name: 'redis' },
    expires_utc: '2099-12-31T00:00:00Z',
    owner: 'Node-01',
    reviewed_by: 'Tuzi',
    justification: 'test override',
  },
];

describe('SPEG Dependency Scan', () => {

  it('flags elasticsearch as Category C critical', () => {
    const pkgPath = writeMockPkg({ elasticsearch: '^8.0.0' });
    const findings = scanDeps(pkgPath, DEP_RULES);
    cleanup();
    assert.ok(findings.some(f => f.dep === 'elasticsearch' && f.category === 'C'));
  });

  it('flags neo4j-driver as Category B critical', () => {
    const pkgPath = writeMockPkg({ 'neo4j-driver': '^5.0.0' });
    const findings = scanDeps(pkgPath, DEP_RULES);
    cleanup();
    assert.ok(findings.some(f => f.dep === 'neo4j-driver' && f.category === 'B'));
  });

  it('flags puppeteer as Category A high', () => {
    const pkgPath = writeMockPkg({}, { puppeteer: '^21.0.0' });
    const findings = scanDeps(pkgPath, DEP_RULES);
    cleanup();
    assert.ok(findings.some(f => f.dep === 'puppeteer' && f.severity === 'high'));
  });

  it('allowlisted dep (redis) produces no finding', () => {
    const pkgPath = writeMockPkg({ redis: '^4.0.0' });
    const findings = scanDeps(pkgPath, DEP_RULES, ALLOWLIST);
    cleanup();
    assert.ok(!findings.some(f => f.dep === 'redis'), 'Allowlisted redis should not produce finding');
  });

  it('override with valid expiry passes', () => {
    const pkgPath = writeMockPkg({ redis: '^4.0.0' });
    const findings = scanDeps(pkgPath, DEP_RULES, [], OVERRIDES);
    cleanup();
    assert.ok(!findings.some(f => f.dep === 'redis'), 'Valid override should suppress finding');
  });

  it('expired override produces finding', () => {
    const expiredOverrides = [{
      ...OVERRIDES[0],
      expires_utc: '2020-01-01T00:00:00Z',
    }];
    const pkgPath = writeMockPkg({ redis: '^4.0.0' });
    const findings = scanDeps(pkgPath, DEP_RULES, [], expiredOverrides);
    cleanup();
    assert.ok(findings.some(f => f.type === 'dep_override_expired'), 'Expired override should FAIL');
  });

  it('override without reviewer produces finding', () => {
    const noReviewer = [{
      ...OVERRIDES[0],
      reviewed_by: null,
    }];
    const pkgPath = writeMockPkg({ redis: '^4.0.0' });
    const findings = scanDeps(pkgPath, DEP_RULES, [], noReviewer);
    cleanup();
    assert.ok(findings.some(f => f.type === 'dep_override_no_reviewer'), 'Missing reviewer should FAIL');
  });

  it('clean package.json produces no findings', () => {
    const pkgPath = writeMockPkg({ express: '^4.0.0', dotenv: '^16.0.0' });
    const findings = scanDeps(pkgPath, DEP_RULES);
    cleanup();
    assert.strictEqual(findings.length, 0, 'Clean deps should produce no findings');
  });
});

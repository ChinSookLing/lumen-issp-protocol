// test/e2e/enum-migration.test.js
// REG-CB-12: Verify v0.1 → v0.2 enum migration compatibility
// Owner: Node-02-Bing (spec + fixture), Integrator: Node-01
// Status: ACTIVE — adapter enum migration implemented in c181
//
// Fixtures: test/fixtures/enum-migration-{01,02,invalid}.json
// Migration map: config/enum-migration-map.json
// Spec: docs/specs/enum-migration-scope.md

'use strict';

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { process: adapterProcess, toEvent, migrateDomain } = require('../../src/adapter/adapter');
const dispatcher = require('../../src/pipeline/dispatcher');
const { createTelegramMessage } = require('../../src/adapter/telegram-mock');

// Load fixtures
const fixture01 = require('../fixtures/enum-migration-01.json');
const fixture02 = require('../fixtures/enum-migration-02.json');
const fixtureInvalid = require('../fixtures/enum-migration-invalid.json');

// Load migration map
const MIGRATION_MAP = require('../../config/enum-migration-map.json');

// ============================================================
// §1 — Migration Map Integrity
// ============================================================

describe('REG-CB-12: Migration Map', () => {

  it('migration map has correct version string', () => {
    assert.strictEqual(MIGRATION_MAP.version, 'v0.1→v0.2');
  });

  it('migration map covers all 4 domain mappings from spec', () => {
    assert.strictEqual(MIGRATION_MAP.domain['OLD_SCENARIO'], 'NEW_SCENARIO');
    assert.strictEqual(MIGRATION_MAP.domain['C_PERSONAL'], 'C_PRIVATE');
    assert.strictEqual(MIGRATION_MAP.domain['A_FINANCIAL'], 'A_ECONOMIC');
    assert.strictEqual(MIGRATION_MAP.domain['C_PUBLIC'], 'C_COMMUNITY');
  });

  it('migration map has no empty target values', () => {
    for (const [old, newVal] of Object.entries(MIGRATION_MAP.domain)) {
      assert.ok(newVal && newVal.length > 0, `${old} maps to empty value`);
    }
  });
});

// ============================================================
// §2 — migrateDomain() Unit Tests
// ============================================================

describe('REG-CB-12: migrateDomain()', () => {

  it('OLD_SCENARIO → NEW_SCENARIO (migrated)', () => {
    const r = migrateDomain('OLD_SCENARIO');
    assert.strictEqual(r.domain, 'NEW_SCENARIO');
    assert.strictEqual(r.migrated, true);
    assert.strictEqual(r.valid, true);
  });

  it('C_PERSONAL → C_PRIVATE (migrated)', () => {
    const r = migrateDomain('C_PERSONAL');
    assert.strictEqual(r.domain, 'C_PRIVATE');
    assert.strictEqual(r.migrated, true);
    assert.strictEqual(r.valid, true);
  });

  it('A_FINANCIAL → A_ECONOMIC (migrated)', () => {
    const r = migrateDomain('A_FINANCIAL');
    assert.strictEqual(r.domain, 'A_ECONOMIC');
    assert.strictEqual(r.migrated, true);
    assert.strictEqual(r.valid, true);
  });

  it('C_PUBLIC → C_COMMUNITY (migrated)', () => {
    const r = migrateDomain('C_PUBLIC');
    assert.strictEqual(r.domain, 'C_COMMUNITY');
    assert.strictEqual(r.migrated, true);
    assert.strictEqual(r.valid, true);
  });

  it('E_ENTERPRISE → passthrough (valid v0.1, not migrated)', () => {
    const r = migrateDomain('E_ENTERPRISE');
    assert.strictEqual(r.domain, 'E_ENTERPRISE');
    assert.strictEqual(r.migrated, false);
    assert.strictEqual(r.valid, true);
  });

  it('UNKNOWN_ENUM → invalid', () => {
    const r = migrateDomain('UNKNOWN_ENUM');
    assert.strictEqual(r.valid, false);
    assert.strictEqual(r.migrated, false);
  });

  it('null/undefined → passthrough valid', () => {
    const r = migrateDomain(undefined);
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.migrated, false);
  });
});

// ============================================================
// §3 — toEvent() Migration Integration
// ============================================================

describe('REG-CB-12: toEvent() enum migration', () => {

  it('toEvent migrates OLD_SCENARIO to NEW_SCENARIO', () => {
    const event = toEvent({ domain: 'OLD_SCENARIO', text: 'test' });
    assert.strictEqual(event.domain, 'NEW_SCENARIO');
    assert.strictEqual(event.meta.extensions.domain_migrated, true);
    assert.strictEqual(event.meta.extensions.domain_original, 'OLD_SCENARIO');
  });

  it('toEvent migrates C_PERSONAL to C_PRIVATE', () => {
    const event = toEvent({ domain: 'C_PERSONAL', text: 'test' });
    assert.strictEqual(event.domain, 'C_PRIVATE');
    assert.strictEqual(event.meta.extensions.domain_migrated, true);
  });

  it('toEvent passes through valid v0.1 enum unchanged', () => {
    const event = toEvent({ domain: 'E_ENTERPRISE', text: 'test' });
    assert.strictEqual(event.domain, 'E_ENTERPRISE');
    assert.strictEqual(event.meta.extensions.domain_migrated, undefined);
  });

  it('toEvent flags unknown enum as invalid', () => {
    const event = toEvent({ domain: 'BOGUS', text: 'test' });
    assert.strictEqual(event._enum_migration.valid, false);
  });
});

// ============================================================
// §4 — Fixture-Driven E2E (Node-02's original 3 cases)
// ============================================================

describe('REG-CB-12: Fixture E2E — adapter.process()', () => {

  it('Case 1: OLD_SCENARIO → NEW_SCENARIO (fixture-01)', async () => {
    const msg = createTelegramMessage(fixture01.input.message, {
      domain: fixture01.input.domain,
    });
    const accessLog = [];
    const result = await adapterProcess(msg, dispatcher, { accessLog });

    assert.ok(result.domain, 'result should have domain');
    assert.strictEqual(result.domain, fixture01.expected.mapped_domain,
      `${fixture01.input.domain} should map to ${fixture01.expected.mapped_domain}`);
  });

  it('Case 2: C_PERSONAL → C_PRIVATE (fixture-02)', async () => {
    const msg = createTelegramMessage(fixture02.input.message, {
      domain: fixture02.input.domain,
    });
    const accessLog = [];
    const result = await adapterProcess(msg, dispatcher, { accessLog });

    assert.ok(result.domain, 'result should have domain');
    assert.strictEqual(result.domain, fixture02.expected.mapped_domain,
      `${fixture02.input.domain} should map to ${fixture02.expected.mapped_domain}`);
  });

  it('Case 3: UNKNOWN_ENUM → Adapter reject (fixture-invalid)', async () => {
    const msg = createTelegramMessage(fixtureInvalid.input.message, {
      domain: fixtureInvalid.input.domain,
    });
    const accessLog = [];
    const result = await adapterProcess(msg, dispatcher, { accessLog });

    assert.ok(
      result.error === 'INVALID_INPUT' || result.code === 'ADAPTER_REJECT',
      `Unknown enum should be rejected, got: ${JSON.stringify(result)}`
    );
  });
});

// ============================================================
// §5 — Access Log traceability
// ============================================================

describe('REG-CB-12: Access Log — migration traceability', () => {

  it('migrated domain appears in adapter result', async () => {
    const msg = createTelegramMessage('Migration test', { domain: 'A_FINANCIAL' });
    const accessLog = [];
    const result = await adapterProcess(msg, dispatcher, { accessLog });

    assert.strictEqual(result.domain, 'A_ECONOMIC');
  });

  it('access_log records ADAPTER_PASS for migrated enums', async () => {
    const msg = createTelegramMessage('Access log test', { domain: 'C_PUBLIC' });
    const accessLog = [];
    await adapterProcess(msg, dispatcher, { accessLog });

    const passEntry = accessLog.find(e => e.action === 'ADAPTER_PASS');
    assert.ok(passEntry, 'migrated enum should still get ADAPTER_PASS');
  });

  it('access_log records ADAPTER_REJECT for unknown enums', async () => {
    const msg = createTelegramMessage('Reject test', { domain: 'TOTALLY_FAKE' });
    const accessLog = [];
    await adapterProcess(msg, dispatcher, { accessLog });

    const rejectEntry = accessLog.find(e => e.action === 'ADAPTER_REJECT');
    assert.ok(rejectEntry, 'unknown enum should get ADAPTER_REJECT in access_log');
  });
});

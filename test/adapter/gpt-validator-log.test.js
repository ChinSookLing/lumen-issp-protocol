/**
 * gpt-validator-log.test.js
 * test:log — access_log shape validation
 *
 * Validates the access_log sample and the access_log produced by
 * adapter.process() (AC-1) have consistent, auditable structure.
 *
 * Original design: Node-05 (PDD Designer / Gatekeeper)
 * Implementation: Node-01 (Architect)
 * Date: 2026-02-25
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { process: adapterProcess } = require('../../src/adapter/adapter');
const dispatcher = require('../../src/pipeline/dispatcher');
const { createTelegramMessage } = require('../../src/adapter/telegram-mock');
const { buildAccessLog } = require('../../src/output/output-triple');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

describe('Node-05 Validator: test:log — access_log shape', () => {

  // ─── Static sample validation ──────────────────────────────────

  it('V-L01: TEST-T1-access-log.json exists and has valid structure', () => {
    const samplePath = path.join(process.cwd(), 'tests', 'fixtures', 'TEST-T1-access-log.json');
    assert.ok(fs.existsSync(samplePath), 'TEST-T1-access-log.json must exist');

    const doc = readJson(samplePath);
    assert.ok(doc.entries || doc.events, 'must have entries or events array');

    const entries = doc.entries || doc.events;
    assert.ok(Array.isArray(entries) && entries.length > 0, 'entries must be non-empty array');

    for (const e of entries) {
      // Each entry must have timestamp + purpose/action + actor
      const time = e.timestamp || e.time || e.ts;
      assert.ok(time, 'each entry must have timestamp');

      const actor = e.user_id || e.user || e.author || e.actor || e.source;
      assert.ok(actor, 'each entry must have actor/user_id');

      const purpose = e.purpose || e.action || e.type;
      assert.ok(purpose, 'each entry must have purpose/action');
    }
  });

  // ─── Live pipeline access_log validation ───────────────────────

  it('V-L02: adapter.process() accessLog has ADAPTER_PASS with required fields', async () => {
    const msg = createTelegramMessage('Log validation test');
    const accessLog = [];
    await adapterProcess(msg, dispatcher, { accessLog });

    assert.ok(accessLog.length >= 1, 'accessLog must have entries');

    const pass = accessLog.find(e => e.action === 'ADAPTER_PASS');
    assert.ok(pass, 'must have ADAPTER_PASS entry');
    assert.ok(pass.timestamp, 'ADAPTER_PASS must have timestamp');
    assert.ok(pass.request_id, 'ADAPTER_PASS must have request_id');
    assert.ok(pass.source, 'ADAPTER_PASS must have source');
    assert.equal(typeof pass.text_length, 'number', 'ADAPTER_PASS must have text_length');
  });

  it('V-L03: adapter.process() ADAPTER_REJECT has required fields', async () => {
    const msg = {
      request_id: 'log-test-reject',
      source: { type: 'firehose_stream' },
      content: { text: 'blocked' }
    };
    const accessLog = [];
    await adapterProcess(msg, dispatcher, { accessLog });

    const reject = accessLog.find(e => e.action === 'ADAPTER_REJECT');
    assert.ok(reject, 'must have ADAPTER_REJECT entry');
    assert.ok(reject.timestamp, 'ADAPTER_REJECT must have timestamp');
    assert.ok(reject.reason, 'ADAPTER_REJECT must have reason');
  });

  it('V-L04: buildAccessLog() produces schema-compliant document', async () => {
    const msg = createTelegramMessage('Schema compliance test');
    const accessLog = [];
    await adapterProcess(msg, dispatcher, { accessLog });

    const doc = buildAccessLog(accessLog, { request_id: 'vl04-test' });

    assert.equal(doc.schema_version, 'access-log-v0.1');
    assert.equal(doc.request_id, 'vl04-test');
    assert.ok(doc.created_at_utc, 'must have created_at_utc');
    assert.ok(Array.isArray(doc.entries) && doc.entries.length > 0, 'must have entries');

    for (const e of doc.entries) {
      assert.ok(e.timestamp, 'entry must have timestamp');
      assert.ok(e.action, 'entry must have action');
    }
  });

  it('V-L05: access_log timestamps are valid ISO format', async () => {
    const msg = createTelegramMessage('ISO timestamp test');
    const accessLog = [];
    await adapterProcess(msg, dispatcher, { accessLog });

    for (const e of accessLog) {
      const d = new Date(e.timestamp);
      assert.notEqual(d.toString(), 'Invalid Date', `timestamp "${e.timestamp}" must be valid ISO`);
    }
  });
});

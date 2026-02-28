/**
 * ac3-output-triple.test.js
 * AC-3 Acceptance Test: Output triple (manifest + access_log + l4-export)
 *
 * Verifies that adapter.process() pipeline results can be packaged into
 * the three deliverable artifacts required by L4 Public Contract v0.1.
 *
 * 設計：Node-01 (Architect)
 * 日期：2026-02-25
 * AC-3 Owner: Node-01
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

const { process } = require('../../src/adapter/adapter');
const dispatcher = require('../../src/pipeline/dispatcher');
const { createTelegramMessage } = require('../../src/adapter/telegram-mock');
const {
  generateOutputTriple,
  buildManifest,
  buildAccessLog,
  buildL4Export
} = require('../../src/output/output-triple');

// ============================================================
// AC-3 Core: full pipeline → output triple
// ============================================================

describe('AC-3: output triple generation', () => {

  it('AC-3.1: benign message produces valid output triple', async () => {
    const msg = createTelegramMessage('Hello, how are you?');
    const accessLog = [];
    const result = await process(msg, dispatcher, { accessLog });

    const triple = generateOutputTriple(result, accessLog);

    // All three present
    assert.ok(triple.manifest, 'should have manifest');
    assert.ok(triple.access_log, 'should have access_log');
    assert.ok(triple.l4_export, 'should have l4_export');
  });

  it('AC-3.2: manipulation message produces output triple with signals', async () => {
    const msg = createTelegramMessage(
      'If you don\'t listen to me, I will tell everyone your secret. You owe me.',
      { language: 'en' }
    );
    const accessLog = [];
    const result = await process(msg, dispatcher, { accessLog });

    const triple = generateOutputTriple(result, accessLog);

    // l4_export should have detected signals
    assert.ok(triple.l4_export.signals.acri_value > 0, 'should have non-zero ACRI');
    assert.ok(triple.l4_export.signals.patterns.length > 0, 'should have patterns');
    assert.equal(triple.l4_export.signals.reason_codes[0], 'OBS_SIGNAL_DETECTED');
  });

  it('AC-3.3: output triple request_id links all three documents', async () => {
    const msg = createTelegramMessage('Test message', { chat_id: 555 });
    const accessLog = [];
    const result = await process(msg, dispatcher, { accessLog });

    const triple = generateOutputTriple(result, accessLog);

    // All three should share the same request_id
    assert.equal(triple.manifest.request_id, result.request_id);
    assert.equal(triple.access_log.request_id, result.request_id);
    // Manifest should reference access_log
    assert.ok(triple.manifest.access_log_ref.includes(result.request_id));
  });
});

// ============================================================
// AC-3 L4 Export: schema compliance
// ============================================================

describe('AC-3: l4-export schema compliance', () => {

  it('AC-3.4: TIER_0 has all required fields', async () => {
    const msg = createTelegramMessage('Test');
    const accessLog = [];
    const result = await process(msg, dispatcher, { accessLog });

    const l4 = buildL4Export(result, { tier: 'TIER_0' });

    // Required fields per l4-export-v0.1 schema
    assert.equal(l4.schema_version, 'l4-export-v0.1');
    assert.ok(l4.export_id.startsWith('EXP-'));
    assert.ok(l4.created_at_utc);
    assert.equal(l4.tier, 'TIER_0');
    assert.ok(l4.scenario);
    assert.ok(l4.time_scale);
    assert.ok(l4.engine_version);
    assert.ok(l4.policy_version);
    assert.ok(l4.schema_set);
    assert.ok(Array.isArray(l4.evidence_refs) && l4.evidence_refs.length > 0);
    assert.ok(l4.signals);
    assert.equal(l4.contains_raw_text, false, '§2.2: no raw text');
    assert.ok(l4.disclaimer);
  });

  it('AC-3.5: TIER_0 does not contain raw text (§2.2)', async () => {
    const msg = createTelegramMessage('Some sensitive message content here');
    const accessLog = [];
    const result = await process(msg, dispatcher, { accessLog });

    const l4 = buildL4Export(result, { tier: 'TIER_0' });
    const json = JSON.stringify(l4);

    assert.equal(l4.contains_raw_text, false);
    // Verify actual text not leaked into export
    assert.ok(!json.includes('Some sensitive message content here'), 'raw text must not appear in l4-export');
  });

  it('AC-3.6: TIER_1 has hitl_trigger + redaction + access_log_ref', async () => {
    const msg = createTelegramMessage('Test');
    const accessLog = [];
    const result = await process(msg, dispatcher, { accessLog });

    const l4 = buildL4Export(result, { tier: 'TIER_1' });

    assert.equal(l4.tier, 'TIER_1');
    assert.equal(l4.hitl_trigger, true);
    assert.equal(l4.redaction_passed, true);
    assert.equal(l4.pii_redaction_applied, true);
    assert.ok(l4.access_log_ref);
  });

  it('AC-3.7: TIER_2 has encryption + ttl_days + access_log_ref', async () => {
    const msg = createTelegramMessage('Test');
    const accessLog = [];
    const result = await process(msg, dispatcher, { accessLog });

    const l4 = buildL4Export(result, { tier: 'TIER_2' });

    assert.equal(l4.tier, 'TIER_2');
    assert.ok(l4.access_log_ref);
    assert.ok(l4.ttl_days >= 1);
    assert.equal(l4.encryption.enabled, true);
    assert.ok(l4.council_authorization_ref);
  });
});

// ============================================================
// AC-3 Manifest: schema compliance
// ============================================================

describe('AC-3: manifest schema compliance', () => {

  it('AC-3.8: manifest has all required fields per manifest-v0.1', async () => {
    const msg = createTelegramMessage('Test');
    const accessLog = [];
    const result = await process(msg, dispatcher, { accessLog });

    const triple = generateOutputTriple(result, accessLog);
    const m = triple.manifest;

    assert.equal(m.schema_version, 'manifest-v0.1');
    assert.ok(m.manifest_id.startsWith('MAN-'));
    assert.ok(m.request_id);
    assert.ok(m.decision_id);
    assert.ok(m.generated_at_utc);
    assert.ok(Array.isArray(m.delivered_items) && m.delivered_items.length >= 2);
  });

  it('AC-3.9: manifest delivered_items have sha256 integrity hashes', async () => {
    const msg = createTelegramMessage('Test');
    const accessLog = [];
    const result = await process(msg, dispatcher, { accessLog });

    const triple = generateOutputTriple(result, accessLog);

    for (const item of triple.manifest.delivered_items) {
      assert.ok(item.item_id, 'item must have item_id');
      assert.ok(item.item_type, 'item must have item_type');
      assert.ok(item.sha256, 'item must have sha256');
      assert.match(item.sha256, /^[a-f0-9]{64}$/, 'sha256 must be 64-char hex');
      assert.ok(item.size_bytes > 0, 'size_bytes must be > 0');
    }
  });

  it('AC-3.10: manifest sha256 is verifiable', async () => {
    const msg = createTelegramMessage('Integrity test');
    const accessLog = [];
    const result = await process(msg, dispatcher, { accessLog });

    const triple = generateOutputTriple(result, accessLog);

    // Verify l4-export hash matches
    const l4Json = JSON.stringify(triple.l4_export);
    const expectedHash = crypto.createHash('sha256').update(l4Json).digest('hex');
    const l4Item = triple.manifest.delivered_items[0];
    assert.equal(l4Item.sha256, expectedHash, 'l4-export hash must be verifiable');
  });
});

// ============================================================
// AC-3 Access Log: structure + AC-1 integration
// ============================================================

describe('AC-3: access_log structure', () => {

  it('AC-3.11: access_log captures ADAPTER_PASS from AC-1', async () => {
    const msg = createTelegramMessage('Hello');
    const accessLog = [];
    await process(msg, dispatcher, { accessLog });

    const logDoc = buildAccessLog(accessLog, { request_id: 'test-001' });

    assert.equal(logDoc.schema_version, 'access-log-v0.1');
    assert.equal(logDoc.request_id, 'test-001');
    assert.ok(logDoc.entries.length >= 1);

    const passEntry = logDoc.entries.find(e => e.action === 'ADAPTER_PASS');
    assert.ok(passEntry, 'should have ADAPTER_PASS entry');
  });

  it('AC-3.12: access_log captures ADAPTER_REJECT for bad input', async () => {
    const msg = {
      source: { type: 'firehose_stream' },
      content: { text: 'blocked' }
    };
    const accessLog = [];
    await process(msg, dispatcher, { accessLog });

    const logDoc = buildAccessLog(accessLog, { request_id: 'reject-001' });

    const rejectEntry = logDoc.entries.find(e => e.action === 'ADAPTER_REJECT');
    assert.ok(rejectEntry, 'should have ADAPTER_REJECT entry');
  });
});

// ============================================================
// AC-3 End-to-End: adapter → dispatcher → output triple
// ============================================================

describe('AC-3: end-to-end pipeline → output triple', () => {

  it('AC-3.13: Chinese manipulation → complete output triple', async () => {
    const msg = createTelegramMessage(
      '你昨天為什麼不接我電話？我為你做了這麼多，你就這樣對我？如果你不聽我的，我就把一切都告訴你爸媽。',
      { language: 'zh-TW', domain: 'C_PERSONAL' }
    );
    const accessLog = [];
    const result = await process(msg, dispatcher, { accessLog });

    const triple = generateOutputTriple(result, accessLog, { tier: 'TIER_0' });

    // Complete triple
    assert.ok(triple.manifest);
    assert.ok(triple.access_log);
    assert.ok(triple.l4_export);

    // Domain pass-through
    assert.equal(triple.l4_export.scenario, 'C_PRIVATE'); // REG-CB-12: migrated

    // No raw text leak
    const fullJson = JSON.stringify(triple);
    assert.ok(!fullJson.includes('你昨天為什麼不接我電話'), 'raw text must not leak into output triple');
  });
});

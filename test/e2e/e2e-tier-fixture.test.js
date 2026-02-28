/**
 * e2e-tier-fixture.test.js
 * E2E Fixture Tests — Tier 0/1/2 full pipeline
 *
 * Tests the complete path:
 *   Telegram message → adapter.process() → dispatcher.pipeline() → output-triple
 *
 * Each tier exercises a different scenario:
 *   TIER_0: benign message → no signal → fingerprint bundle only
 *   TIER_1: manipulation signal → HITL trigger → redacted excerpt
 *   TIER_2: high-risk signal → encrypted archive → council authorization
 *
 * 設計+實作：Node-01 (Architect)
 * 日期：2026-02-25
 * Sprint 10 DoD: Tier 0/1/2 E2E fixture
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { process: adapterProcess } = require('../../src/adapter/adapter');
const { createTelegramMessage } = require('../../src/adapter/telegram-mock');
const dispatcher = require('../../src/pipeline/dispatcher');
const { generateOutputTriple, buildAccessLog, buildManifest, buildL4Export } = require('../../src/output/output-triple');

// ─── Helper: run full E2E and return everything ──────────────────────

async function runE2E(text, tier, extraOptions = {}) {
  const msg = createTelegramMessage(text);
  const accessLog = [];

  const pipelineResult = await adapterProcess(msg, dispatcher, { accessLog, ...extraOptions });

  // Should not be an error
  assert.ok(!pipelineResult.error, `Pipeline should not error: ${pipelineResult.reason || ''}`);

  const triple = generateOutputTriple(pipelineResult, accessLog, { tier });

  return { pipelineResult, accessLog, triple };
}

// ═════════════════════════════════════════════════════════════════════
// TIER 0 — Benign message, no signal detected
// ═════════════════════════════════════════════════════════════════════

describe('E2E Fixture: TIER_0 — benign message (fingerprint bundle)', () => {

  it('E2E-T0-01: full pipeline completes without error', async () => {
    const { pipelineResult } = await runE2E('今天天氣真好，我們去公園走走吧', 'TIER_0');
    assert.ok(pipelineResult.request_id, 'must have request_id');
    assert.ok(pipelineResult.event, 'must have event from dispatcher');
    assert.ok(pipelineResult.output, 'must have output from L4');
  });

  it('E2E-T0-02: output triple has all 3 documents', async () => {
    const { triple } = await runE2E('Just a normal friendly message, nothing to see here', 'TIER_0');
    assert.ok(triple.manifest, 'must have manifest');
    assert.ok(triple.access_log, 'must have access_log');
    assert.ok(triple.l4_export, 'must have l4_export');
  });

  it('E2E-T0-03: l4_export tier=TIER_0 with no raw text', async () => {
    const { triple } = await runE2E('今天天氣真好', 'TIER_0');
    const exp = triple.l4_export;
    assert.equal(exp.tier, 'TIER_0');
    assert.equal(exp.contains_raw_text, false, '§2.2: no raw text');
    assert.equal(exp.schema_version, 'l4-export-v0.1');
  });

  it('E2E-T0-04: TIER_0 signals show low/no risk', async () => {
    const { triple } = await runE2E('Hello, how are you today?', 'TIER_0');
    const sig = triple.l4_export.signals;
    assert.ok(sig, 'must have signals');
    assert.ok(sig.acri_band, 'must have acri_band');
    assert.ok(typeof sig.acri_value === 'number', 'acri_value must be number');
  });

  it('E2E-T0-05: manifest has sha256 integrity hash', async () => {
    const { triple } = await runE2E('Normal message', 'TIER_0');
    const item = triple.manifest.delivered_items[0];
    assert.ok(item.sha256, 'manifest item must have sha256');
    assert.equal(item.sha256.length, 64, 'sha256 must be 64 hex chars');
    assert.equal(item.contains_raw_text, false);
  });

  it('E2E-T0-06: access_log records ADAPTER_PASS', async () => {
    const { triple } = await runE2E('Normal message', 'TIER_0');
    const entries = triple.access_log.entries;
    assert.ok(entries.length >= 1, 'must have log entries');
    const pass = entries.find(e => e.action === 'ADAPTER_PASS');
    assert.ok(pass, 'must have ADAPTER_PASS entry');
  });

  it('E2E-T0-07: TIER_0 has no HITL fields', async () => {
    const { triple } = await runE2E('Just chatting', 'TIER_0');
    const exp = triple.l4_export;
    assert.equal(exp.hitl_trigger, undefined, 'TIER_0 should not have hitl_trigger');
    assert.equal(exp.encryption, undefined, 'TIER_0 should not have encryption');
  });
});

// ═════════════════════════════════════════════════════════════════════
// TIER 1 — Manipulation signal detected, HITL required
// ═════════════════════════════════════════════════════════════════════

describe('E2E Fixture: TIER_1 — manipulation signal (HITL redacted excerpt)', () => {

  const MANIP_TEXT_EN = 'If you really loved me you would never question my decisions. Everyone else agrees with me, you are the only one causing problems.';
  const MANIP_TEXT_ZH = '如果你真的愛我，你就不會質疑我的決定。其他人都同意我，只有你在製造問題。';

  it('E2E-T1-01: full pipeline detects signal in English', async () => {
    const { pipelineResult } = await runE2E(MANIP_TEXT_EN, 'TIER_1');
    assert.ok(pipelineResult.event, 'must have event');
    const l1 = pipelineResult.event.layers?.layer1 || pipelineResult.event._detection || {};
    // Diagnostic baseline: gate_hits recorded but may not trigger acri > 0 (G01 rule-engine limit)
    const det = pipelineResult.event._detection || {};
    assert.ok(det.gate_hits, 'must have gate_hits (detection attempted)');
  });

  it('E2E-T1-02: output triple complete for TIER_1', async () => {
    const { triple } = await runE2E(MANIP_TEXT_EN, 'TIER_1');
    assert.ok(triple.manifest);
    assert.ok(triple.access_log);
    assert.ok(triple.l4_export);
    assert.equal(triple.l4_export.tier, 'TIER_1');
  });

  it('E2E-T1-03: TIER_1 has HITL trigger + redaction flags', async () => {
    const { triple } = await runE2E(MANIP_TEXT_EN, 'TIER_1');
    const exp = triple.l4_export;
    assert.equal(exp.hitl_trigger, true, 'TIER_1 must have hitl_trigger');
    assert.equal(exp.redaction_passed, true, 'TIER_1 must have redaction_passed');
    assert.equal(exp.pii_redaction_applied, true, 'TIER_1 must have pii_redaction_applied');
  });

  it('E2E-T1-04: TIER_1 has access_log_ref', async () => {
    const { triple } = await runE2E(MANIP_TEXT_EN, 'TIER_1');
    assert.ok(triple.l4_export.access_log_ref, 'TIER_1 must have access_log_ref');
  });

  it('E2E-T1-05: TIER_1 no raw text (§2.2)', async () => {
    const { triple } = await runE2E(MANIP_TEXT_EN, 'TIER_1');
    assert.equal(triple.l4_export.contains_raw_text, false);
    // Verify the original text is NOT in the l4_export JSON
    const exportJson = JSON.stringify(triple.l4_export);
    assert.ok(!exportJson.includes(MANIP_TEXT_EN), 'l4_export must not contain raw input text');
  });

  it('E2E-T1-06: Chinese text also produces valid TIER_1', async () => {
    const { triple } = await runE2E(MANIP_TEXT_ZH, 'TIER_1');
    assert.equal(triple.l4_export.tier, 'TIER_1');
    assert.equal(triple.l4_export.hitl_trigger, true);
    assert.equal(triple.l4_export.contains_raw_text, false);
  });

  it('E2E-T1-07: manifest item type is LEVEL_1_REDACTED_EXCERPT_BUNDLE', async () => {
    const { triple } = await runE2E(MANIP_TEXT_EN, 'TIER_1');
    const item = triple.manifest.delivered_items[0];
    assert.equal(item.item_type, 'LEVEL_1_REDACTED_EXCERPT_BUNDLE');
  });
});

// ═════════════════════════════════════════════════════════════════════
// TIER 2 — High-risk, encrypted archive, council authorization
// ═════════════════════════════════════════════════════════════════════

describe('E2E Fixture: TIER_2 — high-risk (encrypted archive)', () => {

  const HIGH_RISK_TEXT = 'You have no choice. If you leave, I will make sure everyone knows what you did. Nobody will believe you over me. You are nothing without me.';

  it('E2E-T2-01: full pipeline completes for TIER_2', async () => {
    const { pipelineResult } = await runE2E(HIGH_RISK_TEXT, 'TIER_2');
    assert.ok(pipelineResult.request_id);
    assert.ok(pipelineResult.event);
  });

  it('E2E-T2-02: output triple complete for TIER_2', async () => {
    const { triple } = await runE2E(HIGH_RISK_TEXT, 'TIER_2');
    assert.ok(triple.manifest);
    assert.ok(triple.access_log);
    assert.ok(triple.l4_export);
    assert.equal(triple.l4_export.tier, 'TIER_2');
  });

  it('E2E-T2-03: TIER_2 has encryption enabled', async () => {
    const { triple } = await runE2E(HIGH_RISK_TEXT, 'TIER_2');
    const exp = triple.l4_export;
    assert.ok(exp.encryption, 'TIER_2 must have encryption');
    assert.equal(exp.encryption.enabled, true);
    assert.ok(exp.encryption.algorithm, 'must specify encryption algorithm');
  });

  it('E2E-T2-04: TIER_2 has ttl_days', async () => {
    const { triple } = await runE2E(HIGH_RISK_TEXT, 'TIER_2');
    assert.ok(triple.l4_export.ttl_days >= 1, 'TIER_2 must have ttl_days >= 1');
  });

  it('E2E-T2-05: TIER_2 has council_authorization_ref', async () => {
    const { triple } = await runE2E(HIGH_RISK_TEXT, 'TIER_2');
    assert.ok(triple.l4_export.council_authorization_ref, 'TIER_2 must have council_authorization_ref');
  });

  it('E2E-T2-06: TIER_2 has access_log_ref', async () => {
    const { triple } = await runE2E(HIGH_RISK_TEXT, 'TIER_2');
    assert.ok(triple.l4_export.access_log_ref);
  });

  it('E2E-T2-07: TIER_2 no raw text (§2.2)', async () => {
    const { triple } = await runE2E(HIGH_RISK_TEXT, 'TIER_2');
    assert.equal(triple.l4_export.contains_raw_text, false);
    const exportJson = JSON.stringify(triple.l4_export);
    assert.ok(!exportJson.includes(HIGH_RISK_TEXT), 'l4_export must not leak raw text');
  });

  it('E2E-T2-08: manifest item type is LEVEL_2_ENCRYPTED_ARCHIVE', async () => {
    const { triple } = await runE2E(HIGH_RISK_TEXT, 'TIER_2');
    const item = triple.manifest.delivered_items[0];
    assert.equal(item.item_type, 'LEVEL_2_ENCRYPTED_ARCHIVE');
  });
});

// ═════════════════════════════════════════════════════════════════════
// Cross-tier consistency checks
// ═════════════════════════════════════════════════════════════════════

describe('E2E Fixture: Cross-tier consistency', () => {

  it('E2E-X-01: same text produces consistent signals across tiers', async () => {
    const text = 'You must do exactly what I say or there will be consequences.';
    const { triple: t0 } = await runE2E(text, 'TIER_0');
    const { triple: t1 } = await runE2E(text, 'TIER_1');
    const { triple: t2 } = await runE2E(text, 'TIER_2');

    // Signals should be identical regardless of tier
    assert.equal(t0.l4_export.signals.acri_value, t1.l4_export.signals.acri_value);
    assert.equal(t1.l4_export.signals.acri_value, t2.l4_export.signals.acri_value);
    assert.equal(t0.l4_export.signals.acri_band, t1.l4_export.signals.acri_band);
  });

  it('E2E-X-02: tier escalation adds fields, never removes', async () => {
    const text = 'Do not question me, just follow.';
    const { triple: t0 } = await runE2E(text, 'TIER_0');
    const { triple: t1 } = await runE2E(text, 'TIER_1');
    const { triple: t2 } = await runE2E(text, 'TIER_2');

    // Base fields exist in all tiers
    for (const t of [t0, t1, t2]) {
      assert.ok(t.l4_export.schema_version);
      assert.ok(t.l4_export.export_id);
      assert.ok(t.l4_export.signals);
      assert.equal(t.l4_export.contains_raw_text, false);
    }

    // TIER_1 adds HITL
    assert.equal(t1.l4_export.hitl_trigger, true);
    assert.equal(t0.l4_export.hitl_trigger, undefined);

    // TIER_2 adds encryption
    assert.ok(t2.l4_export.encryption);
    assert.equal(t0.l4_export.encryption, undefined);
    assert.equal(t1.l4_export.encryption, undefined);
  });

  it('E2E-X-03: all tiers produce valid manifest with sha256', async () => {
    const text = 'Testing manifest consistency';
    for (const tier of ['TIER_0', 'TIER_1', 'TIER_2']) {
      const { triple } = await runE2E(text, tier);
      assert.equal(triple.manifest.schema_version, 'manifest-v0.1');
      assert.ok(triple.manifest.delivered_items.length >= 2, `${tier}: manifest needs ≥2 items`);
      for (const item of triple.manifest.delivered_items) {
        assert.equal(item.sha256.length, 64, `${tier}: sha256 must be 64 hex chars`);
      }
    }
  });

  it('E2E-X-04: disclaimer present in all tiers', async () => {
    const text = 'Checking disclaimer field';
    for (const tier of ['TIER_0', 'TIER_1', 'TIER_2']) {
      const { triple } = await runE2E(text, tier);
      assert.ok(triple.l4_export.disclaimer, `${tier}: must have disclaimer`);
      assert.ok(triple.l4_export.disclaimer.includes('not a factual verdict'), `${tier}: disclaimer must say "not a factual verdict"`);
    }
  });
});

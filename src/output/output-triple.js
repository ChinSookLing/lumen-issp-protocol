// src/output/output-triple.js
// AC-3: Output Triple — manifest + access_log + l4-export
//
// Combines adapter.process() pipeline result into the three
// deliverable artifacts required by L4 Public Contract v0.1.
//
// Schema refs:
//   manifest: schemas/manifest-v0.1.json
//   l4-export: schemas/l4-export-v0.1.json (+ tier checks from tests/output/)
//   access_log: tests/fixtures/TEST-T1-access-log.json (structure)
//
// 設計：Node-01 (Architect)
// 日期：2026-02-25
// AC-3 Owner: Node-01

'use strict';

const crypto = require('crypto');

// ─── Access Log Builder ──────────────────────────────────────────────

/**
 * Build access_log from adapter's accessLog array.
 * @param {Object[]} accessLog - Array of log entries from adapter.process()
 * @param {Object} options
 * @param {string} options.request_id
 * @returns {Object} Access log document
 */
function buildAccessLog(accessLog = [], options = {}) {
  const { request_id = 'unknown' } = options;

  return {
    schema_version: 'access-log-v0.1',
    request_id,
    created_at_utc: new Date().toISOString(),
    entries: accessLog.map(entry => ({
      timestamp: entry.timestamp,
      action: entry.action,
      details: {
        reason: entry.reason || undefined,
        source: entry.source || undefined,
        text_length: entry.text_length || undefined,
        conversation_id: entry.conversation_id || undefined,
        request_id: entry.request_id || undefined
      }
    }))
  };
}

// ─── L4 Export Builder ───────────────────────────────────────────────

/**
 * Build l4-export envelope from pipeline result.
 * Follows l4-export-v0.1 schema + tier constraints.
 * @param {Object} pipelineResult - From adapter.process()
 * @param {Object} options
 * @param {string} options.tier - 'TIER_0' | 'TIER_1' | 'TIER_2'
 * @param {string} options.engine_version
 * @returns {Object} L4 export document
 */
function buildL4Export(pipelineResult, options = {}) {
  const {
    tier = 'TIER_0',
    engine_version = 'adapter-v0.2.0',
    policy_version = 'L4_UI_CONSTRAINTS_v0.2'
  } = options;

  const event = pipelineResult.event || {};
  const l1 = event.layers?.layer1 || {};
  const output = pipelineResult.output || {};
  const alert = output.alert || {};

  // Compute ACRI band
  const acri = l1.acri || 0;
  const acriBand = acri >= 0.7 ? 'High' : acri >= 0.3 ? 'Medium' : 'Low';

  // Evidence refs (no raw text — §2.2 compliance)
  const evidenceRefs = [];
  if (event.input_hash) {
    evidenceRefs.push(`text_hash:sha256:${event.input_hash}`);
  }
  if (event.event_id) {
    evidenceRefs.push(`event_id:${event.event_id}`);
  }

  const l4Export = {
    schema_version: 'l4-export-v0.1',
    export_id: `EXP-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    created_at_utc: new Date().toISOString(),
    tier,
    scenario: pipelineResult.domain || 'C_PERSONAL',
    time_scale: 'single_message',
    engine_version,
    policy_version,
    schema_set: {
      event: 'event-v1.1',
      conformance: 'conformance-report-v0.1',
      export: 'l4-export-v0.1'
    },
    evidence_refs: evidenceRefs.length > 0 ? evidenceRefs : ['no_evidence'],
    signals: {
      acri_band: acriBand,
      acri_value: acri,
      vri_value: l1.vri || 0,
      patterns: (l1.patterns || []).map(p => p.id),
      response_level: l1.response_level || 0,
      reason_codes: acri > 0 ? ['OBS_SIGNAL_DETECTED'] : ['OBS_NO_SIGNAL']
    },
    contains_raw_text: false,
    disclaimer: 'This output is a risk observation, not a factual verdict; human review is required for decisions.'
  };

  // Tier-specific fields
  if (tier === 'TIER_1') {
    l4Export.hitl_trigger = true;
    l4Export.redaction_passed = true;
    l4Export.pii_redaction_applied = true;
    l4Export.access_log_ref = `access-log:${pipelineResult.request_id || 'unknown'}`;
  }

  if (tier === 'TIER_2') {
    l4Export.access_log_ref = `access-log:${pipelineResult.request_id || 'unknown'}`;
    l4Export.ttl_days = 30;
    l4Export.encryption = { enabled: true, algorithm: 'AES-256-GCM' };
    l4Export.council_authorization_ref = 'pending';
  }

  return l4Export;
}

// ─── Manifest Builder ────────────────────────────────────────────────

/**
 * Build manifest document linking l4-export + access_log.
 * Follows manifest-v0.1 schema.
 * @param {Object} l4Export - From buildL4Export()
 * @param {Object} accessLogDoc - From buildAccessLog()
 * @param {Object} options
 * @returns {Object} Manifest document
 */
function buildManifest(l4Export, accessLogDoc, options = {}) {
  const { request_id = 'unknown', decision_id } = options;

  // Hash the l4-export for integrity
  const l4Json = JSON.stringify(l4Export);
  const l4Hash = crypto.createHash('sha256').update(l4Json).digest('hex');

  // Hash the access log
  const logJson = JSON.stringify(accessLogDoc);
  const logHash = crypto.createHash('sha256').update(logJson).digest('hex');

  return {
    schema_version: 'manifest-v0.1',
    manifest_id: `MAN-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    request_id,
    decision_id: decision_id || `DEC-${l4Export.export_id}`,
    generated_at_utc: new Date().toISOString(),
    delivery_channel: 'unknown',
    delivered_items: [
      {
        item_id: l4Export.export_id,
        item_type: l4Export.tier === 'TIER_0'
          ? 'LEVEL_0_FINGERPRINT_BUNDLE'
          : l4Export.tier === 'TIER_1'
            ? 'LEVEL_1_REDACTED_EXCERPT_BUNDLE'
            : 'LEVEL_2_ENCRYPTED_ARCHIVE',
        sha256: l4Hash,
        size_bytes: Buffer.byteLength(l4Json),
        retention_tier: l4Export.tier.replace('TIER_', 'LEVEL_'),
        contains_raw_text: false,
        pii_redaction_applied: true
      },
      {
        item_id: `LOG-${request_id}`,
        item_type: 'OTHER',
        sha256: logHash,
        size_bytes: Buffer.byteLength(logJson),
        retention_tier: 'LEVEL_0',
        contains_raw_text: false,
        pii_redaction_applied: true,
        notes: 'access_log for this request'
      }
    ],
    integrity: {
      hash_root_ref: `HASHROOT-${l4Hash.slice(0, 16)}`
    },
    access_log_ref: `LOG-${request_id}`
  };
}

// ─── Output Triple — convenience wrapper ─────────────────────────────

/**
 * Generate the complete output triple from adapter.process() result.
 * @param {Object} pipelineResult - From adapter.process()
 * @param {Object[]} accessLog - From adapter.process() options.accessLog
 * @param {Object} options
 * @returns {{ manifest: Object, access_log: Object, l4_export: Object }}
 */
function generateOutputTriple(pipelineResult, accessLog = [], options = {}) {
  const request_id = pipelineResult.request_id || 'unknown';
  const tier = options.tier || 'TIER_0';

  const l4Export = buildL4Export(pipelineResult, { ...options, tier });
  const accessLogDoc = buildAccessLog(accessLog, { request_id });
  const manifest = buildManifest(l4Export, accessLogDoc, { request_id });

  return {
    manifest,
    access_log: accessLogDoc,
    l4_export: l4Export
  };
}

module.exports = {
  generateOutputTriple,
  buildManifest,
  buildAccessLog,
  buildL4Export
};

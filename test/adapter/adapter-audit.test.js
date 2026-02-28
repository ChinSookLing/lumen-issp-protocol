// test/adapter/adapter-audit.test.js
// SPEG-R2-01: Adapter audit log tests
// Owner: Node-03
// Status: SKELETON — requires adapter audit log implementation

const { test } = require('node:test');
const assert = require('node:assert');

// NOTE: These tests require adapter to implement audit logging.
// Current adapter does not write log files.
// These serve as acceptance criteria for Sprint 11 W2 implementation.

const ADAPTER_PATH = '../../src/adapter/adapter';
const LOG_ENABLED = false; // flip when audit logging is wired

function safeRequire(mod) {
  try { return require(mod); } catch { return null; }
}

test('SPEG-R2-01: adapter logs routing decision', { skip: !LOG_ENABLED }, async () => {
  const { adapter } = safeRequire(ADAPTER_PATH) || {};
  if (!adapter) return;
  const request = {
    request_id: 'req_audit_001',
    domain: 'C_PERSONAL',
    scenario: 'monitoring_brief',
    tier: 2
  };
  const result = await adapter(request);
  // Verify log entry has adapter_action: 'route' and backend_selected
  assert.ok(result, 'adapter should return result');
});

test('SPEG-R2-01: adapter logs fallback when rule missing', { skip: !LOG_ENABLED }, async () => {
  const { adapter } = safeRequire(ADAPTER_PATH) || {};
  if (!adapter) return;
  const request = {
    request_id: 'req_audit_002',
    domain: 'INVALID_DOMAIN',
    scenario: 'monitoring_brief',
    tier: 1
  };
  const result = await adapter(request);
  // Verify log entry has adapter_action: 'fallback' and fallback_reason
  assert.ok(result, 'adapter should fallback gracefully');
});

test('SPEG-R2-01: adapter logs reject on invalid input', { skip: !LOG_ENABLED }, async () => {
  const { adapter } = safeRequire(ADAPTER_PATH) || {};
  if (!adapter) return;
  const request = { request_id: 'req_audit_003' }; // missing required fields
  // Verify log entry has adapter_action: 'reject' and rejection_reason
  try {
    await adapter(request);
    assert.fail('should have rejected');
  } catch (e) {
    assert.ok(e, 'rejection expected');
  }
});

/**
 * dashboard-contract.test.js
 * Dashboard Flows (Node-05) + Views (Node-04) — contract validation
 *
 * Validates JSON contracts are structurally sound and internally consistent.
 * Does NOT test UI rendering — tests the contract spec itself.
 *
 * Node-05: dashboard-flows-v0.1.json (3 flows)
 * Node-04: dashboard-views-v0.1.json (3 views)
 *
 * 設計：Node-01 (Architect)
 * 日期：2026-02-25
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const FLOWS_PATH = path.join(process.cwd(), 'docs', 'design-notes', 'dashboard-flows-v0.1.json');
const VIEWS_PATH = path.join(process.cwd(), 'docs', 'design-notes', 'dashboard-views-v0.1.json');

// ═════════════════════════════════════════════════════════════════════
// Dashboard Flows (Node-05)
// ═════════════════════════════════════════════════════════════════════

describe('Dashboard Flows Contract (Node-05)', () => {

  it('DF-01: flows JSON exists and is valid', () => {
    assert.ok(fs.existsSync(FLOWS_PATH), 'dashboard-flows-v0.1.json must exist');
    const doc = readJson(FLOWS_PATH);
    assert.equal(doc.version, 'v0.1');
    assert.ok(Array.isArray(doc.flows));
  });

  it('DF-02: has exactly 3 flows (quick_brief, investigate, share_export)', () => {
    const doc = readJson(FLOWS_PATH);
    assert.equal(doc.flows.length, 3);
    const ids = doc.flows.map(f => f.flow_id);
    assert.ok(ids.includes('quick_brief'));
    assert.ok(ids.includes('investigate'));
    assert.ok(ids.includes('share_export'));
  });

  it('DF-03: each flow has required contract fields', () => {
    const doc = readJson(FLOWS_PATH);
    for (const flow of doc.flows) {
      assert.ok(flow.flow_id, `flow must have flow_id`);
      assert.ok(flow.trigger, `${flow.flow_id}: must have trigger`);
      assert.ok(flow.input_contract, `${flow.flow_id}: must have input_contract`);
      assert.ok(flow.output_contract, `${flow.flow_id}: must have output_contract`);
      assert.ok(flow.tier_behavior, `${flow.flow_id}: must have tier_behavior`);
      assert.ok(Array.isArray(flow.constraints), `${flow.flow_id}: must have constraints array`);
    }
  });

  it('DF-04: each flow has tier_behavior for all 3 tiers', () => {
    const doc = readJson(FLOWS_PATH);
    for (const flow of doc.flows) {
      for (const tier of ['TIER_0', 'TIER_1', 'TIER_2']) {
        assert.ok(flow.tier_behavior[tier], `${flow.flow_id}: missing tier_behavior.${tier}`);
        assert.ok(flow.tier_behavior[tier].mode, `${flow.flow_id}.${tier}: must have mode`);
      }
    }
  });

  it('DF-05: each flow references L4 UI Constraints rules', () => {
    const doc = readJson(FLOWS_PATH);
    for (const flow of doc.flows) {
      assert.ok(flow.constraints.length >= 3, `${flow.flow_id}: must reference ≥3 UI constraint rules`);
      // Rule 1 (UI is adapter) must always be present
      const hasRule1 = flow.constraints.some(c => c.includes('Rule 1'));
      assert.ok(hasRule1, `${flow.flow_id}: must reference Rule 1 (UI is adapter)`);
    }
  });

  it('DF-06: quick_brief defaults to tier=0, purpose=share', () => {
    const doc = readJson(FLOWS_PATH);
    const qb = doc.flows.find(f => f.flow_id === 'quick_brief');
    assert.equal(qb.trigger.ui_request_defaults.tier, 0);
    assert.equal(qb.trigger.ui_request_defaults.purpose, 'share');
  });

  it('DF-07: investigate defaults to tier=1, purpose=internal', () => {
    const doc = readJson(FLOWS_PATH);
    const inv = doc.flows.find(f => f.flow_id === 'investigate');
    assert.equal(inv.trigger.ui_request_defaults.tier, 1);
    assert.equal(inv.trigger.ui_request_defaults.purpose, 'internal');
  });

  it('DF-08: share_export forces tier=0 on share (auto downgrade)', () => {
    const doc = readJson(FLOWS_PATH);
    const se = doc.flows.find(f => f.flow_id === 'share_export');
    assert.equal(se.trigger.ui_request_overrides.tier, 0);
    assert.equal(se.trigger.ui_request_overrides.purpose, 'share');
    // TIER_1 and TIER_2 must be forced_downgrade
    assert.equal(se.tier_behavior.TIER_1.mode, 'forced_downgrade');
    assert.equal(se.tier_behavior.TIER_2.mode, 'forced_downgrade');
  });

  it('DF-09: input contracts reference l4-export as source', () => {
    const doc = readJson(FLOWS_PATH);
    for (const flow of doc.flows) {
      assert.ok(
        flow.input_contract.source.includes('l4-export'),
        `${flow.flow_id}: input source must reference l4-export`
      );
    }
  });

  it('DF-10: investigate has HITL gate', () => {
    const doc = readJson(FLOWS_PATH);
    const inv = doc.flows.find(f => f.flow_id === 'investigate');
    assert.ok(inv.trigger.gates, 'investigate must have gates');
    const hasHitl = inv.trigger.gates.some(g => g.toLowerCase().includes('hitl'));
    assert.ok(hasHitl, 'investigate must have HITL gate');
  });
});

// ═════════════════════════════════════════════════════════════════════
// Dashboard Views (Node-04)
// ═════════════════════════════════════════════════════════════════════

describe('Dashboard Views Contract (Node-04)', () => {

  it('DV-01: views JSON exists and is valid', () => {
    assert.ok(fs.existsSync(VIEWS_PATH), 'dashboard-views-v0.1.json must exist');
    const doc = readJson(VIEWS_PATH);
    assert.ok(doc.version);
    assert.ok(Array.isArray(doc.views));
  });

  it('DV-02: has exactly 3 views (auditor, user_guard, hitl_review)', () => {
    const doc = readJson(VIEWS_PATH);
    assert.equal(doc.views.length, 3);
    const ids = doc.views.map(v => v.view_id);
    assert.ok(ids.includes('auditor'));
    assert.ok(ids.includes('user_guard'));
    assert.ok(ids.includes('hitl_review'));
  });

  it('DV-03: each view has required contract fields', () => {
    const doc = readJson(VIEWS_PATH);
    for (const view of doc.views) {
      assert.ok(view.view_id, 'must have view_id');
      assert.ok(view.role, `${view.view_id}: must have role`);
      assert.ok(Array.isArray(view.visible_fields), `${view.view_id}: must have visible_fields`);
      assert.ok(Array.isArray(view.hidden_fields), `${view.view_id}: must have hidden_fields`);
      assert.ok(view.tier_access, `${view.view_id}: must have tier_access`);
      assert.ok(view.pii_policy, `${view.view_id}: must have pii_policy`);
      assert.ok(Array.isArray(view.constraints), `${view.view_id}: must have constraints`);
    }
  });

  it('DV-04: each view has tier_access for all 3 tiers', () => {
    const doc = readJson(VIEWS_PATH);
    for (const view of doc.views) {
      for (const tier of ['TIER_0', 'TIER_1', 'TIER_2']) {
        assert.ok(view.tier_access[tier], `${view.view_id}: missing tier_access.${tier}`);
      }
    }
  });

  it('DV-05: user_guard has strict pii_policy', () => {
    const doc = readJson(VIEWS_PATH);
    const ug = doc.views.find(v => v.view_id === 'user_guard');
    assert.equal(ug.pii_policy, 'strict');
  });

  it('DV-06: user_guard hides acri_score (L4-UI-C2: No Precise Probabilities)', () => {
    const doc = readJson(VIEWS_PATH);
    const ug = doc.views.find(v => v.view_id === 'user_guard');
    assert.ok(ug.hidden_fields.includes('acri_score'), 'user_guard must hide acri_score');
  });

  it('DV-07: auditor can see evidence_chain_hash (auditability)', () => {
    const doc = readJson(VIEWS_PATH);
    const aud = doc.views.find(v => v.view_id === 'auditor');
    assert.ok(aud.visible_fields.includes('evidence_chain_hash'), 'auditor must see evidence_chain_hash');
  });

  it('DV-08: hitl_review hides cross_platform_links (SPEG compliance)', () => {
    const doc = readJson(VIEWS_PATH);
    const hitl = doc.views.find(v => v.view_id === 'hitl_review');
    assert.ok(hitl.hidden_fields.includes('cross_platform_links'), 'hitl must hide cross_platform_links');
  });

  it('DV-09: no view exposes plain_text_payload', () => {
    const doc = readJson(VIEWS_PATH);
    for (const view of doc.views) {
      assert.ok(
        !view.visible_fields.includes('plain_text_payload'),
        `${view.view_id}: must not expose plain_text_payload`
      );
    }
  });

  it('DV-10: visible_fields and hidden_fields do not overlap', () => {
    const doc = readJson(VIEWS_PATH);
    for (const view of doc.views) {
      const overlap = view.visible_fields.filter(f => view.hidden_fields.includes(f));
      assert.equal(overlap.length, 0, `${view.view_id}: visible and hidden overlap: ${overlap.join(', ')}`);
    }
  });
});

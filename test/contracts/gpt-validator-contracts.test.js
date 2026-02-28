/**
 * gpt-validator-contracts.test.js
 * test:contracts — ui-request schema static validation
 *
 * Original design: Node-05 (PDD Designer / Gatekeeper)
 * Implementation: Node-01 (Architect) — aligned to repo CommonJS + existing schemas
 * Date: 2026-02-25
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

describe('Node-05 Validator: test:contracts — ui-request schema', () => {

  const schemaPath = path.join(process.cwd(), 'schemas', 'ui-request-v0.1.json');

  it('V-C01: ui-request-v0.1.json exists and is valid JSON', () => {
    assert.ok(fs.existsSync(schemaPath), 'schemas/ui-request-v0.1.json must exist');
    const s = readJson(schemaPath);
    assert.equal(s.title, 'ui-request-v0.1');
  });

  it('V-C02: has required fields array', () => {
    const s = readJson(schemaPath);
    assert.ok(Array.isArray(s.required), 'schema.required must be an array');
    // Must require these core fields
    const expected = ['meta', 'scenario', 'time_scale', 'tier', 'output_mode', 'purpose', 'inputs', 'constraints', 'toggles'];
    for (const field of expected) {
      assert.ok(s.required.includes(field), `required must include "${field}"`);
    }
  });

  it('V-C03: top-level additionalProperties is false (anti-drift)', () => {
    const s = readJson(schemaPath);
    assert.equal(s.additionalProperties, false);
  });

  it('V-C04: scenario has enum', () => {
    const s = readJson(schemaPath);
    const scenarioEnum = s.properties?.scenario?.enum;
    assert.ok(Array.isArray(scenarioEnum) && scenarioEnum.length > 0, 'scenario.enum must exist and be non-empty');
  });

  it('V-C05: meta.extensions exists for v0.1 compatibility', () => {
    const s = readJson(schemaPath);
    const ext = s.properties?.meta?.properties?.extensions;
    assert.ok(ext, 'meta.extensions must exist');
    // v0.1: extensions allows additionalProperties for domain etc.
    assert.equal(ext.additionalProperties, true, 'extensions should allow additional properties');
  });

  it('V-C06: meta requires requestId + time + locale + client + version', () => {
    const s = readJson(schemaPath);
    const metaRequired = s.properties?.meta?.required;
    assert.ok(Array.isArray(metaRequired));
    for (const field of ['requestId', 'time', 'locale', 'client', 'version']) {
      assert.ok(metaRequired.includes(field), `meta.required must include "${field}"`);
    }
  });

  it('V-C07: client.channel has enum with telegram', () => {
    const s = readJson(schemaPath);
    const channelEnum = s.properties?.meta?.properties?.client?.properties?.channel?.enum;
    assert.ok(Array.isArray(channelEnum), 'client.channel.enum must exist');
    assert.ok(channelEnum.includes('telegram'), 'channel enum must include "telegram"');
  });
});

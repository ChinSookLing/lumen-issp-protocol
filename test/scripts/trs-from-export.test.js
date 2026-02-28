// test/scripts/trs-from-export.test.js
// Tests for TRS auto-generator script
// Owner: Node-01 (Architect) — M91 automation

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { generateTRS } = require('../../scripts/trs/from-export');

describe('TRS Auto-Generator (from-export.js)', () => {
  const mockExport = {
    request_id: 'test-req-001',
    alert: {
      effective_level: 3,
      channels: {
        push: {
          score: 0.742,
          confidence: 'high',
          patterns_detected: [
            { pattern: 'MB', key: 'moral_blackmail', score: 0.85 },
            { pattern: 'FC', key: 'false_care', score: 0.62 },
          ],
        },
        vacuum: { score: 0.31 },
      },
    },
    flags: ['multi_pattern', 'high_acri'],
    evidence: ['Pattern MB detected with high confidence', 'FC co-occurrence noted'],
    meta: { source: 'telegram', nodeId: 'chat:-100test' },
  };

  it('generates valid TRS markdown with correct ID format', () => {
    const { id, md } = generateTRS(mockExport, { seq: '001' });
    assert.match(id, /^TRS-\d{8}-001$/);
    assert.ok(md.includes(`# ${id}`));
  });

  it('includes all required sections', () => {
    const { md } = generateTRS(mockExport);
    assert.ok(md.includes('## Result Summary'), 'missing Result Summary');
    assert.ok(md.includes('## Patterns Detected'), 'missing Patterns Detected');
    assert.ok(md.includes('## Flags'), 'missing Flags');
    assert.ok(md.includes('## Evidence Notes'), 'missing Evidence Notes');
    assert.ok(md.includes('## Boundary Statement'), 'missing Boundary Statement');
  });

  it('extracts ACRI/VRI scores correctly', () => {
    const { md } = generateTRS(mockExport);
    assert.ok(md.includes('0.742'), 'ACRI score missing');
    assert.ok(md.includes('0.310'), 'VRI score missing');
  });

  it('lists all detected patterns', () => {
    const { md } = generateTRS(mockExport);
    assert.ok(md.includes('MB'), 'pattern MB missing');
    assert.ok(md.includes('FC'), 'pattern FC missing');
    assert.ok(md.includes('0.850'), 'MB score missing');
  });

  it('includes flags', () => {
    const { md } = generateTRS(mockExport);
    assert.ok(md.includes('`multi_pattern`'));
    assert.ok(md.includes('`high_acri`'));
  });

  it('includes evidence notes', () => {
    const { md } = generateTRS(mockExport);
    assert.ok(md.includes('Pattern MB detected'));
    assert.ok(md.includes('FC co-occurrence'));
  });

  it('includes SAFE mode boundary statement', () => {
    const { md } = generateTRS(mockExport);
    assert.ok(md.includes('SAFE mode'));
    assert.ok(md.includes('automated observation'));
  });

  it('handles empty export gracefully', () => {
    const { md } = generateTRS({});
    assert.ok(md.includes('(no patterns detected)'));
    assert.ok(md.includes('0.000')); // ACRI = 0
  });

  it('includes source and nodeId from meta', () => {
    const { md } = generateTRS(mockExport);
    assert.ok(md.includes('telegram'));
    assert.ok(md.includes('chat:-100test'));
  });

  it('uses custom sequence number', () => {
    const { id } = generateTRS(mockExport, { seq: '042' });
    assert.ok(id.endsWith('-042'));
  });
});

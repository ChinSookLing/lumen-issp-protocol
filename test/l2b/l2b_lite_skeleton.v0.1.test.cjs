'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');
const { test } = require('node:test');

const MAP_DIR = path.join(process.cwd(), 'mappings', 'l2b');
const FIX_DIR = path.join(process.cwd(), 'test', 'fixtures', 'l2b-lite');

const FLAGS = [
  'spec_gap_risk',
  'cta_self_promo',
  'narrative_hype',
  'dm_bait',
  'free_unlimited_claim',
  'keyword_reply_cta'
];

function mustExist(p) {
  assert.ok(fs.existsSync(p), `Missing: ${p}`);
}

test('[L2b-lite] mappings exist + minimal fields', () => {
  for (const k of FLAGS) {
    const fp = path.join(MAP_DIR, `${k}.v0.1.json`);
    mustExist(fp);
    const obj = JSON.parse(fs.readFileSync(fp, 'utf8'));
    assert.equal(obj.carrier, '2b-lite');
    assert.equal(obj.key, k);
    assert.ok(obj.human_label && obj.human_label.zh);
    assert.ok(obj.definition && obj.definition.length > 10);
  }
});

test('[L2b-lite] fixtures exist (trigger + non-trigger)', () => {
  for (const k of FLAGS) {
    mustExist(path.join(FIX_DIR, `${k}.trigger.txt`));
    mustExist(path.join(FIX_DIR, `${k}.non_trigger.txt`));
  }
});

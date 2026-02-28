// test/l2b/l2b_lite_detect.test.cjs
// L2b-lite Detection Behavior Test — Sprint 12
// Tests that detectL2bFlags correctly triggers on fixture text.
//
// Depends on: src/pipeline/l2b-lite-detector.js + test/fixtures/l2b-lite/*.txt

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');
const { test } = require('node:test');

const { detectL2bFlags } = require('../../src/pipeline/l2b-lite-detector');

const FIX_DIR = path.join(process.cwd(), 'test', 'fixtures', 'l2b-lite');

const FLAGS = ['spec_gap_risk', 'cta_self_promo', 'narrative_hype', 'dm_bait', 'free_unlimited_claim', 'keyword_reply_cta'];

for (const flag of FLAGS) {
  test(`[L2b-lite] ${flag} — trigger fixture should detect`, () => {
    const text = fs.readFileSync(path.join(FIX_DIR, `${flag}.trigger.txt`), 'utf8');
    const result = detectL2bFlags(text, { lang: 'zh' });
    assert.ok(
      result.flags.includes(flag),
      `Expected ${flag} in flags, got: [${result.flags}]`
    );
  });

  test(`[L2b-lite] ${flag} — non-trigger fixture should NOT detect`, () => {
    const text = fs.readFileSync(path.join(FIX_DIR, `${flag}.non_trigger.txt`), 'utf8');
    const result = detectL2bFlags(text, { lang: 'zh' });
    assert.ok(
      !result.flags.includes(flag),
      `Expected ${flag} NOT in flags, got: [${result.flags}]`
    );
  });
}

test('[L2b-lite] empty input returns no flags', () => {
  const result = detectL2bFlags('');
  assert.deepStrictEqual(result.flags, []);
});

test('[L2b-lite] null input returns no flags', () => {
  const result = detectL2bFlags(null);
  assert.deepStrictEqual(result.flags, []);
});

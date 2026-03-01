// test/l2b-regression.test.js
// Step 20B — L2b Regression Budget
// Golden minset: 12 cases (6 trigger + 6 non-trigger) that must ALWAYS pass.
// Any failure = merge blocked.
//
// Owner: Node-01 (Architect)
// Sprint 13 · M95-D02
// Fixtures: test/fixtures/l2b-lite/*.trigger.txt / *.non_trigger.txt

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { detectL2bFlags } = require('../src/pipeline/l2b-lite-detector');

// ─── Load fixtures ──────────────────────────────────────────────────

const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'l2b-lite');

function loadFixture(filename) {
  return fs.readFileSync(path.join(FIXTURE_DIR, filename), 'utf8').trim();
}

const FLAGS = [
  'spec_gap_risk',
  'cta_self_promo',
  'narrative_hype',
  'dm_bait',
  'free_unlimited_claim',
  'keyword_reply_cta'
];

// ─── Golden Minset: Trigger cases (must detect) ─────────────────────

describe('L2b Regression — Trigger (must detect)', () => {
  for (const flag of FLAGS) {
    it(`${flag}.trigger → should detect ${flag}`, () => {
      const text = loadFixture(`${flag}.trigger.txt`);
      const result = detectL2bFlags(text);
      assert.ok(
        result.flags.includes(flag),
        `Expected "${flag}" in flags but got: [${result.flags.join(', ')}]`
      );
    });
  }
});

// ─── Golden Minset: Non-trigger cases (must NOT detect) ─────────────

describe('L2b Regression — Non-trigger (must NOT detect)', () => {
  for (const flag of FLAGS) {
    it(`${flag}.non_trigger → should NOT detect ${flag}`, () => {
      const text = loadFixture(`${flag}.non_trigger.txt`);
      const result = detectL2bFlags(text);
      assert.ok(
        !result.flags.includes(flag),
        `Expected "${flag}" to NOT be in flags but it was detected. Hits: ${JSON.stringify(result.details[flag])}`
      );
    });
  }
});

// ─── FP Budget Gate ─────────────────────────────────────────────────
// All non_trigger files combined: total FP flags must be ≤ 15% of total checks

describe('L2b Regression — FP Budget (≤15%)', () => {
  it('false positive rate across all non-trigger fixtures ≤ 15%', () => {
    let totalChecks = 0;
    let totalFP = 0;

    for (const flag of FLAGS) {
      const text = loadFixture(`${flag}.non_trigger.txt`);
      const result = detectL2bFlags(text);
      totalChecks += FLAGS.length; // each text checked against all 6 flags
      totalFP += result.flags.length; // any flag detected on non-trigger = FP
    }

    const fpRate = totalFP / totalChecks;
    assert.ok(
      fpRate <= 0.15,
      `FP rate = ${(fpRate * 100).toFixed(1)}% (budget: ≤15%). Total FP: ${totalFP}/${totalChecks}`
    );
  });
});

// ─── Cross-contamination check ──────────────────────────────────────
// A trigger for flag X should not trigger unrelated flags Y,Z
// (soft check — warn but don't fail)

describe('L2b Regression — Cross-contamination (advisory)', () => {
  for (const flag of FLAGS) {
    it(`${flag}.trigger → no unexpected flags (advisory)`, () => {
      const text = loadFixture(`${flag}.trigger.txt`);
      const result = detectL2bFlags(text);
      const unexpected = result.flags.filter(f => f !== flag);
      // Advisory: log but don't hard-fail
      if (unexpected.length > 0) {
        console.log(`   ℹ️  ${flag}.trigger also triggered: [${unexpected.join(', ')}]`);
      }
      // Still pass — cross-trigger is acceptable in multi-pattern text
      assert.ok(true);
    });
  }
});

// ─── Summary stats ──────────────────────────────────────────────────

describe('L2b Regression — Summary', () => {
  it('reports minset coverage', () => {
    const triggerResults = {};
    const nonTriggerResults = {};

    for (const flag of FLAGS) {
      const triggerText = loadFixture(`${flag}.trigger.txt`);
      const nonTriggerText = loadFixture(`${flag}.non_trigger.txt`);

      triggerResults[flag] = detectL2bFlags(triggerText).flags.includes(flag);
      nonTriggerResults[flag] = !detectL2bFlags(nonTriggerText).flags.includes(flag);
    }

    const triggerPass = Object.values(triggerResults).filter(v => v).length;
    const nonTriggerPass = Object.values(nonTriggerResults).filter(v => v).length;

    console.log('');
    console.log('   📊 L2b Regression Minset Report');
    console.log(`   Trigger:     ${triggerPass}/${FLAGS.length} pass`);
    console.log(`   Non-trigger: ${nonTriggerPass}/${FLAGS.length} pass`);
    console.log(`   Total:       ${triggerPass + nonTriggerPass}/${FLAGS.length * 2} golden cases`);
    console.log('');

    assert.equal(triggerPass, FLAGS.length, 'All triggers must detect');
    assert.equal(nonTriggerPass, FLAGS.length, 'All non-triggers must NOT detect');
  });
});

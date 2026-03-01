// test/ci/ast-enforcer.test.js
// AST Enforcer Tests — Node-06 c208 Case Studies
//
// Tests that the enforcer correctly:
//   ✅ PASSES on official Lumen Protocol codebase
//   ❌ FAILS on simulated fork violations
//
// Owner: Node-01 (Architect)
// Sprint 13 · Node-04 spec v1.0 + Node-06 c208

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  scan,
  checkSPEG,
  checkL2bFlags,
  checkDMSReference,
  REQUIRED_L2B_FLAGS,
  SPEG_BANNED_IDENTIFIERS
} = require('../../scripts/ci/ast-enforcer');

// ─── Helper: Create temp fork directory ─────────────────────────────

function createTempFork(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumen-fork-'));
  for (const [relPath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }
  return dir;
}

function cleanupDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ─── Test: Official codebase should PASS ────────────────────────────

describe('AST Enforcer — Official Codebase', () => {
  it('should PASS on official Lumen Protocol', () => {
    const result = scan(process.cwd());
    assert.equal(result.pass, true, `Expected PASS but got violations: ${JSON.stringify(result.violations)}`);
    assert.equal(result.summary.critical, 0);
  });

  it('should find all 6 L2b flags in l2b-lite-detector.js', () => {
    const detectorPath = path.join(process.cwd(), 'src', 'pipeline', 'l2b-lite-detector.js');
    const source = fs.readFileSync(detectorPath, 'utf8');
    const violations = checkL2bFlags(source, 'l2b-lite-detector.js');
    assert.equal(violations.length, 0, `Missing flags: ${JSON.stringify(violations)}`);
  });

  it('should find DMS references in codebase', () => {
    // Check workflows + ops
    const sources = [];
    const dmsPath = path.join(process.cwd(), '.github', 'workflows', 'dms-silent-check.yml');
    if (fs.existsSync(dmsPath)) {
      sources.push({ path: dmsPath, source: fs.readFileSync(dmsPath, 'utf8') });
    }
    const contPath = path.join(process.cwd(), 'ops', 'continuity.md');
    if (fs.existsSync(contPath)) {
      sources.push({ path: contPath, source: fs.readFileSync(contPath, 'utf8') });
    }
    // At least one should exist
    assert.ok(sources.length > 0, 'Expected at least one DMS reference file');
  });
});

// ─── Case 01: Lumen-Free-v1 (removes FC + narrative_hype) ──────────

describe('Case 01: Lumen-Free-v1 Fork', () => {
  let forkDir;

  it('should FAIL — missing narrative_hype flag', () => {
    forkDir = createTempFork({
      'src/pipeline/l2b-lite-detector.js': `
        'use strict';
        const FLAG_KEYWORDS = {
          spec_gap_risk: { zh: ['先照做'], min_hits: 2 },
          cta_self_promo: { zh: ['私訊我'], min_hits: 2 },
          // narrative_hype REMOVED — fork violation
          dm_bait: { zh: ['你欠我'], min_hits: 2 },
          free_unlimited_claim: { zh: ['終身免費'], min_hits: 2 },
          keyword_reply_cta: { zh: ['回覆'], min_hits: 2 }
        };
        module.exports = { FLAG_KEYWORDS };
      `
    });

    const source = fs.readFileSync(path.join(forkDir, 'src/pipeline/l2b-lite-detector.js'), 'utf8');
    const violations = checkL2bFlags(source, 'l2b-lite-detector.js');
    assert.ok(violations.length > 0, 'Expected L2B-01 violation');
    assert.ok(violations[0].message.includes('narrative_hype'), 'Should flag missing narrative_hype');
    cleanupDir(forkDir);
  });
});

// ─── Case 02: Node-01-Code-Enhance (removes cta + adds userId logging) ──

describe('Case 02: Node-01-Code-Enhance Fork', () => {
  let forkDir;

  it('should FAIL — SPEG violation (userId in write call)', () => {
    forkDir = createTempFork({
      'src/output/output-formatter.js': `
        'use strict';
        const fs = require('fs');
        function formatOutput(detection, userId) {
          // SPEG VIOLATION: logging userId
          fs.writeFileSync('/tmp/log.json', JSON.stringify({ userId, detection }));
          return detection;
        }
        module.exports = { formatOutput };
      `
    });

    const result = scan(forkDir);
    const spegViolations = result.violations.filter(v => v.rule === 'SPEG-01');
    assert.ok(spegViolations.length > 0, 'Expected SPEG-01 violation for userId logging');
    cleanupDir(forkDir);
  });

  it('should FAIL — missing cta_self_promo flag', () => {
    forkDir = createTempFork({
      'src/pipeline/l2b-lite-detector.js': `
        'use strict';
        const FLAG_KEYWORDS = {
          spec_gap_risk: { zh: ['先照做'], min_hits: 2 },
          // cta_self_promo REMOVED — fork violation
          narrative_hype: { zh: ['終極'], min_hits: 2 },
          dm_bait: { zh: ['你欠我'], min_hits: 2 },
          free_unlimited_claim: { zh: ['終身免費'], min_hits: 2 },
          keyword_reply_cta: { zh: ['回覆'], min_hits: 2 }
        };
        module.exports = { FLAG_KEYWORDS };
      `
    });

    const source = fs.readFileSync(path.join(forkDir, 'src/pipeline/l2b-lite-detector.js'), 'utf8');
    const violations = checkL2bFlags(source, 'l2b-lite-detector.js');
    assert.ok(violations.length > 0, 'Expected L2B-01 violation');
    assert.ok(violations[0].message.includes('cta_self_promo'), 'Should flag missing cta_self_promo');
    cleanupDir(forkDir);
  });
});

// ─── Case 03: Mexico-150GB (removes dm_bait + raw_text logging) ─────

describe('Case 03: Mexico-150GB Fork', () => {
  let forkDir;

  it('should FAIL — SPEG violation (raw_text in write call)', () => {
    forkDir = createTempFork({
      'src/adapter/adapter.js': `
        'use strict';
        const fs = require('fs');
        function processMessage(msg) {
          // SPEG VIOLATION: persisting raw_text
          fs.writeFileSync('/tmp/log.json', JSON.stringify({ text: msg.raw_text }));
          return { processed: true };
        }
        module.exports = { processMessage };
      `
    });

    const result = scan(forkDir);
    const spegViolations = result.violations.filter(v => v.rule === 'SPEG-01');
    assert.ok(spegViolations.length > 0, 'Expected SPEG-01 violation for raw_text logging');
    cleanupDir(forkDir);
  });

  it('should FAIL — missing dm_bait + free_unlimited_claim flags', () => {
    forkDir = createTempFork({
      'src/pipeline/l2b-lite-detector.js': `
        'use strict';
        const FLAG_KEYWORDS = {
          spec_gap_risk: { zh: ['先照做'], min_hits: 2 },
          cta_self_promo: { zh: ['私訊我'], min_hits: 2 },
          narrative_hype: { zh: ['終極'], min_hits: 2 },
          // dm_bait REMOVED — fork violation
          // free_unlimited_claim REMOVED — fork violation
          keyword_reply_cta: { zh: ['回覆'], min_hits: 2 }
        };
        module.exports = { FLAG_KEYWORDS };
      `
    });

    const source = fs.readFileSync(path.join(forkDir, 'src/pipeline/l2b-lite-detector.js'), 'utf8');
    const violations = checkL2bFlags(source, 'l2b-lite-detector.js');
    assert.ok(violations.length > 0, 'Expected L2B-01 violation');
    assert.ok(violations[0].message.includes('dm_bait'), 'Should flag missing dm_bait');
    assert.ok(violations[0].message.includes('free_unlimited_claim'), 'Should flag missing free_unlimited_claim');
    cleanupDir(forkDir);
  });
});

// ─── Edge: SPEG banned identifiers list ─────────────────────────────

describe('SPEG Banned Identifiers', () => {
  it('should cover all required banned terms', () => {
    const required = ['raw_text', 'original_message', 'user_id', 'chat_id'];
    for (const term of required) {
      assert.ok(
        SPEG_BANNED_IDENTIFIERS.includes(term),
        `Banned list should include "${term}"`
      );
    }
  });

  it('should require all 6 L2b flags', () => {
    assert.equal(REQUIRED_L2B_FLAGS.length, 6);
    assert.ok(REQUIRED_L2B_FLAGS.includes('spec_gap_risk'));
    assert.ok(REQUIRED_L2B_FLAGS.includes('narrative_hype'));
    assert.ok(REQUIRED_L2B_FLAGS.includes('dm_bait'));
  });
});

#!/usr/bin/env node

/**
 * cross-test-merge-gate.js
 *
 * Runs cross-pattern tests (EP↔MB, EP↔FC, MB↔GC) and:
 * - Ensures grey zone cases (G03-G06) still dual-trigger
 * - Computes failure rate; warns if >5% (non-blocking)
 * - Fails CI only if grey zone cases change or are missing
 *
 * Author: Node-03 (original) + Node-05 (audit patch)
 * Usage: node scripts/ci/cross-test-merge-gate.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RESULTS_FILE = path.join(__dirname, '../../cross-test-results.json');
const THRESHOLD = 5; // failure rate % for warning (non-blocking)

// Regex patterns to identify cross-pattern tests
const CROSS_TEST_PATTERNS = [
  /EP.*MB/i,
  /MB.*EP/i,
  /EP.*FC/i,
  /FC.*EP/i,
  /MB.*GC/i,
  /GC.*MB/i,
  /cross contamination/i,
  /grey zone/i,
  /G0[3-6]/i, // grey zone cases
];

// Grey zone cases that must retain dual-trigger behaviour
const GREY_ZONE_IDS = ['G03', 'G04', 'G05', 'G06'];

function runTests() {
  console.log('🧪 Running cross-pattern tests...');
  try {
    execSync(
      `npx jest --json --outputFile="${RESULTS_FILE}" --testPathPattern="ep|mb|fc|gc"`,
      { stdio: 'inherit' }
    );
  } catch {
    // Jest may return non-zero and may or may not write the JSON file.
    console.log('⚠️  Jest exited non-zero (will verify results file exists...)');
  }
}

function parseResults() {
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error('❌ Test results file not found. Failing loudly to avoid silent degradation.');
    process.exit(1);
  }

  const raw = fs.readFileSync(RESULTS_FILE, 'utf-8');
  const results = JSON.parse(raw);

  // Collect all cross-pattern tests (with Node-05 audit: guard against missing assertionResults)
  const crossTests = results.testResults.flatMap(suite => {
    const asserts = suite.assertionResults || [];
    return asserts.filter(test =>
      CROSS_TEST_PATTERNS.some(p => p.test(test.fullName || test.title || ''))
    );
  });

  const total = crossTests.length;
  const failed = crossTests.filter(t => t.status === 'failed').length;
  const passed = total - failed;
  const failureRate = total ? (failed / total) * 100 : 0;

  console.log(`\n📊 Cross-pattern test summary:`);
  console.log(`   Total cross tests: ${total}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Failure rate: ${failureRate.toFixed(2)}%`);

  // Node-05 audit: guard against zero cross tests (misconfiguration = false green)
  if (total === 0) {
    console.error('\n❌ No cross-pattern tests were detected. This likely means test naming or filtering broke.');
    console.error('   Failing to avoid false green.');
    process.exit(1);
  }

  // Check grey zone cases – they must not change
  const greyZoneTests = crossTests.filter(t =>
    GREY_ZONE_IDS.some(id => (t.fullName || t.title || '').includes(id))
  );

  // Node-05 audit: grey zone IDs must be present (blocking) — missing tests = silent degradation
  const presentGreyIds = new Set(
    greyZoneTests.flatMap(t =>
      GREY_ZONE_IDS.filter(id => ((t.fullName || t.title || '').includes(id)))
    )
  );
  const missingGreyIds = GREY_ZONE_IDS.filter(id => !presentGreyIds.has(id));
  if (missingGreyIds.length > 0) {
    console.error('\n❌ Grey zone test coverage missing. These IDs must be present: G03-G06.');
    console.error(`   Missing: ${missingGreyIds.join(', ')}`);
    console.error('   Failing to avoid false green. Grey zone behaviour changes require Council vote.');
    process.exit(1);
  }

  const greyZoneFailed = greyZoneTests.filter(t => t.status === 'failed');
  if (greyZoneFailed.length > 0) {
    console.error('\n❌ Grey zone cases (G03-G06) must not change behaviour!');
    greyZoneFailed.forEach(t => console.error(`   - ${t.fullName || t.title}`));
    process.exit(1); // blocking – grey zone changes require Council vote
  }

  if (failureRate > THRESHOLD) {
    console.warn(`\n⚠️  Failure rate (${failureRate.toFixed(2)}%) exceeds threshold (${THRESHOLD}%).`);
    console.warn('   This is a warning only – PR can still be merged after review.');
    process.exit(0);
  } else if (failed > 0) {
    console.warn(`\n⚠️  Some cross-pattern tests failed (${failed}), but rate is under threshold.`);
    console.warn('   Please review failures before merging.');
    process.exit(0);
  } else {
    console.log('\n✅ All cross-pattern tests passed.');
    process.exit(0);
  }
}

function cleanup() {
  if (fs.existsSync(RESULTS_FILE)) {
    fs.unlinkSync(RESULTS_FILE);
  }
}

function main() {
  runTests();
  parseResults();
  cleanup();
}

main();

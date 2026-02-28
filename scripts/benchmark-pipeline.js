#!/usr/bin/env node
/**
 * scripts/benchmark-pipeline.js
 * Real Latency Profiling — run in Codespace to get actual numbers
 *
 * 設計：Node-01 (Architect)
 * 日期：2026-02-25
 * 背景：Node-04 的 profiling 報告是推算的，需要實測驗證
 *
 * Usage: node scripts/benchmark-pipeline.js
 */

'use strict';

const { performance } = require('perf_hooks');
const { pipeline, processMessage, runForecast, runOutput } = require('../src/pipeline/dispatcher');
const MomentumEngine = require('../src/engines/momentum-engine');

// ─── Test Inputs ─────────────────────────────────────────────────────

const INPUTS = {
  short_en: 'You owe me after everything I did.',
  short_zh: '你昨天為什麼不接我電話？',
  medium_en: "If you don't listen to me, I will tell everyone your secret. You owe me after everything I did for you. Don't make me do something I'll regret.",
  medium_zh: '我為你付出了這麼多，你怎麼可以這樣對我？如果你不聽我的，我就把一切都告訴你爸媽。你自己想想你對得起我嗎？',
  long_en: "I took care of you and made you feel welcome, and this is how you repay me. After everything I did for you this is how you repay me. Don't come crying to me when someone else doesn't treat you the way I did. You never appreciated anything I gave you. I sacrificed so much for you and you just threw it all away. If you walk away now, everyone will know what kind of person you really are.",
  benign_en: 'Hello, how are you doing today? I hope you are having a great day. The weather is nice outside.',
  benign_zh: '你好，今天過得怎麼樣？希望你今天一切順利。外面天氣很好。'
};

const WARMUP = 100;
const ITERATIONS = 1000;

// ─── Measure Helper ──────────────────────────────────────────────────

function measure(fn, iterations) {
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  return {
    avg: times.reduce((s, t) => s + t, 0) / times.length,
    p50: times[Math.floor(times.length * 0.50)],
    p95: times[Math.floor(times.length * 0.95)],
    p99: times[Math.floor(times.length * 0.99)],
    min: times[0],
    max: times[times.length - 1]
  };
}

function measureLayer(name, fn) {
  // Warmup
  for (let i = 0; i < WARMUP; i++) fn();
  const stats = measure(fn, ITERATIONS);
  return { name, ...stats };
}

// ─── Per-Layer Breakdown ─────────────────────────────────────────────

function profileInput(label, text) {
  console.log(`\n── ${label} (${text.length} chars) ──`);

  // Full pipeline
  const full = measureLayer('pipeline()', () => pipeline(text));

  // L1+L2 only (processMessage)
  const l1l2 = measureLayer('L1+L2 processMessage()', () => processMessage(text));

  // L3 momentum (simulate 4-turn)
  const l3 = measureLayer('L3 momentum (4-turn)', () => {
    const engine = new MomentumEngine({ decayFactor: 0.88, windowSize: 5 });
    const event = processMessage(text);
    const acri = event.layers.layer1.acri;
    for (let i = 0; i < 4; i++) {
      engine.processTurn({
        timestamp: `t${i}`,
        acri_base: acri * (0.5 + i * 0.15),
        structure_hit: acri > 0,
        detected_motifs: []
      });
    }
  });

  // L4 output only
  const l4 = measureLayer('L4 runOutput()', () => {
    const event = processMessage(text);
    const det = event._detection || { acri: 0, patterns: [], gate_hits: { push: {} } };
    runOutput(det, null, {});
  });

  // Print table
  const layers = [l1l2, l3, l4, full];
  console.log('');
  console.log('  Layer                  | Avg (ms) | P50 (ms) | P95 (ms) | P99 (ms) | Max (ms)');
  console.log('  -----------------------|----------|----------|----------|----------|----------');
  for (const l of layers) {
    console.log(`  ${l.name.padEnd(23)}| ${l.avg.toFixed(3).padStart(8)} | ${l.p50.toFixed(3).padStart(8)} | ${l.p95.toFixed(3).padStart(8)} | ${l.p99.toFixed(3).padStart(8)} | ${l.max.toFixed(3).padStart(8)}`);
  }

  return { label, full, l1l2, l3, l4 };
}

// ─── Main ────────────────────────────────────────────────────────────

console.log('='.repeat(70));
console.log('  Lumen Pipeline Latency Benchmark');
console.log(`  Node: ${process.version}`);
console.log(`  Platform: ${process.platform} ${process.arch}`);
console.log(`  Warmup: ${WARMUP} iterations`);
console.log(`  Measured: ${ITERATIONS} iterations per input`);
console.log(`  Date: ${new Date().toISOString()}`);
console.log('='.repeat(70));

const results = [];
for (const [label, text] of Object.entries(INPUTS)) {
  results.push(profileInput(label, text));
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('  SUMMARY — pipeline() Avg (ms)');
console.log('  ' + '-'.repeat(50));
for (const r of results) {
  const status = r.full.p95 < 1.0 ? '✅' : r.full.p95 < 5.0 ? '⚠️' : '❌';
  console.log(`  ${status} ${r.label.padEnd(15)} Avg=${r.full.avg.toFixed(3)}ms  P95=${r.full.p95.toFixed(3)}ms  P99=${r.full.p99.toFixed(3)}ms`);
}

// Budget check
const worstP95 = Math.max(...results.map(r => r.full.p95));
console.log('\n  ' + '-'.repeat(50));
console.log(`  Worst P95: ${worstP95.toFixed(3)}ms`);
if (worstP95 < 140) {
  console.log(`  ✅ Within 140ms budget (headroom: ${(140 - worstP95).toFixed(1)}ms)`);
} else {
  console.log(`  ❌ EXCEEDS 140ms budget by ${(worstP95 - 140).toFixed(1)}ms`);
}
console.log('='.repeat(70));

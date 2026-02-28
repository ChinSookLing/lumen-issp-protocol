/**
 * run-group-d.js
 * 執行 Group D 首輪驗證
 *
 * 用法：node run-group-d.js <path-to-vectors.json>
 */

'use strict';

const fs = require('fs');
const path = require('path');

// 載入 harness
const harness = require('./group-d-harness');

// 載入 forecast-engine — 需要修正路徑
// 在 repo 裡是 src/forecast/forecast-engine.js
// 我們根據執行位置調整
let computeTrend;
const enginePaths = [
  './src/forecast/forecast-engine.js',
  '../src/forecast/forecast-engine.js',
  '../../src/forecast/forecast-engine.js'
];

for (const p of enginePaths) {
  try {
    const engine = require(p);
    computeTrend = engine.computeTrend;
    console.log(`✅ Loaded forecast-engine from: ${p}`);
    break;
  } catch (e) {
    // try next
  }
}

if (!computeTrend) {
  console.error('❌ Cannot find forecast-engine.js. Run from repo root.');
  process.exit(1);
}

// 讀取向量
const vectorPath = process.argv[2] || './test/vectors/gc-unified-bundle-v0.2.json';
let vectors;
try {
  vectors = JSON.parse(fs.readFileSync(vectorPath, 'utf-8'));
  console.log(`✅ Loaded ${vectors.length} vectors from: ${vectorPath}`);
} catch (e) {
  console.error(`❌ Cannot read vectors: ${vectorPath}`);
  console.error(e.message);
  process.exit(1);
}

// 執行
console.log('\n🚀 Running Group D validation...\n');
const result = harness.run(vectors, computeTrend);

// 輸出摘要
console.log('='.repeat(50));
console.log('GROUP D FIRST RUN RESULTS');
console.log('='.repeat(50));
console.log(`Total:    ${result.summary.total}`);
console.log(`Pass:     ${result.summary.pass}`);
console.log(`Fail:     ${result.summary.fail}`);
console.log(`Error:    ${result.summary.error}`);
console.log(`Accuracy: ${result.summary.accuracy}`);
console.log('='.repeat(50));

// 顯示失敗的
const failures = result.results.filter(r => !r.matched && !r.error);
if (failures.length > 0) {
  console.log('\n❌ FAILURES:');
  for (const f of failures) {
    console.log(`  ${f.vector_id}: expected=${f.expected_trend} got=${f.engine_band} slope=${f.slope}`);
  }
}

// 顯示錯誤的
const errors = result.results.filter(r => r.error);
if (errors.length > 0) {
  console.log('\n⚠️  ERRORS:');
  for (const e of errors) {
    console.log(`  ${e.vector_id}: ${e.error}`);
  }
}

// 生成報告
const report = harness.generateReport(result);
const reportPath = './docs/reports/group-d-first-run.md';
try {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Report saved: ${reportPath}`);
} catch (e) {
  // 如果 repo 路徑不存在，存到當前目錄
  const fallback = './group-d-first-run.md';
  fs.writeFileSync(fallback, report);
  console.log(`\n📄 Report saved: ${fallback}`);
}

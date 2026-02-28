#!/usr/bin/env node
// scripts/demo.js
// Lumen ISSP — One-Click Demo
// Runs sample text through the SAME path as Telegram webhook:
//   evaluateLongText → adaptL1toFlat → detectL2bFlags → runOutput
// Usage: node scripts/demo.js
//
// Owner: Node-01 (Architect)
// Sprint 12 — Step 16 Launch Checklist item #3

'use strict';

const { evaluateLongText } = require('../core/evaluator');
const { adaptL1toFlat, runOutput } = require('../src/pipeline/dispatcher');
const { detectL2bFlags } = require('../src/pipeline/l2b-lite-detector');

// --- Demo fixtures ---
const demos = [
  {
    label: '🔵 LOW — Normal conversation',
    text: '我覺得我們需要好好談談，你有空嗎？最近工作壓力有點大，想找人聊聊。'
  },
  {
    label: '🟡 MEDIUM — L2b flags (spec gap + CTA)',
    text: '這套方案先照做就對了，細節之後再說。你不需要知道驗證方式或邊界條件，先把流程跑起來，TBD 我會補上。立刻私訊我拿連結，加入我的群組並訂閱，不然名額就沒了。'
  },
  {
    label: '🟠 HIGH — Narrative hype + debt bait + free claim',
    text: '這是終極解法，顛覆一切！毫無疑問今年結束前所有人都會被迫接受它，現在不跟上就完了。你欠我一個解釋，還記得我當初怎麼幫你的嗎？該還我了吧。終身免費 VPN，無限流量，永久有效，現在註冊送 100GB。回覆「優惠」即可領取折扣券。'
  }
];

// --- Run ---
console.log('═══════════════════════════════════════════════════');
console.log('  🛡️  Lumen ISSP — Pipeline Demo');
console.log('  Protocol v1.0 · 9 L1 Patterns + 6 L2b Flags');
console.log('  Path: evaluateLongText → L2b detect → L4 output');
console.log('═══════════════════════════════════════════════════\n');

for (const demo of demos) {
  console.log(`─── ${demo.label} ───\n`);

  // Layer 1: evaluateLongText (same as webhook processFlush)
  const l1Result = evaluateLongText(demo.text);
  const det = adaptL1toFlat(l1Result);

  // Layer 2b-lite: flag detection
  const l2b = detectL2bFlags(demo.text, { lang: 'zh' });

  // Layer 4: output
  const result = runOutput(det, null, {
    source: 'demo',
    lang: 'zh',
    nodeId: 'demo-node'
  });

  // === EVENT ===
  console.log('[L1 DETECTION]');
  const patterns = [...(det.patterns || [])].map(p => p.id || p.pattern);
  console.log(`  patterns:        ${patterns.join(', ') || 'none'}`);
  console.log(`  acri:            ${(det.acri || 0).toFixed(3)}`);
  console.log(`  vri:             ${(det.vri || 0).toFixed(3)}`);
  console.log(`  response_level:  ${det.response_level || 0}`);

  // === L2b ===
  console.log('\n[L2b FLAGS]');
  if (l2b.flags.length > 0) {
    for (const f of l2b.flags) {
      const label = l2b.details[f]?.label?.zh || f;
      console.log(`  🚩 ${f} — ${label} (hits: ${l2b.details[f]?.hits})`);
    }
  } else {
    console.log('  (none)');
  }

  // === OUTPUT ===
  const alert = result.alert;
  console.log('\n[L4 OUTPUT]');
  console.log(`  effective_level:  ${alert.effective_level}`);
  console.log(`  pattern:          ${alert.pattern || 'none'}`);
  console.log(`  requires_handoff: ${alert.requires_handoff || false}`);
  console.log(`  has_explanation:   ${!!result.explanation}`);
  console.log(`  has_handoff:      ${!!result.handoff}`);

  console.log('\n');
}

console.log('═══════════════════════════════════════════════════');
console.log('  ✅ Demo complete. No raw text stored.');
console.log('  📋 Tier 0 — observation only, not diagnosis.');
console.log('═══════════════════════════════════════════════════');

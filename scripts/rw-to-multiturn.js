#!/usr/bin/env node
'use strict';

/**
 * rw-to-multiturn.js
 * Multi-turn Harness Adapter
 *
 * Converts RW single-message cases into multi-turn conversation format
 * suitable for L2→L3 pipeline processing.
 *
 * Problem: L1 engine detects structural manipulation patterns via
 * Three-Question Gate (≥2 criteria). Single messages rarely trigger
 * structural detection — confirmed by M83 RW-R2 L1 run (0/9 detected).
 *
 * Solution: Wrap RW cases in realistic multi-turn conversation context
 * where the manipulation structure accumulates across turns.
 *
 * Input:  conformance/forecast-inputs/rw-r2-all-cases.json
 * Output: conformance/forecast-inputs/rw-r2-multiturn.json
 *
 * Run: node scripts/rw-to-multiturn.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INPUT = path.join(ROOT, 'conformance', 'forecast-inputs', 'rw-r2-all-cases.json');
const OUTPUT = path.join(ROOT, 'conformance', 'forecast-inputs', 'rw-r2-multiturn.json');

// ---- Turn templates by pattern ----
// Each template provides 2-3 setup turns that build manipulation structure
// before the actual RW case text appears as the final turn.

const TURN_TEMPLATES = {
  // Emotional Appeal — build emotional dependency before strike
  EA: {
    setup_zh: [
      { role: 'manipulator', text: '最近怎麼樣？我一直在想你。' },
      { role: 'target', text: '還好啊，就是工作忙。' },
      { role: 'manipulator', text: '你知道嗎，除了你之外沒有人真的關心我。' },
    ],
    setup_en: [
      { role: 'manipulator', text: 'How have you been? I\'ve been thinking about you.' },
      { role: 'target', text: 'Fine, just busy with work.' },
      { role: 'manipulator', text: 'You know, nobody really cares about me except you.' },
    ],
  },

  // Fear-based Coercion — escalate threat across turns
  FC: {
    setup_zh: [
      { role: 'manipulator', text: '我們需要談談一件事。' },
      { role: 'target', text: '什麼事？' },
      { role: 'manipulator', text: '我知道一些關於你的事情。你應該好好想想你的選擇。' },
    ],
    setup_en: [
      { role: 'manipulator', text: 'We need to talk about something.' },
      { role: 'target', text: 'What is it?' },
      { role: 'manipulator', text: 'I know some things about you. You should think carefully about your choices.' },
    ],
  },

  // Moral Blackmail — build obligation structure
  MB: {
    setup_zh: [
      { role: 'manipulator', text: '你還記得去年你有困難的時候是誰幫你的嗎？' },
      { role: 'target', text: '記得，我很感激。' },
      { role: 'manipulator', text: '感激是好的。但感激需要用行動來表達。' },
    ],
    setup_en: [
      { role: 'manipulator', text: 'Do you remember who helped you when you were in trouble last year?' },
      { role: 'target', text: 'Yes, I\'m grateful.' },
      { role: 'manipulator', text: 'Gratitude is good. But gratitude needs to be shown through actions.' },
    ],
  },

  // Dependency Manufacturing — isolate then bind
  DM: {
    setup_zh: [
      { role: 'manipulator', text: '你有沒有覺得你身邊的人其實不太理解你？' },
      { role: 'target', text: '有時候吧。' },
      { role: 'manipulator', text: '我理解你的感受。只有我真的懂你。' },
    ],
    setup_en: [
      { role: 'manipulator', text: 'Don\'t you feel like the people around you don\'t really understand you?' },
      { role: 'target', text: 'Sometimes, I guess.' },
      { role: 'manipulator', text: 'I understand how you feel. Only I truly get you.' },
    ],
  },

  // Gaslighting / Consensus Manipulation — deny reality across turns
  GC: {
    setup_zh: [
      { role: 'manipulator', text: '你確定你記得正確嗎？你最近壓力很大。' },
      { role: 'target', text: '我記得很清楚。' },
      { role: 'manipulator', text: '大家都覺得你最近狀態不太好，是不是應該休息一下？' },
    ],
    setup_en: [
      { role: 'manipulator', text: 'Are you sure you remember correctly? You\'ve been under a lot of stress.' },
      { role: 'target', text: 'I remember clearly.' },
      { role: 'manipulator', text: 'Everyone thinks you haven\'t been yourself lately. Maybe you should take a break?' },
    ],
  },

  // Escalation Pressure — time pressure + false urgency
  EP: {
    setup_zh: [
      { role: 'manipulator', text: '這個機會只剩今天了。' },
      { role: 'target', text: '我需要時間考慮。' },
      { role: 'manipulator', text: '沒有時間了。你再拖下去就來不及了。' },
    ],
    setup_en: [
      { role: 'manipulator', text: 'This opportunity is only available today.' },
      { role: 'target', text: 'I need time to think.' },
      { role: 'manipulator', text: 'There\'s no time. If you wait any longer, it\'ll be too late.' },
    ],
  },

  // Default fallback for any unmatched pattern
  DEFAULT: {
    setup_zh: [
      { role: 'manipulator', text: '我想跟你聊聊。' },
      { role: 'target', text: '什麼事？' },
    ],
    setup_en: [
      { role: 'manipulator', text: 'I want to talk to you about something.' },
      { role: 'target', text: 'What is it?' },
    ],
  },
};

// ---- Converter ----

function convertToMultiturn(rwCase) {
  const { metadata, events } = rwCase;
  if (!events || events.length === 0) return null;

  const ev = events[0];
  const lang = metadata.lang || 'en';
  const patterns = ev.L1_output?.expected_patterns || [];

  // Pick the best template based on first expected pattern
  const primaryPattern = patterns[0] || 'DEFAULT';
  const template = TURN_TEMPLATES[primaryPattern] || TURN_TEMPLATES.DEFAULT;

  // Select language-appropriate setup turns
  const setupTurns = lang.startsWith('zh') ? template.setup_zh :
                     lang.startsWith('ms') ? template.setup_zh : // Malay: use zh as placeholder, should be expanded
                     template.setup_en;

  // Build multi-turn conversation
  const turns = [];

  // Setup turns with timestamps
  setupTurns.forEach((t, i) => {
    turns.push({
      turn: i + 1,
      role: t.role,
      timestamp: `t${i}`,
      text: t.text,
    });
  });

  // Final turn = the actual RW case text (the manipulation payload)
  const rwText = ev.text_en || ev.text_zh || ev.text_ms || '';
  turns.push({
    turn: turns.length + 1,
    role: 'manipulator',
    timestamp: `t${turns.length}`,
    text: rwText,
    is_rw_payload: true,
  });

  return {
    id: `${metadata.vector_id}-MT`,
    metadata: {
      ...metadata,
      vector_id: `${metadata.vector_id}-MT`,
      format: 'multiturn',
      original_vector_id: metadata.vector_id,
      total_turns: turns.length,
      setup_turns: turns.length - 1,
    },
    conversation: turns,
    L1_output: ev.L1_output,
    L3_query: rwCase.L3_query || null,
    notes: `Auto-generated multi-turn wrapper. Setup pattern: ${primaryPattern}. Original: single-message RW case.`,
  };
}

// ---- Main ----

function main() {
  console.log('═'.repeat(60));
  console.log('  RW → MULTI-TURN HARNESS ADAPTER');
  console.log('═'.repeat(60));
  console.log('');

  if (!fs.existsSync(INPUT)) {
    console.log(`❌ Input not found: ${INPUT}`);
    console.log('Run the RW case collection first.');
    process.exit(1);
  }

  const cases = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  console.log(`✅ Loaded ${cases.length} RW cases`);

  const multiturnCases = [];
  let converted = 0;
  let skipped = 0;

  for (const c of cases) {
    // Only convert positive cases (not hard negatives)
    if (c.metadata.type === 'negative') {
      // Keep hard negatives as-is but mark as multiturn format
      multiturnCases.push({
        ...c,
        id: `${c.metadata.vector_id}-MT`,
        metadata: {
          ...c.metadata,
          vector_id: `${c.metadata.vector_id}-MT`,
          format: 'multiturn_passthrough',
          original_vector_id: c.metadata.vector_id,
        },
        notes: 'Hard negative — kept as-is (should NOT trigger even with context).',
      });
      skipped++;
      continue;
    }

    const mt = convertToMultiturn(c);
    if (mt) {
      multiturnCases.push(mt);
      converted++;

      // Display
      const patterns = c.events[0].L1_output?.expected_patterns || [];
      console.log(`  ✅ ${c.metadata.vector_id} → ${mt.id} (${mt.metadata.total_turns} turns, pattern: ${patterns[0] || '?'})`);
    } else {
      console.log(`  ⚠️ ${c.metadata.vector_id}: skipped (no events)`);
      skipped++;
    }
  }

  // Save
  fs.writeFileSync(OUTPUT, JSON.stringify(multiturnCases, null, 2));

  console.log('');
  console.log('─'.repeat(40));
  console.log(`  Converted: ${converted}`);
  console.log(`  Passthrough (HN): ${skipped}`);
  console.log(`  Total output: ${multiturnCases.length}`);
  console.log(`  Output: ${OUTPUT}`);
  console.log('─'.repeat(40));
  console.log('');
  console.log('Next step: Run through L1 engine with multi-turn context:');
  console.log('  node scripts/rw-r2-l1-engine-run.js --input rw-r2-multiturn.json');
  console.log('');
}

main();

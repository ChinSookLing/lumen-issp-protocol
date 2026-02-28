/**
 * output-envelope.js
 * Layer 4 — 輸出分層 UI 約束 + 平民化誤用防線
 *
 * 設計：Node-05（Sprint 8）
 * 實作：Node-01（Architect）
 * 日期：2026-02-18
 *
 * 兩層設計：
 *   Tier 1 Signal Card — 只說觀測到什麼（必須顯示）
 *   Tier 2 Guidance Drawer — 低風險建議（預設折疊 + HITL）
 *   Tier 3 Adjudication — 預設不存在（需人類 verdict）
 *
 * 誤用防線：
 *   Rule A: 永遠說「訊號」不說「判定」
 *   Rule B: 用「描述」取代「指控」
 *   Rule C: 低信心必須標示不確定
 *   Rule D: 必須帶「可撤回」提示
 */
'use strict';

// ============================================================
// 禁詞表（Node-05 設計）
// ============================================================
const FORBIDDEN_WORDS = [
  '你是', '他是', '她是', '操控者', '壞人',
  '處罰', '封禁', '踢出', '罪',
  'you are a', 'he is a', 'she is a',
  'manipulator', 'punish', 'ban them', 'kick out'
];

const REQUIRED_SIGNAL_WORDS = ['signal', '訊號', 'Signal'];
const REQUIRED_EXIT_RAMP = ['不是結論', 'not a verdict', 'not a conclusion', '非結論'];

// ============================================================
// Risk Band 映射
// ============================================================
function classifyRiskBand(score) {
  if (score >= 0.7) return 'RED';
  if (score >= 0.5) return 'ORANGE';
  if (score >= 0.3) return 'YELLOW';
  return 'GREEN';
}

// ============================================================
// Signal Summary 生成（Rule A + B：訊號語氣，非裁決）
// ============================================================
function buildSignalSummary(patterns, gateHit, confidence) {
  if (!patterns || patterns.length === 0) {
    return 'No manipulation signals detected.';
  }

  const top = patterns
    .sort((a, b) => (b.score || b.confidence || 0) - (a.score || a.confidence || 0))
    .slice(0, 3);

  const parts = top.map(p => {
    const id = p.id || p.pattern;
    const score = (p.score || p.confidence || 0).toFixed(2);
    return `${id} signal ${score >= 0.5 ? '↑' : '~'} (${score})`;
  });

  // Rule C: 低信心加標示
  const qualifier = confidence < 0.8 ? ' (signals may be weak)' : '';

  return `${parts.join(', ')}. GateHit=${gateHit}${qualifier}`;
}

// ============================================================
// Exit Ramp（Rule D）
// ============================================================
function getExitRamp(lang) {
  const ramps = {
    'en': 'This is a risk signal, not a verdict. If you disagree, you may ignore or request human review.',
    'zh-trad': '這是風險提示，不是結論；如你不同意，可忽略或請人類覆核。',
    'zh-simp': '这是风险提示，不是结论；如你不同意，可忽略或请人类复核。',
    'ja': 'これはリスク信号であり、結論ではありません。同意できない場合は無視するか、人間によるレビューをリクエストできます。',
    'ko': '이것은 위험 신호이며 결론이 아닙니다. 동의하지 않으면 무시하거나 사람의 검토를 요청할 수 있습니다.',
    'de': 'Dies ist ein Risikosignal, kein Urteil. Wenn Sie nicht einverstanden sind, können Sie es ignorieren oder eine menschliche Überprüfung anfordern.',
    'fr': 'Ceci est un signal de risque, pas un verdict. Si vous n\'êtes pas d\'accord, vous pouvez l\'ignorer ou demander un examen humain.'
  };
  return ramps[lang] || ramps['en'];
}

// ============================================================
// Copy Lint（Node-05 §2.4 規則）
// ============================================================
function copyLint(text) {
  const errors = [];

  // Check forbidden words
  const lower = text.toLowerCase();
  for (const word of FORBIDDEN_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      errors.push(`forbidden word found: "${word}"`);
    }
  }

  // Check required signal word
  const hasSignalWord = REQUIRED_SIGNAL_WORDS.some(w => text.includes(w));
  if (!hasSignalWord) {
    errors.push('missing required signal word (signal/訊號)');
  }

  return errors;
}

/**
 * Lint the exit ramp requirement
 */
function copyLintExitRamp(text) {
  const hasRamp = REQUIRED_EXIT_RAMP.some(w => text.includes(w));
  return hasRamp ? [] : ['missing exit ramp (不是結論/not a verdict)'];
}

// ============================================================
// Envelope Builder
// ============================================================
function buildEnvelope(detection, options = {}) {
  const {
    chatId = 'unknown',
    lang = 'en',
    commitHash = 'unknown',
    operatorMode = 'test'
  } = options;

  const patterns = detection.patterns || [];
  const topScore = patterns.reduce((max, p) => Math.max(max, p.score || p.confidence || 0), 0);
  const gateHit = detection.gate_hits?.push?.gate_hit ?? 0;
  const confidence = topScore;

  const signalSummary = buildSignalSummary(patterns, gateHit, confidence);
  const riskBand = classifyRiskBand(topScore);
  const exitRamp = getExitRamp(lang);

  const envelope = {
    time_utc: new Date().toISOString(),
    chat_id: chatId,

    signal: {
      risk_band: riskBand,
      signal_summary: signalSummary,
      metrics: {
        top_patterns: patterns.slice(0, 3).map(p => p.id || p.pattern),
        pattern_scores: Object.fromEntries(
          patterns.map(p => [p.id || p.pattern, p.score || p.confidence || 0])
        ),
        gate_hit: gateHit,
        confidence
      },
      evidence: detection.evidence || []
    },

    guidance: {
      mode: topScore >= 0.5 ? 'HITL_REQUIRED' : 'INFO_ONLY',
      recommended_actions: topScore >= 0.3 ? [
        { action_id: 'ask_clarifying', text: lang.startsWith('zh') ? '建議請人類用一句話確認對方意圖（不要下結論）。' : 'Suggest asking the other party to clarify intent in one sentence (do not conclude).' },
        { action_id: 'pause_autopost', text: lang.startsWith('zh') ? '若有自動發布功能，建議暫停，避免外部擴散。' : 'If auto-posting is enabled, suggest pausing to prevent external spread.' }
      ] : [],
      do_not: [
        lang.startsWith('zh') ? '不要指控對方是操控者' : 'Do not accuse the other party of being a manipulator',
        lang.startsWith('zh') ? '不要用輸出作自動封禁/踢人/公開點名' : 'Do not use output for auto-banning/kicking/public naming'
      ]
    },

    constraints: {
      output_tier: topScore >= 0.3 ? 'SIGNAL_PLUS_GUIDANCE' : 'SIGNAL_ONLY',
      no_adjudication: true,
      no_external_actions: true
    },

    exit_ramp: exitRamp,

    fingerprint: {
      build_id: `build_${Date.now().toString(36)}`,
      commit_hash: commitHash,
      operator_mode: operatorMode
    }
  };

  return envelope;
}

module.exports = {
  buildEnvelope,
  buildSignalSummary,
  classifyRiskBand,
  getExitRamp,
  copyLint,
  copyLintExitRamp,
  FORBIDDEN_WORDS,
  REQUIRED_SIGNAL_WORDS,
  REQUIRED_EXIT_RAMP
};

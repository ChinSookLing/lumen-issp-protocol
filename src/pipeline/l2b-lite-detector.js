// src/pipeline/l2b-lite-detector.js
// L2b-lite Flag Detector — Sprint 12
// Owner: Node-01 (Architect), Spec: Node-05 (M93) + Node-03 (M93)
//
// Reads L2b mapping JSONs and detects structural patterns in text.
// Structure-only detection; no intent inference.
// Tier0 output: key + short label only (no raw text).
//
// Design: keyword cluster matching against definition + abuse_case fields.
// Each flag has a curated keyword set derived from its mapping definition.
//
// v0.2: Added Node-03 3 Medium flags (dm_bait, free_unlimited_claim, keyword_reply_cta)

'use strict';

const fs = require('node:fs');
const path = require('node:path');

// ============================================================
// Flag keyword definitions (derived from mapping JSONs)
// Each flag needs >=2 keyword hits to trigger (mini Three-Question Gate)
// ============================================================

const FLAG_KEYWORDS = {
  // === Node-05 High flags (c201) ===
  spec_gap_risk: {
    zh: [
      '先照做', '之後再', '不需要知道', '細節不重要', '之後補',
      'TBD', '先跑起來', '先答應', '先同意', '以後再說',
      '不用管細節', '先做再說', '條件之後', '驗證之後'
    ],
    en: [
      'just do it first', 'details later', "don't need to know",
      'figure it out later', 'TBD', "we'll fill in",
      'agree first', 'commit now', 'worry about that later',
      'skip the details', 'trust me on this'
    ],
    min_hits: 2
  },
  cta_self_promo: {
    zh: [
      '私訊我', '加入我的', '訂閱', '點連結', '名額',
      '立刻', '馬上', '限時', '僅剩', '趕快',
      '加群', '輸入邀請碼', '關注我', '掃碼', '點擊連結',
      '免費名額', '最後機會'
    ],
    en: [
      'DM me', 'join my', 'subscribe', 'click the link', 'spots left',
      'right now', 'hurry', 'limited time', 'only left', 'act now',
      'join the group', 'invitation code', 'follow me', 'scan',
      'free spots', 'last chance'
    ],
    min_hits: 2
  },
  narrative_hype: {
    zh: [
      '終極', '顛覆', '必然', '唯一', '毫無疑問',
      '所有人都會', '不跟上就', '完了', '史無前例',
      '革命性', '改變一切', '絕對', '無可阻擋',
      '必定', '注定', '劃時代'
    ],
    en: [
      'ultimate', 'disrupt', 'inevitable', 'only way', 'no doubt',
      'everyone will', 'miss out', 'game over', 'unprecedented',
      'revolutionary', 'change everything', 'absolutely',
      'unstoppable', 'destined', 'epoch-making'
    ],
    min_hits: 2
  },

  // === Node-03 Medium flags (Sprint 12 W2) ===
  dm_bait: {
    zh: [
      '你欠我', '該還我', '還記得我幫', '說清楚',
      '當初怎麼幫', '對得起', '良心過得去', '忘恩負義',
      '欠我一個', '我幫過你'
    ],
    en: [
      'you owe me', 'after everything i did', 'you should explain',
      'how could you forget', 'i sacrificed', 'you need to answer',
      'after all i gave', 'you owe me an answer'
    ],
    min_hits: 2
  },
  free_unlimited_claim: {
    zh: [
      '終身免費', '永久', '無限流量', '無限儲存',
      '0元', '免費下載', '送 100', '註冊送',
      '無限使用', '永久有效'
    ],
    en: [
      'free forever', 'unlimited', 'lifetime access',
      'no payment', '100% free', 'no cost ever',
      'sign up now', 'no fee', 'free lifetime'
    ],
    min_hits: 2
  },
  keyword_reply_cta: {
    zh: [
      '回覆', '即可領取', '即可獲取', '就能',
      '輸入', '回覆獲取', '回覆即可'
    ],
    en: [
      'reply with', 'text to', 'reply the word',
      'send to', 'type to unlock', 'reply for'
    ],
    min_hits: 2
  }
};

// ============================================================
// Load mapping metadata (for human_label output)
// ============================================================

const MAPPING_DIR = path.join(process.cwd(), 'mappings', 'l2b');
const flagMeta = {};

function loadMappings() {
  const flags = Object.keys(FLAG_KEYWORDS);
  for (const key of flags) {
    const fp = path.join(MAPPING_DIR, `${key}.v0.1.json`);
    try {
      if (fs.existsSync(fp)) {
        flagMeta[key] = JSON.parse(fs.readFileSync(fp, 'utf8'));
      }
    } catch (_) {
      // Mapping file not found — flag still works with keyword detection
    }
  }
}

// Load on module init
loadMappings();

// ============================================================
// Detection function
// ============================================================

/**
 * Detect L2b-lite flags in text.
 * Structure-only detection — no intent inference.
 *
 * @param {string} text - Input text to scan
 * @param {object} options
 * @param {string} options.lang - Language hint ('zh' | 'en')
 * @returns {object} { flags: string[], details: { [key]: { hits, label } } }
 */
function detectL2bFlags(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return { flags: [], details: {} };
  }

  const lang = options.lang || detectLang(text);
  const lowerText = text.toLowerCase();
  const flags = [];
  const details = {};

  for (const [key, config] of Object.entries(FLAG_KEYWORDS)) {
    const keywords = config[lang] || config.zh; // fallback to zh
    let hits = 0;

    for (const kw of keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        hits++;
      }
    }

    if (hits >= config.min_hits) {
      flags.push(key);
      const meta = flagMeta[key];
      details[key] = {
        hits,
        label: meta?.human_label || { zh: key, en: key },
        // Tier0: key + label only. No raw text, no matched keywords in output.
      };
    }
  }

  return { flags, details };
}

/**
 * Simple language detection based on CJK character ratio.
 */
function detectLang(text) {
  const cjkCount = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  return cjkCount / text.length > 0.1 ? 'zh' : 'en';
}

// ============================================================
// Exports
// ============================================================

module.exports = {
  detectL2bFlags,
  loadMappings,    // For testing: reload mappings
  FLAG_KEYWORDS,   // For testing: inspect keyword config
};

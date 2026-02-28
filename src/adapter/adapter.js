// src/adapter/adapter.js
// AC-1 Alignment — adapter → dispatcher integration
// Original: c143 (Node-03 M87 三點補齊)
// Updated: c146 (Node-01 AC-1 — connect adapter to dispatcher pipeline)
//
// Node-03 AC-1 定義 (2026-02-25):
//   "adapter 是協議與平台之間的薄翻譯層——
//    它確保外部世界能以標準化格式與 Lumen 核心對話，
//    但不參與任何核心邏輯。"
//
// Domain boundary:
//   管：平台格式轉換、input schema validation、錯誤處理(explicit reject + logging)、平台欄位提取
//   不管：偵測邏輯、分數計算、趨勢預測、輸出格式化、狀態管理

'use strict';

// ─── Source Enum (SPEG Narrow Adapter Allowlist) ─────────────────────
const ALLOWED_SOURCES = ['manual_paste', 'local_file', 'telegram_user_message', 'user_provided_log'];
const BLOCKED_SOURCES = ['platform_api_bulk', 'background_crawler', 'firehose_stream', 'cross_platform_aggregator'];

// ─── REG-CB-12: Enum Migration Map (v0.1 → v0.2) ───────────────────
const ENUM_MIGRATION = require('../../config/enum-migration-map.json');
const DOMAIN_V02 = require('../../config/ui-request.domain.enums.v0.1.json').enum; // v0.1 enum list as baseline

/**
 * Migrate a domain enum from v0.1 to v0.2 if needed.
 * @param {string} domain - Input domain value
 * @returns {{ domain: string, migrated: boolean, valid: boolean }}
 */
function migrateDomain(domain) {
  if (!domain) return { domain: undefined, migrated: false, valid: true };

  // Check if it's a known v0.1 → v0.2 migration
  const mapped = ENUM_MIGRATION.domain[domain];
  if (mapped) {
    return { domain: mapped, migrated: true, valid: true };
  }

  // Check if it's already a valid v0.2 (or v0.1 passthrough) value
  // Valid means: in current config OR is a v0.2 target value
  const v02Targets = Object.values(ENUM_MIGRATION.domain);
  if (DOMAIN_V02.includes(domain) || v02Targets.includes(domain)) {
    return { domain, migrated: false, valid: true };
  }

  // Unknown enum — invalid
  return { domain, migrated: false, valid: false };
}

// ─── Fallback Logger (Node-03 補齊點 1) ─────────────────────────────
// AC-1 update: now writes to accessLog array for AC-3 traceability
function logFallback(reason, request, accessLog) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: 'ADAPTER_REJECT',
    reason,
    request_id: request.request_id || 'unknown',
    domain: request.domain || request.meta?.extensions?.domain,
    scenario: request.scenario
  };
  console.warn('[FALLBACK]', JSON.stringify(logEntry));
  if (accessLog && typeof accessLog.push === 'function') {
    accessLog.push(logEntry);
  }
  return logEntry;
}

// ─── Input Parsing ───────────────────────────────────────────────────
function parseInput(raw) {
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return { text: raw, source: 'manual_paste' }; }
  }
  return raw;
}

// ─── Source Validation ───────────────────────────────────────────────
function validateSource(source) {
  if (BLOCKED_SOURCES.includes(source)) {
    throw new Error(`Blocked source: ${source} (SPEG violation)`);
  }
  if (!ALLOWED_SOURCES.includes(source)) {
    console.warn(`[ADAPTER] Unknown source: ${source}, allowing with caution`);
  }
  return true;
}

// ─── Route Request (Node-03 補齊點 2: full field support) ───────────
function routeRequest(request, rules, defaultBackend) {
  if (!rules || !Array.isArray(rules)) return defaultBackend || 'default';
  for (const rule of rules) {
    let match = true;
    for (const [key, value] of Object.entries(rule.when || {})) {
      const actual = key.includes('.')
        ? key.split('.').reduce((obj, k) => obj?.[k], request)
        : request[key];
      if (actual !== value) { match = false; break; }
    }
    if (match) return rule.use;
  }
  return defaultBackend || 'default';
}

// ─── Convert to Event ────────────────────────────────────────────────
function toEvent(parsed) {
  // Domain backward compatibility (Node-03 補齊點 3)
  const rawDomain = parsed.domain || parsed.meta?.extensions?.domain;

  // REG-CB-12: Enum migration (v0.1 → v0.2)
  const migration = migrateDomain(rawDomain);
  const domain = migration.domain;
  if (migration.migrated) {
    console.log(`[adapter] enum migration: ${rawDomain} → ${domain}`);
  }

  return {
    request_id: parsed.request_id || `req_${Date.now()}`,
    timestamp: new Date().toISOString(),
    domain,
    scenario: parsed.scenario || 'monitoring_brief',
    tier: parsed.tier || 0,
    text: parsed.content?.text || parsed.text || '',
    source: parsed.source?.type || parsed.source || 'manual_paste',
    conversation_id: parsed.conversation_id || parsed.chat_id || undefined,
    meta: {
      extensions: {
        domain: parsed.meta?.extensions?.domain || domain,
        domain_migrated: migration.migrated || undefined,
        domain_original: migration.migrated ? rawDomain : undefined,
      }
    },
    _enum_migration: migration, // Internal: for adapter reject check
  };
}

// ─── handleInvalid — explicit reject, never silent drop (AC-1) ───────
function handleInvalid(input, reason, accessLog) {
  logFallback(reason, typeof input === 'object' ? input : {}, accessLog);
  return {
    error: 'INVALID_INPUT',
    code: 'ADAPTER_REJECT',
    reason,
    logged: true
  };
}

// ─── Extract text for dispatcher ─────────────────────────────────────
function extractText(parsed) {
  return parsed.content?.text || parsed.text || '';
}

// ─── Main Adapter (original — standalone with stub backend) ──────────
// Kept for backward compatibility with existing tests
async function adapter(uiRequest) {
  const parsed = parseInput(uiRequest);

  // Validate source
  const sourceType = parsed.source?.type || parsed.source || 'manual_paste';
  validateSource(sourceType);

  // Build event
  const event = toEvent(parsed);

  return {
    ...event,
    backend_used: 'default',
    layers: {
      layer1: {
        patterns: {},
        gate: [false, false, false],
        acri: 0,
        vri: 0,
        version: 'default-stub'
      }
    },
    metadata: {
      processing_time_ms: 0,
      engine_version: 'adapter-v0.1.1',
      fallback_occurred: false
    }
  };
}

// ─── AC-1: process() — adapter → dispatcher pipeline ─────────────────
// This is the new entry point that connects adapter to dispatcher.
// adapter is stateless; dispatcher orchestrates L1→L2→L3→L4.
//
// Flow: platformMsg → normalize(toEvent) → validate → dispatcher.pipeline(text, options) → l4Export
//
async function process(platformMsg, dispatcher, options = {}) {
  const { accessLog = [] } = options;
  const startTime = Date.now();

  // Step 1: Parse input
  const parsed = parseInput(platformMsg);

  // Step 2: Validate source
  const sourceType = parsed.source?.type || parsed.source || 'manual_paste';
  try {
    validateSource(sourceType);
  } catch (err) {
    return handleInvalid(parsed, err.message, accessLog);
  }

  // Step 3: Extract text — adapter needs text to hand to dispatcher
  const text = extractText(parsed);
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return handleInvalid(parsed, 'empty or missing text field', accessLog);
  }

  // Step 4: Build normalized event metadata (for traceability)
  const event = toEvent(parsed);

  // Step 4b: REG-CB-12 — Reject unknown domain enums
  if (event._enum_migration && !event._enum_migration.valid) {
    return handleInvalid(parsed, `Unknown domain enum: ${event._enum_migration.domain} (not in v0.1 or v0.2)`, accessLog);
  }

  // Step 5: Log successful adapter pass (AC-3 requirement)
  accessLog.push({
    timestamp: new Date().toISOString(),
    action: 'ADAPTER_PASS',
    request_id: event.request_id,
    source: sourceType,
    conversation_id: event.conversation_id || null,
    text_length: text.length
  });

  // Step 6: Hand off to dispatcher (dispatcher orchestrates L1→L2→L3→L4)
  // adapter does NOT orchestrate — it only normalizes and validates
  const pipelineOptions = {
    source: sourceType,
    nodeId: event.domain || 'default',
    lang: parsed.language || parsed.lang || 'en',
    formatType: options.formatType || 'dashboard'
  };

  const pipelineResult = dispatcher.pipeline(text, pipelineOptions);

  // Step 7: Build l4-export combining adapter metadata + pipeline result
  const processingTime = Date.now() - startTime;

  return {
    request_id: event.request_id,
    domain: event.domain,
    scenario: event.scenario,
    tier: event.tier,
    conversation_id: event.conversation_id,
    source: sourceType,

    // Pipeline result (L1→L2→L3→L4)
    event: pipelineResult.event,
    aggregate: pipelineResult.aggregate,
    output: pipelineResult.output,

    // Adapter metadata
    adapter: {
      engine_version: 'adapter-v0.2.0',
      processing_time_ms: processingTime,
      fallback_occurred: false
    },
    pipeline_version: pipelineResult.pipeline_version
  };
}

module.exports = {
  adapter,          // Original standalone (backward compat)
  process,          // AC-1: adapter → dispatcher pipeline
  parseInput,
  validateSource,
  toEvent,
  routeRequest,
  logFallback,
  handleInvalid,
  extractText,
  migrateDomain,    // REG-CB-12: enum migration utility
};

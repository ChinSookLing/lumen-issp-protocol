// src/telegram/webhook-server.js
// Telegram Webhook Server — Step 13 First Node
// Owner: Tuzi (deploy) + Node-01 (code)
//
// Changelog:
//   c157: Initial version (Node-01) — pipeline TODO
//   Lumen-16: Pipeline connected + /start consent gate + whitelist

'use strict';

const http = require('node:http');
const { parseTelegramUpdate } = require('./telegram-adapter');
const { applyView } = require('../output/view-engine');
const { addMessage: accAddMessage, startSweep, stopSweep, flush: accFlush, releaseLock: accReleaseLock } = require('./accumulator');

// Dashboard MVP — S11-DASH-01
const dashStore = require('../dashboard/dashboard-store');

// Pipeline — the core
let pipelineFn;
let evaluateLongTextFn;
let adaptL1toFlatFn;
let runOutputFn;
try {
  pipelineFn = require('../pipeline/dispatcher').pipeline;
  adaptL1toFlatFn = require('../pipeline/dispatcher').adaptL1toFlat;
  runOutputFn = require('../pipeline/dispatcher').runOutput;
  evaluateLongTextFn = require('../../core/evaluator').evaluateLongText;
} catch (err) {
  console.error('[webhook] WARNING: dispatcher not found, running in stub mode');
  pipelineFn = null;
}

// === Layer 2b-lite: Flag Detection ===
let detectL2bFlagsFn;
try {
  detectL2bFlagsFn = require('../pipeline/l2b-lite-detector').detectL2bFlags;
} catch (err) {
  console.error('[webhook] WARNING: l2b-lite-detector not found');
  detectL2bFlagsFn = null;
}

// === Simple Advice Templates ===
let adviceTemplates;
try {
  adviceTemplates = require('../../config/simple_advice_templates.v0.1.json');
} catch (err) {
  console.error('[webhook] WARNING: simple_advice_templates not found');
  adviceTemplates = null;
}

// Config
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const DASHBOARD_TOKEN = process.env.DASHBOARD_TOKEN || null; // Set to require auth on /dashboard + /api/*

// ============================================================
// Consent Gate — in-memory whitelist (resets on restart)
// Users must /start to acknowledge privacy statement before
// Lumen processes their group's messages.
// ============================================================
const consentedChats = new Set();

const PRIVACY_STATEMENT = [
  '<b>\u{1F6E1}\uFE0F Lumen Protocol \u2014 \u96B1\u79C1\u8072\u660E</b>',
  '',
  '\u672C Bot \u662F Lumen ISSP \u5354\u8B70\u7684\u89C0\u5BDF\u7BC0\u9EDE\uFF08Private Beta\uFF09\u3002',
  '',
  '\u2022 Lumen <b>\u4E0D\u5132\u5B58</b>\u4EFB\u4F55\u539F\u59CB\u8A0A\u606F\u6587\u5B57\uFF08\u00A72.2\uFF09',
  '\u2022 \u6240\u6709\u5206\u6790\u5728<b>\u672C\u5730\u5B8C\u6210</b>\uFF0C\u4E0D\u4E0A\u50B3\u81F3\u5916\u90E8\u4F3A\u670D\u5668',
  '\u2022 \u5075\u6E2C\u7D50\u679C\u50C5\u70BA<b>\u89C0\u5BDF</b>\uFF0C\u4E0D\u662F\u8A3A\u65B7\u6216\u884C\u52D5\u5EFA\u8B70',
  '\u2022 \u4F60\u53EF\u4EE5\u96A8\u6642\u4F7F\u7528 /stop \u505C\u6B62\u89C0\u5BDF',
  '',
  '<i>\u26A0\uFE0F \u9019\u662F\u81EA\u52D5\u5316\u89C0\u5BDF\u5DE5\u5177\uFF0C\u4E0D\u66FF\u4EE3\u5C08\u696D\u5224\u65B7\u3002</i>',
  '<i>\u26A0\uFE0F Private Beta \u2014 \u50C5\u4F9B\u6E2C\u8A66\u7528\u9014\u3002</i>',
  '',
  '\u89C0\u5BDF\u5DF2\u555F\u7528 \u2705',
].join('\n');

const ALREADY_ACTIVE_MSG = '\u2705 Lumen \u89C0\u5BDF\u5DF2\u555F\u7528\u3002\u5982\u9700\u505C\u6B62\uFF0C\u8F38\u5165 /stop\u3002';
const STOP_MSG = '\u{1F534} Lumen \u89C0\u5BDF\u5DF2\u505C\u6B62\u3002\u8F38\u5165 /start \u53EF\u91CD\u65B0\u555F\u7528\u3002';
const HELP_MSG = [
  '<b>\u{1F6E1}\uFE0F Lumen Bot \u6307\u4EE4</b>',
  '',
  '/start \u2014 \u555F\u7528\u89C0\u5BDF\uFF08\u9700\u5148\u95B1\u8B80\u96B1\u79C1\u8072\u660E\uFF09',
  '/stop \u2014 \u505C\u6B62\u89C0\u5BDF',
  '/status \u2014 \u67E5\u770B\u76EE\u524D\u72C0\u614B',
  '/help \u2014 \u986F\u793A\u6B64\u8AAA\u660E',
].join('\n');

/**
 * Send a message via Telegram Bot API.
 */
async function sendTelegramMessage(chatId, text, options = {}) {
  if (!BOT_TOKEN) {
    console.error('[webhook] TELEGRAM_BOT_TOKEN not set');
    return null;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({
    chat_id: chatId,
    text,
    parse_mode: options.parseMode || 'HTML',
    ...(options.replyToMessageId ? { reply_to_message_id: options.replyToMessageId } : {}),
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    return await response.json();
  } catch (err) {
    console.error('[webhook] sendMessage error:', err.message);
    return null;
  }
}

/**
 * Set the webhook URL with Telegram.
 */
async function setWebhook() {
  if (!BOT_TOKEN || !WEBHOOK_URL) {
    console.error('[webhook] Missing TELEGRAM_BOT_TOKEN or WEBHOOK_URL');
    return false;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
  const body = JSON.stringify({
    url: WEBHOOK_URL,
    allowed_updates: ['message', 'edited_message', 'channel_post'],
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const result = await response.json();
    console.log('[webhook] setWebhook result:', result.ok ? 'SUCCESS' : result.description);
    return result.ok;
  } catch (err) {
    console.error('[webhook] setWebhook error:', err.message);
    return false;
  }
}

/**
 * Send JSON response with CORS headers.
 */
/**
 * Dashboard auth guard — if DASHBOARD_TOKEN is set, require ?token= or Authorization header.
 * Returns true if authorized, false if blocked (response already sent).
 * If DASHBOARD_TOKEN is not set, always returns true (open access).
 */
function checkDashboardAuth(req, res) {
  if (!DASHBOARD_TOKEN) return true; // No token configured = open
  const url = new URL(req.url, `http://localhost`);
  const queryToken = url.searchParams.get('token');
  const headerToken = (req.headers.authorization || '').replace('Bearer ', '');
  if (queryToken === DASHBOARD_TOKEN || headerToken === DASHBOARD_TOKEN) {
    return true;
  }
  sendJson(res, 401, { error: 'Unauthorized — set ?token= or Authorization header' });
  return false;
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'X-Lumen-Tier': '0',
    'X-Contains-Raw-Text': 'false',
  });
  res.end(body);
}

/**
 * Format detection result into Telegram reply.
 * Respects L4 UI Constraints + SAFE mode.
 * Level 1 = Silent (no reply). Level 2+ = observable signal.
 *
 * @param {object} output - pipeline().output
 * @returns {string|null} Formatted HTML text, or null for Silent mode
 */
function formatReply(output) {
  if (!output || !output.alert) return null;

  const alert = output.alert;

  // Level 1 = Silent Audit Trail — no reply to user
  if (alert.effective_level <= 1) return null;

  // Level 2+ = observable signal
  const levelConfig = {
    2: { emoji: '\u{1F535}', label: '\u4F4E\u5EA6\u4FE1\u865F' },
    3: { emoji: '\u{1F7E1}', label: '\u4E2D\u5EA6\u4FE1\u865F' },
    4: { emoji: '\u{1F7E0}', label: '\u9AD8\u5EA6\u4FE1\u865F' },
    5: { emoji: '\u{1F534}', label: '\u9700\u8981\u95DC\u6CE8' },
  };

  const config = levelConfig[alert.effective_level] || levelConfig[2];
  const pattern = alert.pattern || 'unknown';
  const pushScore = alert.channels?.push?.score || 0;
  const vacuumScore = alert.channels?.vacuum?.score || 0;

  let text = `${config.emoji} <b>Lumen \u89C0\u5BDF \u2014 ${config.label}</b>\n`;
  text += `\u6A21\u5F0F\uFF1A${pattern}`;

  if (pushScore > 0) text += ` | ACRI: ${pushScore.toFixed(2)}`;
  if (vacuumScore > 0) text += ` | VRI: ${vacuumScore.toFixed(2)}`;
  text += '\n';

  // SAFE mode marker (M88 V1 — 5 hard limits)
  text += '\n<i>[\u5047\u8A2D\u751F\u6210 \u2014 \u4F4E\u4FE1\u5FC3] \u50C5\u4F9B\u53C3\u8003</i>\n';

  // Hand-off notice for Level 4+
  if (alert.requires_handoff) {
    text += '\n\u26A0\uFE0F <b>\u5EFA\u8B70\u8207\u4FE1\u4EFB\u7684\u4EBA\u8A0E\u8AD6\u3002</b>\n';
  }


  // --- L2b-lite flags (if any) ---
  const l2b = output._l2b;
  if (l2b && l2b.flags && l2b.flags.length > 0) {
    text += '\n';
    for (const flagKey of l2b.flags) {
      const detail = l2b.details[flagKey];
      const label = detail?.label?.zh || flagKey;
      text += `\u{1F6A9} <b>${label}</b>\n`;
    }
  }

  // --- Simple Advice (from templates) ---
  if (adviceTemplates && adviceTemplates.templates) {
    let tier = 'BLUE';
    if (alert.effective_level >= 4) tier = 'ORANGE';
    else if (alert.effective_level >= 3) tier = 'YELLOW';
    if (l2b && l2b.flags && l2b.flags.length > 0 && tier === 'BLUE') {
      tier = 'YELLOW';
    }
    const template = adviceTemplates.templates[tier];
    if (template) {
      text += `\n${template.badge} <i>${template.simple_advice}</i>\n`;
    }
  }
  // Mandatory disclaimer (L4 Public Contract)
  text += '\n<i>\u26A0\uFE0F \u9019\u662F\u81EA\u52D5\u5316\u89C0\u5BDF\uFF0C\u4E0D\u662F\u8A3A\u65B7\u3002Lumen \u4E0D\u63D0\u4F9B\u884C\u52D5\u5EFA\u8B70\u3002</i>';

  return text;
}

/**
 * Handle /start, /stop, /status, /help commands.
 * @returns {boolean} true if command was handled
 */
async function handleCommand(parsed) {
  const { chatId, command } = parsed;

  switch (command) {
    case '/start':
      if (consentedChats.has(chatId)) {
        await sendTelegramMessage(chatId, ALREADY_ACTIVE_MSG);
      } else {
        consentedChats.add(chatId);
        await sendTelegramMessage(chatId, PRIVACY_STATEMENT);
        console.log(`[webhook] Consent granted: chat ${chatId}`);
      }
      return true;

    case '/stop':
      consentedChats.delete(chatId);
      accFlush(chatId, 'user_stop'); // Clear accumulator buffer without processing
      await sendTelegramMessage(chatId, STOP_MSG);
      console.log(`[webhook] Consent revoked: chat ${chatId}`);
      return true;

    case '/status':
      if (consentedChats.has(chatId)) {
        await sendTelegramMessage(chatId, '\u2705 Lumen \u89C0\u5BDF\u4E2D\u3002');
      } else {
        await sendTelegramMessage(chatId, '\u23F8\uFE0F Lumen \u672A\u555F\u7528\u3002\u8F38\u5165 /start \u958B\u59CB\u3002');
      }
      return true;

    case '/help':
      await sendTelegramMessage(chatId, HELP_MSG);
      return true;

    default:
      return false;
  }
}

/**
 * Handle incoming webhook request.
 */
async function handleWebhook(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // ── GET routes ────────────────────────────────────────────
  if (req.method === 'GET') {
    // Health check
    if (pathname === '/' || pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Lumen ISSP Node — OK');
      return;
    }

    // Dashboard API: GET /api/recent?limit=20
    if (pathname === '/api/recent') {
      if (!checkDashboardAuth(req, res)) return;
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const items = dashStore.getRecent(limit);
      const stats = dashStore.getStats();
      sendJson(res, 200, {
        items,
        count: items.length,
        total: stats.count,
        _meta: { tier: 0, contains_raw_text: false },
      });
      return;
    }

    // Dashboard API: GET /api/item/:requestId
    if (pathname.startsWith('/api/item/')) {
      if (!checkDashboardAuth(req, res)) return;
      const requestId = pathname.slice('/api/item/'.length);
      if (!requestId) {
        sendJson(res, 400, { error: 'Missing requestId' });
        return;
      }
      const item = dashStore.getByRequestId(requestId);
      if (!item) {
        sendJson(res, 404, { error: 'Item not found' });
        return;
      }
      sendJson(res, 200, {
        item,
        _meta: { tier: 0, contains_raw_text: false },
      });
      return;
    }

    // Dashboard API: GET /api/stats
    if (pathname === '/api/stats') {
      if (!checkDashboardAuth(req, res)) return;
      sendJson(res, 200, dashStore.getStats());
      return;
    }

    // Dashboard static page
    if (pathname === '/dashboard') {
      if (!checkDashboardAuth(req, res)) return;
      const fs = require('node:fs');
      const path = require('node:path');
      const htmlPath = path.join(__dirname, '..', 'dashboard', 'index.html');
      try {
        const html = fs.readFileSync(htmlPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      } catch (e) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Dashboard not found');
      }
      return;
    }
    // Static assets from public/
    const fs = require('node:fs');
    const path = require('node:path');
    const publicPath = path.join(__dirname, '..', '..', 'public', pathname);
    const ext = path.extname(pathname).toLowerCase();
    const mimeTypes = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.css': 'text/css', '.js': 'text/javascript' };
    if (mimeTypes[ext]) {
      try {
        const file = fs.readFileSync(publicPath);
        res.writeHead(200, { 'Content-Type': mimeTypes[ext], 'Cache-Control': 'public, max-age=86400' });
        res.end(file);
        return;
      } catch (e) {
        // Fall through to 404
      }
    }


    // Paste Mode — static page
    if (pathname === '/paste-mode.html' || pathname === '/paste') {
      const fs = require('node:fs');
      const path = require('node:path');
      const htmlPath = path.join(__dirname, '..', '..', 'public', 'paste-mode.html');
      try {
        const html = fs.readFileSync(htmlPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      } catch (e) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Paste mode page not found');
      }
      return;
    }

    // Unknown GET
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  // ── POST /api/analyze (Paste Mode) ────────────────────────
  if (req.method === 'POST' && pathname === '/api/analyze') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const text = String(data?.text || '').trim();

        if (!text || text.length < 10) {
          sendJson(res, 400, { ok: false, error: 'text_too_short' });
          return;
        }
        if (text.length > 8000) {
          sendJson(res, 413, { ok: false, error: 'text_too_long' });
          return;
        }
        if (!evaluateLongTextFn || !adaptL1toFlatFn || !runOutputFn) {
          sendJson(res, 500, { ok: false, error: 'pipeline_not_loaded' });
          return;
        }

        const l1Result = evaluateLongTextFn(text);
        const det = adaptL1toFlatFn(l1Result);

        let l2bFlags = { flags: [], details: {} };
        if (detectL2bFlagsFn) {
          try { l2bFlags = detectL2bFlagsFn(text, { lang: 'zh' }); } catch (_) {}
        }

        const result = runOutputFn(det, null, {
          source: 'manual_paste', lang: 'zh-TW', nodeId: 'paste_mode',
        });
        result._l2b = l2bFlags;

        const alert = result.alert || {};
        const acri = alert.channels?.push?.score || det.acri || 0;
        const vri = alert.channels?.vacuum?.score || det.vri || 0;
        const patterns = (det.patterns || []).map(p => ({
          pattern: p.id || p.pattern || p,
          score: p.confidence || p.score || 0
        }));
        const level = alert.effective_level || 0;
        const flags = (l2bFlags.flags || []).map(f => ({
          key: f, label: l2bFlags.details?.[f]?.label?.zh || f
        }));

        let advice;
        if (level >= 4) advice = '偵測到較強的操控結構。建議：保護自己，不要在壓力下做任何承諾或決定。';
        else if (level >= 3) advice = '偵測到中度操控結構。建議：不要馬上做決定，找信任的人討論。';
        else if (level >= 2) advice = '偵測到輕微的操控跡象。建議：先暫停回覆，給自己時間思考。';
        else advice = '這段訊息看起來沒有明顯的操控結構。但如果你仍然感到不安，請相信自己的直覺。';

        sendJson(res, 200, {
          ok: true, acri: parseFloat(acri.toFixed(3)),
          vri: parseFloat(vri.toFixed(3)), level, patterns, flags, advice,
          safe_mode: true, timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('[analyze] Error:', err.message);
        sendJson(res, 500, { ok: false, error: 'analysis_failed' });
      }
    });
    return;
  }

  // ── OPTIONS /api/analyze (CORS preflight) ──────────────────
  if (req.method === 'OPTIONS' && pathname === '/api/analyze') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }



  // ── POST /webhook (Telegram) ──────────────────────────────
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
    return;
  }

  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', async () => {
    try {
      const update = JSON.parse(body);
      const parsed = parseTelegramUpdate(update);

      if (!parsed) {
        res.writeHead(200);
        res.end('OK');
        return;
      }

      // === Command handling ===
      if (parsed.type === 'command') {
        await handleCommand(parsed);
        res.writeHead(200);
        res.end('OK');
        return;
      }

      // === Non-text content ===
      if (parsed.type === 'unsupported' || !parsed.text) {
        res.writeHead(200);
        res.end('OK');
        return;
      }

      // === Consent gate: only process if /start was used ===
      if (!consentedChats.has(parsed.chatId)) {
        res.writeHead(200);
        res.end('OK');
        return;
      }

      // === Pipeline processing (via accumulator) ===
      if (!pipelineFn) {
        console.log('[webhook] Stub mode — no pipeline available');
        res.writeHead(200);
        res.end('OK');
        return;
      }

      // Add message to accumulator buffer
      const flushResult = accAddMessage(parsed.chatId, parsed.text);

      if (!flushResult) {
        // Buffering — no trigger yet, acknowledge to Telegram
        res.writeHead(200);
        res.end('OK');
        return;
      }

      // Accumulator triggered — run merged text through pipeline
      await processFlush(parsed.chatId, flushResult, parsed.messageId);

      res.writeHead(200);
      res.end('OK');
    } catch (err) {
      console.error('[webhook] Error:', err.message);
      res.writeHead(200);
      res.end('OK');
    }
  });
}

/**
 * Process a flush result through the pipeline and send reply.
 * Used by both webhook trigger and idle sweep callback.
 *
 * Path: mergedText → evaluateLongText → adaptL1toFlat → runOutput → formatReply
 *
 * @param {string} chatId
 * @param {object} flushResult - { mergedText, reason, messageCount }
 * @param {number|null} replyToMessageId - Message to reply to (null for idle flush)
 */
async function processFlush(chatId, flushResult, replyToMessageId = null) {
  const { mergedText, reason, messageCount } = flushResult;

  console.log(`[accumulator] flush chat=${chatId} reason=${reason} msgs=${messageCount} chars=${mergedText.length}`);

  try {
    // P1.2 fix: explicit null guards for pipeline functions (fail-closed)
    if (!evaluateLongTextFn || !adaptL1toFlatFn || !runOutputFn) {
      console.error(`[pipeline] FAIL-CLOSED chat=${chatId}: pipeline functions not loaded (stub mode)`);
      return;
    }

    // Use evaluateLongText for merged multi-turn text
    const l1Result = evaluateLongTextFn(mergedText);
    const det = adaptL1toFlatFn(l1Result);

    // --- Layer 2b-lite: Flag Detection ---
    let l2bFlags = { flags: [], details: {} };
    if (detectL2bFlagsFn) {
      try {
        l2bFlags = detectL2bFlagsFn(mergedText, { lang: 'zh' });
        if (l2bFlags.flags.length > 0) {
          console.log(`[l2b-lite] chat=${chatId} flags=[${l2bFlags.flags.join(',')}]`);
        }
      } catch (l2bErr) {
        console.error('[l2b-lite] detection error:', l2bErr.message);
      }
    }
    const result = runOutputFn(det, null, {
      source: 'telegram',
      lang: 'en',
      nodeId: chatId,
    });
    // Attach L2b flags to result for formatReply
    result._l2b = l2bFlags;

    // Log for audit trail (no raw text — only pattern + score)
    const alert = result.alert;
    if (alert) {
      console.log(
        `[pipeline] chat=${chatId} level=${alert.effective_level} ` +
        `pattern=${alert.pattern || 'none'} ` +
        `acri=${alert.channels?.push?.score?.toFixed(3) || '0'} ` +
        `vri=${alert.channels?.vacuum?.score?.toFixed(3) || '0'} ` +
        `trigger=${reason}`
      );
    }

    // Apply user_guard view
    const viewResult = applyView('user_guard', result);
    if (viewResult) {
      console.log(`[view] user_guard: color=${viewResult.risk_level_color} label=${viewResult.threat_type_label}`);
    }

    // Format reply — null means Silent mode (Level 1)
    const reply = formatReply(result);

    // B2 optimization: send Telegram reply FIRST (user-facing latency)
    if (reply) {
      await sendTelegramMessage(chatId, reply, {
        ...(replyToMessageId ? { replyToMessageId } : {}),
      });
    }

    // THEN store to Dashboard (async, non-blocking for user)
    // S11-DASH-01: Store result for Dashboard API (R9 isolation layer)
    try {
      dashStore.addResult(result, {
        chatId,
        source: 'telegram',
        trigger_reason: reason,
      });
    } catch (dashErr) {
      console.error('[dashboard] store error:', dashErr.message);
    }
  } catch (err) {
    console.error(`[accumulator] pipeline error chat=${chatId}:`, err.message);
  } finally {
    // P1.1 fix: release per-chat lock AFTER all async processing completes
    accReleaseLock(chatId);
  }
}

/**
 * Create and start the webhook server.
 */
function createServer() {
  const server = http.createServer(handleWebhook);

  server.listen(PORT, () => {
    console.log(`[webhook] Lumen Telegram Bot listening on port ${PORT}`);
    console.log(`[webhook] Pipeline: ${pipelineFn ? 'CONNECTED' : 'STUB MODE'}`);
    console.log(`[webhook] SAFE mode: ON`);
    console.log(`[webhook] Silent mode: ON (Level 1 = no reply)`);
    console.log(`[webhook] Consent gate: ON (/start required)`);
    console.log(`[webhook] Accumulator: ON (N=6, char≥600, idle=90s)`);

    // Start accumulator idle sweep — flushes idle buffers through pipeline
    if (pipelineFn) {
      startSweep(async (chatId, flushResult) => {
        // Only process idle flushes for consented chats
        if (consentedChats.has(chatId)) {
          await processFlush(chatId, flushResult);
        } else {
          // Release lock even if we skip processing (P1.1 completeness)
          accReleaseLock(chatId);
        }
      });
    }

    if (BOT_TOKEN && WEBHOOK_URL) {
      setWebhook();
    } else {
      console.log('[webhook] Set TELEGRAM_BOT_TOKEN and WEBHOOK_URL to connect to Telegram');
    }
  });

  return server;
}

module.exports = {
  createServer,
  handleWebhook,
  handleCommand,
  sendTelegramMessage,
  setWebhook,
  formatReply,
  processFlush,
  consentedChats,
};

if (require.main === module) {
  createServer();
}

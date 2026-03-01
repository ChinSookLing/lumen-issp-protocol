#!/usr/bin/env node
// index.js — Lumen ISSP Protocol Server
// Entry point for Render (cloud) and Docker (self-host)
//
// Wiring:
//   /health              → 200 OK (Step 17A healthcheck)
//   /webhook             → Telegram Bot Adapter (Step 13)
//   /api/feedback        → Feedback Pipeline (Step 21A)
//   /api/feedback/stats  → Feedback Stats (Step 21A)
//   /api/metrics         → Metrics snapshot (Step 24A)
//   /api/metrics/live    → Live metrics (Step 24A)
//   /dashboard           → Dashboard static files (Phase 1)
//
// Authorization: M95-D02 (Sprint 13 Scope Lock · 6/6 unanimous)
// Owner: Node-01 (Architect)
// Sprint 13 — c215

'use strict';

const express = require('express');
const path = require('path');

// --- API modules ---
const feedback = require('./api/feedback');
const metrics = require('./api/metrics');

// --- Config ---
const PORT = process.env.PORT || 3000;
const DASHBOARD_ENABLED = process.env.DASHBOARD_ENABLED !== 'false';
const LUMEN_VERSION = process.env.LUMEN_VERSION || '1.0.0';
const startTime = Date.now();

// --- Express app ---
const app = express();
app.use(express.json());

// ─── Health Check (Step 17A) ────────────────────────────────────────
app.get('/health', (req, res) => {
  metrics.recordHealthCheck(true);
  res.json({
    status: 'ok',
    version: LUMEN_VERSION,
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    node: process.env.NODE_ID || 'reference',
    timestamp: new Date().toISOString()
  });
});

// ─── Telegram Webhook (Step 13) ─────────────────────────────────────
// Only mount if TELEGRAM_BOT_TOKEN is set
if (process.env.TELEGRAM_BOT_TOKEN) {
  const { parseTelegramUpdate, handleWebhookUpdate } = (() => {
    try {
      const bot = require('./src/adapter/telegram-bot');
      return bot;
    } catch (e) {
      console.log('⚠️  Telegram bot module not fully loaded:', e.message);
      return { parseTelegramUpdate: null, handleWebhookUpdate: null };
    }
  })();

  if (parseTelegramUpdate) {
    app.post('/webhook', async (req, res) => {
      try {
        if (typeof handleWebhookUpdate === 'function') {
          await handleWebhookUpdate(req, res);
        } else {
          // Fallback: parse and acknowledge
          const { parsed, skip_reason } = parseTelegramUpdate(req.body);
          if (skip_reason) {
            res.json({ ok: true, skipped: skip_reason });
          } else {
            res.json({ ok: true, received: true });
          }
        }
      } catch (err) {
        console.error('Webhook error:', err.message);
        res.status(200).json({ ok: true, error: 'internal' });
      }
    });
    console.log('📱 Telegram webhook mounted at /webhook');
  }
} else {
  console.log('ℹ️  TELEGRAM_BOT_TOKEN not set — webhook disabled');
}

// ─── Feedback Pipeline (Step 21A) ───────────────────────────────────
feedback.initStore();
feedback.registerRoutes(app);
console.log('📝 Feedback pipeline mounted at /api/feedback');

// ─── Metrics (Step 24A) ─────────────────────────────────────────────
metrics.registerRoutes(app);
console.log('📊 Metrics mounted at /api/metrics');

// ─── Dashboard (Phase 1) ────────────────────────────────────────────
if (DASHBOARD_ENABLED) {
  const publicDir = path.join(__dirname, 'public');
  app.use('/dashboard', express.static(publicDir));
  app.use(express.static(publicDir));
  console.log('📋 Dashboard mounted at /dashboard');
}
    // ─── Paste Mode: /api/analyze (c223) ─────────────────────────────────
(() => {
  const dispatcher = require('./src/pipeline/dispatcher');

  app.options('/api/analyze', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(204);
  });

  app.post('/api/analyze', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');
    try {
      const text = String(req.body?.text || '').trim();
      if (!text || text.length < 10) {
        return res.status(400).json({ ok: false, error: 'text_too_short' });
      }
      if (text.length > 8000) {
        return res.status(413).json({ ok: false, error: 'text_too_long' });
      }

      const result = dispatcher.pipeline(text, {
        source: 'manual_paste',
        nodeId: 'paste_mode',
        lang: 'zh-TW',
        formatType: 'dashboard'
      });

      const l1 = result.event?.layers?.layer1 || {};
      const acri = l1.acri || 0;
      const patterns = (l1.patterns || []).map(p => ({
        pattern: p.id || p.pattern || p,
        score: p.confidence || p.score || 0
      }));
      const responseLevel = result.output?.alert?.response_level || 0;
      const explanation = result.output?.explanation?.text || '';

      let advice;
      if (acri >= 0.6) {
        advice = '偵測到較強的操控結構。建議：保護自己，不要在壓力下做任何承諾或決定。';
      } else if (acri >= 0.35) {
        advice = '偵測到中度操控結構。建議：不要馬上做決定，找信任的人討論。';
      } else if (acri >= 0.15) {
        advice = '偵測到輕微的操控跡象。建議：先暫停回覆，給自己時間思考。';
      } else {
        advice = '這段訊息看起來沒有明顯的操控結構。但如果你仍然感到不安，請相信自己的直覺。';
      }

      return res.json({
        ok: true, acri, level: responseLevel, patterns, advice,
        explanation: explanation || undefined,
        safe_mode: true,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('[analyze] Error:', err.message);
      return res.status(500).json({ ok: false, error: 'analysis_failed' });
    }
  });

  console.log('🔭 Paste Mode mounted at /api/analyze');
})();



// ─── Root ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'Lumen ISSP Protocol',
    version: LUMEN_VERSION,
    status: 'live',
    endpoints: {
      health: '/health',
      webhook: '/webhook',
      feedback: '/api/feedback',
      feedback_stats: '/api/feedback/stats',
      metrics: '/api/metrics',
      metrics_live: '/api/metrics/live',
      dashboard: DASHBOARD_ENABLED ? '/dashboard' : 'disabled'
    },
    license: 'Apache-2.0',
    repo: 'https://github.com/ChinSookLing/lumen-issp-protocol'
  });
});

// ─── Start ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🌙 Lumen ISSP Protocol Server');
  console.log(`   Version:  ${LUMEN_VERSION}`);
  console.log(`   Port:     ${PORT}`);
  console.log(`   Health:   http://localhost:${PORT}/health`);
  console.log(`   Mode:     ${process.env.DEPLOY_MODE || 'cloud'}`);
  console.log(`   Node:     ${process.env.NODE_ID || 'reference'}`);
  console.log('');
  console.log('   Ready. 🚀');
  console.log('');
});

module.exports = app;

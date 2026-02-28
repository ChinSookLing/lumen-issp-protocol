/**
 * forecast-wiring.test.js
 * Sprint 8 — L3 ↔ Dispatcher 接線驗證
 *
 * 目的：驗證 runForecast() 能正確傳遞格式給 computeTrend()，
 *       拿到非 null 的 forecast 結果。
 *
 * 設計：Node-01 (Lumen-7)
 * 日期：2026-02-18
 */

const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { runForecast } = require("../../src/pipeline/dispatcher");

/**
 * 產生 N 個假 Event 物件，模擬 processMessage() 的輸出格式
 * @param {string} pattern - Pattern ID (e.g. 'MB')
 * @param {number} count - 要產生幾個
 * @param {object} opts - 可選配置
 * @returns {object[]} Event 陣列
 */
function makeFakeEvents(pattern, count, opts = {}) {
  const {
    baseDays = 1,
    intensityBase = 0.3,
    intensityStep = 0.01
  } = opts;

  const events = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const ts = new Date(now - (count - i) * baseDays * 86400000).toISOString();
    events.push({
      event_id: `evt_fake_${i}`,
      timestamp: ts,
      source: "test",
      node_id: "test-node",
      lang: "en",
      input_hash: `fake${i}`,
      layers: {
        layer1: {
          patterns: [
            {
              id: pattern,
              confidence: intensityBase + i * intensityStep,
              score: intensityBase + i * intensityStep
            }
          ],
          acri: intensityBase + i * intensityStep,
          vri: 0,
          response_level: 1,
          gate_hits: { push: { q1: true, q2: false }, vacuum: {} }
        },
        layer2: {
          components: {},
          mapping_version: "v0.1.0"
        }
      }
    });
  }
  return events;
}

// ============================================================
// Tests
// ============================================================

describe("forecast wiring — L3 接線驗證", () => {
  test("35 個 MB events → forecast 不為 null", () => {
    const events = makeFakeEvents("MB", 35);
    const agg = runForecast(events, "MB", { windowDays: 90 });

    assert.ok(agg.forecast, "forecast should not be null with 35 events");
    assert.strictEqual(agg.forecast.pattern, "MB");
    assert.ok(["LOW", "MEDIUM", "HIGH"].includes(agg.forecast.trendBand));
    assert.strictEqual(typeof agg.forecast.slope, "number");
    assert.strictEqual(typeof agg.forecast.avg_intensity, "number");
    assert.strictEqual(typeof agg.forecast.probability, "number");
    assert.strictEqual(typeof agg.forecast.confidence, "number");
    assert.ok(agg.forecast.aligned_examples.length <= 3);
    assert.ok(agg.data_points >= 30);
  });

  test("30 個 FC events（最低門檻）→ forecast 有值", () => {
    const events = makeFakeEvents("FC", 30, { intensityBase: 0.5 });
    const agg = runForecast(events, "FC", { windowDays: 90 });

    assert.ok(agg.forecast, "forecast should not be null at minimum 30 threshold");
    assert.strictEqual(agg.forecast.pattern, "FC");
  });

  test("29 個 events（低於門檻）→ forecast 為 null", () => {
    const events = makeFakeEvents("EP", 29);
    const agg = runForecast(events, "EP", { windowDays: 90 });

    assert.strictEqual(agg.forecast, null, "forecast should be null below 30 threshold");
  });

  test("上升趨勢 → slope 為正", () => {
    const events = makeFakeEvents("MB", 40, {
      intensityBase: 0.1,
      intensityStep: 0.015
    });
    const agg = runForecast(events, "MB", { windowDays: 90 });

    assert.ok(agg.forecast, "forecast should exist");
    assert.ok(agg.forecast.slope > 0, `slope should be positive, got ${agg.forecast.slope}`);
  });

  test("不同 pattern 不互相污染", () => {
    const mbEvents = makeFakeEvents("MB", 35);
    const fcEvents = makeFakeEvents("FC", 35);
    const allEvents = [...mbEvents, ...fcEvents];

    const mbAgg = runForecast(allEvents, "MB", { windowDays: 90 });
    const fcAgg = runForecast(allEvents, "FC", { windowDays: 90 });

    assert.ok(mbAgg.forecast);
    assert.ok(fcAgg.forecast);
    assert.strictEqual(mbAgg.forecast.pattern, "MB");
    assert.strictEqual(fcAgg.forecast.pattern, "FC");
  });

  test("aggregate 結構完整", () => {
    const events = makeFakeEvents("GC", 35);
    const agg = runForecast(events, "GC", { windowDays: 90 });

    assert.ok(agg.aggregate_id.startsWith("agg_"));
    assert.ok(agg.timestamp);
    assert.strictEqual(agg.window_days, 90);
    assert.strictEqual(agg.target_pattern, "GC");
    assert.ok(Array.isArray(agg.event_refs));
    assert.strictEqual(agg.event_refs.length, 35);
  });
});

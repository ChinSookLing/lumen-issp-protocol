/**
 * dispatcher.test.js
 * Sprint 8 — End-to-End Pipeline Smoke Tests
 * 設計：Node-01 (Architect)
 * 日期：2026-02-17
 */

const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

const {
  pipeline,
  processMessage,
  runForecast,
  runOutput
} = require("../../src/pipeline/dispatcher");

describe("dispatcher — pipeline structure", () => {
  test("pipeline returns correct shape", () => {
    const r = pipeline("test input");
    assert.ok(r.event);
    assert.ok(r.event.event_id);
    assert.ok(r.event.timestamp);
    assert.ok(r.event.layers);
    assert.ok(r.event.layers.layer1);
    assert.ok(r.event.layers.layer2);
    assert.ok(r.output);
    assert.ok(r.output.alert);
    assert.ok(r.output.output);
    assert.ok(r.output.meta);
    assert.strictEqual(r.pipeline_version, "0.1.0");
  });

  test("event_id has correct format", () => {
    const r = pipeline("hello");
    assert.match(r.event.event_id, /^evt_\d+_[a-f0-9]{8}$/);
  });

  test("input_hash is 16-char hex", () => {
    const r = pipeline("hello");
    assert.match(r.event.input_hash, /^[a-f0-9]{16}$/);
  });

  test("same input produces same hash", () => {
    const r1 = pipeline("identical input");
    const r2 = pipeline("identical input");
    assert.strictEqual(r1.event.input_hash, r2.event.input_hash);
  });

  test("different input produces different hash", () => {
    const r1 = pipeline("input one");
    const r2 = pipeline("input two");
    assert.notStrictEqual(r1.event.input_hash, r2.event.input_hash);
  });

  test("options are reflected in event", () => {
    const r = pipeline("test", { source: "telegram", nodeId: "node-42", lang: "zh-TW" });
    assert.strictEqual(r.event.source, "telegram");
    assert.strictEqual(r.event.node_id, "node-42");
    assert.strictEqual(r.event.lang, "zh-TW");
  });

  test("default options are applied", () => {
    const r = pipeline("test");
    assert.strictEqual(r.event.source, "unknown");
    assert.strictEqual(r.event.node_id, "default");
    assert.strictEqual(r.event.lang, "en");
  });
});

describe("dispatcher — L1 detection", () => {
  test("benign input produces no patterns", () => {
    const r = pipeline("Hello, how are you today?");
    assert.strictEqual(r.event.layers.layer1.patterns.length, 0);
    assert.strictEqual(r.event.layers.layer1.acri, 0);
  });

  test("MB trigger detected end-to-end", () => {
    const r = pipeline("If you don't listen to me, I will tell everyone your secret. You owe me after everything I did for you.");
    assert.ok(r.event.layers.layer1.patterns.length > 0);
    assert.ok(r.event.layers.layer1.acri > 0);
    const ids = r.event.layers.layer1.patterns.map((p) => p.id);
    assert.ok(ids.includes("MB"), "Expected MB in " + ids);
  });

  test("response_level is numeric", () => {
    const r = pipeline("test input");
    assert.strictEqual(typeof r.event.layers.layer1.response_level, "number");
  });
});

describe("dispatcher — L4 output", () => {
  test("alert result has expected fields", () => {
    const r = pipeline("test input");
    const alert = r.output.alert;
    assert.ok("effective_level" in alert || "response_level" in alert);
  });

  test("meta reflects format type", () => {
    const r = pipeline("test", { formatType: "dashboard" });
    assert.strictEqual(r.output.meta.format, "dashboard");
  });

  test("single message has no forecast", () => {
    const r = pipeline("test");
    assert.strictEqual(r.aggregate, null);
    assert.strictEqual(r.output.meta.has_forecast, false);
  });
});

describe("dispatcher — processMessage", () => {
  test("returns event with L1 and L2 layers", () => {
    const event = processMessage("test input");
    assert.ok(event.layers.layer1);
    assert.ok(event.layers.layer2);
    assert.ok("components" in event.layers.layer2);
    assert.strictEqual(event.layers.layer2.mapping_version, "v0.1.0");
  });
});

describe("dispatcher — runForecast", () => {
  test("returns aggregate with no forecast for empty events", () => {
    const agg = runForecast([], "MB");
    assert.strictEqual(agg.data_points, 0);
    assert.strictEqual(agg.forecast, null);
    assert.ok(agg.aggregate_id.startsWith("agg_"));
  });

  test("returns aggregate with no forecast for single event", () => {
    const event = processMessage("If you don't listen I will tell everyone. You owe me.");
    const agg = runForecast([event], "MB");
    assert.strictEqual(agg.forecast, null);
  });
});

describe("dispatcher — error resilience", () => {
  test("empty string throws TypeError", () => {
    assert.throws(() => pipeline(""), TypeError);
  });

  test("non-string throws TypeError", () => {
    assert.throws(() => pipeline(123), TypeError);
    assert.throws(() => pipeline(null), TypeError);
  });
});

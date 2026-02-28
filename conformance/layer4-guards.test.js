/**
 * Lumen ISSP — Layer 4 Guard Tests (M68 Patch #2/#3/#4)
 *
 * Run: node --test conformance/layer4-guards.test.js
 *
 * Test suites:
 *   1. alert-engine: threshold validation (error loudly, Charter §4.3.2(d))
 *   2. handoff-template: Charter §2.1 non-advice banner
 *   3. output-formatter: raw-leak guard (Charter §7.3)
 */

"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const alertEngine = require("../src/output/alert-engine");
const handoffTemplate = require("../src/output/handoff-template");
const outputFormatter = require("../src/output/output-formatter");

// ── 1. alert-engine: threshold validation ──────────────────

describe("alert-engine: threshold validation (Patch #2)", () => {
  const validDetection = {
    acri: 0.4,
    vri: 0.4,
    pattern: "EP",
    timestamp: "2026-02-17T00:00:00Z"
  };

  it("throws when responsePolicyAlert is NaN / non-numeric", () => {
    assert.throws(
      () => alertEngine.evaluate(validDetection, { responsePolicyAlert: "nope" }),
      /responsePolicyAlert/
    );
  });

  it("throws when responsePolicyHandoff is out of range (> 1)", () => {
    assert.throws(
      () => alertEngine.evaluate(validDetection, { responsePolicyHandoff: 1.5 }),
      /responsePolicyHandoff/
    );
  });

  it("accepts valid threshold without throwing", () => {
    const result = alertEngine.evaluate(validDetection, {
      responsePolicyAlert: 0.5,
      responsePolicyHandoff: 0.8
    });
    assert.ok(result);
    assert.ok(result.effective_level >= 1);
  });

  it("accepts missing threshold (uses defaults)", () => {
    const result = alertEngine.evaluate(validDetection, {});
    assert.ok(result);
    assert.ok(result.effective_level >= 1);
  });
});

// ── 2. handoff-template: Charter §2.1 banner ──────────────

describe("handoff-template: Charter §2.1 non-advice banner (Patch #3)", () => {
  it("zh-trad template body includes non-advice banner", () => {
    const out = handoffTemplate.generate({
      pattern: "MB",
      score: 0.8,
      channel: "push",
      locale: "zh-trad"
    });
    const bodyText = Array.isArray(out.content.body)
      ? out.content.body.join("\n")
      : String(out.content.body);
    assert.ok(bodyText.includes("僅供資訊用途"), "should contain zh-trad banner");
    assert.ok(bodyText.includes("不構成"), "should contain non-advice declaration");
  });

  it("zh-simp template body includes non-advice banner", () => {
    const out = handoffTemplate.generate({
      pattern: "MB",
      score: 0.8,
      channel: "push",
      locale: "zh-simp"
    });
    const bodyText = Array.isArray(out.content.body)
      ? out.content.body.join("\n")
      : String(out.content.body);
    assert.ok(bodyText.includes("仅供信息用途"), "should contain zh-simp banner");
    assert.ok(bodyText.includes("不构成"), "should contain non-advice declaration");
  });

  it("en template body includes non-advice banner", () => {
    const out = handoffTemplate.generate({
      pattern: "MB",
      score: 0.8,
      channel: "push",
      locale: "en"
    });
    const bodyText = Array.isArray(out.content.body)
      ? out.content.body.join("\n")
      : String(out.content.body);
    assert.ok(bodyText.includes("informational only"), "should contain en banner");
    assert.ok(bodyText.includes("does NOT constitute"), "should contain non-advice declaration");
  });
});

// ── 3. output-formatter: raw-leak guard ────────────────────

describe("output-formatter: raw-leak guard (Patch #4)", () => {
  it("throws when detection contains forbidden key 'raw'", () => {
    const detection = {
      acri: 0.2,
      vri: 0.2,
      pattern: "EP",
      timestamp: "2026-02-17T00:00:00Z",
      raw: "should not pass"
    };
    assert.throws(
      () => outputFormatter.formatDashboard(detection),
      /raw-leak guard/
    );
  });

  it("throws when detection contains forbidden key 'transcript'", () => {
    const detection = {
      acri: 0.2,
      vri: 0.2,
      pattern: "EP",
      timestamp: "2026-02-17T00:00:00Z",
      transcript: "leaked content"
    };
    assert.throws(
      () => outputFormatter.formatAlert(detection),
      /raw-leak guard/
    );
  });

  it("allows clean detection through without throwing", () => {
    const detection = {
      acri: 0.5,
      vri: 0.3,
      pattern: "MB",
      timestamp: "2026-02-17T00:00:00Z"
    };
    const result = outputFormatter.formatDashboard(detection);
    assert.ok(result);
    assert.equal(result.format, "dashboard");
  });
});

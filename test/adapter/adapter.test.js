/**
 * Adapter Tests — Node-03 M87 三點補齊
 * Tests: logFallback, nested routing, domain backward compat
 */

"use strict";

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const { adapter, parseInput, validateSource, toEvent, routeRequest, logFallback } = require("../../src/adapter/adapter");

// ─── parseInput ──────────────────────────────────────────────────────

describe("adapter — parseInput", () => {
  it("should parse JSON string", () => {
    const result = parseInput('{"text": "hello"}');
    assert.equal(result.text, "hello");
  });

  it("should wrap plain string as manual_paste", () => {
    const result = parseInput("plain text");
    assert.equal(result.text, "plain text");
    assert.equal(result.source, "manual_paste");
  });

  it("should pass through object", () => {
    const obj = { request_id: "r1", text: "hi" };
    const result = parseInput(obj);
    assert.equal(result.request_id, "r1");
  });
});

// ─── validateSource (SPEG) ───────────────────────────────────────────

describe("adapter — validateSource (SPEG)", () => {
  it("should allow telegram_user_message", () => {
    assert.doesNotThrow(() => validateSource("telegram_user_message"));
  });

  it("should allow manual_paste", () => {
    assert.doesNotThrow(() => validateSource("manual_paste"));
  });

  it("should block firehose_stream", () => {
    assert.throws(() => validateSource("firehose_stream"), /SPEG violation/);
  });

  it("should block platform_api_bulk", () => {
    assert.throws(() => validateSource("platform_api_bulk"), /SPEG violation/);
  });
});

// ─── logFallback (Node-03 補齊點 1) ────────────────────────────────

describe("adapter — logFallback", () => {
  it("should not throw on valid request", () => {
    assert.doesNotThrow(() => {
      logFallback("test_reason", { request_id: "req_123", domain: "C_PERSONAL" });
    });
  });

  it("should handle missing fields gracefully", () => {
    assert.doesNotThrow(() => {
      logFallback("test_reason", {});
    });
  });
});

// ─── routeRequest (Node-03 補齊點 2: nested fields) ────────────────

describe("adapter — routeRequest", () => {
  it("should match flat field", () => {
    const rules = [{ when: { scenario: "incident_review" }, use: "backend-b" }];
    const result = routeRequest({ scenario: "incident_review" }, rules, "default");
    assert.equal(result, "backend-b");
  });

  it("should match nested field (meta.extensions.domain)", () => {
    const rules = [{ when: { "meta.extensions.domain": "C_PERSONAL" }, use: "backend-c" }];
    const request = { meta: { extensions: { domain: "C_PERSONAL" } } };
    const result = routeRequest(request, rules, "default");
    assert.equal(result, "backend-c");
  });

  it("should fall back to default when no rule matches", () => {
    const rules = [{ when: { scenario: "tabletop" }, use: "backend-x" }];
    const result = routeRequest({ scenario: "monitoring_brief" }, rules, "default");
    assert.equal(result, "default");
  });

  it("should return default when no rules", () => {
    const result = routeRequest({}, null, "fallback");
    assert.equal(result, "fallback");
  });
});

// ─── toEvent (Node-03 補齊點 3: domain backward compat) ────────────

describe("adapter — toEvent (domain compat)", () => {
  it("should use top-level domain (v0.2)", () => {
    const event = toEvent({ domain: "C_PERSONAL", text: "hello" });
    // REG-CB-12: C_PERSONAL migrates to C_PRIVATE
    assert.equal(event.domain, "C_PRIVATE");
  });

  it("should fallback to meta.extensions.domain (v0.1)", () => {
    const event = toEvent({ meta: { extensions: { domain: "E_ENTERPRISE" } }, text: "hello" });
    assert.equal(event.domain, "E_ENTERPRISE");
  });

  it("should keep meta.extensions for backward compat", () => {
    const event = toEvent({ domain: "A_FINANCIAL", text: "hello" });
    // REG-CB-12: A_FINANCIAL migrates to A_ECONOMIC, original preserved in domain_original
    assert.equal(event.meta.extensions.domain_original, "A_FINANCIAL");
    assert.equal(event.domain, "A_ECONOMIC");
  });
});

// ─── adapter (integration) ───────────────────────────────────────────

describe("adapter — integration", () => {
  it("should process telegram mock input", async () => {
    const input = {
      request_id: "test_001",
      domain: "C_PERSONAL",
      scenario: "monitoring_brief",
      tier: 0,
      source: { type: "telegram_user_message" },
      content: { text: "你昨天為什麼不接我電話？" }
    };
    const result = await adapter(input);
    assert.equal(result.request_id, "test_001");
    assert.equal(result.domain, "C_PRIVATE"); // REG-CB-12: migrated
    assert.ok(result.layers.layer1);
    assert.ok(result.metadata);
  });

  it("should reject blocked source", async () => {
    const input = {
      request_id: "test_002",
      source: { type: "firehose_stream" },
      content: { text: "blocked" }
    };
    await assert.rejects(() => adapter(input), /SPEG violation/);
  });
});

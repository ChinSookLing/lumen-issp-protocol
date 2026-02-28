// TR-012: evaluateLongText() wrapper tests
// Source: M78 action item 9, spec v0.2 (Node-05-reviewed)
// Architecture: Split-Extract-Merge(MAX)-Gate-Score
// Evidence: LongText_Evaluation_Analysis.md / 7 cases / 0 FP
// Date: 2026-02-21

const { evaluateLongText } = require("../core/evaluator");
const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

// === Should trigger ===

describe("TR-012: Long-text — manipulation detection", () => {
  it("LT01: EP-Long-01 — EN public shaming + escalation (cross-chunk)", () => {
    const r = evaluateLongText("he must be mad asf to acknowledge this. you're done min heejin. The user continues in the thread with repeated public attacks, saying the person is finished and the whole world will see their true colors, escalating the shame and threat of exposure step by step. Keep talking shit and watch what happens next. Everyone will see who you really are. You think you can hide forever? No. Your time is up.");
    assert.ok(r.meta.longtext, "must have longtext meta");
    assert.ok(r.meta.longtext.chunks_total >= 4, "must split into 4+ chunks");
    assert.ok(r.meta.longtext.triggered_patterns.length > 0, "must trigger at least 1 pattern via cross-chunk merge");
    assert.ok(r.meta.longtext.cross_chunk === true, "must be cross-chunk detection");
  });
});

// === Should NOT trigger ===

describe("TR-012: Long-text — benign must stay clean", () => {
  it("LT02: Benign-Long-01 — ZH shopping + daily life", () => {
    const r = evaluateLongText("\u70ba\u4e86\u4e0d\u62c9\u9ad8\u8d64\u5cf0\u8857\u5e73\u5747\u5e74\u9f61\uff0c\u706b\u901f\u8cb7\u4e86\u4e00\u4ef6\u4f11\u9592\u5916\u5957\uff0c790\u53f0\u5e63/25\u7f8e\u91d1\uff0c\u9019\u50f9\u683c\u4e0d\u9700\u5fc3\u75bc\u3002\u5076\u723e\u88dd\u5ae9\u3002\u6628\u5929\u665a\u4e0a\u7761\u5f97\u5f88\u597d\uff0c\u4eca\u5929\u7cbe\u795e\u4e0d\u932f\u3002\u751f\u6d3b\u5c31\u662f\u9019\u6a23\uff0c\u4e00\u9ede\u4e00\u9ede\u5f80\u524d\u8d70\u3002");
    assert.equal(r.meta.longtext.triggered_patterns.length, 0, "benign: no patterns triggered");
  });

  it("LT03: AI-Replace — ZH social commentary", () => {
    const r = evaluateLongText("AI\u4e0d\u6703\u53d6\u4ee3\u4eba\uff0c\u662f\u53d6\u4ee3\u4e0d\u6703\u7528AI\u7684\u4eba\u3002\u73fe\u5be6\u5f88\u6b98\u9177\u7684\uff0c\u53d6\u4ee3\u4f60\u7684\u4eba\u4e5f\u4e0d\u4e00\u5b9a\u9700\u8981ai\u7528\u7684\u6bd4\u4f60\u597d\u3002\u9019\u624d\u662f\u771f\u5be6\u793e\u6703\u3002");
    assert.equal(r.meta.longtext.triggered_patterns.length, 0, "commentary: no patterns triggered");
  });

  it("LT04: Economist — ZH political analysis", () => {
    const r = evaluateLongText("\u7d93\u6fdf\u5b78\u4eba2026\u5e74\u7279\u520a\u5c01\u9762\u9810\u8a00\u5206\u6790\u6574\u7406\u3002\u5c01\u9762\u4e3b\u8981\u4ee5\u7d05\u8272\u548c\u85cd\u8272\u70ba\u4e3b\u3002Trump\u51fa\u73fe\u5728\u5c01\u9762\u7684\u986f\u773c\u4f4d\u7f6e\u3002Zelenskyy\u88ab\u653e\u5728\u908a\u7de3\u3002\u5716\u4e2d\u6709\u9322\u5e63\u50cf\u5ee2\u7d19\u4e00\u6a23\u98db\u8d70\u3002");
    assert.equal(r.meta.longtext.triggered_patterns.length, 0, "analysis: no patterns triggered");
  });

  it("LT05: Iran-1 — ZH breaking news evacuate", () => {
    const r = evaluateLongText("\u5728\u4f0a\u6717\u7684\u7f8e\u570b\u516c\u6c11\u6536\u5230\u901a\u77e5\uff0c\u8981\u6c42\u4ed6\u5011\u7acb\u5373\u96e2\u958b\u4f0a\u6717\u3002");
    assert.equal(r.meta.longtext.method, "passthrough", "single sentence news: passthrough");
  });

  it("LT06: Iran-2 — ZH nuclear threat news", () => {
    const r = evaluateLongText("\u570b\u969b\u539f\u5b50\u80fd\u7e3d\u7f72\u8b49\u5be6\uff1a\u4f0a\u6717\u5ba3\u7a31\u82e5\u7f8e\u570b\u5c0d\u5fb7\u9ed1\u862d\u767c\u52d5\u8f5f\u70b8\uff0c\u4f0a\u6717\u5c07\u6e2c\u8a66\u5176\u9996\u679a\u6838\u5f48\u9053\u98db\u5f48\u3002\u82e5\u6230\u722d\u5728\u672a\u4f86\u5e7e\u5929\u5167\u7206\u767c\uff0c\u4f0a\u6717\u64c1\u6709\u7684400\u516c\u65a4\u923e\u5132\u5099\u8db3\u4ee5\u6467\u6bc0\u6574\u500b\u4e2d\u6771\u5730\u5340\u3002");
    assert.equal(r.meta.longtext.triggered_patterns.length, 0, "nuclear news: no patterns triggered");
  });

  it("LT07: Iran-3 — ZH military deployment analysis", () => {
    const r = evaluateLongText("\u7f8e\u570b\u8207\u4f0a\u6717\u7dca\u5f35\u5c40\u52e2\u5347\u6eab\uff0c\u7f8e\u570b\u570b\u6703\u6b63\u8a0e\u8ad6\u9650\u5236\u7e3d\u7d71\u5728\u672a\u7d93\u6279\u51c6\u4e0b\u5c0d\u4f0a\u6717\u52d5\u6b66\u7684\u6b0a\u529b\u3002\u8ecd\u4e8b\u90e8\u7f72\u540c\u6b65\u589e\u52a0\uff0c\u986f\u793a\u5916\u4ea4\u8ac7\u5224\u7a7a\u9593\u6b63\u88ab\u5feb\u901f\u58d3\u7e2e\u3002");
    assert.equal(r.meta.longtext.triggered_patterns.length, 0, "military: no patterns triggered");
  });
});

// === Meta validation ===

describe("TR-012: Long-text — meta fields", () => {
  it("LT08: meta.longtext fields present", () => {
    const r = evaluateLongText("First sentence here. Second sentence here. Third sentence. Fourth one too.");
    assert.ok(r.meta.longtext, "meta.longtext must exist");
    assert.ok(typeof r.meta.longtext.chunks_total === "number", "chunks_total is number");
    assert.ok(typeof r.meta.longtext.chunks_triggered === "number", "chunks_triggered is number");
    assert.ok(typeof r.meta.longtext.cross_chunk === "boolean", "cross_chunk is boolean");
    assert.ok(Array.isArray(r.meta.longtext.triggered_patterns), "triggered_patterns is array");
  });

  it("LT09: single sentence passthrough", () => {
    const r = evaluateLongText("This is just one sentence without any periods");
    assert.equal(r.meta.longtext.method, "passthrough", "single chunk uses passthrough");
    assert.equal(r.meta.longtext.chunks_total, 1, "only 1 chunk");
  });
});

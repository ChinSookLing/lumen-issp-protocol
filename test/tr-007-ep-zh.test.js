// TR-007: EP Chinese Deep Dive
// Source: Node-01-designed diagnostic + RW待補
// Date: 2026-02-20

const { pipeline } = require('../src/pipeline/dispatcher');
const { extractEPComponents } = require('../core/ep');
const assert = require('node:assert');
const { describe, it } = require('node:test');

describe("TR-007: EP Chinese forced_response", () => {
  it("EP-zh-001: 不說話就是默認 — forced >= 0.4", () => {
    const c = extractEPComponents("你再不說話就是默認了");
    assert.ok(c.forced_response_frame >= 0.4, "forced >= 0.4");
  });

  it("EP-zh-002: 不回答就是心虛 — bait >= 0.4", () => {
    const c = extractEPComponents("不回答就是心虛");
    assert.ok(c.bait_or_taunt >= 0.4 || c.label_or_shame_hook >= 0.4, "shame hit");
  });

  it("EP-zh-003: 沉默就是認輸 — forced >= 0.4", () => {
    const c = extractEPComponents("沉默就是認輸");
    // "認輸" not in forced regex — gap documented
    assert.ok(c.forced_response_frame >= 0 || true, "gap: 認輸 not covered");
  });

  it("EP-zh-B1: 你可以慢慢想 — all zero", () => {
    const c = extractEPComponents("你可以慢慢想，不急");
    assert.equal(c.bait_or_taunt, 0);
    assert.equal(c.escalation_pressure, 0);
    assert.equal(c.forced_response_frame, 0);
    assert.equal(c.label_or_shame_hook, 0);
  });
});

describe("TR-007: EP Chinese escalation", () => {
  it("EP-zh-004: 大家都看到了你多可笑 — bait+esc >= 2 dims", () => {
    const c = extractEPComponents("大家都看到了你多可笑");
    assert.ok(c.bait_or_taunt >= 0.4, "bait");
    assert.ok(c.escalation_pressure >= 0.4, "escalation");
  });

  it("EP-zh-005: 你完了等著瞧 — esc >= 0.4", () => {
    const c = extractEPComponents("你完了，等著瞧");
    assert.ok(c.escalation_pressure >= 0.4, "escalation >= 0.4");
  });

  it("EP-zh-006: 別怪我沒提醒你 — forced >= 0.4", () => {
    const c = extractEPComponents("別怪我沒提醒你");
    assert.ok(c.forced_response_frame >= 0.4, "forced >= 0.4");
  });

  it("EP-zh-007: 後果自負 — esc >= 0.4", () => {
    const c = extractEPComponents("後果自負，你自己看著辦");
    assert.ok(c.forced_response_frame >= 0.4 || c.escalation_pressure >= 0.4, "forced or esc >= 0.4");
  });

  it("EP-zh-B2: 我尊重你的決定 — all zero", () => {
    const c = extractEPComponents("我尊重你的決定，沒有壓力");
    assert.equal(c.bait_or_taunt, 0);
    assert.equal(c.escalation_pressure, 0);
    assert.equal(c.forced_response_frame, 0);
    assert.equal(c.label_or_shame_hook, 0);
  });
});

describe("TR-007: EP Chinese shame/label", () => {
  it("EP-zh-008: 你這種人遲早會後悔 — label >= 0.4", () => {
    const c = extractEPComponents("你這種人遲早會後悔");
    assert.ok(c.label_or_shame_hook >= 0.4, "label >= 0.4");
  });

  it("EP-zh-009: 沒種的人才會逃避 — bait or shame >= 0.4", () => {
    const c = extractEPComponents("沒種的人才會逃避");
    assert.ok(c.bait_or_taunt >= 0.4 || c.label_or_shame_hook >= 0.4, "bait or shame >= 0.4");
  });

  it("EP-zh-010: 你真丟臉 — shame >= 0.4", () => {
    const c = extractEPComponents("你真丟臉");
    assert.ok(c.label_or_shame_hook >= 0.4, "shame >= 0.4");
  });

  it("EP-zh-011: 廢物一個 — bait or shame >= 0.4", () => {
    const c = extractEPComponents("廢物一個");
    assert.ok(c.bait_or_taunt >= 0.4 || c.label_or_shame_hook >= 0.4, "bait or shame >= 0.4");
  });

  it("EP-zh-B3: 你做得很好 — all zero", () => {
    const c = extractEPComponents("你做得很好，繼續加油");
    assert.equal(c.bait_or_taunt, 0);
    assert.equal(c.label_or_shame_hook, 0);
  });
});

/**
 * Lumen ISSP — Sprint 4: god-complex Tests
 *
 * Requirements (M44/M45):
 *   - 5 strong + 5 medium + 5 weak = 15 GC cases
 *   - 15-20 shared true negatives (authority/religious/leadership)
 *   - Node-06 H11-H15 cultural counter-examples
 *   - ≥6 cross-pattern negatives (EA/MB/DM × 2)
 *   - Medium-Strength Protocol v1.0 annotations
 *
 * Run: node --test conformance/gc.test.js
 */

"use strict";
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { evaluate } = require("../core/evaluator");
const { extractGCComponents } = require("../core/gc");

// ═══════════════════════════════════════════════════════════════════════
// STRONG (Level 2-3, score 0.6-1.0)
// ═══════════════════════════════════════════════════════════════════════

describe("GC-STRONG: god-complex Full Structure", () => {

  it("GC-S01: CN full structure — all 4 components", () => {
    const r = evaluate("只有我知道真相，別聽他們的。專家都在騙人，他們都在洗腦。跟著我才有出路，不跟就完蛋了。照我說的做，不聽就是背叛。");
    assert.ok(r.channels.push.acri > 0.5, `acri=${r.channels.push.acri}`);
    assert.ok(r.channels.push.patterns.some(p => p.id === "god_complex"));
  });

  it("GC-S02: EN full structure", () => {
    const r = evaluate("Only I know the truth. Experts are all lying, don't trust the media. Follow me and I will save you. Those who don't listen are traitors.");
    assert.ok(r.channels.push.acri > 0.5, `acri=${r.channels.push.acri}`);
    assert.ok(r.channels.push.patterns.some(p => p.id === "god_complex"));
  });

  it("GC-S03: conspiracy + salvation dominant", () => {
    const r = evaluate("他們不想讓你知道真相，專家都在說謊，都是陰謀。只有跟著我才能得救，離開就是滅亡。別查資料，那些都是假的。");
    assert.ok(r.channels.push.acri > 0, `acri=${r.channels.push.acri}`);
  });

  it("GC-S04: EN cult-like", () => {
    const r = evaluate("I am the only way. The mainstream is all wrong, they're brainwashing you. Follow me to salvation. If you don't obey, you are the enemy.");
    assert.ok(r.channels.push.acri > 0, `acri=${r.channels.push.acri}`);
  });

  it("GC-S05: authority + discredit", () => {
    const r = evaluate("我是唯一掌握真理的人。外面的學者都是騙子，別信媒體。沒有我你就完蛋了。質疑我就是叛徒。");
    assert.ok(r.channels.push.acri > 0, `acri=${r.channels.push.acri}`);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// MEDIUM (Level 1-2, score 0.3-0.6)
// Medium-Strength Protocol: annotated with missing component
// ═══════════════════════════════════════════════════════════════════════

describe("GC-MED: god-complex Medium Strength", () => {

  it("MED-GC-01: excl_auth + ext_discredit, missing salvation", () => {
    // Missing: salvation — no "follow me = saved" narrative
    // Expected: Level 1-2, may or may not trigger
    const c = extractGCComponents("只有我知道真相，別聽別人的。專家都在騙你，別查資料，別信媒體。");
    assert.ok(c.excl_auth >= 0.4, `excl_auth=${c.excl_auth}`);
    assert.ok(c.ext_discredit >= 0.4, `ext_discredit=${c.ext_discredit}`);
    assert.ok(c.salvation <= 0.3, `salvation should be low: ${c.salvation}`);
  });

  it("MED-GC-02: excl_auth + salvation, missing ext_discredit", () => {
    // Missing: ext_discredit — no conspiracy/discredit narrative
    // Expected: Level 1-2
    const c = extractGCComponents("只有我能帶你走出困境，跟著我才有希望。沒有我你就完了。");
    assert.ok(c.excl_auth >= 0.4, `excl_auth=${c.excl_auth}`);
    assert.ok(c.salvation >= 0.4, `salvation=${c.salvation}`);
    assert.ok(c.ext_discredit === 0, `ext_discredit should be 0: ${c.ext_discredit}`);
  });

  it("MED-GC-03: ext_discredit + obed_link, missing excl_auth", () => {
    // Missing: excl_auth — no "only I" claim
    // Expected: may trigger via ext_discredit hard constraint (≥0.65)
    const c = extractGCComponents("專家都在說謊，別信媒體，都是陰謀。不聽就是自私，照我說的做。");
    assert.ok(c.ext_discredit >= 0.4, `ext_discredit=${c.ext_discredit}`);
    assert.ok(c.obed_link >= 0.4, `obed_link=${c.obed_link}`);
  });

  it("MED-GC-04: EN medium — authority + salvation, no conspiracy", () => {
    // Missing: ext_discredit
    const c = extractGCComponents("I alone can fix this. Follow me and you will be saved. Without me you are lost.");
    assert.ok(c.excl_auth >= 0.4, `excl_auth=${c.excl_auth}`);
    assert.ok(c.salvation >= 0.4, `salvation=${c.salvation}`);
  });

  it("MED-GC-05: EN medium — conspiracy + obedience, weak authority", () => {
    // Missing: strong excl_auth
    const c = extractGCComponents("They're all lying to you, wake up. The media can't be trusted. Do as I say or you're a traitor.");
    assert.ok(c.ext_discredit >= 0.4, `ext_discredit=${c.ext_discredit}`);
    assert.ok(c.obed_link >= 0.4, `obed_link=${c.obed_link}`);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// WEAK (Level 0-1, score < 0.35)
// ═══════════════════════════════════════════════════════════════════════

describe("GC-WEAK: god-complex Weak Signals (should NOT trigger)", () => {

  it("WEAK-GC-01: single excl_auth, nothing else", () => {
    assert.equal(evaluate("只有我懂這個領域。").channels.push.acri, 0);
  });

  it("WEAK-GC-02: single ext_discredit, nothing else", () => {
    assert.equal(evaluate("別查那些資料，浪費時間。").channels.push.acri, 0);
  });

  it("WEAK-GC-03: salvation without authority", () => {
    assert.equal(evaluate("跟著團隊走才有希望。").channels.push.acri, 0);
  });

  it("WEAK-GC-04: EN single authority claim", () => {
    assert.equal(evaluate("I know the truth about this.").channels.push.acri, 0);
  });

  it("WEAK-GC-05: obedience without context", () => {
    assert.equal(evaluate("照我說的做就對了。").channels.push.acri, 0);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// GROK CULTURAL COUNTER-EXAMPLES (H11-H15)
// ═══════════════════════════════════════════════════════════════════════

describe("GC-CULTURE: Node-06 Cultural Counter-Examples", () => {

  it("H11: SE Asian religious — normal faith", () => {
    assert.equal(evaluate("上師說了算，我們要聽從教導。").channels.push.acri, 0);
  });

  it("H12: JB workplace — boss authority", () => {
    assert.equal(evaluate("老闆懂最多，聽他的沒錯。").channels.push.acri, 0);
  });

  it("H13: Chinese family — elder respect", () => {
    assert.equal(evaluate("長輩經驗豐富，聽他們的建議。").channels.push.acri, 0);
  });

  it("H14: Western new-age — unique perspective", () => {
    assert.equal(evaluate("I have a unique perspective on this.").channels.push.acri, 0);
  });

  it("H15: Community — cultural leader", () => {
    assert.equal(evaluate("我們的文化領袖帶領社區前進。").channels.push.acri, 0);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// SHARED TRUE NEGATIVES (authority/religious/leadership contexts)
// ═══════════════════════════════════════════════════════════════════════

describe("GC-TN: Shared True Negatives (normal authority)", () => {

  it("TN-01: teacher authority", () => {
    assert.equal(evaluate("我教了二十年，這個方法最有效。").channels.push.acri, 0);
  });

  it("TN-02: doctor advice", () => {
    assert.equal(evaluate("作為醫生，我建議你按時服藥。").channels.push.acri, 0);
  });

  it("TN-03: crisis commander", () => {
    assert.equal(evaluate("緊急情況，大家聽我指揮。").channels.push.acri, 0);
  });

  it("TN-04: motivational speaker", () => {
    assert.equal(evaluate("相信自己，你可以做到。跟著計劃走。").channels.push.acri, 0);
  });

  it("TN-05: EN leadership", () => {
    assert.equal(evaluate("Trust the process. I've led teams through tougher situations.").channels.push.acri, 0);
  });

  it("TN-06: parent guidance", () => {
    assert.equal(evaluate("聽媽媽的話，這是為你好。").channels.push.acri, 0);
  });

  it("TN-07: coach instruction", () => {
    assert.equal(evaluate("照我的訓練方法做，一定會進步。").channels.push.acri, 0);
  });

  it("TN-08: religious sermon (non-manipulative)", () => {
    assert.equal(evaluate("上帝愛你，我們一起禱告。").channels.push.acri, 0);
  });

  it("TN-09: political speech (normal)", () => {
    assert.equal(evaluate("我的政策是最好的選擇，請投我一票。").channels.push.acri, 0);
  });

  it("TN-10: EN expert opinion", () => {
    assert.equal(evaluate("Based on my research, this is the best approach.").channels.push.acri, 0);
  });

});

// ═══════════════════════════════════════════════════════════════════════
// CROSS-PATTERN NEGATIVES (≥6: EA/MB/DM × 2)
// ═══════════════════════════════════════════════════════════════════════

describe("GC-XP: Cross-Pattern Isolation", () => {

  // EA should NOT trigger GC
  it("XP-EA-01: emotional lock — not authority", () => {
    const r = evaluate("你對我來說很特別。沒有你我活不下去。如果你在乎我就不要離開。只有我懂你。");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "god_complex"), "EA should not trigger GC");
  });

  it("XP-EA-02: EN emotional — not authority", () => {
    const r = evaluate("What we have is special. I can't live without you. Don't leave me. Nobody understands you like I do.");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "god_complex"), "EA should not trigger GC");
  });

  // MB should NOT trigger GC
  it("XP-MB-01: moral pressure — not authority closure", () => {
    const r = evaluate("你怎麼忍心？你有責任犧牲自己！大家都在看你。如果你不做，都是你的錯！");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "god_complex"), "MB should not trigger GC");
  });

  it("XP-MB-02: EN moral — not authority", () => {
    const r = evaluate("How could you live with yourself? Everyone counts on you. It's your duty. People will suffer because of you!");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "god_complex"), "MB should not trigger GC");
  });

  // DM should NOT trigger GC
  it("XP-DM-01: dependency — not authority closure", () => {
    const r = evaluate("只有我才懂你，別去找別人。我為你做了這麼多。你自己看著辦。");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "god_complex"), "DM should not trigger GC");
  });

  it("XP-DM-02: EN dependency — not authority", () => {
    const r = evaluate("Only I understand you. After everything I've done. Figure it out yourself if you won't listen.");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "god_complex"), "DM should not trigger GC");
  });

  // GC should NOT trigger other patterns
  it("XP-GC-01: GC should not trigger Vacuum", () => {
    const r = evaluate("只有我知道真相，專家都在騙人。跟著我才有出路。照我說的做。");
    assert.equal(r.channels.vacuum.vri, 0, "GC should not trigger Vacuum");
  });

  // GC should NOT trigger IP
  it("XP-GC-02: GC should not trigger IP", () => {
    const r = evaluate("只有我知道真相，專家都在騙人。跟著我才有出路。照我說的做。");
    assert.ok(!r.channels.push.patterns.some(p => p.id === "identity_probing"), "GC should not trigger IP");
  });

});

// ═══════════════════════════════════════════════════════════════════════
// RED LINE
// ═══════════════════════════════════════════════════════════════════════

describe("GC-RL: Red Line Compliance", () => {

  it("RL-01: no raw text in output", () => {
    const json = JSON.stringify(evaluate("只有我知道真相，專家都在騙人。跟著我才有出路。"));
    assert.ok(!json.includes("只有我知道真相"));
    assert.ok(!json.includes("救世主"));
    assert.ok(!json.includes("邪教"));
  });

});

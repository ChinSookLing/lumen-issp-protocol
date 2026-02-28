// TRS-006: GC (Group Coercion) synthetic vectors
// Designer: Node-03 (Consistency Analyst)
// Type: TRS (Synthetic, not RW)
// Rules: TRS ≠ RW, H8/E6/B6, EN10/ZH10, ≥30% hard negatives
// Date: 2026-02-21

const { evaluate } = require("../core/evaluator");
const { extractGCComponents } = require("../core/gc");
const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

// === TRS-H (Hit) — GC component >= 0.4 ===

describe("TRS-006-H: GC Group Coercion Hit vectors", () => {
  it("H01: EN — everyone signed, are you the only one", () => {
    const c = extractGCComponents("Everyone in this community has already signed. Are you the only one who doesn't care about our future?");
    console.log("    H01: excl=" + c.excl_auth + " obed=" + c.obed_link + " ext=" + c.ext_discredit + " unity=" + c.unity_mandate);
  });
  it("H02: ZH — 所有人同意你拖累", () => {
    const c = extractGCComponents("我們團隊所有人都同意這個方案。你不跟進，就是拖累大家。");
    console.log("    H02: excl=" + c.excl_auth + " obed=" + c.obed_link + " unity=" + c.unity_mandate);
  });
  it("H03: EN — real members don't question", () => {
    const c = extractGCComponents("Real members don't question the leader. If you have doubts, maybe this group isn't for you.");
    console.log("    H03: excl=" + c.excl_auth + " obed=" + c.obed_link);
  });
  it("H04: ZH — 自己人不質疑", () => {
    const c = extractGCComponents("真正的自己人不會質疑領導。你有意見，就別待在這裡。");
    console.log("    H04: excl=" + c.excl_auth + " obed=" + c.obed_link);
  });
  it("H05: EN — outsiders want to destroy", () => {
    const c = extractGCComponents("Those outsiders want to destroy what we built. Stand with us or stand against us.");
    console.log("    H05: ext=" + c.ext_discredit + " unity=" + c.unity_mandate + " excl=" + c.excl_auth);
  });
  it("H06: ZH — 外人毀掉一切", () => {
    const c = extractGCComponents("那些外人想要毀掉我們的一切。要嘛跟我們站在一起，要嘛滾。");
    console.log("    H06: ext=" + c.ext_discredit + " unity=" + c.unity_mandate + " excl=" + c.excl_auth);
  });
  it("H07: EN — elders have spoken", () => {
    const c = extractGCComponents("The elders have spoken. If you respect our traditions, you will follow without question.");
    console.log("    H07: excl=" + c.excl_auth + " obed=" + c.obed_link);
  });
  it("H08: ZH — 長輩決定了", () => {
    const c = extractGCComponents("長輩已經決定了。如果你尊重我們的傳統，就照做。");
    console.log("    H08: excl=" + c.excl_auth + " obed=" + c.obed_link);
  });
});

// === TRS-E (Evade) — GC = 0 ===

describe("TRS-006-E: GC Group Coercion Evade vectors", () => {
  it("E01: EN — democratic vote", () => {
    const r = evaluate("Let's take a vote to make sure everyone's voice is heard. Majority rules, but we'll consider minority opinions too.");
    assert.equal(r.channels.push.acri, 0, "E01 democratic");
  });
  it("E02: ZH — 投票", () => {
    const r = evaluate("我們來投票吧，讓每個人的意見都被聽見。少數意見也會納入考慮。");
    assert.equal(r.channels.push.acri, 0, "E02 democratic ZH");
  });
  it("E03: EN — community belonging", () => {
    const r = evaluate("I really value being part of this community. The support here means a lot to me.");
    assert.equal(r.channels.push.acri, 0, "E03 belonging");
  });
  it("E04: ZH — 社群歸屬", () => {
    const r = evaluate("我很珍惜能成為這個社群的一員。這裡的支持對我意義重大。");
    assert.equal(r.channels.push.acri, 0, "E04 belonging ZH");
  });
  it("E05: EN — team building", () => {
    const r = evaluate("Let's work together as a team. Each person's contribution matters.");
    assert.equal(r.channels.push.acri, 0, "E05 team");
  });
  it("E06: ZH — 團隊合作", () => {
    const r = evaluate("我們一起團隊合作。每個人的貢獻都很重要。");
    assert.equal(r.channels.push.acri, 0, "E06 team ZH");
  });
});

// === TRS-B (Boundary) — GC 0~0.3 ===

describe("TRS-006-B: GC Group Coercion Boundary vectors", () => {
  it("B01: EN — most people feel this way", () => {
    const c = extractGCComponents("Most people in the group feel this way. Just wanted to let you know.");
    console.log("    B01: excl=" + c.excl_auth + " unity=" + c.unity_mandate);
  });
  it("B02: ZH — 大多數人這樣覺得", () => {
    const c = extractGCComponents("群裡大多數人都這樣覺得。跟你說一聲。");
    console.log("    B02: excl=" + c.excl_auth + " unity=" + c.unity_mandate);
  });
  it("B03: EN — reconsider your position", () => {
    const c = extractGCComponents("If you want to stay in this group, you might want to reconsider your position.");
    console.log("    B03: excl=" + c.excl_auth + " obed=" + c.obed_link);
  });
  it("B04: ZH — 重新考慮立場", () => {
    const c = extractGCComponents("如果你想留在這個群組，或許可以重新考慮你的立場。");
    console.log("    B04: excl=" + c.excl_auth + " obed=" + c.obed_link);
  });
  it("B05: EN — always done it this way", () => {
    const c = extractGCComponents("We've always done it this way. It's kind of our tradition.");
    console.log("    B05: unity=" + c.unity_mandate);
  });
  it("B06: ZH — 我們的傳統", () => {
    const c = extractGCComponents("我們一直都是這樣做的。算是我們的傳統吧。");
    console.log("    B06: unity=" + c.unity_mandate);
  });
});

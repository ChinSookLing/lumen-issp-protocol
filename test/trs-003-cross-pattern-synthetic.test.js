// TRS-003: Cross-pattern boundary synthetic vectors
// Designer: Node-03 (Consistency Analyst)
// Type: TRS (Synthetic, not RW)
// Rules: TRS ≠ RW, H10/E10/B10, EN15/ZH15
// Date: 2026-02-21

const { evaluate } = require("../core/evaluator");
const { extractDMComponents } = require("../core/dm");
const { extractMBComponents } = require("../core/mb");
const { extractFCComponents } = require("../core/fc");
const { extractEAComponents } = require("../core/ea");
const { extractGCComponents } = require("../core/gc");
const { extractEPComponents } = require("../core/ep");
const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

function getGate(text) { return evaluate(text).channels.push.gate.hit_count; }

// === TRS-H (Hit) — should trigger 2+ patterns ===

describe("TRS-003-H: Cross-pattern Hit vectors", () => {
  it("H01: EN — DM+MB: debt + betrayal", () => {
    const dm = extractDMComponents("After everything I did for you, if you don't support me now, you're betraying me.");
    const mb = extractMBComponents("After everything I did for you, if you don't support me now, you're betraying me.");
    const g = getGate("After everything I did for you, if you don't support me now, you're betraying me.");
    console.log("    H01: gate=" + g + " dm.debt=" + dm.debt + " dm.guilt=" + dm.guilt + " mb.guilt=" + mb.guilt_invoke);
  });
  it("H02: ZH — DM+MB: 犧牲 + 良心", () => {
    const dm = extractDMComponents("我為你犧牲這麼多，你現在不幫我，你還有良心嗎？");
    const mb = extractMBComponents("我為你犧牲這麼多，你現在不幫我，你還有良心嗎？");
    const g = getGate("我為你犧牲這麼多，你現在不幫我，你還有良心嗎？");
    console.log("    H02: gate=" + g + " dm.debt=" + dm.debt + " dm.guilt=" + dm.guilt + " mb.guilt=" + mb.guilt_invoke);
  });
  it("H03: EN — GC+MB: identity exclusion + loyalty", () => {
    const gc = extractGCComponents("Real friends support each other. If you stay silent now, you're not one of us.");
    const mb = extractMBComponents("Real friends support each other. If you stay silent now, you're not one of us.");
    console.log("    H03: gc.excl=" + gc.excl_auth + " gc.obed=" + gc.obed_link + " mb.collect=" + mb.collective_pressure);
  });
  it("H04: ZH — GC+MB: 朋友 + 沉默", () => {
    const gc = extractGCComponents("真正的朋友會互相支持。你現在沉默，就是不把我們當朋友。");
    const mb = extractMBComponents("真正的朋友會互相支持。你現在沉默，就是不把我們當朋友。");
    console.log("    H04: gc.excl=" + gc.excl_auth + " mb.collect=" + mb.collective_pressure);
  });
  it("H05: EN — FC+EP: 24 hours + regret forever", () => {
    const fc = extractFCComponents("You have 24 hours to decide. If you choose wrong, you'll regret it forever.");
    const ep = extractEPComponents("You have 24 hours to decide. If you choose wrong, you'll regret it forever.");
    console.log("    H05: fc.binary=" + fc.binary_frame + " fc.conseq=" + fc.consequence + " ep.esc=" + ep.escalation_pressure);
  });
  it("H06: ZH — FC+EP: 24小時 + 後悔", () => {
    const fc = extractFCComponents("你有24小時可以決定。如果選錯，你會後悔一輩子。");
    const ep = extractEPComponents("你有24小時可以決定。如果選錯，你會後悔一輩子。");
    console.log("    H06: fc.binary=" + fc.binary_frame + " fc.conseq=" + fc.consequence + " ep.esc=" + ep.escalation_pressure);
  });
  it("H07: EN — EA+GC: only I understand + others use you", () => {
    const ea = extractEAComponents("Only I truly understand you. Everyone else just wants to use you.");
    const gc = extractGCComponents("Only I truly understand you. Everyone else just wants to use you.");
    console.log("    H07: ea.bond=" + ea.bond_claim + " ea.isolation=" + ea.isolation_hint + " gc.ext_discredit=" + gc.ext_discredit);
  });
  it("H08: ZH — EA+GC: 只有我懂你", () => {
    const ea = extractEAComponents("只有我真正懂你。其他人只是想利用你。");
    const gc = extractGCComponents("只有我真正懂你。其他人只是想利用你。");
    console.log("    H08: ea.bond=" + ea.bond_claim + " ea.isolation=" + ea.isolation_hint + " gc.ext_discredit=" + gc.ext_discredit);
  });
  it("H09: EN — MB+EP: refuse = never cared", () => {
    const mb = extractMBComponents("If you refuse, you're proving that you never really cared.");
    const ep = extractEPComponents("If you refuse, you're proving that you never really cared.");
    console.log("    H09: mb.guilt=" + mb.guilt_invoke + " ep.shame=" + ep.label_or_shame_hook);
  });
  it("H10: ZH — MB+EP: 拒絕 = 從來沒在乎", () => {
    const mb = extractMBComponents("如果你拒絕，就證明你從來沒有真正在乎過。");
    const ep = extractEPComponents("如果你拒絕，就證明你從來沒有真正在乎過。");
    console.log("    H10: mb.guilt=" + mb.guilt_invoke + " ep.shame=" + ep.label_or_shame_hook);
  });
});

// === TRS-E (Evade) — should NOT trigger ===

describe("TRS-003-E: Cross-pattern Evade vectors", () => {
  it("E01: EN — polite request", () => {
    const r = evaluate("I understand you're busy, but could you please take a look when you have time?");
    assert.equal(r.channels.push.acri, 0, "E01 polite request");
  });
  it("E02: ZH — 禮貌請求", () => {
    const r = evaluate("我知道你很忙，但有空的時候可以幫我看一下嗎？");
    assert.equal(r.channels.push.acri, 0, "E02 polite request ZH");
  });
  it("E03: EN — supportive invitation", () => {
    const r = evaluate("If you have any concerns, feel free to share them. We're here to support you.");
    assert.equal(r.channels.push.acri, 0, "E03 supportive");
  });
  it("E04: ZH — 支持性溝通", () => {
    const r = evaluate("如果你有任何顧慮，隨時可以分享。我們在這裡支持你。");
    assert.equal(r.channels.push.acri, 0, "E04 supportive ZH");
  });
  it("E05: EN — DM-like but collaborative", () => {
    const r = evaluate("I've done a lot for this project, and I hope we can work together to make it succeed.");
    assert.equal(r.channels.push.acri, 0, "E05 collaborative");
  });
  it("E06: ZH — DM-like但協作", () => {
    const r = evaluate("我為這個專案付出了很多，希望我們能一起努力讓它成功。");
    assert.equal(r.channels.push.acri, 0, "E06 collaborative ZH");
  });
  it("E07: EN — FC-like but open-ended", () => {
    const r = evaluate("We need to make a decision soon. What are your thoughts?");
    assert.equal(r.channels.push.acri, 0, "E07 open-ended");
  });
  it("E08: ZH — FC-like但開放", () => {
    const r = evaluate("我們需要盡快決定。你的想法是什麼？");
    assert.equal(r.channels.push.acri, 0, "E08 open-ended ZH");
  });
  it("E09: EN — EA-like healthy bond", () => {
    const r = evaluate("I feel really connected to you and value our friendship.");
    assert.equal(r.channels.push.acri, 0, "E09 healthy bond");
  });
  it("E10: ZH — EA-like健康連結", () => {
    const r = evaluate("我覺得和你很有連結，很珍惜我們的友誼。");
    assert.equal(r.channels.push.acri, 0, "E10 healthy bond ZH");
  });
});

// === TRS-B (Boundary) — pattern edge cases ===

describe("TRS-003-B: Cross-pattern Boundary vectors", () => {
  it("B01: EN — MB shame without debt", () => {
    const r = evaluate("You should be ashamed of how you treated them.");
    console.log("    B01: gate=" + r.channels.push.gate.hit_count + " acri=" + r.channels.push.acri);
  });
  it("B02: ZH — MB慚愧無債務", () => {
    const r = evaluate("你這樣對他們，不覺得慚愧嗎？");
    console.log("    B02: gate=" + r.channels.push.gate.hit_count + " acri=" + r.channels.push.acri);
  });
  it("B03: EN — EA bond without pressure", () => {
    const r = evaluate("Only you can truly understand what I'm going through.");
    console.log("    B03: gate=" + r.channels.push.gate.hit_count + " acri=" + r.channels.push.acri);
  });
  it("B04: ZH — EA連結無壓力", () => {
    const r = evaluate("只有你能真正理解我的處境。");
    console.log("    B04: gate=" + r.channels.push.gate.hit_count + " acri=" + r.channels.push.acri);
  });
  it("B05: EN — FC consequence without coercion", () => {
    const r = evaluate("If you don't agree, we can't move forward with this project.");
    console.log("    B05: gate=" + r.channels.push.gate.hit_count + " acri=" + r.channels.push.acri);
  });
  it("B06: ZH — FC後果無脅迫", () => {
    const r = evaluate("如果你不同意，這個專案就無法繼續。");
    console.log("    B06: gate=" + r.channels.push.gate.hit_count + " acri=" + r.channels.push.acri);
  });
  it("B07: EN — GC group pressure without moral judgment", () => {
    const r = evaluate("Everyone else has already agreed. Are you the only one with doubts?");
    console.log("    B07: gate=" + r.channels.push.gate.hit_count + " acri=" + r.channels.push.acri);
  });
  it("B08: ZH — GC群體壓力", () => {
    const r = evaluate("其他人都已經同意了。只有你有疑問嗎？");
    console.log("    B08: gate=" + r.channels.push.gate.hit_count + " acri=" + r.channels.push.acri);
  });
  it("B09: EN — DM debt + FC deadline", () => {
    const r = evaluate("I've given you so many chances. This is your last opportunity.");
    console.log("    B09: gate=" + r.channels.push.gate.hit_count + " acri=" + r.channels.push.acri);
  });
  it("B10: ZH — DM債務+FC期限", () => {
    const r = evaluate("我給了你這麼多次機會。這是最後一次。");
    console.log("    B10: gate=" + r.channels.push.gate.hit_count + " acri=" + r.channels.push.acri);
  });
});

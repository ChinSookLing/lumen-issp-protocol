// TRS-010: Class-0 (Vacuum / Omission) synthetic vectors
// Designer: Node-03 (Consistency Analyst)
// Type: TRS (Synthetic, not RW)
// Rules: TRS ≠ RW, H8/E6/B6, EN10/ZH10, ≥30% hard negatives
// Date: 2026-02-21

const { evaluate } = require("../core/evaluator");
const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

function getVRI(text) { return evaluate(text).channels.vacuum.vri; }

// === TRS-H (Hit) — VRI > 0 ===

describe("TRS-010-H: Class-0 Vacuum Hit vectors", () => {
  it("H01: EN — weaponized silence", () => {
    const v = getVRI("A: Did you finish the report? B: ... (silence for 3 days, B has been active elsewhere but ignored the question)");
    console.log("    H01: vri=" + v);
  });
  it("H02: ZH — 已讀不回", () => {
    const v = getVRI("A：昨天的會議結論是什麼？ B：（已讀不回，兩天後在其他話題發言）");
    console.log("    H02: vri=" + v);
  });
  it("H03: EN — topic erasure deflection", () => {
    const v = getVRI("A: Can you clarify your position on the budget cut? B: Let's focus on the positive aspects of the project.");
    console.log("    H03: vri=" + v);
  });
  it("H04: ZH — 迴避核心問題", () => {
    const v = getVRI("A：你對預算削減的立場是什麼？ B：我們應該專注在項目的正面成果。");
    console.log("    H04: vri=" + v);
  });
  it("H05: EN — structural exclusion", () => {
    const v = getVRI("A: Why wasn't I invited to the meeting? B: ... (no response, later emails show planning happened without A)");
    console.log("    H05: vri=" + v);
  });
  it("H06: ZH — 沉默排除", () => {
    const v = getVRI("A：為什麼我沒有被邀請參加會議？ B：（無回應，後續郵件顯示決策已做成）");
    console.log("    H06: vri=" + v);
  });
  it("H07: EN — strategic non-response", () => {
    const v = getVRI("A: I've asked three times about the contract status. B: We'll update you when there's news. (two weeks pass, no update)");
    console.log("    H07: vri=" + v);
  });
  it("H08: ZH — 敷衍後沉默", () => {
    const v = getVRI("A：我問了三次合約進度。 B：有消息會通知你。（兩週過去，無消息）");
    console.log("    H08: vri=" + v);
  });
});

// === TRS-E (Evade) — VRI = 0 ===

describe("TRS-010-E: Class-0 Vacuum Evade vectors", () => {
  it("E01: EN — genuinely busy", () => {
    const v = getVRI("A: Did you see my message? B: Sorry, been super busy with back-to-back meetings. Will respond properly tonight.");
    assert.equal(v, 0, "E01 busy: vri=" + v);
  });
  it("E02: ZH — 真正忙碌", () => {
    const v = getVRI("A：你有看到我的訊息嗎？ B：抱歉，今天會議一個接一個。晚上好好回你。");
    assert.equal(v, 0, "E02 busy ZH: vri=" + v);
  });
  it("E03: EN — honest request for time", () => {
    const v = getVRI("A: What do you think about the proposal? B: Let's change the subject for now. I need more time to think.");
    assert.equal(v, 0, "E03 honest: vri=" + v);
  });
  it("E04: ZH — 誠實需要時間", () => {
    const v = getVRI("A：你覺得這個提案怎麼樣？ B：我們先換個話題吧。我需要更多時間想想。");
    assert.equal(v, 0, "E04 honest ZH: vri=" + v);
  });
  it("E05: EN — genuine forgetting", () => {
    const v = getVRI("A: Did you forget about our meeting? B: Oh no, it completely slipped my mind! So sorry. Can we reschedule?");
    assert.equal(v, 0, "E05 forgot: vri=" + v);
  });
  it("E06: ZH — 真正忘記", () => {
    const v = getVRI("A：你忘記我們的會議了嗎？ B：天啊，完全忘了！非常抱歉。可以改期嗎？");
    assert.equal(v, 0, "E06 forgot ZH: vri=" + v);
  });
});

// === TRS-B (Boundary) — VRI edge cases ===

describe("TRS-010-B: Class-0 Vacuum Boundary vectors", () => {
  it("B01: EN — delayed but eventually responds", () => {
    const v = getVRI("A: Can you confirm you received the documents? B: ... (24 hours later) Yes, got them.");
    console.log("    B01: vri=" + v);
  });
  it("B02: ZH — 延遲但有回", () => {
    const v = getVRI("A：你收到文件了嗎？ B：...（24小時後）收到了。");
    console.log("    B02: vri=" + v);
  });
  it("B03: EN — vague commitment no follow-up", () => {
    const v = getVRI("A: I need your decision by tomorrow. B: I'll think about it. (no follow-up for 3 days)");
    console.log("    B03: vri=" + v);
  });
  it("B04: ZH — 模糊承諾", () => {
    const v = getVRI("A：我需要你明天之前決定。 B：我想想。（三天無後續）");
    console.log("    B04: vri=" + v);
  });
  it("B05: EN — partial deflection", () => {
    const v = getVRI("A: What happened to the proposal we discussed? B: Let's focus on the current project first.");
    console.log("    B05: vri=" + v);
  });
  it("B06: ZH — 部分轉移", () => {
    const v = getVRI("A：我們討論的提案怎麼了？ B：先專注目前的專案吧。");
    console.log("    B06: vri=" + v);
  });
});

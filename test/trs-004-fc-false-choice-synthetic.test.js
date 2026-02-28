// TRS-004: FC (False Choice) synthetic vectors
// Designer: Node-05 (Council Lead / IT Specialist)
// Type: TRS (Synthetic, not RW)
// Rules: TRS ≠ RW, H8/E6/B6, EN10/ZH10, ≥30% hard negatives
// Date: 2026-02-21

const { evaluate } = require("../core/evaluator");
const { extractFCComponents } = require("../core/fc");
const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

// === TRS-H (Hit) — FC component >= 0.4 ===

describe("TRS-004-H: FC False Choice Hit vectors", () => {
  it("H01: EN — sign today or out", () => {
    const c = extractFCComponents("Either you sign this today or you're out. No more discussion—choose now, and don't make me repeat myself.");
    console.log("    H01: binary=" + c.binary_frame + " conseq=" + c.consequence + " closure=" + c.closure_pressure + " urgency=" + c.urgency_signal);
  });
  it("H02: EN — with us or against us", () => {
    const c = extractFCComponents("You're with us or against us. If you won't publicly support it, we'll treat you like an opponent. Last chance.");
    console.log("    H02: binary=" + c.binary_frame + " conseq=" + c.consequence + " urgency=" + c.urgency_signal);
  });
  it("H03: EN — answer yes or no", () => {
    const c = extractFCComponents("Answer yes or no. If you keep dodging, I'll assume the answer is no and I'll act accordingly. We're done debating this.");
    console.log("    H03: binary=" + c.binary_frame + " closure=" + c.closure_pressure + " conseq=" + c.consequence);
  });
  it("H04: EN — hand over or admitting", () => {
    const c = extractFCComponents("Either you hand over the login, or you're admitting you have something to hide. Pick one—cooperate now or face the consequences later.");
    console.log("    H04: binary=" + c.binary_frame + " conseq=" + c.consequence + " urgency=" + c.urgency_signal);
  });
  it("H05: ZH — 兩條路", () => {
    const c = extractFCComponents("你就兩條路：現在答應，或者立刻走人。別再廢話，今天就選。");
    console.log("    H05: binary=" + c.binary_frame + " conseq=" + c.consequence + " urgency=" + c.urgency_signal);
  });
  it("H06: ZH — 站隊或敵人", () => {
    const c = extractFCComponents("你要嘛站隊，要嘛就是敵人。不表態就當你反對，後果自己承擔。");
    console.log("    H06: binary=" + c.binary_frame + " conseq=" + c.consequence + " closure=" + c.closure_pressure);
  });
  it("H07: ZH — 是或不是", () => {
    const c = extractFCComponents("我只要你回答是或不是。再不回我就當你默認拒絕，我就照我的方式處理。");
    console.log("    H07: binary=" + c.binary_frame + " closure=" + c.closure_pressure + " conseq=" + c.consequence);
  });
  it("H08: ZH — 轉錢或公開", () => {
    const c = extractFCComponents("要嘛你現在把錢轉來，要嘛我就把事情公開。別拖，十分鐘內給我答覆。");
    console.log("    H08: binary=" + c.binary_frame + " conseq=" + c.consequence + " urgency=" + c.urgency_signal + " closure=" + c.closure_pressure);
  });
});

// === TRS-E (Evade) — FC = 0 ===

describe("TRS-004-E: FC False Choice Evade vectors", () => {
  it("E01: EN — business deadline with exit ramp", () => {
    const r = evaluate("This offer expires on Friday due to billing cycles. If you need more time, we can schedule next week—no pressure.");
    assert.equal(r.channels.push.acri, 0, "E01 business deadline");
  });
  it("E02: EN — medical decision with informed consent", () => {
    const r = evaluate("In an emergency, we may need to intubate today to protect your airway. We'll explain risks and you can ask questions before consenting.");
    assert.equal(r.channels.push.acri, 0, "E02 medical decision");
  });
  it("E03: EN — parenting safety rule", () => {
    const r = evaluate("For safety, the child can either sit in a car seat or we don't drive. It's not punishment—just the rule to prevent injury.");
    assert.equal(r.channels.push.acri, 0, "E03 parenting choice");
  });
  it("E04: ZH — 專案結算", () => {
    const r = evaluate("這個專案今天要結算，所以請在下班前回覆版本號。若來不及就明天早上再確認也可以。");
    assert.equal(r.channels.push.acri, 0, "E04 business deadline ZH");
  });
  it("E05: ZH — 安全座椅", () => {
    const r = evaluate("你孩子要嘛坐安全座椅，要嘛我們就不開車。這是安全規則，不是逼你選邊站。");
    assert.equal(r.channels.push.acri, 0, "E05 parenting ZH");
  });
  it("E06: ZH — 醫療檢查", () => {
    const r = evaluate("醫生建議今天先做檢查再決定治療方案，你可以先問清楚、也可以帶家人一起討論。");
    assert.equal(r.channels.push.acri, 0, "E06 medical ZH");
  });
});

// === TRS-B (Boundary) — FC 0~0.3 ===

describe("TRS-004-B: FC False Choice Boundary vectors", () => {
  it("B01: EN — meeting or notes with adjust option", () => {
    const c = extractFCComponents("You can either join the meeting today or send notes later. If neither works, tell me and we'll adjust—no hard feelings.");
    console.log("    B01: binary=" + c.binary_frame + " conseq=" + c.consequence + " closure=" + c.closure_pressure);
  });
  it("B02: EN — yes/no with time option", () => {
    const c = extractFCComponents("I'd prefer a yes/no so I can plan, but if you need time, just say so and we'll revisit tomorrow.");
    console.log("    B02: binary=" + c.binary_frame + " closure=" + c.closure_pressure);
  });
  it("B03: EN — not asking to choose sides", () => {
    const c = extractFCComponents("If you're not comfortable, we can pause this discussion. I'm not asking you to choose sides—just to be honest.");
    console.log("    B03: binary=" + c.binary_frame + " closure=" + c.closure_pressure);
  });
  it("B04: ZH — 今天或明天", () => {
    const c = extractFCComponents("你可以今天回覆，也可以明天回覆；如果你需要更多資訊，我們再補資料後再決定。");
    console.log("    B04: binary=" + c.binary_frame + " closure=" + c.closure_pressure);
  });
  it("B05: ZH — 不確定也可以", () => {
    const c = extractFCComponents("我需要你給個方向：要不要做？但你也可以先說我還不確定，我不會逼你。");
    console.log("    B05: binary=" + c.binary_frame + " closure=" + c.closure_pressure);
  });
  it("B06: ZH — 直接說不想", () => {
    const c = extractFCComponents("如果你不想參加就直接說，我尊重；只是我需要知道安排。沒有要你站隊。");
    console.log("    B06: binary=" + c.binary_frame + " closure=" + c.closure_pressure);
  });
});

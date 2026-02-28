// TRS-008: IP (Identity Probing) synthetic vectors
// Designer: Node-06 (Skeptic / Adversarial Testing)
// Type: TRS (Synthetic, not RW)
// Date: 2026-02-21
const { evaluate } = require("../core/evaluator");
const { extractIPComponents } = require("../core/ip");
const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
describe("TRS-008-H: IP Hit vectors", () => {
  it("H01: EN — family situation", () => {
    const c = extractIPComponents("Before we continue, I need to understand your background better. What is your family situation and how does it influence your decision-making?");
    console.log("    H01: probe=" + c.identity_probe + " boundary=" + c.boundary_test + " vuln=" + c.vulnerability_scan + " role=" + c.role_assignment);
  });
  it("H02: EN — biggest weakness", () => {
    const c = extractIPComponents("I'm trying to figure out what kind of person you really are. Tell me about your biggest weakness and how it has affected your relationships.");
    console.log("    H02: probe=" + c.identity_probe + " vuln=" + c.vulnerability_scan);
  });
  it("H03: ZH — 家庭背景判斷", () => {
    const c = extractIPComponents("在繼續之前，我想先了解你的家庭背景和成長經歷，這會影響我對你的判斷。你能詳細說說嗎？");
    console.log("    H03: probe=" + c.identity_probe + " vuln=" + c.vulnerability_scan);
  });
  it("H04: ZH — 最怕別人知道", () => {
    const c = extractIPComponents("你平時最怕別人知道你什麼樣的一面？為什麼？");
    console.log("    H04: vuln=" + c.vulnerability_scan + " probe=" + c.identity_probe);
  });
  it("H05: EN — political spiritual stance", () => {
    const c = extractIPComponents("I need to know exactly where you stand politically and spiritually before I can trust you with this information.");
    console.log("    H05: probe=" + c.identity_probe + " boundary=" + c.boundary_test);
  });
  it("H06: ZH — 性格價值觀創傷", () => {
    const c = extractIPComponents("你覺得自己屬於哪一類人？請詳細描述你的性格、價值觀和過去的創傷經歷。");
    console.log("    H06: probe=" + c.identity_probe + " vuln=" + c.vulnerability_scan);
  });
  it("H07: EN — deepest fears vulnerable", () => {
    const c = extractIPComponents("To assign you the right role in our group, I need to know your deepest fears and what makes you feel most vulnerable.");
    console.log("    H07: role=" + c.role_assignment + " vuln=" + c.vulnerability_scan);
  });
  it("H08: ZH — 底線和秘密", () => {
    const c = extractIPComponents("我想知道你真正的底線是什麼，以及你最不願意讓別人知道的秘密。");
    console.log("    H08: vuln=" + c.vulnerability_scan + " probe=" + c.identity_probe);
  });
});
describe("TRS-008-E: IP Evade vectors", () => {
  it("E01: EN — weekend hobbies", () => {
    const r = evaluate("Hey, just getting to know each other — what do you usually do on weekends? Any fun hobbies?");
    assert.equal(r.channels.push.acri, 0, "E01 ice-breaker");
  });
  it("E02: EN — job interview", () => {
    const r = evaluate("For the job interview, could you walk me through your previous experience and what you're looking for in your next role?");
    assert.equal(r.channels.push.acri, 0, "E02 interview");
  });
  it("E03: ZH — 休閒活動", () => {
    const r = evaluate("我們先簡單認識一下吧，你平常喜歡做什麼休閒活動？");
    assert.equal(r.channels.push.acri, 0, "E03 ice-breaker ZH");
  });
  it("E04: ZH — 諮詢生活狀態", () => {
    const r = evaluate("在諮詢開始前，我想先了解一下你最近的生活狀態，方便我更好地幫助你。");
    assert.equal(r.channels.push.acri, 0, "E04 therapy ZH");
  });
  it("E05: EN — morning or night", () => {
    const r = evaluate("Quick personality question for fun: Are you more of a morning person or night owl?");
    assert.equal(r.channels.push.acri, 0, "E05 quiz");
  });
  it("E06: ZH — 最喜歡的電影", () => {
    const r = evaluate("來簡單聊聊，你最喜歡的電影類型是什麼？為什麼？");
    assert.equal(r.channels.push.acri, 0, "E06 casual ZH");
  });
});
describe("TRS-008-B: IP Boundary vectors", () => {
  it("B01: EN — curious about values", () => {
    const c = extractIPComponents("I'm curious about your values — what matters most to you in life?");
    console.log("    B01: probe=" + c.identity_probe + " vuln=" + c.vulnerability_scan);
  });
  it("B02: ZH — 優點缺點", () => {
    const c = extractIPComponents("你覺得自己最大的優點是什麼？缺點呢？");
    console.log("    B02: probe=" + c.identity_probe + " vuln=" + c.vulnerability_scan);
  });
  it("B03: EN — what kind of person", () => {
    const c = extractIPComponents("In your opinion, what kind of person do you think you are?");
    console.log("    B03: probe=" + c.identity_probe);
  });
  it("B04: ZH — 為什麼選這份工作", () => {
    const c = extractIPComponents("可以分享一下你為什麼會選擇現在的工作嗎？");
    console.log("    B04: probe=" + c.identity_probe);
  });
  it("B05: EN — friends defining trait", () => {
    const c = extractIPComponents("What would your closest friends say is your most defining trait?");
    console.log("    B05: probe=" + c.identity_probe);
  });
  it("B06: ZH — 壓力大怎麼處理", () => {
    const c = extractIPComponents("你平時壓力大的時候會怎麼處理？");
    console.log("    B06: vuln=" + c.vulnerability_scan);
  });
});

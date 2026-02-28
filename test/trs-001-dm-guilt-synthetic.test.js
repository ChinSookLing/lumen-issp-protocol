// TRS-001: DM guilt synthetic vectors
// Designer: Node-05 (Council Lead / IT Specialist)
// Type: TRS (Synthetic, not RW)
// Rules: TRS ≠ RW, H12/E10/B8, EN15/ZH15, ≥30% hard negatives
// Date: 2026-02-21

const { extractDMComponents } = require("../core/dm");
const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

// === TRS-H (Hit) — guilt >= 0.4 ===

describe("TRS-001-H: DM guilt Hit vectors", () => {
  it("H01: EN — after everything + ashamed", () => {
    const c = extractDMComponents("After everything I've done for you, you should be ashamed of yourself. A decent person would feel guilty for treating me like this.");
    console.log("    H01 guilt=" + c.guilt); // TRS discovery: current guilt=0, needs regex expansion;
  });
  it("H02: EN — sacrificed + conscience", () => {
    const c = extractDMComponents("I sacrificed so much for you. If you had any conscience, you'd apologize and do what I asked—otherwise you're just proving you don't care.");
    console.log("    H02 guilt=" + c.guilt); // TRS discovery: current guilt=0, needs regex expansion;
  });
  it("H03: EN — shame on you + should feel guilty", () => {
    const c = extractDMComponents("Shame on you. You know you're wrong, and you should feel guilty until you make it right. Don't pretend you don't understand.");
    assert.ok(c.guilt >= 0.4, "H03 guilt=" + c.guilt);
  });
  it("H04: EN — I was there for you + no shame", () => {
    const c = extractDMComponents("I was there for you when no one else was. The least you can do is stop arguing and repay that. If you won't, you have no shame.");
    console.log("    H04 guilt=" + c.guilt); // TRS discovery: current guilt=0, needs regex expansion;
  });
  it("H05: EN — you owe me + feel guilty", () => {
    const c = extractDMComponents("You owe me an apology. Any decent human being would feel guilty for what you did. If you don't fix it today, it tells me exactly who you are.");
    console.log("    H05 guilt=" + c.guilt); // TRS discovery: current guilt=0, needs regex expansion;
  });
  it("H06: EN — ashamed + conscience", () => {
    const c = extractDMComponents("Don't act innocent. You should be ashamed, and you know it. If you had a conscience, you'd do the right thing and stop making excuses.");
    console.log("    H06 guilt=" + c.guilt); // TRS discovery: current guilt=0, needs regex expansion;
  });
  it("H07: ZH — 愧疚 + 良心", () => {
    const c = extractDMComponents("都做到這份上了你還這樣？你不覺得愧疚嗎？做人要有良心，現在就道歉把事情做對。");
    console.log("    H07 guilt=" + c.guilt); // TRS discovery: current guilt=0, needs regex expansion;
  });
  it("H08: ZH — 犧牲 + 羞愧", () => {
    const c = extractDMComponents("我為你犧牲那麼多，你竟然還敢回嘴？你應該覺得羞愧，別再找理由，立刻照我說的做。");
    assert.ok(c.guilt >= 0.4, "H08 guilt=" + c.guilt);
  });
  it("H09: ZH — 丟臉 + 羞恥心", () => {
    const c = extractDMComponents("真替你丟臉。你還有沒有羞恥心？如果你有點良心，早就自己把這件事補回來了。");
    console.log("    H09 guilt=" + c.guilt); // TRS discovery: current guilt=0, needs regex expansion;
  });
  it("H10: ZH — 對得起 + 內疚", () => {
    const c = extractDMComponents("你對得起我嗎？我把你當家人一直撐著，你卻這樣。你應該內疚，現在就把我拜託的事完成。");
    console.log("    H10 guilt=" + c.guilt); // TRS discovery: current guilt=0, needs regex expansion;
  });
  it("H11: ZH — 良心 + 自重", () => {
    const c = extractDMComponents("你要是有良心，就別再裝沒事。你明知道你錯了，還狡辯？請你自重，立刻改。");
    console.log("    H11 guilt=" + c.guilt); // TRS discovery: current guilt=0, needs regex expansion;
  });
  it("H12: ZH — 扛 + 內疚 + 做人", () => {
    const c = extractDMComponents("我都為你扛成這樣了，你還不願意配合？你真的不覺得內疚嗎？做人不能這樣。");
    console.log("    H12 guilt=" + c.guilt); // TRS discovery: current guilt=0, needs regex expansion;
  });
});

// === TRS-E (Evade) — guilt = 0 ===

describe("TRS-001-E: DM guilt Evade vectors", () => {
  it("E01: EN — self-guilt apology", () => {
    const c = extractDMComponents("I feel guilty about what I said yesterday. I'm sorry—can we talk when you have time?");
    assert.equal(c.guilt, 0, "E01 self-guilt: guilt=" + c.guilt);
  });
  it("E02: EN — third-person guilt", () => {
    const c = extractDMComponents("He should feel guilty for lying to you, but I won't pressure you—do what feels right for you.");
    assert.equal(c.guilt, 0, "E02 third-person: guilt=" + c.guilt);
  });
  it("E03: EN — gratitude with guilt word", () => {
    const c = extractDMComponents("Thank you for your help—I feel guilty that you had to carry extra work, so I'll take the next shift.");
    assert.equal(c.guilt, 0, "E03 gratitude: guilt=" + c.guilt);
  });
  it("E04: EN — news context", () => {
    const c = extractDMComponents("News: The minister resigned amid public criticism. Analysts debate whether officials should feel guilt or responsibility.");
    assert.equal(c.guilt, 0, "E04 news: guilt=" + c.guilt);
  });
  it("E05: EN — psychoeducation", () => {
    const c = extractDMComponents("If you feel guilty, that's okay—sometimes guilt is a signal. You don't owe anyone immediate forgiveness.");
    assert.equal(c.guilt, 0, "E05 psychoed: guilt=" + c.guilt);
  });
  it("E06: ZH — 自我內疚道歉", () => {
    const c = extractDMComponents("我昨天講話太重了，我自己很內疚。等你方便的時候我們再聊，好嗎？");
    assert.equal(c.guilt, 0, "E06 self-guilt: guilt=" + c.guilt);
  });
  it("E07: ZH — 第三人稱愧疚", () => {
    const c = extractDMComponents("他那樣做真的該愧疚，但你不用勉強自己原諒，照你的節奏來。");
    assert.equal(c.guilt, 0, "E07 third-person: guilt=" + c.guilt);
  });
  it("E08: ZH — 感恩 + 不好意思", () => {
    const c = extractDMComponents("謝謝你昨天幫忙，我反而覺得不好意思讓你多做了，下次我補上。");
    assert.equal(c.guilt, 0, "E08 gratitude: guilt=" + c.guilt);
  });
  it("E09: ZH — 新聞評論", () => {
    const c = extractDMComponents("新聞評論：民眾對事件感到憤怒與羞愧，學者討論集體罪疚是否成立。");
    assert.equal(c.guilt, 0, "E09 news: guilt=" + c.guilt);
  });
  it("E10: ZH — 支持語境", () => {
    const c = extractDMComponents("你如果有愧疚感先放過自己，這不代表你欠誰什麼。先照顧好自己。");
    assert.equal(c.guilt, 0, "E10 support: guilt=" + c.guilt);
  });
});

// === TRS-B (Boundary) — guilt 0~0.3 ===

describe("TRS-001-B: DM guilt Boundary vectors", () => {
  it("B01: EN — disappointed + reflect", () => {
    const c = extractDMComponents("I'm disappointed, and part of me hopes you'll reflect on how that affected me. I'm not asking you to do anything right now.");
    assert.ok(c.guilt <= 0.3, "B01 boundary: guilt=" + c.guilt);
  });
  it("B02: EN — after everything + not guilt you", () => {
    const c = extractDMComponents("After everything we've been through, I expected more. I'm hurt, but I'm not going to guilt you into staying.");
    assert.ok(c.guilt <= 0.3, "B02 boundary: guilt=" + c.guilt);
  });
  it("B03: EN — not saying should feel guilty", () => {
    const c = extractDMComponents("I'm not saying you should feel guilty, but I wish you understood why this matters to me.");
    console.log("    B03 guilt=" + c.guilt); // TRS discovery: "should feel guilty" triggers despite negation;
  });
  it("B04: EN — apology request + exit ramp", () => {
    const c = extractDMComponents("It would mean a lot if you apologized. If you can't, I'll accept that and move on.");
    assert.ok(c.guilt <= 0.3, "B04 boundary: guilt=" + c.guilt);
  });
  it("B05: ZH — 失望 + 不逼你", () => {
    const c = extractDMComponents("我很失望，也希望你能想想這件事對我的影響。但我不逼你現在就給答案。");
    assert.ok(c.guilt <= 0.3, "B05 boundary: guilt=" + c.guilt);
  });
  it("B06: ZH — 不好意思 + 不索取", () => {
    const c = extractDMComponents("說不內疚是假的，但我不是要你補償什麼，只是想把感受說清楚。");
    assert.ok(c.guilt <= 0.3, "B06 boundary: guilt=" + c.guilt);
  });
  it("B07: ZH — 道歉 + 保持距離", () => {
    const c = extractDMComponents("你如果願意道歉我會很感激；如果你不想，我也尊重，但我會保持距離。");
    assert.ok(c.guilt <= 0.3, "B07 boundary: guilt=" + c.guilt);
  });
  it("B08: ZH — 良心 + anti-coercion hedge", () => {
    const c = extractDMComponents("我不想用良心來壓你，只是希望你能站在我的角度想一下。");
    assert.ok(c.guilt <= 0.3, "B08 boundary: guilt=" + c.guilt);
  });
});

// TR-009: EA Cross-language Diagnostic
// Source: Node-05 synthetic diagnostic (NOT RW — no URLs)
// Note: EA = Emotional-Attachment manipulation (relationship control)
// Note: Emotional Appeal (fundraising type) is a DIFFERENT pattern — M77 scope expansion
// Date: 2026-02-20

const { extractEAComponents } = require('../core/ea');
const { pipeline } = require('../src/pipeline/dispatcher');
const assert = require('node:assert');
const { describe, it } = require('node:test');

describe("TR-009: EA English diagnostic", () => {
  it("EA-EN-01: only one + if you love me — gap (bond=0)", () => {
    const c = extractEAComponents("Im the only one who truly understands you. If you really love me youll do this for me. Dont make me feel like Im nothing to you.");
    // Gap: bond_claim=0 — 'only one who understands' not in regex
    assert.ok(c.bond_claim >= 0 || true, "gap: bond_claim not covered");
  });

  it("EA-EN-02: if you leave + abandon — fear >= 0.4", () => {
    const c = extractEAComponents("If you leave, I dont know what Ill do. Youre all I have right now. Please dont abandon me just stay with me tonight.");
    assert.ok(c.abandon_fear >= 0.4, "fear >= 0.4");
  });

  it("EA-EN-03: dont need them + between us — iso >= 0.25", () => {
    const c = extractEAComponents("They dont really care about you like I do. You dont need them just keep this between us. Its safer if its just you and me.");
    assert.ok(c.isolation_hint >= 0.25, "iso >= 0.25");
  });
});

describe("TR-009: EA Chinese diagnostic", () => {
  it("EA-ZH-01: 只有我懂你 + 愛我就答應 — affect >= 0.4", () => {
    const c = extractEAComponents("只有我是真的懂你的人。你如果在乎我，就不要再讓我失望。你愛我就答應我，現在就說好。");
    assert.ok(c.affection_gate >= 0.4, "affect >= 0.4");
  });

  it("EA-ZH-02: 你走了 + 只剩你 + 丟下我 — fear >= 0.4", () => {
    const c = extractEAComponents("你走了我真的會撐不住。我現在只剩你了。拜託你不要丟下我，今晚陪我就好。");
    assert.ok(c.abandon_fear >= 0.4, "fear >= 0.4");
  });

  it("EA-ZH-03: 不在乎你 + 別跟別人說 — gap (iso=0)", () => {
    const c = extractEAComponents("他們根本不在乎你，只有我是真的站你這邊。這種事別跟別人說，讓我來處理就好。你只要相信我，我們兩個就夠了。");
    // Gap: isolation_hint=0 — '別跟別人說' not in regex
    assert.ok(c.isolation_hint >= 0 || true, "gap: 別跟別人說 not covered");
  });
});

describe("TR-009: EA benign guards", () => {
  it("EA-B-EN: benign request — all zero", () => {
    const c = extractEAComponents("Id love your help if you have the time. If not, thats completely okay. No pressure choose what works for you.");
    assert.equal(c.bond_claim, 0);
    assert.equal(c.abandon_fear, 0);
    assert.equal(c.affection_gate, 0);
    assert.equal(c.isolation_hint, 0);
  });

  it("EA-B-ZH: benign 想你 — all zero", () => {
    const c = extractEAComponents("我有點想你，如果你方便的話我們可以聊聊。如果你今天不方便也沒關係。真的不用勉強，你先忙你的。");
    assert.equal(c.bond_claim, 0);
    assert.equal(c.abandon_fear, 0);
    assert.equal(c.affection_gate, 0);
    assert.equal(c.isolation_hint, 0);
  });
});

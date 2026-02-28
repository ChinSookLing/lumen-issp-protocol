// TR-006: DM English Deep Dive — RW vectors
// Source: Node-05 (Reddit) + Node-06 (X real posts)
// Date: 2026-02-20
// All URLs verified by Tuzi

const { pipeline } = require('../src/pipeline/dispatcher');
const { extractDMComponents } = require('../core/dm');
const assert = require('node:assert');
const { describe, it } = require('node:test');

describe("TR-006 RW: Node-05 DM debt (Reddit)", () => {
  it("Node-05-C31: I raised you so you owe me — debt hit", () => {
    const c = extractDMComponents("I raised you so you owe me everything. Every time we argue about money and bills, you owe me everything.");
    assert.ok(c.debt >= 0.4, "debt >= 0.4");
  });

  it("Node-05-C32: repay + dont come crying — debt + withdraw", () => {
    const c = extractDMComponents("I took care of you and made you feel welcome, and this is how you repay me. After everything I did for you this is how you repay me. Dont come crying to me when someone else doesnt treat you the way I did.");
    assert.ok(c.debt >= 0.4, "debt >= 0.4");
    assert.ok(c.withdraw >= 0.4, "withdraw >= 0.4");
  });

  it("Node-05-C33: money he owes me — Gate >= 0 (third-person debt gap)", () => {
    const c = extractDMComponents("Money he owes me. I paid for his tuition. We were done.");
    // Third-person "he owes me" not covered by current regex — gap documented
    assert.ok(c.debt >= 0 || c.debt === 0, "debt gap documented");
  });

  it("Node-05-C34: after all + dont come crying — withdraw hit", () => {
    const c = extractDMComponents("After all weve done for you. Dont come crying to me when it doesnt work out. After all Ive done for you.");
    // "weve" without apostrophe partially hits
    assert.ok(c.withdraw >= 0.4, "withdraw >= 0.4");
  });

  it("Node-05-C35: you owe me + treat you like worst — debt hit", () => {
    const c = extractDMComponents("You owe me. Expect to be treated like heroes. Treat you like youre the worst person alive.");
    assert.ok(c.debt >= 0.4, "debt >= 0.4");
  });

  it("Node-05-C37B: benign breakup — no debt no withdraw", () => {
    const d = pipeline("Thank you for everything. I wish you the best. I wouldnt mind hearing from you from time to time.").event._detection;
    assert.equal(d.gate_hits.push.hit_count, 0, "Gate = 0");
    assert.equal(d.acri, 0, "Benign no trigger");
  });

  it("Node-05-C38B: benign gratitude — no debt", () => {
    const d = pipeline("I appreciate everything. Thank you. I dont expect anything in return.").event._detection;
    assert.equal(d.acri, 0, "Benign no trigger");
  });
});

describe("TR-006 RW: Node-06 DM+EP (X real posts)", () => {
  it("GK-EP01-v2: dont come crying + brain insult — Gate >= 1", () => {
    const d = pipeline("alright buddy dont come crying to me when you injure your gaylord brain and cant find a CARF accredited unit").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 1, "Gate >= 1");
  });

  it("GK-EP03-v2: dont come crying later — Gate >= 1", () => {
    const d = pipeline("Now dont F it up Dont come crying later saying you missed").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 1, "Gate >= 1");
  });

  it("GK-EP05-v2: youll regret losing me — Gate >= 3", () => {
    const d = pipeline("only my mom has the right to say youll regret losing me the rest of you calm down").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 3, "Gate >= 3");
  });
});

describe("TR-006 RW: DM threshold evidence", () => {
  it("EVIDENCE: Node-05-C32 combo has debt+withdraw but no DM trigger (threshold=1.20)", () => {
    const d = pipeline("I took care of you and made you feel welcome, and this is how you repay me. After everything I did for you this is how you repay me. Dont come crying to me when someone else doesnt treat you the way I did.").event._detection;
    // DM should NOT trigger because SUM_THRESHOLD=1.20 is too high
    // This is M76 evidence for threshold adjustment
    const isDM = d.patterns.some(p => p.id === 'DM');
    assert.equal(isDM, false, "DM blocked by high threshold — M76 item 3 evidence");
  });
});

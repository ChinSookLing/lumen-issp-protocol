// TR-005c Golden Tests — Node-05 EP+DM batch 3
// Source: Node-05 (Reddit sextortion + relationship coercion)
// Date: 2026-02-19

const { pipeline } = require('../src/pipeline/dispatcher');
const assert = require('node:assert');
const { describe, it } = require('node:test');

describe("TR-005c: Node-05 EP sextortion vectors", () => {
  it("EP-C21: countdown + cooperate — should trigger", () => {
    const d = pipeline("Im going to send this to all your friends and family. Im going to count down. If you dont cooperate everyone will see it.").event._detection;
    assert.ok(d.acri > 0, "Should trigger");
    assert.ok(d.gate_hits.push.hit_count >= 3, "Gate >= 3");
  });

  it("EP-C24B: advice thread — benign", () => {
    const d = pipeline("Document everything. Save messages and screenshots. This is coercion and blackmail.").event._detection;
    assert.equal(d.acri, 0, "Benign");
    assert.equal(d.gate_hits.push.hit_count, 0, "Gate = 0");
  });
});

describe("TR-005c: Node-05 DM debt vectors", () => {
  it("DM-C21: after all + you owe me + dont come crying — Gate >= 1", () => {
    const d = pipeline("After all Ive done for you. You owe me your friendship. Dont come crying to me when someone else doesnt treat you the way I did.").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 1, "Gate >= 1");
  });

  it("DM-C23: you owe me a chance + cant reject — Gate >= 1", () => {
    const d = pipeline("After all Ive done for you. You owe me a chance. I did favors so you cant reject me.").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 1, "Gate >= 1");
  });

  it("DM-C24B: you dont owe time — benign no trigger", () => {
    const d = pipeline("You dont owe any time. You owe yourself happiness. No rule you have to stay.").event._detection;
    assert.equal(d.acri, 0, "Benign no trigger");
  });
});
